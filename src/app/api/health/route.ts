import { NextResponse } from "next/server";

import { agentStatusSummary } from "@/lib/ai/runner";
import { databaseHealthCheck } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const [database, agents] = await Promise.all([databaseHealthCheck(), Promise.resolve(agentStatusSummary())]);

  return NextResponse.json({
    ok: database.ok,
    checkedAt: new Date().toISOString(),
    database,
    ai: {
      mode: agents.mode,
      provider: agents.provider,
      model: agents.model,
      demoMode: agents.demoMode,
      apiKeyConfigured: agents.apiKeyConfigured,
      reason: agents.reason,
    },
    demoNotice: "MORI 为虚拟品牌，全部数据为 Demo / 模拟业务数据。",
  });
}
