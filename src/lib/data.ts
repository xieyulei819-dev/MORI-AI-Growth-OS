import { prisma } from "@/lib/db";
import {
  audienceBreakdown,
  compareWindows,
  creativeScorecard,
  dailySeries,
  deriveSignals,
  groupPerformance,
  type AudienceSegmentRow,
} from "@/lib/analytics";
import type { BusinessContext } from "@/lib/ai/context";
import { computeMetrics } from "@/lib/metrics";
import {
  buildDemoBrand,
  buildDemoCompetitors,
  buildDemoPersonas,
  buildDemoProduct,
  DEMO_PERIOD_DAYS,
  DEMO_PERIOD_END,
  DEMO_PERIOD_START,
} from "@/lib/demo-data";
import { safeJsonArray } from "@/lib/utils";
import type {
  BrandRecord,
  CampaignRecord,
  CompetitorRecord,
  ContentRecord,
  CreativeRecord,
  DatasetRecord,
  ExperimentRecord,
  InsightRecord,
  MetricRow,
  PersonaRecord,
  ProductRecord,
} from "@/types";

export type DatasetSelection = {
  datasetId?: string | null;
  source?: "demo" | "upload";
};

/* -------------------------------------------------------------------------- */
/* row mappers                                                                 */
/* -------------------------------------------------------------------------- */

export function toMetricRow(row: {
  date: Date;
  platform: string;
  campaign: string;
  creative: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}): MetricRow {
  return {
    date: row.date,
    platform: row.platform,
    campaign: row.campaign,
    creative: row.creative,
    spend: row.spend,
    impressions: row.impressions,
    clicks: row.clicks,
    conversions: row.conversions,
    revenue: row.revenue,
  };
}

function toPersona(row: {
  id: string;
  code: string;
  name: string;
  ageBand: string;
  occupation: string;
  city: string;
  share: number;
  painPoints: string;
  motivations: string;
  contentPreferences: string;
  purchaseDrivers: string;
  barriers: string;
  channels: string;
  quote: string;
  accent: string;
}): PersonaRecord {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    ageBand: row.ageBand,
    occupation: row.occupation,
    city: row.city,
    share: row.share,
    painPoints: safeJsonArray(row.painPoints),
    motivations: safeJsonArray(row.motivations),
    contentPreferences: safeJsonArray(row.contentPreferences),
    purchaseDrivers: safeJsonArray(row.purchaseDrivers),
    barriers: safeJsonArray(row.barriers),
    channels: safeJsonArray(row.channels),
    quote: row.quote,
    accent: row.accent,
  };
}

function toCompetitor(row: {
  id: string;
  name: string;
  positioning: string;
  price: number;
  priceTier: string;
  professional: number;
  audience: string;
  contentThemes: string;
  mainChannels: string;
  adThemes: string;
  strength: string;
  weakness: string;
  colorToken: string;
  isSelf: boolean;
}): CompetitorRecord {
  return {
    id: row.id,
    name: row.name,
    positioning: row.positioning,
    price: row.price,
    priceTier: row.priceTier,
    professional: row.professional,
    audience: row.audience,
    contentThemes: safeJsonArray(row.contentThemes),
    mainChannels: safeJsonArray(row.mainChannels),
    adThemes: safeJsonArray(row.adThemes),
    strength: row.strength,
    weakness: row.weakness,
    colorToken: row.colorToken,
    isSelf: row.isSelf,
  };
}

export function toContentRecord(row: {
  id: string;
  title: string;
  platform: string;
  contentType: string;
  goal: string;
  topic: string;
  audience: string;
  hook: string;
  body: string;
  cta: string;
  hookScore: number;
  relevanceScore: number;
  conversionScore: number;
  brandFitScore: number;
  overallScore: number;
  whyTest: string;
  howToImprove: string;
  status: string;
  mode: string;
}): ContentRecord {
  return { ...row };
}

export function toExperimentRecord(row: {
  id: string;
  name: string;
  hypothesis: string;
  goal: string;
  primaryMetric: string;
  status: string;
  startDate: Date;
  endDate: Date;
  summary: string;
  aiRecommendation: string;
  mode: string;
  variants: Array<{
    id: string;
    label: string;
    name: string;
    description: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    isWinner: boolean;
  }>;
}): ExperimentRecord {
  return {
    id: row.id,
    name: row.name,
    hypothesis: row.hypothesis,
    goal: row.goal,
    primaryMetric: row.primaryMetric,
    status: row.status,
    startDate: row.startDate,
    endDate: row.endDate,
    summary: row.summary,
    aiRecommendation: row.aiRecommendation,
    mode: row.mode,
    variants: row.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      name: variant.name,
      description: variant.description,
      impressions: variant.impressions,
      clicks: variant.clicks,
      conversions: variant.conversions,
      spend: variant.spend,
      revenue: variant.revenue,
      isWinner: variant.isWinner,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* business context                                                            */
/* -------------------------------------------------------------------------- */

export async function getDatasetOptions(): Promise<DatasetRecord[]> {
  const rows = await prisma.dataset.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    source: row.source,
    rowCount: row.rowCount,
    note: row.note,
    createdAt: row.createdAt,
  }));
}

export async function getBusinessContext(selection: DatasetSelection = {}): Promise<BusinessContext> {
  const [brandRow, productRow, personaRows, competitorRows, contentRows, experimentRows] = await Promise.all([
    prisma.brand.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.product.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.persona.findMany({ orderBy: { share: "desc" } }),
    prisma.competitor.findMany({ orderBy: { professional: "desc" } }),
    prisma.contentItem.findMany({ orderBy: { overallScore: "desc" }, take: 60 }),
    prisma.experiment.findMany({ include: { variants: true }, orderBy: { startDate: "desc" } }),
  ]);

  const brandFallback = buildDemoBrand();
  const brand: BrandRecord = brandRow
    ? {
        id: brandRow.id,
        name: brandRow.name,
        nameEn: brandRow.nameEn,
        positioning: brandRow.positioning,
        description: brandRow.description,
        productName: brandRow.productName,
        priceRange: brandRow.priceRange,
        targetAudience: brandRow.targetAudience,
        channels: safeJsonArray(brandRow.channels),
        keywords: safeJsonArray(brandRow.keywords),
      }
    : { id: "demo-brand", ...brandFallback, channels: safeJsonArray(brandFallback.channels), keywords: safeJsonArray(brandFallback.keywords) };

  const productFallback = buildDemoProduct();
  const product: ProductRecord = productRow
    ? {
        id: productRow.id,
        brandName: productRow.brandName,
        name: productRow.name,
        category: productRow.category,
        positioning: productRow.positioning,
        price: productRow.price,
        volume: productRow.volume,
        keyBenefits: safeJsonArray(productRow.keyBenefits),
        sellingPoints: safeJsonArray(productRow.sellingPoints),
        usageScenario: safeJsonArray(productRow.usageScenario),
        credibility: safeJsonArray(productRow.credibility),
      }
    : {
        id: "demo-product",
        ...productFallback,
        keyBenefits: safeJsonArray(productFallback.keyBenefits),
        sellingPoints: safeJsonArray(productFallback.sellingPoints),
        usageScenario: safeJsonArray(productFallback.usageScenario),
        credibility: safeJsonArray(productFallback.credibility),
      };

  const personas: PersonaRecord[] = personaRows.length
    ? personaRows.map(toPersona)
    : buildDemoPersonas().map((persona, index) => toPersona({ id: `demo-persona-${index}`, ...persona }));

  const competitors: CompetitorRecord[] = competitorRows.length
    ? competitorRows.map(toCompetitor)
    : buildDemoCompetitors().map((competitor, index) => toCompetitor({ id: `demo-competitor-${index}`, ...competitor }));

  const contents: ContentRecord[] = contentRows.map(toContentRecord);
  const experiments: ExperimentRecord[] = experimentRows.map(toExperimentRecord);

  const metricWhere = selection.datasetId
    ? { datasetId: selection.datasetId }
    : { source: selection.source ?? "demo" };

  const [metricRows, audienceRows] = await Promise.all([
    prisma.metric.findMany({ where: metricWhere, orderBy: { date: "asc" } }),
    selection.datasetId ? Promise.resolve([]) : prisma.audienceMetric.findMany({ orderBy: { date: "asc" } }),
  ]);

  const rows = metricRows.map(toMetricRow);
  const audienceSegmentRows: AudienceSegmentRow[] = audienceRows.map((row) => ({
    date: row.date,
    platform: "全渠道",
    campaign: "全渠道",
    creative: row.segment,
    segment: row.segment,
    age: row.age,
    gender: row.gender,
    spend: row.spend,
    impressions: row.impressions,
    clicks: row.clicks,
    conversions: row.conversions,
    revenue: row.revenue,
  }));

  const totals = computeMetrics(rows);
  const daily = dailySeries(rows);

  let datasetLabel = "Demo 数据集（30 天模拟投放数据）";
  if (selection.datasetId) {
    const dataset = await prisma.dataset.findUnique({ where: { id: selection.datasetId } });
    if (dataset) datasetLabel = `上传数据集：${dataset.name}`;
  }

  return {
    brand,
    product,
    personas,
    competitors,
    period: {
      start: daily[0]?.date ?? DEMO_PERIOD_START,
      end: daily[daily.length - 1]?.date ?? DEMO_PERIOD_END,
      label:
        (daily[0]?.date ?? DEMO_PERIOD_START) + " ~ " + (daily[daily.length - 1]?.date ?? DEMO_PERIOD_END) + "（Demo）",
      days: daily.length || DEMO_PERIOD_DAYS,
    },
    totals,
    daily,
    platforms: groupPerformance(rows, "platform"),
    campaigns: groupPerformance(rows, "campaign"),
    creatives: creativeScorecard(rows),
    comparison: compareWindows(rows, 7),
    audience: audienceBreakdown(audienceSegmentRows),
    signals: deriveSignals(rows, audienceSegmentRows),
    contents,
    experiments,
    dataSource: {
      kind: selection.datasetId ? "upload" : "demo",
      label: datasetLabel,
      rows: rows.length,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* page level helpers                                                          */
/* -------------------------------------------------------------------------- */

export async function getCampaignRecords(): Promise<CampaignRecord[]> {
  const rows = await prisma.campaign.findMany({ orderBy: { startDate: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    objective: row.objective,
    platform: row.platform,
    status: row.status,
    budget: row.budget,
    startDate: row.startDate,
    endDate: row.endDate,
    note: row.note,
  }));
}

export async function getCreativeRecords(): Promise<CreativeRecord[]> {
  const rows = await prisma.creative.findMany({ orderBy: { priority: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    campaign: row.campaign,
    platform: row.platform,
    theme: row.theme,
    angle: row.angle,
    hook: row.hook,
    cta: row.cta,
    audience: row.audience,
    script: row.script,
    priority: row.priority,
    status: row.status,
    targetCtr: row.targetCtr,
    targetRoas: row.targetRoas,
  }));
}

export async function getContentLibrary(limit = 36): Promise<ContentRecord[]> {
  const rows = await prisma.contentItem.findMany({ orderBy: [{ overallScore: "desc" }], take: limit });
  return rows.map(toContentRecord);
}

export async function getExperimentList(): Promise<ExperimentRecord[]> {
  const rows = await prisma.experiment.findMany({
    include: { variants: true },
    orderBy: [{ status: "asc" }, { startDate: "desc" }],
  });
  return rows.map(toExperimentRecord);
}

export async function getInsightHistory(limit = 12): Promise<InsightRecord[]> {
  const rows = await prisma.insight.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return rows.map((row) => ({
    id: row.id,
    scope: row.scope,
    category: row.category,
    title: row.title,
    body: row.body,
    evidence: row.evidence,
    confidence: row.confidence,
    agent: row.agent,
    mode: row.mode,
  }));
}

export async function saveInsights(
  scope: string,
  agent: string,
  mode: string,
  bundle: { insights: Array<{ title: string; body: string; evidence: string; confidence: number }>; opportunities: Array<{ title: string; body: string; evidence: string; confidence: number }>; risks: Array<{ title: string; body: string; evidence: string; confidence: number }>; recommendations: Array<{ title: string; body: string; evidence: string; confidence: number }> },
) {
  const payload = [
    ...bundle.insights.map((item) => ({ ...item, category: "insight" })),
    ...bundle.opportunities.map((item) => ({ ...item, category: "opportunity" })),
    ...bundle.risks.map((item) => ({ ...item, category: "risk" })),
    ...bundle.recommendations.map((item) => ({ ...item, category: "recommendation" })),
  ];

  if (payload.length === 0) return 0;

  await prisma.insight.createMany({
    data: payload.map((item) => ({
      scope,
      category: item.category,
      title: item.title,
      body: item.body,
      evidence: item.evidence,
      confidence: Math.round(item.confidence),
      agent,
      mode,
    })),
  });

  return payload.length;
}

export type CsvPersistResult = {
  dataset: DatasetRecord;
  inserted: number;
};

export async function persistUploadedCsv(
  name: string,
  rows: MetricRow[],
  note: string,
): Promise<CsvPersistResult> {
  const dataset = await prisma.dataset.create({
    data: {
      name,
      source: "upload",
      rowCount: rows.length,
      note,
    },
  });

  await prisma.metric.createMany({
    data: rows.map((row) => ({
      date: new Date(row.date),
      platform: row.platform,
      campaign: row.campaign,
      creative: row.creative,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
      revenue: row.revenue,
      source: "upload",
      datasetId: dataset.id,
    })),
  });

  return {
    dataset: {
      id: dataset.id,
      name: dataset.name,
      source: dataset.source,
      rowCount: dataset.rowCount,
      note: dataset.note,
      createdAt: dataset.createdAt,
    },
    inserted: rows.length,
  };
}

export async function deleteDataset(id: string) {
  await prisma.dataset.delete({ where: { id } });
}

/** Used by /api/campaign/sample to hand the reviewer a ready-to-upload CSV. */
export async function getDemoMetricRows(limit = 90): Promise<MetricRow[]> {
  const rows = await prisma.metric.findMany({
    where: { source: "demo" },
    orderBy: [{ creative: "asc" }, { date: "asc" }],
    take: limit,
  });
  return rows.map(toMetricRow);
}
