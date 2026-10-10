import { ok, serverError } from "@/lib/api";
import { testAiConnection } from "@/lib/ai/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await testAiConnection();
    return ok(result, {
      mode: result.mode === "ai" ? "ai" : "demo",
      agent: "growth_advisor",
      model: result.model,
      promptVersion: "v2.0",
      latencyMs: result.latencyMs,
      generatedAt: new Date().toISOString(),
      warning: result.ok ? undefined : result.message,
    });
  } catch (error) {
    return serverError(error, "AI 连接测试失败。");
  }
}
