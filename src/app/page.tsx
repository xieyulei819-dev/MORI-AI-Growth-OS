import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardCheck as FileCheck,
  Compass,
  FileText,
  FlaskConical,
  Megaphone,
  ScrollText,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODULES = [
  { href: "/ip", icon: Megaphone, title: "IP 智能选题", en: "IP Planner", text: "输入一个 IP，自动分析人设、联网找热点、生成选题池与评分、TOP 5、口播稿、镜头方案与 7 天内容计划。" },
  { href: "/dashboard", icon: BarChart3, title: "总览 Dashboard", en: "Overview", text: "8 个核心 KPI、趋势图、渠道结构与素材排行，全部由数据库实时计算。" },
  { href: "/brand", icon: Sparkles, title: "品牌中心", en: "Brand Center", text: "品牌定位、产品卖点、渠道与关键词，作为全部 AI 分析的上下文。" },
  { href: "/audience", icon: Users, title: "用户洞察", en: "Audience", text: "3 个 Persona + 分人群投放数据，AI 输出用户 / 内容 / 产品 / 广告机会。" },
  { href: "/market", icon: Compass, title: "市场与竞品", en: "Market", text: "价格 × 专业度矩阵、虚拟竞品对比、市场空白与切入建议。" },
  { href: "/content", icon: BookOpen, title: "内容策划", en: "Content Studio", text: "小红书标题与正文、抖音 15 秒脚本，并给出 Hook / 相关性 / 转化评分。" },
  { href: "/creative", icon: Sparkles, title: "广告素材", en: "Creative Lab", text: "一次生成 5 个结构性差异的素材方向，并给出测试优先级。" },
  { href: "/campaign", icon: BarChart3, title: "投放分析", en: "Campaign Analytics", text: "CSV 上传、指标自动计算、高效 / 低效素材识别与预算建议。" },
  { href: "/advisor", icon: Compass, title: "AI 增长顾问", en: "AI Advisor", text: "带业务上下文的诊断：Diagnosis → Reason → Hypothesis → Recommendation → Experiment。" },
  { href: "/experiments", icon: FlaskConical, title: "实验中心", en: "Experiment Lab", text: "创建 A/B 实验，自动做双比例 z 检验并给出是否继续测试的结论。" },
  { href: "/reports", icon: FileText, title: "增长报告", en: "Growth Report", text: "一键生成本周增长周报，可复制、可下载 Markdown 与 PDF。" },
  { href: "/prompts", icon: ScrollText, title: "Prompt 管理", en: "Prompt Library", text: "6 个 Agent 的独立 Prompt、版本号、输出 Schema 与变更记录。" },
  { href: "/evaluation", icon: FileCheck, title: "AI 评估", en: "Evaluation", text: "对 AI 输出的完整性、相关性、可执行性与准确性做 Demo 评估。" },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-serif text-[16px] font-semibold text-canvas">
            M
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-[16px] font-semibold">MORI 森屿</span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-ink-soft">Growth OS</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="clay">Demo / 模拟业务数据</Badge>
          <Link href="/portfolio" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Case Study
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
            进入工作台
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-y border-ink-line bg-surface">
        <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="space-y-6">
            <p className="label-text">AI-Powered Growth Intelligence for Modern Brands</p>
            <h1 className="text-4xl font-semibold leading-[1.15] lg:text-5xl">
              MORI AI Growth OS
              <span className="mt-3 block font-serif text-2xl font-normal italic text-ink-muted lg:text-3xl">
                让 AI 帮品牌完成从用户洞察到增长优化的完整闭环
              </span>
            </h1>
            <p className="max-w-2xl text-[14px] leading-relaxed text-ink-muted">
              市场 → 用户 → 内容 → 素材 → 广告 → 投放数据 → AI 分析 → 优化建议 → 下一轮投放。
              MORI AI Growth OS 把这条链路做成一个可以真实操作的工作台：KPI 由数据库计算，AI 输出全部走结构化
              JSON Schema，前端负责渲染，Demo Mode 下无需任何 API Key 也能完整演示。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "group")}>
                打开 Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/advisor" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                直接问 AI 增长顾问
              </Link>
            </div>
            <dl className="grid max-w-xl grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              {[
                { label: "KPI 计算", value: "7 项" },
                { label: "AI Agent", value: "6 + 1" },
                { label: "Demo 数据", value: "300 条" },
                { label: "页面模块", value: "14" },
              ].map((item) => (
                <div key={item.label} className="surface-muted px-3.5 py-3">
                  <dt className="text-[11px] text-ink-soft">{item.label}</dt>
                  <dd className="data-value mt-1 text-[18px] font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface p-6">
            <p className="label-text">Problem → Solution</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[13px] font-semibold">传统营销团队的问题</p>
                <p className="prose-copy mt-1">
                  调研、用户分析、选题、脚本、素材、投放数据、周报分散在 Excel、报表后台与聊天工具之间，大量时间花在
                  “找数据 + 对口径 + 写结论”上。
                </p>
              </div>
              <div>
                <p className="text-[13px] font-semibold">MORI 的解法</p>
                <p className="prose-copy mt-1">
                  用统一的数据模型（品牌 / 产品 / 用户 / 竞品 / 投放 / 内容 / 实验）作为业务上下文，把分析拆成 6
                  个专职 Agent，每个 Agent 都有独立的 Prompt、版本号与 JSON Schema 输出。
                </p>
              </div>
              <div className="surface-muted px-4 py-3">
                <p className="text-[12px] font-medium">核心价值</p>
                <p className="prose-copy mt-1">
                  减少重复分析工作，提升营销决策效率：Insight → Action → Experiment → Optimization。
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-soft">
                本项目基于模拟业务数据验证产品工作流，不代表真实商业成绩。MORI 森屿 与所有竞品均为虚拟品牌。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">产品模块</h2>
            <p className="mt-1 text-[13px] text-ink-muted">14 个可以真实操作的页面，覆盖从洞察到复盘的全流程。</p>
          </div>
          <Link href="/dashboard" className="text-[12px] text-moss-strong underline-offset-4 hover:underline">
            查看完整工作台 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className="surface group flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/12 text-moss-strong">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="flex items-baseline gap-2 text-[14px] font-semibold">
                    {module.title}
                    <span className="font-serif text-[11px] font-normal italic text-ink-soft">{module.en}</span>
                  </p>
                  <p className="prose-copy mt-1.5">{module.text}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-ink-line bg-surface px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 text-[11px] leading-relaxed text-ink-soft">
          <p>MORI AI Growth OS · 个人求职作品集项目（AI 产品 / AI 增长 / 市场营销 / 电商运营方向）。</p>
          <p>虚拟品牌与模拟数据仅用于验证 AI 在营销分析与增长决策中的应用，不构成任何真实业绩或功效承诺。</p>
        </div>
      </footer>
    </div>
  );
}
