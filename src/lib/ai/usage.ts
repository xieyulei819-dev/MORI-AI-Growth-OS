import { headers } from "next/headers";

import {
  AI_VISITOR_HEADER,
  AI_VISITOR_ID_PATTERN,
} from "@/lib/ai/visitor";
import { prisma } from "@/lib/db";

export { AI_VISITOR_COOKIE, AI_VISITOR_HEADER } from "@/lib/ai/visitor";

function readPositiveInt(name: string, fallback: number) {
  const parsed = Number((process.env[name] ?? "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function isPublicAiDemo() {
  const raw = (process.env.DEMO_MODE ?? "true").trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

export type AiUsagePolicy = {
  limited: boolean;
  visitorLimit: number;
  dailyLimit: number;
  minuteLimit: number;
  maxInputChars: number;
  maxOutputTokens: number;
  requestTimeoutMs: number;
  staleReservationMs: number;
  timezone: string;
};

export function getAiUsagePolicy(): AiUsagePolicy {
  const requestTimeoutMs = Math.min(
    120_000,
    readPositiveInt("AI_REQUEST_TIMEOUT_MS", 120_000),
  );
  return {
    limited: isPublicAiDemo(),
    visitorLimit: Math.min(3, readPositiveInt("AI_DEMO_LIMIT", 3)),
    dailyLimit: readPositiveInt("DAILY_AI_LIMIT", 100),
    minuteLimit: readPositiveInt("AI_RATE_LIMIT_PER_MINUTE", 10),
    maxInputChars: Math.min(100_000, readPositiveInt("AI_MAX_INPUT_CHARS", 60_000)),
    maxOutputTokens: Math.min(8_192, readPositiveInt("AI_MAX_TOKENS", 4_096)),
    requestTimeoutMs,
    staleReservationMs: requestTimeoutMs + 60_000,
    timezone: (process.env.AI_DAILY_TIMEZONE ?? "Asia/Shanghai").trim() || "Asia/Shanghai",
  };
}

export type AiExperienceErrorCode =
  | "DEMO_LIMIT_REACHED"
  | "DAILY_LIMIT_REACHED"
  | "AI_RATE_LIMITED"
  | "AI_INPUT_TOO_LONG"
  | "VISITOR_ID_MISSING";

export class AiExperienceError extends Error {
  code: AiExperienceErrorCode;
  status: number;
  details?: unknown;

  constructor(code: AiExperienceErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AiExperienceError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isAiExperienceError(error: unknown): error is AiExperienceError {
  return error instanceof AiExperienceError;
}

export async function getRequestVisitorId() {
  const requestHeaders = await headers();
  const visitorId = requestHeaders.get(AI_VISITOR_HEADER)?.trim() ?? "";
  if (!AI_VISITOR_ID_PATTERN.test(visitorId)) {
    throw new AiExperienceError(
      "VISITOR_ID_MISSING",
      "无法识别当前访客，请刷新页面后重试。",
      400,
    );
  }
  return visitorId;
}

export function dayKey(date = new Date(), timeZone = getAiUsagePolicy().timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export type AiUsageSnapshot = {
  limited: boolean;
  visitorLimit: number;
  used: number;
  reserved: number;
  remaining: number;
  allowed: boolean;
  daily: {
    date: string;
    limit: number;
    used: number;
    remaining: number;
    exhausted: boolean;
  };
  rate: {
    minuteLimit: number;
    windowUsed: number;
  };
};

export async function getAiUsageSnapshot(
  visitorId?: string,
  policy = getAiUsagePolicy(),
): Promise<AiUsageSnapshot> {
  if (!policy.limited) {
    return {
      limited: false,
      visitorLimit: policy.visitorLimit,
      used: 0,
      reserved: 0,
      remaining: policy.visitorLimit,
      allowed: true,
      daily: {
        date: dayKey(new Date(), policy.timezone),
        limit: policy.dailyLimit,
        used: 0,
        remaining: policy.dailyLimit,
        exhausted: false,
      },
      rate: { minuteLimit: policy.minuteLimit, windowUsed: 0 },
    };
  }

  const resolvedVisitorId = visitorId ?? (await getRequestVisitorId());
  const today = dayKey(new Date(), policy.timezone);
  const [usage, daily] = await Promise.all([
    prisma.aiVisitorUsage.findUnique({
      where: { visitorId: resolvedVisitorId },
      select: {
        successCount: true,
        inFlightCount: true,
        lastReservedAt: true,
        windowStartedAt: true,
        windowCount: true,
      },
    }),
    prisma.aiDailyUsage.findUnique({
      where: { day: today },
      select: { requestCount: true },
    }),
  ]);

  const used = usage?.successCount ?? 0;
  const now = Date.now();
  const inFlightIsStale = usage
    ? usage.lastReservedAt.getTime() < now - policy.staleReservationMs
    : false;
  const reserved = inFlightIsStale ? 0 : (usage?.inFlightCount ?? 0);
  const windowUsed = usage && now - usage.windowStartedAt.getTime() < 60_000 ? usage.windowCount : 0;
  const dailyUsed = daily?.requestCount ?? 0;
  const dailyRemaining = Math.max(0, policy.dailyLimit - dailyUsed);

  return {
    limited: true,
    visitorLimit: policy.visitorLimit,
    used,
    reserved,
    remaining: Math.max(0, policy.visitorLimit - used - reserved),
    allowed:
      used + reserved < policy.visitorLimit &&
      dailyRemaining > 0 &&
      windowUsed < policy.minuteLimit,
    daily: {
      date: today,
      limit: policy.dailyLimit,
      used: dailyUsed,
      remaining: dailyRemaining,
      exhausted: dailyRemaining === 0,
    },
    rate: { minuteLimit: policy.minuteLimit, windowUsed },
  };
}

async function reserveVisitorSlot(visitorId: string, policy: AiUsagePolicy) {
  const now = new Date();
  const staleCutoff = new Date(now.getTime() - policy.staleReservationMs);
  const minuteCutoff = new Date(now.getTime() - 60_000);

  return prisma.$executeRaw`
    INSERT INTO "AiVisitorUsage"
      ("visitorId", "successCount", "inFlightCount", "windowStartedAt", "windowCount", "lastReservedAt", "createdAt", "updatedAt")
    VALUES
      (${visitorId}, 0, 1, ${now}, 1, ${now}, ${now}, ${now})
    ON CONFLICT("visitorId") DO UPDATE SET
      "inFlightCount" = CASE WHEN "lastReservedAt" <= ${staleCutoff} THEN 1 ELSE "inFlightCount" + 1 END,
      "windowCount" = CASE WHEN "windowStartedAt" <= ${minuteCutoff} THEN 1 ELSE "windowCount" + 1 END,
      "windowStartedAt" = CASE WHEN "windowStartedAt" <= ${minuteCutoff} THEN ${now} ELSE "windowStartedAt" END,
      "lastReservedAt" = ${now},
      "updatedAt" = ${now}
    WHERE
      (CASE WHEN "lastReservedAt" <= ${staleCutoff} THEN 0 ELSE "successCount" + "inFlightCount" END)
        < ${policy.visitorLimit}
      AND ("windowStartedAt" <= ${minuteCutoff} OR "windowCount" < ${policy.minuteLimit})
  `;
}

async function reserveDailySlot(day: string, policy: AiUsagePolicy) {
  const now = new Date();
  return prisma.$executeRaw`
    INSERT INTO "AiDailyUsage" ("day", "requestCount", "createdAt", "updatedAt")
    VALUES (${day}, 1, ${now}, ${now})
    ON CONFLICT("day") DO UPDATE SET
      "requestCount" = "requestCount" + 1,
      "updatedAt" = ${now}
    WHERE "requestCount" < ${policy.dailyLimit}
  `;
}

async function releaseVisitorSlot(visitorId: string) {
  await prisma.$executeRaw`
    UPDATE "AiVisitorUsage"
    SET
      "inFlightCount" = CASE WHEN "inFlightCount" > 0 THEN "inFlightCount" - 1 ELSE 0 END,
      "updatedAt" = ${new Date()}
    WHERE "visitorId" = ${visitorId}
  `;
}

async function commitSuccessfulCall(visitorId: string, policy: AiUsagePolicy) {
  const now = new Date();
  const changed = await prisma.$executeRaw`
    UPDATE "AiVisitorUsage"
    SET
      "successCount" = "successCount" + 1,
      "inFlightCount" = CASE WHEN "inFlightCount" > 0 THEN "inFlightCount" - 1 ELSE 0 END,
      "updatedAt" = ${now}
    WHERE "visitorId" = ${visitorId}
      AND "successCount" < ${policy.visitorLimit}
  `;
  if (changed !== 1) {
    throw new Error("AI 用量写入失败：访客额度记录未按预期更新。");
  }
}

export type AiUsageReservation = {
  limited: boolean;
  commit: () => Promise<void>;
  release: () => Promise<void>;
};

/**
 * Reserves one outbound provider call atomically. Visitor success counts are
 * committed only after a schema-valid response; failures release only the
 * visitor slot. The daily counter intentionally counts every attempt.
 */
export async function reserveAiUsage(
  visitorId?: string,
  policy = getAiUsagePolicy(),
): Promise<AiUsageReservation> {
  if (!policy.limited) {
    return {
      limited: false,
      commit: async () => undefined,
      release: async () => undefined,
    };
  }

  const resolvedVisitorId = visitorId ?? (await getRequestVisitorId());
  const visitorReserved = await reserveVisitorSlot(resolvedVisitorId, policy);
  if (visitorReserved !== 1) {
    const snapshot = await getAiUsageSnapshot(resolvedVisitorId, policy);
    if (snapshot.rate.windowUsed >= policy.minuteLimit) {
      throw new AiExperienceError(
        "AI_RATE_LIMITED",
        "请求过于频繁，请稍后再试。",
        429,
        { retryAfterSeconds: 60 },
      );
    }
    throw new AiExperienceError(
      "DEMO_LIMIT_REACHED",
      "Demo体验次数已用完，每位访客最多体验3次。",
      429,
      { used: snapshot.used, limit: snapshot.visitorLimit, remaining: snapshot.remaining },
    );
  }

  const today = dayKey(new Date(), policy.timezone);
  const dailyReserved = await reserveDailySlot(today, policy);
  if (dailyReserved !== 1) {
    await releaseVisitorSlot(resolvedVisitorId);
    throw new AiExperienceError(
      "DAILY_LIMIT_REACHED",
      "今日 Demo 体验额度已用完，请明日再试。",
      429,
      { date: today, limit: policy.dailyLimit },
    );
  }

  let settled = false;
  return {
    limited: true,
    commit: async () => {
      if (settled) return;
      settled = true;
      await commitSuccessfulCall(resolvedVisitorId, policy);
    },
    release: async () => {
      if (settled) return;
      settled = true;
      await releaseVisitorSlot(resolvedVisitorId);
    },
  };
}
