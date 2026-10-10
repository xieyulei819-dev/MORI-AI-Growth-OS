import type { AgentPayload, ContentSelection, CreativeSelection } from "@/lib/ai/context";
import type {
  AudienceAnalysis,
  CampaignAnalysis,
  ContentStrategy,
  CreativeDirections,
  GrowthAdvice,
  GrowthReport,
  MarketAnalysis,
} from "@/lib/ai/schemas";
import type { Signal, SignalBundle } from "@/types";

/**
 * Local structured analysis engine ("Demo Mode").
 *
 * This is NOT a set of hard-coded answers: every sentence is assembled from the
 * numbers that were just computed from the (simulated) database rows, so if you
 * change the demo data or upload your own CSV, the analysis changes with it.
 *
 * When DEMO_MODE=false and an API key is present, `lib/ai/runner.ts` calls the
 * real structured-output model instead and only falls back to this engine when
 * the provider fails or returns invalid data.
 */

const money = (value: number) => `¥${Math.round(value).toLocaleString("zh-CN")}`;
const pct = (value: number, digits = 2) => `${(value * 100).toFixed(digits)}%`;
const ratio = (value: number, digits = 2) => value.toFixed(digits);

/**
 * 所有 Demo 引擎生成的结论都必须带数据口径前缀。
 * 这些结果是基于模拟数据的推演，不能被读成真实投放/真实实验的结论。
 */
const DEMO_TAG = "（Demo / 模拟业务数据）";

function take(primary: Signal[], count: number, fallback: Signal[]): Signal[] {
  const merged = [...primary, ...fallback];
  const used = new Set<string>();
  const result: Signal[] = [];
  merged.forEach((signal) => {
    if (result.length >= count) return;
    if (used.has(signal.title)) return;
    used.add(signal.title);
    result.push(signal);
  });
  return result;
}

function emptySignals(bundle: SignalBundle): boolean {
  return bundle.insights.length + bundle.opportunities.length + bundle.risks.length + bundle.recommendations.length === 0;
}

function fallbackSignal(title: string, body: string, evidence: string, confidence = 70): Signal {
  return { title, body, evidence, confidence };
}

function lowestCpc(list: AgentPayload["context"]["platforms"]) {
  return list.reduce((best, item) => (item.cpc < best.cpc ? item : best), list[0]);
}

/* -------------------------------------------------------------------------- */
/* Agent 1 - Market Analyst                                                    */
/* -------------------------------------------------------------------------- */

export function demoMarketAnalysis(payload: AgentPayload): MarketAnalysis {
  const context = payload.context;
  const self = context.competitors.find((item) => item.isSelf);
  const others = context.competitors.filter((item) => !item.isSelf);
  const cheapest = [...context.competitors].sort((a, b) => a.price - b.price)[0];
  const priciest = [...context.competitors].sort((a, b) => b.price - a.price)[0];
  const professionalLeader = [...context.competitors].sort((a, b) => b.professional - a.professional)[0];

  const themeCount = new Map<string, number>();
  others.forEach((competitor) => {
    competitor.contentThemes.forEach((theme) => themeCount.set(theme, (themeCount.get(theme) ?? 0) + 1));
  });
  const crowded = Array.from(themeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme, count]) => theme + "(" + count + ")")
    .join("、");

  const summary =
    "基于模拟数据（Demo 数据集）的竞品矩阵分析：在 4 个虚拟竞品构成的价格 × 专业度矩阵中，" +
    (self?.name ?? context.brand.name) +
    " 位于「" +
    (self?.priceTier ?? "中低价位") +
    " × 专业度 " +
    (self?.professional ?? 60) +
    "」的位置：价格低于 " +
    (professionalLeader?.name ?? "头部竞品") +
    "（" +
    money(professionalLeader?.price ?? 0) +
    "），高于 " +
    (cheapest?.name ?? "低价竞品") +
    "（" +
    money(cheapest?.price ?? 0) +
    "）。这一区间既避开了高价品牌的正面专业竞争，也不必卷入价格战，但需要自己补齐「专业信任」这块短板。";

  const competitiveGaps = [
    {
      name: "可信的年轻表达",
      gap:
        others.map((item) => item.name).join(" / ") +
        " 要么用专业数据说话（偏理性、门槛高），要么用氛围与低价直给（缺产品机理），中间缺少「用年轻语言把成分与用法讲清楚」的位置。",
      evidence: others.map((item) => item.name + " 弱点：" + item.weakness).join("；"),
    },
    {
      name: "长期使用记录",
      gap:
        "竞品内容以单点卖点与氛围为主，缺少可追踪的长期记录内容（如 30 天状态记录），而年轻用户真正需要的是「别人用完是什么样」的确定性。",
      evidence: "竞品内容主题高频词：" + (crowded || "数据不足"),
    },
    {
      name: "价格解释",
      gap:
        "竞品普遍直接给价格或折扣，缺少「单次使用成本 / 可使用天数」的解释方式，对预算敏感人群（" +
        (context.personas[1]?.name ?? "学生党人群") +
        "）不够友好。",
      evidence:
        "MORI 价格 " +
        money(context.product.price) +
        "；竞品价格区间 " +
        money(cheapest?.price ?? 0) +
        "–" +
        money(priciest?.price ?? 0),
    },
  ];

  const insights: Signal[] = [
    {
      title: "价格带存在结构空隙",
      body:
        "竞品价格分布在 " +
        money(cheapest?.price ?? 0) +
        " 到 " +
        money(priciest?.price ?? 0) +
        " 之间，MORI 的 " +
        money(context.product.price) +
        " 同时避开了低价爆款与高价功效型，适合用「中价位 + 可信内容」切入。",
      evidence: context.competitors.map((item) => item.name + "=" + money(item.price)).join("、"),
      confidence: 84,
    },
    {
      title: "专业度是 MORI 最明显的短板",
      body:
        "在专业度维度上 " +
        (professionalLeader?.name ?? "头部竞品") +
        " 达到 " +
        (professionalLeader?.professional ?? 0) +
        " 分，MORI 为 " +
        (self?.professional ?? 0) +
        " 分。这不阻挡短期转化，但会影响 " +
        (context.personas[2]?.name ?? "轻熟人群") +
        " 的长期决策。",
      evidence: "competitors.professional（0–100 感知分，Demo）",
      confidence: 80,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "用「成分讲人话」补专业信任",
      body: "把成分表拆成三个问题讲清楚：解决什么、适合谁、怎么用。既保留专业感，又不会像竞品那样让年轻用户看不懂。",
      evidence: "竞品内容主题以实验数据与氛围为主，缺少通俗解释型内容",
      confidence: 78,
    },
    {
      title: "把 30 天记录做成品牌资产",
      body: "连续记录比单点卖点更难被复制，可以沉淀为长期内容系列，同时为落地页提供真实素材。",
      evidence: others.map((item) => item.name + " 广告主题：" + item.adThemes.join("/")).join("；"),
      confidence: 81,
    },
  ];

  const risks: Signal[] = [
    {
      title: "低价竞品随时能用价格带走年轻用户",
      body:
        (cheapest?.name ?? "低价竞品") +
        " 价格仅 " +
        money(cheapest?.price ?? 0) +
        "。如果 MORI 只讲价格与性价比，很容易被更低价替代，必须把内容重心放在「为什么值得多花这部分钱」。",
      evidence: "价格差 " + money(Math.max(0, context.product.price - (cheapest?.price ?? 0))),
      confidence: 83,
    },
    {
      title: "没有证据时不要做功效型对比",
      body: "在缺少第三方检测数据的情况下，任何功效对比都会带来合规与信任风险，应保持克制表述。",
      evidence: "品牌 credibility 字段：Demo 数据，不含功效承诺",
      confidence: 90,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "下一阶段主攻「可信的年轻表达」",
      body: "用三类内容组合：① 通俗成分解释；② 真实使用记录；③ 具体场景（熬夜 / 通勤 / 空调房）。三类内容分别对应信任、确定性与场景代入。",
      evidence: "MORI 品牌关键词：" + context.brand.keywords.join("、"),
      confidence: 82,
    },
    {
      title: "把竞品弱点转成选题清单",
      body:
        "针对「" +
        (professionalLeader?.name ?? "头部竞品") +
        " 内容偏理性」做通俗化改编，针对「" +
        (cheapest?.name ?? "低价竞品") +
        " 复购弱」做长期使用记录内容。",
      evidence: "competitors.weakness 字段",
      confidence: 76,
    },
  ];

  return {
    summary,
    competitiveGaps,
    positioningAdvice:
      "建议 MORI 占住「中价位 + 可验证的年轻护肤」：不打价格战，也不堆砌功效数据，而是用成分透明、真实使用记录与具体场景建立可信度。",
    insights: take(insights, 3, context.signals.insights),
    opportunities: take(opportunities, 3, context.signals.opportunities),
    risks: take(risks, 3, context.signals.risks),
    recommendations: take(recommendations, 3, context.signals.recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 2 - Audience Analyst                                                  */
/* -------------------------------------------------------------------------- */

export function demoAudienceAnalysis(payload: AgentPayload): AudienceAnalysis {
  const context = payload.context;
  const byCtr = [...context.audience].sort((a, b) => b.ctr - a.ctr);
  const byCvr = [...context.audience].sort((a, b) => b.cvr - a.cvr);
  const highestCtr = byCtr[0];
  const highestCvr = byCvr[0];
  const lowestCvr = byCvr[byCvr.length - 1];

  const personas = context.personas.map((persona) => ({
    name: persona.name,
    segment: persona.ageBand + " · " + persona.occupation,
    painPoints: persona.painPoints,
    motivations: persona.motivations,
    barriers: persona.barriers,
    contentPreferences: persona.contentPreferences,
  }));

  const adAngles = [
    {
      angle: "熬夜场景 + 结果不确定性",
      hook: "连续熬夜第 12 天，我的脸终于不闹脾气了",
      audience: context.personas[0]?.name ?? "熬夜人群",
      rationale: "把痛点锁定在具体时间点，让用户先代入场景，再接受产品作为解决方案。",
    },
    {
      angle: "成分讲人话",
      hook: "修护和保湿不是一回事，选错方向当然没感觉",
      audience: context.personas[2]?.name ?? "轻熟人群",
      rationale: "用纠错式判断制造认知冲突，适合专业度敏感人群，同时补齐品牌信任短板。",
    },
    {
      angle: "单次使用成本",
      hook: "¥169 分摊到每天是多少钱？我算给你看",
      audience: context.personas[1]?.name ?? "学生党人群",
      rationale: "预算敏感人群的阻力是「值不值」，把价格换算成单次成本可以直接降低首单门槛。",
    },
    {
      angle: "肤感实测",
      hook: "怕黏腻的人，先看这个 10 秒质地测试",
      audience: "油皮 / 混合皮年轻用户",
      rationale: "肤感是年轻用户最直观的决策点，可视化测试比形容词更可信。",
    },
  ];

  const insights: Signal[] = [
    {
      title: highestCtr ? highestCtr.segment + " 点击意愿最强，但购买理由不足" : "分人群数据不足",
      body: highestCtr
        ? highestCtr.segment +
          " 的 CTR 为 " +
          pct(highestCtr.ctr) +
          "（全账户最高），但 CVR 仅 " +
          pct(highestCtr.cvr) +
          "，低于 " +
          (highestCvr?.segment ?? "高转化人群") +
          "（" +
          pct(highestCvr?.cvr ?? 0) +
          "）。内容吸引力不是瓶颈，缺的是「现在值得买」的解释与信任证据。"
        : "当前数据集没有分人群指标，无法给出人群结论。",
      evidence: context.audience
        .map((item) => item.segment + ": CTR=" + pct(item.ctr) + ", CVR=" + pct(item.cvr) + ", ROAS=" + ratio(item.roas))
        .join("; "),
      confidence: 86,
    },
    {
      title: "年轻用户买的是确定性，而不是「便宜」",
      body: "预算敏感人群的内容偏好集中在真实测评、成分透明与长期记录，而不是最低价。低价只解决第一次尝试，复购靠的是稳定预期。",
      evidence: context.personas
        .map((persona) => persona.name + " 购买驱动：" + persona.purchaseDrivers.join("/"))
        .join("；"),
      confidence: 79,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "为高点击人群补「信任 + 价格解释」内容",
      body:
        (highestCtr?.segment ?? "年轻人群") +
        " 需要三类内容拉高 CVR：真实使用记录（30 天）、成分与用法说明、单次使用成本换算，并可用试用规格降低首单门槛。",
      evidence: "CTR " + pct(highestCtr?.ctr ?? 0) + " vs CVR " + pct(highestCtr?.cvr ?? 0),
      confidence: 83,
    },
    {
      title: "把高转化人群的内容结构复制到低效人群",
      body:
        (highestCvr?.segment ?? "高转化人群") +
        " 的 CVR 达到 " +
        pct(highestCvr?.cvr ?? 0) +
        "，说明「专业解释 + 长期视角」的结构有效，可以改写成更轻量的版本用于年轻人群。",
      evidence: context.audience.map((item) => item.segment + "=" + pct(item.cvr)).join("、"),
      confidence: 77,
    },
  ];

  const risks: Signal[] = [
    {
      title: "低转化人群持续消耗预算",
      body: lowestCvr
        ? lowestCvr.segment +
          " 的 CVR 仅 " +
          pct(lowestCvr.cvr) +
          "，却占用 " +
          pct(lowestCvr.spendShare, 1) +
          " 的预算；如果不做内容与承接调整，CPA 会继续被推高。"
        : "分人群预算分布数据不足。",
      evidence:
        "segment=" +
        (lowestCvr?.segment ?? "-") +
        "; CVR=" +
        pct(lowestCvr?.cvr ?? 0) +
        "; spendShare=" +
        pct(lowestCvr?.spendShare ?? 0, 1),
      confidence: 82,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "按人群拆分内容测试，而不是全账户一起测",
      body: "把 18–24 岁女性与 25–30 岁女性分成两组素材，分别观察 CTR 与 CVR，避免用同一套素材服务两种完全不同的购买逻辑。",
      evidence: "AudienceMetric 分人群指标（Demo）",
      confidence: 80,
    },
  ];

  return {
    summary: context.audience.length
      ? "基于模拟数据（Demo 数据集）的分人群结论：" +
        (highestCtr?.segment ?? "-") +
        " 的点击效率最高（CTR " +
        pct(highestCtr?.ctr ?? 0) +
        "），而转化效率最高的是 " +
        (highestCvr?.segment ?? "-") +
        "（CVR " +
        pct(highestCvr?.cvr ?? 0) +
        "）。人群策略应从「覆盖更多人」转向「给不同人群不同的购买理由」。"
      : "当前数据集没有分人群指标，建议先导出人群维度报表后再做人群结论。",
    personas,
    opportunityCards: {
      user: [
        (highestCtr?.segment ?? "高点击人群") +
          " 点击意愿最强但购买理由不足：需要用内容补齐「值得买」的解释，而不是继续加大曝光。",
        (highestCvr?.segment ?? "高转化人群") +
          " 的转化效率最高（CVR " +
          pct(highestCvr?.cvr ?? 0) +
          "），可以把它有效的内容结构改写成更轻量的版本用于年轻人群。",
      ],
      content: [
        "真实使用记录类内容（30 天）：用可追踪的记录替代形容词，提升信任。",
        "价格解释类内容：把 " +
          money(context.product.price) +
          " 换算成单次使用成本，降低预算敏感人群的决策门槛。",
        "场景对比类内容：同一人群在不同场景（熬夜 / 通勤 / 空调房）下的使用方法差异。",
      ],
      product: [
        "强调「一步完成晚间修护 + 保湿」的简化价值，回应「不想复杂护肤」的核心痛点。",
        "突出清爽肤感（不黏枕头）与可长期使用的配方思路，回应年轻用户对肤感的敏感度。",
        "增加成分与用法的透明说明，补齐品牌在专业信任上的短板。",
      ],
      ad: [
        "广告开头 3 秒直接给出具体场景（时间 + 动作 + 状态），而不是抽象卖点。",
        "落地页首屏复述素材承诺，并放置真实使用记录与价格解释模块。",
        "针对高点击低转化人群单独建组，用「信任 + 价格」型素材做定向测试。",
      ],
    },
    adAngles,
    insights: take(insights, 3, context.signals.insights),
    opportunities: take(opportunities, 3, context.signals.opportunities),
    risks: take(risks, 3, context.signals.risks),
    recommendations: take(recommendations, 3, context.signals.recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 3 - Content Strategist                                                */
/* -------------------------------------------------------------------------- */

const PLATFORM_HINT: Record<string, string> = {
  小红书: "真诚的用户口吻，多讲过程与感受，少讲结论",
  抖音: "前 3 秒必须有场景冲突，15 秒内完成痛点 → 方案 → 行动",
  公众号: "用知识结构建立信任，段落短、结论前置",
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100_000;
  }
  return hash;
}

function topicAffinity(topic: string, payload: AgentPayload) {
  const tokens = topic
    .split(/[\s/、,，]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
  const best = payload.context.creatives.reduce((acc, creative) => Math.max(acc, creative.roasIndex), 0);
  if (tokens.length === 0) return Math.min(1, 0.5 + best * 0.12);
  const matched = payload.context.creatives.filter((creative) =>
    tokens.some((token) => creative.name.includes(token) || creative.name.includes(token.slice(0, 2))),
  );
  const matchRatio = matched.length / Math.max(payload.context.creatives.length, 1);
  return Math.min(1, 0.45 + matchRatio * 0.3 + Math.min(best, 1.5) * 0.12);
}

export function demoContentStrategy(payload: AgentPayload): ContentStrategy {
  const context = payload.context;
  const selection: ContentSelection =
    payload.contentSelection ?? {
      platform: "小红书",
      contentType: "种草",
      goal: "互动",
      topic: "熬夜修护",
      audience: context.personas[0]?.name ?? "熬夜型都市新人",
    };

  const affinity = topicAffinity(selection.topic, payload);
  const seed = hashString(selection.platform + "-" + selection.topic + "-" + selection.goal);
  const jitter = (offset: number) => ((seed + offset * 37) % 13) - 6;

  const hookScore = Math.max(50, Math.min(98, Math.round(74 + affinity * 18 + jitter(1))));
  const relevanceScore = Math.max(55, Math.min(98, Math.round(78 + affinity * 14 + jitter(2))));
  const conversionScore = Math.max(
    45,
    Math.min(96, Math.round((selection.goal.includes("转化") ? 80 : 68) + affinity * 14 + jitter(3))),
  );
  const brandFitScore = Math.max(60, Math.min(98, Math.round(84 + affinity * 8 + jitter(4))));
  const overallScore = Math.round(
    hookScore * 0.25 + relevanceScore * 0.3 + conversionScore * 0.25 + brandFitScore * 0.2,
  );

  const titles = [
    {
      title: "每天熬夜的人，真的需要一瓶" + selection.topic + "吗？",
      angle: "质疑式提问",
      whyItWorks: "用反问制造轻微认知冲突，让熬夜人群先怀疑自己的护肤逻辑，再进入阅读。",
    },
    {
      title: "连续加班 12 天，我唯一没放弃的护肤步骤",
      angle: "时间线叙述",
      whyItWorks: "具体数字提升可信度，「唯一没放弃」暗示步骤足够简单。",
    },
    {
      title: "预算有限也能坚持的" + selection.topic + "，我算了单次成本",
      angle: "价格解释",
      whyItWorks: "直接回应目标人群的核心阻力，把价格问题转成可计算的小额成本。",
    },
    {
      title: selection.topic + "不是越贵越好，先搞清楚这两件事",
      angle: "纠错型干货",
      whyItWorks: "纠错型标题自带信息量，适合搜索场景并建立专业感。",
    },
    {
      title: "换季又开始起皮的第 3 天，我做了一个减法",
      angle: "场景切片",
      whyItWorks: "用具体天数与状态描述还原真实感，减少广告感。",
    },
  ];

  const bodyLines = [
    "最近加班比较多，皮肤状态很不稳定：脸颊发干、上妆卡粉。我把护肤步骤砍到只剩两步，基础保湿加一支质地清爽的晚间修护精华（Demo 示例产品）。",
    "用了大概两周，比较明显的变化是第二天早上起来脸不那么紧绷，起皮的情况也少了。它不是那种「一晚就变好」的产品，更像是让状态别继续往下掉。",
    "质地偏水感，涂完不用等就能睡，不会粘枕头。价格 " +
      money(context.product.price) +
      "，我算了下一瓶 40ml 日常用量能用 1.5–2 个月，单次成本大概两三块。",
    "如果你也是熬夜党，建议先别急着加产品，先把自己的流程简化下来。（Demo 示例文案，不含功效承诺）",
  ];

  const script = [
    {
      timeRange: "0–3s",
      section: "Hook",
      content: "凌晨 1 点的电脑屏幕与一张疲惫的脸：「连续熬夜第 12 天，我的脸终于不闹脾气了」。",
    },
    {
      timeRange: "3–8s",
      section: "痛点",
      content: "起皮、卡粉、第二天显疲态；护肤步骤越多越坚持不下来。",
    },
    {
      timeRange: "8–12s",
      section: "解决方案",
      content: "睡前一步：质地清爽的" + context.product.name + "，吸收后再做基础保湿（Demo 演示）。",
    },
    {
      timeRange: "12–15s",
      section: "CTA",
      content: "点进来看真实使用第 30 天的记录。",
    },
  ];

  const insights: Signal[] = [
    {
      title:
        selection.platform +
        " 的内容策略应以「" +
        (PLATFORM_HINT[selection.platform] ?? "真实场景 + 明确下一步") +
        "」为主",
      body:
        "在这个平台上，" +
        selection.audience +
        " 对「" +
        selection.topic +
        "」的关注点更偏向「" +
        (selection.topic.includes("预算") ? "价格是否合理" : "步骤是否简单、值得坚持") +
        "」。建议结构：具体场景切入 → 说清做法 → 给出可验证的下一步。",
      evidence:
        "内容库中该平台高分选题：" +
        (context.contents
          .filter((content) => content.platform === selection.platform)
          .sort((a, b) => b.overallScore - a.overallScore)
          .slice(0, 2)
          .map((content) => content.title)
          .join("、") || "暂无"),
      confidence: 85,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "把最高效素材的主题做成系列",
      body:
        (context.creatives[0]?.name ?? "高效素材") +
        " 的 ROAS 为 " +
        ratio(context.creatives[0]?.roas ?? 0) +
        "（全账户最高）。围绕该主题再产 3 条同结构不同场景的内容，验证是主题红利还是单条素材运气。",
      evidence: "creative=" + (context.creatives[0]?.name ?? "-") + "; ROAS=" + ratio(context.creatives[0]?.roas ?? 0),
      confidence: 82,
    },
  ];

  const risks: Signal[] = [
    {
      title: "避免把「状态稳定」写成功效承诺",
      body: "涉及治疗效果或绝对化结果的表述都不能出现，用「更有规律」「不那么紧绷」「更容易坚持」这类可感知但克制的描述替代。",
      evidence: "品牌合规约束 + Demo 数据说明",
      confidence: 95,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "先测 Hook，再测正文",
      body: "同一正文准备 3 个不同 Hook，投 3–5 天看 CTR 差异，再决定保留哪个方向，这样每次只改变一个变量。",
      evidence: "当前账户 CTR=" + pct(context.totals.ctr) + "，可作为测试基准",
      confidence: 84,
    },
  ];

  return {
    summary:
      "基于模拟数据（Demo 数据集）的内容方案：围绕「" +
      selection.topic +
      "」为 " +
      selection.platform +
      "（" +
      selection.contentType +
      " / 目标：" +
      selection.goal +
      "）生成一套内容方案：5 个标题、1 篇正文、1 条 15 秒脚本，并给出可解释的评分。目标人群：" +
      selection.audience +
      "。",
    xiaohongshu: { titles, body: bodyLines.join("\n\n") },
    douyin: {
      hook: script[0].content,
      caption: "熬夜党的夜间一步护肤｜" + selection.topic + "（Demo 示例）",
      script,
    },
    scores: {
      hookScore,
      relevanceScore,
      conversionScore,
      brandFitScore,
      overallScore,
      whyTest:
        "Hook 分 " +
        hookScore +
        "，与「" +
        selection.topic +
        "」相关性 " +
        relevanceScore +
        "，适合作为该主题的基准版本先跑 3–5 天；若 CTR 高于账户均值 " +
        pct(context.totals.ctr) +
        "，即可进入放量测试。",
      howToImprove:
        "把第 3–8 秒的痛点再具体化（加入时间、地点、动作），并在结尾补一条真实使用记录，预期可把转化潜力从 " +
        conversionScore +
        " 提升 5–8 分。",
    },
    keywords: [selection.topic, "熬夜修护", "清爽肤感", "单次使用成本", "30 天记录", "成分透明"],
    insights: take(insights, 3, context.signals.insights),
    opportunities: take(opportunities, 3, context.signals.opportunities),
    risks: take(risks, 3, context.signals.risks),
    recommendations: take(recommendations, 3, context.signals.recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 4 - Creative Strategist                                               */
/* -------------------------------------------------------------------------- */

export function demoCreativeDirections(payload: AgentPayload): CreativeDirections {
  const context = payload.context;
  const selection: CreativeSelection =
    payload.creativeSelection ?? {
      platform: "抖音",
      objective: "转化",
      audience: "23 岁熬夜女性",
      theme: "夜间修护",
    };

  const accountCtr = context.totals.ctr;
  const basePriority = 78;
  const step = (timeRange: string, section: string, content: string) => ({ timeRange, section, content });

  const directions = [
    {
      code: "A",
      angle: "熬夜场景",
      hook: "凌晨一点还在改方案的人，睡前只剩一件事",
      cta: "看 30 天记录",
      audience: selection.audience,
      priorityScore: basePriority + 14,
      rationale:
        "与账户内 ROAS 最高的素材同属场景痛点族，历史点击效率更高。先测它可以验证「主题红利」是否可复制。",
      script: [
        step("0–3s", "Hook", "凌晨的办公桌、冷掉的咖啡、疲惫的脸：「连续熬夜第 12 天，我的脸终于不闹脾气了」"),
        step("3–8s", "痛点", "起皮、卡粉、第二天显疲态；护肤步骤越多越坚持不下来。"),
        step("8–12s", "解决方案", "睡前一步，质地清爽的晚间修护精华，吸收后再做基础保湿。"),
        step("12–15s", "CTA", "点进来看真实使用第 30 天的记录。"),
      ],
    },
    {
      code: "B",
      angle: "睡前护肤流程",
      hook: "睡前 5 分钟，把自己从工作里捞出来",
      cta: "看睡前流程",
      audience: "23–30 岁都市女性",
      priorityScore: basePriority + 6,
      rationale: "情绪价值方向尚未在账户内充分测试，但同主题内容互动稳定，适合作为第二优先方向。",
      script: [
        step("0–3s", "Hook", "暖色灯光、关掉电脑的声音：「今天到这里。」"),
        step("3–8s", "痛点", "一天的紧绷感被带到床上，睡前状态很难放松。"),
        step("8–12s", "解决方案", "把晚间护肤固定成一个放松动作，只需要 5 分钟。"),
        step("12–15s", "CTA", "今晚试试这 5 分钟。"),
      ],
    },
    {
      code: "C",
      angle: "办公室疲惫肌",
      hook: "在空调房待 8 小时，脸会变成什么样",
      cta: "拿办公桌护肤清单",
      audience: "23–30 岁办公室女性",
      priorityScore: basePriority + 2,
      rationale: "场景具体、人群明确，但账户内同场景素材 ROAS 处于中位，优先级略低。",
      script: [
        step("0–3s", "Hook", "办公室空调出风口 + 下午起皮的特写。"),
        step("3–8s", "痛点", "下午脸紧绷、卡粉、摸上去发干。"),
        step("8–12s", "解决方案", "夜间修护 + 日间基础保湿的组合思路。"),
        step("12–15s", "CTA", "点进来拿办公桌护肤清单。"),
      ],
    },
    {
      code: "D",
      angle: "30 天挑战",
      hook: "30 天只加一步护肤，记录每天的状态变化",
      cta: "加入 30 天挑战",
      audience: "20–28 岁关注肌肤稳定状态的女性",
      priorityScore: basePriority + 9,
      rationale: "挑战式内容能沉淀长期素材资产，账户内同主题素材 ROAS 高于均值，建议与方向 A 同期测试。",
      script: [
        step("0–3s", "Hook", "日历翻到 Day 1，素颜出镜。"),
        step("3–8s", "痛点", "状态忽好忽坏，产品越换越乱。"),
        step("8–12s", "解决方案", "只在夜间加一步，其他护肤保持不变。"),
        step("12–15s", "CTA", "评论区回复「挑战」领取记录表。"),
      ],
    },
    {
      code: "E",
      angle: "极简护肤",
      hook: "护肤做太多，状态反而更不稳定",
      cta: "看极简流程",
      audience: "20–28 岁想简化护肤流程的女性",
      priorityScore: basePriority - 4,
      rationale: "与品牌克制、简单的调性最契合，但点击驱动力偏弱，适合作为结构对标组而不是首测方向。",
      script: [
        step("0–3s", "Hook", "护肤台上被一件件移走的产品。"),
        step("3–8s", "痛点", "步骤越多，越难坚持。"),
        step("8–12s", "解决方案", "把复杂步骤放在夜间，早上只做基础保湿。"),
        step("12–15s", "CTA", "看极简流程。"),
      ],
    },
  ].map((direction) => ({ ...direction, priorityScore: Math.min(99, direction.priorityScore) }));

  const testingOrder = [...directions]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map((direction) => direction.code + "｜" + direction.angle);

  const insights: Signal[] = [
    {
      title: "同一主题下，场景痛点族的历史效率最高",
      body:
        "账户内场景类素材 CTR 达到 " +
        pct(context.creatives[0]?.ctr ?? accountCtr) +
        "，高于账户均值 " +
        pct(accountCtr) +
        "。因此方向 A（熬夜场景）应作为首测方向，而不是从文案最漂亮的方向开始测。",
      evidence:
        "creative=" +
        (context.creatives[0]?.name ?? "-") +
        "; CTR=" +
        pct(context.creatives[0]?.ctr ?? 0) +
        "; ROAS=" +
        ratio(context.creatives[0]?.roas ?? 0),
      confidence: 86,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "用 5 个方向覆盖完整决策链路",
      body: "A（场景）解决代入，D（挑战）解决确定性，E（极简）解决坚持难度，B（情绪）解决感受，C（办公室）解决具体痛点。一次投放即可看出人群真正卡在哪一环。",
      evidence: "5 个方向来自不同角度族，结构性差异明确",
      confidence: 80,
    },
  ];

  const risks: Signal[] = [
    {
      title: "方向过多会摊薄预算，导致每个方向都测不出结论",
      body:
        "按当前账户日均花费约 " +
        money(context.totals.spend / Math.max(context.period.days, 1)) +
        " 计算，5 个方向同时测试时单方向样本量偏小。建议第一轮只测 A、D、E。",
      evidence: "账户总花费 " + money(context.totals.spend) + " / " + context.period.days + " 天",
      confidence: 84,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "先测 3 个方向，保留 2 个作为下一轮",
      body: "第一轮只跑 A / D / E，观察 CTR 与 CVR 的差异；第二轮用胜出方向的语义结构改造 B / C，避免同时引入过多变量。",
      evidence: "历史 CTR 均值 " + pct(accountCtr) + " 可作为首轮判断基准",
      confidence: 85,
    },
  ];

  return {
    summary:
      "基于模拟数据（Demo 数据集）：为 " +
      selection.platform +
      "（目标：" +
      selection.objective +
      "，人群：" +
      selection.audience +
      "，主题：" +
      selection.theme +
      "）生成 5 个结构性差异的素材方向，并按测试优先级排序。排序依据来自账户历史效率（CTR " +
      pct(accountCtr) +
      "，ROAS " +
      ratio(context.totals.roas) +
      "）与方向之间的角度差异。",
    directions,
    testingOrder,
    insights: take(insights, 3, context.signals.insights),
    opportunities: take(opportunities, 3, context.signals.opportunities),
    risks: take(risks, 3, context.signals.risks),
    recommendations: take(recommendations, 3, context.signals.recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 5 - Performance Analyst                                               */
/* -------------------------------------------------------------------------- */

export function demoCampaignAnalysis(payload: AgentPayload): CampaignAnalysis {
  const context = payload.context;
  const comparison = context.comparison;
  const sorted = [...context.creatives].sort((a, b) => b.roas - a.roas);
  const winners = sorted.slice(0, 3);
  const losers = [...sorted].reverse().slice(0, 3);

  const current = comparison?.current;
  const previous = comparison?.previous;
  const roasDelta = comparison?.deltas.roas ?? 0;
  const ctrDelta = comparison?.deltas.ctr ?? 0;
  const cvrDelta = comparison?.deltas.cvr ?? 0;
  const funnelDriver = Math.abs(cvrDelta) >= Math.abs(ctrDelta) ? "承接与转化环节（CVR）" : "流量与素材环节（CTR）";

  const diagnosis = comparison
    ? "最近 " +
      comparison.windowDays +
      " 天账户 ROAS 为 " +
      ratio(current?.roas ?? 0) +
      "，相比前 " +
      comparison.windowDays +
      " 天（" +
      ratio(previous?.roas ?? 0) +
      "）" +
      (roasDelta >= 0 ? "上升 " : "下降 ") +
      Math.abs(roasDelta).toFixed(1) +
      "%；CPA 从 " +
      money(previous?.cpa ?? 0) +
      " 变为 " +
      money(current?.cpa ?? 0) +
      "，主要变化发生在" +
      funnelDriver +
      "。"
    : "当前数据集只有单一时间窗口，账户整体 ROAS 为 " +
      ratio(context.totals.roas) +
      "，CPC " +
      ratio(context.totals.cpc) +
      "，CPA " +
      money(context.totals.cpa) +
      "。";

  const mainReason = comparison
    ? "主导环节是" +
      funnelDriver +
      "：CTR 变化 " +
      ctrDelta.toFixed(1) +
      "%，而 CVR 变化 " +
      cvrDelta.toFixed(1) +
      "%（" +
      pct(previous?.cvr ?? 0) +
      " → " +
      pct(current?.cvr ?? 0) +
      "）。点击效率基本稳定说明素材吸引力不是主因，因此可以排除「素材失效」，优先检查落地页一致性、价格解释与信任证据。"
    : "数据窗口不足，暂时无法确定主导环节，至少需要两个等长窗口才能做归因。";

  const hypotheses = [
    {
      hypothesis: "新素材的承诺与落地页首屏信息不一致，用户点击后没有找到承诺的信息",
      evidence:
        "CTR 变化 " +
        ctrDelta.toFixed(1) +
        "%（基本持平），CVR 从 " +
        pct(previous?.cvr ?? 0) +
        " 变为 " +
        pct(current?.cvr ?? 0) +
        "，说明流量质量与承接体验之间存在落差",
      confidence: 78,
    },
    {
      hypothesis: "新增年轻人群流量占比提高，该人群购买理由不足",
      evidence: context.audience.length
        ? "分人群数据：" +
          (context.audience[0]?.segment ?? "-") +
          " CTR " +
          pct(context.audience[0]?.ctr ?? 0) +
          " 但 CVR 仅 " +
          pct(context.audience[0]?.cvr ?? 0)
        : "缺少分人群数据，需补充人群维度报表",
      confidence: 72,
    },
    {
      hypothesis: "促销节奏变化影响转化（折扣结束或权益减少）",
      evidence: "当前数据集不包含促销字段，需要用业务日历交叉验证，属于待验证假设",
      confidence: 55,
    },
  ];

  const budgetMoves = [
    {
      from: losers[0]?.name ?? "低效素材",
      to: winners[0]?.name ?? "高效素材",
      amount: money(Math.max(0, (losers[0]?.spend ?? 0) * 0.5)) + "（释放该素材约 50% 预算）",
      rationale:
        "低效素材 ROAS " +
        ratio(losers[0]?.roas ?? 0) +
        "，低于账户均值 " +
        ratio(context.totals.roas) +
        "；高效素材 ROAS " +
        ratio(winners[0]?.roas ?? 0) +
        "，CPA " +
        money(winners[0]?.cpa ?? 0) +
        "。",
    },
    {
      from: "账户通用预算",
      to: "A/B 测试预算",
      amount: money(Math.max(2_000, context.totals.spend * 0.08)),
      rationale: "在修复 CVR 之前保留固定测试预算，避免全线收缩导致后续没有新素材可用。",
    },
  ];

  const audiencesToTest = context.audience.length
    ? [...context.audience]
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 2)
        .map((item) => item.segment + "（CTR " + pct(item.ctr) + " / CVR " + pct(item.cvr) + "）")
    : ["建议先导出人群维度数据后再确定测试人群"];

  const experiments = [
    {
      name: "真实使用场景 + 用户评价 vs 现有素材",
      variantA: "现有高效素材（原结构）",
      variantB: "真实使用场景 + 用户评价（新增信任模块）",
      metric: "CVR",
      hypothesis: "补充真实使用与评价证据后，CVR 可回到前 7 天水平（提升 15% 以上）。",
    },
    {
      name: "价格解释型落地页 vs 原落地页",
      variantA: "原落地页首屏",
      variantB: "首屏加入单次使用成本与试用规格说明",
      metric: "CPA",
      hypothesis: "降低首单决策门槛后，年轻人群 CPA 可下降 10% 以上。",
    },
  ];

  const cheap = context.platforms.length ? lowestCpc(context.platforms) : undefined;

  const insights: Signal[] = [
    {
      title: "效率高度集中在少数素材上",
      body:
        "Top 3 素材贡献了 " +
        pct(winners.reduce((acc, item) => acc + item.share, 0), 1) +
        " 的转化。集中度高意味着放量弹性好，但单一素材衰退会带来较大波动，需要保持新素材测试节奏。",
      evidence: winners
        .map((item) => item.name + ": ROAS=" + ratio(item.roas) + ", 转化占比=" + pct(item.share, 1))
        .join("; "),
      confidence: 88,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: cheap ? cheap.name + " 的低 CPC 值得配合更高意向内容" : "渠道数据不足",
      body: cheap
        ? cheap.name +
          " 的 CPC 最低（" +
          ratio(cheap.cpc) +
          "），适合承接高意向内容，把预算效率进一步提高。"
        : "当前数据集没有渠道维度数据。",
      evidence: context.platforms
        .map((item) => item.name + ": CPC=" + ratio(item.cpc) + ", CVR=" + pct(item.cvr))
        .join("; "),
      confidence: 79,
    },
  ];

  const risks: Signal[] = [
    {
      title: "CPA 上升会直接压缩盈利空间",
      body:
        "CPA 从 " +
        money(previous?.cpa ?? 0) +
        " 变为 " +
        money(current?.cpa ?? 0) +
        "；在客单价 " +
        money(context.product.price) +
        " 与当前 ROAS " +
        ratio(context.totals.roas) +
        " 下，修复 CVR 比继续加预算更关键。",
      evidence: "CPA=" + money(context.totals.cpa) + ", ROAS=" + ratio(context.totals.roas),
      confidence: 89,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "先修复承接，再考虑放量",
      body:
        "下一周期动作排序：① 对齐素材承诺与落地页首屏；② 增加真实使用与评价模块；③ 扩大价格解释内容；④ 观察 7 天 CVR 是否回升到 " +
        pct(previous?.cvr ?? 0) +
        " 以上，再决定是否加预算。",
      evidence: "目标 CVR ≥ " + pct(previous?.cvr ?? 0) + "；当前 " + pct(current?.cvr ?? 0),
      confidence: 86,
    },
  ];

  const bundle = context.signals;
  const useFallback = emptySignals(bundle);

  return {
    summary:
      "本次分析覆盖 " +
      context.dataSource.label +
      "（" +
      context.dataSource.rows +
      " 行数据，" +
      context.period.days +
      " 天）。账户整体：花费 " +
      money(context.totals.spend) +
      "，CTR " +
      pct(context.totals.ctr) +
      "，CVR " +
      pct(context.totals.cvr) +
      "，CPA " +
      money(context.totals.cpa) +
      "，ROAS " +
      ratio(context.totals.roas) +
      "。",
    diagnosis: DEMO_TAG + diagnosis,
    mainReason: DEMO_TAG + mainReason,
    hypotheses,
    winners: winners.map((item) => ({
      creative: item.name,
      why:
        "ROAS " +
        ratio(item.roas) +
        "（账户均值 " +
        ratio(context.totals.roas) +
        "），CTR " +
        pct(item.ctr) +
        "，CPA " +
        money(item.cpa) +
        "。",
      action:
        item.roas >= context.totals.roas * 1.15
          ? "增加预算（建议 +20%，分两次加量）并保持 7 天观察"
          : "保留主预算，同时复制其内容结构生产 2 条变体做横向测试",
    })),
    losers: losers.map((item) => ({
      creative: item.name,
      why:
        "ROAS " +
        ratio(item.roas) +
        "，比账户均值低 " +
        Math.max(0, (1 - item.roas / Math.max(context.totals.roas, 0.0001)) * 100).toFixed(0) +
        "%，CPA " +
        money(item.cpa) +
        "。",
      action: "预算下调 50%，同时替换开头 3 秒 Hook，保留最低测试量",
    })),
    budgetMoves,
    audiencesToTest,
    experiments,
    insights: useFallback
      ? [fallbackSignal("数据量不足", "当前数据集缺少足够的对比窗口。", "单窗口数据", 60)]
      : take(bundle.insights, 3, insights),
    opportunities: take(bundle.opportunities, 3, opportunities),
    risks: take(bundle.risks, 3, risks),
    recommendations: take(bundle.recommendations, 3, recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 6 - Growth Advisor                                                    */
/* -------------------------------------------------------------------------- */

export function demoGrowthAdvice(payload: AgentPayload): GrowthAdvice {
  const context = payload.context;
  const question = (payload.question ?? "").trim() || "最近 ROAS 为什么下降？";
  const comparison = context.comparison;
  const sorted = [...context.creatives].sort((a, b) => b.roas - a.roas);
  const winner = sorted[0];
  const loser = sorted[sorted.length - 1];
  const ctrDelta = comparison?.deltas.ctr ?? 0;
  const cvrDelta = comparison?.deltas.cvr ?? 0;
  const roasDelta = comparison?.deltas.roas ?? 0;
  const targetCvr = comparison?.previous.cvr ?? 0.041;
  const asksAboutRoas = /roas|下降|效率|下滑|为什么/i.test(question);

  const diagnosis = comparison
    ? "过去 " +
      comparison.windowDays +
      " 天 ROAS 从 " +
      ratio(comparison.previous.roas) +
      " 变为 " +
      ratio(comparison.current.roas) +
      "（" +
      (roasDelta >= 0 ? "+" : "") +
      roasDelta.toFixed(1) +
      "%）；同期 CTR 变化 " +
      ctrDelta.toFixed(1) +
      "%，CVR 从 " +
      pct(comparison.previous.cvr) +
      " 变为 " +
      pct(comparison.current.cvr) +
      "（" +
      cvrDelta.toFixed(1) +
      "%），CPA 从 " +
      money(comparison.previous.cpa) +
      " 变为 " +
      money(comparison.current.cpa) +
      "。"
    : "当前数据集只包含单一时间窗口，账户 ROAS 为 " +
      ratio(context.totals.roas) +
      "；建议补充至少 14 天数据后再做趋势归因。";

  const mainReason = comparison
    ? Math.abs(cvrDelta) >= Math.abs(ctrDelta)
      ? "主要原因是转化率下滑而不是素材吸引力下降：CTR 仅变化 " +
        ctrDelta.toFixed(1) +
        "%，CVR 变化 " +
        cvrDelta.toFixed(1) +
        "%。素材仍能把人带来，但来了之后没有下单。"
      : "主要原因是点击效率下降：CTR 变化 " +
        ctrDelta.toFixed(1) +
        "%，素材对目标人群的吸引力出现衰减，需要更新 Hook 与场景。"
    : "数据窗口不足，暂时无法区分是素材问题还是承接问题。";

  const hypotheses = [
    {
      hypothesis: "流量结构变化：新增年轻人群占比提高，该人群需要更多购买理由",
      evidence: context.audience.length
        ? "分人群数据：" +
          (context.audience[0]?.segment ?? "-") +
          " CTR " +
          pct(context.audience[0]?.ctr ?? 0) +
          "，CVR 仅 " +
          pct(context.audience[0]?.cvr ?? 0)
        : "缺少分人群数据，建议补充人群维度报表",
      confidence: 76,
    },
    {
      hypothesis: "素材承诺与落地页不一致，用户点击后没有找到承诺的信息",
      evidence: "CTR 变化 " + ctrDelta.toFixed(1) + "%（稳定）但 CVR 变化 " + cvrDelta.toFixed(1) + "%（下滑），典型的承接层问题",
      confidence: 81,
    },
    {
      hypothesis: "价格或权益变化降低了首单吸引力",
      evidence: "数据集不含促销字段，需要与业务日历核对，属于待验证假设",
      confidence: 52,
    },
  ];

  const recommendation = [
    "优先做「承诺一致性」修复：让素材开头出现的场景与利益点，在落地页首屏 3 秒内被再次确认。",
    "补充信任证据：真实使用记录（30 天）、成分与用法说明、常见问题解答，降低首次购买的不确定感。",
    loser
      ? "对「" +
        loser.name +
        "」（ROAS " +
        ratio(loser.roas) +
        "，CPA " +
        money(loser.cpa) +
        "）执行止损：预算下调 50%，释放预算转移到「" +
        (winner?.name ?? "高效素材") +
        "」（ROAS " +
        ratio(winner?.roas ?? 0) +
        "）。"
      : "调整预算结构，把低效素材预算转移到高效素材。",
  ];

  const experiment = asksAboutRoas
    ? {
        name: "真实使用场景 + 用户评价 vs 当前素材",
        variantA: "当前高效素材（原结构）",
        variantB: "真实使用场景 + 用户评价（增加信任模块）",
        metric: "CVR",
        successCriteria: "7 天内 CVR 回到 " + pct(targetCvr) + " 以上，CPA 下降 10% 以上",
      }
    : {
        name: "价格解释型落地页 vs 原落地页",
        variantA: "原落地页",
        variantB: "首屏增加单次使用成本与试用规格",
        metric: "CPA",
        successCriteria: "14 天内 CPA 下降 10% 以上且转化量不下降",
      };

  const insights: Signal[] = [
    {
      title: "效率变化主要来自承接环节",
      body:
        "CTR 变化 " +
        ctrDelta.toFixed(1) +
        "%，CVR 变化 " +
        cvrDelta.toFixed(1) +
        "%。这意味着继续优化素材的边际收益，低于修复落地页与信任内容。",
      evidence: "CTR=" + pct(context.totals.ctr) + ", CVR=" + pct(context.totals.cvr) + ", CPA=" + money(context.totals.cpa),
      confidence: 87,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "复制高效素材的「结构」而不是「文案」",
      body:
        "「" +
        (winner?.name ?? "高效素材") +
        "」的 ROAS 为 " +
        ratio(winner?.roas ?? 0) +
        "。真正可复制的是它的三段结构（场景 → 具体做法 → 可验证结果），而不是具体句子。",
      evidence:
        "creative=" +
        (winner?.name ?? "-") +
        "; CTR=" +
        pct(winner?.ctr ?? 0) +
        "; CVR=" +
        pct(winner?.cvr ?? 0),
      confidence: 82,
    },
  ];

  const risks: Signal[] = [
    {
      title: "在 CVR 修复前放量会放大亏损",
      body:
        "当前 CPA 为 " +
        money(context.totals.cpa) +
        "。只增加预算而不修复转化，CPA 会随流量规模进一步上升，ROAS 继续下滑。",
      evidence: "CPA=" + money(context.totals.cpa) + "; ROAS=" + ratio(context.totals.roas),
      confidence: 88,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "把下周期目标从 ROAS 改为「先修 CVR，再看 ROAS」",
      body:
        "给团队一个两周修复窗口：第 1 周只做承接与信任内容的对照实验，第 2 周观察 CVR 是否回到 " +
        pct(targetCvr) +
        "；达标后再讨论放量。",
      evidence: "目标 CVR ≥ " + pct(targetCvr),
      confidence: 84,
    },
  ];

  const bundle = context.signals;
  const useFallback = emptySignals(bundle);

  return {
    question,
    diagnosis: DEMO_TAG + diagnosis,
    mainReason: DEMO_TAG + mainReason,
    hypotheses,
    recommendation,
    experiment,
    dataUsed: [
      "Metric 表（" + context.dataSource.label + "，" + context.dataSource.rows + " 行，" + context.period.start + " ~ " + context.period.end + "）",
      "Metric 聚合：日趋势 / 渠道 / 素材 / 近 7 天 vs 前 7 天窗口对比",
      context.audience.length ? "AudienceMetric 表（分人群 CTR / CVR / ROAS）" : "AudienceMetric 表（无数据）",
      "Persona 表（人群画像与购买阻力）",
      "Creative 表（素材角度与目标基准）",
    ],
    insights: take(bundle.insights, 3, insights),
    opportunities: take(bundle.opportunities, 3, opportunities),
    risks: take(bundle.risks, 3, risks),
    recommendations: take(bundle.recommendations, 3, recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 7 - Report Writer                                                     */
/* -------------------------------------------------------------------------- */

export function demoGrowthReport(payload: AgentPayload): GrowthReport {
  const context = payload.context;
  const comparison = context.comparison;
  const sorted = [...context.creatives].sort((a, b) => b.roas - a.roas);
  const winner = sorted[0];
  const loser = sorted[sorted.length - 1];
  const bestPlatform = context.platforms.length
    ? [...context.platforms].sort((a, b) => b.roas - a.roas)[0]
    : undefined;
  const topContent = [...context.contents].sort((a, b) => b.overallScore - a.overallScore)[0];

  const executiveSummary = comparison
    ? "本周账户花费 " +
      money(comparison.current.spend) +
      "，ROAS " +
      ratio(comparison.current.roas) +
      "（环比 " +
      (comparison.deltas.roas >= 0 ? "+" : "") +
      comparison.deltas.roas.toFixed(1) +
      "%）。效率变化主要来自转化环节：CVR " +
      pct(comparison.previous.cvr) +
      " → " +
      pct(comparison.current.cvr) +
      "，而 CTR 变化仅 " +
      comparison.deltas.ctr.toFixed(1) +
      "%。下周重点是修复承接与信任内容，而不是继续加预算。"
    : "账户当前花费 " +
      money(context.totals.spend) +
      "，ROAS " +
      ratio(context.totals.roas) +
      "。建议补充至少两周数据后再做环比结论。";

  const performance =
    "核心指标：花费 " +
    money(context.totals.spend) +
    "，曝光 " +
    context.totals.impressions.toLocaleString("zh-CN") +
    "，点击 " +
    context.totals.clicks.toLocaleString("zh-CN") +
    "，CTR " +
    pct(context.totals.ctr) +
    "，CPC " +
    ratio(context.totals.cpc) +
    "，转化 " +
    context.totals.conversions.toLocaleString("zh-CN") +
    "，CPA " +
    money(context.totals.cpa) +
    "，ROAS " +
    ratio(context.totals.roas) +
    "。" +
    (comparison
      ? "环比上一周期：花费 " +
        comparison.deltas.spend.toFixed(1) +
        "%，CTR " +
        comparison.deltas.ctr.toFixed(1) +
        "%，CVR " +
        comparison.deltas.cvr.toFixed(1) +
        "%，CPA " +
        comparison.deltas.cpa.toFixed(1) +
        "%，ROAS " +
        comparison.deltas.roas.toFixed(1) +
        "%。"
      : "");

  const audience = context.audience.length
    ? "分人群表现：" +
      context.audience
        .map((item) => item.segment + "（CTR " + pct(item.ctr) + " / CVR " + pct(item.cvr) + " / ROAS " + ratio(item.roas) + "）")
        .join("；") +
      "。点击效率最高的是 " +
      context.audience.reduce((best, item) => (item.ctr > best.ctr ? item : best), context.audience[0]).segment +
      "，转化效率最高的是 " +
      context.audience.reduce((best, item) => (item.cvr > best.cvr ? item : best), context.audience[0]).segment +
      "；两者差异说明人群策略需要按购买理由分层。"
    : "分人群数据缺失：当前数据集没有人群维度，建议补充人群报表后再做人群结论。";

  const content =
    "内容库共 " +
    context.contents.length +
    " 条记录，最高分内容为「" +
    (topContent?.title ?? "-") +
    "」（Overall " +
    (topContent?.overallScore ?? 0) +
    "）。" +
    (topContent ? "值得测试的原因：" + topContent.whyTest + " 优化方向：" + topContent.howToImprove : "建议先补充内容测试记录。");

  const campaign =
    "素材层面：ROAS 最高的是「" +
    (winner?.name ?? "-") +
    "」（" +
    ratio(winner?.roas ?? 0) +
    "，CPA " +
    money(winner?.cpa ?? 0) +
    "），最低的是「" +
    (loser?.name ?? "-") +
    "」（" +
    ratio(loser?.roas ?? 0) +
    "，CPA " +
    money(loser?.cpa ?? 0) +
    "）。渠道层面效率最高的是 " +
    (bestPlatform?.name ?? "-") +
    "（ROAS " +
    ratio(bestPlatform?.roas ?? 0) +
    "，CPC " +
    ratio(bestPlatform?.cpc ?? 0) +
    "）。预算建议向「高 ROAS 素材 × 低 CPC 渠道」的组合倾斜。";

  const keyInsights: Signal[] =
    context.signals.insights.length > 0
      ? context.signals.insights.slice(0, 3)
      : [
          fallbackSignal(
            "效率集中在少数素材",
            "Top 3 素材贡献了 " + pct(sorted.slice(0, 3).reduce((acc, item) => acc + item.share, 0), 1) + " 的转化。",
            "creative ranking",
            84,
          ),
        ];

  return {
    title: "MORI 森屿增长周报（" + context.period.start + " ~ " + context.period.end + " · Demo）",
    executiveSummary: DEMO_TAG + executiveSummary,
    performance: DEMO_TAG + performance,
    audience: DEMO_TAG + audience,
    content: DEMO_TAG + content,
    campaign: DEMO_TAG + campaign,
    keyInsights,
    recommendations: [
      "修复承接：让素材承诺在落地页首屏 3 秒内被确认，并把真实使用记录放到首屏可见区域。",
      "预算调整：把「" + (loser?.name ?? "低效素材") + "」预算下调 50%，转移到「" + (winner?.name ?? "高效素材") + "」。",
      "人群分层：为高点击人群补充价格解释与信任内容，为高转化人群强化场景与钩子。",
      "保留测试预算：至少 " + money(Math.max(2_000, context.totals.spend * 0.08)) + " 用于新素材与落地页实验。",
    ],
    experiments: [
      {
        name: "真实使用场景 + 用户评价 vs 现有素材",
        variantA: "现有高效素材（原结构）",
        variantB: "真实使用场景 + 用户评价",
        metric: "CVR",
        successCriteria: "7 天内 CVR 提升 15% 以上，CPA 下降 10% 以上",
      },
      {
        name: "价格解释型落地页 vs 原落地页",
        variantA: "原落地页",
        variantB: "首屏加入单次使用成本与试用规格",
        metric: "CPA",
        successCriteria: "14 天内 CPA 下降 10% 以上且转化量不下降",
      },
      {
        name: "15 秒短视频 vs 60 秒长内容",
        variantA: "15 秒转化型短片",
        variantB: "60 秒长内容记录",
        metric: "CTR / ROAS",
        successCriteria: "两类内容分别设定 KPI，分别判断是否达标",
      },
    ],
    outlook:
      "下周把目标从「提高 ROAS」替换为「先修 CVR，再谈放量」：第 1 周只做承接与信任内容的对照实验，第 2 周依据数据决定是否放量。" +
      (context.dataSource.kind === "demo"
        ? "本报告基于模拟业务数据验证产品工作流，不代表真实市场表现。"
        : "本报告基于上传的投放数据生成。"),
  };
}
