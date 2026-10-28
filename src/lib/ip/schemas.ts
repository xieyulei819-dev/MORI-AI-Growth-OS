import { z } from "zod";

/**
 * IP 智能选题 Agent —— 6 个逻辑 Agent 的结构化输出契约。
 *
 * 与 MORI 主体一致：模型只被允许输出符合 JSON Schema 的对象，前端负责渲染，
 * 校验失败 / 调用失败都会被 runner 捕获并回退到本地 Demo 引擎。
 *
 * 事实性标注：凡涉及热点、政策、市场数据、人物/公司信息，必须带 label
 * （事实 / AI推测 / 需要进一步验证）与来源（没有可靠来源就写 AI推测）。
 */

export type IpAgentId =
  | "ip_analyst"
  | "ip_trend_researcher"
  | "ip_topic_strategist"
  | "ip_script_writer"
  | "ip_shot_planner"
  | "ip_content_planner";

export const FACT_LABELS = ["事实", "AI推测", "需要进一步验证"] as const;
export const factLabelSchema = z.enum(FACT_LABELS);

export const TOPIC_TYPES = [
  "干货",
  "避坑",
  "观点",
  "故事",
  "热点",
  "反常识",
  "行业内幕",
  "用户问题",
  "对比",
  "案例",
] as const;
export const topicTypeSchema = z.enum(TOPIC_TYPES);

export const TITLE_TYPES = ["信息型", "冲突型", "好奇型", "避坑型", "观点型"] as const;
export const titleTypeSchema = z.enum(TITLE_TYPES);

/** 与 MORI 主体一致的结论卡片：每条结论都要有依据与置信度。 */
export const ipSignalSchema = z.object({
  title: z.string().describe("必填。结论标题，一句话"),
  body: z.string().describe("必填。结论正文 2-3 句，能落地、别空话"),
  evidence: z.string().describe("必填。依据（引用输入信息或标注为 AI 推测），不得留空"),
  confidence: z.number().min(0).max(100).describe("必填。置信度 0-100 的整数"),
});

const signalBundleShape = {
  insights: z.array(ipSignalSchema),
  opportunities: z.array(ipSignalSchema),
  risks: z.array(ipSignalSchema),
  recommendations: z.array(ipSignalSchema),
};

const scoreField = z.number().min(0).max(100).describe("必填。0-100 的整数");

export const topicScoresSchema = z.object({
  hotspot: scoreField,
  pain: scoreField,
  ipFit: scoreField,
  differentiation: scoreField,
  spread: scoreField,
  commercial: scoreField,
});

/* -------------------------------------------------------------------------- */
/* 1. IP Analyst                                                               */
/* -------------------------------------------------------------------------- */

export const IpAnalysisSchema = z.object({
  summary: z.string().describe("必填。对 IP 的整体判断，2-3 句，信息不足要说明这是推测"),
  industryGuess: z.object({
    value: z.string().describe("必填。推测的行业，例如「房产经纪」；不确定写「通用」"),
    confidence: z.number().min(0).max(100).describe("必填。0-100"),
    label: factLabelSchema.describe("必填。事实 / AI推测 / 需要进一步验证"),
    basis: z.string().describe("必填。判断依据；没有依据就写「仅凭 IP 名称推测」"),
  }),
  cityGuess: z.object({
    value: z.string().describe("必填。推测的城市；不确定写「未提供」"),
    confidence: z.number().min(0).max(100).describe("必填。0-100"),
    label: factLabelSchema.describe("必填。事实 / AI推测 / 需要进一步验证"),
    basis: z.string().describe("必填。判断依据"),
  }),
  identity: z.string().describe("必填。这个 IP 的人物身份，例如「本地房产门店经营者」"),
  domain: z.string().describe("必填。所在领域"),
  overallConfidence: z.number().min(0).max(100).describe("必填。0-100，信息越少越低"),
  targetAudiences: z.array(
    z.object({
      name: z.string().describe("必填。人群名称"),
      whyFollow: z.string().describe("必填。这群人为什么会关注这个 IP"),
      contentNeed: z.string().describe("必填。他们最想看的内容"),
      label: factLabelSchema.describe("必填。事实 / AI推测 / 需要进一步验证"),
    }),
  ).describe("必填，2-4 个人群"),
  followReasons: z.array(z.string()).describe("必填，至少 3 条；无内容返回 []"),
  contentStrengths: z.array(z.string()).describe("必填，至少 3 条；无内容返回 []"),
  trustDirections: z.array(z.string()).describe("必填，至少 3 条：容易建立信任的内容方向；无内容返回 []"),
  interactionDirections: z.array(z.string()).describe("必填，至少 3 条：容易产生互动的方向；无内容返回 []"),
  conversionDirections: z.array(z.string()).describe("必填，至少 2 条：可能带来商业转化的方向；无内容返回 []"),
  inferences: z.array(
    z.object({
      statement: z.string().describe("必填。一条推测"),
      basis: z.string().describe("必填。推测依据"),
      confidence: z.number().min(0).max(100).describe("必填。0-100"),
      label: factLabelSchema.describe("必填。事实 / AI推测 / 需要进一步验证"),
    }),
  ).describe("必填，至少 3 条推测；无内容返回 []"),
  missingInfo: z.array(z.string()).describe("必填，至少 2 条「需要补充的信息」；无内容返回 []"),
  cautions: z.array(z.string()).describe("必填，至少 1 条风险提醒（合规 / 事实性）；无内容返回 []"),
  ...signalBundleShape,
});

/* -------------------------------------------------------------------------- */
/* 2. Trend Researcher                                                         */
/* -------------------------------------------------------------------------- */

const trendItemSchema = z.object({
  title: z.string().describe("必填。热点 / 事件 / 政策标题"),
  summary: z.string().describe("必填。一句话说明它是什么"),
  whyRelevant: z.string().describe("必填。对这个 IP 为什么相关；不相关写「相关性一般」"),
  label: factLabelSchema.describe("必填。有可靠来源写「事实」；只有模型判断写「AI推测」"),
  sourceTitle: z.string().describe("必填。来源标题；没有来源写「无来源」"),
  sourceUrl: z.string().describe("必填。来源链接；没有来源写空字符串"),
});

export const TrendResearchSchema = z.object({
  searchedQueries: z.array(z.string()).describe("必填，本次实际使用的搜索词；无搜索时返回 []"),
  searchPerformed: z.boolean().describe("必填。是否真的执行了联网搜索"),
  reliabilityNote: z.string().describe(
    "必填。若没有可靠的最新信息，必须写「当前没有找到足够可靠的热点信息。」；有则说明来源与时效",
  ),
  hotTopics: z.array(trendItemSchema).describe("必填。行业/社会热点，可为 []（不要编造）"),
  userPainPoints: z.array(
    z.object({
      pain: z.string().describe("必填。用户痛点"),
      evidence: z.string().describe("必填。依据"),
      label: factLabelSchema.describe("必填。事实 / AI推测 / 需要进一步验证"),
      sourceTitle: z.string().describe("必填。来源标题，无来源写「无来源」"),
      sourceUrl: z.string().describe("必填。来源链接，无来源写空字符串"),
    }),
  ).describe("必填，至少 3 条痛点；无内容返回 []"),
  policyChanges: z.array(trendItemSchema).describe("必填。政策/规则变化，无内容返回 []"),
  contradictions: z.array(trendItemSchema).describe("必填。行业争议，无内容返回 []"),
  peerTopics: z.array(trendItemSchema).describe("必填。同行热门选题，无内容返回 []"),
  ipEvents: z.array(trendItemSchema).describe("必填。与该 IP 相关的近期事件，无内容返回 []"),
  ...signalBundleShape,
});

/* -------------------------------------------------------------------------- */
/* 3. Topic Strategist                                                         */
/* -------------------------------------------------------------------------- */

export const topicItemSchema = z.object({
  title: z.string().describe("必填。选题标题"),
  topicType: topicTypeSchema.describe("必填。选题类型"),
  painPoint: z.string().describe("必填。核心用户痛点：用户为什么想看"),
  value: z.string().describe("必填。内容价值：帮用户解决什么"),
  hook: z.string().describe("必填。视频前 3 秒要说的话"),
  creative: z.string().describe("必填。内容创意：这条视频具体怎么拍"),
  scores: topicScoresSchema.describe("必填。6 个维度都要给 0-100 的分"),
  scoreBasis: z.object({
    hotspot: z.string().describe("必填。热点相关性评分依据"),
    pain: z.string().describe("必填。用户痛点评分依据"),
    ipFit: z.string().describe("必填。IP 匹配度评分依据"),
    differentiation: z.string().describe("必填。内容差异化评分依据"),
    spread: z.string().describe("必填。传播潜力评分依据"),
    commercial: z.string().describe("必填。商业价值评分依据"),
  }).describe("必填。每个维度都要说明评分依据，不能只给数字"),
  potentialStars: z.number().min(1).max(5).describe("必填。预估传播潜力 1-5 星（整数）"),
  potentialReason: z.string().describe("必填。星级依据，禁止写「一定爆」"),
  recommendReason: z.string().describe("必填。这个选题为什么值得做，1-2 句"),
});

export const TopicStrategySchema = z.object({
  summary: z.string().describe("必填。选题池整体思路，1-2 句"),
  topics: z.array(topicItemSchema).describe("必填，至少 10 个选题；每个选题所有字段都必须出现"),
  top5: z.array(
    z.object({
      title: z.string().describe("必填。必须是 topics 里出现过的标题"),
      reason: z.string().describe("必填。为什么推荐它进 TOP 5"),
    }),
  ).describe("必填，5 个 TOP 推荐选题"),
  contentRatio: z.array(
    z.object({
      bucket: z.string().describe("必填。内容类型，如「用户痛点」"),
      percent: z.number().min(0).max(100).describe("必填。占比 0-100"),
    }),
  ).describe("必填，4-6 条内容配比建议"),
  ...signalBundleShape,
});

/* -------------------------------------------------------------------------- */
/* 4. Script Writer                                                            */
/* -------------------------------------------------------------------------- */

const spokenLineSchema = z.object({
  section: z.string().describe("必填。段落名：Hook / 问题 / 观点 / 案例 / 结论 / CTA"),
  text: z.string().describe("必填。这一段的真实口播句（不要写成书面文章）"),
});

const scriptVersionSchema = z.object({
  duration: z.number().describe("必填。时长秒数，例如 30 / 60 / 90"),
  hook: z.string().describe("必填。该版本开头"),
  lines: z.array(spokenLineSchema).describe("必填，4-6 段"),
  cta: z.string().describe("必填。行动引导"),
});

export const ScriptBundleSchema = z.object({
  theme: z.string().describe("必填。视频主题，例如《在伊宁买房，千万别只看房价》"),
  coreIdea: z.string().describe("必填。核心观点，一句话说清楚这条视频想表达什么"),
  targetAudience: z.array(z.string()).describe("必填，至少 2 类目标观众；无内容返回 []"),
  hooks: z.array(
    z.object({
      version: z.string().describe("必填。版本号 A / B / C"),
      text: z.string().describe("必填。3 秒 Hook 原文"),
      why: z.string().describe("必填。这个 Hook 为什么有效"),
    }),
  ).describe("必填，至少 3 个 Hook 版本"),
  scripts: z.object({
    s30: scriptVersionSchema.describe("必填。30 秒版本"),
    s60: scriptVersionSchema.describe("必填。60 秒版本"),
    s90: scriptVersionSchema.describe("必填。90 秒版本"),
  }).describe("必填。三个版本都要有"),
  titles: z.array(
    z.object({
      type: titleTypeSchema.describe("必填。信息型 / 冲突型 / 好奇型 / 避坑型 / 观点型"),
      title: z.string().describe("必填。标题原文"),
    }),
  ).describe("必填，至少 10 个标题；无内容返回 []"),
  covers: z.array(z.string()).describe("必填，至少 5 个封面文案；无内容返回 []"),
  commentPrompts: z.array(z.string()).describe("必填，至少 5 条评论区引导；无内容返回 []"),
  ...signalBundleShape,
});

/* -------------------------------------------------------------------------- */
/* 5. Shot Planner                                                             */
/* -------------------------------------------------------------------------- */

export const ShotPlanSchema = z.object({
  theme: z.string().describe("必填。与视频主题一致"),
  shotList: z.array(
    z.object({
      time: z.string().describe("必填。时间区间，如 0-3s"),
      scene: z.string().describe("必填。画面"),
      action: z.string().describe("必填。人物动作"),
      voiceover: z.string().describe("必填。口播内容"),
      subtitle: z.string().describe("必填。字幕"),
    }),
  ).describe("必填，至少 4 个镜头；无内容返回 []"),
  mustShoot: z.array(z.string()).describe("必填，至少 5 条今天必拍内容；无内容返回 []"),
  optional: z.array(z.string()).describe("必填。可选镜头，无内容返回 []"),
  equipment: z.array(z.string()).describe("必填。需要的设备，无内容返回 []"),
  props: z.array(z.string()).describe("必填。需要的道具，无内容返回 []"),
  tips: z.array(z.string()).describe("必填，至少 2 条拍摄提示；无内容返回 []"),
  ...signalBundleShape,
});

/* -------------------------------------------------------------------------- */
/* 6. Content Planner                                                          */
/* -------------------------------------------------------------------------- */

export const ContentPlanSchema = z.object({
  summary: z.string().describe("必填。整体内容策略，1-2 句"),
  matrix: z.array(
    z.object({
      column: z.string().describe("必填。栏目名，如「买房避坑」"),
      positioning: z.string().describe("必填。栏目定位"),
      targetUser: z.string().describe("必填。目标用户"),
      videoForm: z.string().describe("必填。适合的视频形式"),
      topics: z.array(z.string()).describe("必填，10 个可持续选题"),
    }),
  ).describe("必填，4-6 个栏目；无内容返回 []"),
  sevenDay: z.array(
    z.object({
      day: z.string().describe("必填。Day 1 ... Day 7"),
      bucket: z.string().describe("必填。用户痛点 / 专业干货 / 故事案例 / 热点 / 个人 IP 观点"),
      theme: z.string().describe("必填。当天主题"),
      hook: z.string().describe("必填。当天 Hook"),
      form: z.string().describe("必填。视频形式"),
      note: z.string().describe("必填。为什么这样安排，1 句"),
    }),
  ).describe("必填，7 天，每天都要有；无内容返回 []"),
  ratio: z.array(
    z.object({
      bucket: z.string().describe("必填。内容类型"),
      percent: z.number().min(0).max(100).describe("必填。占比 0-100"),
    }),
  ).describe("必填。内容比例控制，7 天不能全是同一种内容"),
  ...signalBundleShape,
});

export type IpAnalysis = z.infer<typeof IpAnalysisSchema>;
export type TrendResearch = z.infer<typeof TrendResearchSchema>;
export type TopicStrategy = z.infer<typeof TopicStrategySchema>;
export type TopicItem = z.infer<typeof topicItemSchema>;
export type ScriptBundle = z.infer<typeof ScriptBundleSchema>;
export type ShotPlan = z.infer<typeof ShotPlanSchema>;
export type ContentPlan = z.infer<typeof ContentPlanSchema>;

export type IpAgentOutputMap = {
  ip_analyst: IpAnalysis;
  ip_trend_researcher: TrendResearch;
  ip_topic_strategist: TopicStrategy;
  ip_script_writer: ScriptBundle;
  ip_shot_planner: ShotPlan;
  ip_content_planner: ContentPlan;
};

export const IP_AGENT_SCHEMAS: Record<IpAgentId, z.ZodTypeAny> = {
  ip_analyst: IpAnalysisSchema,
  ip_trend_researcher: TrendResearchSchema,
  ip_topic_strategist: TopicStrategySchema,
  ip_script_writer: ScriptBundleSchema,
  ip_shot_planner: ShotPlanSchema,
  ip_content_planner: ContentPlanSchema,
};
