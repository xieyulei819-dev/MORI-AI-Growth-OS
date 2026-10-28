"use client";

import {
  BarChart3,
  BookMarked,
  CalendarDays,
  History,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  Loader2,
  Rss,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  TriangleAlert,
  UserRound,
  Wand2,
} from "lucide-react";
import * as React from "react";

import { IpAnalysisView } from "@/components/ip/ip-analysis-view";
import { LabelBadge } from "@/components/ip/ip-labels";
import { IpPlanView } from "@/components/ip/ip-plan-view";
import { IpTopicView } from "@/components/ip/ip-topic-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Progress } from "@/components/ui/feedback";
import { FieldGroup, Input } from "@/components/ui/field";
import type { IpAnalysis, ScriptBundle, ShotPlan, TrendResearch } from "@/lib/ip/schemas";
import type { TrendSearchStatus } from "@/lib/ip/search";
import type { IpHistoryItem, IpPlanDto, IpProfileDto, IpTopicDto, TodayTopic } from "@/lib/ip/store";
import { notifyAiUsageChanged } from "@/lib/ai-usage-client";
import { cn, formatDateLabel } from "@/lib/utils";
import type { IpRunMeta } from "@/lib/ip/runner";

const EXAMPLE_IPS = ["伊宁房产王总", "上海咖啡店老板", "健身新手女生"];

type View = "analysis" | "today" | "topics" | "matrix" | "plan" | "history";

const NAV: Array<{ key: View; label: string; labelEn: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "analysis", label: "IP 分析", labelEn: "Analysis", icon: UserRound },
  { key: "today", label: "今日选题", labelEn: "Today", icon: Target },
  { key: "topics", label: "选题池", labelEn: "Topics", icon: ListChecks },
  { key: "matrix", label: "内容矩阵", labelEn: "Matrix", icon: LayoutGrid },
  { key: "plan", label: "7 天计划", labelEn: "7-Day Plan", icon: CalendarDays },
  { key: "history", label: "历史内容", labelEn: "History", icon: History },
];

type AnalyzeResponse = {
  ok: boolean;
  data?: {
    profileId: string;
    analysis: IpAnalysis;
    analysisMeta: IpRunMeta;
    trends: TrendResearch;
    trendMeta: IpRunMeta;
    searchStatus: TrendSearchStatus;
    completeness: { provided: string[]; missing: string[] };
  };
  meta?: IpRunMeta;
  error?: { message: string };
};

type TopicsResponse = {
  ok: boolean;
  data?: { strategy: unknown; topics: IpTopicDto[]; today: TodayTopic };
  meta?: IpRunMeta;
  error?: { message: string };
};

export function IpWorkbench({
  initialHistory,
  initialProfile,
  initialTopics,
  initialPlan,
  initialToday,
  aiStatus,
}: {
  initialHistory: IpHistoryItem[];
  initialProfile: IpProfileDto | null;
  initialTopics: IpTopicDto[];
  initialPlan: IpPlanDto | null;
  initialToday: TodayTopic;
  aiStatus: { mode: string; model: string; provider: string; reason: string };
}) {
  const [name, setName] = React.useState(initialProfile?.name ?? "");
  const [industry, setIndustry] = React.useState(initialProfile?.industry ?? "");
  const [city, setCity] = React.useState(initialProfile?.city ?? "");
  const [platforms, setPlatforms] = React.useState(initialProfile?.platforms.join("、") ?? "");
  const [targetCustomer, setTargetCustomer] = React.useState(initialProfile?.targetCustomer ?? "");
  const [products, setProducts] = React.useState(initialProfile?.products ?? "");
  const [goal, setGoal] = React.useState(initialProfile?.goal ?? "");

  const [profile, setProfile] = React.useState<IpProfileDto | null>(initialProfile);
  const [analysis, setAnalysis] = React.useState<IpAnalysis | null>(initialProfile?.analysis ?? null);
  const [trends, setTrends] = React.useState<TrendResearch | null>(initialProfile?.trends ?? null);
  const [searchStatus, setSearchStatus] = React.useState<TrendSearchStatus | null>(initialProfile?.searchStatus ?? null);
  const [analysisMeta, setAnalysisMeta] = React.useState<IpRunMeta | null>(null);
  const [trendMeta, setTrendMeta] = React.useState<IpRunMeta | null>(null);
  const [completeness, setCompleteness] = React.useState<{ provided: string[]; missing: string[] } | null>(null);

  const [topics, setTopics] = React.useState<IpTopicDto[]>(initialTopics);
  const [today, setToday] = React.useState<TodayTopic>(initialToday);
  const [plan, setPlan] = React.useState<IpPlanDto | null>(initialPlan);
  const [history, setHistory] = React.useState<IpHistoryItem[]>(initialHistory);

  const [view, setView] = React.useState<View>("today");
  const [script, setScript] = React.useState<IpScriptViewState | null>(null);

  const [analyzing, setAnalyzing] = React.useState(false);
  const [planLoading, setPlanLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ tone: "info" | "success" | "warning" | "error"; text: string } | null>(null);

  const refreshHistory = React.useCallback(async () => {
    try {
      const response = await fetch("/api/ip/profile");
      const json = (await response.json()) as { ok: boolean; data?: { history: IpHistoryItem[] } };
      if (json.ok && json.data) setHistory(json.data.history);
    } catch {
      // 历史记录刷新失败不影响主流程
    }
  }, []);

  const analyze = React.useCallback(async () => {
    if (!name.trim()) {
      setMessage({ tone: "warning", text: "请先输入一个 IP 名称。" });
      return;
    }
    setAnalyzing(true);
    setMessage(null);
    setScript(null);
    try {
      const response = await fetch("/api/ip/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          industry: industry.trim() || undefined,
          city: city.trim() || undefined,
          platforms: platforms
            .split(/[、,，\s]+/)
            .map((item) => item.trim())
            .filter(Boolean),
          targetCustomer: targetCustomer.trim() || undefined,
          products: products.trim() || undefined,
          goal: goal.trim() || undefined,
        }),
      });
      const json = (await response.json()) as AnalyzeResponse;
      if (!response.ok || !json.ok || !json.data) {
        setMessage({ tone: "error", text: json.error?.message ?? "分析失败，请稍后重试。" });
        return;
      }

      const data = json.data;
      setAnalysis(data.analysis);
      setTrends(data.trends);
      setSearchStatus(data.searchStatus);
      setAnalysisMeta(data.analysisMeta);
      setTrendMeta(data.trendMeta);
      setCompleteness(data.completeness);
      setProfile({
        id: data.profileId,
        name: name.trim(),
        industry,
        city,
        platforms: platforms.split(/[、,，\s]+/).filter(Boolean),
        targetCustomer,
        products,
        goal,
        analysis: data.analysis,
        trends: data.trends,
        analysisMode: data.analysisMeta.mode,
        trendMode: data.trendMeta.mode,
        searchStatus: data.searchStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setView("analysis");

      // 分析完成后自动生成选题池（Step 4-5）
      const topicResponse = await fetch("/api/ip/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: data.profileId }),
      });
      const topicJson = (await topicResponse.json()) as TopicsResponse;
      if (topicResponse.ok && topicJson.ok && topicJson.data) {
        setTopics(topicJson.data.topics);
        setToday(topicJson.data.today);
        setPlan(null);
        await refreshHistory();
      } else {
        setMessage({ tone: "warning", text: topicJson.error?.message ?? "IP 分析完成，但选题生成失败，可点击「重新生成选题」。" });
      }
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "网络异常，请稍后重试。" });
    } finally {
      setAnalyzing(false);
      notifyAiUsageChanged();
    }
  }, [name, industry, city, platforms, targetCustomer, products, goal, refreshHistory]);

  const regenerateTopics = React.useCallback(
    async (reason?: string) => {
      if (!profile) return;
      const response = await fetch("/api/ip/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          feedback: reason ? { action: "regenerate", reason } : undefined,
        }),
      }).finally(notifyAiUsageChanged);
      const json = (await response.json()) as TopicsResponse;
      if (response.ok && json.ok && json.data) {
        setTopics(json.data.topics);
        setToday(json.data.today);
        setScript(null);
        setMessage({ tone: "success", text: "已重新生成选题池。" });
      } else {
        setMessage({ tone: "error", text: json.error?.message ?? "重新生成失败。" });
      }
    },
    [profile],
  );

  const generatePlan = React.useCallback(async () => {
    if (!profile) {
      setMessage({ tone: "warning", text: "请先分析一个 IP。" });
      return;
    }
    setPlanLoading(true);
    try {
      const response = await fetch("/api/ip/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id }),
      });
      const json = (await response.json()) as { ok: boolean; data?: { planId: string; plan: IpPlanDto["payload"] }; meta?: IpRunMeta; error?: { message: string } };
      if (response.ok && json.ok && json.data) {
        setPlan({ id: json.data.planId, payload: json.data.plan, mode: json.meta?.mode ?? "demo", createdAt: new Date().toISOString() });
        setView("matrix");
        setMessage({ tone: "success", text: "已生成内容矩阵与 7 天计划。" });
      } else {
        setMessage({ tone: "error", text: json.error?.message ?? "生成计划失败。" });
      }
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "网络异常。" });
    } finally {
      setPlanLoading(false);
      notifyAiUsageChanged();
    }
  }, [profile]);

  const openHistory = React.useCallback(async (id: string) => {
    setMessage(null);
    setScript(null);
    try {
      const response = await fetch(`/api/ip/profile?id=${encodeURIComponent(id)}`);
      const json = (await response.json()) as {
        ok: boolean;
        data?: { profile: IpProfileDto; topics: IpTopicDto[]; plan: IpPlanDto | null; today: TodayTopic };
        error?: { message: string };
      };
      if (!response.ok || !json.ok || !json.data) {
        setMessage({ tone: "error", text: json.error?.message ?? "读取历史记录失败。" });
        return;
      }
      const { profile: loaded, topics: loadedTopics, plan: loadedPlan, today: loadedToday } = json.data;
      setProfile(loaded);
      setAnalysis(loaded.analysis);
      setTrends(loaded.trends);
      setSearchStatus(loaded.searchStatus);
      setAnalysisMeta(null);
      setTrendMeta(null);
      setTopics(loadedTopics);
      setPlan(loadedPlan);
      setToday(loadedToday);
      setName(loaded.name);
      setIndustry(loaded.industry);
      setCity(loaded.city);
      setPlatforms(loaded.platforms.join("、"));
      setTargetCustomer(loaded.targetCustomer);
      setProducts(loaded.products);
      setGoal(loaded.goal);
      setView(loadedTopics.length > 0 ? "topics" : "analysis");
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "网络异常。" });
    }
  }, []);

  const removeHistory = React.useCallback(async (id: string) => {
    try {
      await fetch(`/api/ip/profile?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      await refreshHistory();
      if (profile?.id === id) {
        setProfile(null);
        setTopics([]);
        setPlan(null);
        setToday(null);
      }
    } catch {
      // 忽略
    }
  }, [profile?.id, refreshHistory]);

  const showScript = React.useCallback((payload: IpScriptViewState) => {
    setScript(payload);
    setView("topics");
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[196px_minmax(0,1fr)_312px]">
      <nav className="space-y-1.5 lg:sticky lg:top-20 lg:self-start">
        <p className="label-text px-2 pb-1">IP 工作台</p>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = view === item.key && !script;
          const count =
            item.key === "topics" ? topics.length : item.key === "history" ? history.length : undefined;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setView(item.key);
                if (item.key !== "topics") setScript(null);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors",
                active ? "bg-moss/12 text-moss-strong" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {typeof count === "number" ? <Badge tone="neutral">{count}</Badge> : null}
            </button>
          );
        })}

        <div className="surface-muted mt-3 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink">
            <Sparkles className="h-3.5 w-3.5 text-moss-strong" />
            {aiStatus.mode === "ai" ? `AI · ${aiStatus.model}` : "本地结构化引擎"}
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-ink-soft">{aiStatus.reason}</p>
        </div>
      </nav>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>输入 IP</CardTitle>
              <CardDescription>只有 IP 名称是必填的；其余信息填得越多，分析越准。</CardDescription>
            </div>
            <Badge tone="moss">6 个专职 Agent</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <FieldGroup label="IP 名称（必填）" hint="例如：伊宁房产王总">
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="伊宁房产王总" />
              </FieldGroup>
              <FieldGroup label="所在行业" hint="可选，不填则自动推断">
                <Input value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="房产 / 咖啡 / 健身" />
              </FieldGroup>
              <FieldGroup label="所在城市" hint="可选，影响本地化选题">
                <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="伊宁" />
              </FieldGroup>
              <FieldGroup label="主要平台" hint="多个平台用「、」分隔">
                <Input value={platforms} onChange={(event) => setPlatforms(event.target.value)} placeholder="抖音、小红书、视频号" />
              </FieldGroup>
              <FieldGroup label="目标客户" hint="可选">
                <Input value={targetCustomer} onChange={(event) => setTargetCustomer(event.target.value)} placeholder="首次购房的年轻人" />
              </FieldGroup>
              <FieldGroup label="产品 / 服务" hint="可选">
                <Input value={products} onChange={(event) => setProducts(event.target.value)} placeholder="二手房买卖、房源推荐" />
              </FieldGroup>
            </div>
            <div className="mt-3">
              <FieldGroup label="想达到的目标" hint="可选">
                <Input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="三个月涨到 1 万粉，带来购房咨询" />
              </FieldGroup>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="label-text">试试</span>
              {EXAMPLE_IPS.map((example) => (
                <Badge
                  key={example}
                  tone={example === name ? "moss" : "neutral"}
                  className="cursor-pointer"
                  role="button"
                  onClick={() => setName(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="moss" loading={analyzing} loadingLabel="分析中（联网 + AI）…" onClick={analyze}>
                <Wand2 className="h-3.5 w-3.5" />
                {profile ? "重新分析并生成选题" : "开始分析"}
              </Button>
              {profile ? (
                <Button variant="outline" loading={planLoading} onClick={generatePlan}>
                  <CalendarDays className="h-3.5 w-3.5" />
                  生成 7 天内容计划
                </Button>
              ) : null}
              {completeness ? (
                <span className="text-[11px] text-ink-soft">
                  已提供：{completeness.provided.join("、")}；缺少：{completeness.missing.length ? completeness.missing.join("、") : "无"}
                </span>
              ) : null}
            </div>

            {message ? (
              <Alert tone={message.tone} className="mt-3">
                {message.text}
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        {analyzing ? (
          <Card>
            <CardContent className="flex items-center gap-2 text-[12px] text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在执行：联网热点检索 → IP 分析 → 选题生成与评分 …
            </CardContent>
          </Card>
        ) : null}

        {renderCenter()}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <SidePanel analysis={analysis} trends={trends} topics={topics} searchStatus={searchStatus} />
      </aside>
    </div>
  );

  function renderCenter() {
    if (view === "history") {
      return (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>历史内容</CardTitle>
              <CardDescription>同一个 IP 再次分析时不会从零开始，会复用同一条记录。</CardDescription>
            </div>
            <Badge tone="neutral">{history.length} 个 IP</Badge>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-[12.5px] text-ink-muted">还没有历史记录。输入一个 IP 并点击「开始分析」即可创建。</p>
            ) : (
              <ul className="divide-y divide-ink-line">
                {history.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-[13px] font-medium">
                        {item.name}
                        <span className="ml-2 text-[11px] font-normal text-ink-soft">
                          {item.industry || "行业待补充"} {item.city ? `· ${item.city}` : ""}
                        </span>
                      </p>
                      <p className="truncate text-[11.5px] text-ink-muted">
                        {item.topicCount} 个选题 · 更新于 {formatDateLabel(item.updatedAt, true)}
                        {item.topTopic ? ` · 最高分：${item.topTopic}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openHistory(item.id)}>
                        打开
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="删除记录" onClick={() => removeHistory(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      );
    }

    if (script) {
      return (
        <IpTopicView
          topics={topics}
          today={today}
          selectedTopicId={script.topic.id}
          script={script}
          onBack={() => setScript(null)}
          onSelectTopic={() => undefined}
          onTopicsChanged={setTopics}
          onTodayChanged={setToday}
          onShowScript={showScript}
          onRegenerateTopics={regenerateTopics}
        />
      );
    }

    if (view === "analysis") {
      return (
        <IpAnalysisView
          analysis={analysis}
          trends={trends}
          searchStatus={searchStatus}
          analysisMeta={analysisMeta}
          trendMeta={trendMeta}
          completeness={completeness}
        />
      );
    }

    if (view === "matrix" || view === "plan") {
      return <IpPlanView plan={plan} view={view} loading={planLoading} onGenerate={generatePlan} />;
    }

    if (view === "today") {
      return (
        <IpTopicView
          topics={topics}
          today={today}
          mode="today"
          selectedTopicId={null}
          script={null}
          onBack={() => setView("analysis")}
          onSelectTopic={() => undefined}
          onTopicsChanged={setTopics}
          onTodayChanged={setToday}
          onShowScript={showScript}
          onRegenerateTopics={regenerateTopics}
        />
      );
    }

    return (
      <IpTopicView
        topics={topics}
        today={today}
        mode="pool"
        selectedTopicId={null}
        script={null}
        onBack={() => setView("analysis")}
        onSelectTopic={() => undefined}
        onTopicsChanged={setTopics}
        onTodayChanged={setToday}
        onShowScript={showScript}
        onRegenerateTopics={regenerateTopics}
      />
    );
  }
}

function SidePanel({
  analysis,
  trends,
  topics,
  searchStatus,
}: {
  analysis: IpAnalysis | null;
  trends: TrendResearch | null;
  topics: IpTopicDto[];
  searchStatus: TrendSearchStatus | null;
}) {
  const topTopics = [...topics].sort((a, b) => b.overallScore - a.overallScore).slice(0, 3);

  return (
    <>
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Rss className="h-3.5 w-3.5 text-ink-soft" />
          <p className="text-[13px] font-semibold">热点</p>
          {searchStatus ? (
            <Badge tone={searchStatus.performed ? "good" : "neutral"}>
              {searchStatus.performed ? `${searchStatus.provider} · ${searchStatus.resultCount}` : "未联网"}
            </Badge>
          ) : null}
        </div>
        {trends ? (
          <div className="space-y-2.5">
            {trends.hotTopics.slice(0, 4).map((item) => (
              <div key={item.title} className="surface-muted px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-medium leading-snug">{item.title}</p>
                  <LabelBadge label={item.label} />
                </div>
                <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-ink-muted">{item.summary}</p>
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[10.5px] text-moss-strong underline-offset-2 hover:underline">
                    {item.sourceTitle || item.sourceUrl}
                  </a>
                ) : (
                  <p className="mt-1 text-[10.5px] text-ink-soft">无来源 · {item.label}</p>
                )}
              </div>
            ))}
            <p className="text-[10.5px] leading-relaxed text-ink-soft">{trends.reliabilityNote}</p>
          </div>
        ) : (
          <p className="text-[11.5px] text-ink-muted">分析 IP 后会显示行业热点与来源。</p>
        )}
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-ink-soft" />
          <p className="text-[13px] font-semibold">用户痛点</p>
        </div>
        {trends && trends.userPainPoints.length > 0 ? (
          <ul className="space-y-1.5">
            {trends.userPainPoints.slice(0, 5).map((item) => (
              <li key={item.pain} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
                <span>{item.pain}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-ink-muted">分析 IP 后会显示目标用户的真实痛点。</p>
        )}
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-ink-soft" />
          <p className="text-[13px] font-semibold">推荐方向</p>
        </div>
        {topTopics.length > 0 ? (
          <ol className="space-y-2.5">
            {topTopics.map((topic, index) => (
              <li key={topic.id} className="surface-muted px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-medium leading-snug">
                    {index + 1}. {topic.title}
                  </p>
                  <Badge tone="moss">{topic.overallScore}</Badge>
                </div>
                <Progress value={topic.overallScore} tone="moss" className="mt-2" />
                <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ink-soft">
                  <span>{topic.topicType}</span>
                  <span>{"★".repeat(topic.potentialStars)}{"☆".repeat(5 - topic.potentialStars)}</span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[11.5px] text-ink-muted">生成选题池后会显示最值得先做的方向。</p>
        )}
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <TriangleAlert className="h-3.5 w-3.5 text-ink-soft" />
          <p className="text-[13px] font-semibold">风险提醒</p>
        </div>
        <ul className="space-y-2">
          {(analysis?.risks ?? []).slice(0, 3).map((item) => (
            <li key={item.title} className="text-[11.5px] leading-relaxed text-ink-muted">
              <span className="font-medium text-ink">{item.title}：</span>
              {item.body}
            </li>
          ))}
          {(trends?.risks ?? []).slice(0, 2).map((item) => (
            <li key={item.title} className="text-[11.5px] leading-relaxed text-ink-muted">
              <span className="font-medium text-ink">{item.title}：</span>
              {item.body}
            </li>
          ))}
          {(analysis?.cautions ?? []).slice(0, 2).map((item) => (
            <li key={item} className="text-[11.5px] leading-relaxed text-ink-muted">
              {item}
            </li>
          ))}
          {!analysis && topics.length === 0 ? <li className="text-[11.5px] text-ink-muted">分析后显示风险提醒。</li> : null}
        </ul>
      </Card>

      <div className="flex items-center gap-2 px-1">
        <BarChart3 className="h-3.5 w-3.5 text-ink-soft" />
        <p className="text-[10.5px] leading-relaxed text-ink-soft">
          事实 / AI推测 / 需要进一步验证 会全程标注；没有可靠来源时不会编造热点。
        </p>
      </div>
      <div className="flex items-center gap-2 px-1">
        <BookMarked className="h-3.5 w-3.5 text-ink-soft" />
        <p className="text-[10.5px] leading-relaxed text-ink-soft">评分由固定权重计算：热点15% · 痛点25% · 匹配20% · 差异化15% · 传播15% · 商业10%。</p>
      </div>
    </>
  );
}

export type IpScriptViewState = {
  topic: IpTopicDto;
  script: ScriptBundle;
  shot: ShotPlan;
  selectedHook: string;
};
