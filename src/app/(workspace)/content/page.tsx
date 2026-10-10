import { ContentLibrary } from "@/components/content/content-library";
import { ContentStudio } from "@/components/content/content-studio";
import { Badge } from "@/components/ui/badge";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { getBusinessContext, getContentLibrary } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const [context, library] = await Promise.all([getBusinessContext(), getContentLibrary(60)]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content Studio"
        title="内容策划"
        titleEn="Content Studio"
        description="选择平台 / 内容类型 / 目标 / 主题，AI 生成小红书标题与正文、抖音 15 秒脚本，并给出 Hook、相关性、转化潜力与品牌契合度评分。"
        meta={
          <>
            <Badge tone="moss">内容库 {library.length} 条</Badge>
            <Badge tone="neutral">平台：小红书 / 抖音 / 公众号</Badge>
            <Badge tone="neutral">含合规约束（无功效承诺）</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="生成内容方案" titleEn="Generate" description="结果可一键保存到内容库，并进入测试状态。">
        <ContentStudio personaNames={context.personas.map((persona) => persona.name)} />
      </Section>

      <Section
        title="内容库"
        titleEn="Content Library"
        description="包含 AI 生成并保存的内容与预置 Demo 内容，按综合评分排序。"
      >
        <ContentLibrary items={library} limit={9} />
      </Section>
    </div>
  );
}
