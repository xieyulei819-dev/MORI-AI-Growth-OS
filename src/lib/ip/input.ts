import { detectIndustry, fillTemplate, INDUSTRY_PROFILES, type IndustryKey, type IpFillContext } from "@/lib/ip/knowledge";

/** 用户输入：只有 name 必填，其余都是可选，缺失时由系统推断。 */
export type IpInput = {
  name: string;
  industry: string;
  city: string;
  platforms: string[];
  targetCustomer: string;
  products: string;
  goal: string;
};

export function normalizeIpInput(raw: Partial<IpInput> & { name: string }): IpInput {
  return {
    name: (raw.name ?? "").trim(),
    industry: (raw.industry ?? "").trim(),
    city: (raw.city ?? "").trim(),
    platforms: Array.isArray(raw.platforms) ? raw.platforms.map((item) => String(item).trim()).filter(Boolean) : [],
    targetCustomer: (raw.targetCustomer ?? "").trim(),
    products: (raw.products ?? "").trim(),
    goal: (raw.goal ?? "").trim(),
  };
}

export function resolveIndustry(input: IpInput): IndustryKey {
  return detectIndustry({
    name: input.name,
    industry: input.industry,
    products: input.products,
    targetCustomer: input.targetCustomer,
  });
}

export function buildFillContext(input: IpInput, industryKey: IndustryKey): IpFillContext {
  const profile = INDUSTRY_PROFILES[industryKey];
  return {
    name: input.name || "这位主理人",
    city: input.city || "本地",
    industry: input.industry || profile.label,
    product: input.products || profile.industryName,
    customer: input.targetCustomer || profile.audience[0]?.name || "目标客户",
  };
}

/** 构造联网搜索关键词：城市 + 行业 + 平台 + 通用选题方向。 */
export function buildSearchQueries(input: IpInput, industryKey: IndustryKey): string[] {
  const profile = INDUSTRY_PROFILES[industryKey];
  const context = buildFillContext(input, industryKey);
  const queries = profile.searchQueries.map((template) => fillTemplate(template, context));
  if (input.platforms.length > 0) {
    queries.push(`${context.city} ${input.platforms[0]} 热门内容`);
  }
  return Array.from(new Set(queries.map((query) => query.trim()).filter(Boolean))).slice(0, 4);
}

export function describeInputCompleteness(input: IpInput): { provided: string[]; missing: string[] } {
  const provided: string[] = ["IP 名称"];
  const missing: string[] = [];
  const fields: Array<[keyof IpInput, string]> = [
    ["industry", "所在行业"],
    ["city", "所在城市"],
    ["platforms", "主要平台"],
    ["targetCustomer", "目标客户"],
    ["products", "产品 / 服务"],
    ["goal", "想达到的目标"],
  ];
  fields.forEach(([key, label]) => {
    const value = input[key];
    const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && String(value).trim());
    if (filled) provided.push(label);
    else missing.push(label);
  });
  return { provided, missing };
}
