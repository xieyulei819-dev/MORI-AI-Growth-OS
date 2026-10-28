import { prisma } from "@/lib/db";
import type { IpInput } from "@/lib/ip/input";
import type { IndustryKey } from "@/lib/ip/knowledge";
import {
  computeOverallScore,
  normalizeScores,
  pickTodayTopic,
  type ScoreKey,
  type ShootCost,
  type TopicScores,
} from "@/lib/ip/scoring";
import type {
  ContentPlan,
  IpAnalysis,
  ScriptBundle,
  ShotPlan,
  TopicItem,
  TrendResearch,
} from "@/lib/ip/schemas";
import type { TrendSearchStatus } from "@/lib/ip/search";

/**
 * IP 智能选题 —— 持久化层。
 *
 * 历史记录：同一个 IP 名称再次分析时复用同一条 IpProfile（更新而不是新增），
 * 因此「以后再次输入同一个 IP，不需要从零开始」。
 */

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export type IpTopicDto = {
  id: string;
  profileId: string;
  title: string;
  topicType: string;
  painPoint: string;
  value: string;
  hook: string;
  creative: string;
  potentialStars: number;
  potentialReason: string;
  scores: TopicScores;
  overallScore: number;
  scoreBasis: Partial<Record<ScoreKey, string>>;
  recommendReason: string;
  isTop5: boolean;
  rank: number;
  feedback: string;
  dislikeReason: string;
  mode: string;
};

export type IpProfileDto = {
  id: string;
  name: string;
  industry: string;
  city: string;
  platforms: string[];
  targetCustomer: string;
  products: string;
  goal: string;
  analysis: IpAnalysis | null;
  trends: TrendResearch | null;
  analysisMode: string;
  trendMode: string;
  searchStatus: TrendSearchStatus | null;
  createdAt: string;
  updatedAt: string;
};

export type IpPlanDto = {
  id: string;
  payload: ContentPlan;
  mode: string;
  createdAt: string;
};

export type IpScriptDto = {
  id: string;
  hookVersion: string;
  script: ScriptBundle;
  shot: ShotPlan;
  scriptMode: string;
  shotMode: string;
  createdAt: string;
};

type TopicRow = {
  id: string;
  profileId: string;
  title: string;
  topicType: string;
  painPoint: string;
  value: string;
  hook: string;
  creative: string;
  potentialStars: number;
  potentialReason: string;
  hotspotScore: number;
  painScore: number;
  ipFitScore: number;
  differentiationScore: number;
  spreadScore: number;
  commercialScore: number;
  overallScore: number;
  scoreBasis: string;
  recommendReason: string;
  isTop5: boolean;
  rank: number;
  feedback: string;
  dislikeReason: string;
  mode: string;
};

function toTopicDto(row: TopicRow): IpTopicDto {
  return {
    id: row.id,
    profileId: row.profileId,
    title: row.title,
    topicType: row.topicType,
    painPoint: row.painPoint,
    value: row.value,
    hook: row.hook,
    creative: row.creative,
    potentialStars: row.potentialStars,
    potentialReason: row.potentialReason,
    scores: {
      hotspot: row.hotspotScore,
      pain: row.painScore,
      ipFit: row.ipFitScore,
      differentiation: row.differentiationScore,
      spread: row.spreadScore,
      commercial: row.commercialScore,
    },
    overallScore: row.overallScore,
    scoreBasis: parseJson<Partial<Record<ScoreKey, string>>>(row.scoreBasis, {}),
    recommendReason: row.recommendReason,
    isTop5: row.isTop5,
    rank: row.rank,
    feedback: row.feedback,
    dislikeReason: row.dislikeReason,
    mode: row.mode,
  };
}

/* -------------------------------------------------------------------------- */
/* profile                                                                     */
/* -------------------------------------------------------------------------- */

export async function saveProfileAnalysis(params: {
  input: IpInput;
  industryKey: IndustryKey;
  analysis: IpAnalysis;
  analysisMode: string;
  trends: TrendResearch;
  trendMode: string;
  searchStatus: TrendSearchStatus;
}): Promise<string> {
  const { input, analysis, trends } = params;
  const data = {
    name: input.name,
    industry: input.industry || analysis.industryGuess.value,
    city: input.city || (analysis.cityGuess.value.includes("待确认") ? "" : analysis.cityGuess.value),
    platforms: JSON.stringify(input.platforms),
    targetCustomer: input.targetCustomer,
    products: input.products,
    goal: input.goal,
    analysis: JSON.stringify(analysis),
    trends: JSON.stringify(trends),
    analysisMode: params.analysisMode,
    trendMode: params.trendMode,
    searchStatus: JSON.stringify(params.searchStatus),
  };

  const existing = await prisma.ipProfile.findFirst({
    where: { name: input.name },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    await prisma.ipProfile.update({ where: { id: existing.id }, data });
    return existing.id;
  }

  const created = await prisma.ipProfile.create({ data });
  return created.id;
}

export async function getProfileDto(id: string): Promise<IpProfileDto | null> {
  const row = await prisma.ipProfile.findUnique({ where: { id } });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    city: row.city,
    platforms: parseJson<string[]>(row.platforms, []),
    targetCustomer: row.targetCustomer,
    products: row.products,
    goal: row.goal,
    analysis: parseJson<IpAnalysis | null>(row.analysis, null),
    trends: parseJson<TrendResearch | null>(row.trends, null),
    analysisMode: row.analysisMode,
    trendMode: row.trendMode,
    searchStatus: parseJson<TrendSearchStatus | null>(row.searchStatus, null),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export type IpHistoryItem = {
  id: string;
  name: string;
  industry: string;
  city: string;
  updatedAt: string;
  topicCount: number;
  topTopic: string | null;
};

export async function listProfiles(limit = 20): Promise<IpHistoryItem[]> {
  const rows = await prisma.ipProfile.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      topics: {
        orderBy: { overallScore: "desc" },
        take: 1,
      },
      _count: { select: { topics: true } },
    },
  });

  const deduped = new Map<string, IpHistoryItem>();
  rows.forEach((row) => {
    if (deduped.has(row.name)) return;
    deduped.set(row.name, {
      id: row.id,
      name: row.name,
      industry: row.industry,
      city: row.city,
      updatedAt: row.updatedAt.toISOString(),
      topicCount: row._count.topics,
      topTopic: row.topics[0]?.title ?? null,
    });
  });
  return Array.from(deduped.values());
}

export async function deleteProfile(id: string) {
  await prisma.ipProfile.delete({ where: { id } });
}

/* -------------------------------------------------------------------------- */
/* topics                                                                      */
/* -------------------------------------------------------------------------- */

export async function replaceTopics(profileId: string, topics: TopicItem[], mode: string): Promise<IpTopicDto[]> {
  await prisma.ipTopic.deleteMany({ where: { profileId } });

  const withOverall = topics.map((topic) => {
    const scores = normalizeScores(topic.scores);
    return { topic, scores, overall: computeOverallScore(scores) };
  });

  const rankedTitles = new Set(
    [...withOverall].sort((a, b) => b.overall - a.overall).slice(0, 5).map((item) => item.topic.title),
  );
  const rankByTitle = new Map<string, number>();
  [...withOverall]
    .sort((a, b) => b.overall - a.overall)
    .forEach((item, index) => rankByTitle.set(item.topic.title, index + 1));

  for (const item of withOverall) {
    await prisma.ipTopic.create({
      data: {
        profileId,
        title: item.topic.title,
        topicType: item.topic.topicType,
        painPoint: item.topic.painPoint,
        value: item.topic.value,
        hook: item.topic.hook,
        creative: item.topic.creative,
        potentialStars: Math.round(item.topic.potentialStars),
        potentialReason: item.topic.potentialReason,
        hotspotScore: item.scores.hotspot,
        painScore: item.scores.pain,
        ipFitScore: item.scores.ipFit,
        differentiationScore: item.scores.differentiation,
        spreadScore: item.scores.spread,
        commercialScore: item.scores.commercial,
        overallScore: item.overall,
        scoreBasis: JSON.stringify(item.topic.scoreBasis),
        recommendReason: item.topic.recommendReason,
        isTop5: rankedTitles.has(item.topic.title),
        rank: rankByTitle.get(item.topic.title) ?? 0,
        mode,
      },
    });
  }

  return getTopics(profileId);
}

export async function getTopics(profileId: string): Promise<IpTopicDto[]> {
  const rows = await prisma.ipTopic.findMany({ where: { profileId }, orderBy: { rank: "asc" } });
  return rows.map((row) => toTopicDto(row as TopicRow));
}

export async function getTopicWithProfile(topicId: string): Promise<{ topic: IpTopicDto; profile: IpProfileDto } | null> {
  const row = await prisma.ipTopic.findUnique({ where: { id: topicId } });
  if (!row) return null;
  const profile = await getProfileDto(row.profileId);
  if (!profile) return null;
  return { topic: toTopicDto(row as TopicRow), profile };
}

export async function replaceSingleTopic(topicId: string, topic: TopicItem, mode: string): Promise<IpTopicDto | null> {
  const scores = normalizeScores(topic.scores);
  const overall = computeOverallScore(scores);
  const updated = await prisma.ipTopic.update({
    where: { id: topicId },
    data: {
      title: topic.title,
      topicType: topic.topicType,
      painPoint: topic.painPoint,
      value: topic.value,
      hook: topic.hook,
      creative: topic.creative,
      potentialStars: Math.round(topic.potentialStars),
      potentialReason: topic.potentialReason,
      hotspotScore: scores.hotspot,
      painScore: scores.pain,
      ipFitScore: scores.ipFit,
      differentiationScore: scores.differentiation,
      spreadScore: scores.spread,
      commercialScore: scores.commercial,
      overallScore: overall,
      scoreBasis: JSON.stringify(topic.scoreBasis),
      recommendReason: topic.recommendReason,
      mode,
      feedback: "none",
      dislikeReason: "",
    },
  });
  return toTopicDto(updated as TopicRow);
}

export async function setTopicFeedback(topicId: string, feedback: string, reason = ""): Promise<IpTopicDto | null> {
  const updated = await prisma.ipTopic.update({
    where: { id: topicId },
    data: { feedback, dislikeReason: reason },
  });
  return toTopicDto(updated as TopicRow);
}

/* -------------------------------------------------------------------------- */
/* scripts & plans                                                             */
/* -------------------------------------------------------------------------- */

export async function saveScript(params: {
  topicId: string;
  hookVersion: string;
  script: ScriptBundle;
  shot: ShotPlan;
  scriptMode: string;
  shotMode: string;
}): Promise<string> {
  const created = await prisma.ipScript.create({
    data: {
      topicId: params.topicId,
      hookVersion: params.hookVersion,
      payload: JSON.stringify({ script: params.script, shot: params.shot }),
      scriptMode: params.scriptMode,
      shotMode: params.shotMode,
    },
  });
  return created.id;
}

export async function getLatestScript(topicId: string): Promise<IpScriptDto | null> {
  const row = await prisma.ipScript.findFirst({ where: { topicId }, orderBy: { createdAt: "desc" } });
  if (!row) return null;
  const payload = parseJson<{ script: ScriptBundle; shot: ShotPlan }>(row.payload, null as unknown as { script: ScriptBundle; shot: ShotPlan });
  if (!payload?.script || !payload?.shot) return null;
  return {
    id: row.id,
    hookVersion: row.hookVersion,
    script: payload.script,
    shot: payload.shot,
    scriptMode: row.scriptMode,
    shotMode: row.shotMode,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function savePlan(profileId: string, payload: ContentPlan, mode: string): Promise<string> {
  const created = await prisma.ipPlan.create({
    data: { profileId, payload: JSON.stringify(payload), mode },
  });
  return created.id;
}

export async function getLatestPlan(profileId: string): Promise<IpPlanDto | null> {
  const row = await prisma.ipPlan.findFirst({ where: { profileId }, orderBy: { createdAt: "desc" } });
  if (!row) return null;
  return {
    id: row.id,
    payload: parseJson<ContentPlan>(row.payload, null as unknown as ContentPlan),
    mode: row.mode,
    createdAt: row.createdAt.toISOString(),
  };
}

export type TodayTopic = { topic: IpTopicDto; reasons: string[]; shootCost: ShootCost } | null;

/** 「今日最值得拍什么」：在 TOP 5 里挑综合分最高、拍摄成本最低的一条。 */
export function todayRecommendation(topics: IpTopicDto[]): TodayTopic {
  const shaped = topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    creative: topic.creative,
    overallScore: topic.overallScore,
    painScore: topic.scores.pain,
    ipFitScore: topic.scores.ipFit,
    hotspotScore: topic.scores.hotspot,
    commercialScore: topic.scores.commercial,
    spreadScore: topic.scores.spread,
    isTop5: topic.isTop5,
    source: topic,
  }));
  const pick = pickTodayTopic(shaped);
  if (!pick) return null;
  return { topic: pick.topic.source, reasons: pick.reasons, shootCost: pick.shootCost };
}

/** 把持久化的选题转回 Agent 需要的 TopicItem（用于生成脚本 / 重新生成）。 */
export function toTopicItem(dto: IpTopicDto): TopicItem {
  return {
    title: dto.title,
    topicType: dto.topicType as TopicItem["topicType"],
    painPoint: dto.painPoint,
    value: dto.value,
    hook: dto.hook,
    creative: dto.creative,
    scores: normalizeScores(dto.scores),
    scoreBasis: {
      hotspot: dto.scoreBasis.hotspot ?? "",
      pain: dto.scoreBasis.pain ?? "",
      ipFit: dto.scoreBasis.ipFit ?? "",
      differentiation: dto.scoreBasis.differentiation ?? "",
      spread: dto.scoreBasis.spread ?? "",
      commercial: dto.scoreBasis.commercial ?? "",
    },
    potentialStars: dto.potentialStars,
    potentialReason: dto.potentialReason,
    recommendReason: dto.recommendReason,
  };
}
