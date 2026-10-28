"use client";

import { Download, FileDown, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Alert, Progress, StatusBadge } from "@/components/ui/feedback";
import { notifyAiUsageChanged } from "@/lib/ai-usage-client";
import { reportToMarkdown, type ReportMeta } from "@/lib/report";
import type { GrowthReport } from "@/lib/ai/schemas";
import type { AgentRunMeta } from "@/types";

type GenerateResponse = {
  ok: boolean;
  data?: { id: string; report: GrowthReport; meta: Omit<ReportMeta, "agentNotes"> };
  meta?: AgentRunMeta;
  error?: { code: string; message: string };
};

export type ReportStudioProps = {
  datasetId?: string | null;
  initial?: { report: GrowthReport; meta: ReportMeta } | null;
};

export function ReportStudio({ datasetId, initial }: ReportStudioProps) {
  const router = useRouter();
  const [state, setState] = React.useState<"idle" | "loading" | "success" | "error">(initial ? "success" : "idle");
  const [payload, setPayload] = React.useState<{ report: GrowthReport; meta: ReportMeta } | null>(initial ?? null);
  const [meta, setMeta] = React.useState<AgentRunMeta | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pdfState, setPdfState] = React.useState<"idle" | "working" | "error">("idle");

  const generate = React.useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: datasetId ?? null }),
      });
      const json = (await response.json()) as GenerateResponse;
      if (!response.ok || !json.ok || !json.data) {
        setState("error");
        setError(json.error?.message ?? `生成失败（HTTP ${response.status}）`);
        return;
      }
      setPayload({ report: json.data.report, meta: json.data.meta });
      setMeta(json.meta ?? null);
      setState("success");
      router.refresh();
    } catch (caught) {
      setState("error");
      setError(caught instanceof Error ? `网络或服务异常：${caught.message}` : "网络或服务异常");
    } finally {
      notifyAiUsageChanged();
    }
  }, [datasetId, router]);

  const markdown = payload ? reportToMarkdown(payload.report, payload.meta) : "";

  const downloadMarkdown = React.useCallback(() => {
    if (!payload) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `MORI-growth-report-${payload.meta.generatedAt.slice(0, 10)}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [markdown, payload]);

  const downloadPdf = React.useCallback(async () => {
    if (!payload) return;
    setPdfState("working");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const marginX = 48;
      const maxWidth = 595 - marginX * 2;
      let cursorY = 56;

      const write = (text: string, size: number, style: "normal" | "bold" = "normal", gap = 6) => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, maxWidth) as string[];
        lines.forEach((line) => {
          if (cursorY > 780) {
            doc.addPage();
            cursorY = 56;
          }
          doc.text(line, marginX, cursorY);
          cursorY += size * 1.35;
        });
        cursorY += gap;
      };

      write(payload.report.title, 17, "bold", 10);
      write(
        `Data: ${payload.meta.dataLabel} | Engine: ${payload.meta.mode === "ai" ? payload.meta.model : "MORI demo engine"} | ${payload.meta.generatedAt}`,
        9,
        "normal",
        14,
      );

      const sections: Array<[string, string]> = [
        ["1. Executive Summary", payload.report.executiveSummary],
        ["2. Performance", payload.report.performance],
        ["3. Audience", payload.report.audience],
        ["4. Content", payload.report.content],
        ["5. Campaign", payload.report.campaign],
      ];
      sections.forEach(([title, body]) => {
        write(title, 12, "bold");
        write(body, 10, "normal", 12);
      });

      write("6. Key Insights", 12, "bold");
      payload.report.keyInsights.forEach((insight) => {
        write(insight.title, 10, "bold", 2);
        write(insight.body, 10);
        write(`Evidence: ${insight.evidence} (confidence ${insight.confidence}/100)`, 9, "normal", 10);
      });

      write("7. Recommendations", 12, "bold");
      payload.report.recommendations.forEach((item) => write(`- ${item}`, 10, "normal", 2));

      write("8. Experiments", 12, "bold");
      payload.report.experiments.forEach((experiment) => {
        write(experiment.name, 10, "bold", 2);
        write(`A: ${experiment.variantA}`, 9, "normal", 1);
        write(`B: ${experiment.variantB}`, 9, "normal", 1);
        write(`Primary metric: ${experiment.metric} | Success: ${experiment.successCriteria}`, 9, "normal", 8);
      });

      write("Outlook", 12, "bold");
      write(payload.report.outlook, 10, "normal", 12);
      write(
        "Demo / simulated business data - MORI AI Growth OS portfolio project. Not real business results.",
        8,
        "normal",
      );

      doc.save(`MORI-growth-report-${payload.meta.generatedAt.slice(0, 10)}.pdf`);
      setPdfState("idle");
    } catch (caught) {
      console.error(caught);
      setPdfState("error");
    }
  }, [payload]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>本周增长报告</CardTitle>
            <CardDescription>
              一键生成 8 个固定章节：Executive Summary / Performance / Audience / Content / Campaign / Key Insights /
              Recommendations / Experiments。
            </CardDescription>
          </div>
          <Badge tone="moss">
            <Sparkles className="h-3 w-3" /> Report Writer
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="moss" loading={state === "loading"} loadingLabel="Generating report…" onClick={generate}>
              <FileText className="h-3.5 w-3.5" /> 生成本周增长报告
            </Button>
            <CopyButton value={markdown} label="复制 Markdown" disabled={!payload} />
            <Button variant="outline" size="sm" onClick={downloadMarkdown} disabled={!payload}>
              <Download className="h-3.5 w-3.5" /> 下载 Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPdf}
              disabled={!payload}
              loading={pdfState === "working"}
              loadingLabel="生成 PDF…"
            >
              <FileDown className="h-3.5 w-3.5" /> 下载 PDF
            </Button>
            {meta ? <StatusBadge mode={meta.mode} warning={meta.warning} /> : null}
            {meta ? <Badge tone="neutral">{meta.model}</Badge> : null}
          </div>
          {pdfState === "error" ? <Alert tone="error" className="mt-3">PDF 生成失败，请改用 Markdown 下载。</Alert> : null}
          {state === "error" && error ? (
            <Alert tone="error" className="mt-3" title="生成失败">
              {error}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {payload ? (
        <article className="surface animate-fade-up space-y-6 p-6 md:p-8">
          <header className="space-y-2 border-b border-ink-line pb-5">
            <h2 className="text-2xl font-semibold">{payload.report.title}</h2>
            <p className="text-[11.5px] text-ink-soft">
              数据来源：{payload.meta.dataLabel} · 生成方式：
              {payload.meta.mode === "ai" ? `AI（${payload.meta.model}）` : "Demo 结构化分析引擎"} · Prompt{" "}
              {payload.meta.promptVersion} · {payload.meta.generatedAt}
            </p>
          </header>

          <ReportSection index={1} title="Executive Summary" body={payload.report.executiveSummary} />
          <ReportSection index={2} title="Performance" body={payload.report.performance} />
          <ReportSection index={3} title="Audience" body={payload.report.audience} />
          <ReportSection index={4} title="Content" body={payload.report.content} />
          <ReportSection index={5} title="Campaign" body={payload.report.campaign} />

          <section className="space-y-3">
            <h3 className="text-[15px] font-semibold">6. Key Insights</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {payload.report.keyInsights.map((insight) => (
                <div key={insight.title} className="surface-muted flex h-full flex-col gap-2 px-4 py-3.5">
                  <p className="text-[12.5px] font-semibold leading-snug">{insight.title}</p>
                  <p className="flex-1 text-[11.5px] leading-relaxed text-ink-muted">{insight.body}</p>
                  <Progress value={insight.confidence} tone="moss" />
                  <p className="text-[10.5px] leading-relaxed text-ink-soft">{insight.evidence}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-[15px] font-semibold">7. Recommendations</h3>
            <ol className="space-y-2">
              {payload.report.recommendations.map((item, index) => (
                <li key={item} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/12 font-mono text-[10px] text-moss-strong">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="text-[15px] font-semibold">8. Experiments</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {payload.report.experiments.map((experiment) => (
                <div key={experiment.name} className="surface-muted px-4 py-3.5">
                  <p className="text-[12.5px] font-semibold">{experiment.name}</p>
                  <div className="mt-2 space-y-1 text-[11.5px] text-ink-muted">
                    <p>A：{experiment.variantA}</p>
                    <p>B：{experiment.variantB}</p>
                    <p>
                      主指标：<span className="font-mono">{experiment.metric}</span>
                    </p>
                    <p className="text-ink-soft">成功标准：{experiment.successCriteria}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2 rounded-xl bg-surface-muted px-5 py-4">
            <h3 className="text-[15px] font-semibold">Outlook</h3>
            <p className="text-[12.5px] leading-relaxed text-ink-muted">{payload.report.outlook}</p>
          </section>
        </article>
      ) : (
        <Alert tone="info" title="还没有生成报告">
          点击「生成本周增长报告」，系统会读取当前数据集的全部指标、人群、内容与实验数据，输出 8 个章节的结构化周报。
        </Alert>
      )}
    </div>
  );
}

function ReportSection({ index, title, body }: { index: number; title: string; body: string }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[15px] font-semibold">
        {index}. {title}
      </h3>
      {body.split("\n").map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="text-[12.5px] leading-relaxed text-ink-muted">
          {paragraph}
        </p>
      ))}
    </section>
  );
}
