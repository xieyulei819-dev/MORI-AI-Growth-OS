import { NextResponse } from "next/server";

import { getAiUsageSnapshot } from "@/lib/ai/usage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const usage = await getAiUsageSnapshot();
  return NextResponse.json(
    { ok: true, data: usage },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
