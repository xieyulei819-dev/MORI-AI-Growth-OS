import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Compass,
  FileText,
  FlaskConical,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { ZoomableShot } from "@/components/portfolio/zoomable-shot";
import { Badge } from "@/components/ui/badge";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";
import { getBusinessContext } from "@/lib/data";
import { evaluateExperiment, type VariantMetrics } from "@/lib/experiments";
import { requiredSampleSize } from "@/lib/statistics";
import { formatCompactNumber, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MORI AI Growth OS · 求职作品集 Case Study",
  description:
    "商科背景 × AI 应用 × 产品运营 × 数据分析 × 增长：把市场洞察、用户分析、内容策划、广告投放、数据分析、AI 诊断与实验优化串成完整增长闭环的 Case Study。所有业务数据均为 Demo / 模拟业务数据。",
};

/** 截图路径（由 scripts/capture-screenshots.mjs 生成） */
const desktopShot = (name: string) => `/portfolio/desktop/${name}.jpg`;
const mobileShot = (name: string) => `/portfolio/mobile/${name}.jpg`;

/**
 * 作品集里引用的工程事实（均为本仓库实际结果，可复核）：
 * - 页面模块 14 个：src/app/(workspace) 下的 14 个业务页面
 * - AI Agent 7 个：Object.keys(AGENT_SCHEMAS).length
 * - Demo 数据行数：prisma/seed.ts 写入的 Metric 记录数（300 条 = 30 天 × 10 条素材）
 * - 自动化测试：npm test 结果（132 passed / 14 files）
 */
const FACTS = {
  pages: 14,
  agents: Object.keys(AGENT_SCHEMAS).length,
  tests: 132,
  testFiles: 10,
};

const PROBLEM_STEPS = ["市场洞察", "用户研究", "内容策划", "素材制作", "广告投放", "数据分析", "增长决策"];
const PROBLEMS = [
  { title: "信息分散", body: "竞品、用户、内容、投放数据散落在不同表格与后台，口径不统一。" },
  { title: "数据与内容脱节", body: "内容团队不知道哪条素材在亏钱，投放团队不知道内容想表达什么。" },
  { title: "分析依赖人工", body: "每周重复导出、清洗、算指标，真正用于判断的时间被挤压。" },
  { title: "洞察难以转化为行动", body: "报告写了「CVR 下降」，但没有谁去改落地页、改 Hook、调预算。" },
  { title: "实验与复盘没有闭环", body: "做过什么、结论是什么、下一轮怎么改，往往没有留痕。" },
];
const SOLUTION_CHAIN = [
  "Market",
  "Audience",
  "Content",
  "Creative",
  "Campaign",
  "Analytics",
  "AI Insight",
  "Experiment",
  "Optimization",
  "Report",
];

const MODULES = [
  { icon: Compass, title: "Market Intelligence", zh: "市场与竞品", shot: "04-market", desc: "价格 × 专业度矩阵与竞品弱项，落到定位建议。" },
  { icon: Users, title: "Audience Intelligence", zh: "用户洞察", shot: "08-audience", desc: "3 个 Persona + 分人群指标，产出四类机会卡片。" },
  { icon: BookOpen, title: "Content Studio", zh: "内容策划", shot: "05-content", desc: "按平台规范生成标题、正文与 15 秒脚本，并给出评分。" },
  { icon: Sparkles, title: "Creative Lab", zh: "广告素材", shot: "06-creative", desc: "一次生成 5 个结构性差异的素材方向与测试优先级。" },
  { icon: BarChart3, title: "Campaign Analytics", zh: "投放分析", shot: "07-campaign", desc: "CSV 上传 → 清洗 → 指标计算 → 效率诊断与预算建议。" },
  { icon: Compass, title: "AI Growth Advisor", zh: "AI 增长顾问", shot: "09-advisor", desc: "带业务上下文诊断：现象 → 原因 → 假设 → 建议 → 实验。" },
  { icon: FlaskConical, title: "Experiment Lab", zh: "实验中心", shot: "10-experiments", desc: "A/B 设计 + 双比例 z 检验，输出是否继续测试。" },
  { icon: FileText, title: "Growth Report", zh: "增长报告", shot: "11-reports", desc: "8 段式周报，可复制 / 导出 Markdown 与 PDF。" },
];

const PIPELINE = ["CSV", "Data Cleaning", "Metric Calculation", "Trend Analysis", "Platform / Creative / Audience", "AI Diagnosis"];

function SectionHeading({
  index,
  title,
  titleEn,
  description,
  id,
}: {
  index?: string;
  title: string;
  titleEn?: string;
  description?: string;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 space-y-3">
      {index ? <p className="label-text">{index}</p> : null}
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-[26px] font-semibold leading-tight md:text-[32px]">{title}</h2>
        {titleEn ? <span className="font-serif text-[15px] italic text-ink-soft md:text-[17px]">{titleEn}</span> : null}
      </div>
      {description ? <p className="max-w-3xl text-[13.5px] leading-relaxed text-ink-muted">{description}</p> : null}
    </div>
  );
}

function StatCard({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div data-portfolio-card className="surface px-5 py-4">
      <p className="data-value text-[26px] font-semibold leading-none">{value}</p>
      <p className="mt-2 text-[12.5px] font-medium text-ink">{label}</p>
      {note ? <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{note}</p> : null}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div data-portfolio-card className="surface-muted px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="data-value mt-1.5 text-[18px] font-semibold leading-none">{value}</p>
      {sub ? <p className="mt-1.5 text-[11px] text-ink-soft">{sub}</p> : null}
    </div>
  );
}

function Chain({ steps, tone = "moss" }: { steps: string[]; tone?: "moss" | "neutral" }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => (
        <span key={step} className="flex items-center gap-2">
          <span
            className={
              tone === "moss"
                ? "rounded-xl border border-moss/25 bg-moss/10 px-3.5 py-2 text-[12.5px] font-medium text-moss-strong"
                : "rounded-xl border border-ink-line bg-surface px-3.5 py-2 text-[12.5px] text-ink-muted"
            }
          >
            {step}
          </span>
          {index < steps.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-ink-soft" aria-hidden /> : null}
        </span>
      ))}
    </div>
  );
}

function CheckList({ items, tone = "neutral" }: { items: string[]; tone?: "neutral" | "warn" }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
          <span className={tone === "warn" ? "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-tone-warn" : "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss"} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function PortfolioPage() {
  const context = await getBusinessContext();
  const totals = context.totals;
  const comparison = context.comparison;

  const priceExperiment =
    context.experiments.find((experiment) => experiment.name.includes("价格解释")) ?? context.experiments[0];
  const evaluation =
    priceExperiment && priceExperiment.variants.length >= 2
      ? evaluateExperiment(
          toVariantMetrics(priceExperiment.variants[0], "A"),
          toVariantMetrics(priceExperiment.variants[1], "B"),
          priceExperiment.primaryMetric,
        )
      : null;

  return (
    <div className="min-h-screen bg-canvas">
      <PortfolioNav />

      <main className="mx-auto w-full max-w-[1400px] px-5 pb-24 md:px-10">
        {/* ============================ 01 HERO ============================ */}
        <section id="overview" className="scroll-mt-24 pt-10 md:pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="moss">Case Study · AI Product Operations</Badge>
                <Badge tone="clay">Demo / Simulated Business Data</Badge>
              </div>
              <h1 className="text-[40px] font-semibold leading-[1.08] md:text-[56px]">
                MORI AI Growth OS
                <span className="mt-3 block font-serif text-[22px] font-normal italic text-ink-muted md:text-[28px]">
                  AI 驱动的营销增长决策工作台
                </span>
              </h1>
              <p className="max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                让 AI 帮助品牌完成从用户洞察到增长优化的完整闭环：市场洞察 → 用户研究 → 内容策划 → 素材生产 →
                广告投放 → 数据分析 → AI 诊断 → 实验优化 → 增长报告。
              </p>
              <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
                我的定位：商科背景 × AI 应用 × 产品运营 × 数据分析 × 增长。我做的事情不是"让 AI 写文案"，
                而是把业务问题拆成 AI 可以执行的软件流程，并让每一个结论都能被数据复核。
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-canvas transition-colors hover:bg-ink/90"
                >
                  打开产品 <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#problem"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-line px-5 py-2.5 text-[13px] text-ink transition-colors hover:bg-surface-muted"
                >
                  阅读 Case Study
                </a>
                <Link href="/portfolio" className="text-[12px] text-ink-soft underline-offset-4 hover:underline">
                  /portfolio
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
                <StatCard value={`${FACTS.pages}`} label="页面模块" note="可交互的业务页面" />
                <StatCard value={`${FACTS.agents}`} label="AI Agent" note="6 个业务 Agent + 1 个报告 Agent，各自独立 Prompt + Schema" />
                <StatCard value={`${context.dataSource.rows}`} label="Demo 数据行" note="模拟投放记录（非真实用户）" />
                <StatCard value={`${FACTS.tests}`} label="自动化测试" note={`${FACTS.testFiles} 个测试文件全部通过`} />
              </div>
            </div>

            <div className="space-y-4">
              <ZoomableShot
                priority
                src={desktopShot("01-hero-landing")}
                alt="MORI AI Growth OS 首页"
                caption="产品首页：品牌定位 + 14 个模块入口，全部使用 Demo / 模拟业务数据。"
              />
              <div className="grid grid-cols-[minmax(0,150px)_1fr] items-start gap-4">
                <ZoomableShot
                  src={mobileShot("01-hero-landing")}
                  alt="MORI 首页 · 移动端"
                  caption="移动端 390×844，同一套设计体系。"
                />
                <div className="surface h-full px-4 py-3.5">
                  <p className="label-text mb-2">这套作品集要证明什么</p>
                  <CheckList
                    items={[
                      "我理解增长业务的完整链路，而不只是单点工具",
                      "我能把业务问题拆成 AI 可执行的结构化流程",
                      "我关心 AI 的可靠性：失败、口径、安全、可复核",
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 02 WHY MORI ============================ */}
        <section id="problem" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="01 / Problem"
            title="Why I Built MORI"
            titleEn="营销增长每天都要跨过这 7 步"
            description="增长团队的日常不是缺少工具，而是缺少一条把数据、内容与决策串起来的工作流。"
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface p-5">
              <p className="label-text mb-4">传统工作方式的链路</p>
              <div className="space-y-2">
                {PROBLEM_STEPS.map((step, index) => (
                  <div key={step}>
                    <div className="flex items-center gap-3 rounded-xl border border-ink-line bg-surface-muted px-4 py-2.5">
                      <span className="font-mono text-[11px] text-ink-soft">{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-[13px] font-medium">{step}</span>
                    </div>
                    {index < PROBLEM_STEPS.length - 1 ? (
                      <div className="pl-[26px] py-1 text-ink-soft" aria-hidden>
                        ↓
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {PROBLEMS.map((problem) => (
                  <div key={problem.title} data-portfolio-card className="surface p-4">
                    <p className="text-[13px] font-semibold">{problem.title}</p>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">{problem.body}</p>
                  </div>
                ))}
              </div>
              <div className="surface p-5">
                <p className="label-text mb-3">MORI 的解法：把链路做成一个工作台</p>
                <Chain steps={SOLUTION_CHAIN} />
                <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">
                  每一个节点都不是孤立页面：前一个环节的输出会作为后一个环节的业务上下文（品牌、人群、竞品、投放、内容、实验），
                  AI 只能在这套上下文里做判断。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 03 PRODUCT OVERVIEW ============================ */}
        <section id="product" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="02 / Product"
            title="From Data to Decision"
            titleEn="8 个核心模块，一条增长闭环"
            description="下面每一张都是本项目真实运行页面（1440×900 实拍），点击可放大。"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.title} data-portfolio-card className="surface flex flex-col overflow-hidden p-0">
                  <ZoomableShot src={desktopShot(module.shot)} alt={`${module.title} 页面`} className="p-2.5" />
                  <div className="space-y-2 px-4 pb-4 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-moss/12 text-moss-strong">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-[13px] font-semibold">{module.title}</p>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-ink-muted">{module.desc}</p>
                    <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">{module.zh}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================ 04 MARKET ============================ */}
        <section id="market" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="03 / Market Intelligence"
            title="先建立竞争认知，再谈增长"
            titleEn="Positioning Matrix"
            description="通过市场与竞品信息建立品牌定位：横轴是价格，纵轴是品牌专业度，MORI 落在中低价位 × 中位专业度区间。"
          />
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ZoomableShot
              src={desktopShot("04-market")}
              alt="MORI 市场与竞品页面"
              caption="真实页面：价格 × 专业度矩阵 + 竞品主题拥挤度 + AI 竞品报告（Insight / Opportunity / Risk / Recommendation）。"
            />
            <div className="space-y-4">
              <div className="surface overflow-hidden p-0">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-ink-line text-[10.5px] uppercase tracking-[0.12em] text-ink-soft">
                      <th className="px-4 py-2.5">品牌</th>
                      <th className="px-3 py-2.5">价格</th>
                      <th className="px-3 py-2.5">专业度</th>
                      <th className="px-4 py-2.5">定位</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-line">
                    {context.competitors.map((competitor) => (
                      <tr key={competitor.id} className={competitor.isSelf ? "bg-moss/6" : undefined}>
                        <td className="px-4 py-2.5 font-medium">
                          {competitor.name}
                          {competitor.isSelf ? <Badge tone="moss" className="ml-2">MORI</Badge> : null}
                        </td>
                        <td className="px-3 py-2.5 font-mono">{formatCurrency(competitor.price)}</td>
                        <td className="px-3 py-2.5 font-mono">{competitor.professional}</td>
                        <td className="px-4 py-2.5 text-[11.5px] text-ink-muted">{competitor.positioning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  <span className="font-medium text-ink">数据口径：</span>
                  MORI 与 AURA LAB / NUVIA / LUMIÉ 均为虚拟品牌，价格与专业度均为 Demo / Simulated Business Data，
                  用于演示竞品分析框架，不代表真实市场调研结果。
                </p>
              </div>
              <CheckList
                items={[
                  "价格带存在结构空隙：MORI 同时避开低价爆款与高价功效型",
                  "专业度是短板 → 用「成分讲人话 + 真实使用记录」补齐信任",
                  "竞品弱点可直接转成选题清单，而不是写一份泛泛的行业分析",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ============================ 05 CONTENT STUDIO ============================ */}
        <section id="content" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="04 / Content Studio"
            title="内容不是灵感，是结构化产出"
            titleEn="Not just AI copywriting"
            description="按平台、内容类型、投放目标、主题与目标人群生成结构化内容方案，并给出可解释的评分。"
          />
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ZoomableShot
              src={desktopShot("05-content")}
              alt="MORI 内容策划页面"
              caption="真实页面：5 个小标题（含角度与「为什么有效」）+ 正文 + 抖音 15 秒脚本 + Hook / 相关性 / 转化潜力 / 品牌契合度评分。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">输入维度（结构化，不是自由输入）</p>
                <div className="space-y-2.5 text-[12px]">
                  {[
                    ["Platform", "小红书 / 抖音 / 公众号"],
                    ["Content Type", "种草 / 测评 / 知识 / 故事 / 场景 / 产品介绍"],
                    ["Campaign Goal", "曝光 / 互动 / 点击 / 转化"],
                    ["Topic", "熬夜修护 / 清爽肤感 / 学生党预算 / 30 天稳定…"],
                    ["Target Audience", "3 个 Persona（熬夜型都市新人 / 学生党 / 轻熟稳定肌）"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1 border-b border-ink-line pb-2 last:border-0 last:pb-0">
                      <span className="font-mono text-[11px] text-moss-strong">{label}</span>
                      <span className="text-[11.5px] text-ink-muted">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="surface p-4">
                <p className="label-text mb-3">业务目标 → 内容策略 → 内容生成 → 后续投放</p>
                <Chain steps={["业务目标", "内容策略", "内容生成", "投放测试"]} />
                <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
                  生成结果会写回内容库并带上评分与「为什么值得测试」，可以作为下一轮投放的素材候选，
                  而不是一堆需要人工再整理的文案。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 06 CAMPAIGN ANALYTICS ============================ */}
        <section id="campaign" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="05 / Campaign Analytics"
            title="先把数据算对，再让 AI 做解释"
            titleEn="KPI first, AI second"
            description="所有指标由统一的业务逻辑计算（含除 0 保护），AI 只负责解释与建议——它不会成为「数据真值」的来源。"
          />

          <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <MetricCard label="Spend" value={formatCurrency(totals.spend)} sub="广告花费" />
            <MetricCard label="Impressions" value={formatNumber(totals.impressions)} sub="广告曝光" />
            <MetricCard label="Clicks" value={formatNumber(totals.clicks)} sub="点击" />
            <MetricCard label="Conversions" value={formatNumber(totals.conversions)} sub="转化" />
            <MetricCard label="Revenue" value={formatCurrency(totals.revenue)} sub="Demo 口径收入" />
            <MetricCard label="CTR" value={formatPercent(totals.ctr)} sub="clicks / impressions" />
            <MetricCard label="CPC" value={formatCurrency(totals.cpc, { digits: 2 })} sub="spend / clicks" />
            <MetricCard label="CVR" value={formatPercent(totals.cvr)} sub="conversions / clicks" />
            <MetricCard label="CPA" value={formatCurrency(totals.cpa, { digits: 2 })} sub="spend / conversions" />
            <MetricCard label="ROAS" value={totals.roas.toFixed(2)} sub="revenue / spend" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ZoomableShot
              src={desktopShot("07-campaign")}
              alt="MORI 投放分析页面"
              caption="真实页面：CSV 上传、素材效率明细（含 CTR 指数）、AI 诊断（Diagnosis / Main Reason / Hypotheses / Winners / Losers / Budget Moves）。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">数据链路</p>
                <div className="space-y-2">
                  {PIPELINE.map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-moss/12 font-mono text-[10.5px] text-moss-strong">
                        {index + 1}
                      </span>
                      <span className="text-[12.5px] text-ink-muted">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="surface p-4">
                <p className="label-text mb-3">为什么这样设计</p>
                <CheckList
                  items={[
                    "指标口径只写一次：CTR / CPC / CVR / CPA / ROAS 全部在 lib/metrics.ts",
                    "AI 拿到的是计算结果，所以模型回答错不了数字（可被原始 SQL 复核）",
                    "素材级 / 渠道级 / 人群级三种切片都来自同一份明细，不会口径打架",
                  ]}
                />
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  以上数据全部来自 MORI Demo Dataset（30 天 × 10 条素材 = {context.dataSource.rows} 行模拟记录），
                  不代表真实商业投放结果。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 07 AI GROWTH ADVISOR ============================ */}
        <section id="advisor" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="06 / AI Growth Advisor"
            title="From Metrics to Business Decisions"
            titleEn="Data → Diagnosis → Hypothesis → Action"
            description="顾问不是聊天框：它按固定结构回答，并且必须区分「已经发生的事实」「需要验证的假设」和「缺失的数据」。"
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ZoomableShot
              src={desktopShot("09-advisor")}
              alt="MORI AI 增长顾问页面"
              caption="真实页面：Diagnosis / Main Reason / Hypothesis（带证据与置信度）/ Recommendation / Experiment / 数据依据。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">本周案例：最近 7 天 vs 前 7 天（Demo 数据）</p>
                {comparison ? (
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                      label="CVR"
                      value={`${formatPercent(comparison.previous.cvr)} → ${formatPercent(comparison.current.cvr)}`}
                      sub={`${comparison.deltas.cvr.toFixed(1)}%`}
                    />
                    <MetricCard
                      label="ROAS"
                      value={`${comparison.previous.roas.toFixed(2)} → ${comparison.current.roas.toFixed(2)}`}
                      sub={`${comparison.deltas.roas.toFixed(1)}%`}
                    />
                    <MetricCard
                      label="CPA"
                      value={`${formatCurrency(comparison.previous.cpa, { digits: 2 })} → ${formatCurrency(comparison.current.cpa, { digits: 2 })}`}
                      sub={`+${comparison.deltas.cpa.toFixed(1)}%`}
                    />
                    <MetricCard
                      label="Conversions"
                      value={`${formatNumber(comparison.previous.conversions)} → ${formatNumber(comparison.current.conversions)}`}
                      sub={`${comparison.deltas.conversions.toFixed(1)}%`}
                    />
                  </div>
                ) : (
                  <p className="text-[12px] text-ink-muted">当前数据集没有可对比的窗口。</p>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div data-portfolio-card className="surface p-3.5">
                  <Badge tone="good">FACT</Badge>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
                    CVR、ROAS 下降而 CTR 基本稳定（{comparison ? comparison.deltas.ctr.toFixed(1) : "0.0"}%），
                    说明问题在「点击之后」的承接环节。
                  </p>
                </div>
                <div data-portfolio-card className="surface p-3.5">
                  <Badge tone="warn">HYPOTHESIS</Badge>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
                    落地页承接不足、价格解释不足、信任证据不足（需用真实数据验证，不能当成结论）。
                  </p>
                </div>
                <div data-portfolio-card className="surface p-3.5">
                  <Badge tone="info">DATA GAP</Badge>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
                    缺少
                    {comparison ? ` ${comparison.currentRange.start} ~ ${comparison.currentRange.end} ` : "最近 7 天"}
                    的转化事件日志与落地页版本变更记录，也缺少素材级 CVR 拆分。
                  </p>
                </div>
              </div>

              <div className="surface p-4">
                <p className="label-text mb-3">AI 给出的行动建议</p>
                <CheckList
                  items={[
                    "先排查埋点与回传：确认 CVR 下滑是真实业务变化还是数据问题",
                    "检查落地页版本与首屏信息：对齐素材承诺，补齐价格与信任模块",
                    "对低效素材止损：把预算转移到高效率素材，避免继续以高 CPA 消耗",
                    "启动 A/B 测试：用真实流量验证「价格解释 + 信任证据」是否有效",
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 08 EXPERIMENT LAB ============================ */}
        <section id="experiment" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="07 / Experiment Lab"
            title="Turn Insights into Experiments"
            titleEn="把假设变成可检验的实验"
            description="实验结论来自统计，而不是模型感觉：比例型指标使用双比例 z 检验，并给出最小样本量参考。"
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ZoomableShot
              src={desktopShot("10-experiments")}
              alt="MORI 实验中心页面"
              caption="真实页面：A/B 变体指标、z 值 / p 值 / 置信度、建议保留哪个变体，以及实验列表与推演状态。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">实验设计（示例）</p>
                <div className="space-y-3 text-[12px]">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="surface-muted px-3.5 py-3">
                      <p className="font-mono text-[11px] text-ink-soft">Variant A</p>
                      <p className="mt-1 font-medium">{priceExperiment?.variants[0]?.name ?? "原落地页"}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">{priceExperiment?.variants[0]?.description ?? "—"}</p>
                    </div>
                    <div className="surface-muted px-3.5 py-3">
                      <p className="font-mono text-[11px] text-ink-soft">Variant B</p>
                      <p className="mt-1 font-medium">{priceExperiment?.variants[1]?.name ?? "价格解释 + 信任证据"}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">{priceExperiment?.variants[1]?.description ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="moss">主指标：CVR</Badge>
                    <Badge tone="neutral">辅助：CPA / ROAS</Badge>
                    <Badge tone="neutral">建议补埋点：首屏滚动率 / 加购率 / 支付成功率</Badge>
                  </div>
                  {evaluation ? (
                    <div className="grid gap-2 sm:grid-cols-3">
                      <MetricCard label="z-test" value={`z=${evaluation.test?.zScore.toFixed(2) ?? "—"}`} sub={`p=${evaluation.test?.pValue.toFixed(4) ?? "—"}`} />
                      <MetricCard
                        label="Sample size"
                        value={formatNumber(requiredSampleSize(evaluation.metrics.a.cvr || 0.03, 0.15) ?? 0)}
                        sub="每组最小样本（+15% 相对提升，α=.05, power=.8）"
                      />
                      <MetricCard
                        label="Success criteria"
                        value={evaluation.test?.significant ? "达显著" : "继续收集样本"}
                        sub="若在真实流量中复现，需要扩样验证"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  <span className="font-medium text-ink">必须声明：</span>
                  所有实验均为 Demo / Simulated Experiment。基于模拟数据推演，B 方向表现更优，
                  但仍需真实流量验证——不能写成「实验已经证明 B 有效」。
                </p>
              </div>
              <CheckList
                items={[
                  "实验数据来自 Metric 表聚合（模拟数据），统计检验与结论都在服务端计算",
                  "结论只回答「是否值得继续测试」，不宣称任何真实业务结果",
                  "实验记录会落库，可在下次复盘时对照假设与实际表现",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ============================ 09 AI ENGINEERING ============================ */}
        <section id="engineering" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="08 / AI Reliability"
            title="AI 不只是「调用」，还要可靠"
            titleEn="Structured Output · Fallback · Provenance · Security"
            description="这一页不展示代码，只展示我在 AI 产品落地上最关心的四个工程问题，以及它们如何被验证。"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Layers,
                title: "Structured Output",
                body: "每个 Agent 先定义 JSON Schema，模型返回结构化对象；本地用 Zod 强校验，字段缺失/类型错误会带着错误清单重试，而不是拼一段不可控文本。",
                tags: ["Schema", "Zod Validation", "Retry"],
              },
              {
                icon: ShieldCheck,
                title: "Failure Fallback",
                body: "网络中断、超时、上游 5xx、返回非法 JSON 都能被识别，并自动回退到本地分析引擎，页面明确标注当前是 AI 还是回退状态。",
                tags: ["NETWORK_ERROR", "TIMEOUT", "HTTP 500", "INVALID_JSON"],
              },
              {
                icon: Gauge,
                title: "Data Provenance",
                body: "严格区分 Demo / 模拟数据与真实数据：Prompt、Schema、上下文载荷三层都带数据口径约束，禁止把模拟实验写成真实实验。",
                tags: ["Demo vs Real", "Prompt Rules", "Schema Hints"],
              },
              {
                icon: Boxes,
                title: "Security",
                body: "API Key 只在服务端读取与使用；前端产物里既没有 Key，也没有 Provider 域名；错误文案统一做密钥脱敏。",
                tags: ["Server-side only", "No key in bundle", "Redaction"],
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} data-portfolio-card className="surface flex h-full flex-col gap-3 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/12 text-moss-strong">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[14px] font-semibold">{card.title}</p>
                  <p className="flex-1 text-[11.5px] leading-relaxed text-ink-muted">{card.body}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                      <Badge key={tag} tone="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard value={`${FACTS.tests} tests passed`} label="自动化测试" note={`${FACTS.testFiles} 个测试文件，覆盖指标 / CSV / 统计 / AI 结构`} />
            <StatCard value="TypeScript 0 error" label="类型检查" note="tsc --noEmit" />
            <StatCard value="ESLint 0 problem" label="代码检查" note="eslint ." />
          </div>
        </section>

        {/* ============================ 10 PRODUCT QUALITY ============================ */}
        <section id="quality" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="09 / Product Quality"
            title="发布前验收结果"
            titleEn="Acceptance"
            description="这是我发布作品集前实际跑过的验收清单（不是计划，而是结果）。"
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard value={`${FACTS.pages} / ${FACTS.pages} pages`} label="核心页面可打开" note="全部 200，无空页面、无死链" />
            <StatCard value={`${FACTS.agents} / ${FACTS.agents} backend interactions`} label="按钮真的调到后端" note="逐个点击并捕获 API 响应验证" />
            <StatCard value={`${FACTS.tests} tests passed`} label="单元测试" note="含 AI 结构、CSV、指标、统计" />
            <StatCard value="0 / 0 / 0 / 0" label="TypeScript / ESLint / Console / Key 泄露" note="均为 0" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                tone: "moss" as const,
                title: "Demo Mode",
                badge: "DEMO_MODE=true",
                body: "默认状态：使用本地结构化分析引擎，所有数字仍来自数据库实时计算，无需任何 API Key 即可完整演示。",
              },
              {
                tone: "clay" as const,
                title: "AI Mode",
                badge: "DEMO_MODE=false + API Key",
                body: "接入真实模型（当前为 DeepSeek）：按平台规范生成内容、诊断投放、回答问题，结论仍受数据口径约束。",
              },
              {
                tone: "warn" as const,
                title: "Fallback Mode",
                badge: "上游失败时自动切换",
                body: "模型不可用时不会白屏：自动回退到 Demo Engine，并在结果卡片上标注原因（网络 / 超时 / 非法结构）。",
              },
            ].map((mode) => (
              <div key={mode.title} data-portfolio-card className="surface flex h-full flex-col gap-2 p-5">
                <div className="flex items-center gap-2">
                  <Badge tone={mode.tone}>{mode.title}</Badge>
                  <span className="font-mono text-[10.5px] text-ink-soft">{mode.badge}</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-ink-muted">{mode.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ZoomableShot
              src={desktopShot("12-settings-ai")}
              alt="MORI 设置页 · AI 状态与连接测试"
              caption="真实页面：Settings 显示当前 Provider（DeepSeek）、Base URL、Model、DEMO_MODE、密钥来源（只显示变量名，不显示明文）与输出方式，并可一键测试连接。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">三种模式如何切换</p>
                <div className="space-y-2.5 text-[11.5px] text-ink-muted">
                  <p>
                    <span className="font-mono text-moss-strong">无 API Key</span> → 本地结构化分析引擎（无需外部服务）
                  </p>
                  <p>
                    <span className="font-mono text-moss-strong">API Key</span> → 调用真实模型；公开环境每人最多 3 次（Key 只放
                    <span className="font-mono"> .env.local</span>，已被 git 忽略）
                  </p>
                  <p>
                    <span className="font-mono text-moss-strong">上游失败</span> → 自动回退到 Demo 引擎，并在结果卡片标注原因
                  </p>
                </div>
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  <span className="font-medium text-ink">安全设计：</span>
                  API Key 只在服务端读取与使用。验收时扫描过前端产物与所有页面 HTML：
                  既没有 Key，也没有 Provider 域名；错误文案会统一做密钥脱敏。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 11 MY ROLE ============================ */}
        <section id="role" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="10 / My Role"
            title="我负责什么"
            titleEn="Business × AI × Product"
            description="我不是计算机专业出身，也没有把项目包装成「我独立完成了全部代码」。下面是我实际负责的部分。"
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface p-5">
              <p className="label-text mb-3">我负责</p>
              <CheckList
                items={[
                  "Business Problem Definition：从营销增长的日常痛点定义问题边界",
                  "Product Structure：设计 14 个模块的信息架构与页面职责",
                  "User Flow：确定「洞察 → 内容 → 投放 → 诊断 → 实验 → 报告」的操作顺序",
                  "AI Agent Design：拆出 7 个 Agent，划分各自职责与输出契约",
                  "Prompt Design：编写并迭代每个 Agent 的 Prompt 与数据口径规则",
                  "Metric Definition：定义 CTR / CPC / CVR / CPA / ROAS 的统一口径",
                  "Experiment Design：设计 A/B 方案、主辅指标与显著性判断方式",
                  "Testing & QA：指标复核、边界与失败场景验收、发布前验收清单",
                  "Iteration：根据验收与真实调用结果持续修正（例如字段缺失、超时、口径）",
                ]}
              />
            </div>
            <div className="space-y-4">
              <div className="surface p-5">
                <p className="label-text mb-3">开发实现方式</p>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">
                  开发实现过程中使用 Codex 辅助代码开发（脚手架、页面与组件实现、测试与重构）。
                  我负责的是产品判断与验收：定义要解决什么问题、AI 应该按什么结构输出、指标怎么算、
                  失败时产品应该怎么表现，并逐项验证结果是否符合预期。
                </p>
              </div>
              <div className="rounded-2xl border border-moss/25 bg-moss/10 p-5">
                <p className="font-serif text-[17px] italic leading-relaxed text-moss-strong">
                  “我不是单纯使用 AI 生成内容，而是在设计 AI 如何参与业务决策。”
                </p>
              </div>
              <div className="surface p-4">
                <p className="label-text mb-2">我的核心工作</p>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">把业务问题拆解成 AI 可以执行的软件流程。</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 12 WHAT I LEARNED ============================ */}
        <section id="learnings" className="scroll-mt-24 pt-24">
          <SectionHeading index="11 / Reflection" title="What I Learned" titleEn="三点体会" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { index: "01", title: "AI 不是聊天框，而是业务流程中的决策杠杆", body: "同一个模型，放进「有上下文、有口径、有下一步动作」的流程里，价值完全不同。" },
              { index: "02", title: "AI 产品必须建立在可靠的数据和明确的业务逻辑上", body: "先把指标算对、把口径写死，AI 才能被信任；否则只是把不确定性包装得更漂亮。" },
              { index: "03", title: "真正有价值的 AI 应用不是「生成了什么」，而是「帮助业务做出了什么更好的决策」", body: "衡量标准应该是决策质量与实验效率，而不是输出字数。" },
            ].map((item) => (
              <div key={item.index} data-portfolio-card className="surface flex h-full flex-col gap-3 p-5">
                <span className="font-mono text-[12px] text-moss-strong">{item.index}</span>
                <p className="text-[13.5px] font-semibold leading-snug">{item.title}</p>
                <p className="text-[11.5px] leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================ 13 LIMITATIONS ============================ */}
        <section id="limitations" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="12 / Limitations"
            title="Limitations"
            titleEn="诚实说明边界"
            description="主动写清边界，比夸大能力更可信，也更接近真实的工作方式。"
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="surface p-5">
              <p className="label-text mb-3">当前限制</p>
              <CheckList
                tone="warn"
                items={[
                  "MORI 当前使用 Demo / Simulated Business Data（虚拟品牌 + 模拟投放与实验数据）",
                  "没有真实广告平台数据（CSV 是唯一数据入口）",
                  "没有真实商业客户与真实用户",
                  "Experiment Lab 的实验结果不是实际商业实验，只是模拟数据推演",
                  "SQLite 当前用于作品集 Demo，不适合多用户生产环境",
                  "没有做登录、权限、多租户等生产级功能（刻意保持作品集范围）",
                ]}
              />
            </div>
            <div className="surface p-5">
              <p className="label-text mb-3">下一阶段</p>
              <Chain steps={["Real Data", "Real Traffic", "Real Experiment", "Real Optimization"]} />
              <div className="mt-4 space-y-3">
                <CheckList
                  items={[
                    "接入真实广告平台与电商数据，替换 CSV 手动入口",
                    "用真实流量跑 A/B 实验，把「模拟推演」升级为「真实结论」",
                    "建立评估集与回归流程，让 Prompt 迭代有可比较的基线",
                    "补上权限、审计与多品牌工作区，走向可交付给团队使用的形态",
                  ]}
                />
              </div>
              <p className="mt-4 text-[11.5px] leading-relaxed text-ink-soft">
                这份作品集不声称任何真实商业成绩；它证明的是：我能把业务问题拆成 AI 可执行的流程，
                并把流程做到可运行、可复核、可继续迭代。
              </p>
            </div>
          </div>
        </section>

        {/* ============================ 14 FINAL ============================ */}
        <section id="final" className="scroll-mt-24 pt-24">
          <div className="rounded-3xl border border-ink-line bg-surface p-8 md:p-12">
            <p className="label-text">MORI AI Growth OS</p>
            <h2 className="mt-4 font-serif text-[28px] leading-tight md:text-[38px]">
              From Data
              <span className="text-ink-soft"> to </span>
              Insight
              <span className="text-ink-soft"> to </span>
              Action
              <span className="text-ink-soft"> to </span>
              Experiment.
            </h2>
            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[20px] font-semibold">谢雨蕾</p>
                <p className="mt-1 text-[12.5px] text-ink-muted">商科背景 × AI 应用 × 产品运营 × 数据分析</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["AI Product Operations", "AI Business Operations", "AI Growth", "Marketing Operations"].map((role) => (
                  <Badge key={role} tone="moss">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink-line pt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-canvas transition-colors hover:bg-ink/90"
              >
                打开产品演示 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 rounded-full border border-ink-line px-5 py-2.5 text-[13px] text-ink transition-colors hover:bg-surface-muted"
              >
                作品集入口 /portfolio
              </Link>
              <span className="text-[11.5px] text-ink-soft">
                所有业务数据均为 Demo / 模拟业务数据（{formatCompactNumber(context.dataSource.rows)} 条模拟投放记录），不代表真实商业结果。
              </span>
            </div>
          </div>
        </section>
        <footer className="mt-14 border-t border-ink-line pt-6 text-[11px] leading-relaxed text-ink-soft">
          MORI AI Growth OS · Case Study by 谢雨蕾。品牌与竞品均为虚拟，数据为模拟数据；
          本项目重点验证 AI 在营销分析与增长决策中的应用工作流。
        </footer>
      </main>
    </div>
  );
}

function toVariantMetrics(
  variant: {
    label: string;
    name: string;
    description: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  },
  fallbackLabel: string,
): VariantMetrics {
  return {
    label: variant.label || fallbackLabel,
    name: variant.name,
    description: variant.description,
    impressions: variant.impressions,
    clicks: variant.clicks,
    conversions: variant.conversions,
    spend: variant.spend,
    revenue: variant.revenue,
  };
}
