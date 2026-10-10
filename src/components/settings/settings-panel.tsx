"use client";

import { CheckCircle2, Database, Moon, Palette, PlugZap, RefreshCw, Sun, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

type AiStatus = {
  mode: "demo" | "ai";
  providerId?: string;
  provider: string;
  baseUrl: string;
  model: string;
  demoMode: boolean;
  apiKeyConfigured: boolean;
  keySource?: string | null;
  supportsJsonSchema?: boolean;
  requestShapes?: readonly string[];
  reason: string;
};

type TestResult = { ok: boolean; mode: "demo" | "ai"; message: string; latencyMs: number; model: string };

export function SettingsPanel({
  aiStatus,
  counts,
}: {
  aiStatus: AiStatus;
  counts: { metrics: number; audienceMetrics: number; datasets: number; contents: number; experiments: number; reports: number };
}) {
  const router = useRouter();
  const { theme, setTheme, mounted } = useTheme();
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);
  const [dataState, setDataState] = React.useState<"idle" | "working">("idle");
  const [dataMessage, setDataMessage] = React.useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const runTest = React.useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/settings/test-ai", { method: "POST" });
      const json = (await response.json()) as { ok: boolean; data?: TestResult; error?: { message: string } };
      if (!response.ok || !json.ok || !json.data) {
        setTestResult({
          ok: false,
          mode: aiStatus.mode,
          message: json.error?.message ?? "AI 状态检查失败",
          latencyMs: 0,
          model: aiStatus.model,
        });
        return;
      }
      setTestResult(json.data);
    } catch (error) {
      setTestResult({
        ok: false,
        mode: aiStatus.mode,
        message: error instanceof Error ? error.message : "网络异常",
        latencyMs: 0,
        model: aiStatus.model,
      });
    } finally {
      setTesting(false);
    }
  }, [aiStatus.mode, aiStatus.model]);

  const runDataAction = React.useCallback(
    async (action: "clear-uploads" | "regenerate-demo") => {
      setDataState("working");
      setDataMessage(null);
      try {
        const response = await fetch("/api/settings/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const json = (await response.json()) as { ok: boolean; data?: { message: string }; error?: { message: string } };
        if (!response.ok || !json.ok || !json.data) {
          setDataMessage({ tone: "error", text: json.error?.message ?? "操作失败" });
          return;
        }
        setDataMessage({ tone: "success", text: json.data.message });
        router.refresh();
      } catch (error) {
        setDataMessage({ tone: "error", text: error instanceof Error ? error.message : "网络异常" });
      } finally {
        setDataState("idle");
      }
    },
    [router],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-moss-strong" /> AI Provider
            </CardTitle>
            <CardDescription>当前使用 OpenAI-compatible 接口，支持 structured outputs（JSON Schema）。</CardDescription>
          </div>
          <Badge tone={aiStatus.mode === "ai" ? "moss" : "neutral"}>{aiStatus.mode === "ai" ? "AI 模式" : "Demo 模式"}</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-[12px]">
          <Row label="Provider" value={aiStatus.provider} />
          <Row label="Base URL" value={aiStatus.baseUrl} />
          <Row label="Model" value={aiStatus.model} />
          <Row label="DEMO_MODE" value={aiStatus.demoMode ? "true" : "false"} />
          <Row
            label="API Key"
            value={
              aiStatus.apiKeyConfigured
                ? `已配置（来源 ${aiStatus.keySource ?? "环境变量"}，不显示明文）`
                : `未配置（需设置 ${aiStatus.providerId === "deepseek" ? "DEEPSEEK_API_KEY" : "API Key"}）`
            }
          />
          <Row
            label="输出方式"
            value={
              aiStatus.supportsJsonSchema
                ? "json_schema (strict) → json_object → plain"
                : `${(aiStatus.requestShapes ?? ["json_object", "plain"]).join(" → ")}（该 Provider 不支持 strict json_schema，Schema 注入 Prompt + Zod 校验）`
            }
          />
          <Alert tone={aiStatus.mode === "ai" ? "success" : "info"}>{aiStatus.reason}</Alert>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" loading={testing} loadingLabel="Testing…" onClick={runTest}>
              <RefreshCw className="h-3.5 w-3.5" /> 测试 AI 连接
            </Button>
            {testResult ? (
              <span className={cn("flex items-center gap-1.5 text-[12px]", testResult.ok ? "text-tone-good" : "text-tone-bad")}>
                {testResult.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {testResult.message} {testResult.latencyMs > 0 ? `（${testResult.latencyMs}ms）` : ""}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-moss-strong" /> 主题
            </CardTitle>
            <CardDescription>主题偏好保存在浏览器 localStorage，刷新后保持。</CardDescription>
          </div>
          <Badge tone="neutral">{mounted ? theme : "loading"}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={theme === "light" ? "primary" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-3.5 w-3.5" /> 浅色（默认）
            </Button>
            <Button variant={theme === "dark" ? "primary" : "outline"} size="sm" onClick={() => setTheme("dark")}>
              <Moon className="h-3.5 w-3.5" /> 深色
            </Button>
          </div>
          <p className="text-[11.5px] leading-relaxed text-ink-muted">
            设计基调为米白 / 深灰 / 浅绿，图表颜色随主题切换（Recharts 读取主题色板），保证两个主题下的可读性。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-moss-strong" /> Data Management
            </CardTitle>
            <CardDescription>数据库当前内容（SQLite + Prisma）。</CardDescription>
          </div>
          <Badge tone="neutral">prisma/dev.db</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MiniStat label="投放记录" value={counts.metrics} />
            <MiniStat label="人群记录" value={counts.audienceMetrics} />
            <MiniStat label="上传数据集" value={counts.datasets} />
            <MiniStat label="内容记录" value={counts.contents} />
            <MiniStat label="实验" value={counts.experiments} />
            <MiniStat label="报告" value={counts.reports} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={dataState === "working"}
              onClick={() => runDataAction("regenerate-demo")}
            >
              <RefreshCw className="h-3.5 w-3.5" /> 重新生成 Demo 数据
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={dataState === "working"}
              onClick={() => runDataAction("clear-uploads")}
            >
              <Trash2 className="h-3.5 w-3.5" /> 清除上传数据集
            </Button>
          </div>
          {dataMessage ? <Alert tone={dataMessage.tone}>{dataMessage.text}</Alert> : null}
          <p className="text-[11.5px] leading-relaxed text-ink-soft">
            命令行等价操作：<code className="font-mono">npm run db:reset</code>（重建并重新写入全部 Demo 数据）、
            <code className="font-mono">npm run db:studio</code>（可视化查看数据库）。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>环境变量</CardTitle>
            <CardDescription>
              参照 <code className="font-mono">.env.example</code>，把真实 Key 放在 <code className="font-mono">.env.local</code>
              （已被 .gitignore 忽略）。
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-xl bg-surface-muted p-4 font-mono text-[11px] leading-relaxed text-ink-muted">
{`DATABASE_URL="file:./dev.db"
DEMO_MODE="true"          # true = 本地结构化引擎，无需 API Key
OPENAI_API_KEY=""         # DEMO_MODE=false 时必填
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"
AI_REQUEST_TIMEOUT_MS="45000"`}
          </pre>
          <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
            切换到 AI 模式：把 <code className="font-mono">DEMO_MODE</code> 改为 <code className="font-mono">false</code>
            并填入 <code className="font-mono">OPENAI_API_KEY</code>，重启开发服务器即可。若调用失败，系统会自动回退到 Demo
            引擎，并在结果中标注「AI 失败 · 已回退」。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-line pb-2 last:border-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span className="truncate font-mono text-ink">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-muted px-3.5 py-3">
      <p className="text-[10.5px] text-ink-soft">{label}</p>
      <p className="data-value mt-1 text-[15px] font-semibold">{value.toLocaleString("zh-CN")}</p>
    </div>
  );
}
