import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, options?: { digits?: number; compact?: boolean }) {
  const digits = options?.digits ?? 0;
  if (!Number.isFinite(value)) return "—";
  if (options?.compact) {
    if (Math.abs(value) >= 100_000_000) return `¥${(value / 100_000_000).toFixed(2)}亿`;
    if (Math.abs(value) >= 10_000) return `¥${(value / 10_000).toFixed(1)}万`;
  }
  return `¥${value.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatNumber(value: number, digits = 0) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}亿`;
  if (Math.abs(value) >= 10_000) return `${(value / 10_000).toFixed(1)}万`;
  return formatNumber(value);
}

/** Accepts a ratio (0.0177) and renders it as a percentage string. */
export function formatPercent(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatRatio(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

export function formatSigned(value: number, digits = 1, suffix = "%") {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(digits)}${suffix}`;
}

export function formatDateLabel(input: Date | string, withYear = false) {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return withYear ? `${date.getUTCFullYear()}-${pad(month)}-${pad(day)}` : `${pad(month)}-${pad(day)}`;
}

export function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

export function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function dayKey(input: Date | string) {
  const date = typeof input === "string" ? new Date(input) : input;
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Percentage change between two numbers, guarded against division by zero. */
export function pctChange(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function safeJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    return [];
  } catch {
    return value
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export function toJsonArray(value: string[] | string): string {
  if (Array.isArray(value)) return JSON.stringify(value);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? value : JSON.stringify([value]);
  } catch {
    return JSON.stringify([value]);
  }
}

export function truncate(value: string, max = 120) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Scrubs anything that looks like a credential before it can reach a log line,
 * an API response or the UI. Used by the AI provider client and by the shared
 * API error handler, so a provider error body can never leak a key.
 */
const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/\b(sk-[A-Za-z0-9_-]{6,})/g, "sk-***"],
  [/\b(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi, "$1***"],
  [/\b(api[-_]?key|apikey|authorization|access[-_]?token|secret)\b(\s*[:=]\s*)["']?[A-Za-z0-9._~+/=-]{8,}["']?/gi, "$1$2***"],
  [/\b([A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})\b/g, "***jwt***"],
];

export function redactSecrets(input: unknown): string {
  const text = typeof input === "string" ? input : input instanceof Error ? input.message : String(input ?? "");
  return SECRET_PATTERNS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}
