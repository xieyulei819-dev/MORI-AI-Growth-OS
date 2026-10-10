/**
 * MORI 森屿 Demo 数据生成器  (Demo / 模拟业务数据)
 *
 * Everything here is deterministic: the same seed always produces exactly the
 * same numbers, which is what allows the automated tests to assert the
 * dashboard targets (ROAS 3.12, CTR 1.77%, CPC ¥1.49, CPA ¥39.69 ...).
 *
 * Design notes
 * ------------
 * 1. Creative level targets (CTR / CVR / AOV / ROAS) are the "source of truth".
 * 2. Impression shares are solved so that the weighted CTR equals the account
 *    target exactly (see `balanceShares`).
 * 3. `allocateExact` splits every creative total across 30 days without losing
 *    a single unit, so account totals stay exact while daily series stay
 *    realistic (seasonality + weekday pattern + last-week efficiency drop).
 */

import type { MetricRow } from "@/types";

export const DEMO_BRAND_NAME = "MORI 森屿";
export const DEMO_PRODUCT_NAME = "MORI 森屿晚间修护精华";
export const DEMO_PERIOD_DAYS = 30;
/** last day of the simulated reporting window */
export const DEMO_PERIOD_END = "2026-09-15";
export const DEMO_PERIOD_START = "2026-08-17";
export const DEMO_PERIOD_LABEL = "2026-08-17 ~ 2026-09-15（Demo）";

/** Account-level targets shown on the dashboard. */
export const DEMO_TARGETS = {
  spend: 128_600,
  impressions: 4_860_000,
  clicks: 86_200,
  conversions: 3_240,
  /** 401,232 / 128,600 = 3.12 ROAS */
  revenue: 401_232,
} as const;

export const DEMO_PLATFORMS = ["抖音", "小红书", "信息流广告"] as const;

/* -------------------------------------------------------------------------- */
/* deterministic helpers                                                       */
/* -------------------------------------------------------------------------- */

export function createRng(seed: number) {
  let state = seed >>> 0;
  return function rng() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Split `total` into integers using `weights`; the parts always sum to total. */
export function allocateExact(total: number, weights: number[]): number[] {
  const safeTotal = Math.round(total);
  const sum = weights.reduce((acc, weight) => acc + (Number.isFinite(weight) && weight > 0 ? weight : 0), 0);
  if (weights.length === 0) return [];
  if (sum <= 0 || safeTotal <= 0) return weights.map(() => 0);

  const raw = weights.map((weight) => ((Number.isFinite(weight) && weight > 0 ? weight : 0) / sum) * safeTotal);
  const parts = raw.map((value) => Math.floor(value));
  let remainder = safeTotal - parts.reduce((acc, value) => acc + value, 0);

  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  let cursor = 0;
  while (remainder > 0 && order.length > 0) {
    parts[order[cursor % order.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }

  return parts;
}

/**
 * Finds shares that satisfy both Σ shareᵢ = 1 and Σ shareᵢ · ctrᵢ = target.
 * The two `balancers` absorb the difference, one above and one below the target.
 */
export function balanceShares(
  specs: Array<{ key: string; ctr: number }>,
  baseShares: number[],
  targetCtr: number,
  balancerA: string,
  balancerB: string,
): number[] {
  const indexA = specs.findIndex((spec) => spec.key === balancerA);
  const indexB = specs.findIndex((spec) => spec.key === balancerB);
  if (indexA < 0 || indexB < 0 || indexA === indexB) return baseShares;

  const shares = [...baseShares];
  const ctrA = specs[indexA].ctr;
  const ctrB = specs[indexB].ctr;

  let fixedShareSum = 0;
  let fixedCtrSum = 0;
  specs.forEach((spec, index) => {
    if (index === indexA || index === indexB) return;
    fixedShareSum += shares[index];
    fixedCtrSum += shares[index] * spec.ctr;
  });

  const remainingShare = 1 - fixedShareSum;
  const remainingCtr = targetCtr - fixedCtrSum;
  const denominator = ctrA - ctrB;

  if (Math.abs(denominator) < 1e-9) return shares;

  const shareA = (remainingCtr - ctrB * remainingShare) / denominator;
  const shareB = remainingShare - shareA;

  // The closed form can be infeasible when the two balancers cannot bridge the
  // gap; in that case we fall back to a proportional nudge that keeps the
  // distribution sane (the residual is then absorbed by the exact allocator).
  if (!Number.isFinite(shareA) || !Number.isFinite(shareB) || shareA <= 0.01 || shareB <= 0.01) {
    const totalCtr = specs.reduce((acc, spec, index) => acc + spec.ctr * shares[index], 0);
    const correction = totalCtr === 0 ? 0 : targetCtr / totalCtr;
    const midCtr = specs.reduce((acc, spec) => acc + spec.ctr, 0) / specs.length;
    const adjusted = shares.map((share, index) => {
      const delta = (specs[index].ctr - midCtr) * correction;
      return Math.max(0.01, share + delta);
    });
    const adjustedSum = adjusted.reduce((acc, value) => acc + value, 0);
    return adjusted.map((value) => value / adjustedSum);
  }

  shares[indexA] = shareA;
  shares[indexB] = shareB;
  const total = shares.reduce((acc, value) => acc + value, 0);
  return shares.map((value) => value / total);
}

function weightedMean(values: number[], weights: number[]) {
  const weightSum = weights.reduce((acc, weight) => acc + weight, 0);
  if (weightSum <= 0) return 1;
  return values.reduce((acc, value, index) => acc + value * weights[index], 0) / weightSum;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/* -------------------------------------------------------------------------- */
/* creative level model                                                        */
/* -------------------------------------------------------------------------- */

export type CreativeSpec = {
  name: string;
  campaign: string;
  platform: string;
  theme: string;
  angle: string;
  hook: string;
  cta: string;
  audience: string;
  script: string;
  priority: string;
  status: string;
  ctr: number;
  cvr: number;
  aov: number;
  roas: number;
  share: number;
  /** headline benchmarks quoted in the product brief — protected from rebalancing */
  quoted: boolean;
};

export const DEMO_CAMPAIGNS = [
  {
    name: "夜间修护 · 抖音效率拉新",
    platform: "抖音",
    objective: "转化",
    status: "running",
    budget: 52_000,
    note: "以“熬夜场景 + 清爽肤感”为核心拉新，追求前 30 天 ROAS 稳定。",
  },
  {
    name: "熬夜场景 · 小红书种草",
    platform: "小红书",
    objective: "种草 / 互动",
    status: "running",
    budget: 34_000,
    note: "真实用户口吻的夜间护肤记录，为搜索与承接页导流。",
  },
  {
    name: "学生党性价比攻势",
    platform: "抖音",
    objective: "转化",
    status: "running",
    budget: 24_000,
    note: "用预算与单次使用成本解释降低首单门槛。",
  },
  {
    name: "成分科普信任建设",
    platform: "信息流广告",
    objective: "曝光 / 信任",
    status: "running",
    budget: 26_000,
    note: "科普型长内容，触达人群更广，点击率偏低但覆盖成本低。",
  },
  {
    name: "30 天肌肤稳定挑战",
    platform: "抖音",
    objective: "转化",
    status: "running",
    budget: 18_000,
    note: "以 30 天记录挑战制造持续关注，配合效果周期话术。",
  },
] as const;

const CAMPAIGN_BY_CREATIVE: Record<string, string> = {
  熬夜党晚间修护: "夜间修护 · 抖音效率拉新",
  睡前5分钟仪式感: "夜间修护 · 抖音效率拉新",
  早八通勤快速护肤: "熬夜场景 · 小红书种草",
  清爽不黏腻实测: "熬夜场景 · 小红书种草",
  学生党护肤预算: "学生党性价比攻势",
  男生也能用的修护精华: "学生党性价比攻势",
  成分党深度解析: "成分科普信任建设",
  敏感肌稳定期记录: "成分科普信任建设",
  "30天肌肤稳定挑战": "30 天肌肤稳定挑战",
  办公室空调肌救星: "30 天肌肤稳定挑战",
};

const PLATFORM_BY_CREATIVE: Record<string, string> = {
  熬夜党晚间修护: "抖音",
  睡前5分钟仪式感: "抖音",
  早八通勤快速护肤: "小红书",
  清爽不黏腻实测: "小红书",
  学生党护肤预算: "抖音",
  男生也能用的修护精华: "抖音",
  成分党深度解析: "信息流广告",
  敏感肌稳定期记录: "信息流广告",
  "30天肌肤稳定挑战": "抖音",
  办公室空调肌救星: "抖音",
};

/**
 * Reported creative benchmarks. The first four are the examples quoted in the
 * brief (CTR / ROAS) and are therefore pinned exactly.
 */
export const DEMO_CREATIVE_SPECS: CreativeSpec[] = [
  {
    name: "熬夜党晚间修护",
    campaign: CAMPAIGN_BY_CREATIVE["熬夜党晚间修护"],
    platform: PLATFORM_BY_CREATIVE["熬夜党晚间修护"],
    theme: "熬夜修护",
    angle: "熬夜场景共情",
    hook: "连续熬夜第 12 天，我的脸终于不闹脾气了",
    cta: "看一下这支夜间修护精华",
    audience: "18–30 岁熬夜女性（互联网 / 加班人群）",
    script:
      "0–3s Hook：镜头是凌晨 1 点的电脑屏幕与一张疲惫的脸。\n3–8s 痛点：熬夜后脸颊发干、上妆卡粉、第二天显疲态。\n8–12s 方案：睡前一步，清爽质地的晚间修护精华，吸收后再上保湿。\n12–15s CTA：点进来看真实使用第 30 天的记录。",
    priority: "P0",
    status: "scale",
    ctr: 0.0241,
    cvr: 0.0503,
    aov: 132,
    roas: 4.26,
    share: 0.1,
    quoted: true,
  },
  {
    name: "学生党护肤预算",
    campaign: CAMPAIGN_BY_CREATIVE["学生党护肤预算"],
    platform: PLATFORM_BY_CREATIVE["学生党护肤预算"],
    theme: "预算与性价比",
    angle: "性价比解释",
    hook: "学生党护肤真的不用堆产品，一瓶能用 2 个月",
    cta: "看单次成本怎么算",
    audience: "18–24 岁学生党 / 初次尝试精华人群",
    script:
      "0–3s Hook：把一瓶精华换算成每天的成本写在纸上。\n3–8s 痛点：预算有限，怕买贵了不适合自己。\n8–12s 方案：一支多用，晚间一步，配方信息可查。\n12–15s CTA：先看成分与用法说明再决定。",
    priority: "P0",
    status: "scale",
    ctr: 0.0218,
    cvr: 0.0463,
    aov: 108,
    roas: 3.91,
    share: 0.08,
    quoted: true,
  },
  {
    name: "30天肌肤稳定挑战",
    campaign: CAMPAIGN_BY_CREATIVE["30天肌肤稳定挑战"],
    platform: PLATFORM_BY_CREATIVE["30天肌肤稳定挑战"],
    theme: "长期稳定",
    angle: "挑战式内容",
    hook: "30 天只加一步护肤，记录每天的状态变化",
    cta: "加入 30 天挑战",
    audience: "20–28 岁关注肌肤稳定状态的女性",
    script:
      "0–3s Hook：日历翻到 Day 1，素颜出镜。\n3–8s 痛点：状态忽好忽坏，换产品越换越乱。\n8–12s 方案：只在夜间加一步修护，其他护肤不变。\n12–15s CTA：评论区回复「挑战」领取记录表。",
    priority: "P0",
    status: "scale",
    ctr: 0.0192,
    cvr: 0.043,
    aov: 126,
    roas: 3.64,
    share: 0.09,
    quoted: true,
  },
  {
    name: "成分党深度解析",
    campaign: CAMPAIGN_BY_CREATIVE["成分党深度解析"],
    platform: PLATFORM_BY_CREATIVE["成分党深度解析"],
    theme: "成分科普",
    angle: "专业背书",
    hook: "把这支精华的成分表逐条讲清楚",
    cta: "收藏这份成分笔记",
    audience: "22–30 岁成分关注人群",
    script:
      "0–3s Hook：成分表特写 + 逐条标记。\n3–8s 痛点：看不懂成分表，不知道适不适合自己。\n8–12s 方案：分模块解释修护、保湿与肤感体系。\n12–15s CTA：想更细的可以留言关键词。",
    priority: "P1",
    status: "optimize",
    ctr: 0.0121,
    cvr: 0.023,
    aov: 115,
    roas: 2.13,
    share: 0.1335,
    quoted: true,
  },
  {
    name: "早八通勤快速护肤",
    campaign: CAMPAIGN_BY_CREATIVE["早八通勤快速护肤"],
    platform: PLATFORM_BY_CREATIVE["早八通勤快速护肤"],
    theme: "通勤效率",
    angle: "效率场景",
    hook: "早八人的护肤只有 90 秒",
    cta: "看 90 秒护肤流程",
    audience: "20–27 岁通勤女性",
    script:
      "0–3s Hook：地铁倒计时 + 快速护肤动作。\n3–8s 痛点：早上没时间、又怕脸干。\n8–12s 方案：夜间做好修护，早上只做基础保湿。\n12–15s CTA：评论区回复「早八」拿流程表。",
    priority: "P1",
    status: "watch",
    ctr: 0.0205,
    cvr: 0.0394,
    aov: 124,
    roas: 3.15,
    share: 0.1065,
    quoted: false,
  },
  {
    name: "清爽不黏腻实测",
    campaign: CAMPAIGN_BY_CREATIVE["清爽不黏腻实测"],
    platform: PLATFORM_BY_CREATIVE["清爽不黏腻实测"],
    theme: "肤感实测",
    angle: "质地实测",
    hook: "怕黏腻的人，先看这个 10 秒质地测试",
    cta: "看质地实测视频",
    audience: "18–26 岁油皮 / 混合皮女性",
    script:
      "0–3s Hook：手背涂抹 + 纸巾测试。\n3–8s 痛点：很多精华闷、黏枕头。\n8–12s 方案：清爽质地上脸吸收快，睡前不粘枕。\n12–15s CTA：点进来看完整测试。",
    priority: "P1",
    status: "watch",
    ctr: 0.0186,
    cvr: 0.0375,
    aov: 120,
    roas: 2.56,
    share: 0.1,
    quoted: false,
  },
  {
    name: "睡前5分钟仪式感",
    campaign: CAMPAIGN_BY_CREATIVE["睡前5分钟仪式感"],
    platform: PLATFORM_BY_CREATIVE["睡前5分钟仪式感"],
    theme: "睡前仪式",
    angle: "情绪价值",
    hook: "睡前 5 分钟，把自己从工作里捞出来",
    cta: "看睡前护肤流程",
    audience: "23–30 岁都市女性",
    script:
      "0–3s Hook：暖色灯光 + 关掉电脑的声音。\n3–8s 痛点：一天的紧绷感带到床上。\n8–12s 方案：把晚间护肤变成一个固定的放松动作。\n12–15s CTA：今晚试试这 5 分钟。",
    priority: "P2",
    status: "watch",
    ctr: 0.0174,
    cvr: 0.0355,
    aov: 122,
    roas: 2.78,
    share: 0.09,
    quoted: false,
  },
  {
    name: "敏感肌稳定期记录",
    campaign: CAMPAIGN_BY_CREATIVE["敏感肌稳定期记录"],
    platform: PLATFORM_BY_CREATIVE["敏感肌稳定期记录"],
    theme: "敏感肌友好",
    angle: "真实记录",
    hook: "敏感期我停掉了 4 个产品，只留了这 2 步",
    cta: "看稳定期护肤清单",
    audience: "22–30 岁敏感肌女性",
    script:
      "0–3s Hook：桌上被移走的产品排成一排。\n3–8s 痛点：换季泛红，不敢乱试新产品。\n8–12s 方案：简化步骤，先做基础修护与保湿。\n12–15s CTA：留言「清单」获取参考。",
    priority: "P2",
    status: "watch",
    ctr: 0.0163,
    cvr: 0.0335,
    aov: 130,
    roas: 2.73,
    share: 0.1,
    quoted: false,
  },
  {
    name: "办公室空调肌救星",
    campaign: CAMPAIGN_BY_CREATIVE["办公室空调肌救星"],
    platform: PLATFORM_BY_CREATIVE["办公室空调肌救星"],
    theme: "办公室干燥",
    angle: "场景痛点",
    hook: "在空调房待 8 小时，脸会变成什么样",
    cta: "看办公室补涂方案",
    audience: "23–30 岁办公室女性",
    script:
      "0–3s Hook：办公室空调出风口 + 起皮特写。\n3–8s 痛点：下午脸紧绷、卡粉。\n8–12s 方案：夜间修护 + 日间基础保湿的组合。\n12–15s CTA：点进来拿办公桌护肤清单。",
    priority: "P2",
    status: "watch",
    ctr: 0.0158,
    cvr: 0.0315,
    aov: 118,
    roas: 2.87,
    share: 0.1,
    quoted: false,
  },
  {
    name: "男生也能用的修护精华",
    campaign: CAMPAIGN_BY_CREATIVE["男生也能用的修护精华"],
    platform: PLATFORM_BY_CREATIVE["男生也能用的修护精华"],
    theme: "泛人群扩展",
    angle: "低门槛",
    hook: "男生护肤别再只洗脸了",
    cta: "看一步到位的用法",
    audience: "18–26 岁男性护肤新手",
    script:
      "0–3s Hook：洗手台只有一支洗面奶。\n3–8s 痛点：嫌麻烦、怕黏、不知道怎么用。\n8–12s 方案：晚间一步，质地清爽不粘。\n12–15s CTA：看 30 秒用法说明。",
    priority: "P3",
    status: "pause",
    ctr: 0.0142,
    cvr: 0.0276,
    aov: 112,
    roas: 2.4,
    share: 0.1,
    quoted: false,
  },
];

/** Account-level CTR that the dashboard must report. */
export const TARGET_CTR = DEMO_TARGETS.clicks / DEMO_TARGETS.impressions; // 1.7737%

export function solveCreativeShares() {
  const specs = DEMO_CREATIVE_SPECS.map((spec) => ({ key: spec.name, ctr: spec.ctr }));
  const base = DEMO_CREATIVE_SPECS.map((spec) => spec.share);
  return balanceShares(specs, base, TARGET_CTR, "早八通勤快速护肤", "成分党深度解析");
}

/* -------------------------------------------------------------------------- */
/* day pressure curves (seasonality + the last-week efficiency drop)           */
/* -------------------------------------------------------------------------- */

const WEEKDAY_FACTOR = [1.03, 1.05, 1.04, 1.02, 1.0, 0.93, 0.9]; // Mon..Sun

function buildDayCurves(days: number, startDate: Date) {
  const impressionWeights: number[] = [];
  const conversionWeights: number[] = [];
  const spendWeights: number[] = [];

  for (let index = 0; index < days; index += 1) {
    const date = new Date(startDate.getTime());
    date.setUTCDate(date.getUTCDate() + index);
    const weekday = (date.getUTCDay() + 6) % 7; // 0 = Monday

    const seasonality = 1 + 0.06 * Math.sin(index / 4.2) + 0.03 * Math.cos(index / 9);
    const impression = WEEKDAY_FACTOR[weekday] * seasonality;

    // Conversion rate stays healthy until the new creative batch in the last
    // week, where the funnel efficiency drops (the story the AI Advisor tells).
    const cvrPressure = index <= 22 ? 1.06 : 0.92 - (index - 23) * 0.035;
    const spendPressure = index <= 22 ? 1.075 : 1.02 - (index - 23) * 0.03667;

    impressionWeights.push(impression);
    conversionWeights.push(impression * cvrPressure);
    spendWeights.push(Math.max(spendPressure, 0.55));
  }

  // Spend ⱼ = revenueⱼ / (ROAS · pressureⱼ). Normalising 1/pressure on the
  // revenue mix makes the account spend land on target before the final
  // micro-rebalance, while keeping the visible daily ROAS trend intact.
  const revenueWeights = impressionWeights.map((value, index) => value * conversionWeights[index]);
  const meanInverse = weightedMean(
    spendWeights.map((value) => 1 / value),
    revenueWeights,
  );
  const spendPressure = spendWeights.map((value) => value * (meanInverse === 0 ? 1 : meanInverse));

  return {
    impressionWeights,
    conversionWeights,
    spendPressure,
  };
}

export type DemoDay = {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  cvr: number;
  roas: number;
};

/* -------------------------------------------------------------------------- */
/* metric generation                                                           */
/* -------------------------------------------------------------------------- */

export function buildDemoMetrics(): MetricRow[] {
  const days = DEMO_PERIOD_DAYS;
  const shares = solveCreativeShares();
  const impressionsPerCreative = allocateExact(
    DEMO_TARGETS.impressions,
    DEMO_CREATIVE_SPECS.map((spec, index) => Math.max(shares[index], 0.0001)),
  );

  const baseClicks = DEMO_CREATIVE_SPECS.map((spec, index) => Math.round(impressionsPerCreative[index] * spec.ctr));
  const clicksPerCreative = fixTotal(baseClicks, DEMO_TARGETS.clicks, DEMO_CREATIVE_SPECS.map((spec) => !spec.quoted));

  const rawConversions = DEMO_CREATIVE_SPECS.map((spec, index) => clicksPerCreative[index] * spec.cvr);
  const conversionScale = DEMO_TARGETS.conversions / rawConversions.reduce((acc, value) => acc + value, 0);
  const baseConversions = rawConversions.map((value) => Math.round(value * conversionScale));
  const conversionsPerCreative = fixTotal(baseConversions, DEMO_TARGETS.conversions, DEMO_CREATIVE_SPECS.map((spec) => !spec.quoted));

  const rawRevenue = DEMO_CREATIVE_SPECS.map((spec, index) => conversionsPerCreative[index] * spec.aov);
  const revenueScale = DEMO_TARGETS.revenue / rawRevenue.reduce((acc, value) => acc + value, 0);
  const baseRevenue = rawRevenue.map((value) => Math.round(value * revenueScale));
  const revenuePerCreative = fixTotal(baseRevenue, DEMO_TARGETS.revenue, DEMO_CREATIVE_SPECS.map((spec) => !spec.quoted));

  // Spend follows each creative's ROAS target, so quoted creatives report their
  // benchmark ROAS exactly.
  const baseSpend = DEMO_CREATIVE_SPECS.map((spec, index) => Math.round(revenuePerCreative[index] / spec.roas));
  const spendPerCreative = fixTotal(
    baseSpend,
    DEMO_TARGETS.spend,
    DEMO_CREATIVE_SPECS.map((spec) => !spec.quoted),
  );

  const startDate = new Date(`${DEMO_PERIOD_START}T00:00:00.000Z`);
  const curves = buildDayCurves(days, startDate);

  const rows: MetricRow[] = [];

  DEMO_CREATIVE_SPECS.forEach((spec, creativeIndex) => {
    const impressionsByDay = allocateExact(impressionsPerCreative[creativeIndex], curves.impressionWeights);
    const clicksByDay = fixTotal(
      allocateExact(clicksPerCreative[creativeIndex], curves.impressionWeights),
      clicksPerCreative[creativeIndex],
      curves.impressionWeights.map(() => true),
    );
    const conversionsByDay = fixTotal(
      allocateExact(conversionsPerCreative[creativeIndex], curves.conversionWeights),
      conversionsPerCreative[creativeIndex],
      curves.conversionWeights.map(() => true),
    );
    const revenueByDay = fixTotal(
      allocateExact(revenuePerCreative[creativeIndex], curves.conversionWeights),
      revenuePerCreative[creativeIndex],
      curves.conversionWeights.map(() => true),
    );

    const spendByDay = Array.from({ length: days }, () => 0);

    for (let day = 0; day < days; day += 1) {
      spendByDay[day] = Math.round(revenueByDay[day] / (spec.roas * curves.spendPressure[day]));
    }

    adjustIntTotal(spendByDay, spendPerCreative[creativeIndex]);

    for (let day = 0; day < days; day += 1) {
      const date = new Date(startDate.getTime());
      date.setUTCDate(date.getUTCDate() + day);
      rows.push({
        date,
        platform: spec.platform,
        campaign: spec.campaign,
        creative: spec.name,
        spend: spendByDay[day],
        impressions: impressionsByDay[day],
        clicks: clicksByDay[day],
        conversions: conversionsByDay[day],
        revenue: revenueByDay[day],
      });
    }
  });

  rebalanceSpend(rows, DEMO_TARGETS.spend, new Set(DEMO_CREATIVE_SPECS.filter((spec) => spec.quoted).map((spec) => spec.name)));

  return rows;
}

/** Rebalances rounding drift without touching benchmark creatives. */
function rebalanceSpend(rows: MetricRow[], target: number, protectedCreatives: Set<string>) {
  const current = rows.reduce((acc, row) => acc + row.spend, 0);
  let delta = Math.round(target - current);
  if (delta === 0) return;

  const adjustable = rows.filter((row) => !protectedCreatives.has(row.creative) && row.spend > 1);
  const total = adjustable.reduce((acc, row) => acc + row.spend, 0);
  if (adjustable.length === 0 || total <= 0) return;

  const proportional = adjustable.map((row) => Math.round((delta * row.spend) / total));
  proportional.forEach((change, index) => {
    adjustable[index].spend = adjustable[index].spend + change;
  });

  let residual = Math.round(target - rows.reduce((acc, row) => acc + row.spend, 0));
  if (residual === 0) return;

  const step = residual > 0 ? 1 : -1;
  const ordered = [...adjustable].sort((a, b) => b.spend - a.spend);
  let cursor = 0;
  while (residual !== 0 && cursor < ordered.length * 4) {
    const row = ordered[cursor % ordered.length];
    if (row.spend + step > 0) {
      row.spend += step;
      residual -= step;
    }
    cursor += 1;
  }
}

/** Adds/subtracts the rounding difference on the last adjustable entries. */
function fixTotal(values: number[], target: number, adjustable: boolean[]): number[] {
  const result = [...values];
  const total = result.reduce((acc, value) => acc + value, 0);
  let delta = target - total;
  const indices = result.map((_, index) => index).filter((index) => adjustable[index]);
  if (indices.length === 0) return result;

  let cursor = indices.length - 1;
  while (delta !== 0 && cursor >= 0) {
    const step = delta > 0 ? Math.min(delta, 1) : Math.max(delta, -1);
    result[indices[cursor]] = Math.max(0, result[indices[cursor]] + step);
    delta -= step;
    cursor -= 1;
  }

  // spread any remaining delta on the largest adjustable entry
  if (delta !== 0) {
    const largest = indices.reduce((best, index) => (result[index] > result[best] ? index : best), indices[0]);
    result[largest] = Math.max(0, result[largest] + delta);
  }

  return result;
}

function adjustIntTotal(values: number[], target: number) {
  const total = values.reduce((acc, value) => acc + value, 0);
  let delta = Math.round(target - total);
  if (delta === 0) return;
  let remaining = delta;
  const step = delta > 0 ? 1 : -1;
  let index = values.length - 1;
  let guard = 0;
  while (remaining !== 0 && guard < values.length * 8) {
    index = (index + values.length) % values.length;
    if (values[index] + step > 0) {
      values[index] += step;
      remaining -= step;
    }
    index -= 1;
    guard += 1;
  }
}

/* -------------------------------------------------------------------------- */
/* audience cut (a genuine re-cut of the same account totals)                   */
/* -------------------------------------------------------------------------- */

export type AudienceSpec = {
  segment: string;
  age: string;
  gender: string;
  ctr: number;
  cvr: number;
  roas: number;
  share: number;
};

export const DEMO_AUDIENCE_SPECS: AudienceSpec[] = [
  { segment: "18–24 岁女性", age: "18-24", gender: "女", ctr: 0.0205, cvr: 0.0305, roas: 3.1, share: 0.465 },
  { segment: "25–30 岁女性", age: "25-30", gender: "女", ctr: 0.0172, cvr: 0.0435, roas: 3.42, share: 0.26 },
  { segment: "18–24 岁男性", age: "18-24", gender: "男", ctr: 0.0128, cvr: 0.022, roas: 2.35, share: 0.135 },
  { segment: "30 岁以上女性", age: "30+", gender: "女", ctr: 0.0155, cvr: 0.036, roas: 2.9, share: 0.06 },
  { segment: "25–30 岁男性", age: "25-30", gender: "男", ctr: 0.0134, cvr: 0.026, roas: 2.55, share: 0.08 },
];

export type AudienceMetricRow = {
  date: Date;
  segment: string;
  age: string;
  gender: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
};

export function buildDemoAudienceMetrics(): AudienceMetricRow[] {
  const shares = balanceShares(
    DEMO_AUDIENCE_SPECS.map((spec) => ({ key: spec.segment, ctr: spec.ctr })),
    DEMO_AUDIENCE_SPECS.map((spec) => spec.share),
    TARGET_CTR,
    "18–24 岁女性",
    "25–30 岁女性",
  );

  const impressions = allocateExact(DEMO_TARGETS.impressions, shares);
  const clicksBase = DEMO_AUDIENCE_SPECS.map((spec, index) => Math.round(impressions[index] * spec.ctr));
  const clicks = fixTotal(clicksBase, DEMO_TARGETS.clicks, DEMO_AUDIENCE_SPECS.map(() => true));

  const rawConversions = DEMO_AUDIENCE_SPECS.map((spec, index) => clicks[index] * spec.cvr);
  const conversionScale = DEMO_TARGETS.conversions / rawConversions.reduce((acc, value) => acc + value, 0);
  const conversions = fixTotal(
    rawConversions.map((value) => Math.round(value * conversionScale)),
    DEMO_TARGETS.conversions,
    DEMO_AUDIENCE_SPECS.map(() => true),
  );

  const rawRevenue = DEMO_AUDIENCE_SPECS.map((spec, index) => conversions[index] * (DEMO_TARGETS.revenue / DEMO_TARGETS.conversions));
  const revenue = fixTotal(rawRevenue.map((value) => Math.round(value)), DEMO_TARGETS.revenue, DEMO_AUDIENCE_SPECS.map(() => true));

  const spend = fixTotal(
    DEMO_AUDIENCE_SPECS.map((spec, index) => Math.round(revenue[index] / spec.roas)),
    DEMO_TARGETS.spend,
    DEMO_AUDIENCE_SPECS.map(() => true),
  );

  const startDate = new Date(`${DEMO_PERIOD_START}T00:00:00.000Z`);
  const curves = buildDayCurves(DEMO_PERIOD_DAYS, startDate);
  const rows: AudienceMetricRow[] = [];

  DEMO_AUDIENCE_SPECS.forEach((spec, index) => {
    const impressionsByDay = allocateExact(impressions[index], curves.impressionWeights);
    const clicksByDay = fixTotal(allocateExact(clicks[index], curves.impressionWeights), clicks[index], curves.impressionWeights.map(() => true));
    const conversionsByDay = fixTotal(
      allocateExact(conversions[index], curves.conversionWeights),
      conversions[index],
      curves.conversionWeights.map(() => true),
    );
    const revenueByDay = fixTotal(
      allocateExact(revenue[index], curves.conversionWeights),
      revenue[index],
      curves.conversionWeights.map(() => true),
    );
    const spendByDay = Array.from({ length: DEMO_PERIOD_DAYS }, (_, day) =>
      Math.round(revenueByDay[day] / (spec.roas * curves.spendPressure[day])),
    );
    adjustIntTotal(spendByDay, spend[index]);

    for (let day = 0; day < DEMO_PERIOD_DAYS; day += 1) {
      const date = new Date(startDate.getTime());
      date.setUTCDate(date.getUTCDate() + day);
      rows.push({
        date,
        segment: spec.segment,
        age: spec.age,
        gender: spec.gender,
        spend: spendByDay[day],
        impressions: impressionsByDay[day],
        clicks: clicksByDay[day],
        conversions: conversionsByDay[day],
        revenue: revenueByDay[day],
      });
    }
  });

  return rows;
}

/* -------------------------------------------------------------------------- */
/* brand, product, personas, competitors                                       */
/* -------------------------------------------------------------------------- */

export function buildDemoBrand() {
  return {
    name: DEMO_BRAND_NAME,
    nameEn: "MORI",
    positioning: "面向年轻女性的生活方式护肤品牌 · 轻修护",
    description:
      "MORI 森屿是一个虚拟的（Demo）生活方式护肤品牌，主打“克制配方 + 清爽肤感 + 夜间修护”。品牌服务于 18–30 岁年轻女性，强调简单、稳定、可长期坚持的护肤方式。",
    productName: DEMO_PRODUCT_NAME,
    priceRange: "¥169（40ml）",
    targetAudience: "18–30 岁女性，学生党 / 都市新人 / 轻熟稳定肌",
    channels: JSON.stringify(["小红书", "抖音", "微信私域", "电商平台"]),
    keywords: JSON.stringify(["年轻", "自然", "清爽", "克制", "疗愈", "夜间", "修护"]),
  };
}

export function buildDemoProduct() {
  return {
    brandName: DEMO_BRAND_NAME,
    name: DEMO_PRODUCT_NAME,
    category: "面部精华",
    positioning: "面向 18–30 岁年轻女性的轻修护型晚间精华",
    price: 169,
    volume: "40ml",
    keyBenefits: JSON.stringify(["夜间修护", "保湿", "维持肌肤稳定状态", "清爽不黏腻"]),
    sellingPoints: JSON.stringify([
      "夜间一步完成修护与保湿，适合不想堆产品的年轻用户",
      "清爽质地，睡前使用不黏枕头",
      "适合日常长期使用的温和配方思路",
      "单次使用成本可解释，学生党也能长期坚持",
    ]),
    usageScenario: JSON.stringify(["熬夜后的夜间护肤", "早八通勤前的极简流程", "换季 / 空调房的干燥应对", "30 天稳定状态记录"]),
    credibility: JSON.stringify([
      "完整成分表公开",
      "Demo 说明：本页面所有数据均为模拟业务数据，不构成功效承诺",
      "未使用医疗、绝对化或承诺性表述",
    ]),
  };
}

export function buildDemoPersonas() {
  return [
    {
      code: "night-owl-newcomer",
      name: "熬夜型都市新人",
      ageBand: "22–26",
      occupation: "互联网公司职员",
      city: "一线 / 新一线城市",
      share: 0.42,
      quote: "我不想护肤搞得很复杂，但第二天状态不能崩。",
      painPoints: JSON.stringify([
        "经常熬夜，第二天脸干、上妆卡粉",
        "工作压力大，护肤步骤不想太复杂",
        "害怕产品黏腻，睡前不想粘枕头",
        "希望皮肤状态稳定，不想忽好忽坏",
      ]),
      motivations: JSON.stringify(["简单、方便、有效感", "夜间护理的确定性", "不想在护肤上做太多决策"]),
      contentPreferences: JSON.stringify(["熬夜护肤", "通勤快手护肤", "夜间修护", "真实一天的记录"]),
      purchaseDrivers: JSON.stringify(["步骤少", "肤感清爽", "使用记录真实"]),
      barriers: JSON.stringify(["怕又是营销话术", "担心用两天就闲置", "不确定自己的肤质适不适合"]),
      channels: JSON.stringify(["抖音", "小红书"]),
      accent: "moss",
    },
    {
      code: "student-budget",
      name: "学生党护肤用户",
      ageBand: "18–22",
      occupation: "大学生",
      city: "遍布一二线城市与高校集中区域",
      share: 0.33,
      quote: "预算就这么多，我想先看到别人真实用完的样子。",
      painPoints: JSON.stringify([
        "预算有限，怕买贵了不适合自己",
        "容易被营销套路影响，吃过亏",
        "喜欢看真实测评，反感过度包装",
        "对成分比较敏感，会自己查资料",
      ]),
      motivations: JSON.stringify(["性价比", "真实评价", "成分透明"]),
      contentPreferences: JSON.stringify(["平价护肤清单", "真实测评", "成分解释", "宿舍护肤流程"]),
      purchaseDrivers: JSON.stringify(["单次使用成本", "真实晒单", "成分表可查"]),
      barriers: JSON.stringify(["担心价格虚高", "担心营销夸大", "担心用了没有感觉"]),
      channels: JSON.stringify(["小红书", "电商平台"]),
      accent: "clay",
    },
    {
      code: "light-mature-stable",
      name: "轻熟稳定肌用户",
      ageBand: "27–30",
      occupation: "白领 / 轻熟职场人",
      city: "一线城市",
      share: 0.25,
      quote: "我不需要它讲得热闹，我需要它讲得清楚。",
      painPoints: JSON.stringify([
        "更关注肌肤状态的长期稳定",
        "愿意支付更高价格，但要求解释清楚",
        "不喜欢复杂营销和夸张话术",
        "更相信专业内容与成分逻辑",
      ]),
      motivations: JSON.stringify(["品牌信任", "成分与配方逻辑", "长期效果"]),
      contentPreferences: JSON.stringify(["成分解析", "专业护肤知识", "长期记录", "对比评测"]),
      purchaseDrivers: JSON.stringify(["配方透明", "专业解释", "稳定的品牌形象"]),
      barriers: JSON.stringify(["反感夸张功效宣传", "担心又是短期网红产品", "需要专业信息支撑决策"]),
      channels: JSON.stringify(["小红书", "微信私域"]),
      accent: "ink",
    },
  ];
}

export function buildDemoCompetitors() {
  return [
    {
      name: "MORI 森屿",
      positioning: "年轻女性轻修护晚间精华",
      price: 169,
      priceTier: "中低价位",
      professional: 62,
      audience: "18–30 岁女性",
      contentThemes: JSON.stringify(["熬夜修护", "清爽肤感", "通勤快手护肤", "30 天记录"]),
      mainChannels: JSON.stringify(["小红书", "抖音"]),
      adThemes: JSON.stringify(["熬夜场景", "肤感实测", "性价比解释"]),
      strength: "内容更贴近年轻用户语境，价格门槛低，场景与产品强绑定。",
      weakness: "成分与专业信任积累不足，品牌历史与背书内容偏少，高价位人群覆盖弱。",
      colorToken: "moss",
      isSelf: true,
    },
    {
      name: "AURA LAB",
      positioning: "功效型实验室护肤",
      price: 428,
      priceTier: "高价位",
      professional: 88,
      audience: "25–35 岁成分党 / 功效需求人群",
      contentThemes: JSON.stringify(["高浓度成分", "实验数据", "皮肤科背书", "功效对比"]),
      mainChannels: JSON.stringify(["小红书", "信息流广告", "电商平台"]),
      adThemes: JSON.stringify(["成分实验", "专家口播", "功效周期"]),
      strength: "专业背书强，客单价高，用户信任度高。",
      weakness: "价格门槛高，内容偏理性，年轻用户觉得距离感强、决策成本高。",
      colorToken: "ink",
      isSelf: false,
    },
    {
      name: "NUVIA",
      positioning: "都市轻奢生活方式护肤",
      price: 268,
      priceTier: "中高价位",
      professional: 71,
      audience: "23–32 岁都市女性",
      contentThemes: JSON.stringify(["生活方式", "氛围感", "城市场景", "礼赠"]),
      mainChannels: JSON.stringify(["小红书", "抖音", "微信私域"]),
      adThemes: JSON.stringify(["氛围大片", "KOL 日常", "送礼场景"]),
      strength: "视觉与品牌调性强，擅长度假 / 通勤等高级场景内容，溢价能力好。",
      weakness: "产品机理讲得少，转化链路依赖 KOL，内容与产品功能关联度低。",
      colorToken: "clay",
      isSelf: false,
    },
    {
      name: "LUMIÉ",
      positioning: "平价大单品爆款路线",
      price: 89,
      priceTier: "低价位",
      professional: 48,
      audience: "18–24 岁学生党 / 初次护肤人群",
      contentThemes: JSON.stringify(["低价大促", "爆款测评", "宿舍护肤", "团购"]),
      mainChannels: JSON.stringify(["抖音", "电商平台"]),
      adThemes: JSON.stringify(["低价直给", "达人带货", "限时折扣"]),
      strength: "价格极低、爆款运营强，起量速度快，泛人群覆盖广。",
      weakness: "用户忠诚度低、复购弱，成分与功效解释薄弱，容易被更低价替代。",
      colorToken: "signal",
      isSelf: false,
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* content library, experiments, insights, evaluations                         */
/* -------------------------------------------------------------------------- */

const CONTENT_SEEDS = [
  {
    platform: "小红书",
    contentType: "种草",
    goal: "互动",
    topic: "熬夜修护",
    title: "每天熬夜的人，真的需要一瓶晚间修护吗？",
    hook: "连续加班 12 天，我唯一没放弃的护肤步骤",
    body: "我把护肤步骤砍到只剩两步的第 12 天，脸颊起皮的情况明显少了。晚间精华质地很清爽，涂完不用等就能睡。不是万能药，但对“熬夜后第二天别太垮”这件事有帮助。（Demo 示例文案，非功效承诺）",
    cta: "你熬夜后最明显的变化是什么？",
  },
  {
    platform: "小红书",
    contentType: "测评",
    goal: "点击",
    topic: "清爽肤感",
    title: "怕黏腻的人先看这个质地测试",
    hook: "纸巾测试 10 秒，就知道会不会黏枕头",
    body: "实测方式：手背涂抹后 30 秒贴纸巾。纸巾基本不粘，说明质地偏清爽，适合不喜欢厚重感的用户。油皮夏天也能接受。（Demo 示例文案）",
    cta: "要不要我出一期不同肤质的质地对比？",
  },
  {
    platform: "小红书",
    contentType: "知识",
    goal: "曝光",
    topic: "成分科普",
    title: "买精华前先搞懂：修护和保湿不是一回事",
    hook: "修护 ≠ 保湿，选错方向当然没感觉",
    body: "保湿解决的是水分流失，修护更关注屏障状态的稳定。年轻用户熬夜后往往是两件事同时发生，所以配方思路会把两者放在同一支产品里。（Demo 示例文案）",
    cta: "想看成分表逐条拆解吗？",
  },
  {
    platform: "小红书",
    contentType: "场景",
    goal: "互动",
    topic: "通勤护肤",
    title: "早八人的 90 秒护肤流程",
    hook: "早上真的没有时间做五步护肤",
    body: "思路是：把复杂步骤放在晚上，早上只做基础保湿和防晒。晚上那一步用质地清爽的修护精华，第二天上妆会更顺一些。（Demo 示例文案）",
    cta: "评论区回复「早八」拿流程表",
  },
  {
    platform: "抖音",
    contentType: "种草",
    goal: "转化",
    topic: "熬夜修护",
    title: "熬夜党的夜间护肤只需要一步",
    hook: "凌晨一点下班，我真的没力气做五步护肤",
    body: "短视频脚本：加班场景 → 起皮卡粉痛点 → 夜间一步修护 → 引导查看使用记录。",
    cta: "点进来看 30 天记录",
  },
  {
    platform: "抖音",
    contentType: "故事",
    goal: "互动",
    topic: "皮肤稳定",
    title: "我把护肤从 6 步砍到 2 步之后",
    hook: "护肤做太多，状态反而更不稳定",
    body: "短视频脚本：护肤台产品堆叠 → 逐步减少步骤 → 状态趋于稳定 → 引导评论分享自己的极简流程。",
    cta: "你现在护肤几步？",
  },
  {
    platform: "抖音",
    contentType: "产品介绍",
    goal: "转化",
    topic: "预算与性价比",
    title: "一瓶能用多久？我算给你看",
    hook: "¥169 分摊到每天是多少钱",
    body: "短视频脚本：价格牌 → 按 40ml 日常用量估算使用天数 → 单次成本 → 说明适合长期坚持的理由。",
    cta: "看单次成本怎么算",
  },
  {
    platform: "抖音",
    contentType: "场景",
    goal: "点击",
    topic: "空调房干燥",
    title: "在空调房坐 8 小时，脸会发生什么",
    hook: "下午三点的脸，和早上的脸不是同一张脸",
    body: "短视频脚本：办公室空调 → 起皮紧绷 → 夜间修护 + 日间保湿组合 → 引导查看办公桌护肤清单。",
    cta: "拿办公桌护肤清单",
  },
  {
    platform: "公众号",
    contentType: "知识",
    goal: "曝光",
    topic: "成分科普",
    title: "年轻肌肤的夜间修护，到底在修什么",
    hook: "从屏障状态讲清楚夜间护肤逻辑",
    body: "长文结构：熬夜对肌肤状态的影响 → 修护与保湿的关系 → 配方思路 → 简化护肤步骤的建议 → Demo 数据说明。",
    cta: "想要完整成分笔记可以留言",
  },
  {
    platform: "公众号",
    contentType: "知识",
    goal: "转化",
    topic: "30 天记录",
    title: "30 天肌肤稳定挑战：完整记录与复盘",
    hook: "我们把 30 天的记录整理成了一份表",
    body: "长文结构：挑战规则 → 每日记录方式 → 阶段变化 → 用户反馈摘要 → 参与方式。",
    cta: "回复「挑战」领取记录表",
  },
  {
    platform: "小红书",
    contentType: "测评",
    goal: "转化",
    topic: "学生党预算",
    title: "学生党第一次买精华，别踩这三个坑",
    hook: "预算有限的时候，最怕买错方向",
    body: "三个常见坑：只看营销不看成分表、追求多步骤、忽略自己的肤质。给出更省钱的选择思路。（Demo 示例文案）",
    cta: "想看平价清单的扣 1",
  },
  {
    platform: "抖音",
    contentType: "种草",
    goal: "曝光",
    topic: "男性护肤",
    title: "男生护肤真的只需要一步",
    hook: "别再只洗脸了，一步也能有改善",
    body: "短视频脚本：洗手台只有洗面奶 → 简单加一步晚间护肤 → 质地清爽不黏 → 引导查看用法。",
    cta: "看 30 秒用法说明",
  },
] as const;

export function buildDemoContents() {
  const rng = createRng(20261009);
  const rows = [] as Array<{
    title: string;
    platform: string;
    contentType: string;
    goal: string;
    topic: string;
    audience: string;
    hook: string;
    body: string;
    cta: string;
    hookScore: number;
    relevanceScore: number;
    conversionScore: number;
    brandFitScore: number;
    overallScore: number;
    whyTest: string;
    howToImprove: string;
    status: string;
    mode: string;
  }>;

  const audiences = ["熬夜型都市新人", "学生党护肤用户", "轻熟稳定肌用户"];

  for (let index = 0; index < 36; index += 1) {
    const seed = CONTENT_SEEDS[index % CONTENT_SEEDS.length];
    const variation = Math.floor(index / CONTENT_SEEDS.length);
    const audience = audiences[(index + variation) % audiences.length];
    const hookScore = Math.round(72 + rng() * 22);
    const relevanceScore = Math.round(78 + rng() * 18);
    const conversionScore = Math.round(64 + rng() * 28);
    const brandFitScore = Math.round(80 + rng() * 17);
    const overallScore = Math.round((hookScore * 0.25 + relevanceScore * 0.3 + conversionScore * 0.25 + brandFitScore * 0.2));

    rows.push({
      title: variation === 0 ? seed.title : `${seed.title}（${["A", "B", "C"][variation - 1] ?? "变体"}版）`,
      platform: seed.platform,
      contentType: seed.contentType,
      goal: seed.goal,
      topic: seed.topic,
      audience,
      hook: seed.hook,
      body: seed.body,
      cta: seed.cta,
      hookScore,
      relevanceScore,
      conversionScore,
      brandFitScore,
      overallScore,
      whyTest:
        overallScore >= 86
          ? "综合分处于内容库前 25%，Hook 与人群痛点匹配度高，可以作为该主题的基准版本继续放量测试。"
          : overallScore >= 78
            ? "结构完整、人群相关性稳定，适合作为对照版本验证主题红利是否真实存在。"
            : "作为对照组保留：结构完整但吸引力偏弱，用于验证其他版本是否真的更优。",
      howToImprove:
        hookScore < 82
          ? "前 3 秒更具体：直接给出场景细节（时间、地点、动作），减少抽象描述。"
          : "在结尾增加明确的下一步动作，并补充一条真实使用记录提升可信度。",
      status: overallScore >= 86 ? "testing" : "idea",
      mode: "demo",
    });
  }

  return rows;
}

export function buildDemoExperiments() {
  return [
    {
      name: "熬夜场景 vs 成分科普",
      hypothesis: "在抖音转化目标下，熬夜场景素材的 CTR 与 CVR 都优于成分科普素材。",
      goal: "验证内容角度对转化效率的影响",
      primaryMetric: "ctr",
      status: "running",
      summary:
        "模拟实验中（Demo 数据集）：两组素材预算接近，场景组在前 7 天显示出更高的点击效率，转化差异尚未达到显著。",
      aiRecommendation:
        "基于模拟数据推演：建议在下一轮模拟实验中保留 A（熬夜场景），并把预算比例调整为 60/40，直到 CVR 差异达到显著。",
      variants: [
        {
          label: "A",
          name: "熬夜场景",
          description: "凌晨加班场景 + 第二天状态对比，强调“睡前一步”。",
          impressions: 486_000,
          clicks: 11_713,
          conversions: 588,
          spend: 18_517,
          revenue: 78_885,
        },
        {
          label: "B",
          name: "成分科普",
          description: "成分表逐条讲解，强调配方透明与专业感。",
          impressions: 648_810,
          clicks: 7_850,
          conversions: 178,
          spend: 9_756,
          revenue: 20_780,
        },
      ],
    },
    {
      name: "价格解释型落地页 vs 原落地页",
      hypothesis: "加入单次使用成本解释后，学生党人群的 CVR 会提升。",
      goal: "降低首单门槛，提升 18–24 岁女性转化率",
      primaryMetric: "cvr",
      status: "completed",
      summary:
        "模拟实验推演结果（Demo 数据集）：价格解释组的 CVR 高于对照组，但样本量不足，差异仍处于噪声区间，需要扩样才能判断。",
      aiRecommendation:
        "基于模拟数据推演：价格解释方向值得继续验证（结论仅来自 Demo 数据集，不能当作实验定论）。建议保留该模块并扩大样本量复测，再由真实数据判断。",
      variants: [
        {
          label: "A",
          name: "原落地页",
          description: "以产品卖点为主的落地页首屏。",
          impressions: 320_000,
          clicks: 5_760,
          conversions: 176,
          spend: 8_900,
          revenue: 19_870,
        },
        {
          label: "B",
          name: "价格解释型",
          description: "首屏加入单次使用成本换算与试用装说明。",
          impressions: 318_000,
          clicks: 5_960,
          conversions: 214,
          spend: 9_050,
          revenue: 23_940,
        },
      ],
    },
    {
      name: "30 天挑战长内容 vs 15 秒短视频",
      hypothesis: "长内容在信任建设上更有优势，但短片在点击与转化效率上更优。",
      goal: "确定 30 天挑战主题的内容形态分配",
      primaryMetric: "roas",
      status: "running",
      summary: "模拟实验中（Demo 数据集）：短视频组的 ROAS 更高，长内容组在互动与收藏上表现更好。",
      aiRecommendation:
        "基于模拟数据推演：建议双轨并行——短片承担转化目标、长内容承担互动与信任目标，分别设定 KPI。",
      variants: [
        {
          label: "A",
          name: "15 秒短视频",
          description: "以 Day 1 与 Day 30 的对比快速呈现。",
          impressions: 437_400,
          clicks: 8_398,
          conversions: 356,
          spend: 12_506,
          revenue: 45_522,
        },
        {
          label: "B",
          name: "长内容记录",
          description: "完整记录 30 天的使用与状态变化。",
          impressions: 210_000,
          clicks: 3_150,
          conversions: 121,
          spend: 5_400,
          revenue: 14_600,
        },
      ],
    },
  ];
}

export function buildDemoInsights() {
  return [
    {
      scope: "dashboard",
      category: "insight",
      title: "账户整体 ROAS 3.12，效率由少数素材拉动",
      body: "Top 3 素材贡献了超过 40% 的转化收入，账户效率高度依赖少数主题。建议在放量的同时保留一定测试预算，避免单一素材衰退导致整体波动。",
      evidence: "Demo 数据集：30 天 / 10 条素材 / 3 个渠道",
      confidence: 88,
      agent: "performance_analyst",
      mode: "demo",
    },
    {
      scope: "audience",
      category: "opportunity",
      title: "18–24 岁女性点击意愿强，但购买理由不足",
      body: "该人群 CTR 高于账户均值，但 CVR 明显低于 25–30 岁女性，说明内容吸引力不是问题，缺的是“现在值得买”的解释与信任证据。",
      evidence: "AudienceMetric 分人群口径（Demo）",
      confidence: 84,
      agent: "audience_analyst",
      mode: "demo",
    },
    {
      scope: "campaign",
      category: "risk",
      title: "最近 7 天转化效率下滑，CPA 上升",
      body: "新素材批次上线后点击效率保持稳定，但 CVR 下滑，导致 CPA 上升。优先修复承接与信任环节，而不是继续加预算。",
      evidence: "近 7 天 vs 前 7 天窗口对比（Demo）",
      confidence: 87,
      agent: "growth_advisor",
      mode: "demo",
    },
    {
      scope: "market",
      category: "recommendation",
      title: "MORI 的机会在中价位与“可信的年轻表达”之间",
      body: "竞品要么走高价专业路线，要么走低价爆款路线，MORI 可以用中低价位 + 成分透明 + 真实场景内容占据“可信的年轻护肤”位置。",
      evidence: "4 个虚拟竞品对比矩阵（Demo）",
      confidence: 80,
      agent: "market_analyst",
      mode: "demo",
    },
  ];
}

export function buildDemoEvaluations() {
  return [
    {
      task: "生成用户画像",
      agent: "audience_analyst",
      completeness: 92,
      relevance: 89,
      actionability: 91,
      accuracy: 86,
      notes: "画像结构完整，痛点与内容偏好可直接转化为选题；对价格的敏感度判断需要更多数据支撑。",
    },
    {
      task: "广告投放分析",
      agent: "performance_analyst",
      completeness: 90,
      relevance: 94,
      actionability: 88,
      accuracy: 94,
      notes: "指标计算与数据库一致（CTR/CPC/CVR/CPA/ROAS），结论引用真实计算结果，建议部分可执行。",
    },
    {
      task: "竞品分析报告",
      agent: "market_analyst",
      completeness: 88,
      relevance: 87,
      actionability: 84,
      accuracy: 78,
      notes: "基于虚拟竞品的结构对比，市场空白判断合理；由于缺少真实市场数据，结论仅用于演示分析框架。",
    },
    {
      task: "内容策划方案",
      agent: "content_strategist",
      completeness: 90,
      relevance: 92,
      actionability: 90,
      accuracy: 85,
      notes: "标题与脚本结构完整且符合平台语境，评分逻辑可解释。",
    },
    {
      task: "广告素材方向生成",
      agent: "creative_strategist",
      completeness: 86,
      relevance: 88,
      actionability: 92,
      accuracy: 82,
      notes: "5 个素材方向的差异化明显，测试优先级排序合理。",
    },
    {
      task: "增长顾问诊断",
      agent: "growth_advisor",
      completeness: 91,
      relevance: 93,
      actionability: 89,
      accuracy: 90,
      notes: "诊断链路（指标变化 → 原因 → 假设 → 实验）符合增长团队的思考方式。",
    },
  ];
}

export function demoDatasetSummary(rows: MetricRow[]) {
  const days = new Set(rows.map((row) => new Date(row.date).toISOString().slice(0, 10)));
  return {
    rows: rows.length,
    days: days.size,
    creatives: new Set(rows.map((row) => row.creative)).size,
    campaigns: new Set(rows.map((row) => row.campaign)).size,
    platforms: Array.from(new Set(rows.map((row) => row.platform))),
  };
}
