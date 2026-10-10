import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Progress, ScoreBar } from "@/components/ui/feedback";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EvaluationPage() {
  const records = await prisma.evaluationRecord.findMany({ orderBy: { createdAt: "asc" } });

  const average = (key: "completeness" | "relevance" | "actionability" | "accuracy" | "overall") =>
    records.length === 0 ? 0 : records.reduce((acc, row) => acc + row[key], 0) / records.length;

  const overallAverage = average("overall");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Evaluation"
        title="AI 输出质量评估"
        titleEn="Evaluation"
        description="对每个 Agent 的输出做四个维度评分：Completeness（完整性）、Relevance（相关性）、Actionability（可执行性）、Accuracy（与数据一致性）。"
        meta={
          <>
            <Badge tone="moss">评估记录 {records.length} 条</Badge>
            <Badge tone="neutral">平均分 {overallAverage.toFixed(1)}</Badge>
            <DemoTag />
          </>
        }
      />

      <Alert tone="warning" title="重要说明">
        这是 Demo Evaluation：评分基于本项目的方法论与模拟数据人工设定，用于演示“如何评估 AI 输出质量”，
        <strong>不代表真实生产环境中的准确率或商业效果</strong>。
      </Alert>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>维度平均分</CardTitle>
              <CardDescription>评分区间 0–100。</CardDescription>
            </div>
            <Badge tone={overallAverage >= 85 ? "good" : "warn"}>Overall {overallAverage.toFixed(1)}</Badge>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <ScoreBar label="Completeness 完整性" value={Number(average("completeness").toFixed(1))} />
            <ScoreBar label="Relevance 相关性" value={Number(average("relevance").toFixed(1))} />
            <ScoreBar label="Actionability 可执行性" value={Number(average("actionability").toFixed(1))} />
            <ScoreBar label="Accuracy 与数据一致性" value={Number(average("accuracy").toFixed(1))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>评估方法</CardTitle>
              <CardDescription>每个维度检查什么。</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-[12px] leading-relaxed text-ink-muted">
            <p>
              <span className="font-medium text-ink">Completeness</span>：是否覆盖任务要求的全部字段（例如投放分析必须包含诊断、原因、假设、素材结论、预算建议与实验）。
            </p>
            <p>
              <span className="font-medium text-ink">Relevance</span>：结论是否与目标人群、渠道与主题相关，而不是通用营销套话。
            </p>
            <p>
              <span className="font-medium text-ink">Actionability</span>：建议是否能直接执行（谁、做什么、看什么指标、多久复盘）。
            </p>
            <p>
              <span className="font-medium text-ink">Accuracy</span>：输出中的数字是否与数据库计算结果一致（可用指标引擎复算核对）。
            </p>
            <p className="text-ink-soft">
              自动化部分：JSON Schema 校验（结构合法性）与指标复算（数值一致性）由测试用例覆盖；语义质量部分为人工 Demo 评分。
            </p>
          </CardContent>
        </Card>
      </div>

      <Section title="任务评分明细" titleEn="Task Scores">
        <div className="surface overflow-hidden p-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="pl-5">任务</TH>
                <TH>Agent</TH>
                <TH className="text-right">完整性</TH>
                <TH className="text-right">相关性</TH>
                <TH className="text-right">可执行性</TH>
                <TH className="text-right">准确性</TH>
                <TH className="text-right">Overall</TH>
                <TH className="pr-5">评估说明</TH>
              </TR>
            </THead>
            <TBody>
              {records.map((record) => (
                <TR key={record.id}>
                  <TD className="pl-5 font-medium">{record.task}</TD>
                  <TD>
                    <Badge tone="neutral">{record.agent}</Badge>
                  </TD>
                  <TD className="text-right font-mono">{record.completeness}</TD>
                  <TD className="text-right font-mono">{record.relevance}</TD>
                  <TD className="text-right font-mono">{record.actionability}</TD>
                  <TD className="text-right font-mono">{record.accuracy}</TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono font-semibold">{record.overall}</span>
                      <Progress
                        value={record.overall}
                        tone={record.overall >= 88 ? "good" : record.overall >= 80 ? "moss" : "warn"}
                        className="w-16"
                      />
                    </div>
                  </TD>
                  <TD className="max-w-[360px] whitespace-normal text-[11.5px] leading-relaxed text-ink-muted pr-5">
                    {record.notes}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Section>

      <Section title="已知局限" titleEn="Limitations" description="主动说明边界，比夸大能力更可信。">
        <div className="grid gap-3.5 md:grid-cols-3">
          {[
            {
              title: "没有真实市场数据",
              body: "竞品、用户画像与投放数据都是模拟数据，结论只能验证工作流是否顺畅，不能验证真实市场效果。",
            },
            {
              title: "评分是人工 Demo 评分",
              body: "目前没有引入独立评估模型或人工标注集，Schema 合法性由测试覆盖，语义质量仍以人工评分为主。",
            },
            {
              title: "因果推断有限",
              body: "A/B 检验只覆盖素材层面的比例指标；预算、季节、促销等外部变量没有纳入模型。",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent>
                <p className="text-[13px] font-medium">{item.title}</p>
                <p className="prose-copy mt-1.5">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
