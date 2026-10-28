import { z } from "zod";

import { ipOk, parseBody, readJson, serverError } from "@/lib/ip/api";
import { buildSearchQueries, describeInputCompleteness, normalizeIpInput, resolveIndustry } from "@/lib/ip/input";
import { runIpAgent } from "@/lib/ip/runner";
import { runTrendSearch } from "@/lib/ip/search";
import { saveProfileAnalysis } from "@/lib/ip/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  name: z.string().min(1).max(60),
  industry: z.string().max(60).optional(),
  city: z.string().max(40).optional(),
  platforms: z.array(z.string().max(30)).max(6).optional(),
  targetCustomer: z.string().max(120).optional(),
  products: z.string().max(120).optional(),
  goal: z.string().max(200).optional(),
});

/**
 * Step 1-3：输入 IP → 分析 IP → 联网寻找最新内容机会 → 生成热点研究。
 * 复用 MORI 已有的 DeepSeek / OpenAI-compatible 调用与 Demo 回退。
 */
export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const input = normalizeIpInput(parsed.data);
    const industryKey = resolveIndustry(input);
    const completeness = describeInputCompleteness(input);

    // 先联网搜索（没有配置搜索 / 失败时不会抛出，只体现在 searchStatus 里）。
    const queries = buildSearchQueries(input, industryKey);
    const search = await runTrendSearch(queries);

    const analysis = await runIpAgent("ip_analyst", { input, industryKey });
    const trends = await runIpAgent("ip_trend_researcher", {
      input,
      industryKey,
      analysis: analysis.data,
      searchResults: search.results,
      searchStatus: search.status,
    });

    const profileId = await saveProfileAnalysis({
      input,
      industryKey,
      analysis: analysis.data,
      analysisMode: analysis.meta.mode,
      trends: trends.data,
      trendMode: trends.meta.mode,
      searchStatus: search.status,
    });

    return ipOk(
      {
        profileId,
        input,
        industryKey,
        completeness,
        analysis: analysis.data,
        analysisMeta: analysis.meta,
        trends: trends.data,
        trendMeta: trends.meta,
        searchStatus: search.status,
      },
      analysis.meta,
    );
  } catch (error) {
    return serverError(error, "无法完成 IP 分析，请稍后重试。");
  }
}
