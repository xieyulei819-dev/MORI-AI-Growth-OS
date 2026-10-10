"use client";

import { FlaskConical, Plus, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { VariantChart } from "@/components/charts/variant-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/field";
import type { ExperimentEvaluation } from "@/lib/experiments";

export type CreateExperimentResponse = {
  ok: boolean;
  data?: { id: string; evaluation: ExperimentEvaluation; metricTable: Array<{ metric: string; A: number; B: number }> };
  error?: { code: string; message: string };
};

export function ExperimentLab({ creativeNames, datasetId }: { creativeNames: string[]; datasetId?: string | null }) {
  const router = useRouter();
  const [name, setName] = React.useState("熬夜场景 vs 成分科普");
  const [hypothesis, setHypothesis] = React.useState(
    "在转化目标下，熬夜场景素材的 CVR 高于成分科普素材，因此应该把预算优先给场景类内容。",
  );
  const [primaryMetric, setPrimaryMetric] = React.useState<"ctr" | "cvr" | "cpa" | "roas">("cvr");
  const [variantA, setVariantA] = React.useState(creativeNames[0] ?? "");
  const [variantB, setVariantB] = React.useState(creativeNames[1] ?? creativeNames[0] ?? "");
  const [state, setState] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = React.useState<CreateExperimentResponse["data"] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const submit = React.useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const response = await fetch("/api/experiments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hypothesis, primaryMetric, variantACreative: variantA, variantBCreative: variantB, datasetId: datasetId ?? null }),
      });
      const json = (await response.json()) as CreateExperimentResponse;
      if (!response.ok || !json.ok || !json.data) {
        setState("error");
        setError(json.error?.message ?? `创建失败（HTTP ${response.status}）`);
        return;
      }
      setResult(json.data);
      setState("success");
      router.refresh();
    } catch (caught) {
      setState("error");
      setError(caught instanceof Error ? `网络或服务异常：${caught.message}` : "网络或服务异常");
    }
  }, [name, hypothesis, primaryMetric, variantA, variantB, datasetId, router]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>创建 A/B 实验</CardTitle>
            <CardDescription>
              A / B 变体取自当前数据集中的素材记录（Demo / 模拟业务数据），系统自动做双比例 z 检验，
              并给出「是否继续测试」的建议。结论为模拟数据推演，不代表真实投放结果。
            </CardDescription>
          </div>
          <Badge tone="moss">
            <FlaskConical className="h-3 w-3" /> Experiment Lab
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
            <FieldGroup label="实验名称" className="xl:col-span-2">
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </FieldGroup>
            <FieldGroup label="主指标" hint="比率型指标使用 z 检验">
              <Select value={primaryMetric} onChange={(event) => setPrimaryMetric(event.target.value as "ctr")}>
                <option value="ctr">CTR</option>
                <option value="cvr">CVR</option>
                <option value="cpa">CPA（越低越好）</option>
                <option value="roas">ROAS</option>
              </Select>
            </FieldGroup>
            <FieldGroup label="观察窗口" hint="演示用：默认为 7 天复盘">
              <Input value="7 天" readOnly />
            </FieldGroup>
            <FieldGroup label="Variant A（对照）">
              <Select value={variantA} onChange={(event) => setVariantA(event.target.value)}>
                {creativeNames.map((creative) => (
                  <option key={creative} value={creative}>
                    {creative}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="Variant B（实验）">
              <Select value={variantB} onChange={(event) => setVariantB(event.target.value)}>
                {creativeNames.map((creative) => (
                  <option key={creative} value={creative}>
                    {creative}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="实验假设" className="md:col-span-2">
              <Textarea
                value={hypothesis}
                onChange={(event) => setHypothesis(event.target.value)}
                className="min-h-[76px]"
              />
            </FieldGroup>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="moss" loading={state === "loading"} loadingLabel="Creating experiment…" onClick={submit}>
              <Plus className="h-3.5 w-3.5" /> 创建实验并评估
            </Button>
            <span className="text-[11px] text-ink-soft">
              变体数据来自 Metric 表聚合结果（模拟数据）；结论使用统计检验，而不是让模型“感觉”一下。
            </span>
          </div>

          {state === "error" && error ? <Alert tone="error" title="创建失败">{error}</Alert> : null}
        </CardContent>
      </Card>

      {state === "success" && result ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>模拟实验结果评估</CardTitle>
              <CardDescription>已保存到数据库（模拟实验），并出现在下方实验列表。</CardDescription>
            </div>
            <Badge tone={result.evaluation.winner === "tie" ? "warn" : "good"}>
              <Trophy className="h-3 w-3" />
              {result.evaluation.winner === "tie" ? "暂未分出胜负" : `建议保留 ${result.evaluation.winner}`}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <VariantChart data={result.metricTable} height={220} />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="surface-muted px-4 py-3">
                <p className="label-text mb-1">A · {result.evaluation.a.name}</p>
                <p className="font-mono text-[12px] text-ink-muted">
                  CTR {formatPct(result.evaluation.metrics.a.ctr)} · CVR {formatPct(result.evaluation.metrics.a.cvr)} · CPA{" "}
                  {result.evaluation.metrics.a.cpa.toFixed(2)} · ROAS {result.evaluation.metrics.a.roas.toFixed(2)}
                </p>
              </div>
              <div className="surface-muted px-4 py-3">
                <p className="label-text mb-1">B · {result.evaluation.b.name}</p>
                <p className="font-mono text-[12px] text-ink-muted">
                  CTR {formatPct(result.evaluation.metrics.b.ctr)} · CVR {formatPct(result.evaluation.metrics.b.cvr)} · CPA{" "}
                  {result.evaluation.metrics.b.cpa.toFixed(2)} · ROAS {result.evaluation.metrics.b.roas.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="surface-muted px-4 py-3.5">
              <p className="label-text mb-1">AI 实验解读（基于模拟数据推演）</p>
              <p className="text-[12.5px] leading-relaxed text-ink-muted">{result.evaluation.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function formatPct(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}
