"use client";

import { ArrowUp, FileDown, Menu, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export const PORTFOLIO_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "product", label: "Product" },
  { id: "campaign", label: "Analytics" },
  { id: "advisor", label: "AI Advisor" },
  { id: "experiment", label: "Experiment" },
  { id: "engineering", label: "AI Engineering" },
  { id: "role", label: "My Role" },
] as const;

export function PortfolioNav() {
  const [active, setActive] = React.useState<string>("overview");
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const ids = PORTFOLIO_SECTIONS.map((section) => section.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 1] },
    );
    elements.forEach((element) => observer.observe(element));

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(scrollTop > 240);
      setProgress(height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header
        data-portfolio-nav
        className={cn(
          "sticky top-0 z-40 border-b transition-colors",
          scrolled ? "border-ink-line bg-canvas/85 backdrop-blur" : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-5 py-3.5 md:px-10">
          <button
            type="button"
            onClick={() => go("overview")}
            className="flex items-center gap-2.5 text-left"
            aria-label="回到顶部"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-serif text-[13px] font-semibold text-canvas">
              M
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-[13.5px] font-semibold">MORI AI Growth OS</span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-ink-soft">Case Study</span>
            </span>
          </button>

          <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
            {PORTFOLIO_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => go(section.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] transition-colors",
                  active === section.id ? "bg-ink text-canvas" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <Link
              href="/"
              className="hidden rounded-full border border-ink-line px-3 py-1.5 text-[12px] text-ink transition-colors hover:bg-surface-muted sm:inline-flex"
            >
              打开产品
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              data-portfolio-noprint
              className="hidden items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12px] text-canvas transition-colors hover:bg-ink/90 sm:inline-flex"
            >
              <FileDown className="h-3.5 w-3.5" /> 导出 PDF
            </button>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-ink lg:hidden"
              aria-label={open ? "关闭章节导航" : "打开章节导航"}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="h-[2px] w-full bg-transparent">
          <div className="h-full bg-moss transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {open ? (
        <div data-portfolio-noprint className="sticky top-[57px] z-30 border-b border-ink-line bg-canvas/95 backdrop-blur lg:hidden">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-1.5 px-5 py-3 md:px-10">
            {PORTFOLIO_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => go(section.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-left text-[12.5px]",
                  active === section.id ? "bg-ink text-canvas" : "bg-surface-muted text-ink-muted",
                )}
              >
                {section.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => window.print()}
              className="col-span-2 mt-1 rounded-xl bg-ink px-3 py-2 text-[12.5px] text-canvas"
            >
              导出 PDF / 打印
            </button>
          </div>
        </div>
      ) : null}

      {scrolled ? (
        <button
          type="button"
          data-portfolio-noprint
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface text-ink shadow-lift transition-transform hover:-translate-y-0.5"
          aria-label="返回顶部"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      ) : null}
    </>
  );
}
