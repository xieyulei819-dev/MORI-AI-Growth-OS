import { IpWorkbench } from "@/components/ip/ip-workbench";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page";
import { ipAgentStatusSummary } from "@/lib/ip/runner";
import { getLatestPlan, getProfileDto, getTopics, listProfiles, todayRecommendation } from "@/lib/ip/store";

export const dynamic = "force-dynamic";

/**
 * IP 智能选题与短视频内容策划 Agent（独立模块）。
 * 左侧 IP 工作台 · 中间当前工作区 · 右侧 AI 建议。
 */
export default async function IpPlannerPage() {
  const history = await listProfiles(20);
  const latest = history[0];
  const profile = latest ? await getProfileDto(latest.id) : null;
  const topics = profile ? await getTopics(profile.id) : [];
  const plan = profile ? await getLatestPlan(profile.id) : null;
  const today = todayRecommendation(topics);
  const status = ipAgentStatusSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="IP Content Planner"
        title="IP 智能选题与短视频内容策划"
        titleEn="IP Topic & Short-Video Planner"
        description="输入一个 IP（人物 / 品牌），系统会先分析它，再结合联网热点与行业规律，生成选题池、评分、TOP 5、脚本、镜头方案与 7 天内容计划。事实与推测全程分开标注。"
        meta={
          <>
            <Badge tone="moss">6 个专职 Agent</Badge>
            <Badge tone="neutral">选题池 ≥ 10 · TOP 5 自动评分</Badge>
            <Badge tone={status.mode === "ai" ? "moss" : "neutral"}>
              {status.mode === "ai" ? `AI · ${status.model}` : "本地结构化引擎"}
            </Badge>
            <Badge tone="clay" title={status.reason}>
              事实 / AI推测 / 需要进一步验证
            </Badge>
          </>
        }
      />

      <IpWorkbench
        initialHistory={history}
        initialProfile={profile}
        initialTopics={topics}
        initialPlan={plan}
        initialToday={today}
        aiStatus={{ mode: status.mode, model: status.model, provider: status.provider, reason: status.reason }}
      />
    </div>
  );
}
