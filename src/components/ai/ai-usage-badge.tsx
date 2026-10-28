"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  AI_USAGE_CHANGED_EVENT,
} from "@/lib/ai-usage-client";

type Usage = {
  limited: boolean;
  remaining: number;
  visitorLimit: number;
  daily: { remaining: number; exhausted: boolean };
};

export function AiUsageBadge() {
  const [usage, setUsage] = React.useState<Usage | null>(null);

  React.useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const response = await fetch("/api/ai/usage", { cache: "no-store" });
        const json = (await response.json()) as { ok: boolean; data?: Usage };
        if (active && response.ok && json.ok && json.data) setUsage(json.data);
      } catch {
        // Usage display must never block the workspace.
      }
    };

    void refresh();
    window.addEventListener(AI_USAGE_CHANGED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 30_000);
    return () => {
      active = false;
      window.removeEventListener(AI_USAGE_CHANGED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, []);

  if (!usage) return null;

  if (!usage.limited) {
    return (
      <Badge tone="neutral" className="hidden md:inline-flex" title="本地开发模式不限制每位访客的 AI 体验次数">
        开发模式 · AI 不限次
      </Badge>
    );
  }

  if (usage.daily.exhausted) {
    return (
      <Badge tone="bad" className="hidden sm:inline-flex" title="全局每日 AI 请求额度已用完">
        今日 AI 体验额度已用完
      </Badge>
    );
  }

  if (usage.remaining <= 0) {
    return (
      <Badge tone="bad" className="hidden sm:inline-flex" title="每位访客最多体验 3 次">
        免费 AI 体验次数已用完
      </Badge>
    );
  }

  return (
    <Badge
      tone={usage.remaining <= 1 ? "warn" : "moss"}
      className="hidden sm:inline-flex"
      title={`今日全站剩余 ${usage.daily.remaining} 次 AI 请求额度`}
    >
      免费 AI 体验：剩余 {usage.remaining} 次
    </Badge>
  );
}
