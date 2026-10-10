import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { CsvValidationError, parseCampaignCsv } from "@/lib/csv";
import { persistUploadedCsv } from "@/lib/data";
import { computeMetrics } from "@/lib/metrics";
import type { AgentRunMeta } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  fileName: z.string().min(1).max(160),
  csv: z.string().min(1).max(8_000_000),
  note: z.string().max(400).optional(),
});

const UPLOAD_META: AgentRunMeta = {
  mode: "demo",
  agent: "performance_analyst",
  model: "local",
  promptVersion: "v1.5",
  latencyMs: 0,
  generatedAt: new Date().toISOString(),
};

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    let result;
    try {
      result = parseCampaignCsv(parsed.data.csv);
    } catch (error) {
      if (error instanceof CsvValidationError) {
        return fail(error.code, error.message, 400, { issues: error.issues });
      }
      throw error;
    }

    const totals = computeMetrics(result.rows);
    const datasetName = `${parsed.data.fileName.replace(/\.csv$/i, "")} · ${result.rows.length} 行`;

    const persisted = await persistUploadedCsv(
      datasetName,
      result.rows,
      parsed.data.note ?? `上传时间 ${new Date().toISOString()}｜${result.platforms.join(" / ")}`,
    );

    return ok(
      {
        dataset: persisted.dataset,
        inserted: persisted.inserted,
        issues: result.issues,
        skippedRows: result.skippedRows,
        totalRows: result.totalRows,
        platforms: result.platforms,
        creatives: result.creatives,
        dateRange: result.dateRange,
        totals,
      },
      UPLOAD_META,
    );
  } catch (error) {
    return serverError(error, "CSV 处理失败，请检查文件格式后重试。");
  }
}
