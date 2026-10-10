import { AdvisorConsole } from "@/components/advisor/advisor-console";
import { MetaList } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { getBusinessContext } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdvisorPage() {
  const context = await getBusinessContext();
  const { totals, comparison, brand, product, personas, competitors, experiments } = context;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI Growth Advisor"
        title="AI 增长顾问"
        titleEn="AI Growth Advisor"
        description="带业务上下文的增长顾问：回答任何问题都会先取数、再诊断、再给出可执行动作与实验设计。它不是一个通用聊天窗口。"
        meta={
          <>
            <Badge tone="moss">{brand.name} · {product.name}</Badge>
            <Badge tone="neutral">已加载 {context.dataSource.rows} 行投放数据</Badge>
            <Badge tone="neutral">Persona {personas.length} · 竞品 {competitors.length} · 实验 {experiments.length}</Badge>
            <DemoTag />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <AdvisorConsole />

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>顾问当前掌握的数据</CardTitle>
                <CardDescription>这些上下文会随每一次提问一起发送给 Agent。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <MetaList
                title="业务上下文"
                items={[
                  `品牌与产品：${brand.name} / ${product.name}（${formatCurrency(product.price)}）`,
                  `人群：${personas.map((persona) => persona.name).join("、")}`,
                  `竞品：${competitors.filter((item) => !item.isSelf).map((item) => item.name).join("、")}`,
                  `投放数据：${context.dataSource.rows} 行 / ${context.period.days} 天 / ${context.platforms.length} 个渠道`,
                  `分人群数据：${context.audience.length} 个人群切片`,
                  `内容库：${context.contents.length} 条 · 实验：${context.experiments.length} 个`,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>当前账户快照</CardTitle>
                <CardDescription>顾问回答中的数字都来自这里。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-[12px]">
              <Row label="花费" value={formatCurrency(totals.spend)} />
              <Row label="CTR" value={formatPercent(totals.ctr)} />
              <Row label="CVR" value={formatPercent(totals.cvr)} />
              <Row label="CPA" value={formatCurrency(totals.cpa, { digits: 2 })} />
              <Row label="ROAS" value={totals.roas.toFixed(2)} />
              <Row
                label={`近 ${comparison?.windowDays ?? 7} 天 ROAS`}
                value={comparison ? comparison.current.roas.toFixed(2) : "—"}
                tone={(comparison?.deltas.roas ?? 0) < 0 ? "bad" : "good"}
              />
              <Row
                label="ROAS 环比"
                value={comparison ? `${comparison.deltas.roas.toFixed(1)}%` : "—"}
                tone={(comparison?.deltas.roas ?? 0) < 0 ? "bad" : "good"}
              />
              <Row
                label="CVR 环比"
                value={comparison ? `${comparison.deltas.cvr.toFixed(1)}%` : "—"}
                tone={(comparison?.deltas.cvr ?? 0) < 0 ? "bad" : "good"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>回答质量标准</CardTitle>
                <CardDescription>顾问被要求遵守的规则。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <MetaList
                title="约束"
                items={[
                  "必须引用输入数据中的具体数字，不能只给结论",
                  "必须说明如何排除其他解释（例如用 CTR 稳定排除素材失效）",
                  "数据不足时必须回答“数据不足”，并说明需要补充什么数据",
                  "禁止编造商业成绩，禁止功效与绝对化表述",
                  "输出必须是符合 JSON Schema 的结构化对象",
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Section title="示例问题" titleEn="Suggested Questions">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { q: "最近 ROAS 为什么下降？", d: "会给出 Diagnosis / Main Reason / Hypothesis / Recommendation / Experiment 五段式回答。" },
            { q: "哪些素材应该增加预算？", d: "会引用素材 ROAS、CPA 与预算占比，给出具体转移金额与观察窗口。" },
            { q: "18–24 岁女性为什么不买？", d: "会用分人群 CTR/CVR 对比，指出“有兴趣但缺购买理由”，并给出信任与价格解释内容。" },
          ].map((item) => (
            <Card key={item.q}>
              <CardContent>
                <p className="text-[13px] font-medium">「{item.q}」</p>
                <p className="prose-copy mt-1.5">{item.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-line pb-2 last:border-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span
        className={
          tone === "good" ? "font-mono text-tone-good" : tone === "bad" ? "font-mono text-tone-bad" : "font-mono text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
