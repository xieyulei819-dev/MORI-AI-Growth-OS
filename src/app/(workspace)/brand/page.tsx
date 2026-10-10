import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { getBusinessContext } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BrandPage() {
  const context = await getBusinessContext();
  const { brand, product, personas, competitors } = context;
  const self = competitors.find((competitor) => competitor.isSelf);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Brand Center"
        title="品牌中心"
        titleEn="Brand Center"
        description="品牌、产品与人群定义是全部 AI 分析的上下文来源。修改这里的字段，AI 输出会随之变化。"
        meta={
          <>
            <Badge tone="moss">{brand.name}</Badge>
            <Badge tone="neutral">{brand.nameEn}</Badge>
            <DemoTag />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>品牌定位</CardTitle>
              <CardDescription>Brand Positioning</CardDescription>
            </div>
            <Badge tone="moss">{brand.positioning.split("·")[0].trim()}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[13px] leading-relaxed text-ink-muted">{brand.description}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Info label="品牌名称" value={brand.name} />
              <Info label="英文 / 品牌名" value={brand.nameEn} />
              <Info label="品牌定位" value={brand.positioning} />
              <Info label="价格区间" value={brand.priceRange} />
              <Info label="目标用户" value={brand.targetAudience} className="sm:col-span-2" />
            </dl>
            <div>
              <p className="label-text mb-2">核心渠道</p>
              <div className="flex flex-wrap gap-1.5">
                {brand.channels.map((channel) => (
                  <Badge key={channel} tone="clay">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="label-text mb-2">品牌关键词</p>
              <div className="flex flex-wrap gap-1.5">
                {brand.keywords.map((keyword) => (
                  <Badge key={keyword} tone="moss">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>核心产品</CardTitle>
              <CardDescription>Hero Product</CardDescription>
            </div>
            <Badge tone="neutral">{product.category}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="surface-muted px-4 py-3.5">
              <p className="text-[14px] font-semibold">{product.name}</p>
              <p className="mt-1 text-[12px] text-ink-muted">{product.positioning}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="data-value text-[20px] font-semibold">{formatCurrency(product.price)}</span>
                <Badge tone="neutral">{product.volume}</Badge>
              </div>
            </div>
            <ListBlock title="核心卖点" items={product.keyBenefits} tone="moss" />
            <ListBlock title="卖点解释（可用于内容与素材）" items={product.sellingPoints} />
            <ListBlock title="使用场景" items={product.usageScenario} />
            <ListBlock title="合规与可信度说明" items={product.credibility} tone="warn" />
          </CardContent>
        </Card>
      </div>

      <Section title="品牌人群" titleEn="Audience Definition" description="3 个核心 Persona 定义了内容与素材的语料方向。">
        <div className="grid gap-3.5 md:grid-cols-3">
          {personas.map((persona) => (
            <Card key={persona.id}>
              <CardHeader>
                <div>
                  <CardTitle>{persona.name}</CardTitle>
                  <CardDescription>
                    {persona.ageBand} 岁 · {persona.occupation}
                  </CardDescription>
                </div>
                <Badge tone="moss">{(persona.share * 100).toFixed(0)}%</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-[12px] italic leading-relaxed text-ink-muted">「{persona.quote}」</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {persona.contentPreferences.slice(0, 3).map((item) => (
                    <Badge key={item} tone="neutral">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="品牌资产与竞品坐标" titleEn="Brand Assets">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>竞品坐标（自评）</CardTitle>
                <CardDescription>价格带与专业度自评，用于驱动市场分析。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Info label="价格带" value={self?.priceTier ?? "—"} />
              <Info label="专业度（0–100）" value={String(self?.professional ?? 0)} />
              <Info label="主要优势" value={self?.strength ?? "—"} />
              <Info label="主要弱点" value={self?.weakness ?? "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>品牌资产清单</CardTitle>
                <CardDescription>面向增长运营的品牌资产盘点（Demo）。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ListBlock
                title="已有资产"
                items={[
                  "产品卖点与成分说明（可公开信息，无功效承诺）",
                  "3 个核心 Persona 与内容偏好定义",
                  "5 个 Campaign 与 10 条素材的历史结构",
                  "30 天投放数据与分人群表现切片",
                ]}
              />
              <ListBlock
                title="需要补齐的资产"
                items={[
                  "第三方检测或临床数据（当前无，因此不做功效型对比）",
                  "真实用户长期使用记录（30 天以上）",
                  "价格与单次成本的可视化解释物料",
                  "品牌专业度背书（皮肤科/专业人士共创内容）",
                ]}
                tone="warn"
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      <p className="text-[11px] leading-relaxed text-ink-soft">
        MORI 森屿 为虚拟品牌，所有数据均为 Demo / 模拟业务数据，不冒充真实公司，也不代表任何真实商业成绩。
      </p>
    </div>
  );
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="label-text">{label}</dt>
      <dd className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{value}</dd>
    </div>
  );
}

function ListBlock({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "moss" | "warn";
}) {
  const dot = tone === "moss" ? "bg-moss" : tone === "warn" ? "bg-tone-warn" : "bg-ink-soft";
  return (
    <div>
      <p className="label-text mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink-muted">
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
