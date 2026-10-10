import { audienceBreakdown, compareWindows, creativeScorecard, dailySeries, deriveSignals, groupPerformance } from "@/lib/analytics";
import {
  buildDemoAudienceMetrics,
  buildDemoBrand,
  buildDemoCompetitors,
  buildDemoContents,
  buildDemoExperiments,
  buildDemoMetrics,
  buildDemoPersonas,
  buildDemoProduct,
} from "@/lib/demo-data";
import { computeMetrics } from "@/lib/metrics";
import type { BusinessContext } from "@/lib/ai/context";
import type { AudienceSegmentRow } from "@/lib/analytics";

/** Builds the same business context the server assembles from the database, using the demo generator. */
export function buildTestContext(): BusinessContext {
  const rows = buildDemoMetrics();
  const audienceRows: AudienceSegmentRow[] = buildDemoAudienceMetrics().map((row) => ({
    date: row.date,
    platform: "全渠道",
    campaign: "全渠道",
    creative: row.segment,
    segment: row.segment,
    age: row.age,
    gender: row.gender,
    spend: row.spend,
    impressions: row.impressions,
    clicks: row.clicks,
    conversions: row.conversions,
    revenue: row.revenue,
  }));

  const daily = dailySeries(rows);
  const brand = buildDemoBrand();
  const product = buildDemoProduct();

  return {
    brand: {
      id: "brand",
      name: brand.name,
      nameEn: brand.nameEn,
      positioning: brand.positioning,
      description: brand.description,
      productName: brand.productName,
      priceRange: brand.priceRange,
      targetAudience: brand.targetAudience,
      channels: JSON.parse(brand.channels) as string[],
      keywords: JSON.parse(brand.keywords) as string[],
    },
    product: {
      id: "product",
      brandName: product.brandName,
      name: product.name,
      category: product.category,
      positioning: product.positioning,
      price: product.price,
      volume: product.volume,
      keyBenefits: JSON.parse(product.keyBenefits) as string[],
      sellingPoints: JSON.parse(product.sellingPoints) as string[],
      usageScenario: JSON.parse(product.usageScenario) as string[],
      credibility: JSON.parse(product.credibility) as string[],
    },
    personas: buildDemoPersonas().map((persona, index) => ({
      id: `persona-${index}`,
      code: persona.code,
      name: persona.name,
      ageBand: persona.ageBand,
      occupation: persona.occupation,
      city: persona.city,
      share: persona.share,
      painPoints: JSON.parse(persona.painPoints) as string[],
      motivations: JSON.parse(persona.motivations) as string[],
      contentPreferences: JSON.parse(persona.contentPreferences) as string[],
      purchaseDrivers: JSON.parse(persona.purchaseDrivers) as string[],
      barriers: JSON.parse(persona.barriers) as string[],
      channels: JSON.parse(persona.channels) as string[],
      quote: persona.quote,
      accent: persona.accent,
    })),
    competitors: buildDemoCompetitors().map((competitor, index) => ({
      id: `competitor-${index}`,
      name: competitor.name,
      positioning: competitor.positioning,
      price: competitor.price,
      priceTier: competitor.priceTier,
      professional: competitor.professional,
      audience: competitor.audience,
      contentThemes: JSON.parse(competitor.contentThemes) as string[],
      mainChannels: JSON.parse(competitor.mainChannels) as string[],
      adThemes: JSON.parse(competitor.adThemes) as string[],
      strength: competitor.strength,
      weakness: competitor.weakness,
      colorToken: competitor.colorToken,
      isSelf: competitor.isSelf,
    })),
    period: {
      start: daily[0]?.date ?? "",
      end: daily[daily.length - 1]?.date ?? "",
      label: `${daily[0]?.date ?? ""} ~ ${daily[daily.length - 1]?.date ?? ""}`,
      days: daily.length,
    },
    totals: computeMetrics(rows),
    daily,
    platforms: groupPerformance(rows, "platform"),
    campaigns: groupPerformance(rows, "campaign"),
    creatives: creativeScorecard(rows),
    comparison: compareWindows(rows, 7),
    audience: audienceBreakdown(audienceRows),
    signals: deriveSignals(rows, audienceRows),
    contents: buildDemoContents().map((content, index) => ({
      id: `content-${index}`,
      ...content,
    })),
    experiments: buildDemoExperiments().map((experiment, index) => ({
      id: `experiment-${index}`,
      name: experiment.name,
      hypothesis: experiment.hypothesis,
      goal: experiment.goal,
      primaryMetric: experiment.primaryMetric,
      status: experiment.status,
      startDate: "2026-09-01",
      endDate: "2026-09-15",
      summary: experiment.summary,
      aiRecommendation: experiment.aiRecommendation,
      mode: "demo",
      variants: experiment.variants.map((variant, variantIndex) => ({
        id: `variant-${index}-${variantIndex}`,
        ...variant,
        isWinner: experiment.status === "completed" && variantIndex === 1,
      })),
    })),
    dataSource: { kind: "demo", label: "Test fixture (demo generator)", rows: rows.length },
  };
}
