import { NextResponse } from "next/server";

import { rowsToCsv } from "@/lib/csv";
import { getDemoMetricRows } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Downloads a ready-to-upload sample CSV exported from the demo dataset. */
export async function GET() {
  const rows = await getDemoMetricRows(90);
  const csv = rowsToCsv(
    rows.map((row) => ({
      ...row,
      date: new Date(row.date).toISOString().slice(0, 10),
    })),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mori-campaign-sample.csv"',
    },
  });
}
