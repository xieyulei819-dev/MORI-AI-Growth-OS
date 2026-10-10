import { z } from "zod";

import type { AgentId } from "@/types";

/**
 * Structured output contracts for every agent.
 *
 * The same zod objects are used for (1) generating the JSON Schema sent to the
 * provider, and (2) validating whatever comes back. Invalid or malformed model
 * output can therefore never reach the UI.
 */

export const signalSchema = z.object({
  title: z.string().describe("必填。结论标题，一句话，不要省略"),
  body: z.string().describe(
    "必填。结论文本，2-3 句，含具体数字。涉及实验或提升幅度时，必须写成「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」，禁止写成已完成实验/已验证/实际提升 X%",
  ),
  evidence: z.string().describe(
    "必填。支撑结论的具体指标或字段（例如 CTR=1.77%, ROAS=3.12），不要留空；若引用实验，请标注为 Demo 数据集",
  ),
  confidence: z.number().min(0).max(100).describe("必填。置信度，0-100 的整数"),
});

const signalBundleShape = {
  insights: z.array(signalSchema),
  opportunities: z.array(signalSchema),
  risks: z.array(signalSchema),
  recommendations: z.array(signalSchema),
};

export const MarketAnalysisSchema = z.object({
  summary: z.string(),
  competitiveGaps: z.array(
    z.object({
      name: z.string().describe("必填。市场空白名称"),
      gap: z.string().describe("必填。空白点说明，2-3 句"),
      evidence: z.string().describe("必填。依据，引用具体竞品字段"),
    }),
  ),
  positioningAdvice: z.string().describe("必填。一句话定位建议：占哪个位置、不去哪个区间竞争"),
  ...signalBundleShape,
});

export const AudienceAnalysisSchema = z.object({
  summary: z.string(),
  personas: z.array(
    z.object({
      name: z.string(),
      segment: z.string(),
      painPoints: z.array(z.string()),
      motivations: z.array(z.string()),
      barriers: z.array(z.string()),
      contentPreferences: z.array(z.string()),
    }),
  ),
  /**
   * Four opportunity cards shown on the Audience page:
   * 用户机会 / 内容机会 / 产品机会 / 广告机会
   */
  opportunityCards: z.object({
    user: z.array(z.string()).describe("必填。用户机会，至少 1 条；无内容时返回 []"),
    content: z.array(z.string()).describe("必填。内容机会，至少 1 条；无内容时返回 []"),
    product: z.array(z.string()).describe("必填。产品机会，至少 1 条；无内容时返回 []"),
    ad: z.array(z.string()).describe("必填。广告机会，至少 1 条；无内容时返回 []"),
  }).describe("四张机会卡片：user/content/product/ad 四个数组都必须出现"),
  adAngles: z.array(
    z.object({
      angle: z.string().describe("必填。广告角度名"),
      hook: z.string().describe("必填。可直接使用的开场 Hook"),
      audience: z.string().describe("必填。目标人群"),
      rationale: z.string().describe("必填。为什么这个角度对该人群有效"),
    }),
  ),
  ...signalBundleShape,
});

export const ContentStrategySchema = z.object({
  summary: z.string(),
  xiaohongshu: z.object({
    titles: z.array(
      z.object({
        title: z.string().describe("必填。标题本身"),
        angle: z.string().describe("必填。标题角度，如「质疑式提问」"),
        whyItWorks: z.string().describe("必填。为什么有效，1 句"),
      }),
    ).describe("必填。5 个标题，每个都必须有 title/angle/whyItWorks"),
    body: z.string().describe("必填。正文 150-260 字，段落用 \\n\\n 分隔"),
  }).describe("小红书内容：titles 与 body 均为必填"),
  douyin: z.object({
    hook: z.string().describe("必填。0-3 秒开场台词"),
    caption: z.string().describe("必填。视频文案，不要省略"),
    script: z.array(
      z.object({
        timeRange: z.string().describe("必填。时间区间，如 0–3s"),
        section: z.string().describe("必填。段落名：Hook / 痛点 / 解决方案 / CTA"),
        content: z.string().describe("必填。该段台词或画面描述"),
      }),
    ).describe("必填。4 个时间轴段落，缺一段都会校验失败"),
  }).describe("抖音 15 秒脚本：hook/caption/script 均必填"),
  scores: z.object({
    hookScore: z.number().min(0).max(100).describe("必填。Hook 抓取能力，0-100 数字"),
    relevanceScore: z.number().min(0).max(100).describe("必填。相关性，0-100 数字"),
    conversionScore: z.number().min(0).max(100).describe("必填。转化潜力，0-100 数字"),
    brandFitScore: z.number().min(0).max(100).describe("必填。品牌契合度，0-100 数字"),
    overallScore: z.number().min(0).max(100).describe("必填。综合分，0-100 数字"),
    whyTest: z.string().describe("必填。为什么值得测试，1-2 句，引用指标或人群依据；不得为空字符串"),
    howToImprove: z.string().describe(
      "必填。怎么进一步优化，1-2 句，必须具体到改哪一句/加什么模块（例如：把第 3-8 秒痛点加入具体时间与动作）。不得为空字符串，不得省略该字段",
    ),
  }).describe(
    "内容评分模块：7 个字段全部必填 —— hookScore/relevanceScore/conversionScore/brandFitScore/overallScore/whyTest/howToImprove 一个都不能少",
  ),
  keywords: z.array(z.string()).describe("必填。关键词数组，至少 3 个；无内容时返回 []"),
  ...signalBundleShape,
});

export const CreativeDirectionsSchema = z.object({
  summary: z.string(),
  directions: z.array(
    z.object({
      code: z.string().describe("必填。方向编号 A-E"),
      angle: z.string().describe("必填。角度名"),
      hook: z.string().describe("必填。开场 3 秒台词"),
      script: z.array(
        z.object({
          timeRange: z.string().describe("必填。时间区间"),
          section: z.string().describe("必填。段落名"),
          content: z.string().describe("必填。该段内容"),
        }),
      ).describe("必填。时间轴脚本，4 段"),
      cta: z.string().describe("必填。行动号召"),
      audience: z.string().describe("必填。目标人群"),
      priorityScore: z.number().min(0).max(100).describe("必填。测试优先级 0-100 数字，越高越先测"),
      rationale: z.string().describe("必填。为什么给它这个优先级"),
    }),
  ).describe("必填。5 个素材方向（A-E），每个方向的全部字段都必须出现"),
  testingOrder: z.array(z.string()).describe("必填。建议测试顺序，至少 3 条；无内容时返回 []"),
  ...signalBundleShape,
});

export const CampaignAnalysisSchema = z.object({
  summary: z.string().describe("必填。概述，须标明数据口径（Demo / 模拟业务数据）"),
  diagnosis: z.string().describe(
    "必填。一句话结论 + 具体数值，必须写成 Demo 口径（例如「Demo 数据显示近 7 天 ROAS 从 3.23 降到 2.73」），不得声称真实业绩",
  ),
  mainReason: z.string().describe("必填。主导原因与排除依据，仍须为 Demo / 模拟数据口径"),
  hypotheses: z.array(
    z.object({
      hypothesis: z.string(),
      evidence: z.string(),
      confidence: z.number().min(0).max(100),
    }),
  ),
  winners: z.array(
    z.object({
      creative: z.string(),
      why: z.string(),
      action: z.string(),
    }),
  ),
  losers: z.array(
    z.object({
      creative: z.string(),
      why: z.string(),
      action: z.string(),
    }),
  ),
  budgetMoves: z.array(
    z.object({
      from: z.string().describe("必填。从哪里调整预算"),
      to: z.string().describe("必填。预算转给谁"),
      amount: z.string().describe("必填。调整金额或比例描述，如「¥9,492 的 50%」"),
      rationale: z.string().describe("必填。调整依据，引用 ROAS/CPA 数字"),
    }),
  ).describe("必填。预算调整建议，至少 1 条"),
  audiencesToTest: z.array(z.string()).describe("必填。建议继续测试的人群，至少 1 条；无内容时返回 []"),
  experiments: z.array(
    z.object({
      name: z.string().describe("必填。实验名称"),
      variantA: z.string().describe("必填。A 变体说明"),
      variantB: z.string().describe("必填。B 变体说明"),
      metric: z.string().describe("必填。主指标，如 CVR / CPA / CTR"),
      hypothesis: z.string().describe(
        "必填。实验假设，写成「若在真实投放中测试…」而非已完成实验的结论；禁止「已验证/已完成」",
      ),
    }),
  ).describe("必填。下一轮实验建议，至少 2 条"),
  ...signalBundleShape,
});

export const GrowthAdviceSchema = z.object({
  question: z.string(),
  diagnosis: z.string().describe(
    "必填。必须写 Demo / 模拟数据口径（例如「Demo 数据显示…」），引用实验时写「模拟实验结果」",
  ),
  mainReason: z.string().describe("必填。主导原因与排除依据，保持 Demo 口径，不得声称真实投放结果"),
  hypotheses: z.array(
    z.object({
      hypothesis: z.string(),
      evidence: z.string(),
      confidence: z.number().min(0).max(100),
    }),
  ),
  recommendation: z.array(z.string()).describe(
    "必填。可执行动作；涉及实验或效果时写「基于模拟数据推演」「若在真实投放中…」，禁止已完成实验/实际提升 X%",
  ),
  experiment: z.object({
    name: z.string().describe("必填。实验名称"),
    variantA: z.string().describe("必填。A 变体"),
    variantB: z.string().describe("必填。B 变体"),
    metric: z.string().describe("必填。主指标"),
    successCriteria: z.string().describe(
      "必填。成功标准，含目标数值与时间窗（如「7 天内 CVR ≥ 3.96%」）；这是待验证的模拟实验假设，不得写成已完成的验证",
    ),
  }).describe("必填。至少 1 个可执行（待验证的）实验方案，不得表述为已完成的真实实验"),
  dataUsed: z.array(z.string()).describe("必填。本次回答使用的数据来源清单，至少 1 条；无内容时返回 []"),
  ...signalBundleShape,
});

export const GrowthReportSchema = z.object({
  title: z.string(),
  executiveSummary: z.string().describe("必填。首句必须标明数据口径：Demo / 模拟业务数据"),
  performance: z.string().describe("必填。只描述 Demo 数据集中计算出的指标，不得写成真实业务成绩"),
  audience: z.string().describe("必填。分人群结论须标注来自 Demo 数据集（模拟数据）"),
  content: z.string().describe("必填。内容结论须标明数据口径；引用实验时写「模拟实验结果」"),
  campaign: z.string().describe("必填。素材/渠道结论须标明 Demo 口径，禁止写“已验证/实际提升 X%”"),
  keyInsights: z.array(signalSchema).describe("必填。三条最重要洞察"),
  recommendations: z.array(z.string()).describe("必填。下一周建议，至少 3 条"),
  experiments: z.array(
    z.object({
      name: z.string().describe("必填。实验名称"),
      variantA: z.string().describe("必填。A 变体"),
      variantB: z.string().describe("必填。B 变体"),
      metric: z.string().describe("必填。主指标"),
      successCriteria: z.string().describe("必填。成功标准（含数值与时间窗）"),
    }),
  ).describe("必填。下周建议实验，至少 3 条"),
  outlook: z.string().describe("必填。下周展望与复盘节奏"),
});

export type MarketAnalysis = z.infer<typeof MarketAnalysisSchema>;
export type AudienceAnalysis = z.infer<typeof AudienceAnalysisSchema>;
export type ContentStrategy = z.infer<typeof ContentStrategySchema>;
export type CreativeDirections = z.infer<typeof CreativeDirectionsSchema>;
export type CampaignAnalysis = z.infer<typeof CampaignAnalysisSchema>;
export type GrowthAdvice = z.infer<typeof GrowthAdviceSchema>;
export type GrowthReport = z.infer<typeof GrowthReportSchema>;

export type AgentOutputMap = {
  market_analyst: MarketAnalysis;
  audience_analyst: AudienceAnalysis;
  content_strategist: ContentStrategy;
  creative_strategist: CreativeDirections;
  performance_analyst: CampaignAnalysis;
  growth_advisor: GrowthAdvice;
  report_writer: GrowthReport;
};

export const AGENT_SCHEMAS: Record<AgentId, z.ZodTypeAny> = {
  market_analyst: MarketAnalysisSchema,
  audience_analyst: AudienceAnalysisSchema,
  content_strategist: ContentStrategySchema,
  creative_strategist: CreativeDirectionsSchema,
  performance_analyst: CampaignAnalysisSchema,
  growth_advisor: GrowthAdviceSchema,
  report_writer: GrowthReportSchema,
};
