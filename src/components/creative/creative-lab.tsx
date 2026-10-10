"use client";

import * as React from "react";

import { AgentRunner } from "@/components/ai/agent-runner";
import { SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Progress } from "@/components/ui/feedback";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import type { CreativeDirections } from "@/lib/ai/schemas";

const PLATFORMS = ["抖音", "小红书", "信息流广告"];
const OBJECTIVES = ["转化", "点击", "曝光", "互动"];
const AUDIENCES = ["23 岁熬夜女性", "18–24 岁学生党", "25–30 岁轻熟白领", "油皮 / 混合皮年轻用户"];
const THEMES = ["夜间修护", "清爽肤感", "价格解释", "30 天稳定", "成分科普"];

export function CreativeLab({ datasetId }: { datasetId?: string | null }) {
  const [platform, setPlatform] = React.useState(PLATFORMS[0]);
  const [objective, setObjective] = React.useState(OBJECTIVES[0]);
  const [audience, setAudience] = React.useState(AUDIENCES[0]);
  const [theme, setTheme] = React.useState(THEMES[0]);

  const payload = React.useMemo(
    () => ({ datasetId: datasetId ?? null, platform, objective, audience, theme }),
    [datasetId, platform, objective, audience, theme],
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>素材简报</CardTitle>
            <CardDescription>选择投放平台、目标、人群与主题，一次生成 5 个结构性差异的素材方向。</CardDescription>
          </div>
          <Badge tone="moss">Creative Strategist</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
            <FieldGroup label="平台">
              <Select value={platform} onChange={(event) => setPlatform(event.target.value)}>
                {PLATFORMS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="投放目标">
              <Select value={objective} onChange={(event) => setObjective(event.target.value)}>
                {OBJECTIVES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="目标人群">
              <Select value={audience} onChange={(event) => setAudience(event.target.value)}>
                {AUDIENCES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="主题" hint="可自定义">
              <Input value={theme} onChange={(event) => setTheme(event.target.value)} />
            </FieldGroup>
          </div>
        </CardContent>
      </Card>

      <AgentRunner<CreativeDirections>
        endpoint="/api/creative/generate"
        payload={payload}
        labels={{
          idle: "Generate Creatives",
          loading: "Generating creatives...",
          success: "Creatives ready",
          error: "Unable to generate creatives.",
        }}
        disabled={theme.trim().length === 0}
        disabledHint="请先填写主题"
        render={(data) => (
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>方向总览</CardTitle>
                  <CardDescription>{data.summary}</CardDescription>
                </div>
                <CopyButton value={JSON.stringify(data, null, 2)} label="复制 JSON" />
              </CardHeader>
              <CardContent>
                <div className="surface-muted px-4 py-3">
                  <p className="label-text mb-2">建议测试顺序</p>
                  <ol className="flex flex-wrap gap-2">
                    {data.testingOrder.map((item, index) => (
                      <li key={item} className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[11.5px] shadow-card">
                        <span className="font-mono text-[10px] text-moss-strong">#{index + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              {data.directions.map((direction) => (
                <Card key={direction.code} className="h-full">
                  <CardHeader>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-moss/12 font-mono text-[12px] font-semibold text-moss-strong">
                          {direction.code}
                        </span>
                        <CardTitle>{direction.angle}</CardTitle>
                      </div>
                      <CardDescription>{direction.rationale}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[15px] font-semibold">{direction.priorityScore}</p>
                      <p className="text-[10px] text-ink-soft">priority</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={direction.priorityScore} tone={direction.priorityScore >= 85 ? "good" : "moss"} />
                    <div className="surface-muted px-3.5 py-3">
                      <p className="label-text mb-1">核心 Hook</p>
                      <p className="text-[12.5px] font-medium leading-relaxed">「{direction.hook}」</p>
                    </div>
                    <div className="space-y-2">
                      {direction.script.map((step) => (
                        <div key={step.timeRange} className="flex gap-3">
                          <span className="mt-0.5 w-[52px] shrink-0 font-mono text-[10.5px] text-moss-strong">
                            {step.timeRange}
                          </span>
                          <div>
                            <p className="text-[11px] font-medium text-ink-muted">{step.section}</p>
                            <p className="text-[12px] leading-relaxed text-ink-muted">{step.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-ink-line pt-3">
                      <Badge tone="clay">CTA：{direction.cta}</Badge>
                      <Badge tone="neutral">人群：{direction.audience}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <SignalBlocks bundle={data} columns={2} />
          </div>
        )}
      />
    </div>
  );
}
