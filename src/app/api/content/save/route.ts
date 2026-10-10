import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  platform: z.string().min(1),
  contentType: z.string().min(1),
  goal: z.string().min(1),
  topic: z.string().min(1),
  audience: z.string().min(1),
  title: z.string().min(1),
  hook: z.string().min(1),
  body: z.string().min(1),
  cta: z.string().min(1),
  hookScore: z.number().min(0).max(100),
  relevanceScore: z.number().min(0).max(100),
  conversionScore: z.number().min(0).max(100),
  brandFitScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  whyTest: z.string().min(1),
  howToImprove: z.string().min(1),
  mode: z.enum(["demo", "ai", "fallback"]).default("demo"),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const created = await prisma.contentItem.create({
      data: {
        title: parsed.data.title,
        platform: parsed.data.platform,
        contentType: parsed.data.contentType,
        goal: parsed.data.goal,
        topic: parsed.data.topic,
        audience: parsed.data.audience,
        hook: parsed.data.hook,
        body: parsed.data.body,
        cta: parsed.data.cta,
        hookScore: Math.round(parsed.data.hookScore),
        relevanceScore: Math.round(parsed.data.relevanceScore),
        conversionScore: Math.round(parsed.data.conversionScore),
        brandFitScore: Math.round(parsed.data.brandFitScore),
        overallScore: Math.round(parsed.data.overallScore),
        whyTest: parsed.data.whyTest,
        howToImprove: parsed.data.howToImprove,
        status: "testing",
        mode: parsed.data.mode ?? "demo",
      },
    });

    return ok({ id: created.id, title: created.title, overallScore: created.overallScore }, {
      mode: parsed.data.mode ?? "demo",
      agent: "content_strategist",
      model: "local",
      promptVersion: "v1.4",
      latencyMs: 0,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return serverError(error, "保存内容失败，请稍后重试。");
  }
}
