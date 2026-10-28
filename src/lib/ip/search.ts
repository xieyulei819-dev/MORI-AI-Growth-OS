/**
 * 联网搜索（Trend Researcher 的输入层）。
 *
 * 复用当前项目已有的能力：MORI 主体没有搜索引擎，因此这里提供一个
 * **可插拔**的搜索适配层，支持常见的搜索 API（Tavily / Serper / Bing /
 * 自定义 OpenAI 兼容搜索服务），只需在 .env.local 里配置：
 *
 *   SEARCH_PROVIDER="tavily"        # tavily | serper | bing | custom | none
 *   SEARCH_API_KEY="..."            # 也支持 TAVILY_API_KEY / SERPER_API_KEY / BING_SEARCH_KEY
 *   SEARCH_BASE_URL=""             # 仅 custom 需要
 *
 * 关键原则：**不编造热点**。如果没配置搜索、或搜索失败、或没有结果，
 * 明确返回 performed=false，由上层把 reliabilityNote 写成
 * 「当前没有找到足够可靠的热点信息。」，而不是让模型凭空编热点。
 */

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  source: string;
};

export type TrendSearchStatus = {
  performed: boolean;
  provider: string;
  queries: string[];
  resultCount: number;
  /** 面向用户的说明：搜索是否真的发生、为什么没有结果 */
  note: string;
  error?: string;
};

export type TrendSearchOutcome = {
  status: TrendSearchStatus;
  results: SearchResult[];
};

type ProviderId = "tavily" | "serper" | "bing" | "custom" | "none";

function readEnv(name: string) {
  return (process.env[name] ?? "").trim();
}

function resolveProvider(): { id: ProviderId; apiKey: string; baseUrl: string } {
  const explicit = readEnv("SEARCH_PROVIDER").toLowerCase();
  const apiKey = readEnv("SEARCH_API_KEY");
  const baseUrl = readEnv("SEARCH_BASE_URL");

  const keyFor = (name: string) => apiKey || readEnv(name);

  if (explicit === "tavily" || explicit === "serper" || explicit === "bing" || explicit === "custom") {
    return { id: explicit, apiKey: keyFor(explicit === "bing" ? "BING_SEARCH_KEY" : `${explicit.toUpperCase()}_API_KEY`), baseUrl };
  }
  if (explicit === "none" || explicit === "") {
    // Auto-detect by available key, so it works even without SEARCH_PROVIDER.
    if (readEnv("TAVILY_API_KEY") || apiKey) return { id: "tavily", apiKey: keyFor("TAVILY_API_KEY"), baseUrl };
    if (readEnv("SERPER_API_KEY")) return { id: "serper", apiKey: keyFor("SERPER_API_KEY"), baseUrl };
    if (readEnv("BING_SEARCH_KEY")) return { id: "bing", apiKey: keyFor("BING_SEARCH_KEY"), baseUrl };
    if (baseUrl) return { id: "custom", apiKey: keyFor("SEARCH_API_KEY"), baseUrl };
    return { id: "none", apiKey: "", baseUrl: "" };
  }
  return { id: "none", apiKey: "", baseUrl: "" };
}

export function isSearchConfigured(): boolean {
  const provider = resolveProvider();
  return provider.id !== "none" && (provider.apiKey.length > 0 || provider.id === "custom");
}

function withTimeout(ms: number): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

async function searchTavily(query: string, apiKey: string): Promise<SearchResult[]> {
  const { signal, done } = withTimeout(15_000);
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, query, max_results: 5, search_depth: "basic" }),
      signal,
    });
    if (!response.ok) throw new Error(`tavily ${response.status}`);
    const payload = (await response.json()) as {
      results?: Array<{ title?: string; url?: string; content?: string; published_date?: string }>;
    };
    return (payload.results ?? []).map((item) => ({
      title: item.title ?? "",
      url: item.url ?? "",
      snippet: item.content ?? "",
      publishedAt: item.published_date,
      source: "Tavily",
    }));
  } finally {
    done();
  }
}

async function searchSerper(query: string, apiKey: string): Promise<SearchResult[]> {
  const { signal, done } = withTimeout(15_000);
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
      body: JSON.stringify({ q: query, num: 5, gl: "cn", hl: "zh-cn" }),
      signal,
    });
    if (!response.ok) throw new Error(`serper ${response.status}`);
    const payload = (await response.json()) as {
      organic?: Array<{ title?: string; link?: string; snippet?: string; date?: string }>;
    };
    return (payload.organic ?? []).map((item) => ({
      title: item.title ?? "",
      url: item.link ?? "",
      snippet: item.snippet ?? "",
      publishedAt: item.date,
      source: "Serper",
    }));
  } finally {
    done();
  }
}

async function searchBing(query: string, apiKey: string): Promise<SearchResult[]> {
  const { signal, done } = withTimeout(15_000);
  try {
    const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=5&mkt=zh-CN`;
    const response = await fetch(url, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
      signal,
    });
    if (!response.ok) throw new Error(`bing ${response.status}`);
    const payload = (await response.json()) as {
      webPages?: { value?: Array<{ name?: string; url?: string; snippet?: string; dateLastCrawled?: string }> };
    };
    return (payload.webPages?.value ?? []).map((item) => ({
      title: item.name ?? "",
      url: item.url ?? "",
      snippet: item.snippet ?? "",
      publishedAt: item.dateLastCrawled,
      source: "Bing",
    }));
  } finally {
    done();
  }
}

async function searchCustom(query: string, apiKey: string, baseUrl: string): Promise<SearchResult[]> {
  const { signal, done } = withTimeout(15_000);
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ query, max_results: 5 }),
      signal,
    });
    if (!response.ok) throw new Error(`custom ${response.status}`);
    const payload = (await response.json()) as {
      results?: Array<{ title?: string; url?: string; snippet?: string; content?: string; publishedAt?: string }>;
    };
    return (payload.results ?? []).map((item) => ({
      title: item.title ?? "",
      url: item.url ?? "",
      snippet: item.snippet ?? item.content ?? "",
      publishedAt: item.publishedAt,
      source: "Custom",
    }));
  } finally {
    done();
  }
}

/** 执行一次联网搜索（多个 query 并行，去重后返回）。失败不会抛出，只反映在 status 里。 */
export async function runTrendSearch(queries: string[]): Promise<TrendSearchOutcome> {
  const provider = resolveProvider();
  const cleanQueries = queries.map((query) => query.trim()).filter(Boolean).slice(0, 4);

  if (provider.id === "none" || (provider.apiKey.length === 0 && provider.id !== "custom")) {
    return {
      status: {
        performed: false,
        provider: "none",
        queries: cleanQueries,
        resultCount: 0,
        note:
          "未配置联网搜索（可设置 SEARCH_PROVIDER= tavily|serper|bing|custom 与 SEARCH_API_KEY）。" +
          "当前没有找到足够可靠的热点信息，以下热点均为 AI 推测。",
      },
      results: [],
    };
  }

  if (cleanQueries.length === 0) {
    return {
      status: {
        performed: false,
        provider: provider.id,
        queries: [],
        resultCount: 0,
        note: "没有可用的搜索关键词，当前没有找到足够可靠的热点信息。",
      },
      results: [],
    };
  }

  try {
    const batches = await Promise.all(
      cleanQueries.map((query) => {
        if (provider.id === "tavily") return searchTavily(query, provider.apiKey);
        if (provider.id === "serper") return searchSerper(query, provider.apiKey);
        if (provider.id === "bing") return searchBing(query, provider.apiKey);
        return searchCustom(query, provider.apiKey, provider.baseUrl);
      }),
    );

    const seen = new Set<string>();
    const results: SearchResult[] = [];
    batches.forEach((batch) => {
      batch.forEach((item) => {
        if (!item.url || seen.has(item.url)) return;
        seen.add(item.url);
        results.push(item);
      });
    });

    if (results.length === 0) {
      return {
        status: {
          performed: true,
          provider: provider.id,
          queries: cleanQueries,
          resultCount: 0,
          note: `已通过 ${provider.id} 搜索，但没有返回可用结果。当前没有找到足够可靠的热点信息。`,
        },
        results: [],
      };
    }

    return {
      status: {
        performed: true,
        provider: provider.id,
        queries: cleanQueries,
        resultCount: results.length,
        note: `已通过 ${provider.id} 联网搜索 ${cleanQueries.length} 个关键词，返回 ${results.length} 条结果；来源链接见各条热点。`,
      },
      results: results.slice(0, 16),
    };
  } catch (error) {
    return {
      status: {
        performed: false,
        provider: provider.id,
        queries: cleanQueries,
        resultCount: 0,
        note:
          "联网搜索失败（可能网络受限 / 未授权）：当前没有找到足够可靠的热点信息，以下热点均为 AI 推测。",
        error: error instanceof Error ? error.message : "未知错误",
      },
      results: [],
    };
  }
}
