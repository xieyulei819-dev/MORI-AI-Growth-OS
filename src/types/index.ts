/**
 * Shared domain types for MORI AI Growth OS.
 *
 * Everything in this project is DEMO / 模拟业务数据 for a fictional brand.
 */

export type MetricRow = {
  date: Date | string;
  platform: string;
  campaign: string;
  creative: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
};

export type DerivedMetrics = {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  /** click-through rate, 0-1 */
  ctr: number;
  /** cost per click, currency */
  cpc: number;
  /** conversion rate, 0-1 */
  cvr: number;
  /** cost per acquisition, currency */
  cpa: number;
  /** return on ad spend, multiple */
  roas: number;
};

export type DailyPoint = DerivedMetrics & {
  date: string;
};

export type GroupedPerformance = DerivedMetrics & {
  name: string;
  share: number;
  spendShare: number;
  /** extra context for tables */
  platform?: string;
  campaign?: string;
  creative?: string;
};

export type CreativeScorecard = GroupedPerformance & {
  ctrIndex: number;
  roasIndex: number;
};

export type SignalCategory = "insight" | "opportunity" | "risk" | "recommendation";

export type Signal = {
  title: string;
  body: string;
  evidence: string;
  confidence: number;
};

export type SignalBundle = {
  insights: Signal[];
  opportunities: Signal[];
  risks: Signal[];
  recommendations: Signal[];
};

export type AgentId =
  | "market_analyst"
  | "audience_analyst"
  | "content_strategist"
  | "creative_strategist"
  | "performance_analyst"
  | "growth_advisor"
  | "report_writer";

export type RunMode = "demo" | "ai" | "fallback";

export type AgentRunMeta = {
  mode: RunMode;
  agent: AgentId;
  model: string;
  promptVersion: string;
  latencyMs: number;
  warning?: string;
  generatedAt: string;
};

export type AgentRunResult<T> = {
  data: T;
  meta: AgentRunMeta;
};

export type PersonaRecord = {
  id: string;
  code: string;
  name: string;
  ageBand: string;
  occupation: string;
  city: string;
  share: number;
  painPoints: string[];
  motivations: string[];
  contentPreferences: string[];
  purchaseDrivers: string[];
  barriers: string[];
  channels: string[];
  quote: string;
  accent: string;
};

export type CompetitorRecord = {
  id: string;
  name: string;
  positioning: string;
  price: number;
  priceTier: string;
  professional: number;
  audience: string;
  contentThemes: string[];
  mainChannels: string[];
  adThemes: string[];
  strength: string;
  weakness: string;
  colorToken: string;
  isSelf: boolean;
};

export type BrandRecord = {
  id: string;
  name: string;
  nameEn: string;
  positioning: string;
  description: string;
  productName: string;
  priceRange: string;
  targetAudience: string;
  channels: string[];
  keywords: string[];
};

export type ProductRecord = {
  id: string;
  brandName: string;
  name: string;
  category: string;
  positioning: string;
  price: number;
  volume: string;
  keyBenefits: string[];
  sellingPoints: string[];
  usageScenario: string[];
  credibility: string[];
};

export type CampaignRecord = {
  id: string;
  name: string;
  objective: string;
  platform: string;
  status: string;
  budget: number;
  startDate: Date | string;
  endDate: Date | string;
  note: string;
};

export type CreativeRecord = {
  id: string;
  name: string;
  campaign: string;
  platform: string;
  theme: string;
  angle: string;
  hook: string;
  cta: string;
  audience: string;
  script: string;
  priority: string;
  status: string;
  targetCtr: number;
  targetRoas: number;
};

export type ContentRecord = {
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
};

export type ExperimentVariantRecord = {
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
};

export type ExperimentRecord = {
  id: string;
  name: string;
  hypothesis: string;
  goal: string;
  primaryMetric: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  summary: string;
  aiRecommendation: string;
  mode: string;
  variants: ExperimentVariantRecord[];
};

export type DatasetRecord = {
  id: string;
  name: string;
  source: string;
  rowCount: number;
  note: string;
  createdAt: Date | string;
};

export type InsightRecord = {
  id: string;
  scope: string;
  category: string;
  title: string;
  body: string;
  evidence: string;
  confidence: number;
  agent: string;
  mode: string;
};
