"use client";

import { Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";

import { AiUsageBadge } from "@/components/ai/ai-usage-badge";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Topbar({
  onOpenNav,
  aiStatus,
  datasetLabel,
}: {
  onOpenNav?: () => void;
  aiStatus: { mode: "demo" | "ai"; model: string; provider: string; reason: string };
  datasetLabel: string;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink-line bg-canvas/85 px-4 py-3 backdrop-blur md:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenNav} aria-label="打开导航">
        <Menu className="h-4 w-4" />
      </Button>

      <div className="hidden min-w-0 items-center gap-2 md:flex">
        <span className="font-serif text-[15px] font-semibold">MORI 森屿</span>
        <span className="text-ink-soft">/</span>
        <span className="truncate text-[13px] text-ink-muted">AI 美妆增长中台 · 晚间修护精华</span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <AiUsageBadge />
        <span className="hidden max-w-[240px] truncate text-[11px] text-ink-soft xl:block">{datasetLabel}</span>
        <Badge tone="clay" title="全部业务数据均为模拟数据">
          Demo Mode
        </Badge>
        <Badge
          tone={aiStatus.mode === "ai" ? "moss" : "neutral"}
          title={aiStatus.reason}
          className={cn("hidden sm:inline-flex")}
        >
          {aiStatus.mode === "ai" ? `AI · ${aiStatus.model}` : "本地结构化引擎"}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "切换到浅色主题" : "切换到深色主题"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Link href="/advisor" className={cn(buttonVariants({ variant: "moss", size: "sm" }), "hidden sm:inline-flex")}>
          问 AI 增长顾问
        </Link>
      </div>
    </header>
  );
}
