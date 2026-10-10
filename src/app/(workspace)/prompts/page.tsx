import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Alert } from "@/components/ui/feedback";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { AGENT_LABELS, PROMPT_LIBRARY } from "@/lib/prompts";
import { prisma } from "@/lib/db";
import { zodToJsonSchema } from "@/lib/ai/json-schema";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const stored = await prisma.promptTemplate.findMany({ orderBy: { agent: "asc" } });
  const byAgent = new Map(stored.map((item) => [item.agent, item]));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Prompt Library"
        title="Prompt 管理"
        titleEn="Prompt Library"
        description="6 个专职 Agent + 1 个报告撰写 Agent，每个都有独立的 Prompt、版本号与 JSON Schema 输出契约。项目刻意不使用「一个大 Prompt」完成所有任务。"
        meta={
          <>
            <Badge tone="moss">Agent {PROMPT_LIBRARY.length} 个</Badge>
            <Badge tone="neutral">数据库记录 {stored.length} 条</Badge>
            <Badge tone="neutral">输出：Structured Outputs (JSON Schema)</Badge>
            <DemoTag />
          </>
        }
      />

      <Alert tone="info" title="为什么要拆分 Agent">
        每个 Agent 只负责一类判断（市场 / 用户 / 内容 / 素材 / 投放 / 增长）。这样每个 Prompt 的评估标准清晰、输出 Schema
        稳定、失败时可以单独回退，也方便在 Evaluation 页面分别打分。
      </Alert>

      <Section title="Agent 与 Prompt" titleEn="Agents" description="点击「查看 Prompt」展开完整系统提示词，可直接复制用于 AI 模式。">
        <div className="space-y-4">
          {PROMPT_LIBRARY.map((template, index) => {
            const dbRow = byAgent.get(template.agent);
            const schema = AGENT_SCHEMAS[template.agent];
            const jsonSchema = schema ? JSON.stringify(zodToJsonSchema(schema), null, 2) : "";
            const label = AGENT_LABELS[template.agent];

            return (
              <Card key={template.agent}>
                <CardHeader>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-moss/12 font-mono text-[12px] font-semibold text-moss-strong">
                        {index + 1}
                      </span>
                      <CardTitle>
                        {template.name} · {template.nameZh}
                      </CardTitle>
                      <Badge tone="moss">{dbRow?.version ?? template.version}</Badge>
                      <Badge tone="neutral">scope: {label?.scope ?? template.agent}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton value={dbRow?.body ?? template.body} label="复制 Prompt" />
                    <CopyButton value={jsonSchema} label="复制 Schema" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-soft">
                    <span className="font-mono">{schema ? "schema: " + template.outputSchema : "schema: n/a"}</span>
                    <span>·</span>
                    <span>{template.changelog}</span>
                  </div>

                  <details className="rounded-xl border border-ink-line bg-surface-muted/60">
                    <summary className="cursor-pointer px-4 py-2.5 text-[12.5px] font-medium">
                      查看 Prompt（{((dbRow?.body ?? template.body).length / 1000).toFixed(1)}k 字符）
                    </summary>
                    <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap px-4 pb-4 text-[11.5px] leading-relaxed text-ink-muted">
                      {dbRow?.body ?? template.body}
                    </pre>
                  </details>

                  <details className="rounded-xl border border-ink-line bg-surface-muted/60">
                    <summary className="cursor-pointer px-4 py-2.5 text-[12.5px] font-medium">
                      查看输出 JSON Schema（strict structured outputs）
                    </summary>
                    <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap px-4 pb-4 font-mono text-[11px] leading-relaxed text-ink-muted">
                      {jsonSchema}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title="版本策略" titleEn="Versioning" description="Prompt 变更必须记录版本与原因，避免“模型变差了”这类无法复盘的问题。">
        <div className="surface overflow-hidden p-0">
          <table className="w-full text-[12px]">
            <tbody className="divide-y divide-ink-line">
              {PROMPT_LIBRARY.map((template) => (
                <tr key={template.agent}>
                  <td className="px-5 py-3 font-medium">{template.name}</td>
                  <td className="px-3 py-3 font-mono text-ink-muted">{template.version}</td>
                  <td className="px-5 py-3 text-ink-muted">{template.changelog}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
