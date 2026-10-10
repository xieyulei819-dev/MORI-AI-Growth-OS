import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="surface max-w-lg p-8 text-center">
        <p className="label-text">404</p>
        <h1 className="mt-2 text-xl font-semibold">没有找到这个页面</h1>
        <p className="prose-copy mt-2">
          MORI AI Growth OS 目前包含 Dashboard、Brand、Audience、Market、Content、Creative、Campaign、AI Advisor、
          Experiments、Reports、Prompt Library、Evaluation 与 Settings。
        </p>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary" }), "mt-5 inline-flex")}>
          返回 Dashboard
        </Link>
      </div>
    </div>
  );
}
