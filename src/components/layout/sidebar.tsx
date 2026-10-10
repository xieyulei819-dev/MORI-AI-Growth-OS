"use client";

import {
  BarChart3,
  Beaker,
  BookOpen,
  Boxes,
  ClipboardList,
  Compass,
  FileText,
  FlaskConical,
  LayoutDashboard,
  ScrollText,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const NAV_SECTIONS = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "总览", labelEn: "Dashboard", icon: LayoutDashboard },
      { href: "/brand", label: "品牌中心", labelEn: "Brand", icon: Boxes },
      { href: "/audience", label: "用户洞察", labelEn: "Audience", icon: Users },
      { href: "/market", label: "市场与竞品", labelEn: "Market", icon: Compass },
      { href: "/content", label: "内容策划", labelEn: "Content", icon: BookOpen },
      { href: "/creative", label: "广告素材", labelEn: "Creative", icon: Sparkles },
      { href: "/campaign", label: "投放分析", labelEn: "Campaign", icon: BarChart3 },
      { href: "/advisor", label: "AI 增长顾问", labelEn: "AI Advisor", icon: Compass },
      { href: "/experiments", label: "实验中心", labelEn: "Experiments", icon: FlaskConical },
      { href: "/reports", label: "增长报告", labelEn: "Reports", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/prompts", label: "Prompt 管理", labelEn: "Prompt Library", icon: ScrollText },
      { href: "/evaluation", label: "AI 评估", labelEn: "Evaluation", icon: ClipboardList },
      { href: "/settings", label: "设置", labelEn: "Settings", icon: Settings },
    ],
  },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[rgb(var(--sidebar))] text-[rgb(var(--sidebar-ink))]">
      <Link href="/" className="flex items-center gap-3 px-5 py-5" onClick={onNavigate}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/25 font-serif text-[15px] font-semibold text-[rgb(var(--sidebar-ink))]">
          M
        </span>
        <span className="leading-tight">
          <span className="block font-serif text-[15px] font-semibold tracking-wide">MORI 森屿</span>
          <span className="block text-[10px] uppercase tracking-[0.28em] text-[rgb(var(--sidebar-muted))]">
            Growth OS
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--sidebar-muted))]">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-moss/22 text-white"
                          : "text-[rgb(var(--sidebar-ink))]/80 hover:bg-white/6 hover:text-white",
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-moss" : "text-[rgb(var(--sidebar-muted))]")} />
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--sidebar-muted))] opacity-0 transition-opacity group-hover:opacity-100">
                        {item.labelEn}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 px-5 py-4 text-[11px] leading-relaxed text-[rgb(var(--sidebar-muted))]">
        <p className="flex items-center gap-1.5 font-medium text-[rgb(var(--sidebar-ink))]">
          <Target className="h-3.5 w-3.5" /> Demo 作品集项目
        </p>
        <p className="mt-1">MORI 为虚拟品牌，全部数据为模拟业务数据。</p>
        <p className="mt-2 flex items-center gap-1.5">
          <Beaker className="h-3 w-3" /> v1.0 · Next.js + Prisma + SQLite
        </p>
      </div>
    </div>
  );
}
