import type { MetricRow } from "@/types";

export const CAMPAIGN_CSV_COLUMNS = [
  "date",
  "platform",
  "campaign",
  "creative",
  "spend",
  "impressions",
  "clicks",
  "conversions",
  "revenue",
] as const;

export type CampaignCsvColumn = (typeof CAMPAIGN_CSV_COLUMNS)[number];

export type CsvIssue = {
  row: number;
  column: string;
  message: string;
  severity: "error" | "warning";
};

export type CampaignCsvResult = {
  rows: MetricRow[];
  issues: CsvIssue[];
  totalRows: number;
  skippedRows: number;
  platforms: string[];
  creatives: string[];
  dateRange: { start: string; end: string } | null;
};

export type CsvErrorCode =
  | "EMPTY_FILE"
  | "MISSING_HEADER"
  | "MISSING_COLUMNS"
  | "NO_DATA_ROWS"
  | "TOO_MANY_ROWS";

export class CsvValidationError extends Error {
  code: CsvErrorCode;
  issues: CsvIssue[];

  constructor(code: CsvErrorCode, message: string, issues: CsvIssue[] = []) {
    super(message);
    this.name = "CsvValidationError";
    this.code = code;
    this.issues = issues;
  }
}

const HEADER_ALIASES: Record<CampaignCsvColumn, string[]> = {
  date: ["date", "日期", "day", "时间"],
  platform: ["platform", "平台", "渠道", "channel"],
  campaign: ["campaign", "广告计划", "计划", "campaign name", "计划名称"],
  creative: ["creative", "素材", "素材名称", "创意", "ad"],
  spend: ["spend", "花费", "消耗", "cost", "金额"],
  impressions: ["impressions", "曝光", "曝光量", "show", "展现"],
  clicks: ["clicks", "点击", "点击量", "click"],
  conversions: ["conversions", "转化", "转化数", "下单", "orders"],
  revenue: ["revenue", "收入", "gmv", "销售额", "成交金额"],
};

const MAX_ROWS = 20_000;

/** Minimal RFC4180-ish CSV parser: quotes, escaped quotes, CRLF, BOM. */
export function parseCsv(raw: string): string[][] {
  const text = raw.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\r") {
      if (text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((line) => line.some((cell) => cell.trim() !== ""));
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveHeaderMap(header: string[]) {
  const normalized = header.map(normalizeHeader);
  const map = new Map<CampaignCsvColumn, number>();

  (Object.keys(HEADER_ALIASES) as CampaignCsvColumn[]).forEach((column) => {
    const aliases = HEADER_ALIASES[column];
    const index = normalized.findIndex((cell) => aliases.some((alias) => normalizeHeader(alias) === cell));
    if (index >= 0) map.set(column, index);
  });

  return map;
}

export function parseNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const cleaned = value
    .replace(/[¥$€,\s]/g, "")
    .replace(/[%％]$/, "")
    .trim();
  if (cleaned === "" || cleaned === "-" || cleaned === "null" || cleaned === "NULL") return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct;

  const normalized = trimmed.replace(/[/.]/g, "-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const [, y, m, d] = match;
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    if (!Number.isNaN(date.getTime())) return date;
  }

  return null;
}

/**
 * Validates and maps an uploaded campaign CSV into metric rows.
 * Throws CsvValidationError for structural problems (empty file, missing
 * columns, no usable rows) and reports row-level issues as `issues`.
 */
export function parseCampaignCsv(raw: string): CampaignCsvResult {
  const trimmed = raw.replace(/^\uFEFF/, "").trim();
  if (!trimmed) {
    throw new CsvValidationError("EMPTY_FILE", "CSV 文件为空，请上传包含投放数据的文件。");
  }

  const table = parseCsv(raw);
  if (table.length === 0) {
    throw new CsvValidationError("EMPTY_FILE", "CSV 文件为空，请上传包含投放数据的文件。");
  }

  const [header, ...dataRows] = table;
  const headerMap = resolveHeaderMap(header);
  const missing = CAMPAIGN_CSV_COLUMNS.filter((column) => !headerMap.has(column));

  if (missing.includes("date") && header.length === 1 && header[0].trim().length > 0 && dataRows.length === 0) {
    throw new CsvValidationError("MISSING_HEADER", "CSV 缺少表头行，请包含 date, platform, campaign, creative, spend, impressions, clicks, conversions, revenue。");
  }

  if (missing.length > 0) {
    throw new CsvValidationError(
      "MISSING_COLUMNS",
      `CSV 缺少必要字段：${missing.join(", ")}`,
      missing.map((column) => ({
        row: 1,
        column,
        message: `缺少字段 ${column}`,
        severity: "error" as const,
      })),
    );
  }

  if (dataRows.length === 0) {
    throw new CsvValidationError("NO_DATA_ROWS", "CSV 只有表头，没有数据行。");
  }

  if (dataRows.length > MAX_ROWS) {
    throw new CsvValidationError(
      "TOO_MANY_ROWS",
      `数据行数超过 ${MAX_ROWS} 行的上限（当前 ${dataRows.length} 行），请拆分文件后重试。`,
    );
  }

  const rows: MetricRow[] = [];
  const issues: CsvIssue[] = [];
  let skippedRows = 0;

  dataRows.forEach((cells, index) => {
    const lineNumber = index + 2; // 1-based, +1 for header
    const get = (column: CampaignCsvColumn) => cells[headerMap.get(column) ?? -1];

    const date = parseDate(get("date"));
    if (!date) {
      skippedRows += 1;
      issues.push({
        row: lineNumber,
        column: "date",
        message: `无法解析日期 “${(get("date") ?? "").trim() || "空"}”，已跳过该行`,
        severity: "error",
      });
      return;
    }

    const platform = (get("platform") ?? "").trim();
    const campaign = (get("campaign") ?? "").trim();
    const creative = (get("creative") ?? "").trim();

    if (!platform || !campaign || !creative) {
      skippedRows += 1;
      issues.push({
        row: lineNumber,
        column: "creative",
        message: "platform / campaign / creative 存在空值，已跳过该行",
        severity: "error",
      });
      return;
    }

    const numericColumns: Array<Exclude<CampaignCsvColumn, "date" | "platform" | "campaign" | "creative">> = [
      "spend",
      "impressions",
      "clicks",
      "conversions",
      "revenue",
    ];

    const values: Record<string, number> = {};
    let hasError = false;

    numericColumns.forEach((column) => {
      const parsed = parseNumber(get(column));
      if (parsed === null) {
        // Missing numeric fields are treated as 0 (common in exported reports)
        // but surfaced as a warning so the operator can verify the export.
        issues.push({
          row: lineNumber,
          column,
          message: `${column} 字段为空或非数字，已按 0 处理`,
          severity: "warning",
        });
        values[column] = 0;
        return;
      }
      if (parsed < 0) {
        issues.push({
          row: lineNumber,
          column,
          message: `${column} 为负数（${parsed}），已按 0 处理`,
          severity: "error",
        });
        values[column] = 0;
        hasError = true;
        return;
      }
      values[column] = parsed;
    });

    if (hasError) {
      skippedRows += 1;
      return;
    }

    if (values.impressions === 0) {
      issues.push({
        row: lineNumber,
        column: "impressions",
        message: "曝光为 0，CTR/CPC 会按 0 处理（避免除 0）",
        severity: "warning",
      });
    } else if (values.clicks > values.impressions) {
      issues.push({
        row: lineNumber,
        column: "clicks",
        message: "点击数大于曝光数，可能是数据口径问题，请检查导出",
        severity: "warning",
      });
    }

    if (values.conversions > values.clicks) {
      issues.push({
        row: lineNumber,
        column: "conversions",
        message: "转化数大于点击数，可能是回传口径问题，请检查导出",
        severity: "warning",
      });
    }

    rows.push({
      date,
      platform,
      campaign,
      creative,
      spend: values.spend,
      impressions: Math.round(values.impressions),
      clicks: Math.round(values.clicks),
      conversions: Math.round(values.conversions),
      revenue: values.revenue,
    });
  });

  if (rows.length === 0) {
    throw new CsvValidationError(
      "NO_DATA_ROWS",
      "所有数据行都无法解析，请检查日期与数字字段格式。",
      issues.slice(0, 20),
    );
  }

  const timestamps = rows.map((row) => new Date(row.date).getTime());

  return {
    rows,
    issues: issues.slice(0, 200),
    totalRows: dataRows.length,
    skippedRows,
    platforms: Array.from(new Set(rows.map((row) => row.platform))),
    creatives: Array.from(new Set(rows.map((row) => row.creative))),
    dateRange: {
      start: new Date(Math.min(...timestamps)).toISOString().slice(0, 10),
      end: new Date(Math.max(...timestamps)).toISOString().slice(0, 10),
    },
  };
}

export function rowsToCsv(rows: MetricRow[]): string {
  const header = CAMPAIGN_CSV_COLUMNS.join(",");
  const lines = rows.map((row) =>
    [
      typeof row.date === "string" ? row.date : row.date.toISOString().slice(0, 10),
      row.platform,
      row.campaign,
      row.creative,
      row.spend,
      row.impressions,
      row.clicks,
      row.conversions,
      row.revenue,
    ]
      .map((value) => {
        const text = String(value);
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
      })
      .join(","),
  );
  return [header, ...lines].join("\n");
}
