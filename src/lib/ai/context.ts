import type { AudienceSegmentSummary, WindowComparison } from "@/lib/analytics";
import type { CreativeScorecard } from "@/types";
import type {
  BrandRecord,
  ContentRecord,
  DerivedMetrics,
  DailyPoint,
  ExperimentRecord,
  GroupedPerformance,
  MetricRow,
  PersonaRecord,
  CompetitorRecord,
  ProductRecord,
  SignalBundle,
} from "@/types";

/**
 * The business context every agent receives. It is assembled on the server
 * from the database so the AI never has to guess what the brand sells.
 */
export type BusinessContext = {
  brand: BrandRecord;
  product: ProductRecord;
  personas: PersonaRecord[];
  competitors: CompetitorRecord[];
  period: { start: string; end: string; label: string; days: number };
  totals: DerivedMetrics;
  daily: DailyPoint[];
  platforms: GroupedPerformance[];
  campaigns: GroupedPerformance[];
  creatives: CreativeScorecard[];
  comparison: WindowComparison | null;
  audience: AudienceSegmentSummary[];
  signals: SignalBundle;
  contents: ContentRecord[];
  experiments: ExperimentRecord[];
  dataSource: { kind: "demo" | "upload"; label: string; rows: number };
};

export type ContentSelection = {
  platform: string;
  contentType: string;
  goal: string;
  topic: string;
  audience: string;
};

export type CreativeSelection = {
  platform: string;
  objective: string;
  audience: string;
  theme: string;
};

export type AgentPayload = {
  context: BusinessContext;
  question?: string;
  contentSelection?: ContentSelection;
  creativeSelection?: CreativeSelection;
  extraNotes?: string;
};

/**
 * Compacts the context into the JSON payload handed to the model. Keeping this
 * explicit (instead of dumping the whole context object) keeps prompts small,
 * deterministic and cheap.
 */
export function contextToPromptPayload(payload: AgentPayload) {
  const { context } = payload;
  return {
    brand: {
      name: context.brand.name,
      positioning: context.brand.positioning,
      product: context.product.name,
      price: context.product.price,
      benefits: context.product.keyBenefits,
      targetAudience: context.brand.targetAudience,
      channels: context.brand.channels,
      keywords: context.brand.keywords,
    },
    period: context.period,
    dataSource: {
      ...context.dataSource,
      simulated: context.dataSource.kind === "demo",
      notice:
        context.dataSource.kind === "demo"
          ? "全部为 Demo / 模拟业务数据：不得把实验或指标变化表述为真实投放、真实用户实验或真实商业成绩；" +
            "请使用「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」。"
          : "用户上传的投放数据：不得声称真实业务增长（转化与收入口径未知），请写「基于上传的投放数据」。",
    },
    totals: roundMetricsForPrompt(context.totals),
    last7VsPrevious7: context.comparison
      ? {
          windowDays: context.comparison.windowDays,
          current: roundMetricsForPrompt(context.comparison.current),
          previous: roundMetricsForPrompt(context.comparison.previous),
          deltasPct: context.comparison.deltas,
        }
      : null,
    dailyTrend: context.daily.map((point) => ({
      date: point.date,
      spend: Math.round(point.spend),
      ctr: Number((point.ctr * 100).toFixed(2)),
      cvr: Number((point.cvr * 100).toFixed(2)),
      roas: Number(point.roas.toFixed(2)),
    })),
    platformPerformance: context.platforms.map((item) => ({
      platform: item.name,
      spend: Math.round(item.spend),
      impressions: item.impressions,
      ctr: Number((item.ctr * 100).toFixed(2)),
      cpc: Number(item.cpc.toFixed(2)),
      cvr: Number((item.cvr * 100).toFixed(2)),
      cpa: Number(item.cpa.toFixed(2)),
      roas: Number(item.roas.toFixed(2)),
      conversionShare: Number((item.share * 100).toFixed(1)),
    })),
    creativeRanking: context.creatives.map((item) => ({
      creative: item.name,
      platform: item.platform,
      spend: Math.round(item.spend),
      ctr: Number((item.ctr * 100).toFixed(2)),
      cvr: Number((item.cvr * 100).toFixed(2)),
      cpa: Number(item.cpa.toFixed(2)),
      roas: Number(item.roas.toFixed(2)),
      ctrIndex: Number(item.ctrIndex.toFixed(2)),
      roasIndex: Number(item.roasIndex.toFixed(2)),
    })),
    audienceSegments: context.audience.map((item) => ({
      segment: item.segment,
      impressions: item.impressions,
      ctr: Number((item.ctr * 100).toFixed(2)),
      cvr: Number((item.cvr * 100).toFixed(2)),
      roas: Number(item.roas.toFixed(2)),
      conversionShare: Number((item.share * 100).toFixed(1)),
    })),
    personas: context.personas.map((persona) => ({
      name: persona.name,
      ageBand: persona.ageBand,
      occupation: persona.occupation,
      share: persona.share,
      painPoints: persona.painPoints,
      motivations: persona.motivations,
      barriers: persona.barriers,
      contentPreferences: persona.contentPreferences,
    })),
    competitors: context.competitors.map((competitor) => ({
      name: competitor.name,
      positioning: competitor.positioning,
      price: competitor.price,
      priceTier: competitor.priceTier,
      professionalScore: competitor.professional,
      audience: competitor.audience,
      contentThemes: competitor.contentThemes,
      adThemes: competitor.adThemes,
      strength: competitor.strength,
      weakness: competitor.weakness,
      isSelf: competitor.isSelf,
    })),
    computedSignals: context.signals,
    experiments: context.experiments.map((experiment) => ({
      name: experiment.name,
      status: experiment.status,
      /**
       * 数据字段定义：实验来自模拟数据集。status(running/completed) 只描述推演状态，
       * 不代表真实实验已经跑完并得到验证。模型必须据此约束表述。
       */
      simulated: true,
      statusNote:
        "该实验为模拟实验（Demo 数据集），status 仅表示推演状态；不得写成“实验已完成/已验证/实际提升 X%”。",
      primaryMetric: experiment.primaryMetric,
      summary: experiment.summary,
      aiRecommendation: experiment.aiRecommendation,
      variants: experiment.variants.map((variant) => ({
        label: variant.label,
        name: variant.name,
        impressions: variant.impressions,
        clicks: variant.clicks,
        conversions: variant.conversions,
        spend: variant.spend,
        revenue: variant.revenue,
      })),
    })),
    contentLibrarySample: context.contents.slice(0, 8).map((content) => ({
      title: content.title,
      platform: content.platform,
      goal: content.goal,
      overallScore: content.overallScore,
    })),
    request: {
      question: payload.question ?? null,
      contentSelection: payload.contentSelection ?? null,
      creativeSelection: payload.creativeSelection ?? null,
      notes: payload.extraNotes ?? null,
    },
  };
}

function roundMetricsForPrompt(metrics: DerivedMetrics) {
  return {
    spend: Math.round(metrics.spend),
    impressions: metrics.impressions,
    clicks: metrics.clicks,
    conversions: metrics.conversions,
    revenue: Math.round(metrics.revenue),
    ctrPct: Number((metrics.ctr * 100).toFixed(2)),
    cpc: Number(metrics.cpc.toFixed(2)),
    cvrPct: Number((metrics.cvr * 100).toFixed(2)),
    cpa: Number(metrics.cpa.toFixed(2)),
    roas: Number(metrics.roas.toFixed(2)),
  };
}

export type ContextMetricRow = MetricRow;
