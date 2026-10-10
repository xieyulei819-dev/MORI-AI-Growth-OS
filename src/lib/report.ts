import type { GrowthReport } from "@/lib/ai/schemas";

export type ReportMeta = {
  generatedAt: string;
  mode: string;
  model: string;
  promptVersion: string;
  dataLabel: string;
  agentNotes?: string;
};

export function reportToMarkdown(report: GrowthReport, meta: ReportMeta): string {
  const lines: string[] = [];
  lines.push(`# ${report.title}`);
  lines.push("");
  lines.push(
    `> 数据来源：${meta.dataLabel} ｜ 生成方式：${meta.mode === "ai" ? `AI (${meta.model})` : "Demo 结构化分析引擎"} ｜ Prompt ${meta.promptVersion} ｜ ${meta.generatedAt}`,
  );
  lines.push("");
  lines.push("## 1. Executive Summary");
  lines.push(report.executiveSummary);
  lines.push("");
  lines.push("## 2. Performance");
  lines.push(report.performance);
  lines.push("");
  lines.push("## 3. Audience");
  lines.push(report.audience);
  lines.push("");
  lines.push("## 4. Content");
  lines.push(report.content);
  lines.push("");
  lines.push("## 5. Campaign");
  lines.push(report.campaign);
  lines.push("");
  lines.push("## 6. Key Insights");
  report.keyInsights.forEach((insight, index) => {
    lines.push(`### 洞察 ${index + 1}：${insight.title}`);
    lines.push(insight.body);
    lines.push(`- 证据：${insight.evidence}`);
    lines.push(`- 置信度：${insight.confidence}/100`);
    lines.push("");
  });
  lines.push("## 7. Recommendations");
  report.recommendations.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("## 8. Experiments");
  report.experiments.forEach((experiment) => {
    lines.push(`### ${experiment.name}`);
    lines.push(`- A：${experiment.variantA}`);
    lines.push(`- B：${experiment.variantB}`);
    lines.push(`- 主指标：${experiment.metric}`);
    lines.push(`- 成功标准：${experiment.successCriteria}`);
    lines.push("");
  });
  lines.push("## Outlook");
  lines.push(report.outlook);
  lines.push("");
  lines.push("---");
  lines.push("Demo / 模拟业务数据 — MORI AI Growth OS 作品集项目，不构成真实业务结论。");
  return lines.join("\n");
}

/** Line-by-line plain text used by the client-side PDF export. */
export function reportToTextLines(report: GrowthReport, meta: ReportMeta): Array<{ text: string; style: "title" | "h2" | "h3" | "body" | "bullet" | "muted" }> {
  const lines: Array<{ text: string; style: "title" | "h2" | "h3" | "body" | "bullet" | "muted" }> = [];
  lines.push({ text: report.title, style: "title" });
  lines.push({
    text: `数据来源：${meta.dataLabel} ｜ 生成方式：${meta.mode === "ai" ? `AI (${meta.model})` : "Demo 结构化分析引擎"} ｜ ${meta.generatedAt}`,
    style: "muted",
  });

  const section = (title: string, body: string) => {
    lines.push({ text: title, style: "h2" });
    body.split("\n").forEach((paragraph) => lines.push({ text: paragraph, style: "body" }));
  };

  section("1. Executive Summary", report.executiveSummary);
  section("2. Performance", report.performance);
  section("3. Audience", report.audience);
  section("4. Content", report.content);
  section("5. Campaign", report.campaign);

  lines.push({ text: "6. Key Insights", style: "h2" });
  report.keyInsights.forEach((insight) => {
    lines.push({ text: insight.title, style: "h3" });
    lines.push({ text: insight.body, style: "body" });
    lines.push({ text: `证据：${insight.evidence}（置信度 ${insight.confidence}/100）`, style: "muted" });
  });

  lines.push({ text: "7. Recommendations", style: "h2" });
  report.recommendations.forEach((item) => lines.push({ text: item, style: "bullet" }));

  lines.push({ text: "8. Experiments", style: "h2" });
  report.experiments.forEach((experiment) => {
    lines.push({ text: experiment.name, style: "h3" });
    lines.push({ text: `A：${experiment.variantA}`, style: "bullet" });
    lines.push({ text: `B：${experiment.variantB}`, style: "bullet" });
    lines.push({ text: `主指标：${experiment.metric}｜成功标准：${experiment.successCriteria}`, style: "bullet" });
  });

  section("Outlook", report.outlook);
  lines.push({
    text: "Demo / 模拟业务数据 — MORI AI Growth OS 作品集项目，不构成真实业务结论。",
    style: "muted",
  });
  return lines;
}

export function reportFromStoredPayload(payload: string): GrowthReport | null {
  try {
    const parsed = JSON.parse(payload) as GrowthReport;
    if (!parsed || typeof parsed !== "object" || !parsed.title) return null;
    return parsed;
  } catch {
    return null;
  }
}
