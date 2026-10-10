"use client";

import { Maximize2, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * 作品集截图组件：正常显示截图，点击可放大查看（无第三方依赖）。
 * 支持 ESC 关闭、点击遮罩关闭、键盘可达。
 */
export function ZoomableShot({
  src,
  alt,
  caption,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <figure data-portfolio-shot data-portfolio-noprint={undefined} className={cn("group space-y-2.5", className)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative block w-full overflow-hidden rounded-2xl border border-ink-line bg-surface shadow-card transition-shadow hover:shadow-lift"
          aria-label={`放大查看：${alt}`}
        >
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="block w-full"
          />
          <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] text-canvas opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 className="h-3 w-3" /> 点击放大
          </span>
        </button>
        {caption ? (
          <figcaption className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-soft">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
            <span>{caption}</span>
          </figcaption>
        ) : null}
      </figure>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          data-portfolio-noprint
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-h-[92vh] w-full max-w-[1500px] overflow-auto rounded-2xl bg-surface p-2">
            <img src={src} alt={alt} className="block w-full rounded-xl" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-canvas"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
