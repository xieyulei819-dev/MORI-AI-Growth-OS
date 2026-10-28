import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { callStructured } from "@/lib/ai/client";
import {
  AiExperienceError,
  dayKey,
  getAiUsagePolicy,
  getAiUsageSnapshot,
  reserveAiUsage,
} from "@/lib/ai/usage";
import { prisma } from "@/lib/db";

const ProbeSchema = z.object({ ok: z.boolean() });
const VISITORS = [
  "00000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-000000000002",
  "00000000-0000-4000-8000-000000000003",
  "00000000-0000-4000-8000-000000000004",
];

function providerResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: '{"ok":true}' }, finish_reason: "stop" }] }),
    text: async () => "{}",
  } as unknown as Response;
}

async function callProbe(visitorId: string) {
  return callStructured({
    schema: ProbeSchema,
    schemaName: "quota_probe",
    systemPrompt: "Return JSON.",
    userPrompt: "Return { ok: true }.",
    visitorId,
  });
}

describe.sequential("anonymous AI usage quota", () => {
  beforeEach(async () => {
    process.env.DEMO_MODE = "true";
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "test-only-key";
    process.env.DAILY_AI_LIMIT = "100";
    process.env.AI_RATE_LIMIT_PER_MINUTE = "20";
    const today = dayKey(new Date(), getAiUsagePolicy().timezone);
    await prisma.aiVisitorUsage.deleteMany({ where: { visitorId: { in: VISITORS } } });
    await prisma.aiDailyUsage.deleteMany({ where: { day: today } });
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await prisma.aiVisitorUsage.deleteMany({ where: { visitorId: { in: VISITORS } } });
    const today = dayKey(new Date(), getAiUsagePolicy().timezone);
    await prisma.aiDailyUsage.deleteMany({ where: { day: today } });
  });

  it("allows exactly five successful calls and rejects the sixth before fetch", async () => {
    const fetchMock = vi.fn(async () => providerResponse());
    vi.stubGlobal("fetch", fetchMock);

    for (let index = 0; index < 5; index += 1) {
      await expect(callProbe(VISITORS[0])).resolves.toMatchObject({ mode: "json_schema" });
    }

    await expect(callProbe(VISITORS[0])).rejects.toMatchObject({
      code: "DEMO_LIMIT_REACHED",
      status: 429,
    });
    expect(fetchMock).toHaveBeenCalledTimes(5);

    const usage = await getAiUsageSnapshot(VISITORS[0], getAiUsagePolicy());
    expect(usage).toMatchObject({ used: 5, remaining: 0, allowed: false });
  });

  it("does not consume a visitor slot when the provider fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("fetch failed");
    }));

    await expect(callProbe(VISITORS[1])).rejects.toMatchObject({ code: "NETWORK_ERROR" });

    let usage = await getAiUsageSnapshot(VISITORS[1], getAiUsagePolicy());
    expect(usage).toMatchObject({ used: 0, reserved: 0, remaining: 5 });

    vi.stubGlobal("fetch", vi.fn(async () => providerResponse()));
    await callProbe(VISITORS[1]);
    usage = await getAiUsageSnapshot(VISITORS[1], getAiUsagePolicy());
    expect(usage.used).toBe(1);
  });

  it("allows at most five concurrent reservations", async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const fetchMock = vi.fn(async () => {
      await gate;
      return providerResponse();
    });
    vi.stubGlobal("fetch", fetchMock);

    const attempts = Array.from({ length: 6 }, (_, index) =>
      callProbe(VISITORS[2]).catch((error: unknown) => error),
    );
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5));
    release();
    const results = await Promise.all(attempts);

    expect(results.filter((item) => !(item instanceof Error))).toHaveLength(5);
    expect(results.filter((item) => item instanceof AiExperienceError)).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(5);

    const usage = await getAiUsageSnapshot(VISITORS[2], getAiUsagePolicy());
    expect(usage.used).toBe(5);
  });

  it("enforces the global daily cap before any provider request", async () => {
    process.env.DAILY_AI_LIMIT = "1";
    const first = await reserveAiUsage(VISITORS[3], getAiUsagePolicy());
    await first.release();

    await expect(
      reserveAiUsage(VISITORS[3], getAiUsagePolicy()),
    ).rejects.toMatchObject({ code: "DAILY_LIMIT_REACHED", status: 429 });
  });

  it("does not limit individual visitors outside public demo mode", async () => {
    process.env.DEMO_MODE = "false";
    const fetchMock = vi.fn(async () => providerResponse());
    vi.stubGlobal("fetch", fetchMock);

    for (let index = 0; index < 7; index += 1) {
      await callProbe(VISITORS[0]);
    }

    expect(fetchMock).toHaveBeenCalledTimes(7);
    expect(await prisma.aiVisitorUsage.findUnique({ where: { visitorId: VISITORS[0] } })).toBeNull();
  });
});
