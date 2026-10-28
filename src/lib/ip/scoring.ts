/**
 * IP 选题评分模型（统一口径）。
 *
 * 为什么把评分逻辑单独放在这里：
 * 模型（或 Demo 引擎）只负责给 6 个维度的**原始分**，综合推荐分由本文件
 * 用固定权重计算。这样"综合分"永远不会是模型随口编的数字，用户可以
 * 复核每一分是怎么来的。
 */

export type ScoreKey =
  | "hotspot"
  | "pain"
  | "ipFit"
  | "differentiation"
  | "spread"
  | "commercial";

export type TopicScores = Record<ScoreKey, number>;

/** 综合推荐分权重（合计 100%）。 */
export const SCORE_WEIGHTS: Record<ScoreKey, number> = {
  hotspot: 0.15,
  pain: 0.25,
  ipFit: 0.2,
  differentiation: 0.15,
  spread: 0.15,
  commercial: 0.1,
};

export const SCORE_LABELS: Record<ScoreKey, { zh: string; en: string }> = {
  hotspot: { zh: "热点相关性", en: "Hotspot" },
  pain: { zh: "用户痛点", en: "Pain Point" },
  ipFit: { zh: "IP 匹配度", en: "IP Fit" },
  differentiation: { zh: "内容差异化", en: "Differentiation" },
  spread: { zh: "传播潜力", en: "Spread" },
  commercial: { zh: "商业价值", en: "Commercial" },
};

export const SCORE_KEYS: ScoreKey[] = ["hotspot", "pain", "ipFit", "differentiation", "spread", "commercial"];

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeScores(input: Partial<TopicScores> | undefined): TopicScores {
  return {
    hotspot: clampScore(input?.hotspot ?? 0),
    pain: clampScore(input?.pain ?? 0),
    ipFit: clampScore(input?.ipFit ?? 0),
    differentiation: clampScore(input?.differentiation ?? 0),
    spread: clampScore(input?.spread ?? 0),
    commercial: clampScore(input?.commercial ?? 0),
  };
}

/**
 * 综合推荐分 = 热点×15% + 痛点×25% + IP匹配×20% + 差异化×15% + 传播×15% + 商业×10%
 * 每一分都可复核：把各维度分与权重相乘后四舍五入到整数。
 */
export function computeOverallScore(scores: TopicScores): number {
  const normalized = normalizeScores(scores);
  const total = SCORE_KEYS.reduce((acc, key) => acc + normalized[key] * SCORE_WEIGHTS[key], 0);
  return clampScore(total);
}

/** 把 0–100 的分数映射成 1–5 星（传播潜力展示用，依据仍然写清楚）。 */
export function starsForScore(score: number): number {
  const value = clampScore(score);
  if (value >= 85) return 5;
  if (value >= 72) return 4;
  if (value >= 58) return 3;
  if (value >= 42) return 2;
  return 1;
}

export function starString(stars: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(stars)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

export function explainScoreFormula(): string {
  return SCORE_KEYS.map((key) => `${SCORE_LABELS[key].zh} × ${(SCORE_WEIGHTS[key] * 100).toFixed(0)}%`).join(" + ");
}

/* -------------------------------------------------------------------------- */
/* 拍摄成本 & 今日推荐                                                          */
/* -------------------------------------------------------------------------- */

export type ShootCost = {
  level: "低" | "中" | "高";
  reason: string;
};

const HEAVY_SHOOT_HINTS = ["外景", "航拍", "无人机", "多地", "街采", "采访", "城市", "车拍", "夜", "户外", "工地", "样板间"];
const LIGHT_SHOOT_HINTS = ["口播", "近景", "对镜", "手机", "家里", "室内", "桌面", "白墙", "工位"];

/** 依据创意描述里的取景关键词，粗略估计拍摄成本（越低越适合今天先拍）。 */
export function estimateShootCost(creative: string): ShootCost {
  const text = creative ?? "";
  const heavy = HEAVY_SHOOT_HINTS.filter((hint) => text.includes(hint)).length;
  const light = LIGHT_SHOOT_HINTS.filter((hint) => text.includes(hint)).length;
  if (heavy >= 2 && light === 0) {
    return { level: "高", reason: "需要外景/多地/特殊素材，拍摄与剪辑时间较长" };
  }
  if (heavy >= 1) {
    return { level: "中", reason: "需要少量外景或额外素材，可当天补拍" };
  }
  if (light >= 1 || heavy === 0) {
    return { level: "低", reason: "以口播/近景/手机拍摄为主，一个人一部手机即可完成" };
  }
  return { level: "中", reason: "拍摄难度中等" };
}

export type TopicLikeForToday = {
  id: string;
  title: string;
  creative: string;
  overallScore: number;
  painScore: number;
  ipFitScore: number;
  hotspotScore: number;
  commercialScore: number;
  spreadScore: number;
  isTop5: boolean;
};

export type TodayRecommendation<T extends TopicLikeForToday = TopicLikeForToday> = {
  topic: T;
  reasons: string[];
  shootCost: ShootCost;
} | null;

/**
 * 选"今天只拍一条拍哪个"：在 TOP 5 里挑综合分最高、拍摄成本最低的一条，
 * 并给出可复核的推荐原因（痛点/匹配/话题/成本/商业）。
 */
export function pickTodayTopic<T extends TopicLikeForToday>(topics: T[]): TodayRecommendation<T> {
  if (topics.length === 0) return null;
  const pool = topics.filter((topic) => topic.isTop5);
  const candidates = pool.length > 0 ? pool : topics;

  const scored = candidates.map((topic) => {
    const shootCost = estimateShootCost(topic.creative);
    const costBonus = shootCost.level === "低" ? 6 : shootCost.level === "中" ? 0 : -8;
    return { topic, shootCost, value: topic.overallScore + costBonus };
  });

  scored.sort((a, b) => b.value - a.value || b.topic.overallScore - a.topic.overallScore);
  const best = scored[0];

  const reasons: string[] = [];
  if (best.topic.painScore >= 80) reasons.push(`用户痛点高（${best.topic.painScore} 分）：这是目标客户当下真实的决策疑问`);
  if (best.topic.ipFitScore >= 80) reasons.push(`IP 匹配度高（${best.topic.ipFitScore} 分）：正好用得上这个 IP 的身份与经验`);
  if (best.topic.hotspotScore >= 70) reasons.push(`当前话题相关（${best.topic.hotspotScore} 分）：与近期讨论方向一致`);
  reasons.push(`拍摄成本${best.shootCost.level}：${best.shootCost.reason}`);
  if (best.topic.commercialScore >= 70) reasons.push(`商业价值较高（${best.topic.commercialScore} 分）：能自然带出业务与咨询`);
  if (reasons.length < 3) reasons.push(`综合推荐分最高（${best.topic.overallScore} 分，按统一权重计算）`);

  return { topic: best.topic, reasons, shootCost: best.shootCost };
}
