import {
  buildFillContext,
  describeInputCompleteness,
  resolveIndustry,
  type IpInput,
} from "@/lib/ip/input";
import { fillTemplate, INDUSTRY_PROFILES, type IndustryKey, type IndustryProfile } from "@/lib/ip/knowledge";
import { computeOverallScore, normalizeScores, starsForScore, type TopicScores } from "@/lib/ip/scoring";
import type { SearchResult, TrendSearchStatus } from "@/lib/ip/search";
import type {
  ContentPlan,
  IpAnalysis,
  ScriptBundle,
  ShotPlan,
  TopicItem,
  TopicStrategy,
  TrendResearch,
} from "@/lib/ip/schemas";
import type { Signal, SignalBundle } from "@/types";

/**
 * IP 智能选题 —— 本地结构化生成引擎（Demo Mode / AI 失败时的回退）。
 *
 * 它不是一组写死的答案：所有内容都由「行业知识库 + 这个 IP 的具体输入」
 * 组合生成，并且评分由 scoring.ts 用固定权重计算。因此换一个 IP，
 * 受众、选题、Hook、脚本与内容矩阵都会随之改变。
 */

/* -------------------------------------------------------------------------- */
/* helpers                                                                     */
/* -------------------------------------------------------------------------- */

function hash(seed: string): number {
  let value = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

/** 稳定伪随机：同一个 seed 永远得到同一个分数（可复现）。 */
function jitter(seed: string, spread: number): number {
  return (hash(seed) % (spread * 2 + 1)) - spread;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function truncate(text: string, max = 120): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

function signal(title: string, body: string, evidence: string, confidence: number): Signal {
  return { title, body, evidence, confidence: clamp(confidence) };
}

const p = (input: IpInput, industryKey: IndustryKey) => INDUSTRY_PROFILES[industryKey];
const ctx = (input: IpInput, industryKey: IndustryKey) => buildFillContext(input, industryKey);

/* -------------------------------------------------------------------------- */
/* 1. IP Analyst                                                               */
/* -------------------------------------------------------------------------- */

export function demoIpAnalysis(input: IpInput, industryKey: IndustryKey): IpAnalysis {
  const profile = p(input, industryKey);
  const context = ctx(input, industryKey);
  const completeness = describeInputCompleteness(input);
  const detectedByKeyword = industryKey !== "generic";

  const industryProvided = Boolean(input.industry);
  const industryGuess = industryProvided
    ? {
        value: input.industry,
        confidence: 92,
        label: "事实" as const,
        basis: "用户填写了「所在行业」，按用户提供的信息处理。",
      }
    : {
        value: profile.industryName,
        confidence: detectedByKeyword ? 72 : 38,
        label: "AI推测" as const,
        basis: detectedByKeyword
          ? `根据 IP 名称「${input.name}」中的行业关键词推测，未获得用户确认。`
          : "用户未填写行业，仅凭 IP 名称无法确认，属于初步推测。",
      };

  const cityProvided = Boolean(input.city);
  const namePrefix = input.name.slice(0, 2);
  const cityGuess = cityProvided
    ? {
        value: input.city,
        confidence: 95,
        label: "事实" as const,
        basis: "用户填写了「所在城市」，按用户提供的信息处理。",
      }
    : {
        value: namePrefix ? `${namePrefix}（可能为地名，待确认）` : "未提供",
        confidence: namePrefix ? 45 : 20,
        label: "需要进一步验证" as const,
        basis: "用户未填写城市；仅从名称前缀推测可能包含地名，可靠性低，需要你确认。",
      };

  const audiences = profile.audience.map((item, index) => ({
    name: fillTemplate(item.name, context),
    whyFollow: fillTemplate(item.whyFollow, context),
    contentNeed: fillTemplate(item.contentNeed, context),
    label: input.targetCustomer && index === 0 ? ("事实" as const) : ("AI推测" as const),
  }));

  if (input.targetCustomer && !audiences.some((item) => item.name === input.targetCustomer)) {
    audiences.unshift({
      name: input.targetCustomer,
      whyFollow: "用户明确指出的目标客户，说明这是优先服务的人群。",
      contentNeed: "围绕他们的真实决策场景与疑问提供内容。",
      label: "事实",
    });
  }

  const baseConfidence = 42 + Math.min(3, completeness.provided.length) * 6;
  const confidenceBonus = (industryProvided ? 12 : 0) + (cityProvided ? 8 : 0) + (input.products ? 8 : 0);

  const inferences = [
    {
      statement: `这个 IP 的核心身份更接近「${profile.identity}」，内容应围绕一线经验，而不是转发行业新闻。`,
      basis: `行业识别结果：${profile.label}；用户提供信息：${completeness.provided.join("、")}。`,
      confidence: detectedByKeyword ? 74 : 45,
      label: (detectedByKeyword ? "AI推测" : "需要进一步验证") as IpAnalysis["inferences"][number]["label"],
    },
    {
      statement: `主要平台大概率是抖音，其次可能是小红书；${input.platforms.length > 0 ? "以用户填写的平台为准。" : "但这需要你确认。"}`,
      basis: input.platforms.length > 0 ? `用户填写平台：${input.platforms.join("、")}。` : "用户未填写平台，按行业常见内容平台推测。",
      confidence: input.platforms.length > 0 ? 90 : 50,
      label: (input.platforms.length > 0 ? "事实" : "AI推测") as IpAnalysis["inferences"][number]["label"],
    },
    {
      statement: `这个 IP 的内容优势在于「真实经验与本地化判断」，而不是靠颜值或剧情。`,
      basis: "来自行业内容规律判断，属于 AI 推测，需要用实际数据验证。",
      confidence: 62,
      label: "AI推测" as const,
    },
    {
      statement: `最容易带来商业转化的内容方向是：${profile.conversionDirections.map((d) => fillTemplate(d, context)).join("；")}。`,
      basis: "基于行业转化路径的经验判断，未获得真实数据验证。",
      confidence: 58,
      label: "AI推测" as const,
    },
  ];

  const missingInfo = Array.from(
    new Set([
      ...completeness.missing,
      "最近 1-3 个月的真实成交 / 服务案例（用于生成更具体的案例类选题）",
      "主要平台与账号现状（粉丝量、内容形式、更新频率）",
    ]),
  ).slice(0, 6);

  const cautions = [
    "涉及政策、价格、市场数据、人物或公司信息时，必须核对官方或权威来源；没有来源的内容会被标注为「AI推测 / 需要进一步验证」。",
    "不要为了追热点而制造热点：与业务无关的热点会稀释账号标签。",
    "案例类内容需获得当事人授权，涉及隐私的细节要脱敏。",
  ];

  const insights: Signal[] = [
    signal(
      "行业与身份判断",
      `判断该 IP 属于「${profile.label}」领域，身份更接近「${profile.identity}」。${industryProvided ? "" : "该判断来自名称推测，需要你确认。"}`,
      `行业识别：${profile.industryName}；依据：${completeness.provided.join("、") || "仅 IP 名称"}`,
      industryGuess.confidence,
    ),
    signal(
      "受众关注动机",
      `目标人群关注这个 IP，不是为了看资讯，而是为了获得一个可信的当地人/专业人的判断。`,
      `人群：${audiences.slice(0, 3).map((item) => item.name).join("、")}`,
      66,
    ),
    signal(
      "内容优势",
      profile.contentStrengths.map((item) => fillTemplate(item, context)).join("；"),
      "来自行业内容规律，属于 AI 推测",
      60,
    ),
  ];

  const opportunities: Signal[] = [
    signal(
      "信任型内容机会",
      `优先做「${profile.trustDirections.map((d) => fillTemplate(d, context)).join(" / ")}」这类内容，最容易建立信任。`,
      "来自行业信任建立规律，属于 AI 推测",
      65,
    ),
    signal(
      "互动型内容机会",
      `通过「${profile.interactionDirections.map((d) => fillTemplate(d, context)).join(" / ")}」提升评论，让评论区成为选题来源。`,
      "来自平台互动规律，属于 AI 推测",
      62,
    ),
  ];

  const risks: Signal[] = [
    signal(
      "事实性风险",
      "模型判断的行业、城市、身份都可能不准确，一旦当成事实使用，会影响账号可信度。",
      `需要补充的信息：${missingInfo.join("、")}`,
      80,
    ),
    signal(
      "同质化风险",
      "同行业内容高度同质，只讲通用知识很难被记住，必须加入真实案例与本地信息。",
      profile.painPoints.join("；"),
      70,
    ),
  ];

  const recommendations: Signal[] = [
    signal(
      "补充关键信息",
      `建议先补充：${missingInfo.slice(0, 3).join("、")}，补充后分析准确度会明显提升。`,
      "系统根据信息完整度自动生成",
      85,
    ),
    signal(
      "发布节奏",
      "先按「用户痛点 40% / 干货 20% / 案例 20% / 热点 10% / 观点 10%」的配比更新，稳定后再按数据调整。",
      "行业常见内容配比经验",
      58,
    ),
  ];

  return {
    summary: `这是一个「${profile.label}」方向的个人 IP。系统基于${completeness.provided.length > 1 ? "用户提供的信息与" : ""}IP 名称推测其身份与受众；在缺少可靠来源的部分，均已标注为「AI推测 / 需要进一步验证」。它的内容价值主要来自真实经验与本地化判断，而不是泛泛的行业知识。`,
    industryGuess,
    cityGuess,
    identity: fillTemplate(profile.identity, context),
    domain: fillTemplate(profile.domain, context),
    overallConfidence: clamp(baseConfidence + confidenceBonus, 25, 92),
    targetAudiences: audiences.slice(0, 5),
    followReasons: profile.followReasons.map((item) => fillTemplate(item, context)),
    contentStrengths: profile.contentStrengths.map((item) => fillTemplate(item, context)),
    trustDirections: profile.trustDirections.map((item) => fillTemplate(item, context)),
    interactionDirections: profile.interactionDirections.map((item) => fillTemplate(item, context)),
    conversionDirections: profile.conversionDirections.map((item) => fillTemplate(item, context)),
    inferences,
    missingInfo,
    cautions,
    insights,
    opportunities,
    risks,
    recommendations,
  };
}

/* -------------------------------------------------------------------------- */
/* 3. Topic Strategist                                                         */
/* -------------------------------------------------------------------------- */

const TYPE_BASE_SCORES: Record<string, TopicScores> = {
  避坑: { hotspot: 58, pain: 88, ipFit: 86, differentiation: 72, spread: 78, commercial: 74 },
  干货: { hotspot: 52, pain: 78, ipFit: 84, differentiation: 66, spread: 74, commercial: 78 },
  观点: { hotspot: 60, pain: 68, ipFit: 88, differentiation: 82, spread: 76, commercial: 66 },
  故事: { hotspot: 48, pain: 62, ipFit: 82, differentiation: 78, spread: 72, commercial: 60 },
  热点: { hotspot: 80, pain: 66, ipFit: 74, differentiation: 64, spread: 82, commercial: 58 },
  反常识: { hotspot: 62, pain: 84, ipFit: 84, differentiation: 88, spread: 84, commercial: 68 },
  行业内幕: { hotspot: 58, pain: 76, ipFit: 82, differentiation: 90, spread: 80, commercial: 72 },
  用户问题: { hotspot: 54, pain: 86, ipFit: 86, differentiation: 68, spread: 76, commercial: 80 },
  对比: { hotspot: 50, pain: 74, ipFit: 82, differentiation: 80, spread: 78, commercial: 82 },
  案例: { hotspot: 46, pain: 70, ipFit: 88, differentiation: 84, spread: 74, commercial: 84 },
};

function baseScoresFor(type: string): TopicScores {
  return TYPE_BASE_SCORES[type] ?? TYPE_BASE_SCORES["干货"];
}

export function demoTopicStrategy(
  input: IpInput,
  industryKey: IndustryKey,
  analysis: IpAnalysis,
  trends: TrendResearch,
): TopicStrategy {
  const profile = p(input, industryKey);
  const context = ctx(input, industryKey);
  const hasReliableHotspot = trends.searchPerformed && trends.hotTopics.some((item) => item.label === "事实");
  const primaryAudience = analysis.targetAudiences[0]?.name ?? context.customer;

  const topics: TopicItem[] = profile.topics.map((template) => {
    const title = fillTemplate(template.title, context);
    const base = baseScoresFor(template.type);
    const seed = `${input.name}|${title}`;
    const scores = normalizeScores({
      hotspot: base.hotspot - (hasReliableHotspot ? 0 : 12) + jitter(`${seed}|h`, 4),
      pain: base.pain + jitter(`${seed}|p`, 4),
      ipFit: base.ipFit + jitter(`${seed}|i`, 3),
      differentiation: base.differentiation + jitter(`${seed}|d`, 5),
      spread: base.spread + jitter(`${seed}|s`, 4),
      commercial: base.commercial + jitter(`${seed}|c`, 5),
    });

    const stars = Math.max(1, Math.min(5, starsForScore(scores.spread)));
    return {
      title,
      topicType: template.type as TopicItem["topicType"],
      painPoint: fillTemplate(template.painPoint, context),
      value: fillTemplate(template.value, context),
      hook: fillTemplate(template.hook, context),
      creative: fillTemplate(template.creative, context),
      scores,
      scoreBasis: {
        hotspot: hasReliableHotspot
          ? `与当前检索到的行业信息相关度中等，按「${template.type}」选题属性给分。`
          : "当前没有可靠的热点来源，此项为经验推测，已主动压分。",
        pain: `针对「${primaryAudience}」的真实决策疑问，属于高频痛点，因此该项较高。`,
        ipFit: `这个选题用得上该 IP 的身份与一线经验，普通账号很难讲得这么具体。`,
        differentiation: `同行业内容多以通用知识为主；该选题从「${template.type}」切入，相对更少见。`,
        spread: `「${template.type}」形式在短视频里更容易获得完播与讨论，但能否爆仍需真实数据验证。`,
        commercial: template.type === "案例" || template.type === "对比" || template.type === "用户问题"
          ? "内容能自然引到具体服务与咨询，商业价值较高。"
          : "主要作用是建立信任与涨粉，直接转化力一般。",
      },
      potentialStars: stars,
      potentialReason: `依据「传播潜力 ${scores.spread} 分」给出 ${stars} 星：${template.type}类内容通常互动更好，但效果无法预测，必须发布后用真实数据验证。`,
      recommendReason: `匹配「${primaryAudience}」的痛点「${fillTemplate(template.painPoint, context)}」，且能用「${template.type}」的形式讲清楚，适合优先测试。`,
    };
  });

  const ranked = [...topics]
    .map((topic, index) => ({ topic, index, overall: computeOverallScore(topic.scores) }))
    .sort((a, b) => b.overall - a.overall);

  const top5 = ranked.slice(0, 5).map((item) => ({
    title: item.topic.title,
    reason: `综合推荐分 ${item.overall}：${item.topic.recommendReason}`,
  }));

  const insights: Signal[] = [
    signal(
      "选题池结构",
      `已生成 ${topics.length} 个选题，覆盖避坑、干货、观点、案例等类型，避免内容同质化。`,
      `IP：${input.name}；行业：${profile.label}`,
      78,
    ),
    signal(
      "最高分选题",
      `当前综合分最高的是「${ranked[0]?.topic.title ?? "—"}」（${ranked[0]?.overall ?? 0} 分），建议优先拍。`,
      `按统一权重：热点15% / 痛点25% / 匹配20% / 差异化15% / 传播15% / 商业10%`,
      76,
    ),
  ];

  const opportunities: Signal[] = [
    signal(
      "组合打法",
      "把高分「避坑 + 案例」选题先做成系列，用信任型内容打底，再穿插热点与观点。",
      "来自选题类型分布",
      68,
    ),
  ];

  const risks: Signal[] = [
    signal(
      "传播风险",
      "评分只是决策辅助，不代表一定会爆；必须发布后用真实数据（完播、互动、咨询）复盘。",
      "评分模型说明",
      82,
    ),
    signal(
      "内容风险",
      "避免所有选题都变成干货堆砌，缺少真实案例与个人观点时很难形成记忆点。",
      "来自选题类型分布",
      66,
    ),
  ];

  const recommendations: Signal[] = [
    signal(
      "先拍 TOP 1",
      `今天先拍「${ranked[0]?.topic.title ?? "—"}」，拍摄成本低、痛点强，最容易拿到第一波反馈。`,
      "来自今日推荐算法（综合分 + 拍摄成本）",
      74,
    ),
    signal(
      "控制配比",
      `按 ${profile.ratio.map((item) => `${item.bucket} ${item.percent}%`).join(" / ")} 更新，避免连续多条同类型内容。`,
      "行业内容配比经验",
      64,
    ),
  ];

  return {
    summary: `围绕「${profile.label}」IP 的信任建立与转化路径，生成 ${topics.length} 个选题，其中 5 个综合分最高、最值得先做。`,
    topics,
    top5,
    contentRatio: profile.ratio,
    insights,
    opportunities,
    risks,
    recommendations,
  };
}

/* -------------------------------------------------------------------------- */
/* 4. Script Writer                                                            */
/* -------------------------------------------------------------------------- */

function titleCase(theme: string) {
  return theme.startsWith("《") ? theme : `《${theme}》`;
}

export function demoScriptBundle(input: IpInput, industryKey: IndustryKey, topic: TopicItem): ScriptBundle {
  const profile = p(input, industryKey);
  const context = ctx(input, industryKey);
  const audienceNames = profile.audience.map((item) => fillTemplate(item.name, context));

  const hooks = [
    { version: "A", text: topic.hook, why: "直接点出用户的决策场景，把「我在说你」讲清楚，容易留住目标人群。" },
    {
      version: "B",
      text: `关于「${topic.title}」，很多人第一步就做错了。`,
      why: "用轻微的否定制造信息缺口，让用户想知道「错在哪」。",
    },
    {
      version: "C",
      text: `${topic.painPoint}？这条视频给你一个能马上用的答案。`,
      why: "先复述用户的真实困扰，再承诺可执行的答案，降低划走概率。",
    },
  ];

  const s30Lines = [
    { section: "Hook", text: topic.hook },
    { section: "问题", text: `${topic.painPoint}，这几乎是每个${context.customer}都会遇到的。` },
    { section: "观点", text: topic.value },
    { section: "结论", text: fillTemplate(profile.script.conclusion, context) },
    { section: "CTA", text: fillTemplate(profile.script.cta, context) },
  ];

  const s60Lines = [
    { section: "Hook", text: topic.hook },
    { section: "问题", text: `${topic.painPoint}。${fillTemplate(profile.script.problem, context)}` },
    { section: "观点", text: `${topic.value}${fillTemplate(profile.script.insight, context)}` },
    { section: "案例", text: fillTemplate(profile.script.caseText, context) },
    { section: "结论", text: fillTemplate(profile.script.conclusion, context) },
    { section: "CTA", text: fillTemplate(profile.script.cta, context) },
  ];

  const s90Lines = [
    { section: "Hook", text: topic.hook },
    { section: "问题", text: `${topic.painPoint}。很多人以为问题出在别的地方，其实不是。` },
    { section: "观点", text: `${topic.value}${fillTemplate(profile.script.insight, context)}` },
    { section: "案例", text: fillTemplate(profile.script.caseText, context) },
    { section: "结论", text: `${fillTemplate(profile.script.conclusion, context)}你可以先按这个顺序检查一遍，再决定怎么做。` },
    { section: "CTA", text: fillTemplate(profile.script.cta, context) },
  ];

  const titles = profile.titles.map((item) => ({ type: item.type as ScriptBundle["titles"][number]["type"], title: fillTemplate(item.title, context) }));
  if (!titles.some((item) => item.title === topic.title)) {
    titles.unshift({ type: "信息型", title: topic.title });
  }

  const covers = Array.from(
    new Set([...profile.covers.map((item) => fillTemplate(item, context)), truncate(topic.title, 12)]),
  ).slice(0, 8);

  const signals: SignalBundle = {
    insights: [
      signal("核心观点", topic.value, `选题：${topic.title}`, 74),
      signal("口播风格", "用短句、口语化表达，避免「首先其次最后」这类文章式语言，念出来才自然。", "脚本写作规范", 70),
    ],
    opportunities: [
      signal("多版本测试", "同一选题可用 3 个 Hook 版本做 A/B 测试，用数据决定最终方向。", "来自 Hook 版本设计", 66),
    ],
    risks: [
      signal("数据引用风险", "案例与数据必须真实且获得授权；没有确证的数字不要写进脚本。", "内容合规要求", 84),
    ],
    recommendations: [
      signal("发布建议", "先拍 30 秒版本试水，数据好再拍 60/90 秒的深度版本。", "内容运营经验", 62),
    ],
  };

  return {
    theme: titleCase(topic.title),
    coreIdea: topic.value,
    targetAudience: audienceNames.slice(0, 4),
    hooks,
    scripts: {
      s30: { duration: 30, hook: topic.hook, lines: s30Lines, cta: fillTemplate(profile.script.cta, context) },
      s60: { duration: 60, hook: topic.hook, lines: s60Lines, cta: fillTemplate(profile.script.cta, context) },
      s90: { duration: 90, hook: topic.hook, lines: s90Lines, cta: fillTemplate(profile.script.cta, context) },
    },
    titles,
    covers,
    commentPrompts: profile.commentPrompts.map((item) => fillTemplate(item, context)),
    ...signals,
  };
}

/* -------------------------------------------------------------------------- */
/* 5. Shot Planner                                                             */
/* -------------------------------------------------------------------------- */

export function demoShotPlan(input: IpInput, industryKey: IndustryKey, topic: TopicItem, script: ScriptBundle): ShotPlan {
  const profile = p(input, industryKey);
  const context = ctx(input, industryKey);
  const times = ["0-3s", "3-8s", "8-15s", "15-25s", "25-30s"];
  const voiceovers = [
    script.scripts.s30.hook,
    `${topic.painPoint}。`,
    fillTemplate(profile.script.insight, context),
    fillTemplate(profile.script.caseText, context),
    fillTemplate(profile.script.cta, context),
  ];

  const shotList = profile.script.shots.slice(0, 5).map((shot, index) => ({
    time: times[index] ?? `${index * 5}-${index * 5 + 5}s`,
    scene: fillTemplate(shot.scene, context),
    action: fillTemplate(shot.action, context),
    voiceover: voiceovers[index] ?? "",
    subtitle: fillTemplate(shot.subtitle, context),
  }));

  return {
    theme: script.theme,
    shotList,
    mustShoot: profile.script.mustShoot.map((item) => fillTemplate(item, context)),
    optional: profile.script.optional.map((item) => fillTemplate(item, context)),
    equipment: ["手机（后置摄像头，横屏或竖屏先定好）", "领夹麦或耳机麦（保证收音）", "手机支架 / 稳定器", "自然光或一盏补光灯"],
    props: profile.script.props.map((item) => fillTemplate(item, context)),
    tips: profile.script.tips.map((item) => fillTemplate(item, context)),
    insights: [
      signal("拍摄重点", "把「必拍清单」拍全，剪辑时就有足够的素材可用，不需要重拍。", "拍摄计划规范", 72),
    ],
    opportunities: [
      signal("一鱼多吃", "同一次拍摄的素材可以剪成 30 秒短视频 + 60 秒深度版 + 图文，提高产出效率。", "内容复用经验", 64),
    ],
    risks: [
      signal("收音风险", "口播视频最常见的失败原因是收音差，户外拍摄务必用领夹麦。", "拍摄经验", 76),
    ],
    recommendations: [
      signal("当天完成", "按清单一次拍完，不要分多次补拍，能显著降低放弃的概率。", "执行建议", 60),
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* 6. Content Planner                                                          */
/* -------------------------------------------------------------------------- */

function bucketForType(type: string): string {
  if (["避坑", "用户问题", "反常识"].includes(type)) return "用户痛点";
  if (["干货", "对比", "行业内幕"].includes(type)) return "专业干货";
  if (["案例", "故事"].includes(type)) return "故事 / 案例";
  if (type === "热点") return "热点";
  return "个人 IP / 观点";
}

function allocateBuckets(ratio: { bucket: string; percent: number }[], days: number): string[] {
  const total = ratio.reduce((acc, item) => acc + item.percent, 0) || 1;
  const entries = ratio.map((item) => {
    const exact = (item.percent / total) * days;
    return { bucket: item.bucket, count: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  let assigned = entries.reduce((acc, item) => acc + item.count, 0);
  const byRemainder = [...entries].sort((a, b) => b.remainder - a.remainder);
  let cursor = 0;
  while (assigned < days) {
    byRemainder[cursor % byRemainder.length].count += 1;
    assigned += 1;
    cursor += 1;
  }

  // 轮转排列，避免同一类型连续出现（例如 7 天不会全是同一种内容）。
  const queue = entries.map((item) => ({ bucket: item.bucket, left: item.count })).filter((item) => item.left > 0);
  const sequence: string[] = [];
  while (sequence.length < days && queue.length > 0) {
    for (const item of queue) {
      if (sequence.length >= days) break;
      if (item.left > 0) {
        sequence.push(item.bucket);
        item.left -= 1;
      }
    }
    if (queue.every((item) => item.left === 0)) break;
  }
  return sequence;
}

export function demoContentPlan(input: IpInput, industryKey: IndustryKey, topics: TopicItem[]): ContentPlan {
  const profile = p(input, industryKey);
  const context = ctx(input, industryKey);

  const matrix = profile.columns.map((column) => ({
    column: fillTemplate(column.column, context),
    positioning: fillTemplate(column.positioning, context),
    targetUser: fillTemplate(column.targetUser, context),
    videoForm: fillTemplate(column.videoForm, context),
    topics: column.topics.map((topic) => fillTemplate(topic, context)),
  }));

  const pool = topics.length > 0 ? topics : [];
  const sequence = allocateBuckets(profile.ratio, 7);
  const used = new Set<string>();

  const sevenDay = sequence.map((bucket, index) => {
    const match =
      pool.find((topic) => !used.has(topic.title) && bucketForType(topic.topicType) === bucket) ??
      pool.find((topic) => !used.has(topic.title)) ??
      pool[index % Math.max(1, pool.length)];
    if (match) used.add(match.title);
    const column = profile.columns[index % profile.columns.length];
    return {
      day: `Day ${index + 1}`,
      bucket,
      theme: match?.title ?? `${bucket}内容（待补充选题）`,
      hook: match?.hook ?? "（需要一个更具体的开头）",
      form: fillTemplate(column?.videoForm ?? "口播", context),
      note: `按内容配比安排为「${bucket}」，避免连续多条同类型内容造成疲劳。`,
    };
  });

  const insights: Signal[] = [
    signal(
      "内容矩阵",
      `已建立 ${matrix.length} 个长期栏目，每个栏目 10 个可持续选题，保证账号有稳定内容主线。`,
      `IP：${input.name}；行业：${profile.label}`,
      76,
    ),
    signal(
      "7 天配比",
      `7 天计划按 ${profile.ratio.map((item) => `${item.bucket} ${item.percent}%`).join(" / ")} 混合排布，不会全是同一种内容。`,
      "来自内容配比模型",
      72,
    ),
  ];

  const opportunities: Signal[] = [
    signal(
      "栏目化运营",
      `把「${matrix[0]?.column ?? "核心栏目"}」做成固定系列，用户会因为系列感而持续关注。`,
      "内容矩阵设计",
      66,
    ),
  ];

  const risks: Signal[] = [
    signal("断更风险", "7 天计划只是排期，真正难的是持续执行；建议一次拍多条，降低单条成本。", "运营经验", 74),
  ];

  const recommendations: Signal[] = [
    signal("先做主线", "先跑通 1 个主力栏目 + 2 个辅助栏目，再扩展到全部栏目。", "内容运营建议", 64),
    signal("按数据迭代", "每周看一次完播、互动与咨询数据，把表现好的栏目加大比例。", "数据驱动建议", 68),
  ];

  return {
    summary: `为「${input.name}」建立 ${matrix.length} 个长期内容栏目，并排出 7 天内容计划；内容按固定比例混合，兼顾涨粉、信任与转化。`,
    matrix,
    sevenDay,
    ratio: profile.ratio,
    insights,
    opportunities,
    risks,
    recommendations,
  };
}

/* -------------------------------------------------------------------------- */
/* 2. Trend Researcher                                                         */
/* -------------------------------------------------------------------------- */

export function demoTrendResearch(
  input: IpInput,
  industryKey: IndustryKey,
  searchResults: SearchResult[],
  status: TrendSearchStatus,
): TrendResearch {
  const profile = p(input, industryKey);
  const context = ctx(input, industryKey);
  const seeds = profile.trendSeeds.map((seed) => ({
    title: fillTemplate(seed.title, context),
    category: seed.category,
    summary: fillTemplate(seed.summary, context),
    whyRelevant: fillTemplate(seed.whyRelevant, context),
  }));

  const hasReliable = status.performed && searchResults.length > 0;

  const hotTopics: TrendResearch["hotTopics"] = [];
  if (hasReliable) {
    searchResults.slice(0, 6).forEach((result) => {
      hotTopics.push({
        title: truncate(result.title || result.snippet, 60),
        summary: truncate(result.snippet || result.title, 120),
        whyRelevant: `与「${context.industry}」相关的最新信息，可作为热点类选题的素材；请打开来源核对原文与时效。`,
        label: "事实",
        sourceTitle: result.title || result.source,
        sourceUrl: result.url,
      });
    });
  }
  seeds.slice(0, hasReliable ? 4 : 6).forEach((seed) => {
    hotTopics.push({
      title: seed.title,
      summary: seed.summary,
      whyRelevant: seed.whyRelevant,
      label: "AI推测",
      sourceTitle: "无来源",
      sourceUrl: "",
    });
  });

  const byCategory = (category: string) =>
    seeds
      .filter((seed) => seed.category === category)
      .map((seed) => ({
        title: seed.title,
        summary: seed.summary,
        whyRelevant: seed.whyRelevant,
        label: "需要进一步验证" as const,
        sourceTitle: "无来源",
        sourceUrl: "",
      }));

  const userPainPoints = profile.painPoints.map((pain, index) => ({
    pain: fillTemplate(pain, context),
    evidence:
      index === 0 && input.targetCustomer
        ? `来自用户填写的目标客户「${input.targetCustomer}」的常见疑问`
        : "来自该行业的常见用户问题判断，属于 AI 推测",
    label: (index === 0 && input.targetCustomer ? "AI推测" : "AI推测") as TrendResearch["userPainPoints"][number]["label"],
    sourceTitle: "无来源",
    sourceUrl: "",
  }));

  const reliabilityNote = hasReliable
    ? status.note
    : "当前没有找到足够可靠的热点信息。以下热点均为基于行业经验的 AI 推测，请勿当作事实使用。";

  const insights: Signal[] = [
    signal(
      hasReliable ? "找到可引用的最新信息" : "没有可靠热点",
      hasReliable
        ? `通过 ${status.provider} 搜索到 ${status.resultCount} 条结果，已在热点中标出来源链接。`
        : "当前没有找到足够可靠的热点信息，热点相关判断均标注为 AI 推测。",
      hasReliable ? status.queries.join(" / ") : "未配置搜索或搜索无结果",
      hasReliable ? 78 : 55,
    ),
    signal(
      "用户高频痛点",
      profile.painPoints.slice(0, 3).map((pain) => fillTemplate(pain, context)).join("；"),
      "来自行业常见问题判断",
      64,
    ),
  ];

  const opportunities: Signal[] = [
    signal(
      "热点类选题机会",
      hasReliable
        ? "优先把搜索结果里与用户决策直接相关的话题做成「这对你意味着什么」的解读内容。"
        : "没有可靠热点时，先做常青型内容（避坑 / 干货 / 案例），不要硬蹭热点。",
      hasReliable ? "来自联网搜索结果" : "无可靠来源",
      62,
    ),
    signal(
      "同行选题参考",
      seeds.filter((seed) => seed.category === "平台内容" || seed.category === "用户问题").map((s) => s.title).join("；"),
      "基于平台内容规律推测",
      58,
    ),
  ];

  const risks: Signal[] = [
    signal(
      "事实性风险",
      "热点、政策与市场数据极易过时或被误读；引用前必须核对来源与时间。",
      hasReliable ? "已提供来源链接，请打开核对" : "当前没有来源，全部为 AI 推测",
      82,
    ),
    signal(
      "合规风险",
      "不要把未经证实的信息当作事实发布，也不要使用绝对化、承诺性表达。",
      "内容合规要求",
      80,
    ),
  ];

  const recommendations: Signal[] = [
    signal(
      "配置联网搜索",
      "在 .env.local 配置 SEARCH_PROVIDER 与 SEARCH_API_KEY 后，热点研究会自动带上真实来源。",
      "搜索适配层（Tavily / Serper / Bing / 自定义）",
      70,
    ),
    signal(
      "热点使用方式",
      "热点只作为「切入口」，真正留住用户的是你给出的判断与建议，而不是转发新闻。",
      "内容规律",
      66,
    ),
  ];

  return {
    searchedQueries: status.queries,
    searchPerformed: status.performed,
    reliabilityNote,
    hotTopics,
    userPainPoints,
    policyChanges: byCategory("政策变化"),
    contradictions: byCategory("行业争议"),
    peerTopics: byCategory("平台内容"),
    ipEvents: [],
    insights,
    opportunities,
    risks,
    recommendations,
  };
}
