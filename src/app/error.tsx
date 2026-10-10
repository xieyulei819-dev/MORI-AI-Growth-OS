"use client";

import { AlertOctagon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[MORI] 页面渲染失败：", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="surface max-w-xl p-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-tone-bad/12 text-tone-bad">
          <AlertOctagon className="h-5 w-5" />
        </span>
        <h1 className="text-lg font-semibold">页面加载失败</h1>
        <p className="prose-copy mt-2">
          出现了一个未预期的错误。常见原因：数据库尚未初始化（请运行 <code className="font-mono">npm run db:setup</code>
          ）或 AI 接口超时。
        </p>
        <p className="mt-3 rounded-xl bg-surface-muted px-3 py-2 text-left font-mono text-[11px] text-ink-muted">
          {error.message || "Unknown error"}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset} variant="primary">
            重新加载
          </Button>
        </div>
      </div>
    </div>
  );
}
