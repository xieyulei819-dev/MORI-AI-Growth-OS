"use client";

import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Separator } from "@/components/ui/feedback";
import { FieldGroup, Textarea } from "@/components/ui/field";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

type UploadIssue = { row: number; column: string; message: string; severity: "error" | "warning" };

type UploadData = {
  dataset: { id: string; name: string; rowCount: number; note: string };
  inserted: number;
  issues: UploadIssue[];
  skippedRows: number;
  totalRows: number;
  platforms: string[];
  creatives: string[];
  dateRange: { start: string; end: string } | null;
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    cpc: number;
    cvr: number;
    cpa: number;
    roas: number;
  };
};

type UploadResponse = {
  ok: boolean;
  data?: UploadData;
  error?: { code: string; message: string; details?: { issues?: UploadIssue[] } };
};

const EXPECTED_HEADER = "date,platform,campaign,creative,spend,impressions,clicks,conversions,revenue";

export function CsvUploader({ onUploaded }: { onUploaded?: (datasetId: string) => void }) {
  const router = useRouter();
  const [fileName, setFileName] = React.useState("");
  const [csv, setCsv] = React.useState("");
  const [state, setState] = React.useState<"idle" | "uploading" | "success" | "error">("idle");
  const [result, setResult] = React.useState<UploadData | null>(null);
  const [error, setError] = React.useState<{ code: string; message: string; issues: UploadIssue[] } | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const readFile = React.useCallback(async (file: File) => {
    setFileName(file.name);
    try {
      const text = await file.text();
      setCsv(text);
      setState("idle");
      setResult(null);
      setError(null);
    } catch {
      setError({ code: "READ_FAILED", message: "无法读取该文件，请确认是 UTF-8 编码的 CSV。", issues: [] });
      setState("error");
    }
  }, []);

  const upload = React.useCallback(async () => {
    if (!csv.trim()) {
      setError({ code: "EMPTY_FILE", message: "请先选择 CSV 文件或粘贴 CSV 内容。", issues: [] });
      setState("error");
      return;
    }

    setState("uploading");
    setError(null);
    try {
      const response = await fetch("/api/campaign/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: fileName || "pasted-campaign-data.csv", csv }),
      });
      const json = (await response.json()) as UploadResponse;

      if (!response.ok || !json.ok || !json.data) {
        setState("error");
        setError({
          code: json.error?.code ?? "UPLOAD_FAILED",
          message: json.error?.message ?? `上传失败（HTTP ${response.status}）`,
          issues: json.error?.details?.issues ?? [],
        });
        return;
      }

      setResult(json.data);
      setState("success");
      onUploaded?.(json.data.dataset.id);
    } catch (caught) {
      setState("error");
      setError({
        code: "NETWORK_ERROR",
        message: caught instanceof Error ? `网络或服务异常：${caught.message}` : "网络或服务异常",
        issues: [],
      });
    }
  }, [csv, fileName, onUploaded]);

  const previewLines = csv.split(/\r?\n/).filter(Boolean).slice(0, 4);
  const dataRowCount = Math.max(csv.split(/\r?\n/).filter(Boolean).length - 1, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>上传投放数据（CSV）</CardTitle>
            <CardDescription>
              字段要求：{EXPECTED_HEADER}。支持中文表头，以及带 ¥ / 千分位 / 百分号的数字。
            </CardDescription>
          </div>
          <a href="/api/campaign/sample" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            <Download className="h-3.5 w-3.5" /> 下载示例 CSV
          </a>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void readFile(file);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
              dragging ? "border-moss bg-moss/8" : "border-ink-line bg-surface-muted/50",
            )}
          >
            <UploadCloud className="h-6 w-6 text-ink-soft" />
            <p className="text-[13px] font-medium">拖拽 CSV 到这里，或选择文件</p>
            <p className="text-[11.5px] text-ink-muted">
              单文件最多 20,000 行；系统会自动清洗、计算指标并写入数据库。
            </p>
            <label className={cn(buttonVariants({ variant: "primary", size: "sm" }), "mt-1 cursor-pointer")}>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readFile(file);
                }}
              />
              选择文件
            </label>
            {fileName ? (
              <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                {fileName} · {dataRowCount} 行
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3.5 lg:grid-cols-2">
            <FieldGroup label="或直接粘贴 CSV 文本" hint="适合从报表后台直接复制数据。">
              <Textarea
                value={csv}
                onChange={(event) => {
                  setCsv(event.target.value);
                  setFileName("pasted-campaign-data.csv");
                }}
                placeholder={EXPECTED_HEADER + "\n2026-09-01,抖音,夜间修护 · 抖音效率拉新,熬夜党晚间修护,4290,162000,3900,196,26600"}
                className="min-h-[132px] font-mono text-[11px]"
              />
            </FieldGroup>

            <div className="space-y-3">
              <p className="label-text">数据预览</p>
              {previewLines.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-line px-3.5 py-6 text-center text-[11.5px] text-ink-soft">
                  暂无内容
                </p>
              ) : (
                <div className="max-h-[150px] overflow-auto rounded-xl border border-ink-line bg-surface-muted/60 p-3 font-mono text-[10.5px] leading-relaxed text-ink-muted">
                  {previewLines.map((line) => (
                    <p key={line.slice(0, 32)} className="truncate">
                      {line}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="moss" size="sm" loading={state === "uploading"} loadingLabel="上传并计算中…" onClick={upload}>
                  上传并计算指标
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCsv("");
                    setFileName("");
                    setResult(null);
                    setError(null);
                    setState("idle");
                  }}
                >
                  清空
                </Button>
              </div>
            </div>
          </div>

          {state === "error" && error ? (
            <div className="mt-4 space-y-3">
              <Alert tone="error" title={"CSV 校验失败（" + error.code + "）"}>
                {error.message}
              </Alert>
              {error.issues.length > 0 ? <IssueTable issues={error.issues} /> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {state === "success" && result ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>导入完成</CardTitle>
              <CardDescription>
                数据集「{result.dataset.name}」已写入数据库（{result.inserted} 行，跳过 {result.skippedRows} 行）。
              </CardDescription>
            </div>
            <Badge tone="good">+{result.inserted} 行</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MiniStat label="渠道" value={result.platforms.join(" / ")} />
              <MiniStat label="素材数" value={String(result.creatives.length)} />
              <MiniStat
                label="日期范围"
                value={result.dateRange ? result.dateRange.start + " ~ " + result.dateRange.end : "—"}
              />
              <MiniStat label="总花费" value={formatCurrency(result.totals.spend)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <MiniStat label="曝光" value={formatNumber(result.totals.impressions)} />
              <MiniStat label="点击" value={formatNumber(result.totals.clicks)} />
              <MiniStat label="CTR" value={formatPercent(result.totals.ctr)} />
              <MiniStat label="CPC" value={formatCurrency(result.totals.cpc, { digits: 2 })} />
              <MiniStat label="转化" value={formatNumber(result.totals.conversions)} />
              <MiniStat label="ROAS" value={result.totals.roas.toFixed(2)} />
            </div>
            <Separator />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  router.push("/campaign?datasetId=" + result.dataset.id);
                  router.refresh();
                }}
              >
                在投放分析中使用该数据集
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                刷新数据集列表
              </Button>
              <span className="text-[11.5px] text-ink-muted">
                上传的数据与 Demo 数据集分开保存，可随时在设置中清除。
              </span>
            </div>
            {result.issues.length > 0 ? (
              <div className="space-y-2">
                <p className="label-text">数据质量提示（{result.issues.length} 条）</p>
                <IssueTable issues={result.issues} />
              </div>
            ) : (
              <Alert tone="success">数据质量检查通过：未发现空值、负值或口径异常。</Alert>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function IssueTable({ issues }: { issues: UploadIssue[] }) {
  return (
    <div className="max-h-[220px] overflow-auto rounded-xl border border-ink-line">
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH className="pl-4">行</TH>
            <TH>字段</TH>
            <TH>说明</TH>
            <TH className="pr-4">级别</TH>
          </TR>
        </THead>
        <TBody>
          {issues.slice(0, 60).map((issue, index) => (
            <TR key={issue.row + "-" + issue.column + "-" + index}>
              <TD className="pl-4 font-mono text-[11px]">{issue.row}</TD>
              <TD className="font-mono text-[11px]">{issue.column}</TD>
              <TD className="whitespace-normal text-[11.5px] text-ink-muted">{issue.message}</TD>
              <TD className="pr-4">
                <Badge tone={issue.severity === "error" ? "bad" : "warn"}>{issue.severity}</Badge>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-muted px-3.5 py-3">
      <p className="text-[10.5px] text-ink-soft">{label}</p>
      <p className="data-value mt-1 truncate text-[14px] font-semibold">{value}</p>
    </div>
  );
}
