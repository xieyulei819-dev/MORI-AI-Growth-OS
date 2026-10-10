"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({
  children,
  aiStatus,
  datasetLabel,
}: {
  children: React.ReactNode;
  aiStatus: { mode: "demo" | "ai"; model: string; provider: string; reason: string };
  datasetLabel: string;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] lg:block">
        <Sidebar />
      </aside>

      {navOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="关闭导航"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[268px] shadow-lift">
            <Sidebar onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen w-full flex-col lg:pl-[248px]">
        <Topbar onOpenNav={() => setNavOpen(true)} aiStatus={aiStatus} datasetLabel={datasetLabel} />
        <main className="mx-auto w-full max-w-[1560px] flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        <footer className="border-t border-ink-line px-4 py-5 text-[11px] leading-relaxed text-ink-soft md:px-8">
          MORI AI Growth OS · Portfolio demo built with Next.js, Prisma (SQLite) and OpenAI-compatible structured
          outputs. 品牌与数据均为虚拟 Demo / 模拟业务数据，不代表任何真实企业或真实业绩。
        </footer>
      </div>
    </div>
  );
}
