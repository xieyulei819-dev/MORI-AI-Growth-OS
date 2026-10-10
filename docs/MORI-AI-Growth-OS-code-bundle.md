# MORI AI Growth OS · 完整源码包（单文件纯文本）

> 这是一个 Next.js 15 + TypeScript + Prisma(SQLite) + Recharts 的完整项目源码，
> 由 `scripts/export-code-bundle.mjs` 自动导出。所有业务数据均为 Demo / 模拟业务数据，
MORI 森屿 为虚拟品牌。

- 项目名：MORI AI Growth OS（MORI 森屿 AI 美妆增长中台）
- 文件数：130 个文本文件（已跳过二进制资源，如截图与 sqlite 数据库）
- 代码总量：约 783 KB
- 说明文档：见下方 `README.md` 全文（产品故事 / 架构图 / 面试演示流程 / 已知问题）

## 如何阅读这份包

1. 先看 `README.md`（在下面）了解产品与架构；
2. 再看 `src/lib/metrics.ts` 与 `src/lib/analytics.ts`：所有 KPI（CTR/CPC/CVR/CPA/ROAS）的唯一口径；
3. 再看 `src/lib/ai/schemas.ts` + `src/lib/ai/runner.ts` + `src/lib/ai/client.ts`：结构化输出与失败回退机制；
4. 页面在 `src/app/(workspace)/*`，接口在 `src/app/api/*`；
5. 测试在 `tests/*`（47 个用例，覆盖指标计算、CSV 校验、统计检验与 AI 输出结构）。

```bash
# 本地运行方式
npm install && npm run db:setup && npm run dev   # http://localhost:3000
```

## 目录结构

```text
docs/
  screenshots/
    README.md
prisma/
  schema.prisma
  seed.ts
prompts/
  audience-analyst.md
  content-strategist.md
  creative-strategist.md
  growth-advisor.md
  market-analyst.md
  performance-analyst.md
  README.md
  report-writer.md
scripts/
  capture-screenshots.mjs
  export-code-bundle.mjs
  export-prompts.ts
  mock-provider.ts
src/
  app/
    (workspace)/
      advisor/
        page.tsx
      audience/
        page.tsx
      brand/
        page.tsx
      campaign/
        page.tsx
      content/
        page.tsx
      creative/
        page.tsx
      dashboard/
        page.tsx
      evaluation/
        page.tsx
      experiments/
        page.tsx
      market/
        page.tsx
      prompts/
        page.tsx
      reports/
        page.tsx
      settings/
        page.tsx
      layout.tsx
    api/
      advisor/
        ask/
          route.ts
      audience/
        analyze/
          route.ts
      campaign/
        analyze/
          route.ts
        sample/
          route.ts
        upload/
          route.ts
      content/
        generate/
          route.ts
        save/
          route.ts
      creative/
        generate/
          route.ts
      experiments/
        create/
          route.ts
      health/
        route.ts
      market/
        analyze/
          route.ts
      reports/
        generate/
          route.ts
      settings/
        data/
          route.ts
        test-ai/
          route.ts
    portfolio/
      page.tsx
    error.tsx
    globals.css
    icon.svg
    layout.tsx
    not-found.tsx
    page.tsx
  components/
    advisor/
      advisor-console.tsx
    ai/
      agent-runner.tsx
      signal-blocks.tsx
    audience/
      audience-workbench.tsx
      persona-card.tsx
    campaign/
      campaign-analysis.tsx
      csv-uploader.tsx
    charts/
      breakdown-chart.tsx
      matrix-chart.tsx
      sparkline.tsx
      trend-chart.tsx
      variant-chart.tsx
    content/
      content-library.tsx
      content-studio.tsx
    creative/
      creative-lab.tsx
    dashboard/
      creative-table.tsx
      kpi-card.tsx
    experiments/
      experiment-lab.tsx
    layout/
      app-shell.tsx
      sidebar.tsx
      topbar.tsx
    market/
      market-workbench.tsx
    portfolio/
      portfolio-nav.tsx
      zoomable-shot.tsx
    reports/
      report-studio.tsx
    settings/
      settings-panel.tsx
    ui/
      badge.tsx
      button.tsx
      card.tsx
      copy-button.tsx
      feedback.tsx
      field.tsx
      page.tsx
      table.tsx
      tabs.tsx
    theme-provider.tsx
  lib/
    ai/
      client.ts
      context.ts
      demo-engine.ts
      json-schema.ts
      runner.ts
      schemas.ts
    analytics.ts
    api.ts
    csv.ts
    data.ts
    db.ts
    demo-data.ts
    experiments.ts
    metrics.ts
    prompts.ts
    report.ts
    statistics.ts
    utils.ts
  types/
    index.ts
tests/
  helpers/
    context.ts
  ai-deepseek.test.ts
  ai-demo-wording.test.ts
  ai-provider.test.ts
  ai-schema.test.ts
  ai-structured-output.test.ts
  analytics.test.ts
  csv.test.ts
  demo-data.test.ts
  metrics.test.ts
  statistics.test.ts
.env
.env.example
.gitignore
eslint.config.mjs
next-env.d.ts
next.config.mjs
package.json
pnpm-workspace.yaml
postcss.config.mjs
README.md
start-mori.cmd
tailwind.config.ts
tsconfig.json
vitest.config.ts
```

---

## `.env`

```bash
# MORI AI Growth OS - default (safe) configuration.
# This file contains NO secrets and keeps the app in Demo Mode out of the box.
DATABASE_URL="file:./dev.db"

# Demo Mode: when true the app never calls a remote AI provider and always
# returns locally generated structured analysis from real (simulated) database data.
DEMO_MODE="true"

# OpenAI-compatible provider configuration (only used when DEMO_MODE=false).
# Provider preset: deepseek | openai | mock | custom
AI_PROVIDER="deepseek"

# Put your real key in .env.local (git-ignored) - never commit it.
# DEEPSEEK_API_KEY / OPENAI_API_KEY / AI_API_KEY are all read server-side only.
AI_API_KEY=""
DEEPSEEK_API_KEY=""
OPENAI_API_KEY=""

# Optional overrides (empty = use the preset default).
AI_BASE_URL=""
AI_MODEL=""

# Legacy names, still honored when AI_PROVIDER is not set.
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"

# Optional tuning (see .env.example): "default" omits temperature entirely.
AI_TEMPERATURE="0.4"
AI_MAX_TOKENS=""
```

## `.env.example`

```bash
# ---------------------------------------------------------------------------
# MORI AI Growth OS - environment variables
# Copy this file to `.env.local` and fill in your own values.
# `.env.local` is git-ignored and is never committed with secrets.
# ---------------------------------------------------------------------------

# SQLite database used by Prisma (relative to the /prisma folder).
DATABASE_URL="file:./dev.db"

# Demo Mode keeps the whole product usable without any API key.
# true  -> locally generated structured analysis (recommended for reviewers)
# false -> call the configured OpenAI-compatible provider
DEMO_MODE="true"

# --- AI provider (OpenAI-compatible) ---------------------------------------
# Select the provider preset: deepseek | openai | mock | custom
# When AI_PROVIDER is set, that preset decides base URL + model (so a leftover
# OPENAI_* value from another provider can never override it).
AI_PROVIDER="deepseek"

# --- API key ----------------------------------------------------------------
# Keys are read ONLY on the server (never exposed to the browser bundle) and
# must never be committed. Put your real key in `.env.local` (git-ignored):
#   DEEPSEEK_API_KEY="<your-deepseek-key>"      <- used when AI_PROVIDER=deepseek
#   OPENAI_API_KEY="<your-openai-key>"          <- used when AI_PROVIDER=openai
#   AI_API_KEY="..."                            <- generic fallback for any provider
AI_API_KEY=""
DEEPSEEK_API_KEY=""
OPENAI_API_KEY=""

# --- Model / endpoint overrides --------------------------------------------
# Leave empty to use the preset defaults:
#   deepseek -> https://api.deepseek.com            + deepseek-flash
#   openai   -> https://api.openai.com/v1           + gpt-4o-mini
#   mock     -> http://127.0.0.1:8787/v1            + mock-model
# If your DeepSeek account exposes another model name (e.g. deepseek-chat),
# set AI_MODEL — no code change needed.
AI_BASE_URL=""
AI_MODEL=""

# Legacy names, still honored when AI_PROVIDER is not set (backwards compatible).
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"

# Optional: request timeout in milliseconds.
AI_REQUEST_TIMEOUT_MS="45000"

# Optional: sampling temperature sent to the model.
# Leave empty for the default 0.4; set to "default" to omit the parameter
# entirely (some reasoning models reject `temperature`).
AI_TEMPERATURE="0.4"

# Optional: cap on generated tokens. Leave empty to let the provider decide.
AI_MAX_TOKENS=""
```

## `.gitignore`

```text
# dependencies
/node_modules
/.pnp
.pnp.*

# next.js
/.next/
/out/
/build
next-env.d.ts

# production
/dist

# local env files
.env.local
.env*.local

# database (keep the seeded demo db in git so the demo runs out of the box)
prisma/*.db-journal
prisma/*.db-wal

# testing / tooling
/coverage
*.tsbuildinfo

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# os
.DS_Store
Thumbs.db
```

## `docs/screenshots/README.md`

```md
# 截图资产说明（已迁移）

作品集截图已统一迁移到 **`public/portfolio/`**，以便 `next` 直接以静态资源方式提供（加载更快，且支持点击放大）。

| 目录 | 规格 | 用途 |
| --- | --- | --- |
| `public/portfolio/desktop/` | 1440×900（deviceScaleFactor 1.25），JPEG | 作品集桌面端与 README |
| `public/portfolio/mobile/` | 390×844（deviceScaleFactor 2），JPEG | 作品集移动端展示 |

重新生成（需先 `npm run dev`）：

```bash
npm run screenshots
```

脚本会先真实点击 Market / Content / Creative / Campaign / Audience / Advisor / Settings 的 AI 按钮，
等待结果渲染完成后再截图，因此截到的是真实产品状态（AI 模式或自动回退状态都会如实呈现）。

> 旧的 PNG 截图（`docs/screenshots/*.png`）已删除：它们是改动前的过时版本，且体积是 JPEG 的 3 倍以上。
> 如需归档，可随时用上面的命令重新生成。
```

## `eslint.config.mjs`

```mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "prisma/dev.db",
      "outputs/**",
      "work/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
```

## `next-env.d.ts`

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

## `next.config.mjs`

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Dev-only: 允许通过 127.0.0.1 访问 dev 资源，避免控制台出现 cross-origin 警告
  // （不影响生产行为，也不会放宽任何数据访问权限）。
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  eslint: {
    dirs: ["src", "tests", "prisma"],
  },
};

export default nextConfig;
```

## `package.json`

```json
{
  "name": "mori-ai-growth-os",
  "version": "1.0.0",
  "private": true,
  "description": "MORI 森屿 AI 美妆增长中台 / MORI AI Growth OS - AI-powered growth intelligence workspace (demo brand, simulated business data).",
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "verify": "npm run typecheck && npm run lint && npm run test",
    "db:generate": "prisma generate",
    "db:push": "prisma db push --skip-generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:setup": "prisma db push --skip-generate && tsx prisma/seed.ts",
    "db:reset": "prisma db push --force-reset --skip-generate && tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "prompts:export": "tsx scripts/export-prompts.ts",
    "bundle": "node scripts/export-code-bundle.mjs",
    "mock:provider": "tsx scripts/mock-provider.ts",
    "screenshots": "node scripts/capture-screenshots.mjs",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "6.19.3",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "jspdf": "2.5.2",
    "lucide-react": "1.53.0",
    "next": "15.5.27",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "recharts": "2.15.4",
    "tailwind-merge": "3.7.0",
    "zod": "3.25.76"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@next/swc-wasm-nodejs": "15.5.27",
    "@types/node": "22.20.5",
    "@types/react": "19.3.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "10.6.1",
    "eslint": "9.39.5",
    "eslint-config-next": "15.5.27",
    "postcss": "8.5.29",
    "prisma": "6.19.3",
    "tailwindcss": "3.4.19",
    "tsx": "4.23.15",
    "typescript": "5.9.3",
    "vitest": "3.2.7"
  }
}
```

## `pnpm-workspace.yaml`

```yaml
# pnpm-only settings. This file is ignored by npm / yarn, so `npm install`
# keeps working for reviewers who prefer npm.
allowBuilds:
  "@prisma/client": true
  "@prisma/engines": true
  core-js: false
  esbuild: true
  prisma: true
  unrs-resolver: true
minimumReleaseAgeExclude:
  - lucide-react@1.53.0
```

## `postcss.config.mjs`

```mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

## `prisma/schema.prisma`

```prisma
// MORI AI Growth OS - Prisma schema (SQLite)
// All business data below is DEMO / 模拟业务数据 for a fictional brand.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Brand {
  id             String   @id @default(cuid())
  name           String
  nameEn         String
  positioning    String
  description    String
  productName    String
  priceRange     String
  targetAudience String
  channels       String // JSON array (string)
  keywords       String // JSON array (string)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Product {
  id            String  @id @default(cuid())
  brandName     String
  name          String
  category      String
  positioning   String
  price         Float
  volume        String
  keyBenefits   String // JSON array (string)
  sellingPoints String // JSON array (string)
  usageScenario String // JSON array (string)
  credibility   String // JSON array (string)
  createdAt     DateTime @default(now())
}

model Persona {
  id                 String @id @default(cuid())
  code               String @unique
  name               String
  ageBand            String
  occupation         String
  city               String
  share              Float // share of target audience (0-1)
  painPoints         String // JSON array
  motivations        String // JSON array
  contentPreferences String // JSON array
  purchaseDrivers    String // JSON array
  barriers           String // JSON array
  channels           String // JSON array
  quote              String
  accent             String // ui accent token
  createdAt          DateTime @default(now())
}

model Competitor {
  id             String  @id @default(cuid())
  name           String  @unique
  positioning    String
  price          Float
  priceTier      String
  professional   Int // 0-100 perceived professional score
  audience       String
  contentThemes  String // JSON array
  mainChannels   String // JSON array
  adThemes       String // JSON array
  strength       String
  weakness       String
  colorToken     String
  isSelf         Boolean @default(false)
  createdAt      DateTime @default(now())
}

model Campaign {
  id        String   @id @default(cuid())
  name      String   @unique
  objective String
  platform  String
  status    String
  budget    Float
  startDate DateTime
  endDate   DateTime
  note      String
  createdAt DateTime @default(now())
}

model Creative {
  id          String  @id @default(cuid())
  name        String  @unique
  campaign    String
  platform    String
  theme       String
  angle       String
  hook        String
  cta         String
  audience    String
  script      String
  priority    String
  status      String
  targetCtr   Float
  targetRoas  Float
  createdAt   DateTime @default(now())
}

// Daily ad performance records. Seeded with demo data, extended by CSV uploads.
model Metric {
  id          String   @id @default(cuid())
  date        DateTime
  platform    String
  campaign    String
  creative    String
  spend       Float
  impressions Int
  clicks      Int
  conversions Int
  revenue     Float
  source      String   @default("demo") // demo | upload
  datasetId   String?
  dataset     Dataset? @relation(fields: [datasetId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@index([date])
  @@index([platform])
  @@index([creative])
  @@index([datasetId])
}

model Dataset {
  id        String   @id @default(cuid())
  name      String
  source    String   @default("upload")
  rowCount  Int
  note      String
  createdAt DateTime @default(now())
  metrics   Metric[]
}

// Audience-level cut of the same account totals (age / gender segments).
// Used by the Audience Intelligence page and the AI Advisor's人群结论.
model AudienceMetric {
  id          String   @id @default(cuid())
  date        DateTime
  segment     String
  age         String
  gender      String
  spend       Float
  impressions Int
  clicks      Int
  conversions Int
  revenue     Float
  createdAt   DateTime @default(now())

  @@index([date])
  @@index([segment])
}

model ContentItem {
  id                 String   @id @default(cuid())
  title              String
  platform           String
  contentType        String
  goal               String
  topic              String
  audience           String
  hook               String
  body               String
  cta                String
  hookScore          Int
  relevanceScore     Int
  conversionScore    Int
  brandFitScore      Int
  overallScore       Int
  whyTest            String
  howToImprove       String
  status             String   @default("idea") // idea | testing | scaled | archived
  mode               String   @default("demo") // demo | ai
  createdAt          DateTime @default(now())
}

model Experiment {
  id              String   @id @default(cuid())
  name            String
  hypothesis      String
  goal            String
  primaryMetric   String
  status          String   @default("running") // draft | running | completed
  startDate       DateTime
  endDate         DateTime
  summary         String
  aiRecommendation String
  mode            String   @default("demo")
  createdAt       DateTime @default(now())
  variants        ExperimentVariant[]
}

model ExperimentVariant {
  id          String  @id @default(cuid())
  experimentId String
  experiment  Experiment @relation(fields: [experimentId], references: [id], onDelete: Cascade)
  label       String
  name        String
  description String
  impressions Int
  clicks      Int
  conversions Int
  spend       Float
  revenue     Float
  isWinner    Boolean @default(false)
}

model Insight {
  id         String   @id @default(cuid())
  scope      String // dashboard | audience | market | content | creative | campaign | advisor | report
  category   String // insight | opportunity | risk | recommendation
  title      String
  body       String
  evidence   String
  confidence Int
  agent      String
  mode       String   @default("demo")
  createdAt  DateTime @default(now())
}

model Report {
  id          String   @id @default(cuid())
  title       String
  periodStart DateTime
  periodEnd   DateTime
  payload     String // JSON string
  mode        String   @default("demo")
  createdAt   DateTime @default(now())
}

model PromptTemplate {
  id           String   @id @default(cuid())
  agent        String   @unique
  name         String
  nameZh       String
  version      String
  description  String
  body         String
  outputSchema String
  changelog    String
  isActive     Boolean  @default(true)
  updatedAt    DateTime @updatedAt
}

model EvaluationRecord {
  id           String @id @default(cuid())
  task         String
  agent        String
  completeness Int
  relevance    Int
  actionability Int
  accuracy     Int
  overall      Int
  notes        String
  mode         String @default("demo")
  createdAt    DateTime @default(now())
}

model Setting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}
```

## `prisma/seed.ts`

```ts
/**
 * Seeds the SQLite database with the MORI 森屿 demo dataset.
 *
 * Run with:  npm run db:setup   (prisma db push + this script)
 *            npm run db:reset   (force reset + this script)
 *
 * Everything written here is DEMO / 模拟业务数据 for a fictional brand.
 */

import { PrismaClient } from "@prisma/client";

import { DEMO_PERIOD_START, DEMO_PERIOD_END } from "@/lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  const demo = await import("@/lib/demo-data");
  const { PROMPT_LIBRARY } = await import("@/lib/prompts");
  const { formatMetricValue } = await import("@/lib/metrics");

  console.log("→ 清空旧数据 …");
  await prisma.experimentVariant.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.audienceMetric.deleteMany();
  await prisma.dataset.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.creative.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.report.deleteMany();
  await prisma.promptTemplate.deleteMany();
  await prisma.evaluationRecord.deleteMany();
  await prisma.setting.deleteMany();

  console.log("→ 写入品牌 / 产品 / 人群 / 竞品 …");
  await prisma.brand.create({ data: demo.buildDemoBrand() });
  await prisma.product.create({ data: demo.buildDemoProduct() });
  await prisma.persona.createMany({ data: demo.buildDemoPersonas() });
  await prisma.competitor.createMany({ data: demo.buildDemoCompetitors() });

  console.log("→ 写入 Campaign / Creative …");
  await prisma.campaign.createMany({
    data: demo.DEMO_CAMPAIGNS.map((campaign, index) => ({
      name: campaign.name,
      objective: campaign.objective,
      platform: campaign.platform,
      status: campaign.status,
      budget: campaign.budget,
      note: campaign.note,
      startDate: new Date(DEMO_PERIOD_START + "T00:00:00.000Z"),
      endDate: new Date(DEMO_PERIOD_END + "T00:00:00.000Z"),
      createdAt: new Date(Date.UTC(2026, 7, 10 + index)),
    })),
  });

  await prisma.creative.createMany({
    data: demo.DEMO_CREATIVE_SPECS.map((creative) => ({
      name: creative.name,
      campaign: creative.campaign,
      platform: creative.platform,
      theme: creative.theme,
      angle: creative.angle,
      hook: creative.hook,
      cta: creative.cta,
      audience: creative.audience,
      script: creative.script,
      priority: creative.priority,
      status: creative.status,
      targetCtr: creative.ctr,
      targetRoas: creative.roas,
    })),
  });

  console.log("→ 生成 30 天投放数据 …");
  const metrics = demo.buildDemoMetrics();
  await prisma.metric.createMany({
    data: metrics.map((row) => ({
      date: new Date(row.date),
      platform: row.platform,
      campaign: row.campaign,
      creative: row.creative,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
      revenue: row.revenue,
      source: "demo",
    })),
  });

  const audienceMetrics = demo.buildDemoAudienceMetrics();
  await prisma.audienceMetric.createMany({
    data: audienceMetrics.map((row) => ({
      date: new Date(row.date),
      segment: row.segment,
      age: row.age,
      gender: row.gender,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
      revenue: row.revenue,
    })),
  });

  console.log("→ 写入内容库 / 实验 / 洞察 / 评估 / Prompt …");
  await prisma.contentItem.createMany({ data: demo.buildDemoContents() });

  for (const experiment of demo.buildDemoExperiments()) {
    await prisma.experiment.create({
      data: {
        name: experiment.name,
        hypothesis: experiment.hypothesis,
        goal: experiment.goal,
        primaryMetric: experiment.primaryMetric,
        status: experiment.status,
        summary: experiment.summary,
        aiRecommendation: experiment.aiRecommendation,
        mode: "demo",
        startDate: new Date("2026-09-01T00:00:00.000Z"),
        endDate: new Date("2026-09-15T00:00:00.000Z"),
        variants: {
          create: experiment.variants.map((variant, index) => ({
            label: variant.label,
            name: variant.name,
            description: variant.description,
            impressions: variant.impressions,
            clicks: variant.clicks,
            conversions: variant.conversions,
            spend: variant.spend,
            revenue: variant.revenue,
            isWinner: experiment.status === "completed" && index === 1,
          })),
        },
      },
    });
  }

  await prisma.insight.createMany({ data: demo.buildDemoInsights() });

  await prisma.evaluationRecord.createMany({
    data: demo.buildDemoEvaluations().map((item) => ({
      task: item.task,
      agent: item.agent,
      completeness: item.completeness,
      relevance: item.relevance,
      actionability: item.actionability,
      accuracy: item.accuracy,
      overall: Math.round(
        item.completeness * 0.25 + item.relevance * 0.25 + item.actionability * 0.25 + item.accuracy * 0.25,
      ),
      notes: item.notes,
      mode: "demo",
    })),
  });

  await prisma.promptTemplate.createMany({
    data: PROMPT_LIBRARY.map((template) => ({
      agent: template.agent,
      name: template.name,
      nameZh: template.nameZh,
      version: template.version,
      description: template.description,
      body: template.body,
      outputSchema: template.outputSchema,
      changelog: template.changelog,
      isActive: true,
    })),
  });

  await prisma.setting.createMany({
    data: [
      { key: "demo_mode", value: process.env.DEMO_MODE ?? "true" },
      { key: "ai_provider", value: "OpenAI-compatible" },
      { key: "ai_model", value: process.env.OPENAI_MODEL ?? "gpt-4o-mini" },
      { key: "theme", value: "light" },
      { key: "dataset", value: "MORI demo dataset (30 days)" },
    ],
  });

  // Generate the first weekly report with the demo structured engine so the
  // Reports page is never empty on a fresh clone.
  console.log("→ 生成首份增长周报（Demo 引擎）…");
  try {
    const { getBusinessContext } = await import("@/lib/data");
    const { runAgent } = await import("@/lib/ai/runner");
    const { reportToMarkdown } = await import("@/lib/report");
    const context = await getBusinessContext();
    const result = await runAgent("report_writer", { context });
    await prisma.report.create({
      data: {
        title: result.data.title,
        periodStart: new Date(`${context.period.start}T00:00:00.000Z`),
        periodEnd: new Date(`${context.period.end}T00:00:00.000Z`),
        payload: JSON.stringify({
          report: result.data,
          meta: {
            generatedAt: result.meta.generatedAt,
            mode: result.meta.mode,
            model: result.meta.model,
            promptVersion: result.meta.promptVersion,
            dataLabel: context.dataSource.label,
          },
        }),
        mode: result.meta.mode,
      },
    });
    void reportToMarkdown;
  } catch (error) {
    console.warn("  （跳过首份周报生成）", error instanceof Error ? error.message : error);
  }

  const totals = {
    spend: metrics.reduce((acc, row) => acc + row.spend, 0),
    impressions: metrics.reduce((acc, row) => acc + row.impressions, 0),
    clicks: metrics.reduce((acc, row) => acc + row.clicks, 0),
    conversions: metrics.reduce((acc, row) => acc + row.conversions, 0),
    revenue: metrics.reduce((acc, row) => acc + row.revenue, 0),
  };
  const ctr = totals.clicks / totals.impressions;
  const cpc = totals.spend / totals.clicks;
  const cpa = totals.spend / totals.conversions;
  const roas = totals.revenue / totals.spend;

  console.log("");
  console.log("✅ Demo 数据写入完成（全部为模拟业务数据）");
  console.log(
    "   记录数：" +
      metrics.length +
      " 条投放记录 / " +
      new Set(metrics.map((row) => row.creative)).size +
      " 条素材 / " +
      new Set(metrics.map((row) => new Date(row.date).toISOString().slice(0, 10))).size +
      " 天",
  );
  console.log("   " + formatMetricValue("spend", totals.spend).padEnd(12) + "广告花费");
  console.log("   " + formatMetricValue("impressions", totals.impressions).padEnd(12) + "广告曝光");
  console.log("   " + formatMetricValue("clicks", totals.clicks).padEnd(12) + "点击");
  console.log("   " + formatMetricValue("ctr", ctr).padEnd(12) + "CTR");
  console.log("   " + formatMetricValue("cpc", cpc).padEnd(12) + "CPC");
  console.log("   " + formatMetricValue("conversions", totals.conversions).padEnd(12) + "转化");
  console.log("   " + formatMetricValue("cpa", cpa).padEnd(12) + "CPA");
  console.log("   " + formatMetricValue("roas", roas).padEnd(12) + "ROAS");
}

main()
  .catch((error) => {
    console.error("❌ Seed 失败：", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## `prompts/audience-analyst.md`

```md
# Audience Analyst · 用户洞察分析师

- **agent**: `audience_analyst`
- **version**: v1.3
- **output schema**: `AudienceAnalysisSchema`（strict JSON Schema / structured outputs）
- **作用**: 把 Persona 数据与分人群投放数据，转成内容机会与广告角度。

## 变更记录

v1.0 初版；v1.1 增加购买阻力字段；v1.2 引入分人群 CTR/CVR 对比；v1.3 增加 adAngles 输出。

## System Prompt

```text
你是 MORI 森屿的用户洞察分析师（Audience Analyst）。

你的任务：把 Persona 画像 + 分人群投放表现，转成“可以马上做内容”的机会点。

分析要求：
1. 对每个人群回答四个问题：核心痛点是什么、为什么现在会买、为什么不买、什么内容能推动决策。
2. 用分人群 CTR / CVR 对比解释“兴趣”与“购买理由”之间的差距：高 CTR 低 CVR 的人群需要信任与价格解释；低 CTR 高 CVR 的人群需要更强的场景与钩子。
3. 严禁把年轻用户写成“冲动消费”，必须基于数据给出动机假设，并标明这是假设。

输出要求：
- personas：每个人群给出 painPoints / motivations / barriers / contentPreferences。
- adAngles：3 条以上，每条包含 angle、hook（可直接作为广告开头）、audience、rationale。
- insights / opportunities / risks / recommendations：每个数组 2–3 条。

通用约束（所有 MORI Agent 都必须遵守）：
1. MORI 森屿是虚拟品牌，所有业务数据都是 Demo / 模拟业务数据，禁止把它描述成真实企业或真实业绩。
   （数据表述细则见上方"数据真实性与表述规范"，两者冲突时以更严格的一条为准。）
2. 禁止编造商业成绩（例如“销售额提升 300%”“ROI 提升 200%”），所有数字必须来自输入数据或明确标注为假设。
3. 禁止医疗、绝对化、承诺性功效表达（如“治好”“立刻见效”“永久”）。
4. 只输出符合给定 JSON Schema 的结构化结果：**Schema 中列出的每一个字段都必须出现，一个都不能少**。
   不允许省略任何 key；不允许用 null 占位；数组没有内容时返回 []；数字字段必须输出数字（不要加引号或单位）。
   不要输出 Markdown 代码块或多余解释。
5. 每条结论必须给出 evidence（引用输入中的具体指标或字段）与 confidence（0–100）。
6. 先给判断，再给证据，最后给可执行动作；动作必须具体到“做什么、对谁、验证什么指标”。
7. 输出前按 Schema 逐项自检：即使某个字段信息不足，也要基于已有数据给出合理内容并说明依据，
   绝对不能因为“不确定”而省略该字段——省略字段会被判为无效输出并被系统丢弃。

数据真实性与表述规范（最高优先级，任何 Agent 都不得违反）：
A. 本项目的品牌、竞品、用户、投放与实验数据全部是 Demo / 模拟业务数据；不存在真实投放、
   真实用户实验或真实收入。允许基于模拟数据做分析、归因、假设与推演，但表述必须限定在数据范围内。
B. 引用模拟实验或指标变化时，必须使用带口径的表述，例如：
   「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」「在 Demo 数据集中，该指标从 X 变化到 Y」。
C. 禁止把模拟数据写成既成事实，包括但不限于：已完成实验、已验证、实测验证、上线后提升、
   实际提升 X%、真实投放验证、真实用户实验证明、带来 X% 收入增长。
D. 涉及实验结论或提升幅度时，必须在同一句里写明数据口径与不确定性，例如：
   「模拟实验（Demo 数据集）显示 A→B 差异 22.6%，p=0.03；若在真实投放中复现，需要扩样验证」。
E. 禁止声称任何真实商业成绩（销售额提升、ROI 提升、客户增长、真实 GMV 等）。
   缺少真实数据支持的判断，必须写成「需要真实数据验证」。
F. 若 dataSource.kind = "upload"（用户上传的数据），表述改为「基于上传的投放数据」，
   同样不得声称真实业务增长（转化与收入口径未知）。
G. 实验的 running / completed 只是模拟实验的推演状态，不得写成「实验已经完成并验证」。

```

## 说明

- 输出为结构化 JSON（由 zod schema 转为 JSON Schema 后交给模型），因此不会出现大段不可控文本。
- 若模型调用失败或返回不符合 schema 的内容，系统会自动回退到 Demo 结构化分析引擎，并在结果中标记「AI 失败 · 已回退」。
- MORI 森屿 为虚拟品牌，全部数据为 Demo / 模拟业务数据，Prompt 中已强制约束不得编造业绩与功效承诺。
```

## `prompts/content-strategist.md`

```md
# Content Strategist · 内容策划专家

- **agent**: `content_strategist`
- **version**: v1.4
- **output schema**: `ContentStrategySchema`（strict JSON Schema / structured outputs）
- **作用**: 按平台 / 内容类型 / 目标 / 主题生成可落地的小红书与短视频内容方案。

## 变更记录

v1.0 初版；v1.1 增加 TikTok 脚本时间轴；v1.2 增加评分字段；v1.3 增加“为什么值得测试”；v1.4 增加 15 秒脚本结构约束。

## System Prompt

```text
你是 MORI 森屿的内容策划专家（Content Strategist）。

你的任务：根据平台、内容类型、投放目标与主题，产出可直接投放的内容方案。

平台规范：
- 小红书：真实用户口吻，5 个标题（不夸张、不承诺功效），正文 150–260 字，结尾有互动引导。
- 抖音：15 秒脚本，必须严格按 0–3s Hook / 3–8s 痛点 / 8–12s 解决方案 / 12–15s CTA 拆解。
- 公众号：结构化长文大纲 + 关键段落，偏知识与信任建设。

评分（0–100，请给出可解释的判断）：
- hookScore：前 3 秒 / 标题的抓取能力（是否具体、是否有场景冲突）。
- relevanceScore：与目标人群痛点及产品特性的相关度。
- conversionScore：推动下一步动作的能力（是否有明确的价值与低门槛）。
- brandFitScore：是否符合 MORI 克制、清爽、自然的品牌调性。

输出要求：
- 不要写医疗宣传、不要承诺效果、不要使用绝对化词汇。
- 每个标题都要给出 angle 与 whyItWorks。
- recommendations 中至少 1 条要指出该内容的测试方式（对照什么、看什么指标）。

输出完整性自检（最容易漏字段的地方，请逐项确认后再输出）：
- scores 必须包含全部 7 个字段：hookScore / relevanceScore / conversionScore / brandFitScore /
  overallScore / whyTest / howToImprove，一个都不能少。
- scores.howToImprove 不能省：用 1–2 句写清“改哪一句、加什么模块”，
  例如「把第 3–8 秒的痛点补上具体时间与动作，并在结尾加一条真实使用记录」。不要返回空字符串。
- scores.whyTest 同样不能省：写清“为什么这条内容值得测试”，引用指标或人群依据。
- xiaohongshu.titles 必须 5 条（每条含 title/angle/whyItWorks）；xiaohongshu.body 必须有正文；
  douyin.script 必须 4 段（0–3s / 3–8s / 8–12s / 12–15s），douyin.caption 不能为空。

通用约束（所有 MORI Agent 都必须遵守）：
1. MORI 森屿是虚拟品牌，所有业务数据都是 Demo / 模拟业务数据，禁止把它描述成真实企业或真实业绩。
   （数据表述细则见上方"数据真实性与表述规范"，两者冲突时以更严格的一条为准。）
2. 禁止编造商业成绩（例如“销售额提升 300%”“ROI 提升 200%”），所有数字必须来自输入数据或明确标注为假设。
3. 禁止医疗、绝对化、承诺性功效表达（如“治好”“立刻见效”“永久”）。
4. 只输出符合给定 JSON Schema 的结构化结果：**Schema 中列出的每一个字段都必须出现，一个都不能少**。
   不允许省略任何 key；不允许用 null 占位；数组没有内容时返回 []；数字字段必须输出数字（不要加引号或单位）。
   不要输出 Markdown 代码块或多余解释。
5. 每条结论必须给出 evidence（引用输入中的具体指标或字段）与 confidence（0–100）。
6. 先给判断，再给证据，最后给可执行动作；动作必须具体到“做什么、对谁、验证什么指标”。
7. 输出前按 Schema 逐项自检：即使某个字段信息不足，也要基于已有数据给出合理内容并说明依据，
   绝对不能因为“不确定”而省略该字段——省略字段会被判为无效输出并被系统丢弃。

数据真实性与表述规范（最高优先级，任何 Agent 都不得违反）：
A. 本项目的品牌、竞品、用户、投放与实验数据全部是 Demo / 模拟业务数据；不存在真实投放、
   真实用户实验或真实收入。允许基于模拟数据做分析、归因、假设与推演，但表述必须限定在数据范围内。
B. 引用模拟实验或指标变化时，必须使用带口径的表述，例如：
   「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」「在 Demo 数据集中，该指标从 X 变化到 Y」。
C. 禁止把模拟数据写成既成事实，包括但不限于：已完成实验、已验证、实测验证、上线后提升、
   实际提升 X%、真实投放验证、真实用户实验证明、带来 X% 收入增长。
D. 涉及实验结论或提升幅度时，必须在同一句里写明数据口径与不确定性，例如：
   「模拟实验（Demo 数据集）显示 A→B 差异 22.6%，p=0.03；若在真实投放中复现，需要扩样验证」。
E. 禁止声称任何真实商业成绩（销售额提升、ROI 提升、客户增长、真实 GMV 等）。
   缺少真实数据支持的判断，必须写成「需要真实数据验证」。
F. 若 dataSource.kind = "upload"（用户上传的数据），表述改为「基于上传的投放数据」，
   同样不得声称真实业务增长（转化与收入口径未知）。
G. 实验的 running / completed 只是模拟实验的推演状态，不得写成「实验已经完成并验证」。

```

## 说明

- 输出为结构化 JSON（由 zod schema 转为 JSON Schema 后交给模型），因此不会出现大段不可控文本。
- 若模型调用失败或返回不符合 schema 的内容，系统会自动回退到 Demo 结构化分析引擎，并在结果中标记「AI 失败 · 已回退」。
- MORI 森屿 为虚拟品牌，全部数据为 Demo / 模拟业务数据，Prompt 中已强制约束不得编造业绩与功效承诺。
```

## `prompts/creative-strategist.md`

```md
# Creative Strategist · 广告素材策略师

- **agent**: `creative_strategist`
- **version**: v1.2
- **output schema**: `CreativeDirectionsSchema`（strict JSON Schema / structured outputs）
- **作用**: 生成 5 个差异化广告素材方向，并给出测试优先级排序。

## 变更记录

v1.0 初版；v1.1 增加测试优先级评分；v1.2 要求方向之间必须“结构性差异”，不能只是换文案。

## System Prompt

```text
你是 MORI 森屿的广告素材策略师（Creative Strategist）。

你的任务：为指定平台 / 目标 / 人群 / 主题，产出 5 个差异化的素材方向（方向 A–E）。

差异化要求（5 个方向必须来自不同角度族）：
1. 场景痛点族（熬夜、通勤、空调房、宿舍）
2. 质地 / 肤感族（清爽、不黏、吸收快）
3. 价格与性价比族（单次成本、预算解释）
4. 信任与记录族（30 天记录、真实反馈）
5. 专业解释族（成分、配方逻辑）

每个方向必须给出：
- angle（角度名）、hook（开场 3 秒台词）、script（时间轴脚本）、cta、audience
- priorityScore（0–100，越高越先测）与 rationale（为什么先测它）

排序原则：优先测试“人群明确 + 场景具体 + 与现有高表现素材结构不同”的方向；不要只因为文案好听而提高优先级。

通用约束（所有 MORI Agent 都必须遵守）：
1. MORI 森屿是虚拟品牌，所有业务数据都是 Demo / 模拟业务数据，禁止把它描述成真实企业或真实业绩。
   （数据表述细则见上方"数据真实性与表述规范"，两者冲突时以更严格的一条为准。）
2. 禁止编造商业成绩（例如“销售额提升 300%”“ROI 提升 200%”），所有数字必须来自输入数据或明确标注为假设。
3. 禁止医疗、绝对化、承诺性功效表达（如“治好”“立刻见效”“永久”）。
4. 只输出符合给定 JSON Schema 的结构化结果：**Schema 中列出的每一个字段都必须出现，一个都不能少**。
   不允许省略任何 key；不允许用 null 占位；数组没有内容时返回 []；数字字段必须输出数字（不要加引号或单位）。
   不要输出 Markdown 代码块或多余解释。
5. 每条结论必须给出 evidence（引用输入中的具体指标或字段）与 confidence（0–100）。
6. 先给判断，再给证据，最后给可执行动作；动作必须具体到“做什么、对谁、验证什么指标”。
7. 输出前按 Schema 逐项自检：即使某个字段信息不足，也要基于已有数据给出合理内容并说明依据，
   绝对不能因为“不确定”而省略该字段——省略字段会被判为无效输出并被系统丢弃。

数据真实性与表述规范（最高优先级，任何 Agent 都不得违反）：
A. 本项目的品牌、竞品、用户、投放与实验数据全部是 Demo / 模拟业务数据；不存在真实投放、
   真实用户实验或真实收入。允许基于模拟数据做分析、归因、假设与推演，但表述必须限定在数据范围内。
B. 引用模拟实验或指标变化时，必须使用带口径的表述，例如：
   「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」「在 Demo 数据集中，该指标从 X 变化到 Y」。
C. 禁止把模拟数据写成既成事实，包括但不限于：已完成实验、已验证、实测验证、上线后提升、
   实际提升 X%、真实投放验证、真实用户实验证明、带来 X% 收入增长。
D. 涉及实验结论或提升幅度时，必须在同一句里写明数据口径与不确定性，例如：
   「模拟实验（Demo 数据集）显示 A→B 差异 22.6%，p=0.03；若在真实投放中复现，需要扩样验证」。
E. 禁止声称任何真实商业成绩（销售额提升、ROI 提升、客户增长、真实 GMV 等）。
   缺少真实数据支持的判断，必须写成「需要真实数据验证」。
F. 若 dataSource.kind = "upload"（用户上传的数据），表述改为「基于上传的投放数据」，
   同样不得声称真实业务增长（转化与收入口径未知）。
G. 实验的 running / completed 只是模拟实验的推演状态，不得写成「实验已经完成并验证」。

```

## 说明

- 输出为结构化 JSON（由 zod schema 转为 JSON Schema 后交给模型），因此不会出现大段不可控文本。
- 若模型调用失败或返回不符合 schema 的内容，系统会自动回退到 Demo 结构化分析引擎，并在结果中标记「AI 失败 · 已回退」。
- MORI 森屿 为虚拟品牌，全部数据为 Demo / 模拟业务数据，Prompt 中已强制约束不得编造业绩与功效承诺。
```

## `prompts/growth-advisor.md`

```md
# Growth Advisor · 增长顾问

- **agent**: `growth_advisor`
- **version**: v2.0
- **output schema**: `GrowthAdviceSchema`（strict JSON Schema / structured outputs）
- **作用**: 像增长顾问一样回答业务问题：诊断 → 原因 → 假设 → 建议 → 实验。

## 变更记录

v2.0 重写：固定五段式结构（Diagnosis / Main Reason / Hypothesis / Recommendation / Experiment），并要求列出 dataUsed。

## System Prompt

```text
你是 MORI 森屿的增长顾问（Growth Advisor）。

你掌握完整的业务上下文：品牌、产品、用户人群、竞品、投放数据、内容库与实验历史。

回答任何业务问题时，必须按以下结构输出：
1. diagnosis：用数据说明现在发生了什么（含具体数值）。
2. mainReason：最可能的主导原因，并解释如何排除其他解释。
3. hypothesis：2–3 条可验证的原因假设，每条带证据与置信度。
4. recommendation：1–3 条可执行动作，按优先级排序，写明责任动作与预期影响指标。
5. experiment：至少 1 个 A/B 实验，包含变体、主指标与成功标准。

其他要求：
- dataUsed：列出本次回答实际使用的数据来源（表 / 字段 / 时间窗）。
- 如果数据不足，必须明确说“数据不足”，并给出需要补充的数据，而不是编造结论。
- 用词克制、可执行，不要写成咨询报告式的空话。

数据口径要求：
- diagnosis / mainReason / recommendation 里引用实验或提升幅度时，必须写成「模拟实验结果（Demo 数据集）」
  或「基于模拟数据推演」，并说明「若在真实投放中复现，需要扩样验证」。
- 禁止出现「已完成实验」「已验证」「实际提升 X%」「真实用户实验证明」「带来收入增长」这类表述。
- dataUsed 中要包含一条数据口径说明，例如「Metric 表（Demo 数据集，模拟数据）」。

通用约束（所有 MORI Agent 都必须遵守）：
1. MORI 森屿是虚拟品牌，所有业务数据都是 Demo / 模拟业务数据，禁止把它描述成真实企业或真实业绩。
   （数据表述细则见上方"数据真实性与表述规范"，两者冲突时以更严格的一条为准。）
2. 禁止编造商业成绩（例如“销售额提升 300%”“ROI 提升 200%”），所有数字必须来自输入数据或明确标注为假设。
3. 禁止医疗、绝对化、承诺性功效表达（如“治好”“立刻见效”“永久”）。
4. 只输出符合给定 JSON Schema 的结构化结果：**Schema 中列出的每一个字段都必须出现，一个都不能少**。
   不允许省略任何 key；不允许用 null 占位；数组没有内容时返回 []；数字字段必须输出数字（不要加引号或单位）。
   不要输出 Markdown 代码块或多余解释。
5. 每条结论必须给出 evidence（引用输入中的具体指标或字段）与 confidence（0–100）。
6. 先给判断，再给证据，最后给可执行动作；动作必须具体到“做什么、对谁、验证什么指标”。
7. 输出前按 Schema 逐项自检：即使某个字段信息不足，也要基于已有数据给出合理内容并说明依据，
   绝对不能因为“不确定”而省略该字段——省略字段会被判为无效输出并被系统丢弃。

数据真实性与表述规范（最高优先级，任何 Agent 都不得违反）：
A. 本项目的品牌、竞品、用户、投放与实验数据全部是 Demo / 模拟业务数据；不存在真实投放、
   真实用户实验或真实收入。允许基于模拟数据做分析、归因、假设与推演，但表述必须限定在数据范围内。
B. 引用模拟实验或指标变化时，必须使用带口径的表述，例如：
   「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」「在 Demo 数据集中，该指标从 X 变化到 Y」。
C. 禁止把模拟数据写成既成事实，包括但不限于：已完成实验、已验证、实测验证、上线后提升、
   实际提升 X%、真实投放验证、真实用户实验证明、带来 X% 收入增长。
D. 涉及实验结论或提升幅度时，必须在同一句里写明数据口径与不确定性，例如：
   「模拟实验（Demo 数据集）显示 A→B 差异 22.6%，p=0.03；若在真实投放中复现，需要扩样验证」。
E. 禁止声称任何真实商业成绩（销售额提升、ROI 提升、客户增长、真实 GMV 等）。
   缺少真实数据支持的判断，必须写成「需要真实数据验证」。
F. 若 dataSource.kind = "upload"（用户上传的数据），表述改为「基于上传的投放数据」，
   同样不得声称真实业务增长（转化与收入口径未知）。
G. 实验的 running / completed 只是模拟实验的推演状态，不得写成「实验已经完成并验证」。

```

## 说明

- 输出为结构化 JSON（由 zod schema 转为 JSON Schema 后交给模型），因此不会出现大段不可控文本。
- 若模型调用失败或返回不符合 schema 的内容，系统会自动回退到 Demo 结构化分析引擎，并在结果中标记「AI 失败 · 已回退」。
- MORI 森屿 为虚拟品牌，全部数据为 Demo / 模拟业务数据，Prompt 中已强制约束不得编造业绩与功效承诺。
```

## `prompts/market-analyst.md`

```md
# Market Analyst · 市场与竞品分析师

- **agent**: `market_analyst`
- **version**: v1.2
- **output schema**: `MarketAnalysisSchema`（strict JSON Schema / structured outputs）
- **作用**: 基于品牌定位与虚拟竞品数据，输出竞争结构、市场空白与切入建议。

## 变更记录

v1.0 初版；v1.1 增加 Price × Professional 矩阵解读；v1.2 要求区分 Insight / Opportunity / Risk / Recommendation。

## System Prompt

```text
你是 MORI 森屿的市场与竞品分析师（Market Analyst）。

你的任务：把品牌信息与竞品数据，转换成可用于决策的竞争结构判断。

分析框架：
1. 价格 × 品牌专业度 的二维定位，判断 MORI 的相对位置与拥挤区间。
2. 竞品内容主题与广告主题的重复度，识别“大家都在说”的红海主题。
3. 竞品弱点（weakness）中可被 MORI 利用的结构性空隙。
4. 结合 MORI 的价位与人群，给出 1–2 个可立即测试的切入角度。

输出要求：
- competitiveGaps：至少 2 条，每条必须写清 gap（空白点）与 evidence（引用具体竞品字段）。
- positioningAdvice：一句话，说明 MORI 应该占住哪个位置，以及不要去哪里竞争。
- insights / opportunities / risks / recommendations：每个数组 2–3 条。

通用约束（所有 MORI Agent 都必须遵守）：
1. MORI 森屿是虚拟品牌，所有业务数据都是 Demo / 模拟业务数据，禁止把它描述成真实企业或真实业绩。
   （数据表述细则见上方"数据真实性与表述规范"，两者冲突时以更严格的一条为准。）
2. 禁止编造商业成绩（例如“销售额提升 300%”“ROI 提升 200%”），所有数字必须来自输入数据或明确标注为假设。
3. 禁止医疗、绝对化、承诺性功效表达（如“治好”“立刻见效”“永久”）。
4. 只输出符合给定 JSON Schema 的结构化结果：**Schema 中列出的每一个字段都必须出现，一个都不能少**。
   不允许省略任何 key；不允许用 null 占位；数组没有内容时返回 []；数字字段必须输出数字（不要加引号或单位）。
   不要输出 Markdown 代码块或多余解释。
5. 每条结论必须给出 evidence（引用输入中的具体指标或字段）与 confidence（0–100）。
6. 先给判断，再给证据，最后给可执行动作；动作必须具体到“做什么、对谁、验证什么指标”。
7. 输出前按 Schema 逐项自检：即使某个字段信息不足，也要基于已有数据给出合理内容并说明依据，
   绝对不能因为“不确定”而省略该字段——省略字段会被判为无效输出并被系统丢弃。

数据真实性与表述规范（最高优先级，任何 Agent 都不得违反）：
A. 本项目的品牌、竞品、用户、投放与实验数据全部是 Demo / 模拟业务数据；不存在真实投放、
   真实用户实验或真实收入。允许基于模拟数据做分析、归因、假设与推演，但表述必须限定在数据范围内。
B. 引用模拟实验或指标变化时，必须使用带口径的表述，例如：
   「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」「在 Demo 数据集中，该指标从 X 变化到 Y」。
C. 禁止把模拟数据写成既成事实，包括但不限于：已完成实验、已验证、实测验证、上线后提升、
   实际提升 X%、真实投放验证、真实用户实验证明、带来 X% 收入增长。
D. 涉及实验结论或提升幅度时，必须在同一句里写明数据口径与不确定性，例如：
   「模拟实验（Demo 数据集）显示 A→B 差异 22.6%，p=0.03；若在真实投放中复现，需要扩样验证」。
E. 禁止声称任何真实商业成绩（销售额提升、ROI 提升、客户增长、真实 GMV 等）。
   缺少真实数据支持的判断，必须写成「需要真实数据验证」。
F. 若 dataSource.kind = "upload"（用户上传的数据），表述改为「基于上传的投放数据」，
   同样不得声称真实业务增长（转化与收入口径未知）。
G. 实验的 running / completed 只是模拟实验的推演状态，不得写成「实验已经完成并验证」。

```

## 说明

- 输出为结构化 JSON（由 zod schema 转为 JSON Schema 后交给模型），因此不会出现大段不可控文本。
- 若模型调用失败或返回不符合 schema 的内容，系统会自动回退到 Demo 结构化分析引擎，并在结果中标记「AI 失败 · 已回退」。
- MORI 森屿 为虚拟品牌，全部数据为 Demo / 模拟业务数据，Prompt 中已强制约束不得编造业绩与功效承诺。
```

## `prompts/performance-analyst.md`

```md
# Performance Analyst · 投放数据分析师

- **agent**: `performance_analyst`
- **version**: v1.5
- **output schema**: `CampaignAnalysisSchema`（strict JSON Schema / structured outputs）
- **作用**: 基于投放数据与计算结果，诊断素材效率、渠道结构与预算去向。

## 变更记录

v1.0 初版；v1.1 增加七窗口对比；v1.2 增加高/低效素材拆解；v1.3 增加预算调整建议；v1.4 增加假设与实验设计；v1.5 强制所有数字引用传入指标。

## System Prompt

```text
你是 MORI 森屿的投放数据分析师（Performance Analyst）。

输入包含：账户总指标、时间趋势、渠道表现、素材排行、近 7 天 vs 前 7 天窗口对比、分人群表现，以及系统预计算的 signals。

诊断顺序（必须按此顺序思考）：
1. 量级：花费、曝光、点击是否发生结构性变化？
2. 流量效率：CTR、CPC 是否变化？（素材吸引力维度）
3. 承接效率：CVR、CPA 是否变化？（人群质量与落地页维度）
4. 结果效率：ROAS 变化主要由哪一环驱动？
5. 结构：渠道与素材的集中度是否带来风险？

输出要求：
- diagnosis：一句话结论，必须包含具体数值与方向。
- mainReason：指出最可能的主导环节，并说明为什么不是其他环节（用 CTR/CVR 的对比排除）。
- hypotheses：2–3 条，每条带 evidence 与 confidence；必须标注这是假设。
- winners / losers：至少各 2 条，给出 why 与 action（加预算 / 换 Hook / 暂停 / 保留观察）。
- budgetMoves：给出“从谁转给谁”的具体建议。
- experiments：至少 2 个实验，含 A/B 变体与主指标。

数据口径要求（本 Agent 最容易写成"既成事实"，务必检查）：
- 所有素材效率、预算与实验结论都要写成 Demo 口径，例如「Demo 数据显示…」「模拟实验结果显示…」；
  禁止出现「已完成实验」「已验证」「实际提升 X%」「上线后提升」这类表述。
- winners 的 action 只能写“建议（在模拟实验中）加预算/复制结构”，不得写成已经放量并取得结果。
- 历史 experiments 字段只代表模拟实验的推演状态，引用时必须写明「模拟实验结果（Demo 数据集）」。
- hypotheses 必须写清「若在真实投放中出现，需要用真实数据验证」。

输出长度控制（本 Agent 的返回体最大，必须控制篇幅，否则会被截断导致无效输出）：
- winners / losers：各 2–3 条，why 与 action 各不超过 50 字；不要复述原始数据表。
- hypotheses：2–3 条，每条 hypothesis/evidence 各不超过 60 字。
- budgetMoves：1–2 条，amount 用一句话写清金额或比例。
- experiments：2–3 条，每个字段不超过 40 字。
- insights / opportunities / risks / recommendations：每个数组 2–3 条，title 不超过 20 字，body 不超过 80 字。
- 仍然必须包含 Schema 中的全部字段（缺失任意字段都会判为无效输出）。

通用约束（所有 MORI Agent 都必须遵守）：
1. MORI 森屿是虚拟品牌，所有业务数据都是 Demo / 模拟业务数据，禁止把它描述成真实企业或真实业绩。
   （数据表述细则见上方"数据真实性与表述规范"，两者冲突时以更严格的一条为准。）
2. 禁止编造商业成绩（例如“销售额提升 300%”“ROI 提升 200%”），所有数字必须来自输入数据或明确标注为假设。
3. 禁止医疗、绝对化、承诺性功效表达（如“治好”“立刻见效”“永久”）。
4. 只输出符合给定 JSON Schema 的结构化结果：**Schema 中列出的每一个字段都必须出现，一个都不能少**。
   不允许省略任何 key；不允许用 null 占位；数组没有内容时返回 []；数字字段必须输出数字（不要加引号或单位）。
   不要输出 Markdown 代码块或多余解释。
5. 每条结论必须给出 evidence（引用输入中的具体指标或字段）与 confidence（0–100）。
6. 先给判断，再给证据，最后给可执行动作；动作必须具体到“做什么、对谁、验证什么指标”。
7. 输出前按 Schema 逐项自检：即使某个字段信息不足，也要基于已有数据给出合理内容并说明依据，
   绝对不能因为“不确定”而省略该字段——省略字段会被判为无效输出并被系统丢弃。

数据真实性与表述规范（最高优先级，任何 Agent 都不得违反）：
A. 本项目的品牌、竞品、用户、投放与实验数据全部是 Demo / 模拟业务数据；不存在真实投放、
   真实用户实验或真实收入。允许基于模拟数据做分析、归因、假设与推演，但表述必须限定在数据范围内。
B. 引用模拟实验或指标变化时，必须使用带口径的表述，例如：
   「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」「在 Demo 数据集中，该指标从 X 变化到 Y」。
C. 禁止把模拟数据写成既成事实，包括但不限于：已完成实验、已验证、实测验证、上线后提升、
   实际提升 X%、真实投放验证、真实用户实验证明、带来 X% 收入增长。
D. 涉及实验结论或提升幅度时，必须在同一句里写明数据口径与不确定性，例如：
   「模拟实验（Demo 数据集）显示 A→B 差异 22.6%，p=0.03；若在真实投放中复现，需要扩样验证」。
E. 禁止声称任何真实商业成绩（销售额提升、ROI 提升、客户增长、真实 GMV 等）。
   缺少真实数据支持的判断，必须写成「需要真实数据验证」。
F. 若 dataSource.kind = "upload"（用户上传的数据），表述改为「基于上传的投放数据」，
   同样不得声称真实业务增长（转化与收入口径未知）。
G. 实验的 running / completed 只是模拟实验的推演状态，不得写成「实验已经完成并验证」。

```

## 说明

- 输出为结构化 JSON（由 zod schema 转为 JSON Schema 后交给模型），因此不会出现大段不可控文本。
- 若模型调用失败或返回不符合 schema 的内容，系统会自动回退到 Demo 结构化分析引擎，并在结果中标记「AI 失败 · 已回退」。
- MORI 森屿 为虚拟品牌，全部数据为 Demo / 模拟业务数据，Prompt 中已强制约束不得编造业绩与功效承诺。
```

## `prompts/README.md`

```md
# MORI AI Growth OS · Prompt Library

> 全部 Prompt 由 `src/lib/prompts.ts` 生成（`npm run prompts:export`）。修改 Prompt 请改源码并提升版本号。

| Agent | 名称 | 版本 | 输出 Schema |
| --- | --- | --- | --- |
| `market_analyst` | Market Analyst · 市场与竞品分析师 | v1.2 | `MarketAnalysisSchema` |
| `audience_analyst` | Audience Analyst · 用户洞察分析师 | v1.3 | `AudienceAnalysisSchema` |
| `content_strategist` | Content Strategist · 内容策划专家 | v1.4 | `ContentStrategySchema` |
| `creative_strategist` | Creative Strategist · 广告素材策略师 | v1.2 | `CreativeDirectionsSchema` |
| `performance_analyst` | Performance Analyst · 投放数据分析师 | v1.5 | `CampaignAnalysisSchema` |
| `growth_advisor` | Growth Advisor · 增长顾问 | v2.0 | `GrowthAdviceSchema` |
| `report_writer` | Report Writer · 增长报告撰写 | v1.1 | `GrowthReportSchema` |
```

## `prompts/report-writer.md`

```md
# Report Writer · 增长报告撰写

- **agent**: `report_writer`
- **version**: v1.1
- **output schema**: `GrowthReportSchema`（strict JSON Schema / structured outputs）
- **作用**: 把一周的经营数据、内容与投放表现，整理成可交付的增长周报。

## 变更记录

v1.0 初版；v1.1 增加 Experiments 与下周建议的可执行格式。

## System Prompt

```text
你是 MORI 森屿的增长报告撰写人（Report Writer）。

你的任务：把本周数据整理成一份可以直接发给团队的增长周报，结构固定为：
Executive Summary → Performance → Audience → Content → Campaign → Key Insights → Recommendations → Experiments。

写作要求：
- Executive Summary：3 句话说清“发生了什么 / 为什么 / 下周做什么”。
- Performance：引用系统实际计算出的指标（Demo 数据口径，含环比变化），不得写成真实业务成绩。
- 所有结论必须能追溯到数据；不确定的地方写“数据不足”。
- Recommendations 必须是可执行动作（谁、做什么、看什么指标、什么时候复盘）。
- Experiments：给出下周要跑的 A/B 实验、主指标与成功标准。
- 每一个章节的第一句都要标明数据口径（例如“Demo 数据显示……”），并在结尾注明
  “基于模拟业务数据验证产品工作流，不代表真实市场表现”。

通用约束（所有 MORI Agent 都必须遵守）：
1. MORI 森屿是虚拟品牌，所有业务数据都是 Demo / 模拟业务数据，禁止把它描述成真实企业或真实业绩。
   （数据表述细则见上方"数据真实性与表述规范"，两者冲突时以更严格的一条为准。）
2. 禁止编造商业成绩（例如“销售额提升 300%”“ROI 提升 200%”），所有数字必须来自输入数据或明确标注为假设。
3. 禁止医疗、绝对化、承诺性功效表达（如“治好”“立刻见效”“永久”）。
4. 只输出符合给定 JSON Schema 的结构化结果：**Schema 中列出的每一个字段都必须出现，一个都不能少**。
   不允许省略任何 key；不允许用 null 占位；数组没有内容时返回 []；数字字段必须输出数字（不要加引号或单位）。
   不要输出 Markdown 代码块或多余解释。
5. 每条结论必须给出 evidence（引用输入中的具体指标或字段）与 confidence（0–100）。
6. 先给判断，再给证据，最后给可执行动作；动作必须具体到“做什么、对谁、验证什么指标”。
7. 输出前按 Schema 逐项自检：即使某个字段信息不足，也要基于已有数据给出合理内容并说明依据，
   绝对不能因为“不确定”而省略该字段——省略字段会被判为无效输出并被系统丢弃。

数据真实性与表述规范（最高优先级，任何 Agent 都不得违反）：
A. 本项目的品牌、竞品、用户、投放与实验数据全部是 Demo / 模拟业务数据；不存在真实投放、
   真实用户实验或真实收入。允许基于模拟数据做分析、归因、假设与推演，但表述必须限定在数据范围内。
B. 引用模拟实验或指标变化时，必须使用带口径的表述，例如：
   「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」「在 Demo 数据集中，该指标从 X 变化到 Y」。
C. 禁止把模拟数据写成既成事实，包括但不限于：已完成实验、已验证、实测验证、上线后提升、
   实际提升 X%、真实投放验证、真实用户实验证明、带来 X% 收入增长。
D. 涉及实验结论或提升幅度时，必须在同一句里写明数据口径与不确定性，例如：
   「模拟实验（Demo 数据集）显示 A→B 差异 22.6%，p=0.03；若在真实投放中复现，需要扩样验证」。
E. 禁止声称任何真实商业成绩（销售额提升、ROI 提升、客户增长、真实 GMV 等）。
   缺少真实数据支持的判断，必须写成「需要真实数据验证」。
F. 若 dataSource.kind = "upload"（用户上传的数据），表述改为「基于上传的投放数据」，
   同样不得声称真实业务增长（转化与收入口径未知）。
G. 实验的 running / completed 只是模拟实验的推演状态，不得写成「实验已经完成并验证」。

```

## 说明

- 输出为结构化 JSON（由 zod schema 转为 JSON Schema 后交给模型），因此不会出现大段不可控文本。
- 若模型调用失败或返回不符合 schema 的内容，系统会自动回退到 Demo 结构化分析引擎，并在结果中标记「AI 失败 · 已回退」。
- MORI 森屿 为虚拟品牌，全部数据为 Demo / 模拟业务数据，Prompt 中已强制约束不得编造业绩与功效承诺。
```

## `README.md`

```md
# MORI AI Growth OS

> **MORI 森屿 AI 美妆增长中台** — AI-Powered Growth Intelligence for Modern Brands
> 让 AI 帮品牌完成从用户洞察到增长优化的完整闭环。

> ⚠️ **Demo 说明**：`MORI 森屿` 是**虚拟品牌**，`AURA LAB / NUVIA / LUMIÉ` 是**虚拟竞品**，项目内所有业务数据均为
> **Demo / 模拟业务数据**。本项目**不冒充任何真实公司**，也**不声称任何真实商业成绩**（没有“销售额提升 300%”这类表述）。
> 项目重点验证的是：**AI 在营销分析与增长决策中的应用工作流**。

---

## Overview

MORI AI Growth OS 是一个可以真实运行、可以完整演示的 **AI 增长中台**，把品牌市场/增长团队每天要做的事情连接成一条链路：

```
市场调研 → 用户洞察 → 内容策划 → 素材生产 → 广告投放 → 数据分析 → AI 诊断 → 优化建议 → 下一轮实验
```

它不是“输入一句话 → AI 给你一篇文章”的 Demo，而是：

> **品牌信息 + 用户 + 产品 + 投放数据 → AI 自动分析（结构化输出）→ 商业决策建议 → 实验 → 复盘报告**

技术上是 **Next.js 15 + TypeScript + Tailwind + Prisma(SQLite) + Recharts**，AI 侧使用
**OpenAI-compatible Structured Outputs（JSON Schema）**，并由 6 个专职 Agent + 1 个报告 Agent 分工完成。

**无需任何 API Key 也能完整演示**（Demo Mode 使用本地结构化分析引擎，所有数字仍来自数据库实时计算）。

---

## Problem

现实中一个品牌的市场/增长同学，每天要在多个工具之间来回切换：

1. 市场调研、竞品分析（手工整理表格）
2. 用户分析、Persona 维护（Excel）
3. 小红书选题、抖音脚本（文档 + 聊天工具）
4. 广告素材方向（脑暴 + 拍脑袋排序）
5. 投放数据导出、CTR/CPC/CVR/CPA/ROAS 计算（Excel 公式）
6. 找低效素材、找高潜人群、调预算（人工判断）
7. 写周报 / 月报（复制粘贴 + 手工总结）

结果是：**大量时间花在“找数据 + 对口径 + 写结论”上，而不是花在判断与实验上。**

## Solution

MORI AI Growth OS 用一个统一的数据模型（品牌 / 产品 / 用户 / 竞品 / 投放 / 人群 / 内容 / 实验 / 报告）作为业务上下文，
把上面 7 件事收进一个工作台，并且：

- **指标不是写死的**：CTR / CPC / CVR / CPA / ROAS 全部由数据库中的投放记录实时计算（改数据，Dashboard 就变）。
- **AI 输出不是大段文本**：每个 Agent 都定义 JSON Schema，模型返回结构化对象，前端负责渲染。
- **AI 说的每句话都要有证据**：所有结论都带 `evidence`（引用具体指标）与 `confidence`（0–100）。
- **AI 失败也不会白屏**：调用失败或返回非法结构时，自动回退到本地结构化分析引擎，并标注 `AI 失败 · 已回退`。

## Target Users

| 角色 | 在这个产品里做什么 |
| --- | --- |
| 品牌市场团队 | 看品牌定位/竞品结构，产出内容与素材方向 |
| 增长团队 | 诊断 ROAS/CPA 变化，决定预算与实验优先级 |
| 电商运营 | 看素材效率、人群差异与转化瓶颈 |
| 广告投放 | 上传 CSV、找低效素材、拿到预算调整建议 |
| 面试官 / 评审 | 3 分钟内看完从数据到决策的完整闭环 |

## Core Value

减少重复分析工作，提升营销决策效率，让团队更快完成：

**Insight → Action → Experiment → Optimization**

---

## Product Demo

![Dashboard](public/portfolio/desktop/02-dashboard-kpi.jpg)

> 截图均来自本仓库真实运行的页面（1440×900，Chrome 实拍）。完整截图见 [`public/portfolio`](public/portfolio)。

---

## Portfolio · 求职作品集 Case Study

> **入口：`/portfolio`** → 本地运行后打开 <http://localhost:3000/portfolio>
> （单页视觉型 Case Study，独立于工作台布局，不影响 MORI 主产品任何功能）

作品集定位：**商科背景 × AI 应用 × 产品运营 × 数据分析 × 增长**，
面向 AI 产品运营 / AI 商业运营 / AI Growth / 市场与增长运营等岗位。

### 页面结构（14 节）

| 章节 | 内容 |
| --- | --- |
| 01 HERO | 标题、一句话介绍、核心数字（14 页面 / 7 Agent / 300 Demo 数据行 / 101 测试）、真实首页截图 |
| 02 Why I Built MORI | 增长工作的 7 步链路、5 个传统工作方式的问题、MORI 的 10 节点闭环解法 |
| 03 From Data to Decision | 8 个核心模块 × 真实页面截图（Market / Audience / Content / Creative / Campaign / Advisor / Experiment / Report） |
| 04 Market Intelligence | 价格 × 专业度矩阵、MORI 与 3 个虚拟竞品对比、市场空白与定位建议 |
| 05 Content Studio | 结构化输入维度 + 生成结果 + 「业务目标 → 内容策略 → 内容生成 → 投放测试」链路 |
| 06 Campaign Analytics | 10 个核心指标（真实计算值）+ 数据链路 + 「先算对数据，再让 AI 解释」的设计说明 |
| 07 AI Growth Advisor | 真实案例（CVR 3.96%→3.06%、ROAS 3.23→2.73、CPA →¥45.06、转化 739→593）+ **FACT / HYPOTHESIS / DATA GAP** + 行动建议 |
| 08 Experiment Lab | A/B 设计、主指标 CVR、辅助指标、z-test / 最小样本量 / 成功标准（全部标注 Simulated Experiment） |
| 09 AI Reliability | Structured Output / Failure Fallback / Data Provenance / Security 四张卡片 + 101 tests / TS 0 error / ESLint 0 problem |
| 10 Product Quality | 发布前验收结果（14/14 页面、7/7 后端交互、0 控制台错误、0 Key 泄露）+ Demo / AI / Fallback 三种状态 |
| 11 My Role | 我负责的部分（业务定义、产品结构、Agent 设计、Prompt、指标、实验、测试、迭代）+ 明确说明开发使用 Codex 辅助 |
| 12 What I Learned | 三点关于 AI 产品与业务决策的体会 |
| 13 Limitations | 诚实的边界说明（Demo 数据、无真实平台数据、无真实客户、SQLite、无登录）+ 下一阶段 Real Data → Real Traffic → Real Experiment |
| 14 Final | From Data to Insight to Action to Experiment + 姓名与目标岗位 |

### 截图资产

| 用途 | 位置 | 规格 |
| --- | --- | --- |
| 桌面端 | `public/portfolio/desktop/*.jpg` | 1440×900（deviceScaleFactor 1.25），16 张 |
| 移动端 | `public/portfolio/mobile/*.jpg` | 390×844（deviceScaleFactor 2），8 张 |

重新生成截图（需先启动 `npm run dev`）：

```bash
npm run screenshots
```

脚本会先真实点击关键页面的 AI 按钮并等待结果渲染，再截图；默认使用本机 Chrome，
也可用 `CHROME_PATH` / `SCREENSHOT_BASE` 环境变量覆盖。

### 导出 PDF

1. 打开 <http://localhost:3000/portfolio>
2. 点右上角 **「导出 PDF」**（等价于浏览器打印）
3. 在打印窗口里选择 **目标：另存为 PDF**，勾选 **背景图形**，边距选「默认」，建议**纵向 A4**
4. 保存即可（导航、按钮、放大遮罩会被自动隐藏，卡片与截图不会被拆页）

---

## Features

### 1. 总览 Dashboard

- 8 个核心指标卡（含环比与趋势迷你图）：广告花费 ¥128,600 / 曝光 4,860,000 / 点击 86,200 / CTR 1.77% / CPC ¥1.49 / 转化 3,240 / CPA ¥39.69 / ROAS 3.12
- 图表：花费趋势、ROAS 趋势、CTR/CVR 趋势、渠道表现、分人群效率
- **AI 增长洞察**：结论来自“真实计算结果 + 结构化 AI 分析”
- 素材表现排行榜（CTR 指数 + 放量 / 优化 Hook / 修复承接 / 暂停 四象限诊断）
- AI 分析历史（每次分析都会写入数据库，可复盘）

### 2. 品牌中心 Brand Center

品牌定位、核心产品（¥169 / 40ml）、卖点解释、使用场景、品牌关键词、渠道、人群摘要、品牌资产盘点与合规说明。

### 3. 用户洞察 Audience Intelligence

- 3 个 Persona：熬夜型都市新人 / 学生党护肤用户 / 轻熟稳定肌用户（痛点、动机、内容偏好、购买阻力、购买驱动）
- 5 个分人群投放切片（CTR / CVR / CPA / ROAS / 转化占比）
- **AI 分析用户** → 输出「用户机会 / 内容机会 / 产品机会 / 广告机会」四张卡片 + 推荐广告角度

### 4. 市场与竞品 Market Intelligence

- 价格 × 品牌专业度二维矩阵（MORI 与 3 个虚拟竞品）
- 竞品数据对比（价格/定位/用户/渠道/广告主题/强弱项）+ 内容主题拥挤度
- **生成 AI 竞品报告** → Insight / Opportunity / Risk / Recommendation + 市场空白 + 定位建议

### 5. 内容策划 Content Studio

- 选择平台（小红书/抖音/公众号）× 内容类型 × 目标 × 主题 × 人群
- 输出：5 个标题（含角度与“为什么有效”）、真实口吻正文、抖音 15 秒脚本（0–3s Hook / 3–8s 痛点 / 8–12s 方案 / 12–15s CTA）
- 内容评分：Hook / Relevance / Conversion Potential / Brand Fit / Overall + “为什么值得测试”“怎么进一步优化”
- 一键保存到内容库（写入数据库）

### 6. 广告素材中心 Creative Lab

- 一次生成 5 个**结构性差异**的素材方向（场景痛点 / 肤感实测 / 价格解释 / 信任记录 / 专业解释）
- 每个方向：角度、核心 Hook、时间轴脚本、CTA、目标人群、测试优先级与理由

### 7. 投放分析 Campaign Analytics

- **CSV 上传**（拖拽 / 选择文件 / 直接粘贴），自动清洗并写入数据库
- 自动计算 CTR / CPC / CVR / CPA / ROAS（除 0 保护）
- 素材效率明细、广告计划表现、每日趋势
- **AI Analyze Campaign** → Diagnosis / Main Reason / Hypotheses / Winners / Losers / Budget Moves / Experiments

### 8. AI 增长顾问 AI Advisor

带业务上下文的“顾问式”问答（不是普通聊天窗口），固定输出结构：
`Diagnosis → Main Reason → Hypothesis（含证据与置信度）→ Recommendation → Experiment → 数据依据`

### 9. 实验中心 Experiment Lab

- 选择两个真实素材作为 A / B 变体 → 系统用 **双比例 z 检验**（Two-proportion z-test）判断差异是否显著
- 输出：CTR / CVR / CPA / ROAS 对比、置信度、p 值，以及“建议保留 A / B / 继续收集样本”的结论

### 10. 增长报告 Growth Report

- 一键生成 8 段式周报：Executive Summary / Performance / Audience / Content / Campaign / Key Insights / Recommendations / Experiments
- 支持复制 Markdown、下载 `.md`、**下载 PDF**（客户端生成，无需服务端依赖）
- 历史报告入库（Report 表）

### 11. Prompt 管理 Prompt Library

6 个 Agent + 1 个报告 Agent 的独立 Prompt、版本号、输出 Schema（可展开/复制）、变更记录。

### 12. AI 评估 Evaluation

Completeness / Relevance / Actionability / Accuracy 四维评分 + 评估方法说明 + 已知局限（明确标注为 Demo Evaluation）。

### 13. 设置 Settings

AI Provider、Demo Mode、API Status（可测试连接）、Model、Theme（浅色/深色）、Data Management（重建 Demo 数据 / 清除上传数据集）。

### 14. 交互与错误处理

所有异步按钮都有 `Loading / Success / Error / Empty / Disabled` 五种状态；覆盖 API Key 缺失、AI 调用失败、
CSV 格式错误、CSV 空文件、数字字段为空、除数为 0、数据库错误与网络错误。

---

## Architecture

```mermaid
flowchart TD
    U[User / 面试官] --> UI[Next.js App Router UI<br/>Dashboard · Audience · Market · Content<br/>Creative · Campaign · Advisor · Experiments · Reports]
    UI --> API[Next.js API Routes<br/>Server-side business context assembly]
    API --> DATA[(Business Data<br/>SQLite + Prisma<br/>Brand · Product · Persona · Competitor<br/>Campaign · Creative · Metric<br/>AudienceMetric · Content · Experiment)]
    DATA --> ENGINE[Analytics Engine<br/>CTR · CPC · CVR · CPA · ROAS<br/>7-day window comparison · signals]
    ENGINE --> AGENTS[AI Agents · 6 + 1<br/>Market / Audience / Content<br/>Creative / Performance / Advisor / Report]
    AGENTS --> SCHEMA[Structured Output<br/>JSON Schema + zod validation]
    SCHEMA --> INSIGHT[Insight / Opportunity / Risk / Recommendation]
    INSIGHT --> DECISION[Growth Recommendation<br/>budget moves · content angles · ad directions]
    DECISION --> EXP[Experiment Lab<br/>A/B + two-proportion z-test]
    EXP --> REPORT[Growth Report<br/>weekly review + next experiments]
    REPORT --> DATA
    AGENTS -. provider error / invalid JSON .-> FALLBACK[Demo structured engine<br/>auto fallback + labelled]
    FALLBACK --> SCHEMA
    CSV[CSV Upload] --> DATA
```

### 为什么这样分层

- **数据层不依赖 AI**：所有 KPI 先由 `lib/metrics.ts` / `lib/analytics.ts` 算出来，AI 只是“解释与决策层”。
  这样即使模型胡说，也骗不过 Dashboard。
- **AI 层只有两个出口**：符合 Schema 的结构化对象，或者带警告的回退结果。没有第三种状态会到达前端。
- **回退是产品能力**：Demo Mode 不是“降级”，而是让评审在没有任何 Key 的情况下也能看到完整闭环。

---

## Tech Stack

| 层 | 选型 | 说明 |
| --- | --- | --- |
| Framework | Next.js 15.5（App Router） | 服务端组件取数 + API Routes 处理 AI/上传 |
| Language | TypeScript 5.9（strict） | `tsc --noEmit` 通过 |
| UI | Tailwind CSS 3.4 + shadcn/ui 风格组件（本地内置） | 不依赖远程字体，离线可跑 |
| Charts | Recharts 2.15 | 图表颜色随主题切换 |
| Database | SQLite + Prisma 6 | `prisma/dev.db`，随仓库提供已 seed 的 Demo 数据 |
| AI | OpenAI-compatible `/chat/completions` + Structured Outputs | `lib/ai/client.ts` 使用原生 fetch + JSON Schema |
| Validation | zod 3 | 同时用于生成 JSON Schema 与校验模型输出 |
| Tests | Vitest 3 | 101 个用例 / 10 个文件（指标 / CSV / 数据 / 分析 / 统计 / AI 结构 / AI 请求契约 / DeepSeek / 结构化输出完整性 / 模拟数据表述规范） |
| PDF | jsPDF（客户端） | 周报 PDF 导出 |

---

## AI Architecture

### 6 个专职 Agent（故意不使用一个大 Prompt）

| Agent | 职责 | 输出 Schema | 版本 |
| --- | --- | --- | --- |
| Market Analyst | 市场与竞品分析 | `MarketAnalysisSchema` | v1.2 |
| Audience Analyst | 用户洞察与机会 | `AudienceAnalysisSchema` | v1.3 |
| Content Strategist | 内容策划与评分 | `ContentStrategySchema` | v1.4 |
| Creative Strategist | 广告素材方向 | `CreativeDirectionsSchema` | v1.2 |
| Performance Analyst | 投放数据分析 | `CampaignAnalysisSchema` | v1.5 |
| Growth Advisor | 最终商业建议 | `GrowthAdviceSchema` | v2.0 |
| Report Writer | 增长周报 | `GrowthReportSchema` | v1.1 |

完整 Prompt 见 [`prompts/`](prompts)（由 `src/lib/prompts.ts` 通过 `npm run prompts:export` 生成，避免文档与运行时漂移）。

### 结构化输出流程

```mermaid
sequenceDiagram
    participant UI as UI 页面
    participant API as /api/* Route
    participant DB as SQLite
    participant ENG as Analytics Engine
    participant MODEL as AI Provider
    participant ZOD as zod Schema
    UI->>API: POST question | selection | datasetId
    API->>DB: 取品牌 / 产品 / 人群 / 竞品 / 投放 / 内容 / 实验
    API->>ENG: 计算 KPI + 窗口对比 + 规则信号
    API->>MODEL: system prompt + context JSON + response_format(json_schema, strict)
    MODEL-->>API: JSON
    API->>ZOD: safeParse(JSON)
    alt 通过
        API-->>UI: data + meta mode=ai
    else 失败 / 超时 / 非法结构
        API->>API: demo engine（同一 Schema）
        API-->>UI: data + meta mode=fallback + warning
    end
```

### Agent 输出的硬性约束（写入每个 Prompt）

1. MORI 是虚拟品牌，数据是模拟数据，禁止描述成真实业绩
2. 禁止编造商业成绩与功效承诺、绝对化表述
3. 只输出符合 JSON Schema 的结构化结果
4. 每条结论必须有 `evidence` 与 `confidence`
5. 先判断、再证据、最后可执行动作
6. 数据不足时必须回答“数据不足”，并说明需要补什么数据
7. **数据真实性与表述规范**：所有实验 / 投放 / 人群数据都是模拟数据。允许基于模拟数据推演，
   但必须写成「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」；禁止使用「已完成实验」「已验证」
   「实际提升 X%」「真实投放验证」「带来收入增长」这类把模拟当成既成事实的表述；缺少真实数据支持的判断
   必须写成「需要真实数据验证」。上传数据集时改用「基于上传的投放数据」口径。

---

## Data Model

```mermaid
erDiagram
    Brand ||--o{ Product : has
    Brand ||--o{ Persona : targets
    Brand ||--o{ Competitor : compares
    Campaign ||--o{ Creative : contains
    Creative ||--o{ Metric : measured_by
    Dataset ||--o{ Metric : upload_batch
    Experiment ||--|{ ExperimentVariant : has
    ContentItem }o--|| Persona : written_for
    Report }o--|| Brand : summarizes
    PromptTemplate }o--|| Agent : configures
    EvaluationRecord }o--|| Agent : scores
```

主要表：`Brand` `Product` `Persona` `Competitor` `Campaign` `Creative` `Metric`（投放明细）`AudienceMetric`（分人群切片）
`Dataset`（上传批次）`ContentItem` `Experiment` + `ExperimentVariant` `Insight` `Report` `PromptTemplate` `EvaluationRecord` `Setting`。

Demo 数据规模（`npm run db:seed`）：

| 数据 | 数量 |
| --- | --- |
| 投放记录 Metric | **300 条**（30 天 × 10 条素材） |
| 分人群记录 AudienceMetric | **150 条**（30 天 × 5 个人群） |
| Persona | 3 个 |
| 虚拟竞品 | 3 个（+ MORI 自身） |
| Campaign | 5 个 |
| Creative | 10 条 |
| 内容 ContentItem | **36 条** |
| 实验 Experiment | 3 个（含 A/B 变体） |
| Prompt | 7 个 |
| 评估记录 | 6 条 |

---

## Screenshots

| 页面 | 截图 |
| --- | --- |
| 首页 Landing | ![hero](public/portfolio/desktop/01-hero-landing.jpg) |
| 总览 Dashboard | ![dashboard](public/portfolio/desktop/02-dashboard-kpi.jpg) |
| AI 增长洞察 | ![insights](public/portfolio/desktop/03-dashboard-insights.jpg) |
| 市场与竞品 Market | ![market](public/portfolio/desktop/04-market.jpg) |
| 内容策划 Content | ![content](public/portfolio/desktop/05-content.jpg) |
| 广告素材 Creative | ![creative](public/portfolio/desktop/06-creative.jpg) |
| 投放分析 Campaign | ![campaign](public/portfolio/desktop/07-campaign.jpg) |
| 用户洞察 Audience | ![audience](public/portfolio/desktop/08-audience.jpg) |
| AI 增长顾问 Advisor | ![advisor](public/portfolio/desktop/09-advisor.jpg) |
| 实验中心 Experiments | ![experiments](public/portfolio/desktop/10-experiments.jpg) |
| 增长报告 Reports | ![reports](public/portfolio/desktop/11-reports.jpg) |
| 设置 / AI 状态 | ![settings](public/portfolio/desktop/12-settings-ai.jpg) |
| Prompt 管理 | ![prompts](public/portfolio/desktop/13-prompts.jpg) |
| AI 评估 | ![evaluation](public/portfolio/desktop/14-evaluation.jpg) |
| 品牌中心 | ![brand](public/portfolio/desktop/15-brand.jpg) |
| 深色主题 | ![dark](public/portfolio/desktop/16-dashboard-dark.jpg) |
| 移动端（390×844） | ![mobile](public/portfolio/mobile/02-dashboard.jpg) |

---

## Getting Started

### 环境要求

- Node.js **≥ 20**（开发验证使用 Node 24）
- 包管理器：`npm`（推荐）或 `pnpm`

### 安装与启动

```bash
# 1) 安装依赖（会自动执行 prisma generate）
npm install

# 2) 初始化数据库 + 写入 Demo 数据（首次必须执行一次）
npm run db:setup

# 3) 启动
npm run dev
```

打开 <http://localhost:3000> 即可看到完整产品。

> 仓库内已附带 seed 好的 `prisma/dev.db`，因此如果你只想先看效果，可以直接 `npm install && npm run dev`；
> 想重建数据则执行 `npm run db:reset`。
>
> 使用 pnpm 时命令相同：`pnpm install && pnpm run db:setup && pnpm run dev`。

### 在没有 npm 的机器上运行（开发验证环境就是这种情况）

如果机器上只有 Node（本机 Node 24）而 PATH 里没有 `npm`，可以直接用随 Codex 运行时附带的 pnpm，
并关闭 Next 遥测（该机器上遥测写配置会因 EXDEV 报错并中断启动）：

```powershell
$pnpm = 'C:\Users\<you>\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs'
$env:NEXT_TELEMETRY_DISABLED = '1'
node $pnpm exec next dev -p 3000       # 等价于 npm run dev
```

需要完整命令（含 db / test / build）时，把 `npm run <script>` 换成 `node $pnpm run <script>` 即可。
最省事的方案仍然是安装 [Node.js LTS](https://nodejs.org/)（自带 npm），之后按上面的标准流程运行。

> 双击项目根目录的 **`start-mori.cmd`** 也可以一键启动：它会自动设置 `NEXT_TELEMETRY_DISABLED=1`、
> 自动打开浏览器，并且在服务已经在运行时只打开浏览器而不重复启动（有 npm 就用 npm，没有就用本机 Codex 运行时自带的 pnpm）。

### 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器（http://localhost:3000） |
| `npm run build` / `npm start` | 生产构建与启动 |
| `npm run db:setup` | `prisma db push` + `tsx prisma/seed.ts` |
| `npm run db:reset` | 强制重建数据库并重新写入 Demo 数据 |
| `npm run db:studio` | Prisma Studio 可视化查看数据库 |
| `npm run typecheck` | TypeScript 类型检查（`tsc --noEmit`） |
| `npm run lint` | ESLint（flat config, next/core-web-vitals） |
| `npm test` | Vitest 单元测试（101 个用例） |
| `npm run verify` | typecheck + lint + test |
| `npm run prompts:export` | 从源码重新生成 `prompts/*.md` |
| `npm run mock:provider` | 启动本地 OpenAI-compatible mock（验证真实 AI 模式与 fallback） |
| `npm run bundle` | 重新生成单文件纯文本包（用于上传给 ChatGPT 等） |
| `npm run screenshots` | 重新生成作品集截图（桌面 1440×900 + 移动 390×844，需先 `npm run dev`） |

### 默认登录方式

**无需登录**。这是一个求职作品集项目，按需求刻意不做登录 / 权限 / 支付系统（避免过度工程化）。

---

## Environment Variables

复制 `.env.example` 为 `.env.local` 后按需修改（`.env.local` 已被 `.gitignore` 忽略，不会被提交）：

```bash
DATABASE_URL="file:./dev.db"                    # SQLite 数据库位置（相对 prisma/）

DEMO_MODE="true"                                # true = 本地结构化分析引擎，不需要任何 API Key
OPENAI_API_KEY=""                               # DEMO_MODE=false 时必填；不要写进代码
OPENAI_BASE_URL="https://api.openai.com/v1"      # 任何 OpenAI-compatible 端点
OPENAI_MODEL="gpt-4o-mini"
AI_REQUEST_TIMEOUT_MS="45000"
```

**任何 API Key 都不会出现在代码或前端 bundle 中**：所有模型调用都发生在服务端 API Route 内。

## Demo Mode

- 默认 `DEMO_MODE=true`：使用本地结构化分析引擎（`src/lib/ai/demo-engine.ts`）。
- 它**不是写死的答案**：每句话都由刚算出来的指标拼装（例如“「熬夜党晚间修护」贡献 ¥18,486 花费、ROAS 4.26，高于账户均值 37%”），
  所以**改 Demo 数据或上传自己的 CSV，分析结论会跟着变**。
- 页面顶部显示 `Demo Mode` 标识，AI 结果卡片上标注 `Demo 引擎`。

## AI Mode

1. 在 `.env.local` 设置 `DEMO_MODE="false"` 与 `OPENAI_API_KEY="sk-..."`
2. 重启 `npm run dev`
3. 顶部状态变为 `AI · <model>`，Settings → AI Status 可点击「测试 AI 连接」

### DeepSeek（推荐配置，已内置 Provider 预设）

MORI 支持按预设切换 Provider，**DeepSeek 只需一个环境变量 + 你的 Key**（Key 放在 `.env.local`，已被 git 忽略）：

```bash
# .env.local  （绝对不要提交到 Git）
DEMO_MODE="false"
AI_PROVIDER="deepseek"                 # 预设：base URL + model 自动带上
DEEPSEEK_API_KEY="sk-你的 DeepSeek Key"  # 只在服务端读取

# 可选覆盖
AI_MODEL="deepseek-flash"              # 若你的账号是 deepseek-chat，改这里即可（无需改代码）
AI_TEMPERATURE="0.4"                   # 设 "default" 则完全不发送该参数
AI_MAX_TOKENS="4000"                   # 周报类长输出建议设置
```

| 项 | 值 |
| --- | --- |
| Provider 预设 | `AI_PROVIDER="deepseek"` |
| Base URL | `https://api.deepseek.com`（预设自带，请求路径为 `/chat/completions`） |
| Model | `deepseek-flash`（预设默认，可用 `AI_MODEL` 覆盖） |
| API Key 环境变量 | **`DEEPSEEK_API_KEY`**（也接受通用 `AI_API_KEY`；OpenAI 用 `OPENAI_API_KEY`） |
| 输出方式 | DeepSeek 不支持 strict `json_schema`，因此**直接使用 `json_object` + 把 JSON Schema 注入 system prompt**，再由 zod 校验（跳过无效的 strict 尝试，省一次往返） |

> 若 DeepSeek 返回 `Model Not Exist`，说明你的账号可用模型名不同（官方公开名称为 `deepseek-chat` /
> `deepseek-reasoner`），把 `AI_MODEL` 或 `OPENAI_MODEL` 改成可用的名字即可，**不需要改代码**。

Settings → AI Provider 卡片会显示当前的 Provider / Base URL / Model / **密钥来源（只显示变量名）** /
输出方式，点「测试 AI 连接」可以确认 DeepSeek 是否真的连通（成功时会回显 `DeepSeek · 请求方式 json_object`）。

调用使用官方 Structured Outputs 形式：

```json
{
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "mori_campaign_analysis",
      "strict": true,
      "schema": { "...": "由 zod 自动生成（additionalProperties:false + required 全覆盖）" }
    }
  }
}
```

任何失败（无 Key / HTTP 错误 / 超时 / JSON 非法 / Schema 不符 / 模型拒答）都会：

1. 回退到 Demo 引擎（同一套 Schema）；
2. 在前端标注 `AI 失败 · 已回退` 与具体原因；
3. 绝不把非法结构渲染到页面。

### 请求形状降级阶梯（兼容所有 OpenAI-compatible 服务）

不同厂商对 `response_format` 的支持程度不一样，所以客户端会从强到弱依次尝试，**校验强度不降级**（每一步都仍用 zod 校验）：

| 顺序 | 请求形状 | 何时使用 | temperature / max_tokens |
| --- | --- | --- | --- |
| 1 | `json_schema`（strict Structured Outputs） | 默认首选 | 发送 |
| 2 | `json_object` + 把 JSON Schema 注入 system prompt | 仅当上游对 1 返回 400/404/405/415/422 | 不发送 |
| 3 | 纯 JSON 输出 + 把 Schema 注入 prompt | 仅当 2 仍然失败 | 不发送 |

其他已处理的真实兼容性问题：

- **strict 模式合规**：发往模型的 JSON Schema 会自动剔除 strict 不支持的字段（`minimum` / `maximum` / `pattern` / `default` …），
  但 zod 仍然用原始规则校验返回值 —— 否则 OpenAI 会直接返回 400，导致每个 Agent 都静默 fallback。
- **代码块围栏**：模型返回 ` ```json … ``` ` 或前后包着一句话时，会自动去围栏 / 提取花括号内容。
- **推理模型**：设 `AI_TEMPERATURE="default"` 可完全不发送 `temperature`（gpt-5 / o 系列会拒绝该参数）。
- **截断**：`finish_reason=length` 会报 `TRUNCATED` 并尝试更轻的请求，而不是含糊地报"不是合法 JSON"。
- **密钥安全**：所有错误文案、日志、API 响应都会经 `redactSecrets()` 脱敏（`sk-***` / `Bearer ***`），Key 只存在于服务端请求头。

### 没有真实 Key 也能验证真实 AI 模式

```bash
npm run mock:provider                      # 本地 OpenAI-compatible mock（ok 模式）
MOCK_MODE=http500 npm run mock:provider     # 模拟上游故障 → 验证 fallback
MOCK_MODE=badjson npm run mock:provider     # 模拟非 JSON 输出 → 验证 Zod 校验 + fallback
```

然后把 `.env.local` 指向它：`DEMO_MODE="false"`、`OPENAI_API_KEY="sk-local-mock"`、
`OPENAI_BASE_URL="http://127.0.0.1:8787/v1"`、`OPENAI_MODEL="mock-model"`，
就可以在不消耗任何真实额度的情况下验证 7 个 Agent 的真实调用链路。

---

## Testing

```bash
npm test           # 101 passed / 10 files
npm run typecheck  # 0 error
npm run lint       # 0 problem
```

| 测试文件 | 覆盖内容 |
| --- | --- |
| `tests/metrics.test.ts` | CTR / CPC / CVR / CPA / ROAS 公式、除 0、NaN/Infinity、空数据集、格式化 |
| `tests/csv.test.ts` | CSV 解析（引号 / 转义 / CRLF / BOM）、中文表头别名、¥ 与千分位、空文件、缺列、坏日期、空数字、口径异常、round-trip |
| `tests/demo-data.test.ts` | KPI 目标精确命中、素材基准值、30 天结构、窗口对比、分人群再切分、整数分配器、占比求解器 |
| `tests/analytics.test.ts` | 日序列、渠道 / 素材聚合、窗口对比、四象限诊断、规则信号、空数据兜底 |
| `tests/statistics.test.ts` | 双比例 z 检验（显著 / 不显著 / 0 样本）、最小样本量 |
| `tests/ai-schema.test.ts` | **7 个 Agent 的结构化输出全部通过 Schema 校验**、JSON Schema 严格性（`additionalProperties:false` / `required`）、**7 类非法 AI 输出被拒绝**、越界置信度被拒绝、Provider 抛错时自动回退且结果仍合法、Prompt 合规约束检查 |
| `tests/ai-provider.test.ts` | 真实 AI 请求契约（16 个用例）：strict Schema 不含不被支持的字段、`json_schema → json_object → plain` 降级、温度可控、代码块围栏解析、截断与拒答处理、Key 脱敏 |

> 关于“AI 返回非法数据不会崩溃”：`tests/ai-schema.test.ts` 注入了会抛错的 provider，断言 `meta.mode === "fallback"`、
> 带有 `HTTP_ERROR` 警告，并且回退结果依然符合 Schema。

### 我的验证记录（本仓库实际执行）

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| 类型检查 | `tsc --noEmit` | ✅ 0 error |
| Lint | `eslint .` | ✅ 0 problem |
| 单元测试 | `vitest run` | ✅ 101 passed / 10 files |
| 全部页面渲染 | `GET / /dashboard /brand /audience /market /content /creative /campaign /advisor /experiments /reports /prompts /evaluation /settings` | ✅ 全部 HTTP 200 |
| AI 接口 | `POST /api/{audience,market,content,creative,campaign,advisor,reports,experiments,settings}` | ✅ 全部 `ok:true`（Demo 引擎） |
| CSV 成功上传 | `POST /api/campaign/upload` | ✅ 3 行入库 + 3 条质量提示 |
| CSV 错误处理 | 空文件 / 缺列 / 无法解析日期 | ✅ `INVALID_REQUEST` / `MISSING_COLUMNS` / `NO_DATA_ROWS`，含行级 issues |
| 数据库 Seed | `tsx prisma/seed.ts` | ✅ 花费 ¥128,600 · CTR 1.77% · CPC ¥1.49 · CPA ¥39.69 · ROAS 3.12 |
| 真实 AI 模式（本地 mock provider 端到端） | 7 个 Agent + Settings 连通性测试 | ✅ 8/8 返回 `mode=ai`；请求全部为 `json_schema strict=true` 且 `strictViolations=none` |
| AI 失败回退 | mock 返回 500 / 非 JSON | ✅ 均返回 `mode=fallback` 并带 `HTTP_ERROR` / `INVALID_JSON` 原因，页面不崩溃 |
| 密钥泄漏检查 | 响应体 + 应用日志扫描 | ✅ 未出现 Key（错误文案已脱敏为 `sk-***`） |
| **真实 DeepSeek 连接** | Settings → 测试 AI 连接 | ✅ `ok=true`（deepseek-flash · 请求方式 json_object · 1.5s） |
| **真实 DeepSeek Agent 调用** | `POST /api/advisor/ask` | ✅ `mode=ai`（32s，结论引用了数据库真实指标并自行做了排除法推理） |
| DeepSeek 鉴权头回归 | `tests/ai-deepseek.test.ts` | ✅ 3 个用例（含"残留 OPENAI_API_KEY 不得覆盖 DeepSeek Key"场景） |
| 结构化输出完整性（真实 DeepSeek） | Content Studio ×5 | ✅ 5/5 `mode=ai`，`scores.howToImprove` / `whyTest` 每次都有内容（121–153 字） |
| 长输出 Agent（真实 DeepSeek） | Campaign Analytics ×2 | ✅ 2/2 `mode=ai`（21s / 17s；精简输出后由 205s 中断变为 ~20s 稳定完成） |
| 缺字段修复式重试 | `tests/ai-structured-output.test.ts` 等 | ✅ 12 个新用例（必填清单 / description / 修复重试 / null / 尾逗号 / 截断精简 / 超时与中断区分） |
| 模拟数据表述规范（真实 DeepSeek） | 顾问被问「实验跑完了吗 / 结论能直接用吗」 | ✅ 断言式违规 **0** 次；模型主动要求「复盘里写成方向性信号 + 待验证，不要写成『已验证』或『提升 17.5%』」 |
| 投放分析口径（真实 DeepSeek） | `POST /api/campaign/analyze` | ✅ 输出为「Demo 数据显示近 7 天 ROAS 从 3.23 降到 2.73…」「假设（需真实数据验证）…」 |
| 模拟数据表述规范（单元测试） | `tests/ai-demo-wording.test.ts` | ✅ 9 个用例：7 个 Agent 输出必须带 Demo 口径、不得含禁用表述、实验文案改写但原始数据保持不变 |

---

## Project Structure

```
MORI-AI-Growth-OS
├─ prisma/
│  ├─ schema.prisma          # SQLite 数据模型
│  ├─ seed.ts                # Demo 数据写入脚本
│  └─ dev.db                 # 已 seed 的演示数据库
├─ prompts/                  # 7 个 Agent 的 Prompt 文档（由 lib/prompts.ts 导出）
├─ scripts/export-prompts.ts # Prompt 文档生成脚本
├─ src/
│  ├─ app/
│  │  ├─ (workspace)/        # 13 个业务页面（共享 Sidebar + Topbar 布局）
│  │  ├─ api/                # AI / CSV / 报告 / 设置 接口
│  │  ├─ page.tsx            # 产品首页（Landing）
│  │  ├─ error.tsx  not-found.tsx
│  │  └─ globals.css         # 设计 token（CSS 变量，支持深浅主题）
│  ├─ components/
│  │  ├─ ui/                 # Button / Card / Badge / Tabs / Table / Field / Feedback
│  │  ├─ charts/             # Recharts 封装 + 自制 Sparkline（无额外依赖）
│  │  ├─ layout/             # Sidebar / Topbar / AppShell
│  │  ├─ ai/                 # AgentRunner（Loading/Success/Error/Empty/Disabled）、SignalBlocks
│  │  └─ dashboard audience market content creative campaign advisor experiments reports settings
│  ├─ lib/
│  │  ├─ metrics.ts          # 指标公式（唯一口径 + 除 0 保护）
│  │  ├─ analytics.ts        # 聚合、窗口对比、规则信号、四象限诊断
│  │  ├─ csv.ts              # CSV 解析、校验、错误码
│  │  ├─ statistics.ts       # 双比例 z 检验、最小样本量
│  │  ├─ experiments.ts      # 实验评估与结论生成
│  │  ├─ demo-data.ts        # 可复现的 Demo 数据生成器
│  │  ├─ data.ts             # 业务上下文组装（Prisma → 领域对象）
│  │  ├─ report.ts           # 周报 Markdown / PDF 文本
│  │  ├─ prompts.ts          # Prompt 单一事实来源（7 个 Agent）
│  │  └─ ai/                 # client / schemas / json-schema / demo-engine / runner / context
│  └─ types/index.ts
└─ tests/                    # 10 个测试文件 / 101 个用例
```

### 页面地图

| 路由 | 页面 | 主要能力 |
| --- | --- | --- |
| `/` | Landing | 产品故事与模块导航 |
| `/dashboard` | 总览 | 8 KPI + 图表 + AI 洞察 + 素材榜单 |
| `/brand` | 品牌中心 | 品牌 / 产品 / 人群 / 资产 |
| `/audience` | 用户洞察 | Persona + 分人群 + AI 机会卡片 |
| `/market` | 市场与竞品 | 竞品矩阵 + AI 竞品报告 |
| `/content` | 内容策划 | 小红书 / 抖音方案 + 评分 + 保存 |
| `/creative` | 广告素材 | 5 个素材方向 + 测试优先级 |
| `/campaign` | 投放分析 | CSV 上传 + 指标计算 + AI 诊断 |
| `/advisor` | AI 增长顾问 | 五段式商业诊断 |
| `/experiments` | 实验中心 | A/B + 显著性检验 |
| `/reports` | 增长报告 | 8 段式周报 + PDF |
| `/prompts` | Prompt 管理 | Prompt / 版本 / Schema |
| `/evaluation` | AI 评估 | 四维评分与局限 |
| `/settings` | 设置 | Provider / Demo Mode / 主题 / 数据 |

---

## Interview Demo

> 目标：**3 分钟**讲完“数据 → 分析 → 决策 → 实验 → 复盘”的闭环。建议提前 `npm run dev` 打开浏览器。

| 时间 | 页面 | 你要说的话 |
| --- | --- | --- |
| 00:00 | `/` | “这是 MORI 森屿 AI 美妆增长中台。MORI 是虚拟品牌，所有数据都是模拟数据 —— 我重点展示的是**工作流**，不是虚构业绩。” |
| 00:20 | `/dashboard` | “30 天账户：花费 ¥128,600，CTR 1.77%，ROAS 3.12。这 8 个指标全部由数据库实时计算，不是写死的。注意 AI 洞察第一条已经指出效率集中在少数素材上。” |
| 00:40 | `/campaign` | “进入投放分析，可以直接上传 CSV（这里有示例文件）。素材排行榜里「成分党深度解析」ROAS 2.13，「熬夜党晚间修护」4.26 —— 问题已经肉眼可见。” |
| 01:10 | `/campaign` → AI Analyze | “点 AI 分析。它先给 Diagnosis：「近 7 天 ROAS 从 3.22 降到 2.74」；再给 Main Reason：「CTR 基本持平，CVR 下滑 22.6%」—— 说明不是素材失效，而是承接环节；然后给预算调整和下一轮实验。” |
| 01:40 | `/content` | “带着这个结论进入内容策划。输入「针对 23 岁熬夜女性」，它按平台规范生成 5 个标题、正文和 15 秒脚本，并给出 Hook / 相关性 / 转化潜力评分与「为什么值得测试」。” |
| 02:00 | `/creative` | “素材中心一次生成 5 个结构性差异的方向：场景、肤感、价格、信任、专业，并给出测试优先级 —— 第一轮只测 3 个，避免样本被摊薄。” |
| 02:20 | `/advisor` | “AI 增长顾问不是聊天窗口：它按 Diagnosis → Main Reason → Hypothesis → Recommendation → Experiment 回答，每条假设都带证据和置信度，最后列出用了哪些数据表。” |
| 02:40 | `/experiments` | “假设变成实验：选两条真实素材做 A/B，系统用双比例 z 检验判断差异是否显著，给出「保留哪个变体」的结论 —— 结论来自统计，不是模型感觉。” |
| 02:55 | `/reports` | “最后一键生成周报，8 个章节，可以复制、下载 Markdown 或 PDF，下周一直接发团队。” |
| 03:00 | 结束 | “整条链路里，AI 只负责解释与决策层，指标永远由数据算 —— 这就是我想证明的能力：**发现商业问题，并用 AI + 数据 + 产品思维把它变成一个可运行的解决方案**。” |

备选问答（如果面试官追问）：

- **“这些数字是真的吗？”** → 不是，全部是模拟数据，README 与页面都有标注；重点是工作流可验证。
- **“AI 出错怎么办？”** → 有 Schema 校验 + 自动回退 + 页面标注，且测试覆盖了非法输出场景。
- **“为什么不用一个大 Prompt？”** → 拆分成 6+1 个 Agent 后，每个 Agent 的评估标准、版本管理与失败回退都可控（见 `/prompts` 与 `/evaluation`）。

---

## Known Issues / Limitations

1. **数据是模拟的**：竞品、Persona、投放数据均为 Demo 数据，结论只验证工作流，不代表真实市场。
2. **没有登录与权限**：按“不要过度工程化”的要求刻意省略。
3. **Demo 引擎的语义质量上限**：Demo Mode 输出由规则 + 模板拼装，事实一致性高，但表达多样性不如真实模型；AI Mode 才有真正的语言生成能力。
4. **实验结论只覆盖比例指标**：CTR / CVR 使用 z 检验；CPA / ROAS 使用提升幅度判断（页面上已注明）。
5. **未接入真实广告平台**：CSV 是唯一的数据入口。
6. **SQLite 单文件数据库**：并发写入能力有限，不适合真实多用户生产环境。
7. **周报 PDF 为客户端简单排版**：够用、可交付，但不是专业排版引擎。
8. **本机环境注意事项**：开发验证的这台 Windows 机器应用控制策略阻止了 Next 的原生 SWC 二进制，因此用官方 wasm 兜底
   （`@next/swc-wasm-nodejs`）完成构建与截图验证；普通机器上不需要它，`npm run dev` 会直接使用原生 SWC，速度更快。

## Future Improvements

1. 接入真实广告平台 API（Meta / 巨量 / 腾讯广告）与电商订单数据，替换 CSV。
2. 用真实评估集（人工标注 + LLM-as-judge）替换 Demo 评分，并跟踪 Prompt 版本 A/B。
3. 增加“假设 → 实验 → 结果回写”的自动化闭环（实验结束后自动更新 Insight 与周报）。
4. 多品牌工作区与权限体系（含审计日志）。
5. 落地页与素材的语义一致性检查（素材文案 vs 落地页首屏 embedding 比对）。
6. 引入向量检索，让顾问在历史分析、内容库与实验记录上做 RAG。
7. 时间序列异常检测（自动发现 CVR / CPA 异常并主动预警）。

## Project Reflection

这个项目不是为了证明“我会写代码”，而是为了证明：

> 我能够发现商业问题，并使用 AI、数据和产品思维，把它变成一个**可运行的解决方案**。

几个刻意的产品决策：

- **先把指标算对，再让 AI 说话**：`lib/metrics.ts` 是所有 KPI 的唯一口径（含除 0 保护），AI 只拿到计算结果。
  这样即使模型输出不理想，Dashboard 依然可信。
- **结构化输出优先**：所有 Agent 都先定义 Schema，再写 Prompt。前端只渲染 Schema 内的字段，因此不会出现“模型输出一段无法结构化的长文本”。
- **失败要可见**：AI 调用失败会回退到 Demo 引擎并显式标注原因，而不是静默降级或白屏。
- **不做假成绩**：竞品、用户、效果全部标注为模拟数据，并主动写明“数据不足时不做结论”。
- **统计问题交给统计**：实验结论用双比例 z 检验，而不是让模型“感觉一下”。
- **Demo 数据要自洽**：`src/lib/demo-data.ts` 用可复现的算法生成 300 条投放记录，并且**精确命中需求里的 KPI**
  （ROAS 3.12 / CTR 1.77% / CPC ¥1.49 / CPA ¥39.69），同时刻意构造了“最后 7 天 CVR 下滑”的故事线，让 AI 顾问真的有话可说。

下一步我会优先补两件事：**真实数据接入** 与 **用真实评估集替代 Demo 评分**，因为这两件事决定了它能不能从“能演示的产品”变成“能被信任的产品”。

---

## License / Compliance

- 代码仅用于个人求职作品集演示。
- `MORI 森屿` 与全部竞品名称均为虚构，若与现实品牌重名纯属巧合。
- 所有内容与文案均避免医疗宣传、绝对化功效表述与虚假承诺。
- 不存在任何真实客户、真实业绩或真实用户数据。
- AI 不会把模拟实验描述成真实实验：所有实验与投放结论都带 Demo 口径，并明确「需真实数据验证」。
```

## `scripts/capture-screenshots.mjs`

```mjs
/**
 * 作品集截图脚本（可重复执行）
 *
 * 用法：先 npm run dev，再另开终端 npm run screenshots
 *
 * 输出（JPEG，体积小、加载快）：
 *   public/portfolio/desktop/*.jpg   1440×900 (deviceScaleFactor 1.25)
 *   public/portfolio/mobile/*.jpg    390×844  (deviceScaleFactor 2)
 *
 * 关键页面会先真实点击 AI 按钮并等待结果出现，再截图。
 * 如果本机装了 Chrome 就用 Chrome，否则用 Playwright 自带浏览器。
 * 依赖 playwright：npm i -D playwright（本机回退到 Codex 运行时自带的 playwright）。
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.SCREENSHOT_BASE ?? "http://127.0.0.1:3000";
const desktopDir = join(projectRoot, "public", "portfolio", "desktop");
const mobileDir = join(projectRoot, "public", "portfolio", "mobile");

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const fallback =
      process.env.PLAYWRIGHT_MODULE ??
      "file:///C:/Users/28150/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
    return await import(fallback);
  }
}

const { chromium } = await loadPlaywright();

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);

const executablePath = chromeCandidates.find((candidate) => existsSync(candidate));

const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : {}),
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

/**
 * 注意：expect 必须是「只有出结果后才存在」的文案。
 * AgentRunner 的成功徽标（Analysis completed / Content generated / Creatives ready）
 * 以及顾问结果里的「数据依据」、Settings 的「模型连接正常」都只在成功渲染后出现。
 */
const desktopShots = [
  { name: "01-hero-landing", path: "/" },
  { name: "02-dashboard-kpi", path: "/dashboard" },
  { name: "03-dashboard-insights", path: "/dashboard", scrollTo: "AI 增长洞察" },
  { name: "04-market", path: "/market", click: "生成 AI 竞品报告", expect: "Analysis completed" },
  { name: "05-content", path: "/content", click: "生成内容方案", expect: "Content generated" },
  { name: "06-creative", path: "/creative", click: "Generate Creatives", expect: "Creatives ready" },
  { name: "07-campaign", path: "/campaign", click: "AI Analyze Campaign", expect: "Analysis completed" },
  { name: "08-audience", path: "/audience", click: "AI 分析用户", expect: "Analysis completed" },
  { name: "09-advisor", path: "/advisor", ask: "最近 ROAS 为什么下降？", click: "提交问题", expect: "数据依据" },
  { name: "10-experiments", path: "/experiments", scrollTo: "实验列表" },
  { name: "11-reports", path: "/reports", scrollTo: "Executive Summary" },
  { name: "12-settings-ai", path: "/settings", click: "测试 AI 连接", expect: "模型连接正常" },
  { name: "13-prompts", path: "/prompts" },
  { name: "14-evaluation", path: "/evaluation" },
  { name: "15-brand", path: "/brand" },
  { name: "16-dashboard-dark", path: "/dashboard", theme: "dark" },
];

const mobileShots = [
  { name: "01-hero-landing", path: "/" },
  { name: "02-dashboard", path: "/dashboard" },
  { name: "03-market", path: "/market", scrollTo: "竞品矩阵" },
  { name: "04-content", path: "/content", scrollTo: "内容简报" },
  { name: "05-campaign", path: "/campaign", scrollTo: "关键指标" },
  { name: "06-advisor", path: "/advisor" },
  { name: "07-experiments", path: "/experiments", scrollTo: "实验列表" },
  { name: "08-settings", path: "/settings" },
];

mkdirSync(desktopDir, { recursive: true });
mkdirSync(mobileDir, { recursive: true });

async function shoot({ context, shots, outDir, viewportLabel }) {
  const page = await context.newPage();
  for (const shot of shots) {
    try {
      await page.goto(base + shot.path, { waitUntil: "domcontentloaded", timeout: 180000 });
      await page.waitForTimeout(1500);

      if (shot.theme) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
          window.localStorage.setItem("mori-theme", theme);
        }, shot.theme);
        await page.waitForTimeout(600);
      }

      if (shot.ask) {
        await page.locator("textarea").first().fill(shot.ask, { timeout: 30000 });
      }

      if (shot.click) {
        for (let attempt = 1; attempt <= 2; attempt += 1) {
          await page.getByRole("button", { name: new RegExp(shot.click) }).first().click({ timeout: 30000 });
          try {
            await page.getByText(shot.expect, { exact: false }).first().waitFor({ timeout: 200000 });
            break;
          } catch (error) {
            if (attempt === 2) throw error;
            console.log(`   ↻ ${shot.name} 首次等待超时，重试一次…`);
          }
        }
      }

      if (shot.scrollTo) {
        await page
          .getByText(shot.scrollTo, { exact: false })
          .first()
          .scrollIntoViewIfNeeded({ timeout: 30000 })
          .catch(() => {});
      } else {
        await page.evaluate(() => window.scrollTo({ top: 0 }));
      }

      await page.waitForTimeout(900);
      await page.screenshot({ path: join(outDir, `${shot.name}.jpg`), type: "jpeg", quality: 80, fullPage: false });
      console.log(`   ✔ ${viewportLabel} ${shot.name}.jpg`);
    } catch (error) {
      console.log(`   ✘ ${viewportLabel} ${shot.name}: ${String(error.message).slice(0, 140)}`);
    }
  }
  await page.close();
}

console.log(`[screenshots] base=${base}${executablePath ? ` chrome=${executablePath}` : " (playwright bundled browser)"}`);

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.25,
  locale: "zh-CN",
});
await shoot({ context: desktop, shots: desktopShots, outDir: desktopDir, viewportLabel: "desktop" });
await desktop.close();

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "zh-CN",
});
await shoot({ context: mobile, shots: mobileShots, outDir: mobileDir, viewportLabel: "mobile" });
await mobile.close();

await browser.close();
console.log("[screenshots] done → public/portfolio/desktop & public/portfolio/mobile");
```

## `scripts/export-code-bundle.mjs`

```mjs
/**
 * 把整个项目导出成「单文件纯文本包」，用于上传给 ChatGPT / Claude 等只能接收
 * 文档类附件的对话工具（它们通常拒收 .zip）。
 *
 * 用法（在项目根目录）: node scripts/export-code-bundle.mjs
 * 也可以用 npm run bundle
 *
 * 输出: docs/MORI-AI-Growth-OS-code-bundle.md（同时生成一个 .txt 副本）
 */

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(projectRoot, "docs");

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "coverage", "out"]);
const SKIP_FILES = new Set([
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "tsconfig.tsbuildinfo",
  "dev.db",
  "MORI-AI-Growth-OS-code-bundle.md",
  "MORI-AI-Growth-OS-code-bundle.txt",
]);
const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".icns",
  ".db", ".db-journal", ".db-wal", ".zip", ".pdf", ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".mov",
]);
const MAX_FILE_BYTES = 160 * 1024;

const LANG_BY_EXT = {
  ".ts": "ts", ".tsx": "tsx", ".js": "js", ".mjs": "mjs", ".cjs": "cjs",
  ".json": "json", ".md": "md", ".css": "css", ".html": "html",
  ".prisma": "prisma", ".yml": "yaml", ".yaml": "yaml", ".cmd": "bat", ".bat": "bat",
  ".txt": "text", ".env": "bash", ".example": "bash", ".sql": "sql",
};

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  const dirs = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env" && entry.name !== ".env.example" && entry.name !== ".gitignore") {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      dirs.push(full);
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(entry.name)) continue;
      if (BINARY_EXT.has(entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase())) continue;
      files.push(full);
    }
  }
  // 先列目录、再列文件，保证输出顺序稳定、便于阅读
  return [...dirs.flatMap((d) => walk(d)), ...files.map((f) => ({ file: f }))];
}

const collected = walk(projectRoot)
  .map((item) => (typeof item === "string" ? item : item.file))
  .filter(Boolean)
  .map((file) => ({
    file,
    rel: relative(projectRoot, file).split("\\").join("/"),
  }))
  .sort((a, b) => a.rel.localeCompare(b.rel));

const included = [];
const skipped = [];

for (const item of collected) {
  const size = statSync(item.file).size;
  if (size > MAX_FILE_BYTES) {
    skipped.push(`${item.rel} (${Math.round(size / 1024)} KB, 超过单文件上限)`);
    continue;
  }
  included.push({ ...item, size, content: readFileSync(item.file, "utf8") });
}

function buildTree() {
  const lines = [];
  const sorted = collected.map((item) => item.rel);
  const root = new Map();
  for (const rel of sorted) {
    const parts = rel.split("/");
    let node = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      if (!node.has(part)) node.set(part, { isFile, children: new Map() });
      node = node.get(part).children;
    });
  }
  const render = (node, depth) => {
    const entries = [...node.entries()].sort((a, b) => {
      if (a[1].isFile !== b[1].isFile) return a[1].isFile ? 1 : -1;
      return a[0].localeCompare(b[0]);
    });
    for (const [name, value] of entries) {
      lines.push(`${"  ".repeat(depth)}${name}${value.isFile ? "" : "/"}`);
      if (!value.isFile) render(value.children, depth + 1);
    }
  };
  render(root, 0);
  return lines.join("\n");
}

const totalBytes = included.reduce((acc, item) => acc + item.size, 0);
const header = `# MORI AI Growth OS · 完整源码包（单文件纯文本）

> 这是一个 Next.js 15 + TypeScript + Prisma(SQLite) + Recharts 的完整项目源码，
> 由 \`scripts/export-code-bundle.mjs\` 自动导出。所有业务数据均为 Demo / 模拟业务数据，
MORI 森屿 为虚拟品牌。

- 项目名：MORI AI Growth OS（MORI 森屿 AI 美妆增长中台）
- 文件数：${included.length} 个文本文件（已跳过二进制资源，如截图与 sqlite 数据库）
- 代码总量：约 ${Math.round(totalBytes / 1024)} KB
- 说明文档：见下方 \`README.md\` 全文（产品故事 / 架构图 / 面试演示流程 / 已知问题）
${skipped.length > 0 ? `- 未包含：${skipped.join("；")}\n` : ""}
## 如何阅读这份包

1. 先看 \`README.md\`（在下面）了解产品与架构；
2. 再看 \`src/lib/metrics.ts\` 与 \`src/lib/analytics.ts\`：所有 KPI（CTR/CPC/CVR/CPA/ROAS）的唯一口径；
3. 再看 \`src/lib/ai/schemas.ts\` + \`src/lib/ai/runner.ts\` + \`src/lib/ai/client.ts\`：结构化输出与失败回退机制；
4. 页面在 \`src/app/(workspace)/*\`，接口在 \`src/app/api/*\`；
5. 测试在 \`tests/*\`（47 个用例，覆盖指标计算、CSV 校验、统计检验与 AI 输出结构）。

\`\`\`bash
# 本地运行方式
npm install && npm run db:setup && npm run dev   # http://localhost:3000
\`\`\`

## 目录结构

\`\`\`text
${buildTree()}
\`\`\`

---

`;

const body = included
  .map((item) => {
    const ext = item.file.slice(item.file.lastIndexOf(".")).toLowerCase();
    const lang = LANG_BY_EXT[ext] ?? "text";
    return `## \`${item.rel}\`\n\n\`\`\`${lang}\n${item.content.replace(/\s*$/, "")}\n\`\`\`\n`;
  })
  .join("\n");

mkdirSync(outDir, { recursive: true });
const markdown = `${header}${body}`;
writeFileSync(join(outDir, "MORI-AI-Growth-OS-code-bundle.md"), markdown, "utf8");
writeFileSync(join(outDir, "MORI-AI-Growth-OS-code-bundle.txt"), markdown, "utf8");

console.log(`✅ 已导出 ${included.length} 个文件（约 ${Math.round(totalBytes / 1024)} KB）`);
console.log(`   docs/MORI-AI-Growth-OS-code-bundle.md`);
console.log(`   docs/MORI-AI-Growth-OS-code-bundle.txt`);
if (skipped.length > 0) console.log(`   跳过：${skipped.join("；")}`);
```

## `scripts/export-prompts.ts`

```ts
/**
 * Exports the canonical prompt library (src/lib/prompts.ts) into the
 * human-readable /prompts folder.
 *
 * Run:  npm run prompts:export
 *
 * Keeping the markdown files generated from the same source that the runtime
 * uses means the documentation can never drift away from the prompts the
 * agents actually receive.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { PROMPT_LIBRARY } from "@/lib/prompts";

const outDir = join(process.cwd(), "prompts");
mkdirSync(outDir, { recursive: true });

const index: string[] = [
  "# MORI AI Growth OS · Prompt Library",
  "",
  "> 全部 Prompt 由 `src/lib/prompts.ts` 生成（`npm run prompts:export`）。修改 Prompt 请改源码并提升版本号。",
  "",
  "| Agent | 名称 | 版本 | 输出 Schema |",
  "| --- | --- | --- | --- |",
];

PROMPT_LIBRARY.forEach((template) => {
  const fileName = `${template.agent.replace(/_/g, "-")}.md`;
  index.push(
    `| \`${template.agent}\` | ${template.name} · ${template.nameZh} | ${template.version} | \`${template.outputSchema}\` |`,
  );

  const document = [
    `# ${template.name} · ${template.nameZh}`,
    "",
    `- **agent**: \`${template.agent}\``,
    `- **version**: ${template.version}`,
    `- **output schema**: \`${template.outputSchema}\`（strict JSON Schema / structured outputs）`,
    `- **作用**: ${template.description}`,
    "",
    "## 变更记录",
    "",
    template.changelog,
    "",
    "## System Prompt",
    "",
    "```text",
    template.body,
    "```",
    "",
    "## 说明",
    "",
    "- 输出为结构化 JSON（由 zod schema 转为 JSON Schema 后交给模型），因此不会出现大段不可控文本。",
    "- 若模型调用失败或返回不符合 schema 的内容，系统会自动回退到 Demo 结构化分析引擎，并在结果中标记「AI 失败 · 已回退」。",
    "- MORI 森屿 为虚拟品牌，全部数据为 Demo / 模拟业务数据，Prompt 中已强制约束不得编造业绩与功效承诺。",
    "",
  ].join("\n");

  writeFileSync(join(outDir, fileName), document, "utf8");
});

writeFileSync(join(outDir, "README.md"), [...index, ""].join("\n"), "utf8");

console.log(`✅ 已导出 ${PROMPT_LIBRARY.length} 个 Prompt 到 /prompts`);
```

## `scripts/mock-provider.ts`

```ts
/**
 * 本地 OpenAI-compatible mock provider —— 仅用于开发/验证，不参与生产逻辑。
 *
 * 用途：在没有真实 API Key 的情况下验证「真实 AI 模式」的完整链路：
 *   npm run mock:provider            # ok 模式：返回结构合法的 JSON（故意带 ``` 代码块围栏）
 *   MOCK_MODE=http500 npm run mock:provider   # 让上游返回 500，用于验证 fallback
 *   MOCK_MODE=badjson npm run mock:provider   # 返回非 JSON，用于验证 Zod 校验 + fallback
 *
 * 启动后把 .env.local 指过去即可：
 *   DEMO_MODE="false"
 *   OPENAI_API_KEY="sk-local-mock"        # 任意非空值
 *   OPENAI_BASE_URL="http://127.0.0.1:8787/v1"
 *   OPENAI_MODEL="mock-model"
 *
 * 该脚本只打印「模型名 / schema 名 / 请求形状 / 是否含 Strict 不支持的字段」，
 * 不会打印任何 header、Authorization 或 API Key。
 */

import { createServer } from "node:http";

import { demoFor } from "@/lib/ai/runner";
import { PROMPT_LIBRARY } from "@/lib/prompts";
import { getBusinessContext } from "@/lib/data";
import type { AgentId } from "@/types";

const PORT = Number(process.env.MOCK_PORT ?? 8787);
const MODE = process.env.MOCK_MODE ?? "ok";

const AGENT_BY_SCHEMA = new Map<string, AgentId>(
  PROMPT_LIBRARY.map((template) => [template.schemaName, template.agent]),
);

const UNSUPPORTED_IN_STRICT = ["minimum", "maximum", "minLength", "maxLength", "pattern", "default"];

function json(res: import("node:http").ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

const server = createServer(async (req, res) => {
  if (!req.url?.includes("/chat/completions")) {
    json(res, 404, { error: { message: "not found" } });
    return;
  }

  let raw = "";
  for await (const chunk of req) raw += chunk;

  let body: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type?: string; json_schema?: { name?: string; strict?: boolean } };
    messages?: Array<{ role: string; content: string }>;
  } = {};
  try {
    body = JSON.parse(raw);
  } catch {
    json(res, 400, { error: { message: "invalid request body" } });
    return;
  }

  // In strict mode the schema name travels in response_format; in json_object /
  // plain mode it is stated inside the system prompt (see jsonSchemaPromptHint).
  const schemaName =
    body.response_format?.json_schema?.name ??
    (body.messages?.[0]?.content ?? "").match(/mori_[a-z_]+/)?.[0] ??
    "unknown";
  const responseFormat = JSON.stringify(body.response_format ?? {});
  const offending = UNSUPPORTED_IN_STRICT.filter((keyword) => responseFormat.includes(`"${keyword}"`));

  console.log(
    `[mock] model=${body.model ?? "-"} schema=${schemaName} shape=${body.response_format?.type ?? "none"} ` +
      `strict=${body.response_format?.json_schema?.strict ?? "-"} temp=${body.temperature ?? "omitted"} ` +
      `max_tokens=${body.max_tokens ?? "omitted"} bytes=${raw.length} ` +
      `strictViolations=${offending.length > 0 ? offending.join(",") : "none"} ` +
      `schemaInPrompt=${(body.messages?.[0]?.content ?? "").includes("additionalProperties") ? "yes" : "no"}`,
  );

  if (MODE === "http500") {
    json(res, 500, { error: { message: "mock upstream failure (simulated)" } });
    return;
  }

  const agent = AGENT_BY_SCHEMA.get(schemaName);

  let content: string;
  if (MODE === "badjson") {
    content = "对不起，我无法给出结构化结果。";
  } else if (!agent) {
    content = JSON.stringify({ ok: true });
  } else {
    const context = await getBusinessContext();
    const data = demoFor(agent, {
      context,
      question: "最近 ROAS 为什么下降？",
      contentSelection: {
        platform: "小红书",
        contentType: "种草",
        goal: "转化",
        topic: "熬夜修护",
        audience: context.personas[0]?.name ?? "熬夜型都市新人",
      },
      creativeSelection: {
        platform: "抖音",
        objective: "转化",
        audience: "23 岁熬夜女性",
        theme: "夜间修护",
      },
    });
    // 故意带上 ``` 围栏：真实兼容接口很常这么返回，用于验证客户端的兼容处理
    content = "```json\n" + JSON.stringify(data) + "\n```";
  }

  json(res, 200, {
    id: "mock-completion",
    model: body.model ?? "mock-model",
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: { prompt_tokens: Math.round(raw.length / 4), completion_tokens: Math.round(content.length / 4) },
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock] MORI mock provider (${MODE}) listening on http://127.0.0.1:${PORT}/v1`);
});
```

## `src/app/(workspace)/advisor/page.tsx`

```tsx
import { AdvisorConsole } from "@/components/advisor/advisor-console";
import { MetaList } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { getBusinessContext } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdvisorPage() {
  const context = await getBusinessContext();
  const { totals, comparison, brand, product, personas, competitors, experiments } = context;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI Growth Advisor"
        title="AI 增长顾问"
        titleEn="AI Growth Advisor"
        description="带业务上下文的增长顾问：回答任何问题都会先取数、再诊断、再给出可执行动作与实验设计。它不是一个通用聊天窗口。"
        meta={
          <>
            <Badge tone="moss">{brand.name} · {product.name}</Badge>
            <Badge tone="neutral">已加载 {context.dataSource.rows} 行投放数据</Badge>
            <Badge tone="neutral">Persona {personas.length} · 竞品 {competitors.length} · 实验 {experiments.length}</Badge>
            <DemoTag />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <AdvisorConsole />

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>顾问当前掌握的数据</CardTitle>
                <CardDescription>这些上下文会随每一次提问一起发送给 Agent。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <MetaList
                title="业务上下文"
                items={[
                  `品牌与产品：${brand.name} / ${product.name}（${formatCurrency(product.price)}）`,
                  `人群：${personas.map((persona) => persona.name).join("、")}`,
                  `竞品：${competitors.filter((item) => !item.isSelf).map((item) => item.name).join("、")}`,
                  `投放数据：${context.dataSource.rows} 行 / ${context.period.days} 天 / ${context.platforms.length} 个渠道`,
                  `分人群数据：${context.audience.length} 个人群切片`,
                  `内容库：${context.contents.length} 条 · 实验：${context.experiments.length} 个`,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>当前账户快照</CardTitle>
                <CardDescription>顾问回答中的数字都来自这里。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-[12px]">
              <Row label="花费" value={formatCurrency(totals.spend)} />
              <Row label="CTR" value={formatPercent(totals.ctr)} />
              <Row label="CVR" value={formatPercent(totals.cvr)} />
              <Row label="CPA" value={formatCurrency(totals.cpa, { digits: 2 })} />
              <Row label="ROAS" value={totals.roas.toFixed(2)} />
              <Row
                label={`近 ${comparison?.windowDays ?? 7} 天 ROAS`}
                value={comparison ? comparison.current.roas.toFixed(2) : "—"}
                tone={(comparison?.deltas.roas ?? 0) < 0 ? "bad" : "good"}
              />
              <Row
                label="ROAS 环比"
                value={comparison ? `${comparison.deltas.roas.toFixed(1)}%` : "—"}
                tone={(comparison?.deltas.roas ?? 0) < 0 ? "bad" : "good"}
              />
              <Row
                label="CVR 环比"
                value={comparison ? `${comparison.deltas.cvr.toFixed(1)}%` : "—"}
                tone={(comparison?.deltas.cvr ?? 0) < 0 ? "bad" : "good"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>回答质量标准</CardTitle>
                <CardDescription>顾问被要求遵守的规则。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <MetaList
                title="约束"
                items={[
                  "必须引用输入数据中的具体数字，不能只给结论",
                  "必须说明如何排除其他解释（例如用 CTR 稳定排除素材失效）",
                  "数据不足时必须回答“数据不足”，并说明需要补充什么数据",
                  "禁止编造商业成绩，禁止功效与绝对化表述",
                  "输出必须是符合 JSON Schema 的结构化对象",
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Section title="示例问题" titleEn="Suggested Questions">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { q: "最近 ROAS 为什么下降？", d: "会给出 Diagnosis / Main Reason / Hypothesis / Recommendation / Experiment 五段式回答。" },
            { q: "哪些素材应该增加预算？", d: "会引用素材 ROAS、CPA 与预算占比，给出具体转移金额与观察窗口。" },
            { q: "18–24 岁女性为什么不买？", d: "会用分人群 CTR/CVR 对比，指出“有兴趣但缺购买理由”，并给出信任与价格解释内容。" },
          ].map((item) => (
            <Card key={item.q}>
              <CardContent>
                <p className="text-[13px] font-medium">「{item.q}」</p>
                <p className="prose-copy mt-1.5">{item.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-line pb-2 last:border-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span
        className={
          tone === "good" ? "font-mono text-tone-good" : tone === "bad" ? "font-mono text-tone-bad" : "font-mono text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
```

## `src/app/(workspace)/audience/page.tsx`

```tsx
import { PersonaCard } from "@/components/audience/persona-card";
import { AudienceWorkbench } from "@/components/audience/audience-workbench";
import { Badge } from "@/components/ui/badge";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { Progress } from "@/components/ui/feedback";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getBusinessContext } from "@/lib/data";
import { formatCompactNumber, formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AudiencePage() {
  const context = await getBusinessContext();
  const { personas, audience, brand } = context;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Audience Intelligence"
        title="用户洞察"
        titleEn="Audience Intelligence"
        description={`${brand.name} 的目标人群由 3 个核心 Persona 与 5 个分人群投放数据切片共同构成。点击「AI 分析用户」会调用 Audience Analyst Agent，输出用户 / 内容 / 产品 / 广告四类机会。`}
        meta={
          <>
            <Badge tone="moss">Persona {personas.length} 个</Badge>
            <Badge tone="neutral">人群切片 {audience.length} 个</Badge>
            <Badge tone="neutral">目标：18–30 岁女性</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="核心用户画像" titleEn="Personas" description="画像字段来自 Persona 表，AI 分析会直接引用这些字段作为证据。">
        <div className="grid gap-4 xl:grid-cols-3">
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </Section>

      <Section
        title="分人群投放表现"
        titleEn="Segment Performance"
        description="同账户总额的分人群再切分：CTR 指数与 CVR 指数以账户均值为 1.00 基准。"
      >
        <div className="surface overflow-hidden p-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="pl-5">人群</TH>
                <TH className="text-right">曝光</TH>
                <TH className="text-right">点击</TH>
                <TH className="text-right">CTR</TH>
                <TH className="text-right">CVR</TH>
                <TH className="text-right">点击成本</TH>
                <TH className="text-right">CPA</TH>
                <TH className="text-right">ROAS</TH>
                <TH className="pr-5">转化占比</TH>
              </TR>
            </THead>
            <TBody>
              {audience.map((segment) => (
                <TR key={segment.segment}>
                  <TD className="pl-5 font-medium">{segment.segment}</TD>
                  <TD className="text-right font-mono text-[12px] text-ink-muted">
                    {formatCompactNumber(segment.impressions)}
                  </TD>
                  <TD className="text-right font-mono text-[12px] text-ink-muted">{segment.clicks.toLocaleString("zh-CN")}</TD>
                  <TD className="text-right font-mono">
                    <span className={segment.ctrIndex >= 1 ? "text-tone-good" : "text-ink-muted"}>
                      {formatPercent(segment.ctr)}
                    </span>
                  </TD>
                  <TD className="text-right font-mono">
                    <span className={segment.cvrIndex >= 1 ? "text-tone-good" : "text-tone-warn"}>
                      {formatPercent(segment.cvr)}
                    </span>
                  </TD>
                  <TD className="text-right font-mono text-[12px] text-ink-muted">{formatCurrency(segment.cpc, { digits: 2 })}</TD>
                  <TD className="text-right font-mono text-[12px] text-ink-muted">{formatCurrency(segment.cpa, { digits: 2 })}</TD>
                  <TD className="text-right font-mono font-semibold">{segment.roas.toFixed(2)}</TD>
                  <TD className="pr-5">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-right font-mono text-[11px] text-ink-muted">
                        {formatPercent(segment.share, 1)}
                      </span>
                      <Progress value={segment.share * 100 * 2} tone="moss" className="w-24" />
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
        <p className="text-[11px] leading-relaxed text-ink-soft">
          注意：18–24 岁女性的 CTR 高于 25–30 岁女性，但 CVR 更低 —— 这是本 Demo 里最重要的一个人群结论，AI
          顾问与周报都会引用它。
        </p>
      </Section>

      <Section title="AI 用户分析" titleEn="AI Audience Analysis" description="结构化输出：人群总结、四类机会卡片、推荐广告角度与结构化洞察。">
        <AudienceWorkbench />
      </Section>
    </div>
  );
}
```

## `src/app/(workspace)/brand/page.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { getBusinessContext } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BrandPage() {
  const context = await getBusinessContext();
  const { brand, product, personas, competitors } = context;
  const self = competitors.find((competitor) => competitor.isSelf);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Brand Center"
        title="品牌中心"
        titleEn="Brand Center"
        description="品牌、产品与人群定义是全部 AI 分析的上下文来源。修改这里的字段，AI 输出会随之变化。"
        meta={
          <>
            <Badge tone="moss">{brand.name}</Badge>
            <Badge tone="neutral">{brand.nameEn}</Badge>
            <DemoTag />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>品牌定位</CardTitle>
              <CardDescription>Brand Positioning</CardDescription>
            </div>
            <Badge tone="moss">{brand.positioning.split("·")[0].trim()}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[13px] leading-relaxed text-ink-muted">{brand.description}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Info label="品牌名称" value={brand.name} />
              <Info label="英文 / 品牌名" value={brand.nameEn} />
              <Info label="品牌定位" value={brand.positioning} />
              <Info label="价格区间" value={brand.priceRange} />
              <Info label="目标用户" value={brand.targetAudience} className="sm:col-span-2" />
            </dl>
            <div>
              <p className="label-text mb-2">核心渠道</p>
              <div className="flex flex-wrap gap-1.5">
                {brand.channels.map((channel) => (
                  <Badge key={channel} tone="clay">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="label-text mb-2">品牌关键词</p>
              <div className="flex flex-wrap gap-1.5">
                {brand.keywords.map((keyword) => (
                  <Badge key={keyword} tone="moss">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>核心产品</CardTitle>
              <CardDescription>Hero Product</CardDescription>
            </div>
            <Badge tone="neutral">{product.category}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="surface-muted px-4 py-3.5">
              <p className="text-[14px] font-semibold">{product.name}</p>
              <p className="mt-1 text-[12px] text-ink-muted">{product.positioning}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="data-value text-[20px] font-semibold">{formatCurrency(product.price)}</span>
                <Badge tone="neutral">{product.volume}</Badge>
              </div>
            </div>
            <ListBlock title="核心卖点" items={product.keyBenefits} tone="moss" />
            <ListBlock title="卖点解释（可用于内容与素材）" items={product.sellingPoints} />
            <ListBlock title="使用场景" items={product.usageScenario} />
            <ListBlock title="合规与可信度说明" items={product.credibility} tone="warn" />
          </CardContent>
        </Card>
      </div>

      <Section title="品牌人群" titleEn="Audience Definition" description="3 个核心 Persona 定义了内容与素材的语料方向。">
        <div className="grid gap-3.5 md:grid-cols-3">
          {personas.map((persona) => (
            <Card key={persona.id}>
              <CardHeader>
                <div>
                  <CardTitle>{persona.name}</CardTitle>
                  <CardDescription>
                    {persona.ageBand} 岁 · {persona.occupation}
                  </CardDescription>
                </div>
                <Badge tone="moss">{(persona.share * 100).toFixed(0)}%</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-[12px] italic leading-relaxed text-ink-muted">「{persona.quote}」</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {persona.contentPreferences.slice(0, 3).map((item) => (
                    <Badge key={item} tone="neutral">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="品牌资产与竞品坐标" titleEn="Brand Assets">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>竞品坐标（自评）</CardTitle>
                <CardDescription>价格带与专业度自评，用于驱动市场分析。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Info label="价格带" value={self?.priceTier ?? "—"} />
              <Info label="专业度（0–100）" value={String(self?.professional ?? 0)} />
              <Info label="主要优势" value={self?.strength ?? "—"} />
              <Info label="主要弱点" value={self?.weakness ?? "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>品牌资产清单</CardTitle>
                <CardDescription>面向增长运营的品牌资产盘点（Demo）。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ListBlock
                title="已有资产"
                items={[
                  "产品卖点与成分说明（可公开信息，无功效承诺）",
                  "3 个核心 Persona 与内容偏好定义",
                  "5 个 Campaign 与 10 条素材的历史结构",
                  "30 天投放数据与分人群表现切片",
                ]}
              />
              <ListBlock
                title="需要补齐的资产"
                items={[
                  "第三方检测或临床数据（当前无，因此不做功效型对比）",
                  "真实用户长期使用记录（30 天以上）",
                  "价格与单次成本的可视化解释物料",
                  "品牌专业度背书（皮肤科/专业人士共创内容）",
                ]}
                tone="warn"
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      <p className="text-[11px] leading-relaxed text-ink-soft">
        MORI 森屿 为虚拟品牌，所有数据均为 Demo / 模拟业务数据，不冒充真实公司，也不代表任何真实商业成绩。
      </p>
    </div>
  );
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="label-text">{label}</dt>
      <dd className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{value}</dd>
    </div>
  );
}

function ListBlock({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "moss" | "warn";
}) {
  const dot = tone === "moss" ? "bg-moss" : tone === "warn" ? "bg-tone-warn" : "bg-ink-soft";
  return (
    <div>
      <p className="label-text mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink-muted">
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## `src/app/(workspace)/campaign/page.tsx`

```tsx
import { Database, UploadCloud } from "lucide-react";
import Link from "next/link";

import { CampaignAnalysisPanel } from "@/components/campaign/campaign-analysis";
import { CsvUploader } from "@/components/campaign/csv-uploader";
import { CreativeTable } from "@/components/dashboard/creative-table";
import { TrendChart } from "@/components/charts/trend-chart";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getBusinessContext, getCampaignRecords, getDatasetOptions } from "@/lib/data";
import { formatCompactNumber, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ datasetId?: string }>;
}) {
  const params = await searchParams;
  const datasetId = params.datasetId ?? null;

  const [context, campaigns, datasets] = await Promise.all([
    getBusinessContext({ datasetId }),
    getCampaignRecords(),
    getDatasetOptions(),
  ]);

  const { totals, daily, campaigns: campaignPerformance, comparison } = context;
  const activeDataset = datasets.find((dataset) => dataset.id === datasetId);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Campaign Analytics"
        title="广告投放分析"
        titleEn="Campaign Analytics"
        description="上传投放 CSV，系统自动清洗数据、计算 CTR / CPC / CVR / CPA / ROAS，识别高效与低效素材，并由 Performance Analyst Agent 给出诊断与预算建议。"
        meta={
          <>
            <Badge tone={datasetId ? "clay" : "moss"}>
              当前数据集：{activeDataset?.name ?? "Demo 数据集（30 天）"}
            </Badge>
            <Badge tone="neutral">{context.dataSource.rows} 行记录</Badge>
            <Badge tone="neutral">周期 {context.period.label}</Badge>
            <DemoTag />
          </>
        }
        actions={
          <Link href="#upload" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <UploadCloud className="h-3.5 w-3.5" /> 上传新数据
          </Link>
        }
      />

      <Section title="数据集" titleEn="Datasets" description="切换数据集会重新计算全页指标；上传的数据会保存到数据库。">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/campaign"
            className={
              datasetId
                ? buttonVariants({ variant: "outline", size: "sm" })
                : buttonVariants({ variant: "primary", size: "sm" })
            }
          >
            <Database className="h-3.5 w-3.5" /> Demo 数据集（30 天）
          </Link>
          {datasets.map((dataset) => (
            <Link
              key={dataset.id}
              href={`/campaign?datasetId=${dataset.id}`}
              className={
                datasetId === dataset.id
                  ? buttonVariants({ variant: "primary", size: "sm" })
                  : buttonVariants({ variant: "outline", size: "sm" })
              }
            >
              {dataset.name}
            </Link>
          ))}
          {datasets.length === 0 ? (
            <span className="text-[11.5px] text-ink-soft">还没有上传数据集 —— 上传 CSV 后会出现在这里。</span>
          ) : null}
        </div>
      </Section>

      <Section title="关键指标（当前数据集）" titleEn="KPI Snapshot">
        <div className="grid gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "花费", value: formatCurrency(totals.spend) },
            { label: "曝光", value: formatCompactNumber(totals.impressions) },
            { label: "点击", value: formatNumber(totals.clicks) },
            { label: "CTR", value: formatPercent(totals.ctr) },
            { label: "CPC", value: formatCurrency(totals.cpc, { digits: 2 }) },
            { label: "ROAS", value: totals.roas.toFixed(2) },
          ].map((item) => (
            <div key={item.label} className="surface p-4">
              <p className="text-[11px] text-ink-soft">{item.label}</p>
              <p className="data-value mt-1.5 text-[18px] font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="趋势与结构"
        titleEn="Trend & Structure"
        description="每日花费与 ROAS：可以直接看到最近 7 天效率下滑的过程。"
      >
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>每日花费 / ROAS / CVR</CardTitle>
                <CardDescription>数据来源：当前数据集的 Metric 表。</CardDescription>
              </div>
              <Badge tone={(comparison?.deltas.roas ?? 0) < 0 ? "bad" : "good"}>
                ROAS 环比 {comparison ? comparison.deltas.roas.toFixed(1) : "0.0"}%
              </Badge>
            </CardHeader>
            <CardContent>
              <TrendChart
                data={daily.map((point) => ({
                  date: point.date,
                  spend: Math.round(point.spend),
                  roas: Number(point.roas.toFixed(3)),
                  cvr: Number((point.cvr * 100).toFixed(3)),
                }))}
                height={250}
                series={[
                  { key: "spend", label: "花费", kind: "bar", axis: "left", colorKey: "moss", unit: "currency" },
                  { key: "roas", label: "ROAS", kind: "line", axis: "right", colorKey: "clay", unit: "ratio", digits: 2 },
                  { key: "cvr", label: "CVR %", kind: "line", axis: "right", colorKey: "info", unit: "percent" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>广告计划表现</CardTitle>
                <CardDescription>按 Campaign 聚合（{campaigns.length} 个计划）。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaignPerformance.map((item) => (
                <div key={item.name} className="border-b border-ink-line pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12.5px] font-medium">{item.name}</p>
                    <span className="font-mono text-[12px]">ROAS {item.roas.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    花费 {formatCurrency(item.spend)} · CTR {formatPercent(item.ctr)} · CPA{" "}
                    {formatCurrency(item.cpa, { digits: 2 })} · 转化 {formatNumber(item.conversions)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="素材效率明细" titleEn="Creative Efficiency" description="按 ROAS 排序，含 CTR 指数与诊断标签。">
        <CreativeTable items={context.creatives} benchmarks={totals} />
      </Section>

      <Section
        title="投放计划清单"
        titleEn="Campaign List"
        description="Demo 数据集对应的 5 个广告计划（Campaign 表）。"
      >
        <div className="surface overflow-hidden p-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="pl-5">计划名称</TH>
                <TH>渠道</TH>
                <TH>目标</TH>
                <TH className="text-right">预算</TH>
                <TH>状态</TH>
                <TH className="pr-5">说明</TH>
              </TR>
            </THead>
            <TBody>
              {campaigns.map((campaign) => (
                <TR key={campaign.id}>
                  <TD className="pl-5 font-medium">{campaign.name}</TD>
                  <TD>
                    <Badge tone="neutral">{campaign.platform}</Badge>
                  </TD>
                  <TD className="text-ink-muted">{campaign.objective}</TD>
                  <TD className="text-right font-mono">{formatCurrency(campaign.budget)}</TD>
                  <TD>
                    <Badge tone={campaign.status === "running" ? "good" : "neutral"}>{campaign.status}</Badge>
                  </TD>
                  <TD className="max-w-[320px] whitespace-normal text-[11.5px] text-ink-muted pr-5">{campaign.note}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Section>

      <Section
        id="upload"
        title="上传投放数据"
        titleEn="CSV Upload"
        description="支持拖拽、选择文件或直接粘贴。系统会校验表头、日期与数字字段，并在计算指标前给出数据质量问题清单。"
      >
        <CsvUploader />
      </Section>

      <Section
        title="AI 投放分析"
        titleEn="AI Campaign Analysis"
        description="输出结构：Diagnosis / Main Reason / Hypothesis / Winners / Losers / Budget Moves / Experiments + 四类结构化结论。"
      >
        <CampaignAnalysisPanel datasetId={datasetId} />
      </Section>
    </div>
  );
}
```

## `src/app/(workspace)/content/page.tsx`

```tsx
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
```

## `src/app/(workspace)/creative/page.tsx`

```tsx
import { CreativeLab } from "@/components/creative/creative-lab";
import { CreativeTable } from "@/components/dashboard/creative-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { getBusinessContext, getCreativeRecords } from "@/lib/data";
import { formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CreativePage() {
  const [context, creatives] = await Promise.all([getBusinessContext(), getCreativeRecords()]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Creative Lab"
        title="广告素材中心"
        titleEn="Creative Lab"
        description="输入平台、目标、人群与主题，AI 生成 5 个来自不同角度族的素材方向（场景痛点 / 肤感 / 价格 / 信任记录 / 专业解释），并给出测试优先级。"
        meta={
          <>
            <Badge tone="moss">在投素材 {creatives.length} 条</Badge>
            <Badge tone="neutral">目标基准：CTR / ROAS</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="生成素材方向" titleEn="Generate Creatives" description="每个方向都包含 Hook、时间轴脚本、CTA、目标人群与优先级理由。">
        <CreativeLab />
      </Section>

      <Section
        title="在投素材与历史表现"
        titleEn="Live Creatives"
        description="左侧为目标基准（Creative 表），右侧为实际表现（Metric 表计算），两者对比即为优化空间。"
      >
        <Card className="mb-4">
          <CardHeader>
            <div>
              <CardTitle>素材目标基准</CardTitle>
              <CardDescription>Demo 数据集设计目标：4 条被引用的基准素材严格对齐产品需求。</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {creatives.map((creative) => (
                <div key={creative.id} className="surface-muted px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12.5px] font-medium">{creative.name}</p>
                    <Badge tone="neutral">{creative.priority}</Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    {creative.platform} · {creative.angle} · 状态 {creative.status}
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">{creative.hook}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <Badge tone="moss">目标 CTR {formatPercent(creative.targetCtr)}</Badge>
                    <Badge tone="clay">目标 ROAS {creative.targetRoas.toFixed(2)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <CreativeTable items={context.creatives} benchmarks={context.totals} showIndex />
      </Section>
    </div>
  );
}
```

## `src/app/(workspace)/dashboard/page.tsx`

```tsx
import { BarChart3, LineChart, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

import { SignalBlocks } from "@/components/ai/signal-blocks";
import { BreakdownChart } from "@/components/charts/breakdown-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { CreativeTable } from "@/components/dashboard/creative-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { getBusinessContext, getInsightHistory } from "@/lib/data";
import { KPI_DEFINITIONS, type MetricKey } from "@/lib/metrics";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [context, insightHistory] = await Promise.all([getBusinessContext(), getInsightHistory(3)]);

  const { totals, daily, platforms, creatives, comparison, signals, brand, product, audience } = context;

  const trendData = daily.map((point) => ({
    date: point.date,
    spend: Math.round(point.spend),
    roas: Number(point.roas.toFixed(3)),
    ctr: Number((point.ctr * 100).toFixed(3)),
    cvr: Number((point.cvr * 100).toFixed(3)),
    benchmarkCtr: Number((totals.ctr * 100).toFixed(3)),
    conversions: point.conversions,
    clicks: point.clicks,
  }));

  const roasBenchmark = Number(totals.roas.toFixed(3));
  const ctrBenchmark = Number((totals.ctr * 100).toFixed(3));

  const sparklineFor = (key: MetricKey) => daily.map((point) => point[key]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="MORI AI Growth OS"
        titleEn="AI-Powered Growth Intelligence for Modern Brands"
        description="让 AI 帮品牌完成从用户洞察到增长优化的完整闭环。所有 KPI 均由 SQLite 中的投放记录实时计算，AI 洞察基于计算结果生成。"
        meta={
          <>
            <Badge tone="moss">品牌：{brand.name}</Badge>
            <Badge tone="neutral">产品：{product.name}</Badge>
            <Badge tone="neutral">周期：{context.period.label}</Badge>
            <Badge tone="neutral">数据：{context.dataSource.rows} 行</Badge>
            <DemoTag />
          </>
        }
        actions={
          <>
            <Link href="/advisor" className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
              <Sparkles className="h-3.5 w-3.5" /> 问 AI 增长顾问
            </Link>
            <Link href="/campaign" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <BarChart3 className="h-3.5 w-3.5" /> 上传投放数据
            </Link>
          </>
        }
      />

      <Section
        title="核心指标"
        titleEn="Key Metrics"
        description="环比口径：最近 7 天 vs 前 7 天（Demo 数据窗口）。箭头颜色代表指标方向是否对业务有利。"
      >
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_DEFINITIONS.map((definition) => (
            <KpiCard
              key={definition.key}
              metricKey={definition.key}
              label={definition.label}
              labelEn={definition.labelEn}
              value={totals[definition.key]}
              delta={comparison?.deltas[definition.key]}
              higherIsBetter={definition.higherIsBetter}
              hint={definition.hint}
              sparkline={sparklineFor(definition.key)}
            />
          ))}
        </div>
      </Section>

      <Section
        title="趋势与结构"
        titleEn="Trends"
        description="折线图 = 每日真实计算值（不含人工修饰）。ROAS 基准虚线为账户 30 天均值。"
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>广告花费趋势（过去 30 天）</CardTitle>
                <CardDescription>柱 = 每日花费，线 = 每日 ROAS（右轴）。</CardDescription>
              </div>
              <Badge tone={totals.roas >= 3 ? "good" : "warn"}>均值 ROAS {totals.roas.toFixed(2)}</Badge>
            </CardHeader>
            <CardContent>
              <TrendChart
                data={trendData}
                leftAxisLabel="花费 ¥"
                rightAxisLabel="ROAS"
                series={[
                  { key: "spend", label: "花费", kind: "bar", axis: "left", colorKey: "moss", unit: "currency" },
                  { key: "roas", label: "ROAS", kind: "line", axis: "right", colorKey: "clay", digits: 2, unit: "ratio" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>渠道表现</CardTitle>
                <CardDescription>按渠道计算的 ROAS（柱右侧为转化量）。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <BreakdownChart
                data={platforms.map((item) => ({
                  name: item.name,
                  value: Number(item.roas.toFixed(2)),
                  secondary: item.conversions,
                  highlight: item.roas === Math.max(...platforms.map((p) => p.roas)),
                }))}
                height={200}
              />
              <div className="space-y-2 border-t border-ink-line pt-3">
                {platforms.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11.5px]">
                    <span className="text-ink-muted">{item.name}</span>
                    <span className="font-mono text-ink-muted">
                      CPC {formatCurrency(item.cpc, { digits: 2 })} · CVR {formatPercent(item.cvr)} · 转化占比{" "}
                      {formatPercent(item.share, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>CTR / CVR 趋势</CardTitle>
                <CardDescription>点击效率与转化效率分开看，才能定位问题在哪一环。</CardDescription>
              </div>
              <div className="hidden gap-2 sm:flex">
                <Badge tone="info">CTR 均值 {formatPercent(totals.ctr)}</Badge>
                <Badge tone="moss">CVR 均值 {formatPercent(totals.cvr)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TrendChart
                data={trendData}
                height={220}
                series={[
                  { key: "ctr", label: "CTR %", kind: "line", axis: "left", colorKey: "moss", unit: "percent", digits: 2 },
                  { key: "cvr", label: "CVR %", kind: "line", axis: "left", colorKey: "info", unit: "percent", digits: 2 },
                  {
                    key: "benchmarkCtr",
                    label: "CTR 均值",
                    kind: "line",
                    axis: "left",
                    colorKey: "neutral",
                    unit: "percent",
                    digits: 2,
                  },
                ]}
                rightAxisLabel="%"
              />
              <p className="text-[11px] leading-relaxed text-ink-soft">
                提示：最近 7 天 CTR 基本持平（{comparison ? comparison.deltas.ctr.toFixed(1) : "0.0"}%），而 CVR 变化{" "}
                {comparison ? comparison.deltas.cvr.toFixed(1) : "0.0"}%，说明问题更可能出在承接环节。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>分人群效率</CardTitle>
                <CardDescription>分人群 CTR / CVR 对比（Demo 人群口径）。</CardDescription>
              </div>
              <Badge tone="neutral">{audience.length} 个人群</Badge>
            </CardHeader>
            <CardContent>
              {audience.length === 0 ? (
                <p className="text-[12px] text-ink-muted">当前数据集没有分人群指标。</p>
              ) : (
                <ul className="space-y-3">
                  {audience.map((segment) => (
                    <li key={segment.segment} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-medium">{segment.segment}</span>
                        <span className="font-mono text-ink-muted">
                          CTR {formatPercent(segment.ctr)} · CVR {formatPercent(segment.cvr)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-line/70">
                        <div
                          className="h-full rounded-full bg-moss"
                          style={{ width: `${Math.min(100, (segment.ctr / Math.max(...audience.map((s) => s.ctr))) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        title="AI 增长洞察"
        titleEn="AI Insights"
        description="以下结论由「本次数据的真实计算结果 + 结构化 AI 分析」生成，每条结论都带有可核对的证据字段。"
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={ctrBenchmark === 0 ? "neutral" : "moss"}>
              CTR 基准 {ctrBenchmark.toFixed(2)}%
            </Badge>
            <Badge tone="neutral">ROAS 基准 {roasBenchmark.toFixed(2)}</Badge>
          </div>
        }
      >
        <SignalBlocks bundle={signals} columns={2} />
      </Section>

      <Section title="素材表现排行榜" titleEn="Creative Ranking" description="按 ROAS 排序；CTR 指数 = 素材 CTR / 账户均值 CTR。">
        <CreativeTable items={creatives} benchmarks={totals} />
      </Section>

      <Section title="下一步建议" titleEn="Recommended Actions" description="按优先级排序的行动项，可直接进入对应模块继续操作。">
        <div className="grid gap-3.5 md:grid-cols-3">
          {[
            {
              title: "定位低效原因",
              body: `进入投放分析，用 AI 诊断“为什么某些素材 ROAS 低”，并拿到预算调整建议。`,
              href: "/campaign",
              label: "投放分析",
              icon: TrendingUp,
            },
            {
              title: "生成下一轮内容",
              body: `针对“23 岁熬夜女性”生成 5 个内容方向与 15 秒脚本，直接进入测试。`,
              href: "/content",
              label: "内容策划",
              icon: LineChart,
            },
            {
              title: "设计实验验证",
              body: `把假设变成 A/B 实验：真实使用场景 + 用户评价 vs 现有素材，主指标 CVR。`,
              href: "/experiments",
              label: "实验中心",
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/12 text-moss-strong">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[14px] font-semibold">{item.title}</p>
                  <p className="prose-copy">{item.body}</p>
                </div>
                <Link
                  href={item.href}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 inline-flex w-fit")}
                >
                  打开{item.label} →
                </Link>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section
        title="AI 分析历史"
        titleEn="Analysis Log"
        description="系统会把每次 AI 分析结果写入数据库（Insight 表），便于复盘与对比。"
      >
        {insightHistory.length === 0 ? (
          <p className="text-[12px] text-ink-muted">暂无分析记录。</p>
        ) : (
          <div className="surface divide-y divide-ink-line p-0">
            {insightHistory.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-[13px] font-medium">{item.title}</p>
                  <p className="text-[11.5px] text-ink-muted">{item.evidence}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{item.scope}</Badge>
                  <Badge tone={item.mode === "ai" ? "moss" : "neutral"}>{item.mode}</Badge>
                  <span className="font-mono text-[11px] text-ink-soft">{item.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <p className="text-[11px] leading-relaxed text-ink-soft">
        全部数字来自本地 SQLite 数据库计算（{formatNumber(totals.impressions)} 次曝光 / {formatNumber(totals.clicks)} 次点击 /{" "}
        {formatNumber(totals.conversions)} 次转化）。Demo / 模拟业务数据，不代表真实市场表现。
      </p>
    </div>
  );
}
```

## `src/app/(workspace)/evaluation/page.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Progress, ScoreBar } from "@/components/ui/feedback";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EvaluationPage() {
  const records = await prisma.evaluationRecord.findMany({ orderBy: { createdAt: "asc" } });

  const average = (key: "completeness" | "relevance" | "actionability" | "accuracy" | "overall") =>
    records.length === 0 ? 0 : records.reduce((acc, row) => acc + row[key], 0) / records.length;

  const overallAverage = average("overall");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Evaluation"
        title="AI 输出质量评估"
        titleEn="Evaluation"
        description="对每个 Agent 的输出做四个维度评分：Completeness（完整性）、Relevance（相关性）、Actionability（可执行性）、Accuracy（与数据一致性）。"
        meta={
          <>
            <Badge tone="moss">评估记录 {records.length} 条</Badge>
            <Badge tone="neutral">平均分 {overallAverage.toFixed(1)}</Badge>
            <DemoTag />
          </>
        }
      />

      <Alert tone="warning" title="重要说明">
        这是 Demo Evaluation：评分基于本项目的方法论与模拟数据人工设定，用于演示“如何评估 AI 输出质量”，
        <strong>不代表真实生产环境中的准确率或商业效果</strong>。
      </Alert>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>维度平均分</CardTitle>
              <CardDescription>评分区间 0–100。</CardDescription>
            </div>
            <Badge tone={overallAverage >= 85 ? "good" : "warn"}>Overall {overallAverage.toFixed(1)}</Badge>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <ScoreBar label="Completeness 完整性" value={Number(average("completeness").toFixed(1))} />
            <ScoreBar label="Relevance 相关性" value={Number(average("relevance").toFixed(1))} />
            <ScoreBar label="Actionability 可执行性" value={Number(average("actionability").toFixed(1))} />
            <ScoreBar label="Accuracy 与数据一致性" value={Number(average("accuracy").toFixed(1))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>评估方法</CardTitle>
              <CardDescription>每个维度检查什么。</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-[12px] leading-relaxed text-ink-muted">
            <p>
              <span className="font-medium text-ink">Completeness</span>：是否覆盖任务要求的全部字段（例如投放分析必须包含诊断、原因、假设、素材结论、预算建议与实验）。
            </p>
            <p>
              <span className="font-medium text-ink">Relevance</span>：结论是否与目标人群、渠道与主题相关，而不是通用营销套话。
            </p>
            <p>
              <span className="font-medium text-ink">Actionability</span>：建议是否能直接执行（谁、做什么、看什么指标、多久复盘）。
            </p>
            <p>
              <span className="font-medium text-ink">Accuracy</span>：输出中的数字是否与数据库计算结果一致（可用指标引擎复算核对）。
            </p>
            <p className="text-ink-soft">
              自动化部分：JSON Schema 校验（结构合法性）与指标复算（数值一致性）由测试用例覆盖；语义质量部分为人工 Demo 评分。
            </p>
          </CardContent>
        </Card>
      </div>

      <Section title="任务评分明细" titleEn="Task Scores">
        <div className="surface overflow-hidden p-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="pl-5">任务</TH>
                <TH>Agent</TH>
                <TH className="text-right">完整性</TH>
                <TH className="text-right">相关性</TH>
                <TH className="text-right">可执行性</TH>
                <TH className="text-right">准确性</TH>
                <TH className="text-right">Overall</TH>
                <TH className="pr-5">评估说明</TH>
              </TR>
            </THead>
            <TBody>
              {records.map((record) => (
                <TR key={record.id}>
                  <TD className="pl-5 font-medium">{record.task}</TD>
                  <TD>
                    <Badge tone="neutral">{record.agent}</Badge>
                  </TD>
                  <TD className="text-right font-mono">{record.completeness}</TD>
                  <TD className="text-right font-mono">{record.relevance}</TD>
                  <TD className="text-right font-mono">{record.actionability}</TD>
                  <TD className="text-right font-mono">{record.accuracy}</TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono font-semibold">{record.overall}</span>
                      <Progress
                        value={record.overall}
                        tone={record.overall >= 88 ? "good" : record.overall >= 80 ? "moss" : "warn"}
                        className="w-16"
                      />
                    </div>
                  </TD>
                  <TD className="max-w-[360px] whitespace-normal text-[11.5px] leading-relaxed text-ink-muted pr-5">
                    {record.notes}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Section>

      <Section title="已知局限" titleEn="Limitations" description="主动说明边界，比夸大能力更可信。">
        <div className="grid gap-3.5 md:grid-cols-3">
          {[
            {
              title: "没有真实市场数据",
              body: "竞品、用户画像与投放数据都是模拟数据，结论只能验证工作流是否顺畅，不能验证真实市场效果。",
            },
            {
              title: "评分是人工 Demo 评分",
              body: "目前没有引入独立评估模型或人工标注集，Schema 合法性由测试覆盖，语义质量仍以人工评分为主。",
            },
            {
              title: "因果推断有限",
              body: "A/B 检验只覆盖素材层面的比例指标；预算、季节、促销等外部变量没有纳入模型。",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent>
                <p className="text-[13px] font-medium">{item.title}</p>
                <p className="prose-copy mt-1.5">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
```

## `src/app/(workspace)/experiments/page.tsx`

```tsx
import { FlaskConical } from "lucide-react";

import { ExperimentLab } from "@/components/experiments/experiment-lab";
import { VariantChart } from "@/components/charts/variant-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { Progress } from "@/components/ui/feedback";
import { evaluateExperiment, experimentMetricTable, type VariantMetrics } from "@/lib/experiments";
import { getBusinessContext, getExperimentList } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExperimentsPage() {
  const [context, experiments] = await Promise.all([getBusinessContext(), getExperimentList()]);
  const creativeNames = context.creatives.map((creative) => creative.name);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Experiment Lab"
        title="实验中心"
        titleEn="Experiment Lab"
        description="把增长假设变成可验证的模拟实验：选择两条素材（数据来自 Demo 数据集）作为 A / B 变体，系统用双比例 z 检验判断差异是否显著，并给出「继续测试 / 保留哪个变体」的建议。所有结论均为模拟数据推演，不代表真实投放。"
        meta={
          <>
            <Badge tone="moss">实验 {experiments.length} 个</Badge>
            <Badge tone="neutral">统计方法：two-proportion z-test</Badge>
            <Badge tone="neutral">主指标：CTR / CVR / CPA / ROAS</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="新建实验" titleEn="Create Experiment">
        <ExperimentLab creativeNames={creativeNames} />
      </Section>

      <Section title="实验列表" titleEn="Experiments" description="包含 Demo 预置实验与你在本页面创建的实验。">
        <div className="space-y-4">
          {experiments.map((experiment) => {
            const [a, b] = experiment.variants;
            const evaluation =
              a && b
                ? evaluateExperiment(
                    toVariantMetrics(a),
                    toVariantMetrics(b),
                    experiment.primaryMetric,
                  )
                : null;

            return (
              <Card key={experiment.id}>
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-moss-strong" />
                      {experiment.name}
                    </CardTitle>
                    <CardDescription>{experiment.hypothesis}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={experiment.status === "completed" ? "neutral" : "moss"}>
                      {experiment.status === "completed" ? "模拟实验 · 已完成推演" : "模拟实验 · 推演中"}
                    </Badge>
                    <Badge tone="neutral">主指标 {experiment.primaryMetric.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1.1fr]">
                    {experiment.variants.map((variant) => (
                      <div key={variant.id} className="surface-muted px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-semibold">
                            {variant.label} · {variant.name}
                          </p>
                          {variant.isWinner ? (
                            <Badge tone="good">建议保留</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{variant.description}</p>
                        <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-[11px] text-ink-muted">
                          <span>曝光 {variant.impressions.toLocaleString("zh-CN")}</span>
                          <span>点击 {variant.clicks.toLocaleString("zh-CN")}</span>
                          <span>花费 {formatCurrency(variant.spend)}</span>
                          <span>转化 {variant.conversions}</span>
                        </div>
                      </div>
                    ))}
                    {evaluation ? <VariantChart data={experimentMetricTable(evaluation)} height={180} /> : null}
                  </div>

                  {evaluation ? (
                    <div className="grid gap-3 md:grid-cols-[1fr_1.2fr]">
                      <div className="surface-muted px-4 py-3">
                        <p className="label-text mb-2">统计检验</p>
                        {evaluation.test ? (
                          <div className="space-y-2 text-[11.5px] text-ink-muted">
                            <p>
                              z = <span className="font-mono">{evaluation.test.zScore.toFixed(3)}</span> · p ={" "}
                              <span className="font-mono">{evaluation.test.pValue.toFixed(4)}</span>
                            </p>
                            <Progress
                              value={evaluation.test.confidence}
                              tone={evaluation.test.significant ? "good" : "warn"}
                            />
                            <p>
                              置信度 {evaluation.test.confidence.toFixed(1)}% ·{" "}
                              {evaluation.test.significant ? "差异显著" : "未达显著"}
                            </p>
                            <p className="text-ink-soft">
                              A {formatPercent(evaluation.metrics.a.cvr)} → B{" "}
                              {formatPercent(evaluation.metrics.b.cvr)}（CVR 口径）
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11.5px] leading-relaxed text-ink-muted">
                            该主指标为比率型（CPA / ROAS），使用提升幅度判断；建议再用 CVR 做交叉验证。
                          </p>
                        )}
                      </div>
                      <div className="surface-muted px-4 py-3">
                        <p className="label-text mb-2">AI 实验解读（基于模拟数据推演）</p>
                        <p className="text-[12.5px] leading-relaxed text-ink-muted">
                          {evaluation.recommendation || experiment.aiRecommendation}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12px] text-ink-muted">该实验缺少完整的 A / B 数据。</p>
                  )}

                  <p className="text-[11.5px] text-ink-soft">{experiment.summary}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function toVariantMetrics(variant: {
  label: string;
  name: string;
  description: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}): VariantMetrics {
  return {
    label: variant.label,
    name: variant.name,
    description: variant.description,
    impressions: variant.impressions,
    clicks: variant.clicks,
    conversions: variant.conversions,
    spend: variant.spend,
    revenue: variant.revenue,
  };
}
```

## `src/app/(workspace)/layout.tsx`

```tsx
import { AppShell } from "@/components/layout/app-shell";
import { agentStatusSummary } from "@/lib/ai/runner";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const status = agentStatusSummary();

  return (
    <AppShell
      aiStatus={{
        mode: status.mode,
        model: status.model,
        provider: status.provider,
        reason: status.reason,
      }}
      datasetLabel="Demo 数据集：MORI 晚间修护精华 · 30 天模拟投放数据"
    >
      {children}
    </AppShell>
  );
}
```

## `src/app/(workspace)/market/page.tsx`

```tsx
import { MatrixChart } from "@/components/charts/matrix-chart";
import { MarketWorkbench } from "@/components/market/market-workbench";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { getBusinessContext } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const context = await getBusinessContext();
  const { competitors } = context;
  const others = competitors.filter((competitor) => !competitor.isSelf);

  const themeMap = new Map<string, { count: number; competitors: string[] }>();
  others.forEach((competitor) => {
    competitor.contentThemes.forEach((theme) => {
      const entry = themeMap.get(theme) ?? { count: 0, competitors: [] };
      entry.count += 1;
      entry.competitors.push(competitor.name);
      themeMap.set(theme, entry);
    });
  });
  const themeFrequency = Array.from(themeMap.entries())
    .map(([theme, value]) => ({ theme, count: value.count, competitors: value.competitors }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Market Intelligence"
        title="市场与竞品"
        titleEn="Market Intelligence"
        description="4 个品牌（MORI + 3 个虚拟竞品）的价格 × 专业度定位、内容主题与广告主题对比。所有竞品均为虚拟品牌，不指向任何真实企业。"
        meta={
          <>
            <Badge tone="moss">虚拟品牌 {competitors.length} 个</Badge>
            <Badge tone="neutral">维度：价格 / 专业度 / 内容 / 渠道</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="竞品矩阵" titleEn="Positioning Matrix" description="X 轴：价格；Y 轴：品牌专业度（0–100 感知分）。">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>价格 × 专业度矩阵</CardTitle>
                <CardDescription>MORI 位于中低价位、专业度中位——机会与风险都在这里。</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <MatrixChart
                data={competitors.map((competitor) => ({
                  name: competitor.name,
                  price: competitor.price,
                  professional: competitor.professional,
                  isSelf: competitor.isSelf,
                  note: competitor.positioning,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>MORI 的竞争位置</CardTitle>
                <CardDescription>读数：越靠右越贵，越靠上越专业。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {competitors.map((competitor) => (
                <div key={competitor.id} className="flex items-center justify-between gap-3 border-b border-ink-line pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[13px] font-medium">
                      {competitor.name}
                      {competitor.isSelf ? <span className="ml-1.5 text-[11px] text-moss-strong">（本品牌）</span> : null}
                    </p>
                    <p className="text-[11px] text-ink-muted">{competitor.positioning}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[12.5px]">{formatCurrency(competitor.price)}</p>
                    <p className="font-mono text-[11px] text-ink-soft">专业度 {competitor.professional}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="竞品数据对比" titleEn="Competitor Data" description="价格、定位、用户、主要渠道、广告主题与强弱项。">
        <div className="surface overflow-hidden p-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH className="pl-5">品牌</TH>
                <TH>定位</TH>
                <TH className="text-right">价格</TH>
                <TH className="text-right">价格带</TH>
                <TH className="text-right">专业度</TH>
                <TH>目标用户</TH>
                <TH>主要渠道</TH>
                <TH>广告主题</TH>
                <TH className="pr-5">弱点</TH>
              </TR>
            </THead>
            <TBody>
              {competitors.map((competitor) => (
                <TR key={competitor.id} className={competitor.isSelf ? "bg-moss/6" : undefined}>
                  <TD className="pl-5 font-medium">
                    {competitor.name}
                    {competitor.isSelf ? <Badge tone="moss" className="ml-2">MORI</Badge> : null}
                  </TD>
                  <TD className="max-w-[180px] whitespace-normal text-[12px] text-ink-muted">{competitor.positioning}</TD>
                  <TD className="text-right font-mono">{formatCurrency(competitor.price)}</TD>
                  <TD className="text-right">
                    <Badge tone={competitor.price > 250 ? "info" : competitor.price < 120 ? "warn" : "neutral"}>
                      {competitor.priceTier}
                    </Badge>
                  </TD>
                  <TD className="text-right font-mono">{competitor.professional}</TD>
                  <TD className="max-w-[190px] whitespace-normal text-[12px] text-ink-muted">{competitor.audience}</TD>
                  <TD className="max-w-[160px] whitespace-normal text-[12px] text-ink-muted">
                    {competitor.mainChannels.join(" / ")}
                  </TD>
                  <TD className="max-w-[180px] whitespace-normal text-[12px] text-ink-muted">
                    {competitor.adThemes.join(" / ")}
                  </TD>
                  <TD className="max-w-[240px] whitespace-normal text-[12px] text-ink-muted pr-5">{competitor.weakness}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        {others.slice(0, 2).map((competitor) => (
          <Card key={competitor.id}>
            <CardHeader>
              <CardTitle>{competitor.name}</CardTitle>
              <Badge tone="clay">虚拟竞品</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-[12.5px] leading-relaxed">
              <p>
                <span className="label-text">优势</span>
                <br />
                <span className="text-ink-muted">{competitor.strength}</span>
              </p>
              <p>
                <span className="label-text">弱点</span>
                <br />
                <span className="text-ink-muted">{competitor.weakness}</span>
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {competitor.contentThemes.map((theme) => (
                  <Badge key={theme} tone="neutral">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Section
        title="AI 竞品分析"
        titleEn="AI Market Report"
        description="结构化输出：Insight（洞察）/ Opportunity（机会）/ Risk（风险）/ Recommendation（建议），并给出市场空白与定位建议。"
      >
        <MarketWorkbench themeFrequency={themeFrequency} />
      </Section>

      <p className="text-[11px] leading-relaxed text-ink-soft">
        说明：AURA LAB、NUVIA、LUMIÉ 均为本项目虚构的 Demo 竞品，用于演示竞品分析框架，不代表任何真实企业或真实市场数据。
      </p>
    </div>
  );
}
```

## `src/app/(workspace)/prompts/page.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Alert } from "@/components/ui/feedback";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { AGENT_LABELS, PROMPT_LIBRARY } from "@/lib/prompts";
import { prisma } from "@/lib/db";
import { zodToJsonSchema } from "@/lib/ai/json-schema";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const stored = await prisma.promptTemplate.findMany({ orderBy: { agent: "asc" } });
  const byAgent = new Map(stored.map((item) => [item.agent, item]));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Prompt Library"
        title="Prompt 管理"
        titleEn="Prompt Library"
        description="6 个专职 Agent + 1 个报告撰写 Agent，每个都有独立的 Prompt、版本号与 JSON Schema 输出契约。项目刻意不使用「一个大 Prompt」完成所有任务。"
        meta={
          <>
            <Badge tone="moss">Agent {PROMPT_LIBRARY.length} 个</Badge>
            <Badge tone="neutral">数据库记录 {stored.length} 条</Badge>
            <Badge tone="neutral">输出：Structured Outputs (JSON Schema)</Badge>
            <DemoTag />
          </>
        }
      />

      <Alert tone="info" title="为什么要拆分 Agent">
        每个 Agent 只负责一类判断（市场 / 用户 / 内容 / 素材 / 投放 / 增长）。这样每个 Prompt 的评估标准清晰、输出 Schema
        稳定、失败时可以单独回退，也方便在 Evaluation 页面分别打分。
      </Alert>

      <Section title="Agent 与 Prompt" titleEn="Agents" description="点击「查看 Prompt」展开完整系统提示词，可直接复制用于 AI 模式。">
        <div className="space-y-4">
          {PROMPT_LIBRARY.map((template, index) => {
            const dbRow = byAgent.get(template.agent);
            const schema = AGENT_SCHEMAS[template.agent];
            const jsonSchema = schema ? JSON.stringify(zodToJsonSchema(schema), null, 2) : "";
            const label = AGENT_LABELS[template.agent];

            return (
              <Card key={template.agent}>
                <CardHeader>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-moss/12 font-mono text-[12px] font-semibold text-moss-strong">
                        {index + 1}
                      </span>
                      <CardTitle>
                        {template.name} · {template.nameZh}
                      </CardTitle>
                      <Badge tone="moss">{dbRow?.version ?? template.version}</Badge>
                      <Badge tone="neutral">scope: {label?.scope ?? template.agent}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton value={dbRow?.body ?? template.body} label="复制 Prompt" />
                    <CopyButton value={jsonSchema} label="复制 Schema" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-soft">
                    <span className="font-mono">{schema ? "schema: " + template.outputSchema : "schema: n/a"}</span>
                    <span>·</span>
                    <span>{template.changelog}</span>
                  </div>

                  <details className="rounded-xl border border-ink-line bg-surface-muted/60">
                    <summary className="cursor-pointer px-4 py-2.5 text-[12.5px] font-medium">
                      查看 Prompt（{((dbRow?.body ?? template.body).length / 1000).toFixed(1)}k 字符）
                    </summary>
                    <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap px-4 pb-4 text-[11.5px] leading-relaxed text-ink-muted">
                      {dbRow?.body ?? template.body}
                    </pre>
                  </details>

                  <details className="rounded-xl border border-ink-line bg-surface-muted/60">
                    <summary className="cursor-pointer px-4 py-2.5 text-[12.5px] font-medium">
                      查看输出 JSON Schema（strict structured outputs）
                    </summary>
                    <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap px-4 pb-4 font-mono text-[11px] leading-relaxed text-ink-muted">
                      {jsonSchema}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title="版本策略" titleEn="Versioning" description="Prompt 变更必须记录版本与原因，避免“模型变差了”这类无法复盘的问题。">
        <div className="surface overflow-hidden p-0">
          <table className="w-full text-[12px]">
            <tbody className="divide-y divide-ink-line">
              {PROMPT_LIBRARY.map((template) => (
                <tr key={template.agent}>
                  <td className="px-5 py-3 font-medium">{template.name}</td>
                  <td className="px-3 py-3 font-mono text-ink-muted">{template.version}</td>
                  <td className="px-5 py-3 text-ink-muted">{template.changelog}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
```

## `src/app/(workspace)/reports/page.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { ReportStudio } from "@/components/reports/report-studio";
import { prisma } from "@/lib/db";
import { getBusinessContext } from "@/lib/data";
import { reportFromStoredPayload, type ReportMeta } from "@/lib/report";
import type { GrowthReport } from "@/lib/ai/schemas";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [context, reports] = await Promise.all([
    getBusinessContext(),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const latest = reports[0];
  let initial: { report: GrowthReport; meta: ReportMeta } | null = null;
  if (latest) {
    const parsed = JSON.parse(latest.payload) as { report: GrowthReport; meta: ReportMeta };
    const report = reportFromStoredPayload(JSON.stringify(parsed.report));
    if (report) initial = { report, meta: { ...parsed.meta, generatedAt: parsed.meta.generatedAt ?? latest.createdAt.toISOString() } };
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Growth Report"
        title="增长报告"
        titleEn="Growth Report"
        description="把一周的经营数据、人群表现、内容与投放结果整理成可以直接发给团队的增长周报，支持复制、下载 Markdown 与 PDF。"
        meta={
          <>
            <Badge tone="moss">历史报告 {reports.length} 份</Badge>
            <Badge tone="neutral">当前数据：{context.period.label}</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="生成报告" titleEn="Generate">
        <ReportStudio initial={initial} />
      </Section>

      <Section title="历史报告" titleEn="History" description="每次生成都会写入数据库（Report 表）。">
        {reports.length === 0 ? (
          <p className="text-[12px] text-ink-muted">暂无历史报告。</p>
        ) : (
          <div className="surface divide-y divide-ink-line p-0">
            {reports.map((report) => (
              <div key={report.id} className="flex flex-col gap-1.5 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[13px] font-medium">{report.title}</p>
                  <p className="text-[11px] text-ink-soft">
                    {report.periodStart.toISOString().slice(0, 10)} ~ {report.periodEnd.toISOString().slice(0, 10)} ·
                    生成于 {report.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </p>
                </div>
                <Badge tone={report.mode === "ai" ? "moss" : "neutral"}>{report.mode}</Badge>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
```

## `src/app/(workspace)/settings/page.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { DemoTag, PageHeader, Section } from "@/components/ui/page";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { agentStatusSummary } from "@/lib/ai/runner";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const status = agentStatusSummary();
  const [metrics, audienceMetrics, datasets, contents, experiments, reports] = await Promise.all([
    prisma.metric.count(),
    prisma.audienceMetric.count(),
    prisma.dataset.count(),
    prisma.contentItem.count(),
    prisma.experiment.count(),
    prisma.report.count(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="设置"
        titleEn="Settings"
        description="AI Provider、Demo Mode、API 状态、模型、主题与数据管理。所有配置项都不需要在代码里写死。"
        meta={
          <>
            <Badge tone={status.mode === "ai" ? "moss" : "neutral"}>
              {status.mode === "ai" ? "AI Mode" : "Demo Mode"}
            </Badge>
            <Badge tone="neutral">模型：{status.model}</Badge>
            <DemoTag />
          </>
        }
      />

      <Section title="配置" titleEn="Configuration">
        <SettingsPanel
          aiStatus={{
            mode: status.mode,
            providerId: status.providerId,
            provider: status.provider,
            baseUrl: status.baseUrl,
            model: status.model,
            demoMode: status.demoMode,
            apiKeyConfigured: status.apiKeyConfigured,
            keySource: status.keySource,
            supportsJsonSchema: status.supportsJsonSchema,
            requestShapes: status.requestShapes,
            reason: status.reason,
          }}
          counts={{ metrics, audienceMetrics, datasets, contents, experiments, reports }}
        />
      </Section>
    </div>
  );
}
```

## `src/app/api/advisor/ask/route.ts`

```ts
import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  question: z.string().min(2, "请输入完整问题").max(500),
  datasetId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const context = await getBusinessContext({ datasetId: parsed.data.datasetId ?? null });

    if (context.totals.impressions === 0) {
      return fail("EMPTY_DATASET", "当前数据集没有投放数据，AI 顾问无法给出基于数据的诊断。", 409);
    }

    const result = await runAgent("growth_advisor", {
      context,
      question: parsed.data.question,
    });

    await saveInsights("advisor", "growth_advisor", result.meta.mode, result.data);

    return ok(result.data, result.meta);
  } catch (error) {
    return serverError(error, "AI 顾问暂时无法回答，请稍后重试。");
  }
}
```

## `src/app/api/audience/analyze/route.ts`

```ts
import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
  focus: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const context = await getBusinessContext({ datasetId: parsed.data.datasetId ?? null });
    if (context.audience.length === 0) {
      return fail(
        "NO_AUDIENCE_DATA",
        "当前数据集缺少分人群指标（AudienceMetric），无法生成人群结论。请使用 Demo 数据集或补充人群维度数据。",
        409,
      );
    }

    const result = await runAgent("audience_analyst", {
      context,
      extraNotes: parsed.data.focus,
    });

    await saveInsights("audience", "audience_analyst", result.meta.mode, result.data);

    return ok(result.data, result.meta);
  } catch (error) {
    return serverError(error, "无法生成用户洞察，请稍后重试。");
  }
}
```

## `src/app/api/campaign/analyze/route.ts`

```ts
import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
  question: z.string().max(400).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const context = await getBusinessContext({ datasetId: parsed.data.datasetId ?? null });

    if (context.totals.impressions === 0) {
      return fail("EMPTY_DATASET", "当前数据集没有可分析的投放记录，请先上传 CSV 或切换回 Demo 数据集。", 409);
    }

    const result = await runAgent("performance_analyst", {
      context,
      extraNotes: parsed.data.question,
    });

    await saveInsights("campaign", "performance_analyst", result.meta.mode, result.data);

    return ok(
      {
        analysis: result.data,
        snapshot: {
          datasetLabel: context.dataSource.label,
          rows: context.dataSource.rows,
          period: context.period,
          totals: context.totals,
          comparison: context.comparison,
        },
      },
      result.meta,
    );
  } catch (error) {
    return serverError(error, "投放分析失败，请稍后重试。");
  }
}
```

## `src/app/api/campaign/sample/route.ts`

```ts
import { NextResponse } from "next/server";

import { rowsToCsv } from "@/lib/csv";
import { getDemoMetricRows } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Downloads a ready-to-upload sample CSV exported from the demo dataset. */
export async function GET() {
  const rows = await getDemoMetricRows(90);
  const csv = rowsToCsv(
    rows.map((row) => ({
      ...row,
      date: new Date(row.date).toISOString().slice(0, 10),
    })),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mori-campaign-sample.csv"',
    },
  });
}
```

## `src/app/api/campaign/upload/route.ts`

```ts
import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { CsvValidationError, parseCampaignCsv } from "@/lib/csv";
import { persistUploadedCsv } from "@/lib/data";
import { computeMetrics } from "@/lib/metrics";
import type { AgentRunMeta } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  fileName: z.string().min(1).max(160),
  csv: z.string().min(1).max(8_000_000),
  note: z.string().max(400).optional(),
});

const UPLOAD_META: AgentRunMeta = {
  mode: "demo",
  agent: "performance_analyst",
  model: "local",
  promptVersion: "v1.5",
  latencyMs: 0,
  generatedAt: new Date().toISOString(),
};

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    let result;
    try {
      result = parseCampaignCsv(parsed.data.csv);
    } catch (error) {
      if (error instanceof CsvValidationError) {
        return fail(error.code, error.message, 400, { issues: error.issues });
      }
      throw error;
    }

    const totals = computeMetrics(result.rows);
    const datasetName = `${parsed.data.fileName.replace(/\.csv$/i, "")} · ${result.rows.length} 行`;

    const persisted = await persistUploadedCsv(
      datasetName,
      result.rows,
      parsed.data.note ?? `上传时间 ${new Date().toISOString()}｜${result.platforms.join(" / ")}`,
    );

    return ok(
      {
        dataset: persisted.dataset,
        inserted: persisted.inserted,
        issues: result.issues,
        skippedRows: result.skippedRows,
        totalRows: result.totalRows,
        platforms: result.platforms,
        creatives: result.creatives,
        dateRange: result.dateRange,
        totals,
      },
      UPLOAD_META,
    );
  } catch (error) {
    return serverError(error, "CSV 处理失败，请检查文件格式后重试。");
  }
}
```

## `src/app/api/content/generate/route.ts`

```ts
import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
  platform: z.string().min(1).max(40),
  contentType: z.string().min(1).max(40),
  goal: z.string().min(1).max(40),
  topic: z.string().min(1).max(80),
  audience: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const { datasetId, ...selection } = parsed.data;
    const context = await getBusinessContext({ datasetId: datasetId ?? null });

    const result = await runAgent("content_strategist", {
      context,
      contentSelection: selection,
    });

    await saveInsights("content", "content_strategist", result.meta.mode, result.data);

    return ok(result.data, result.meta);
  } catch (error) {
    return serverError(error, "无法生成内容方案，请稍后重试。");
  }
}
```

## `src/app/api/content/save/route.ts`

```ts
import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  platform: z.string().min(1),
  contentType: z.string().min(1),
  goal: z.string().min(1),
  topic: z.string().min(1),
  audience: z.string().min(1),
  title: z.string().min(1),
  hook: z.string().min(1),
  body: z.string().min(1),
  cta: z.string().min(1),
  hookScore: z.number().min(0).max(100),
  relevanceScore: z.number().min(0).max(100),
  conversionScore: z.number().min(0).max(100),
  brandFitScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  whyTest: z.string().min(1),
  howToImprove: z.string().min(1),
  mode: z.enum(["demo", "ai", "fallback"]).default("demo"),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const created = await prisma.contentItem.create({
      data: {
        title: parsed.data.title,
        platform: parsed.data.platform,
        contentType: parsed.data.contentType,
        goal: parsed.data.goal,
        topic: parsed.data.topic,
        audience: parsed.data.audience,
        hook: parsed.data.hook,
        body: parsed.data.body,
        cta: parsed.data.cta,
        hookScore: Math.round(parsed.data.hookScore),
        relevanceScore: Math.round(parsed.data.relevanceScore),
        conversionScore: Math.round(parsed.data.conversionScore),
        brandFitScore: Math.round(parsed.data.brandFitScore),
        overallScore: Math.round(parsed.data.overallScore),
        whyTest: parsed.data.whyTest,
        howToImprove: parsed.data.howToImprove,
        status: "testing",
        mode: parsed.data.mode ?? "demo",
      },
    });

    return ok({ id: created.id, title: created.title, overallScore: created.overallScore }, {
      mode: parsed.data.mode ?? "demo",
      agent: "content_strategist",
      model: "local",
      promptVersion: "v1.4",
      latencyMs: 0,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return serverError(error, "保存内容失败，请稍后重试。");
  }
}
```

## `src/app/api/creative/generate/route.ts`

```ts
import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
  platform: z.string().min(1).max(40),
  objective: z.string().min(1).max(40),
  audience: z.string().min(1).max(80),
  theme: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const { datasetId, ...selection } = parsed.data;
    const context = await getBusinessContext({ datasetId: datasetId ?? null });
    const result = await runAgent("creative_strategist", { context, creativeSelection: selection });

    await saveInsights("creative", "creative_strategist", result.meta.mode, result.data);

    return ok(result.data, result.meta);
  } catch (error) {
    return serverError(error, "无法生成素材方向，请稍后重试。");
  }
}
```

## `src/app/api/experiments/create/route.ts`

```ts
import { z } from "zod";

import { fail, ok, parseBody, readJson, serverError } from "@/lib/api";
import { getBusinessContext } from "@/lib/data";
import { prisma } from "@/lib/db";
import { evaluateExperiment, experimentMetricTable, type VariantMetrics } from "@/lib/experiments";
import type { AgentRunMeta } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  name: z.string().min(2).max(120),
  hypothesis: z.string().min(4).max(400),
  primaryMetric: z.enum(["ctr", "cvr", "cpa", "roas"]),
  variantACreative: z.string().min(1),
  variantBCreative: z.string().min(1),
  datasetId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const body = parsed.data;
    if (body.variantACreative === body.variantBCreative) {
      return fail("SAME_VARIANT", "A / B 两个变体不能选择同一条素材，请选择不同素材进行对照实验。", 422);
    }

    const context = await getBusinessContext({ datasetId: body.datasetId ?? null });
    if (context.dataSource.rows === 0) {
      return fail("EMPTY_DATASET", "当前数据集没有投放记录，无法创建基于真实数据的实验。", 409);
    }

    const metricsRows = context.creatives;
    const pick = (creative: string) => metricsRows.find((item) => item.name === creative);
    const aGroup = pick(body.variantACreative);
    const bGroup = pick(body.variantBCreative);

    if (!aGroup || !bGroup) {
      return fail("CREATIVE_NOT_FOUND", "所选素材在当前数据集中没有投放记录。", 404);
    }

    const toVariant = (label: string, group: typeof aGroup): VariantMetrics => ({
      label,
      name: group.name,
      description: `${group.platform} · ${group.campaign ?? "—"} · 花费 ${Math.round(group.spend)}`,
      impressions: group.impressions,
      clicks: group.clicks,
      conversions: group.conversions,
      spend: Number(group.spend.toFixed(2)),
      revenue: Number(group.revenue.toFixed(2)),
    });

    const evaluation = evaluateExperiment(toVariant("A", aGroup), toVariant("B", bGroup), body.primaryMetric);

    const experiment = await prisma.experiment.create({
      data: {
        name: body.name,
        hypothesis: body.hypothesis,
        goal: "验证素材角度对效率指标的影响",
        primaryMetric: evaluation.primaryMetric,
        status: "running",
        summary: `A ${evaluation.a.name} vs B ${evaluation.b.name}；${evaluation.primaryMetric.toUpperCase()} 差异 ${evaluation.liftPct.toFixed(1)}%。`,
        aiRecommendation: evaluation.recommendation,
        mode: "demo",
        startDate: new Date(`${context.period.end}T00:00:00.000Z`),
        endDate: new Date(new Date(`${context.period.end}T00:00:00.000Z`).getTime() + 7 * 86_400_000),
        variants: {
          create: [evaluation.a, evaluation.b].map((variant) => ({
            label: variant.label,
            name: variant.name,
            description: variant.description,
            impressions: variant.impressions,
            clicks: variant.clicks,
            conversions: variant.conversions,
            spend: variant.spend,
            revenue: variant.revenue,
            isWinner: evaluation.winner === variant.label,
          })),
        },
      },
    });

    const meta: AgentRunMeta = {
      mode: "demo",
      agent: "performance_analyst",
      model: "two-proportion z-test",
      promptVersion: "v1.5",
      latencyMs: 0,
      generatedAt: new Date().toISOString(),
    };

    return ok(
      {
        id: experiment.id,
        evaluation,
        metricTable: experimentMetricTable(evaluation),
      },
      meta,
      201,
    );
  } catch (error) {
    return serverError(error, "创建实验失败，请稍后重试。");
  }
}
```

## `src/app/api/health/route.ts`

```ts
import { NextResponse } from "next/server";

import { agentStatusSummary } from "@/lib/ai/runner";
import { databaseHealthCheck } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const [database, agents] = await Promise.all([databaseHealthCheck(), Promise.resolve(agentStatusSummary())]);

  return NextResponse.json({
    ok: database.ok,
    checkedAt: new Date().toISOString(),
    database,
    ai: {
      mode: agents.mode,
      provider: agents.provider,
      model: agents.model,
      demoMode: agents.demoMode,
      apiKeyConfigured: agents.apiKeyConfigured,
      reason: agents.reason,
    },
    demoNotice: "MORI 为虚拟品牌，全部数据为 Demo / 模拟业务数据。",
  });
}
```

## `src/app/api/market/analyze/route.ts`

```ts
import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
  focus: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const context = await getBusinessContext({ datasetId: parsed.data.datasetId ?? null });
    const result = await runAgent("market_analyst", { context, extraNotes: parsed.data.focus });

    await saveInsights("market", "market_analyst", result.meta.mode, result.data);

    return ok(result.data, result.meta);
  } catch (error) {
    return serverError(error, "无法生成竞品报告，请稍后重试。");
  }
}
```

## `src/app/api/reports/generate/route.ts`

```ts
import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { runAgent } from "@/lib/ai/runner";
import { getBusinessContext, saveInsights } from "@/lib/data";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  datasetId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    const context = await getBusinessContext({ datasetId: parsed.data.datasetId ?? null });
    const result = await runAgent("report_writer", { context });

    const reportPayload = {
      report: result.data,
      meta: {
        generatedAt: result.meta.generatedAt,
        mode: result.meta.mode,
        model: result.meta.model,
        promptVersion: result.meta.promptVersion,
        dataLabel: context.dataSource.label,
      },
    };

    const stored = await prisma.report.create({
      data: {
        title: result.data.title,
        periodStart: new Date(`${context.period.start}T00:00:00.000Z`),
        periodEnd: new Date(`${context.period.end}T00:00:00.000Z`),
        payload: JSON.stringify(reportPayload),
        mode: result.meta.mode,
      },
    });

    await saveInsights(
      "report",
      "report_writer",
      result.meta.mode,
      { insights: result.data.keyInsights, opportunities: [], risks: [], recommendations: [] },
    );

    return ok({ id: stored.id, ...reportPayload }, result.meta);
  } catch (error) {
    return serverError(error, "生成增长报告失败，请稍后重试。");
  }
}
```

## `src/app/api/settings/data/route.ts`

```ts
import { z } from "zod";

import { ok, parseBody, readJson, serverError } from "@/lib/api";
import { buildDemoAudienceMetrics, buildDemoMetrics } from "@/lib/demo-data";
import { prisma } from "@/lib/db";
import type { AgentRunMeta } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  action: z.enum(["clear-uploads", "regenerate-demo"]),
});

const META: AgentRunMeta = {
  mode: "demo",
  agent: "performance_analyst",
  model: "local",
  promptVersion: "v1.5",
  latencyMs: 0,
  generatedAt: new Date().toISOString(),
};

export async function POST(request: Request) {
  try {
    const parsed = parseBody(BodySchema, await readJson(request));
    if (!parsed.success) return parsed.response;

    if (parsed.data.action === "clear-uploads") {
      const datasets = await prisma.dataset.findMany({ select: { id: true } });
      await prisma.dataset.deleteMany();
      return ok(
        {
          action: "clear-uploads",
          removedDatasets: datasets.length,
          message: `已删除 ${datasets.length} 个上传数据集及其投放记录（Demo 数据集不受影响）。`,
        },
        META,
      );
    }

    const demoRows = buildDemoMetrics();
    const audienceRows = buildDemoAudienceMetrics();

    await prisma.metric.deleteMany({ where: { source: "demo" } });
    await prisma.audienceMetric.deleteMany();

    await prisma.metric.createMany({
      data: demoRows.map((row) => ({
        date: new Date(row.date),
        platform: row.platform,
        campaign: row.campaign,
        creative: row.creative,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        revenue: row.revenue,
        source: "demo",
      })),
    });

    await prisma.audienceMetric.createMany({
      data: audienceRows.map((row) => ({
        date: new Date(row.date),
        segment: row.segment,
        age: row.age,
        gender: row.gender,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        revenue: row.revenue,
      })),
    });

    return ok(
      {
        action: "regenerate-demo",
        metricRows: demoRows.length,
        audienceRows: audienceRows.length,
        message: `已重新生成 Demo 投放数据：${demoRows.length} 条投放记录 + ${audienceRows.length} 条人群记录。`,
      },
      META,
    );
  } catch (error) {
    return serverError(error, "数据管理操作失败，请稍后重试。");
  }
}
```

## `src/app/api/settings/test-ai/route.ts`

```ts
import { ok, serverError } from "@/lib/api";
import { testAiConnection } from "@/lib/ai/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await testAiConnection();
    return ok(result, {
      mode: result.mode === "ai" ? "ai" : "demo",
      agent: "growth_advisor",
      model: result.model,
      promptVersion: "v2.0",
      latencyMs: result.latencyMs,
      generatedAt: new Date().toISOString(),
      warning: result.ok ? undefined : result.message,
    });
  } catch (error) {
    return serverError(error, "AI 连接测试失败。");
  }
}
```

## `src/app/error.tsx`

```tsx
"use client";

import { AlertOctagon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[MORI] 页面渲染失败：", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="surface max-w-xl p-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-tone-bad/12 text-tone-bad">
          <AlertOctagon className="h-5 w-5" />
        </span>
        <h1 className="text-lg font-semibold">页面加载失败</h1>
        <p className="prose-copy mt-2">
          出现了一个未预期的错误。常见原因：数据库尚未初始化（请运行 <code className="font-mono">npm run db:setup</code>
          ）或 AI 接口超时。
        </p>
        <p className="mt-3 rounded-xl bg-surface-muted px-3 py-2 text-left font-mono text-[11px] text-ink-muted">
          {error.message || "Unknown error"}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset} variant="primary">
            重新加载
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* --------------------------------------------------------------------------
   Design tokens — 米白 / 深灰 / 浅绿
   Defined as CSS variables so the Theme setting can switch the whole product.
   -------------------------------------------------------------------------- */

:root {
  --canvas: 246 244 239;
  --surface: 255 255 255;
  --surface-muted: 243 241 236;
  --ink: 30 35 32;
  --ink-muted: 92 102 96;
  --ink-soft: 139 148 142;
  --line: 228 225 217;
  --moss: 97 140 104;
  --moss-strong: 59 89 66;
  --moss-soft: 228 238 228;
  --clay: 192 138 106;
  --clay-soft: 240 226 216;
  --tone-good: 63 125 91;
  --tone-warn: 176 116 52;
  --tone-bad: 168 72 63;
  --tone-info: 75 108 143;
  --sidebar: 27 33 29;
  --sidebar-ink: 226 231 224;
  --sidebar-muted: 150 161 152;
  color-scheme: light;
}

[data-theme="dark"] {
  --canvas: 20 23 21;
  --surface: 28 32 29;
  --surface-muted: 36 41 37;
  --ink: 235 238 233;
  --ink-muted: 168 176 169;
  --ink-soft: 128 137 130;
  --line: 52 58 53;
  --moss: 138 186 146;
  --moss-strong: 178 214 184;
  --moss-soft: 38 51 41;
  --clay: 209 160 128;
  --clay-soft: 56 45 38;
  --tone-good: 111 175 137;
  --tone-warn: 216 161 95;
  --tone-bad: 217 138 129;
  --tone-info: 143 176 209;
  --sidebar: 15 18 16;
  --sidebar-ink: 226 231 224;
  --sidebar-muted: 140 152 142;
  color-scheme: dark;
}

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
    @apply bg-canvas text-ink font-sans antialiased;
  }

  ::selection {
    background: rgb(var(--moss) / 0.28);
  }

  h1,
  h2,
  h3,
  h4 {
    @apply font-serif tracking-tight text-ink;
  }

  *:focus-visible {
    outline: 2px solid rgb(var(--moss) / 0.6);
    outline-offset: 2px;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgb(var(--ink-soft) / 0.35);
    border-radius: 999px;
    border: 3px solid transparent;
    background-clip: content-box;
  }
}

@layer components {
  .chip {
    @apply inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none;
  }

  .chip-moss {
    background: rgb(var(--moss-soft));
    color: rgb(var(--moss-strong));
  }

  .chip-neutral {
    background: rgb(var(--surface-muted));
    color: rgb(var(--ink-muted));
    border: 1px solid rgb(var(--line));
  }

  .chip-good {
    background: rgb(var(--tone-good) / 0.14);
    color: rgb(var(--tone-good));
  }

  .chip-warn {
    background: rgb(var(--tone-warn) / 0.16);
    color: rgb(var(--tone-warn));
  }

  .chip-bad {
    background: rgb(var(--tone-bad) / 0.14);
    color: rgb(var(--tone-bad));
  }

  .chip-info {
    background: rgb(var(--tone-info) / 0.14);
    color: rgb(var(--tone-info));
  }

  .chip-clay {
    background: rgb(var(--clay-soft));
    color: rgb(var(--clay));
  }

  .surface {
    @apply rounded-2xl border border-ink-line bg-surface shadow-card;
  }

  .surface-muted {
    @apply rounded-xl border border-ink-line bg-surface-muted;
  }

  .label-text {
    @apply text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft;
  }

  .prose-copy {
    @apply text-[13px] leading-relaxed text-ink-muted;
  }

  .data-value {
    @apply font-mono text-ink;
  }

  .grid-bg {
    background-image: linear-gradient(rgb(var(--line) / 0.55) 1px, transparent 1px),
      linear-gradient(90deg, rgb(var(--line) / 0.55) 1px, transparent 1px);
    background-size: 28px 28px;
  }
}

@media print {
  .no-print {
    display: none !important;
  }

  /* 作品集导出 PDF：隐藏导航与交互元素，避免卡片/截图被拆页 */
  [data-portfolio-nav],
  [data-portfolio-noprint] {
    display: none !important;
  }

  [data-portfolio-card],
  [data-portfolio-shot] {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  [data-portfolio-shot] img {
    max-height: 70vh;
    object-fit: contain;
  }

  @page {
    size: A4;
    margin: 12mm;
  }

  a[href]:after {
    content: "";
  }
}
```

## `src/app/icon.svg`

```text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#1F2E23" />
  <path
    d="M14 46V18h7.5l10.5 15.5L42.5 18H50v28h-7V30.5l-9 13h-2l-9-13V46z"
    fill="#A3C4A6"
  />
  <circle cx="49" cy="46" r="3.4" fill="#C08A6A" />
</svg>
```

## `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "MORI AI Growth OS · AI 美妆增长中台",
  description:
    "MORI 森屿 AI 美妆增长中台（Demo 作品集项目）：把用户洞察、内容策划、素材生产、投放分析与增长决策整合到一个 AI 工作台。所有数据均为模拟业务数据。",
  applicationName: "MORI AI Growth OS",
  authors: [{ name: "MORI Portfolio Demo" }],
  keywords: ["AI 增长", "营销中台", "结构化输出", "Next.js", "Prisma", "作品集"],
};

const THEME_BOOTSTRAP = `(function(){try{var s=localStorage.getItem('mori-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='dark'||s==='light')?s:(m?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

## `src/app/not-found.tsx`

```tsx
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="surface max-w-lg p-8 text-center">
        <p className="label-text">404</p>
        <h1 className="mt-2 text-xl font-semibold">没有找到这个页面</h1>
        <p className="prose-copy mt-2">
          MORI AI Growth OS 目前包含 Dashboard、Brand、Audience、Market、Content、Creative、Campaign、AI Advisor、
          Experiments、Reports、Prompt Library、Evaluation 与 Settings。
        </p>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary" }), "mt-5 inline-flex")}>
          返回 Dashboard
        </Link>
      </div>
    </div>
  );
}
```

## `src/app/page.tsx`

```tsx
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardCheck as FileCheck,
  Compass,
  FileText,
  FlaskConical,
  ScrollText,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODULES = [
  { href: "/dashboard", icon: BarChart3, title: "总览 Dashboard", en: "Overview", text: "8 个核心 KPI、趋势图、渠道结构与素材排行，全部由数据库实时计算。" },
  { href: "/brand", icon: Sparkles, title: "品牌中心", en: "Brand Center", text: "品牌定位、产品卖点、渠道与关键词，作为全部 AI 分析的上下文。" },
  { href: "/audience", icon: Users, title: "用户洞察", en: "Audience", text: "3 个 Persona + 分人群投放数据，AI 输出用户 / 内容 / 产品 / 广告机会。" },
  { href: "/market", icon: Compass, title: "市场与竞品", en: "Market", text: "价格 × 专业度矩阵、虚拟竞品对比、市场空白与切入建议。" },
  { href: "/content", icon: BookOpen, title: "内容策划", en: "Content Studio", text: "小红书标题与正文、抖音 15 秒脚本，并给出 Hook / 相关性 / 转化评分。" },
  { href: "/creative", icon: Sparkles, title: "广告素材", en: "Creative Lab", text: "一次生成 5 个结构性差异的素材方向，并给出测试优先级。" },
  { href: "/campaign", icon: BarChart3, title: "投放分析", en: "Campaign Analytics", text: "CSV 上传、指标自动计算、高效 / 低效素材识别与预算建议。" },
  { href: "/advisor", icon: Compass, title: "AI 增长顾问", en: "AI Advisor", text: "带业务上下文的诊断：Diagnosis → Reason → Hypothesis → Recommendation → Experiment。" },
  { href: "/experiments", icon: FlaskConical, title: "实验中心", en: "Experiment Lab", text: "创建 A/B 实验，自动做双比例 z 检验并给出是否继续测试的结论。" },
  { href: "/reports", icon: FileText, title: "增长报告", en: "Growth Report", text: "一键生成本周增长周报，可复制、可下载 Markdown 与 PDF。" },
  { href: "/prompts", icon: ScrollText, title: "Prompt 管理", en: "Prompt Library", text: "6 个 Agent 的独立 Prompt、版本号、输出 Schema 与变更记录。" },
  { href: "/evaluation", icon: FileCheck, title: "AI 评估", en: "Evaluation", text: "对 AI 输出的完整性、相关性、可执行性与准确性做 Demo 评估。" },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-serif text-[16px] font-semibold text-canvas">
            M
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-[16px] font-semibold">MORI 森屿</span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-ink-soft">Growth OS</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="clay">Demo / 模拟业务数据</Badge>
          <Link href="/portfolio" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Case Study
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
            进入工作台
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-y border-ink-line bg-surface">
        <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="space-y-6">
            <p className="label-text">AI-Powered Growth Intelligence for Modern Brands</p>
            <h1 className="text-4xl font-semibold leading-[1.15] lg:text-5xl">
              MORI AI Growth OS
              <span className="mt-3 block font-serif text-2xl font-normal italic text-ink-muted lg:text-3xl">
                让 AI 帮品牌完成从用户洞察到增长优化的完整闭环
              </span>
            </h1>
            <p className="max-w-2xl text-[14px] leading-relaxed text-ink-muted">
              市场 → 用户 → 内容 → 素材 → 广告 → 投放数据 → AI 分析 → 优化建议 → 下一轮投放。
              MORI AI Growth OS 把这条链路做成一个可以真实操作的工作台：KPI 由数据库计算，AI 输出全部走结构化
              JSON Schema，前端负责渲染，Demo Mode 下无需任何 API Key 也能完整演示。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "group")}>
                打开 Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/advisor" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                直接问 AI 增长顾问
              </Link>
            </div>
            <dl className="grid max-w-xl grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              {[
                { label: "KPI 计算", value: "7 项" },
                { label: "AI Agent", value: "6 + 1" },
                { label: "Demo 数据", value: "300 条" },
                { label: "页面模块", value: "14" },
              ].map((item) => (
                <div key={item.label} className="surface-muted px-3.5 py-3">
                  <dt className="text-[11px] text-ink-soft">{item.label}</dt>
                  <dd className="data-value mt-1 text-[18px] font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface p-6">
            <p className="label-text">Problem → Solution</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[13px] font-semibold">传统营销团队的问题</p>
                <p className="prose-copy mt-1">
                  调研、用户分析、选题、脚本、素材、投放数据、周报分散在 Excel、报表后台与聊天工具之间，大量时间花在
                  “找数据 + 对口径 + 写结论”上。
                </p>
              </div>
              <div>
                <p className="text-[13px] font-semibold">MORI 的解法</p>
                <p className="prose-copy mt-1">
                  用统一的数据模型（品牌 / 产品 / 用户 / 竞品 / 投放 / 内容 / 实验）作为业务上下文，把分析拆成 6
                  个专职 Agent，每个 Agent 都有独立的 Prompt、版本号与 JSON Schema 输出。
                </p>
              </div>
              <div className="surface-muted px-4 py-3">
                <p className="text-[12px] font-medium">核心价值</p>
                <p className="prose-copy mt-1">
                  减少重复分析工作，提升营销决策效率：Insight → Action → Experiment → Optimization。
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-soft">
                本项目基于模拟业务数据验证产品工作流，不代表真实商业成绩。MORI 森屿 与所有竞品均为虚拟品牌。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">产品模块</h2>
            <p className="mt-1 text-[13px] text-ink-muted">14 个可以真实操作的页面，覆盖从洞察到复盘的全流程。</p>
          </div>
          <Link href="/dashboard" className="text-[12px] text-moss-strong underline-offset-4 hover:underline">
            查看完整工作台 →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className="surface group flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/12 text-moss-strong">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="flex items-baseline gap-2 text-[14px] font-semibold">
                    {module.title}
                    <span className="font-serif text-[11px] font-normal italic text-ink-soft">{module.en}</span>
                  </p>
                  <p className="prose-copy mt-1.5">{module.text}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-ink-line bg-surface px-6 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 text-[11px] leading-relaxed text-ink-soft">
          <p>MORI AI Growth OS · 个人求职作品集项目（AI 产品 / AI 增长 / 市场营销 / 电商运营方向）。</p>
          <p>虚拟品牌与模拟数据仅用于验证 AI 在营销分析与增长决策中的应用，不构成任何真实业绩或功效承诺。</p>
        </div>
      </footer>
    </div>
  );
}
```

## `src/app/portfolio/page.tsx`

```tsx
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Compass,
  FileText,
  FlaskConical,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { ZoomableShot } from "@/components/portfolio/zoomable-shot";
import { Badge } from "@/components/ui/badge";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";
import { getBusinessContext } from "@/lib/data";
import { evaluateExperiment, type VariantMetrics } from "@/lib/experiments";
import { requiredSampleSize } from "@/lib/statistics";
import { formatCompactNumber, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MORI AI Growth OS · 求职作品集 Case Study",
  description:
    "商科背景 × AI 应用 × 产品运营 × 数据分析 × 增长：把市场洞察、用户分析、内容策划、广告投放、数据分析、AI 诊断与实验优化串成完整增长闭环的 Case Study。所有业务数据均为 Demo / 模拟业务数据。",
};

/** 截图路径（由 scripts/capture-screenshots.mjs 生成） */
const desktopShot = (name: string) => `/portfolio/desktop/${name}.jpg`;
const mobileShot = (name: string) => `/portfolio/mobile/${name}.jpg`;

/**
 * 作品集里引用的工程事实（均为本仓库实际结果，可复核）：
 * - 页面模块 14 个：src/app/(workspace) 下的 14 个业务页面
 * - AI Agent 7 个：Object.keys(AGENT_SCHEMAS).length
 * - Demo 数据行数：prisma/seed.ts 写入的 Metric 记录数（300 条 = 30 天 × 10 条素材）
 * - 自动化测试：npm test 结果（101 passed / 10 files）
 */
const FACTS = {
  pages: 14,
  agents: Object.keys(AGENT_SCHEMAS).length,
  tests: 101,
  testFiles: 10,
};

const PROBLEM_STEPS = ["市场洞察", "用户研究", "内容策划", "素材制作", "广告投放", "数据分析", "增长决策"];
const PROBLEMS = [
  { title: "信息分散", body: "竞品、用户、内容、投放数据散落在不同表格与后台，口径不统一。" },
  { title: "数据与内容脱节", body: "内容团队不知道哪条素材在亏钱，投放团队不知道内容想表达什么。" },
  { title: "分析依赖人工", body: "每周重复导出、清洗、算指标，真正用于判断的时间被挤压。" },
  { title: "洞察难以转化为行动", body: "报告写了「CVR 下降」，但没有谁去改落地页、改 Hook、调预算。" },
  { title: "实验与复盘没有闭环", body: "做过什么、结论是什么、下一轮怎么改，往往没有留痕。" },
];
const SOLUTION_CHAIN = [
  "Market",
  "Audience",
  "Content",
  "Creative",
  "Campaign",
  "Analytics",
  "AI Insight",
  "Experiment",
  "Optimization",
  "Report",
];

const MODULES = [
  { icon: Compass, title: "Market Intelligence", zh: "市场与竞品", shot: "04-market", desc: "价格 × 专业度矩阵与竞品弱项，落到定位建议。" },
  { icon: Users, title: "Audience Intelligence", zh: "用户洞察", shot: "08-audience", desc: "3 个 Persona + 分人群指标，产出四类机会卡片。" },
  { icon: BookOpen, title: "Content Studio", zh: "内容策划", shot: "05-content", desc: "按平台规范生成标题、正文与 15 秒脚本，并给出评分。" },
  { icon: Sparkles, title: "Creative Lab", zh: "广告素材", shot: "06-creative", desc: "一次生成 5 个结构性差异的素材方向与测试优先级。" },
  { icon: BarChart3, title: "Campaign Analytics", zh: "投放分析", shot: "07-campaign", desc: "CSV 上传 → 清洗 → 指标计算 → 效率诊断与预算建议。" },
  { icon: Compass, title: "AI Growth Advisor", zh: "AI 增长顾问", shot: "09-advisor", desc: "带业务上下文诊断：现象 → 原因 → 假设 → 建议 → 实验。" },
  { icon: FlaskConical, title: "Experiment Lab", zh: "实验中心", shot: "10-experiments", desc: "A/B 设计 + 双比例 z 检验，输出是否继续测试。" },
  { icon: FileText, title: "Growth Report", zh: "增长报告", shot: "11-reports", desc: "8 段式周报，可复制 / 导出 Markdown 与 PDF。" },
];

const PIPELINE = ["CSV", "Data Cleaning", "Metric Calculation", "Trend Analysis", "Platform / Creative / Audience", "AI Diagnosis"];

function SectionHeading({
  index,
  title,
  titleEn,
  description,
  id,
}: {
  index?: string;
  title: string;
  titleEn?: string;
  description?: string;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 space-y-3">
      {index ? <p className="label-text">{index}</p> : null}
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-[26px] font-semibold leading-tight md:text-[32px]">{title}</h2>
        {titleEn ? <span className="font-serif text-[15px] italic text-ink-soft md:text-[17px]">{titleEn}</span> : null}
      </div>
      {description ? <p className="max-w-3xl text-[13.5px] leading-relaxed text-ink-muted">{description}</p> : null}
    </div>
  );
}

function StatCard({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div data-portfolio-card className="surface px-5 py-4">
      <p className="data-value text-[26px] font-semibold leading-none">{value}</p>
      <p className="mt-2 text-[12.5px] font-medium text-ink">{label}</p>
      {note ? <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{note}</p> : null}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div data-portfolio-card className="surface-muted px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="data-value mt-1.5 text-[18px] font-semibold leading-none">{value}</p>
      {sub ? <p className="mt-1.5 text-[11px] text-ink-soft">{sub}</p> : null}
    </div>
  );
}

function Chain({ steps, tone = "moss" }: { steps: string[]; tone?: "moss" | "neutral" }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => (
        <span key={step} className="flex items-center gap-2">
          <span
            className={
              tone === "moss"
                ? "rounded-xl border border-moss/25 bg-moss/10 px-3.5 py-2 text-[12.5px] font-medium text-moss-strong"
                : "rounded-xl border border-ink-line bg-surface px-3.5 py-2 text-[12.5px] text-ink-muted"
            }
          >
            {step}
          </span>
          {index < steps.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-ink-soft" aria-hidden /> : null}
        </span>
      ))}
    </div>
  );
}

function CheckList({ items, tone = "neutral" }: { items: string[]; tone?: "neutral" | "warn" }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
          <span className={tone === "warn" ? "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-tone-warn" : "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss"} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function PortfolioPage() {
  const context = await getBusinessContext();
  const totals = context.totals;
  const comparison = context.comparison;

  const priceExperiment =
    context.experiments.find((experiment) => experiment.name.includes("价格解释")) ?? context.experiments[0];
  const evaluation =
    priceExperiment && priceExperiment.variants.length >= 2
      ? evaluateExperiment(
          toVariantMetrics(priceExperiment.variants[0], "A"),
          toVariantMetrics(priceExperiment.variants[1], "B"),
          priceExperiment.primaryMetric,
        )
      : null;

  return (
    <div className="min-h-screen bg-canvas">
      <PortfolioNav />

      <main className="mx-auto w-full max-w-[1400px] px-5 pb-24 md:px-10">
        {/* ============================ 01 HERO ============================ */}
        <section id="overview" className="scroll-mt-24 pt-10 md:pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="moss">Case Study · AI Product Operations</Badge>
                <Badge tone="clay">Demo / Simulated Business Data</Badge>
              </div>
              <h1 className="text-[40px] font-semibold leading-[1.08] md:text-[56px]">
                MORI AI Growth OS
                <span className="mt-3 block font-serif text-[22px] font-normal italic text-ink-muted md:text-[28px]">
                  AI 驱动的营销增长决策工作台
                </span>
              </h1>
              <p className="max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                让 AI 帮助品牌完成从用户洞察到增长优化的完整闭环：市场洞察 → 用户研究 → 内容策划 → 素材生产 →
                广告投放 → 数据分析 → AI 诊断 → 实验优化 → 增长报告。
              </p>
              <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
                我的定位：商科背景 × AI 应用 × 产品运营 × 数据分析 × 增长。我做的事情不是"让 AI 写文案"，
                而是把业务问题拆成 AI 可以执行的软件流程，并让每一个结论都能被数据复核。
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-canvas transition-colors hover:bg-ink/90"
                >
                  打开产品 <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#problem"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-line px-5 py-2.5 text-[13px] text-ink transition-colors hover:bg-surface-muted"
                >
                  阅读 Case Study
                </a>
                <Link href="/portfolio" className="text-[12px] text-ink-soft underline-offset-4 hover:underline">
                  /portfolio
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
                <StatCard value={`${FACTS.pages}`} label="页面模块" note="可交互的业务页面" />
                <StatCard value={`${FACTS.agents}`} label="AI Agent" note="6 个业务 Agent + 1 个报告 Agent，各自独立 Prompt + Schema" />
                <StatCard value={`${context.dataSource.rows}`} label="Demo 数据行" note="模拟投放记录（非真实用户）" />
                <StatCard value={`${FACTS.tests}`} label="自动化测试" note={`${FACTS.testFiles} 个测试文件全部通过`} />
              </div>
            </div>

            <div className="space-y-4">
              <ZoomableShot
                priority
                src={desktopShot("01-hero-landing")}
                alt="MORI AI Growth OS 首页"
                caption="产品首页：品牌定位 + 14 个模块入口，全部使用 Demo / 模拟业务数据。"
              />
              <div className="grid grid-cols-[minmax(0,150px)_1fr] items-start gap-4">
                <ZoomableShot
                  src={mobileShot("01-hero-landing")}
                  alt="MORI 首页 · 移动端"
                  caption="移动端 390×844，同一套设计体系。"
                />
                <div className="surface h-full px-4 py-3.5">
                  <p className="label-text mb-2">这套作品集要证明什么</p>
                  <CheckList
                    items={[
                      "我理解增长业务的完整链路，而不只是单点工具",
                      "我能把业务问题拆成 AI 可执行的结构化流程",
                      "我关心 AI 的可靠性：失败、口径、安全、可复核",
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 02 WHY MORI ============================ */}
        <section id="problem" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="01 / Problem"
            title="Why I Built MORI"
            titleEn="营销增长每天都要跨过这 7 步"
            description="增长团队的日常不是缺少工具，而是缺少一条把数据、内容与决策串起来的工作流。"
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface p-5">
              <p className="label-text mb-4">传统工作方式的链路</p>
              <div className="space-y-2">
                {PROBLEM_STEPS.map((step, index) => (
                  <div key={step}>
                    <div className="flex items-center gap-3 rounded-xl border border-ink-line bg-surface-muted px-4 py-2.5">
                      <span className="font-mono text-[11px] text-ink-soft">{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-[13px] font-medium">{step}</span>
                    </div>
                    {index < PROBLEM_STEPS.length - 1 ? (
                      <div className="pl-[26px] py-1 text-ink-soft" aria-hidden>
                        ↓
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {PROBLEMS.map((problem) => (
                  <div key={problem.title} data-portfolio-card className="surface p-4">
                    <p className="text-[13px] font-semibold">{problem.title}</p>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">{problem.body}</p>
                  </div>
                ))}
              </div>
              <div className="surface p-5">
                <p className="label-text mb-3">MORI 的解法：把链路做成一个工作台</p>
                <Chain steps={SOLUTION_CHAIN} />
                <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">
                  每一个节点都不是孤立页面：前一个环节的输出会作为后一个环节的业务上下文（品牌、人群、竞品、投放、内容、实验），
                  AI 只能在这套上下文里做判断。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 03 PRODUCT OVERVIEW ============================ */}
        <section id="product" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="02 / Product"
            title="From Data to Decision"
            titleEn="8 个核心模块，一条增长闭环"
            description="下面每一张都是本项目真实运行页面（1440×900 实拍），点击可放大。"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.title} data-portfolio-card className="surface flex flex-col overflow-hidden p-0">
                  <ZoomableShot src={desktopShot(module.shot)} alt={`${module.title} 页面`} className="p-2.5" />
                  <div className="space-y-2 px-4 pb-4 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-moss/12 text-moss-strong">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-[13px] font-semibold">{module.title}</p>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-ink-muted">{module.desc}</p>
                    <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">{module.zh}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================ 04 MARKET ============================ */}
        <section id="market" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="03 / Market Intelligence"
            title="先建立竞争认知，再谈增长"
            titleEn="Positioning Matrix"
            description="通过市场与竞品信息建立品牌定位：横轴是价格，纵轴是品牌专业度，MORI 落在中低价位 × 中位专业度区间。"
          />
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ZoomableShot
              src={desktopShot("04-market")}
              alt="MORI 市场与竞品页面"
              caption="真实页面：价格 × 专业度矩阵 + 竞品主题拥挤度 + AI 竞品报告（Insight / Opportunity / Risk / Recommendation）。"
            />
            <div className="space-y-4">
              <div className="surface overflow-hidden p-0">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-ink-line text-[10.5px] uppercase tracking-[0.12em] text-ink-soft">
                      <th className="px-4 py-2.5">品牌</th>
                      <th className="px-3 py-2.5">价格</th>
                      <th className="px-3 py-2.5">专业度</th>
                      <th className="px-4 py-2.5">定位</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-line">
                    {context.competitors.map((competitor) => (
                      <tr key={competitor.id} className={competitor.isSelf ? "bg-moss/6" : undefined}>
                        <td className="px-4 py-2.5 font-medium">
                          {competitor.name}
                          {competitor.isSelf ? <Badge tone="moss" className="ml-2">MORI</Badge> : null}
                        </td>
                        <td className="px-3 py-2.5 font-mono">{formatCurrency(competitor.price)}</td>
                        <td className="px-3 py-2.5 font-mono">{competitor.professional}</td>
                        <td className="px-4 py-2.5 text-[11.5px] text-ink-muted">{competitor.positioning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  <span className="font-medium text-ink">数据口径：</span>
                  MORI 与 AURA LAB / NUVIA / LUMIÉ 均为虚拟品牌，价格与专业度均为 Demo / Simulated Business Data，
                  用于演示竞品分析框架，不代表真实市场调研结果。
                </p>
              </div>
              <CheckList
                items={[
                  "价格带存在结构空隙：MORI 同时避开低价爆款与高价功效型",
                  "专业度是短板 → 用「成分讲人话 + 真实使用记录」补齐信任",
                  "竞品弱点可直接转成选题清单，而不是写一份泛泛的行业分析",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ============================ 05 CONTENT STUDIO ============================ */}
        <section id="content" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="04 / Content Studio"
            title="内容不是灵感，是结构化产出"
            titleEn="Not just AI copywriting"
            description="按平台、内容类型、投放目标、主题与目标人群生成结构化内容方案，并给出可解释的评分。"
          />
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ZoomableShot
              src={desktopShot("05-content")}
              alt="MORI 内容策划页面"
              caption="真实页面：5 个小标题（含角度与「为什么有效」）+ 正文 + 抖音 15 秒脚本 + Hook / 相关性 / 转化潜力 / 品牌契合度评分。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">输入维度（结构化，不是自由输入）</p>
                <div className="space-y-2.5 text-[12px]">
                  {[
                    ["Platform", "小红书 / 抖音 / 公众号"],
                    ["Content Type", "种草 / 测评 / 知识 / 故事 / 场景 / 产品介绍"],
                    ["Campaign Goal", "曝光 / 互动 / 点击 / 转化"],
                    ["Topic", "熬夜修护 / 清爽肤感 / 学生党预算 / 30 天稳定…"],
                    ["Target Audience", "3 个 Persona（熬夜型都市新人 / 学生党 / 轻熟稳定肌）"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1 border-b border-ink-line pb-2 last:border-0 last:pb-0">
                      <span className="font-mono text-[11px] text-moss-strong">{label}</span>
                      <span className="text-[11.5px] text-ink-muted">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="surface p-4">
                <p className="label-text mb-3">业务目标 → 内容策略 → 内容生成 → 后续投放</p>
                <Chain steps={["业务目标", "内容策略", "内容生成", "投放测试"]} />
                <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
                  生成结果会写回内容库并带上评分与「为什么值得测试」，可以作为下一轮投放的素材候选，
                  而不是一堆需要人工再整理的文案。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 06 CAMPAIGN ANALYTICS ============================ */}
        <section id="campaign" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="05 / Campaign Analytics"
            title="先把数据算对，再让 AI 做解释"
            titleEn="KPI first, AI second"
            description="所有指标由统一的业务逻辑计算（含除 0 保护），AI 只负责解释与建议——它不会成为「数据真值」的来源。"
          />

          <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <MetricCard label="Spend" value={formatCurrency(totals.spend)} sub="广告花费" />
            <MetricCard label="Impressions" value={formatNumber(totals.impressions)} sub="广告曝光" />
            <MetricCard label="Clicks" value={formatNumber(totals.clicks)} sub="点击" />
            <MetricCard label="Conversions" value={formatNumber(totals.conversions)} sub="转化" />
            <MetricCard label="Revenue" value={formatCurrency(totals.revenue)} sub="Demo 口径收入" />
            <MetricCard label="CTR" value={formatPercent(totals.ctr)} sub="clicks / impressions" />
            <MetricCard label="CPC" value={formatCurrency(totals.cpc, { digits: 2 })} sub="spend / clicks" />
            <MetricCard label="CVR" value={formatPercent(totals.cvr)} sub="conversions / clicks" />
            <MetricCard label="CPA" value={formatCurrency(totals.cpa, { digits: 2 })} sub="spend / conversions" />
            <MetricCard label="ROAS" value={totals.roas.toFixed(2)} sub="revenue / spend" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ZoomableShot
              src={desktopShot("07-campaign")}
              alt="MORI 投放分析页面"
              caption="真实页面：CSV 上传、素材效率明细（含 CTR 指数）、AI 诊断（Diagnosis / Main Reason / Hypotheses / Winners / Losers / Budget Moves）。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">数据链路</p>
                <div className="space-y-2">
                  {PIPELINE.map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-moss/12 font-mono text-[10.5px] text-moss-strong">
                        {index + 1}
                      </span>
                      <span className="text-[12.5px] text-ink-muted">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="surface p-4">
                <p className="label-text mb-3">为什么这样设计</p>
                <CheckList
                  items={[
                    "指标口径只写一次：CTR / CPC / CVR / CPA / ROAS 全部在 lib/metrics.ts",
                    "AI 拿到的是计算结果，所以模型回答错不了数字（可被原始 SQL 复核）",
                    "素材级 / 渠道级 / 人群级三种切片都来自同一份明细，不会口径打架",
                  ]}
                />
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  以上数据全部来自 MORI Demo Dataset（30 天 × 10 条素材 = {context.dataSource.rows} 行模拟记录），
                  不代表真实商业投放结果。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 07 AI GROWTH ADVISOR ============================ */}
        <section id="advisor" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="06 / AI Growth Advisor"
            title="From Metrics to Business Decisions"
            titleEn="Data → Diagnosis → Hypothesis → Action"
            description="顾问不是聊天框：它按固定结构回答，并且必须区分「已经发生的事实」「需要验证的假设」和「缺失的数据」。"
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ZoomableShot
              src={desktopShot("09-advisor")}
              alt="MORI AI 增长顾问页面"
              caption="真实页面：Diagnosis / Main Reason / Hypothesis（带证据与置信度）/ Recommendation / Experiment / 数据依据。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">本周案例：最近 7 天 vs 前 7 天（Demo 数据）</p>
                {comparison ? (
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                      label="CVR"
                      value={`${formatPercent(comparison.previous.cvr)} → ${formatPercent(comparison.current.cvr)}`}
                      sub={`${comparison.deltas.cvr.toFixed(1)}%`}
                    />
                    <MetricCard
                      label="ROAS"
                      value={`${comparison.previous.roas.toFixed(2)} → ${comparison.current.roas.toFixed(2)}`}
                      sub={`${comparison.deltas.roas.toFixed(1)}%`}
                    />
                    <MetricCard
                      label="CPA"
                      value={`${formatCurrency(comparison.previous.cpa, { digits: 2 })} → ${formatCurrency(comparison.current.cpa, { digits: 2 })}`}
                      sub={`+${comparison.deltas.cpa.toFixed(1)}%`}
                    />
                    <MetricCard
                      label="Conversions"
                      value={`${formatNumber(comparison.previous.conversions)} → ${formatNumber(comparison.current.conversions)}`}
                      sub={`${comparison.deltas.conversions.toFixed(1)}%`}
                    />
                  </div>
                ) : (
                  <p className="text-[12px] text-ink-muted">当前数据集没有可对比的窗口。</p>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div data-portfolio-card className="surface p-3.5">
                  <Badge tone="good">FACT</Badge>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
                    CVR、ROAS 下降而 CTR 基本稳定（{comparison ? comparison.deltas.ctr.toFixed(1) : "0.0"}%），
                    说明问题在「点击之后」的承接环节。
                  </p>
                </div>
                <div data-portfolio-card className="surface p-3.5">
                  <Badge tone="warn">HYPOTHESIS</Badge>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
                    落地页承接不足、价格解释不足、信任证据不足（需用真实数据验证，不能当成结论）。
                  </p>
                </div>
                <div data-portfolio-card className="surface p-3.5">
                  <Badge tone="info">DATA GAP</Badge>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
                    缺少
                    {comparison ? ` ${comparison.currentRange.start} ~ ${comparison.currentRange.end} ` : "最近 7 天"}
                    的转化事件日志与落地页版本变更记录，也缺少素材级 CVR 拆分。
                  </p>
                </div>
              </div>

              <div className="surface p-4">
                <p className="label-text mb-3">AI 给出的行动建议</p>
                <CheckList
                  items={[
                    "先排查埋点与回传：确认 CVR 下滑是真实业务变化还是数据问题",
                    "检查落地页版本与首屏信息：对齐素材承诺，补齐价格与信任模块",
                    "对低效素材止损：把预算转移到高效率素材，避免继续以高 CPA 消耗",
                    "启动 A/B 测试：用真实流量验证「价格解释 + 信任证据」是否有效",
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 08 EXPERIMENT LAB ============================ */}
        <section id="experiment" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="07 / Experiment Lab"
            title="Turn Insights into Experiments"
            titleEn="把假设变成可检验的实验"
            description="实验结论来自统计，而不是模型感觉：比例型指标使用双比例 z 检验，并给出最小样本量参考。"
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ZoomableShot
              src={desktopShot("10-experiments")}
              alt="MORI 实验中心页面"
              caption="真实页面：A/B 变体指标、z 值 / p 值 / 置信度、建议保留哪个变体，以及实验列表与推演状态。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">实验设计（示例）</p>
                <div className="space-y-3 text-[12px]">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="surface-muted px-3.5 py-3">
                      <p className="font-mono text-[11px] text-ink-soft">Variant A</p>
                      <p className="mt-1 font-medium">{priceExperiment?.variants[0]?.name ?? "原落地页"}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">{priceExperiment?.variants[0]?.description ?? "—"}</p>
                    </div>
                    <div className="surface-muted px-3.5 py-3">
                      <p className="font-mono text-[11px] text-ink-soft">Variant B</p>
                      <p className="mt-1 font-medium">{priceExperiment?.variants[1]?.name ?? "价格解释 + 信任证据"}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">{priceExperiment?.variants[1]?.description ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="moss">主指标：CVR</Badge>
                    <Badge tone="neutral">辅助：CPA / ROAS</Badge>
                    <Badge tone="neutral">建议补埋点：首屏滚动率 / 加购率 / 支付成功率</Badge>
                  </div>
                  {evaluation ? (
                    <div className="grid gap-2 sm:grid-cols-3">
                      <MetricCard label="z-test" value={`z=${evaluation.test?.zScore.toFixed(2) ?? "—"}`} sub={`p=${evaluation.test?.pValue.toFixed(4) ?? "—"}`} />
                      <MetricCard
                        label="Sample size"
                        value={formatNumber(requiredSampleSize(evaluation.metrics.a.cvr || 0.03, 0.15) ?? 0)}
                        sub="每组最小样本（+15% 相对提升，α=.05, power=.8）"
                      />
                      <MetricCard
                        label="Success criteria"
                        value={evaluation.test?.significant ? "达显著" : "继续收集样本"}
                        sub="若在真实流量中复现，需要扩样验证"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  <span className="font-medium text-ink">必须声明：</span>
                  所有实验均为 Demo / Simulated Experiment。基于模拟数据推演，B 方向表现更优，
                  但仍需真实流量验证——不能写成「实验已经证明 B 有效」。
                </p>
              </div>
              <CheckList
                items={[
                  "实验数据来自 Metric 表聚合（模拟数据），统计检验与结论都在服务端计算",
                  "结论只回答「是否值得继续测试」，不宣称任何真实业务结果",
                  "实验记录会落库，可在下次复盘时对照假设与实际表现",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ============================ 09 AI ENGINEERING ============================ */}
        <section id="engineering" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="08 / AI Reliability"
            title="AI 不只是「调用」，还要可靠"
            titleEn="Structured Output · Fallback · Provenance · Security"
            description="这一页不展示代码，只展示我在 AI 产品落地上最关心的四个工程问题，以及它们如何被验证。"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Layers,
                title: "Structured Output",
                body: "每个 Agent 先定义 JSON Schema，模型返回结构化对象；本地用 Zod 强校验，字段缺失/类型错误会带着错误清单重试，而不是拼一段不可控文本。",
                tags: ["Schema", "Zod Validation", "Retry"],
              },
              {
                icon: ShieldCheck,
                title: "Failure Fallback",
                body: "网络中断、超时、上游 5xx、返回非法 JSON 都能被识别，并自动回退到本地分析引擎，页面明确标注当前是 AI 还是回退状态。",
                tags: ["NETWORK_ERROR", "TIMEOUT", "HTTP 500", "INVALID_JSON"],
              },
              {
                icon: Gauge,
                title: "Data Provenance",
                body: "严格区分 Demo / 模拟数据与真实数据：Prompt、Schema、上下文载荷三层都带数据口径约束，禁止把模拟实验写成真实实验。",
                tags: ["Demo vs Real", "Prompt Rules", "Schema Hints"],
              },
              {
                icon: Boxes,
                title: "Security",
                body: "API Key 只在服务端读取与使用；前端产物里既没有 Key，也没有 Provider 域名；错误文案统一做密钥脱敏。",
                tags: ["Server-side only", "No key in bundle", "Redaction"],
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} data-portfolio-card className="surface flex h-full flex-col gap-3 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/12 text-moss-strong">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[14px] font-semibold">{card.title}</p>
                  <p className="flex-1 text-[11.5px] leading-relaxed text-ink-muted">{card.body}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                      <Badge key={tag} tone="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard value={`${FACTS.tests} tests passed`} label="自动化测试" note={`${FACTS.testFiles} 个测试文件，覆盖指标 / CSV / 统计 / AI 结构`} />
            <StatCard value="TypeScript 0 error" label="类型检查" note="tsc --noEmit" />
            <StatCard value="ESLint 0 problem" label="代码检查" note="eslint ." />
          </div>
        </section>

        {/* ============================ 10 PRODUCT QUALITY ============================ */}
        <section id="quality" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="09 / Product Quality"
            title="发布前验收结果"
            titleEn="Acceptance"
            description="这是我发布作品集前实际跑过的验收清单（不是计划，而是结果）。"
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard value={`${FACTS.pages} / ${FACTS.pages} pages`} label="核心页面可打开" note="全部 200，无空页面、无死链" />
            <StatCard value={`${FACTS.agents} / ${FACTS.agents} backend interactions`} label="按钮真的调到后端" note="逐个点击并捕获 API 响应验证" />
            <StatCard value={`${FACTS.tests} tests passed`} label="单元测试" note="含 AI 结构、CSV、指标、统计" />
            <StatCard value="0 / 0 / 0 / 0" label="TypeScript / ESLint / Console / Key 泄露" note="均为 0" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                tone: "moss" as const,
                title: "Demo Mode",
                badge: "DEMO_MODE=true",
                body: "默认状态：使用本地结构化分析引擎，所有数字仍来自数据库实时计算，无需任何 API Key 即可完整演示。",
              },
              {
                tone: "clay" as const,
                title: "AI Mode",
                badge: "DEMO_MODE=false + API Key",
                body: "接入真实模型（当前为 DeepSeek）：按平台规范生成内容、诊断投放、回答问题，结论仍受数据口径约束。",
              },
              {
                tone: "warn" as const,
                title: "Fallback Mode",
                badge: "上游失败时自动切换",
                body: "模型不可用时不会白屏：自动回退到 Demo Engine，并在结果卡片上标注原因（网络 / 超时 / 非法结构）。",
              },
            ].map((mode) => (
              <div key={mode.title} data-portfolio-card className="surface flex h-full flex-col gap-2 p-5">
                <div className="flex items-center gap-2">
                  <Badge tone={mode.tone}>{mode.title}</Badge>
                  <span className="font-mono text-[10.5px] text-ink-soft">{mode.badge}</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-ink-muted">{mode.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ZoomableShot
              src={desktopShot("12-settings-ai")}
              alt="MORI 设置页 · AI 状态与连接测试"
              caption="真实页面：Settings 显示当前 Provider（DeepSeek）、Base URL、Model、DEMO_MODE、密钥来源（只显示变量名，不显示明文）与输出方式，并可一键测试连接。"
            />
            <div className="space-y-4">
              <div className="surface p-4">
                <p className="label-text mb-3">三种模式如何切换</p>
                <div className="space-y-2.5 text-[11.5px] text-ink-muted">
                  <p>
                    <span className="font-mono text-moss-strong">DEMO_MODE=true</span> → 本地结构化分析引擎（默认，无需 Key）
                  </p>
                  <p>
                    <span className="font-mono text-moss-strong">DEMO_MODE=false + API Key</span> → 调用真实模型（Key 只放
                    <span className="font-mono"> .env.local</span>，已被 git 忽略）
                  </p>
                  <p>
                    <span className="font-mono text-moss-strong">上游失败</span> → 自动回退到 Demo 引擎，并在结果卡片标注原因
                  </p>
                </div>
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="text-[11.5px] leading-relaxed text-ink-muted">
                  <span className="font-medium text-ink">安全设计：</span>
                  API Key 只在服务端读取与使用。验收时扫描过前端产物与所有页面 HTML：
                  既没有 Key，也没有 Provider 域名；错误文案会统一做密钥脱敏。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 11 MY ROLE ============================ */}
        <section id="role" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="10 / My Role"
            title="我负责什么"
            titleEn="Business × AI × Product"
            description="我不是计算机专业出身，也没有把项目包装成「我独立完成了全部代码」。下面是我实际负责的部分。"
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface p-5">
              <p className="label-text mb-3">我负责</p>
              <CheckList
                items={[
                  "Business Problem Definition：从营销增长的日常痛点定义问题边界",
                  "Product Structure：设计 14 个模块的信息架构与页面职责",
                  "User Flow：确定「洞察 → 内容 → 投放 → 诊断 → 实验 → 报告」的操作顺序",
                  "AI Agent Design：拆出 7 个 Agent，划分各自职责与输出契约",
                  "Prompt Design：编写并迭代每个 Agent 的 Prompt 与数据口径规则",
                  "Metric Definition：定义 CTR / CPC / CVR / CPA / ROAS 的统一口径",
                  "Experiment Design：设计 A/B 方案、主辅指标与显著性判断方式",
                  "Testing & QA：指标复核、边界与失败场景验收、发布前验收清单",
                  "Iteration：根据验收与真实调用结果持续修正（例如字段缺失、超时、口径）",
                ]}
              />
            </div>
            <div className="space-y-4">
              <div className="surface p-5">
                <p className="label-text mb-3">开发实现方式</p>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">
                  开发实现过程中使用 Codex 辅助代码开发（脚手架、页面与组件实现、测试与重构）。
                  我负责的是产品判断与验收：定义要解决什么问题、AI 应该按什么结构输出、指标怎么算、
                  失败时产品应该怎么表现，并逐项验证结果是否符合预期。
                </p>
              </div>
              <div className="rounded-2xl border border-moss/25 bg-moss/10 p-5">
                <p className="font-serif text-[17px] italic leading-relaxed text-moss-strong">
                  “我不是单纯使用 AI 生成内容，而是在设计 AI 如何参与业务决策。”
                </p>
              </div>
              <div className="surface p-4">
                <p className="label-text mb-2">我的核心工作</p>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">把业务问题拆解成 AI 可以执行的软件流程。</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ 12 WHAT I LEARNED ============================ */}
        <section id="learnings" className="scroll-mt-24 pt-24">
          <SectionHeading index="11 / Reflection" title="What I Learned" titleEn="三点体会" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { index: "01", title: "AI 不是聊天框，而是业务流程中的决策杠杆", body: "同一个模型，放进「有上下文、有口径、有下一步动作」的流程里，价值完全不同。" },
              { index: "02", title: "AI 产品必须建立在可靠的数据和明确的业务逻辑上", body: "先把指标算对、把口径写死，AI 才能被信任；否则只是把不确定性包装得更漂亮。" },
              { index: "03", title: "真正有价值的 AI 应用不是「生成了什么」，而是「帮助业务做出了什么更好的决策」", body: "衡量标准应该是决策质量与实验效率，而不是输出字数。" },
            ].map((item) => (
              <div key={item.index} data-portfolio-card className="surface flex h-full flex-col gap-3 p-5">
                <span className="font-mono text-[12px] text-moss-strong">{item.index}</span>
                <p className="text-[13.5px] font-semibold leading-snug">{item.title}</p>
                <p className="text-[11.5px] leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================ 13 LIMITATIONS ============================ */}
        <section id="limitations" className="scroll-mt-24 pt-24">
          <SectionHeading
            index="12 / Limitations"
            title="Limitations"
            titleEn="诚实说明边界"
            description="主动写清边界，比夸大能力更可信，也更接近真实的工作方式。"
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="surface p-5">
              <p className="label-text mb-3">当前限制</p>
              <CheckList
                tone="warn"
                items={[
                  "MORI 当前使用 Demo / Simulated Business Data（虚拟品牌 + 模拟投放与实验数据）",
                  "没有真实广告平台数据（CSV 是唯一数据入口）",
                  "没有真实商业客户与真实用户",
                  "Experiment Lab 的实验结果不是实际商业实验，只是模拟数据推演",
                  "SQLite 当前用于作品集 Demo，不适合多用户生产环境",
                  "没有做登录、权限、多租户等生产级功能（刻意保持作品集范围）",
                ]}
              />
            </div>
            <div className="surface p-5">
              <p className="label-text mb-3">下一阶段</p>
              <Chain steps={["Real Data", "Real Traffic", "Real Experiment", "Real Optimization"]} />
              <div className="mt-4 space-y-3">
                <CheckList
                  items={[
                    "接入真实广告平台与电商数据，替换 CSV 手动入口",
                    "用真实流量跑 A/B 实验，把「模拟推演」升级为「真实结论」",
                    "建立评估集与回归流程，让 Prompt 迭代有可比较的基线",
                    "补上权限、审计与多品牌工作区，走向可交付给团队使用的形态",
                  ]}
                />
              </div>
              <p className="mt-4 text-[11.5px] leading-relaxed text-ink-soft">
                这份作品集不声称任何真实商业成绩；它证明的是：我能把业务问题拆成 AI 可执行的流程，
                并把流程做到可运行、可复核、可继续迭代。
              </p>
            </div>
          </div>
        </section>

        {/* ============================ 14 FINAL ============================ */}
        <section id="final" className="scroll-mt-24 pt-24">
          <div className="rounded-3xl border border-ink-line bg-surface p-8 md:p-12">
            <p className="label-text">MORI AI Growth OS</p>
            <h2 className="mt-4 font-serif text-[28px] leading-tight md:text-[38px]">
              From Data
              <span className="text-ink-soft"> to </span>
              Insight
              <span className="text-ink-soft"> to </span>
              Action
              <span className="text-ink-soft"> to </span>
              Experiment.
            </h2>
            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[20px] font-semibold">谢雨蕾</p>
                <p className="mt-1 text-[12.5px] text-ink-muted">商科背景 × AI 应用 × 产品运营 × 数据分析</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["AI Product Operations", "AI Business Operations", "AI Growth", "Marketing Operations"].map((role) => (
                  <Badge key={role} tone="moss">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink-line pt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-canvas transition-colors hover:bg-ink/90"
              >
                打开产品演示 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 rounded-full border border-ink-line px-5 py-2.5 text-[13px] text-ink transition-colors hover:bg-surface-muted"
              >
                作品集入口 /portfolio
              </Link>
              <span className="text-[11.5px] text-ink-soft">
                所有业务数据均为 Demo / 模拟业务数据（{formatCompactNumber(context.dataSource.rows)} 条模拟投放记录），不代表真实商业结果。
              </span>
            </div>
          </div>
        </section>
        <footer className="mt-14 border-t border-ink-line pt-6 text-[11px] leading-relaxed text-ink-soft">
          MORI AI Growth OS · Case Study by 谢雨蕾。品牌与竞品均为虚拟，数据为模拟数据；
          本项目重点验证 AI 在营销分析与增长决策中的应用工作流。
        </footer>
      </main>
    </div>
  );
}

function toVariantMetrics(
  variant: {
    label: string;
    name: string;
    description: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  },
  fallbackLabel: string,
): VariantMetrics {
  return {
    label: variant.label || fallbackLabel,
    name: variant.name,
    description: variant.description,
    impressions: variant.impressions,
    clicks: variant.clicks,
    conversions: variant.conversions,
    spend: variant.spend,
    revenue: variant.revenue,
  };
}
```

## `src/components/advisor/advisor-console.tsx`

```tsx
"use client";

import { Bot, Send, Sparkles, User } from "lucide-react";
import * as React from "react";

import { SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Progress, StatusBadge } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/field";
import type { GrowthAdvice } from "@/lib/ai/schemas";
import type { AgentRunMeta } from "@/types";

const SUGGESTIONS = [
  "最近 ROAS 为什么下降？",
  "哪些素材应该增加预算？",
  "18–24 岁女性为什么点击高但不买？",
  "小红书和抖音应该怎么分配预算？",
  "下周应该优先做什么？",
];

type Message = {
  id: string;
  question: string;
  answer?: GrowthAdvice;
  meta?: AgentRunMeta;
  error?: string;
  pending: boolean;
};

export function AdvisorConsole({ datasetId }: { datasetId?: string | null }) {
  const [question, setQuestion] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [busy, setBusy] = React.useState(false);

  const ask = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) return;

      const id = `${Date.now()}`;
      setMessages((prev) => [{ id, question: trimmed, pending: true }, ...prev]);
      setQuestion("");
      setBusy(true);

      try {
        const response = await fetch("/api/advisor/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed, datasetId: datasetId ?? null }),
        });
        const json = (await response.json()) as {
          ok: boolean;
          data?: GrowthAdvice;
          meta?: AgentRunMeta;
          error?: { code: string; message: string };
        };

        if (!response.ok || !json.ok || !json.data || !json.meta) {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === id
                ? { ...message, pending: false, error: json.error?.message ?? "AI 顾问暂时无法回答，请稍后重试。" }
                : message,
            ),
          );
          return;
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === id ? { ...message, pending: false, answer: json.data, meta: json.meta } : message,
          ),
        );
      } catch (error) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === id
              ? {
                  ...message,
                  pending: false,
                  error: error instanceof Error ? `网络或服务异常：${error.message}` : "网络或服务异常",
                }
              : message,
          ),
        );
      } finally {
        setBusy(false);
      }
    },
    [datasetId],
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>向 AI 增长顾问提问</CardTitle>
            <CardDescription>
              AI 已加载 MORI 的品牌、产品、人群、竞品、投放数据、内容库与实验历史，回答会引用具体指标。
            </CardDescription>
          </div>
          <Badge tone="moss">
            <Sparkles className="h-3 w-3" /> Growth Advisor
          </Badge>
        </CardHeader>
        <CardContent>
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                void ask(question);
              }
            }}
            placeholder="例如：最近 ROAS 为什么下降？哪些素材应该加预算？"
            className="min-h-[92px]"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="moss" size="md" loading={busy} loadingLabel="Advisor is thinking…" onClick={() => ask(question)} disabled={question.trim().length < 2}>
              <Send className="h-3.5 w-3.5" /> 提交问题
            </Button>
            <span className="text-[11px] text-ink-soft">⌘ / Ctrl + Enter 快速提交</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <Badge
                key={suggestion}
                tone="neutral"
                className="cursor-pointer hover:border-moss/40 hover:text-ink"
                role="button"
                onClick={() => setQuestion(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {messages.length === 0 ? (
        <Alert tone="info" title="为什么这不是一个普通聊天窗口">
          顾问的每一次回答都必须按固定结构输出：Diagnosis（发生了什么）→ Main Reason（为什么）→ Hypothesis（假设，附证据与置信度）→
          Recommendation（怎么改）→ Experiment（如何验证）。所有数字来自数据库当前计算结果，并且数据库里没有的字段不会被编造。
        </Alert>
      ) : null}

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-canvas">
                <User className="h-3.5 w-3.5" />
              </span>
              <p className="text-[13.5px] font-medium">{message.question}</p>
            </div>

            <div className="ml-0.5 flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-moss/15 text-moss-strong">
                <Bot className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                {message.pending ? (
                  <div className="surface space-y-2 p-4">
                    <p className="text-[12px] text-ink-muted">正在读取投放数据、分人群指标与实验历史…</p>
                    <Progress value={60} tone="moss" />
                  </div>
                ) : null}

                {message.error ? <Alert tone="error" title="咨询失败">{message.error}</Alert> : null}

                {message.answer && message.meta ? <AdvisorAnswer advice={message.answer} meta={message.meta} /> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvisorAnswer({ advice, meta }: { advice: GrowthAdvice; meta: AgentRunMeta }) {
  return (
    <div className="space-y-3.5">
      <div className="surface animate-fade-up space-y-3.5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge mode={meta.mode} warning={meta.warning} />
          <Badge tone="neutral">{meta.model}</Badge>
          <Badge tone="neutral">Prompt {meta.promptVersion}</Badge>
          <span className="text-[11px] text-ink-soft">{meta.latencyMs}ms</span>
        </div>

        <Block label="Diagnosis" content={advice.diagnosis} />
        <Block label="Main Reason" content={advice.mainReason} />

        <div>
          <p className="label-text mb-2">Hypothesis</p>
          <div className="grid gap-2.5 md:grid-cols-3">
            {advice.hypotheses.map((item) => (
              <div key={item.hypothesis} className="surface-muted flex h-full flex-col gap-2 px-3.5 py-3">
                <p className="text-[12px] font-medium leading-snug">{item.hypothesis}</p>
                <Progress value={item.confidence} tone={item.confidence >= 75 ? "good" : "warn"} />
                <p className="text-[11px] leading-relaxed text-ink-muted">{item.evidence}</p>
                <p className="mt-auto text-[10.5px] text-ink-soft">置信度 {item.confidence}/100</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="label-text mb-2">Recommendation</p>
          <ol className="space-y-2">
            {advice.recommendation.map((item, index) => (
              <li key={item} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/12 font-mono text-[10px] text-moss-strong">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="surface-muted px-4 py-3.5">
          <p className="label-text mb-2">Experiment</p>
          <p className="text-[13px] font-semibold">{advice.experiment.name}</p>
          <div className="mt-2 grid gap-1.5 text-[11.5px] text-ink-muted md:grid-cols-2">
            <p>A：{advice.experiment.variantA}</p>
            <p>B：{advice.experiment.variantB}</p>
            <p>
              主指标：<span className="font-mono">{advice.experiment.metric}</span>
            </p>
            <p>成功标准：{advice.experiment.successCriteria}</p>
          </div>
          {meta.warning ? (
            <p className="mt-2 text-[11px] text-tone-warn">{meta.warning}</p>
          ) : null}
        </div>

        <div className="surface-muted px-4 py-3">
          <p className="label-text mb-2">数据依据</p>
          <ul className="space-y-1.5">
            {advice.dataUsed.map((item) => (
              <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SignalBlocks bundle={advice} columns={2} />
    </div>
  );
}

function Block({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="label-text mb-1">{label}</p>
      <p className="text-[13px] leading-relaxed text-ink-muted">{content}</p>
    </div>
  );
}
```

## `src/components/ai/agent-runner.tsx`

```tsx
"use client";

import { AlertCircle, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import * as React from "react";

import { Alert, StatusBadge } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AgentRunMeta } from "@/types";

export type RunState = "idle" | "loading" | "success" | "error" | "disabled";

export type AgentResponse<T> = {
  ok: boolean;
  data: T;
  meta: AgentRunMeta;
  error?: { code: string; message: string };
};

export type AgentRunnerProps<T> = {
  endpoint: string;
  payload: Record<string, unknown>;
  labels?: {
    idle?: string;
    loading?: string;
    success?: string;
    error?: string;
    retry?: string;
  };
  disabled?: boolean;
  disabledHint?: string;
  variant?: "primary" | "moss" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  render: (data: T, meta: AgentRunMeta) => React.ReactNode;
  onSuccess?: (data: T, meta: AgentRunMeta) => void;
  autoRun?: boolean;
  /** extra buttons rendered next to the trigger (e.g. "保存到内容库") */
  renderFooter?: (data: T, meta: AgentRunMeta) => React.ReactNode;
};

export function AgentRunner<T>({
  endpoint,
  payload,
  labels,
  disabled = false,
  disabledHint,
  variant = "moss",
  size = "md",
  className,
  render,
  onSuccess,
  autoRun = false,
  renderFooter,
}: AgentRunnerProps<T>) {
  const [state, setState] = React.useState<RunState>(disabled ? "disabled" : "idle");
  const [data, setData] = React.useState<T | null>(null);
  const [meta, setMeta] = React.useState<AgentRunMeta | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const payloadKey = React.useMemo(() => JSON.stringify(payload), [payload]);

  const run = React.useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadKey,
      });

      const json = (await response.json()) as AgentResponse<T>;

      if (!response.ok || !json.ok) {
        setState("error");
        setError(json.error?.message ?? `请求失败（HTTP ${response.status}）`);
        return;
      }

      setData(json.data);
      setMeta(json.meta);
      setState("success");
      onSuccess?.(json.data, json.meta);
    } catch (caught) {
      setState("error");
      setError(
        caught instanceof Error
          ? `网络或服务异常：${caught.message}`
          : "网络或服务异常，请稍后重试。",
      );
    }
  }, [endpoint, payloadKey, onSuccess]);

  React.useEffect(() => {
    if (disabled) setState("disabled");
    else setState((prev) => (prev === "disabled" ? (autoRun ? "loading" : "idle") : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={variant} size={size} loading={state === "loading"} loadingLabel={labels?.loading ?? "Analyzing…"} onClick={run} disabled={disabled}>
          {state === "success" || state === "error" ? (
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          )}
          {state === "success" || state === "error"
            ? (labels?.retry ?? "重新生成")
            : (labels?.idle ?? "生成 AI 分析")}
        </Button>

        {state === "loading" ? (
          <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-moss" />
            {labels?.loading ?? "Analyzing…"}
          </span>
        ) : null}

        {state === "success" && meta ? (
          <>
            <span className="flex items-center gap-1.5 text-[12px] text-tone-good">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              {labels?.success ?? "Analysis completed"}
            </span>
            <StatusBadge mode={meta.mode} />
            <Badge tone="neutral" title={`Prompt ${meta.promptVersion}`}>
              {meta.promptVersion}
            </Badge>
            <span className="text-[11px] text-ink-soft">
              {meta.model} · {meta.latencyMs}ms
            </span>
          </>
        ) : null}

        {state === "disabled" && disabledHint ? (
          <span className="text-[12px] text-ink-soft">{disabledHint}</span>
        ) : null}
      </div>

      {state === "error" ? (
        <Alert tone="error" title={labels?.error ?? "Unable to generate insights."}>
          {error}
        </Alert>
      ) : null}

      {meta?.warning && state === "success" ? (
        <Alert tone="warning" title="AI 调用提示">
          {meta.warning}
        </Alert>
      ) : null}

      {state === "success" && data && meta ? (
        <div className="space-y-4 animate-fade-up">
          {render(data, meta)}
          {renderFooter ? <div className="flex flex-wrap items-center gap-2">{renderFooter(data, meta)}</div> : null}
        </div>
      ) : null}

      {state === "idle" ? (
        <div className="flex items-start gap-2 rounded-xl border border-dashed border-ink-line bg-surface-muted/50 px-4 py-6 text-[12px] text-ink-muted">
          <AlertCircle className="mt-0.5 h-4 w-4 text-ink-soft" aria-hidden />
          <p>
            点击上方按钮开始分析。结果由结构化输出（JSON Schema）驱动，页面负责渲染，不会出现大段不可控文本。
          </p>
        </div>
      ) : null}
    </div>
  );
}
```

## `src/components/ai/signal-blocks.tsx`

```tsx
import { Compass, Lightbulb, ShieldAlert, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import type { Signal, SignalBundle } from "@/types";

const GROUPS = [
  {
    key: "insights" as const,
    title: "AI 洞察",
    titleEn: "Insight",
    icon: Lightbulb,
    tone: "moss" as const,
    bar: "moss" as const,
  },
  {
    key: "opportunities" as const,
    title: "增长机会",
    titleEn: "Opportunity",
    icon: TrendingUp,
    tone: "good" as const,
    bar: "good" as const,
  },
  {
    key: "risks" as const,
    title: "风险提示",
    titleEn: "Risk",
    icon: ShieldAlert,
    tone: "warn" as const,
    bar: "warn" as const,
  },
  {
    key: "recommendations" as const,
    title: "行动建议",
    titleEn: "Recommendation",
    icon: Compass,
    tone: "info" as const,
    bar: "info" as const,
  },
];

export function SignalCard({ signal, tone = "moss" }: { signal: Signal; tone?: "moss" | "good" | "warn" | "info" }) {
  return (
    <article className="surface flex h-full flex-col gap-2.5 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[13.5px] font-semibold leading-snug">{signal.title}</h3>
        <Badge tone={tone}>{signal.confidence}</Badge>
      </div>
      <p className="flex-1 text-[12.5px] leading-relaxed text-ink-muted">{signal.body}</p>
      <div className="space-y-2 border-t border-ink-line pt-2.5">
        <Progress value={signal.confidence} tone={tone} />
        <p className="text-[11px] leading-relaxed text-ink-soft">
          <span className="font-medium text-ink-muted">依据：</span>
          {signal.evidence}
        </p>
      </div>
    </article>
  );
}

export function SignalBlocks({
  bundle,
  columns = 2,
  className,
  emptyHint,
}: {
  bundle: SignalBundle;
  columns?: 1 | 2 | 4;
  className?: string;
  emptyHint?: string;
}) {
  const total = GROUPS.reduce((acc, group) => acc + bundle[group.key].length, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-line bg-surface-muted/50 px-4 py-6 text-[12px] text-ink-muted">
        {emptyHint ?? "暂无结构化结论。"}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", columns === 1 ? "grid-cols-1" : columns === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2", className)}>
      {GROUPS.map((group) => {
        const signals = bundle[group.key];
        if (signals.length === 0) return null;
        const Icon = group.icon;
        return (
          <div key={group.key} className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-ink-soft" aria-hidden />
              <p className="text-[12px] font-medium text-ink">{group.title}</p>
              <span className="font-serif text-[11px] italic text-ink-soft">{group.titleEn}</span>
              <Badge tone={group.tone}>{signals.length}</Badge>
            </div>
            <div className="space-y-2.5">
              {signals.map((signal) => (
                <SignalCard key={signal.title} signal={signal} tone={group.bar} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BulletList({
  title,
  items,
  tone = "moss",
}: {
  title: string;
  items: string[];
  tone?: "moss" | "good" | "warn" | "info";
}) {
  return (
    <div className="surface p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <p className="text-[13px] font-semibold">{title}</p>
        <Badge tone={tone}>{items.length}</Badge>
      </div>
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={item} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/12 font-mono text-[10px] text-moss-strong">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function MetaList({ items, title = "数据依据" }: { items: string[]; title?: string }) {
  return (
    <div className="surface-muted px-4 py-3">
      <p className="label-text mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## `src/components/audience/audience-workbench.tsx`

```tsx
"use client";

import { AgentRunner } from "@/components/ai/agent-runner";
import { BulletList, SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/feedback";
import type { AudienceAnalysis } from "@/lib/ai/schemas";

const OPPORTUNITY_CARDS = [
  { key: "user" as const, title: "用户机会", titleEn: "User", tone: "moss" as const },
  { key: "content" as const, title: "内容机会", titleEn: "Content", tone: "good" as const },
  { key: "product" as const, title: "产品机会", titleEn: "Product", tone: "info" as const },
  { key: "ad" as const, title: "广告机会", titleEn: "Ad", tone: "clay" as const },
];

export function AudienceWorkbench({ datasetId }: { datasetId?: string | null }) {
  return (
    <AgentRunner<AudienceAnalysis>
      endpoint="/api/audience/analyze"
      payload={{ datasetId: datasetId ?? null }}
      variant="moss"
      labels={{
        idle: "AI 分析用户",
        loading: "Analyzing audience...",
        success: "Analysis completed",
        error: "Unable to generate insights.",
      }}
      render={(data) => (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>人群机会总结</CardTitle>
                <CardDescription>基于 Persona 表与分人群投放指标生成。</CardDescription>
              </div>
              <Badge tone="moss">{data.personas.length} 个人群</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-[13px] leading-relaxed text-ink-muted">{data.summary}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {OPPORTUNITY_CARDS.map((card) => (
              <Card key={card.key} className="h-full">
                <CardHeader>
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>
                      <span className="font-serif italic">{card.titleEn} Opportunity</span>
                    </CardDescription>
                  </div>
                  <Badge tone={card.tone}>{data.opportunityCards[card.key].length}</Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {data.opportunityCards[card.key].map((item) => (
                      <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink-muted">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>推荐广告角度</CardTitle>
                  <CardDescription>可直接作为素材开头的 Hook，与人群痛点一一对应。</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.adAngles.map((angle) => (
                  <div key={angle.angle} className="surface-muted px-4 py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold">{angle.angle}</p>
                      <Badge tone="neutral">{angle.audience}</Badge>
                    </div>
                    <p className="mt-2 text-[12.5px] font-medium text-ink">「{angle.hook}」</p>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">{angle.rationale}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>人群画像明细</CardTitle>
                  <CardDescription>AI 对每个人群的结构化解读（痛点 / 动机 / 阻力 / 内容偏好）。</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.personas.map((persona) => (
                  <div key={persona.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold">{persona.name}</p>
                      <span className="text-[11px] text-ink-soft">{persona.segment}</span>
                    </div>
                    <Progress value={Math.min(100, persona.painPoints.length * 22)} tone="moss" />
                    <ul className="space-y-1 text-[11.5px] leading-relaxed text-ink-muted">
                      {persona.painPoints.slice(0, 2).map((item) => (
                        <li key={item}>· {item}</li>
                      ))}
                      <li className="text-ink-soft">· 购买阻力：{persona.barriers[0] ?? "—"}</li>
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <SignalBlocks bundle={data} columns={2} />

          <BulletList title="下一步动作" items={data.recommendations.map((item) => item.body)} tone="info" />
        </div>
      )}
    />
  );
}
```

## `src/components/audience/persona-card.tsx`

```tsx
import { Quote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/feedback";
import type { PersonaRecord } from "@/types";

export function PersonaCard({ persona }: { persona: PersonaRecord }) {
  return (
    <article className="surface flex h-full flex-col gap-3.5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold">{persona.name}</h3>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            {persona.ageBand} 岁 · {persona.occupation}
          </p>
        </div>
        <Badge tone="moss">{(persona.share * 100).toFixed(0)}% 人群占比</Badge>
      </div>

      <Progress value={persona.share * 100} tone="moss" />

      <div className="surface-muted flex gap-2 px-3.5 py-3">
        <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-soft" aria-hidden />
        <p className="text-[12px] italic leading-relaxed text-ink-muted">{persona.quote}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Block title="核心痛点" items={persona.painPoints} />
        <Block title="消费动机" items={persona.motivations} />
        <Block title="内容偏好" items={persona.contentPreferences} />
        <Block title="购买阻力" items={persona.barriers} tone="warn" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-ink-line pt-3">
        <span className="label-text">购买驱动</span>
        {persona.purchaseDrivers.map((driver) => (
          <Badge key={driver} tone="neutral">
            {driver}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="label-text">主要渠道</span>
        {persona.channels.map((channel) => (
          <Badge key={channel} tone="clay">
            {channel}
          </Badge>
        ))}
      </div>

      <p className="text-[11px] text-ink-soft">
        地域：{persona.city} · 数据来源：Persona 表（Demo / 模拟业务数据）
      </p>
    </article>
  );
}

function Block({ title, items, tone = "neutral" }: { title: string; items: string[]; tone?: "neutral" | "warn" }) {
  return (
    <div>
      <p className="label-text mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
            <span
              className={
                tone === "warn"
                  ? "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-tone-warn"
                  : "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss"
              }
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## `src/components/campaign/campaign-analysis.tsx`

```tsx
"use client";

import { AlertOctagon, ArrowRight, CreditCard, Target, TrendingDown, TrendingUp } from "lucide-react";

import { AgentRunner } from "@/components/ai/agent-runner";
import { SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/feedback";
import type { CampaignAnalysis } from "@/lib/ai/schemas";

export type CampaignAnalyzeResponse = {
  analysis: CampaignAnalysis;
  snapshot: {
    datasetLabel: string;
    rows: number;
    period: { start: string; end: string; label: string; days: number };
    totals: { spend: number; ctr: number; cvr: number; cpa: number; roas: number };
    comparison: { deltas: Record<string, number> } | null;
  };
};

export function CampaignAnalysisPanel({ datasetId }: { datasetId?: string | null }) {
  return (
    <AgentRunner<CampaignAnalyzeResponse>
      endpoint="/api/campaign/analyze"
      payload={{ datasetId: datasetId ?? null }}
      labels={{
        idle: "AI Analyze Campaign",
        loading: "Analyzing campaign...",
        success: "Analysis completed",
        error: "Unable to generate insights.",
      }}
      render={({ analysis }) => (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>诊断结论</CardTitle>
                <CardDescription>{analysis.summary}</CardDescription>
              </div>
              <Badge tone="moss">Performance Analyst</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="surface-muted px-4 py-3.5">
                <p className="label-text mb-1">Diagnosis</p>
                <p className="text-[13px] leading-relaxed text-ink">{analysis.diagnosis}</p>
              </div>
              <div className="surface-muted px-4 py-3.5">
                <p className="label-text mb-1">Main Reason</p>
                <p className="text-[13px] leading-relaxed text-ink">{analysis.mainReason}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3.5 md:grid-cols-3">
            {analysis.hypotheses.map((hypothesis) => (
              <Card key={hypothesis.hypothesis} className="h-full">
                <CardHeader>
                  <CardTitle className="text-[13px] leading-snug">{hypothesis.hypothesis}</CardTitle>
                  <Badge tone={hypothesis.confidence >= 75 ? "good" : hypothesis.confidence >= 60 ? "warn" : "neutral"}>
                    {hypothesis.confidence}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Progress value={hypothesis.confidence} tone={hypothesis.confidence >= 75 ? "good" : "warn"} />
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">{hypothesis.evidence}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-tone-good" /> 高表现素材
                  </CardTitle>
                  <CardDescription>建议加预算或复制结构</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.winners.map((item) => (
                  <div key={item.creative} className="surface-muted px-4 py-3">
                    <p className="text-[13px] font-medium">{item.creative}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{item.why}</p>
                    <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-tone-good">
                      <Target className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {item.action}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-tone-bad" /> 低表现素材
                  </CardTitle>
                  <CardDescription>建议止损、换 Hook 或暂停</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.losers.map((item) => (
                  <div key={item.creative} className="surface-muted px-4 py-3">
                    <p className="text-[13px] font-medium">{item.creative}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{item.why}</p>
                    <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-tone-warn">
                      <AlertOctagon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {item.action}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-moss-strong" /> 预算调整建议
                </CardTitle>
                <CardDescription>从低效素材把预算转移到高效素材与测试预算。</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.budgetMoves.map((move) => (
                <div key={move.from + move.to} className="surface-muted flex flex-col gap-1.5 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium">
                    <span className="text-tone-bad">{move.from}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-ink-soft" />
                    <span className="text-tone-good">{move.to}</span>
                    <Badge tone="neutral">{move.amount}</Badge>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-ink-muted">{move.rationale}</p>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="label-text">建议继续测试的人群</span>
                {analysis.audiencesToTest.map((item) => (
                  <Badge key={item} tone="clay">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>下一轮实验建议</CardTitle>
                <CardDescription>可直接到实验中心创建并跟踪。</CardDescription>
              </div>
              <Badge tone="moss">{analysis.experiments.length} 个</Badge>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {analysis.experiments.map((experiment) => (
                <div key={experiment.name} className="surface-muted px-4 py-3.5">
                  <p className="text-[13px] font-semibold">{experiment.name}</p>
                  <div className="mt-2 space-y-1 text-[11.5px] text-ink-muted">
                    <p>A：{experiment.variantA}</p>
                    <p>B：{experiment.variantB}</p>
                    <p>
                      主指标：<span className="font-mono">{experiment.metric}</span>
                    </p>
                    <p className="text-ink-soft">假设：{experiment.hypothesis}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <SignalBlocks bundle={analysis} columns={2} />
        </div>
      )}
    />
  );
}
```

## `src/components/campaign/csv-uploader.tsx`

```tsx
"use client";

import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Separator } from "@/components/ui/feedback";
import { FieldGroup, Textarea } from "@/components/ui/field";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

type UploadIssue = { row: number; column: string; message: string; severity: "error" | "warning" };

type UploadData = {
  dataset: { id: string; name: string; rowCount: number; note: string };
  inserted: number;
  issues: UploadIssue[];
  skippedRows: number;
  totalRows: number;
  platforms: string[];
  creatives: string[];
  dateRange: { start: string; end: string } | null;
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    cpc: number;
    cvr: number;
    cpa: number;
    roas: number;
  };
};

type UploadResponse = {
  ok: boolean;
  data?: UploadData;
  error?: { code: string; message: string; details?: { issues?: UploadIssue[] } };
};

const EXPECTED_HEADER = "date,platform,campaign,creative,spend,impressions,clicks,conversions,revenue";

export function CsvUploader({ onUploaded }: { onUploaded?: (datasetId: string) => void }) {
  const router = useRouter();
  const [fileName, setFileName] = React.useState("");
  const [csv, setCsv] = React.useState("");
  const [state, setState] = React.useState<"idle" | "uploading" | "success" | "error">("idle");
  const [result, setResult] = React.useState<UploadData | null>(null);
  const [error, setError] = React.useState<{ code: string; message: string; issues: UploadIssue[] } | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const readFile = React.useCallback(async (file: File) => {
    setFileName(file.name);
    try {
      const text = await file.text();
      setCsv(text);
      setState("idle");
      setResult(null);
      setError(null);
    } catch {
      setError({ code: "READ_FAILED", message: "无法读取该文件，请确认是 UTF-8 编码的 CSV。", issues: [] });
      setState("error");
    }
  }, []);

  const upload = React.useCallback(async () => {
    if (!csv.trim()) {
      setError({ code: "EMPTY_FILE", message: "请先选择 CSV 文件或粘贴 CSV 内容。", issues: [] });
      setState("error");
      return;
    }

    setState("uploading");
    setError(null);
    try {
      const response = await fetch("/api/campaign/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: fileName || "pasted-campaign-data.csv", csv }),
      });
      const json = (await response.json()) as UploadResponse;

      if (!response.ok || !json.ok || !json.data) {
        setState("error");
        setError({
          code: json.error?.code ?? "UPLOAD_FAILED",
          message: json.error?.message ?? `上传失败（HTTP ${response.status}）`,
          issues: json.error?.details?.issues ?? [],
        });
        return;
      }

      setResult(json.data);
      setState("success");
      onUploaded?.(json.data.dataset.id);
    } catch (caught) {
      setState("error");
      setError({
        code: "NETWORK_ERROR",
        message: caught instanceof Error ? `网络或服务异常：${caught.message}` : "网络或服务异常",
        issues: [],
      });
    }
  }, [csv, fileName, onUploaded]);

  const previewLines = csv.split(/\r?\n/).filter(Boolean).slice(0, 4);
  const dataRowCount = Math.max(csv.split(/\r?\n/).filter(Boolean).length - 1, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>上传投放数据（CSV）</CardTitle>
            <CardDescription>
              字段要求：{EXPECTED_HEADER}。支持中文表头，以及带 ¥ / 千分位 / 百分号的数字。
            </CardDescription>
          </div>
          <a href="/api/campaign/sample" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            <Download className="h-3.5 w-3.5" /> 下载示例 CSV
          </a>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void readFile(file);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
              dragging ? "border-moss bg-moss/8" : "border-ink-line bg-surface-muted/50",
            )}
          >
            <UploadCloud className="h-6 w-6 text-ink-soft" />
            <p className="text-[13px] font-medium">拖拽 CSV 到这里，或选择文件</p>
            <p className="text-[11.5px] text-ink-muted">
              单文件最多 20,000 行；系统会自动清洗、计算指标并写入数据库。
            </p>
            <label className={cn(buttonVariants({ variant: "primary", size: "sm" }), "mt-1 cursor-pointer")}>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readFile(file);
                }}
              />
              选择文件
            </label>
            {fileName ? (
              <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                {fileName} · {dataRowCount} 行
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3.5 lg:grid-cols-2">
            <FieldGroup label="或直接粘贴 CSV 文本" hint="适合从报表后台直接复制数据。">
              <Textarea
                value={csv}
                onChange={(event) => {
                  setCsv(event.target.value);
                  setFileName("pasted-campaign-data.csv");
                }}
                placeholder={EXPECTED_HEADER + "\n2026-09-01,抖音,夜间修护 · 抖音效率拉新,熬夜党晚间修护,4290,162000,3900,196,26600"}
                className="min-h-[132px] font-mono text-[11px]"
              />
            </FieldGroup>

            <div className="space-y-3">
              <p className="label-text">数据预览</p>
              {previewLines.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-line px-3.5 py-6 text-center text-[11.5px] text-ink-soft">
                  暂无内容
                </p>
              ) : (
                <div className="max-h-[150px] overflow-auto rounded-xl border border-ink-line bg-surface-muted/60 p-3 font-mono text-[10.5px] leading-relaxed text-ink-muted">
                  {previewLines.map((line) => (
                    <p key={line.slice(0, 32)} className="truncate">
                      {line}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="moss" size="sm" loading={state === "uploading"} loadingLabel="上传并计算中…" onClick={upload}>
                  上传并计算指标
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCsv("");
                    setFileName("");
                    setResult(null);
                    setError(null);
                    setState("idle");
                  }}
                >
                  清空
                </Button>
              </div>
            </div>
          </div>

          {state === "error" && error ? (
            <div className="mt-4 space-y-3">
              <Alert tone="error" title={"CSV 校验失败（" + error.code + "）"}>
                {error.message}
              </Alert>
              {error.issues.length > 0 ? <IssueTable issues={error.issues} /> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {state === "success" && result ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>导入完成</CardTitle>
              <CardDescription>
                数据集「{result.dataset.name}」已写入数据库（{result.inserted} 行，跳过 {result.skippedRows} 行）。
              </CardDescription>
            </div>
            <Badge tone="good">+{result.inserted} 行</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MiniStat label="渠道" value={result.platforms.join(" / ")} />
              <MiniStat label="素材数" value={String(result.creatives.length)} />
              <MiniStat
                label="日期范围"
                value={result.dateRange ? result.dateRange.start + " ~ " + result.dateRange.end : "—"}
              />
              <MiniStat label="总花费" value={formatCurrency(result.totals.spend)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <MiniStat label="曝光" value={formatNumber(result.totals.impressions)} />
              <MiniStat label="点击" value={formatNumber(result.totals.clicks)} />
              <MiniStat label="CTR" value={formatPercent(result.totals.ctr)} />
              <MiniStat label="CPC" value={formatCurrency(result.totals.cpc, { digits: 2 })} />
              <MiniStat label="转化" value={formatNumber(result.totals.conversions)} />
              <MiniStat label="ROAS" value={result.totals.roas.toFixed(2)} />
            </div>
            <Separator />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  router.push("/campaign?datasetId=" + result.dataset.id);
                  router.refresh();
                }}
              >
                在投放分析中使用该数据集
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                刷新数据集列表
              </Button>
              <span className="text-[11.5px] text-ink-muted">
                上传的数据与 Demo 数据集分开保存，可随时在设置中清除。
              </span>
            </div>
            {result.issues.length > 0 ? (
              <div className="space-y-2">
                <p className="label-text">数据质量提示（{result.issues.length} 条）</p>
                <IssueTable issues={result.issues} />
              </div>
            ) : (
              <Alert tone="success">数据质量检查通过：未发现空值、负值或口径异常。</Alert>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function IssueTable({ issues }: { issues: UploadIssue[] }) {
  return (
    <div className="max-h-[220px] overflow-auto rounded-xl border border-ink-line">
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH className="pl-4">行</TH>
            <TH>字段</TH>
            <TH>说明</TH>
            <TH className="pr-4">级别</TH>
          </TR>
        </THead>
        <TBody>
          {issues.slice(0, 60).map((issue, index) => (
            <TR key={issue.row + "-" + issue.column + "-" + index}>
              <TD className="pl-4 font-mono text-[11px]">{issue.row}</TD>
              <TD className="font-mono text-[11px]">{issue.column}</TD>
              <TD className="whitespace-normal text-[11.5px] text-ink-muted">{issue.message}</TD>
              <TD className="pr-4">
                <Badge tone={issue.severity === "error" ? "bad" : "warn"}>{issue.severity}</Badge>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-muted px-3.5 py-3">
      <p className="text-[10.5px] text-ink-soft">{label}</p>
      <p className="data-value mt-1 truncate text-[14px] font-semibold">{value}</p>
    </div>
  );
}
```

## `src/components/charts/breakdown-chart.tsx`

```tsx
"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_TOKENS, useTheme } from "@/components/theme-provider";

export type BreakdownDatum = {
  name: string;
  value: number;
  secondary?: number;
  highlight?: boolean;
};

export function BreakdownChart({
  data,
  height = 220,
  digit = 2,
  unit = "ratio",
}: {
  data: BreakdownDatum[];
  height?: number;
  digit?: number;
  unit?: "ratio" | "percent" | "currency";
}) {
  const { theme } = useTheme();
  const tokens = CHART_TOKENS[theme];

  const format = (value: number) => {
    if (unit === "percent") return `${value.toFixed(digit)}%`;
    if (unit === "currency") return `¥${Math.round(value).toLocaleString("zh-CN")}`;
    return value.toFixed(digit);
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 18, right: 12, bottom: 0, left: -22 }} layout="vertical">
          <CartesianGrid stroke={tokens.grid} strokeDasharray="3 6" horizontal={false} />
          <XAxis type="number" stroke={tokens.axis} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" stroke={tokens.axis} tick={{ fontSize: 11 }} width={92} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tokens.grid}`,
              background: theme === "dark" ? "#20241F" : "#FFFFFF",
              fontSize: 12,
            }}
            formatter={(value: number, _name, item) => {
              const datum = item?.payload as BreakdownDatum | undefined;
              const base = `${format(Number(value))}`;
              return [datum?.secondary !== undefined ? `${base}（${datum.secondary.toFixed(0)} 次点击）` : base, "ROAS"];
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.highlight ? tokens.moss : tokens.neutral} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value: number) => format(Number(value))}
              style={{ fontSize: 11, fill: tokens.ink }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## `src/components/charts/matrix-chart.tsx`

```tsx
"use client";

import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

import { CHART_TOKENS, useTheme } from "@/components/theme-provider";

export type MatrixPoint = {
  name: string;
  price: number;
  professional: number;
  isSelf: boolean;
  note?: string;
};

export function MatrixChart({ data, height = 300 }: { data: MatrixPoint[]; height?: number }) {
  const { theme } = useTheme();
  const tokens = CHART_TOKENS[theme];
  const avgPrice = data.reduce((acc, item) => acc + item.price, 0) / Math.max(data.length, 1);
  const avgProfessional = data.reduce((acc, item) => acc + item.professional, 0) / Math.max(data.length, 1);

  const self = data.filter((item) => item.isSelf);
  const others = data.filter((item) => !item.isSelf);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 24, bottom: 12, left: -12 }}>
          <CartesianGrid stroke={tokens.grid} strokeDasharray="3 6" />
          <XAxis
            type="number"
            dataKey="price"
            name="价格"
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            domain={[0, "dataMax + 60"]}
            label={{ value: "价格 ¥ →", position: "insideBottomRight", fill: tokens.axis, fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="professional"
            name="品牌专业度"
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            domain={[30, 100]}
            label={{ value: "品牌专业度 →", angle: -90, position: "insideLeft", fill: tokens.axis, fontSize: 10 }}
          />
          <ZAxis type="number" dataKey="professional" range={[120, 320]} />
          <ReferenceLine x={avgPrice} stroke={tokens.grid} strokeDasharray="4 4" />
          <ReferenceLine y={avgProfessional} stroke={tokens.grid} strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tokens.grid}`,
              background: theme === "dark" ? "#20241F" : "#FFFFFF",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [name === "价格" ? `¥${value}` : value, name]}
            labelFormatter={() => ""}
            content={({ payload }) => {
              const point = payload?.[0]?.payload as MatrixPoint | undefined;
              if (!point) return null;
              return (
                <div className="rounded-xl border border-ink-line bg-surface px-3 py-2 text-[12px] shadow-lift">
                  <p className="font-semibold">{point.name}</p>
                  <p className="text-ink-muted">价格 ¥{point.price}</p>
                  <p className="text-ink-muted">专业度 {point.professional}/100</p>
                  {point.note ? <p className="mt-1 max-w-[220px] text-ink-soft">{point.note}</p> : null}
                </div>
              );
            }}
          />
          <Scatter name="竞品" data={others} fill={tokens.neutral} />
          <Scatter name="MORI" data={self} fill={tokens.moss} shape="star" />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-moss" /> MORI 森屿
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-soft" /> 虚拟竞品
        </span>
        <span>虚线 = 品类价格 / 专业度均值</span>
      </div>
    </div>
  );
}
```

## `src/components/charts/sparkline.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * Tiny dependency-free sparkline used inside KPI cards.
 */
export function Sparkline({
  values,
  className,
  tone = "moss",
}: {
  values: number[];
  className?: string;
  tone?: "moss" | "good" | "warn" | "bad" | "info";
}) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (clean.length < 2) return <div className={cn("h-6 w-full", className)} />;

  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const width = 100;
  const height = 28;
  const step = width / (clean.length - 1);

  const points = clean.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const stroke = {
    moss: "rgb(var(--moss))",
    good: "rgb(var(--tone-good))",
    warn: "rgb(var(--tone-warn))",
    bad: "rgb(var(--tone-bad))",
    info: "rgb(var(--tone-info))",
  }[tone];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-7 w-full", className)} preserveAspectRatio="none">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
```

## `src/components/charts/trend-chart.tsx`

```tsx
"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_TOKENS, useTheme } from "@/components/theme-provider";
import { formatDateLabel } from "@/lib/utils";

export type TrendSeries = {
  key: string;
  label: string;
  kind: "line" | "area" | "bar";
  axis?: "left" | "right";
  colorKey?: "moss" | "clay" | "ink" | "info" | "warn" | "good" | "neutral";
  digits?: number;
  unit?: "currency" | "percent" | "ratio" | "number";
};

export type TrendChartProps = {
  data: Array<Record<string, string | number>>;
  series: TrendSeries[];
  height?: number;
  xKey?: string;
  rightAxisLabel?: string;
  leftAxisLabel?: string;
};

function formatValue(value: number, unit: TrendSeries["unit"], digits = 2) {
  if (!Number.isFinite(value)) return "—";
  switch (unit) {
    case "currency":
      return `¥${Math.round(value).toLocaleString("zh-CN")}`;
    case "percent":
      return `${value.toFixed(digits)}%`;
    case "ratio":
      return value.toFixed(digits);
    default:
      return value.toLocaleString("zh-CN", { maximumFractionDigits: digits });
  }
}

export function TrendChart({
  data,
  series,
  height = 240,
  xKey = "date",
  rightAxisLabel,
  leftAxisLabel,
}: TrendChartProps) {
  const { theme } = useTheme();
  const tokens = CHART_TOKENS[theme];

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke={tokens.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={(value: string) => formatDateLabel(value)}
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            tickMargin={8}
            minTickGap={22}
          />
          <YAxis
            yAxisId="left"
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(Math.round(value)))}
            width={46}
            label={
              leftAxisLabel
                ? { value: leftAxisLabel, angle: -90, position: "insideLeft", fill: tokens.axis, fontSize: 10 }
                : undefined
            }
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={tokens.axis}
            tick={{ fontSize: 10 }}
            width={44}
            label={
              rightAxisLabel
                ? { value: rightAxisLabel, angle: 90, position: "insideRight", fill: tokens.axis, fontSize: 10 }
                : undefined
            }
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tokens.grid}`,
              background: theme === "dark" ? "#20241F" : "#FFFFFF",
              fontSize: 12,
              boxShadow: "0 12px 30px -18px rgba(30,35,32,0.4)",
            }}
            labelFormatter={(label) => formatDateLabel(String(label), true)}
            formatter={(value: number, name: string, item) => {
              const config = series.find((seriesItem) => seriesItem.label === name || seriesItem.key === name);
              return [formatValue(Number(value), config?.unit, config?.digits), config?.label ?? name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} iconType="circle" iconSize={7} />
          {series.map((item) => {
            const color = tokens[item.colorKey ?? "moss"];
            if (item.kind === "area") {
              return (
                <Area
                  key={item.key}
                  yAxisId={item.axis ?? "left"}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.14}
                  strokeWidth={2}
                  dot={false}
                />
              );
            }
            if (item.kind === "bar") {
              return (
                <Bar
                  key={item.key}
                  yAxisId={item.axis ?? "left"}
                  dataKey={item.key}
                  name={item.label}
                  fill={color}
                  fillOpacity={0.75}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                />
              );
            }
            return (
              <Line
                key={item.key}
                yAxisId={item.axis ?? "left"}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={color}
                strokeWidth={2}
                dot={false}
                strokeDasharray={item.key.includes("benchmark") ? "4 4" : undefined}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## `src/components/charts/variant-chart.tsx`

```tsx
"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_TOKENS, useTheme } from "@/components/theme-provider";

export function VariantChart({
  data,
  height = 220,
}: {
  data: Array<{ metric: string; A: number; B: number }>;
  height?: number;
}) {
  const { theme } = useTheme();
  const tokens = CHART_TOKENS[theme];

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid stroke={tokens.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="metric" stroke={tokens.axis} tick={{ fontSize: 10 }} />
          <YAxis stroke={tokens.axis} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${tokens.grid}`,
              background: theme === "dark" ? "#20241F" : "#FFFFFF",
              fontSize: 12,
            }}
            formatter={(value: number) => Number(value).toFixed(2)}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={7} />
          <Bar dataKey="A" name="Variant A" fill={tokens.mossSoft} radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Bar dataKey="B" name="Variant B" fill={tokens.moss} radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## `src/components/content/content-library.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/feedback";
import type { ContentRecord } from "@/types";

export function ContentLibrary({ items, limit = 9 }: { items: ContentRecord[]; limit?: number }) {
  const rows = items.slice(0, limit);
  return (
    <div className="surface overflow-hidden p-0">
      <ul className="divide-y divide-ink-line">
        {rows.map((item) => (
          <li key={item.id} className="flex flex-col gap-2.5 px-5 py-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-medium">{item.title}</p>
                <Badge tone="neutral">{item.platform}</Badge>
                <Badge tone="neutral">{item.contentType}</Badge>
                <Badge tone={item.status === "testing" ? "moss" : "neutral"}>{item.status}</Badge>
              </div>
              <p className="max-w-3xl text-[11.5px] leading-relaxed text-ink-muted">{item.hook}</p>
              <p className="text-[11px] text-ink-soft">
                人群：{item.audience} · 目标：{item.goal} · 主题：{item.topic} · 生成方式：{item.mode}
              </p>
            </div>
            <div className="w-full max-w-[200px] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink-soft">Overall</span>
                <span className="font-mono">{item.overallScore}</span>
              </div>
              <Progress value={item.overallScore} tone={item.overallScore >= 85 ? "good" : "moss"} />
              <div className="flex justify-between text-[10.5px] text-ink-soft">
                <span>Hook {item.hookScore}</span>
                <span>Rel {item.relevanceScore}</span>
                <span>Conv {item.conversionScore}</span>
                <span>Fit {item.brandFitScore}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## `src/components/content/content-studio.tsx`

```tsx
"use client";

import * as React from "react";

import { AgentRunner } from "@/components/ai/agent-runner";
import { SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Alert, ScoreBar, Separator } from "@/components/ui/feedback";
import { FieldGroup, Input, Select } from "@/components/ui/field";
import type { ContentStrategy } from "@/lib/ai/schemas";
import type { AgentRunMeta } from "@/types";

const PLATFORMS = ["小红书", "抖音", "公众号"];
const CONTENT_TYPES = ["种草", "测评", "知识", "故事", "场景", "产品介绍"];
const GOALS = ["曝光", "互动", "点击", "转化"];
const TOPIC_PRESETS = ["熬夜修护", "清爽肤感", "学生党预算", "30 天稳定", "通勤快手护肤"];

export function ContentStudio({
  datasetId,
  personaNames,
}: {
  datasetId?: string | null;
  personaNames: string[];
}) {
  const [platform, setPlatform] = React.useState(PLATFORMS[0]);
  const [contentType, setContentType] = React.useState(CONTENT_TYPES[0]);
  const [goal, setGoal] = React.useState(GOALS[3]);
  const [topic, setTopic] = React.useState(TOPIC_PRESETS[0]);
  const [audience, setAudience] = React.useState(personaNames[0] ?? "23 岁熬夜女性");

  const payload = React.useMemo(
    () => ({ datasetId: datasetId ?? null, platform, contentType, goal, topic, audience }),
    [datasetId, platform, contentType, goal, topic, audience],
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>内容简报</CardTitle>
            <CardDescription>选择平台、内容类型、目标与主题，AI 会按平台规范生成方案。</CardDescription>
          </div>
          <Badge tone="moss">Content Strategist</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-5">
            <FieldGroup label="平台">
              <Select value={platform} onChange={(event) => setPlatform(event.target.value)}>
                {PLATFORMS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="内容类型">
              <Select value={contentType} onChange={(event) => setContentType(event.target.value)}>
                {CONTENT_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="投放目标">
              <Select value={goal} onChange={(event) => setGoal(event.target.value)}>
                {GOALS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="主题" hint="可自定义，例如「成分讲人话」">
              <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="熬夜修护" />
            </FieldGroup>
            <FieldGroup label="目标人群">
              <Select value={audience} onChange={(event) => setAudience(event.target.value)}>
                {personaNames.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="23 岁熬夜女性">23 岁熬夜女性</option>
              </Select>
            </FieldGroup>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="label-text">快捷主题</span>
            {TOPIC_PRESETS.map((preset) => (
              <Badge
                key={preset}
                tone={preset === topic ? "moss" : "neutral"}
                className="cursor-pointer"
                role="button"
                onClick={() => setTopic(preset)}
              >
                {preset}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <AgentRunner<ContentStrategy>
        endpoint="/api/content/generate"
        payload={payload}
        disabled={topic.trim().length === 0}
        disabledHint="请先填写主题"
        labels={{
          idle: "生成内容方案",
          loading: "Generating content...",
          success: "Content generated",
          error: "Unable to generate content.",
        }}
        render={(data, meta) => <ContentResult data={data} meta={meta} payload={payload} />}
      />
    </div>
  );
}

function ContentResult({
  data,
  meta,
  payload,
}: {
  data: ContentStrategy;
  meta: AgentRunMeta;
  payload: Record<string, unknown>;
}) {
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = React.useState<string>("");

  const save = React.useCallback(async () => {
    setSaveState("saving");
    try {
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: payload.platform,
          contentType: payload.contentType,
          goal: payload.goal,
          topic: payload.topic,
          audience: payload.audience,
          title: data.xiaohongshu.titles[0]?.title ?? "未命名内容",
          hook: data.douyin.hook,
          body: data.xiaohongshu.body,
          cta: data.douyin.script[data.douyin.script.length - 1]?.content ?? "—",
          hookScore: data.scores.hookScore,
          relevanceScore: data.scores.relevanceScore,
          conversionScore: data.scores.conversionScore,
          brandFitScore: data.scores.brandFitScore,
          overallScore: data.scores.overallScore,
          whyTest: data.scores.whyTest,
          howToImprove: data.scores.howToImprove,
          mode: meta.mode,
        }),
      });
      const json = (await response.json()) as { ok: boolean; error?: { message: string } };
      if (!response.ok || !json.ok) throw new Error(json.error?.message ?? "保存失败");
      setSaveState("saved");
      setSaveMessage("已保存到内容库（刷新页面即可在下方列表看到）。");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(error instanceof Error ? error.message : "保存失败");
    }
  }, [data, meta.mode, payload]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>方案摘要</CardTitle>
            <CardDescription>{data.summary}</CardDescription>
          </div>
          <Badge tone="moss">Overall {data.scores.overallScore}</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <ScoreBar label="Hook Score" value={data.scores.hookScore} />
              <ScoreBar label="Relevance" value={data.scores.relevanceScore} />
              <ScoreBar label="Conversion Potential" value={data.scores.conversionScore} />
              <ScoreBar label="Brand Fit" value={data.scores.brandFitScore} />
              <Separator />
              <ScoreBar label="Overall" value={data.scores.overallScore} tone="moss" />
            </div>
            <div className="space-y-3">
              <div className="surface-muted px-4 py-3">
                <p className="label-text mb-1">为什么值得测试</p>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">{data.scores.whyTest}</p>
              </div>
              <div className="surface-muted px-4 py-3">
                <p className="label-text mb-1">怎么进一步优化</p>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">{data.scores.howToImprove}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="label-text">关键词</span>
                {data.keywords.map((keyword) => (
                  <Badge key={keyword} tone="neutral">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button variant="moss" size="sm" loading={saveState === "saving"} onClick={save}>
                  {saveState === "saved" ? "已保存到内容库" : "保存到内容库"}
                </Button>
                <CopyButton value={JSON.stringify(data, null, 2)} label="复制结构化 JSON" />
              </div>
              {saveState === "saved" ? <Alert tone="success">{saveMessage}</Alert> : null}
              {saveState === "error" ? <Alert tone="error">{saveMessage}</Alert> : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>小红书标题（5 个）</CardTitle>
              <CardDescription>每个标题都给出角度与「为什么有效」，方便直接排期测试。</CardDescription>
            </div>
            <CopyButton value={data.xiaohongshu.titles.map((item) => item.title).join("\n")} label="复制标题" />
          </CardHeader>
          <CardContent className="space-y-3">
            {data.xiaohongshu.titles.map((item, index) => (
              <div key={item.title} className="surface-muted px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-medium leading-snug">{item.title}</p>
                  <Badge tone="neutral">#{index + 1}</Badge>
                </div>
                <p className="mt-1.5 text-[11.5px] text-moss-strong">角度：{item.angle}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">{item.whyItWorks}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>小红书正文</CardTitle>
              <CardDescription>真实用户口吻，不含医疗与绝对化表述。</CardDescription>
            </div>
            <CopyButton value={data.xiaohongshu.body} label="复制正文" />
          </CardHeader>
          <CardContent>
            <div className="surface-muted max-h-[420px] overflow-y-auto px-4 py-3.5">
              {data.xiaohongshu.body.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mb-2.5 text-[12.5px] leading-relaxed text-ink-muted last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>抖音 15 秒脚本</CardTitle>
            <CardDescription>严格按 Hook → 痛点 → 解决方案 → CTA 的时间轴结构。</CardDescription>
          </div>
          <CopyButton
            value={data.douyin.script.map((item) => `${item.timeRange} ${item.section}：${item.content}`).join("\n")}
            label="复制脚本"
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {data.douyin.script.map((item) => (
              <div key={item.timeRange} className="surface-muted flex h-full flex-col gap-2 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <Badge tone="moss">{item.timeRange}</Badge>
                  <span className="text-[11px] font-medium text-ink-muted">{item.section}</span>
                </div>
                <p className="text-[12px] leading-relaxed text-ink-muted">{item.content}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-ink-soft">视频文案：{data.douyin.caption}</p>
        </CardContent>
      </Card>

      <SignalBlocks bundle={data} columns={2} />
    </div>
  );
}
```

## `src/components/creative/creative-lab.tsx`

```tsx
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
```

## `src/components/dashboard/creative-table.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/feedback";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { efficiencyQuadrant } from "@/lib/analytics";
import { formatCompactNumber, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { CreativeScorecard, DerivedMetrics } from "@/types";

const QUADRANT_TONE = {
  good: "good",
  info: "info",
  warn: "warn",
  bad: "bad",
} as const;

export function CreativeTable({
  items,
  benchmarks,
  limit,
  showIndex = true,
}: {
  items: CreativeScorecard[];
  benchmarks: DerivedMetrics;
  limit?: number;
  showIndex?: boolean;
}) {
  const rows = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <div className="surface overflow-hidden p-0">
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH className="pl-5">素材名称</TH>
            <TH>渠道</TH>
            <TH className="text-right">曝光</TH>
            <TH className="text-right">CTR</TH>
            {showIndex ? <TH className="text-right">CTR 指数</TH> : null}
            <TH className="text-right">CPC</TH>
            <TH className="text-right">转化</TH>
            <TH className="text-right">CPA</TH>
            <TH className="text-right">ROAS</TH>
            <TH className="text-right pr-5">诊断</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((item) => {
            const quadrant = efficiencyQuadrant(item, benchmarks);
            return (
              <TR key={item.name}>
                <TD className="pl-5">
                  <span className="block max-w-[220px] truncate font-medium">{item.name}</span>
                  <span className="text-[11px] text-ink-soft">{item.campaign}</span>
                </TD>
                <TD>
                  <Badge tone="neutral">{item.platform}</Badge>
                </TD>
                <TD className="text-right font-mono text-[12px] text-ink-muted">
                  {formatCompactNumber(item.impressions)}
                </TD>
                <TD className="text-right font-mono">
                  <span className={item.ctr >= benchmarks.ctr ? "text-tone-good" : "text-ink-muted"}>
                    {formatPercent(item.ctr)}
                  </span>
                </TD>
                {showIndex ? (
                  <TD className="w-[92px] text-right">
                    <span className="mb-1 block font-mono text-[11px] text-ink-muted">
                      {item.ctrIndex.toFixed(2)}×
                    </span>
                    <Progress
                      value={Math.min(200, item.ctrIndex * 100) / 2}
                      tone={item.ctrIndex >= 1 ? "good" : "warn"}
                    />
                  </TD>
                ) : null}
                <TD className="text-right font-mono text-[12px] text-ink-muted">{formatCurrency(item.cpc, { digits: 2 })}</TD>
                <TD className="text-right font-mono text-[12px]">{formatNumber(item.conversions)}</TD>
                <TD className="text-right font-mono text-[12px] text-ink-muted">{formatCurrency(item.cpa, { digits: 2 })}</TD>
                <TD className="text-right font-mono font-semibold">
                  <span className={item.roas >= benchmarks.roas ? "text-tone-good" : "text-tone-bad"}>
                    {item.roas.toFixed(2)}
                  </span>
                </TD>
                <TD className="pr-5 text-right">
                  <Badge tone={QUADRANT_TONE[quadrant.tone]}>{quadrant.label}</Badge>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}
```

## `src/components/dashboard/kpi-card.tsx`

```tsx
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Sparkline } from "@/components/charts/sparkline";
import { Badge } from "@/components/ui/badge";
import { formatMetricValue, type MetricKey } from "@/lib/metrics";

export function KpiCard({
  metricKey,
  label,
  labelEn,
  value,
  delta,
  higherIsBetter,
  hint,
  sparkline,
}: {
  metricKey: MetricKey;
  label: string;
  labelEn: string;
  value: number;
  delta?: number;
  higherIsBetter: boolean;
  hint?: string;
  sparkline?: number[];
}) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const improving = hasDelta ? (higherIsBetter ? delta! > 0 : delta! < 0) : false;
  const neutral = hasDelta ? Math.abs(delta!) < 0.5 : true;
  const tone = !hasDelta || neutral ? "neutral" : improving ? "good" : "bad";
  const Icon = !hasDelta || neutral ? Minus : delta! > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="surface flex flex-col gap-3 p-4 transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-medium text-ink">{label}</p>
          <p className="font-serif text-[10.5px] italic text-ink-soft">{labelEn}</p>
        </div>
        {hasDelta && !neutral ? (
          <Badge tone={tone === "good" ? "good" : "bad"}>
            <Icon className="h-3 w-3" aria-hidden />
            {Math.abs(delta!).toFixed(1)}%
          </Badge>
        ) : (
          <Badge tone="neutral">—</Badge>
        )}
      </div>

      <p className="data-value text-[22px] font-semibold leading-none tracking-tight">
        {formatMetricValue(metricKey, value)}
      </p>

      {sparkline && sparkline.length > 1 ? (
        <Sparkline values={sparkline} tone={tone === "good" ? "good" : tone === "bad" ? "bad" : "moss"} />
      ) : null}

      {hint ? <p className="text-[11px] leading-relaxed text-ink-soft">{hint}</p> : null}
    </div>
  );
}
```

## `src/components/experiments/experiment-lab.tsx`

```tsx
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
```

## `src/components/layout/app-shell.tsx`

```tsx
"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({
  children,
  aiStatus,
  datasetLabel,
}: {
  children: React.ReactNode;
  aiStatus: { mode: "demo" | "ai"; model: string; provider: string; reason: string };
  datasetLabel: string;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] lg:block">
        <Sidebar />
      </aside>

      {navOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="关闭导航"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[268px] shadow-lift">
            <Sidebar onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen w-full flex-col lg:pl-[248px]">
        <Topbar onOpenNav={() => setNavOpen(true)} aiStatus={aiStatus} datasetLabel={datasetLabel} />
        <main className="mx-auto w-full max-w-[1560px] flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        <footer className="border-t border-ink-line px-4 py-5 text-[11px] leading-relaxed text-ink-soft md:px-8">
          MORI AI Growth OS · Portfolio demo built with Next.js, Prisma (SQLite) and OpenAI-compatible structured
          outputs. 品牌与数据均为虚拟 Demo / 模拟业务数据，不代表任何真实企业或真实业绩。
        </footer>
      </div>
    </div>
  );
}
```

## `src/components/layout/sidebar.tsx`

```tsx
"use client";

import {
  BarChart3,
  Beaker,
  BookOpen,
  Boxes,
  ClipboardList,
  Compass,
  FileText,
  FlaskConical,
  LayoutDashboard,
  ScrollText,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const NAV_SECTIONS = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "总览", labelEn: "Dashboard", icon: LayoutDashboard },
      { href: "/brand", label: "品牌中心", labelEn: "Brand", icon: Boxes },
      { href: "/audience", label: "用户洞察", labelEn: "Audience", icon: Users },
      { href: "/market", label: "市场与竞品", labelEn: "Market", icon: Compass },
      { href: "/content", label: "内容策划", labelEn: "Content", icon: BookOpen },
      { href: "/creative", label: "广告素材", labelEn: "Creative", icon: Sparkles },
      { href: "/campaign", label: "投放分析", labelEn: "Campaign", icon: BarChart3 },
      { href: "/advisor", label: "AI 增长顾问", labelEn: "AI Advisor", icon: Compass },
      { href: "/experiments", label: "实验中心", labelEn: "Experiments", icon: FlaskConical },
      { href: "/reports", label: "增长报告", labelEn: "Reports", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/prompts", label: "Prompt 管理", labelEn: "Prompt Library", icon: ScrollText },
      { href: "/evaluation", label: "AI 评估", labelEn: "Evaluation", icon: ClipboardList },
      { href: "/settings", label: "设置", labelEn: "Settings", icon: Settings },
    ],
  },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[rgb(var(--sidebar))] text-[rgb(var(--sidebar-ink))]">
      <Link href="/" className="flex items-center gap-3 px-5 py-5" onClick={onNavigate}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/25 font-serif text-[15px] font-semibold text-[rgb(var(--sidebar-ink))]">
          M
        </span>
        <span className="leading-tight">
          <span className="block font-serif text-[15px] font-semibold tracking-wide">MORI 森屿</span>
          <span className="block text-[10px] uppercase tracking-[0.28em] text-[rgb(var(--sidebar-muted))]">
            Growth OS
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--sidebar-muted))]">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-moss/22 text-white"
                          : "text-[rgb(var(--sidebar-ink))]/80 hover:bg-white/6 hover:text-white",
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-moss" : "text-[rgb(var(--sidebar-muted))]")} />
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--sidebar-muted))] opacity-0 transition-opacity group-hover:opacity-100">
                        {item.labelEn}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 px-5 py-4 text-[11px] leading-relaxed text-[rgb(var(--sidebar-muted))]">
        <p className="flex items-center gap-1.5 font-medium text-[rgb(var(--sidebar-ink))]">
          <Target className="h-3.5 w-3.5" /> Demo 作品集项目
        </p>
        <p className="mt-1">MORI 为虚拟品牌，全部数据为模拟业务数据。</p>
        <p className="mt-2 flex items-center gap-1.5">
          <Beaker className="h-3 w-3" /> v1.0 · Next.js + Prisma + SQLite
        </p>
      </div>
    </div>
  );
}
```

## `src/components/layout/topbar.tsx`

```tsx
"use client";

import { Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";

import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Topbar({
  onOpenNav,
  aiStatus,
  datasetLabel,
}: {
  onOpenNav?: () => void;
  aiStatus: { mode: "demo" | "ai"; model: string; provider: string; reason: string };
  datasetLabel: string;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink-line bg-canvas/85 px-4 py-3 backdrop-blur md:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenNav} aria-label="打开导航">
        <Menu className="h-4 w-4" />
      </Button>

      <div className="hidden min-w-0 items-center gap-2 md:flex">
        <span className="font-serif text-[15px] font-semibold">MORI 森屿</span>
        <span className="text-ink-soft">/</span>
        <span className="truncate text-[13px] text-ink-muted">AI 美妆增长中台 · 晚间修护精华</span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <span className="hidden max-w-[240px] truncate text-[11px] text-ink-soft xl:block">{datasetLabel}</span>
        <Badge tone="clay" title="全部业务数据均为模拟数据">
          Demo Mode
        </Badge>
        <Badge
          tone={aiStatus.mode === "ai" ? "moss" : "neutral"}
          title={aiStatus.reason}
          className={cn("hidden sm:inline-flex")}
        >
          {aiStatus.mode === "ai" ? `AI · ${aiStatus.model}` : "本地结构化引擎"}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "切换到浅色主题" : "切换到深色主题"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Link href="/advisor" className={cn(buttonVariants({ variant: "moss", size: "sm" }), "hidden sm:inline-flex")}>
          问 AI 增长顾问
        </Link>
      </div>
    </header>
  );
}
```

## `src/components/market/market-workbench.tsx`

```tsx
"use client";

import { AgentRunner } from "@/components/ai/agent-runner";
import { BulletList, SignalBlocks } from "@/components/ai/signal-blocks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketAnalysis } from "@/lib/ai/schemas";

export function MarketWorkbench({
  datasetId,
  themeFrequency,
}: {
  datasetId?: string | null;
  themeFrequency: Array<{ theme: string; count: number; competitors: string[] }>;
}) {
  return (
    <div className="space-y-5">
      <div className="surface p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold">竞品高频内容主题</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              在 3 个虚拟竞品的内容主题中出现的频次，频次越高说明该主题越拥挤。
            </p>
          </div>
          <Badge tone="neutral">{themeFrequency.length} 个主题</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {themeFrequency.map((item) => (
            <span
              key={item.theme}
              className={
                item.count >= 2
                  ? "chip chip-warn"
                  : "chip chip-neutral"
              }
              title={item.competitors.join(" / ")}
            >
              {item.theme} · {item.count}
            </span>
          ))}
        </div>
      </div>

      <AgentRunner<MarketAnalysis>
        endpoint="/api/market/analyze"
        payload={{ datasetId: datasetId ?? null }}
        labels={{
          idle: "生成 AI 竞品报告",
          loading: "Analyzing market...",
          success: "Analysis completed",
          error: "Unable to generate insights.",
        }}
        render={(data) => (
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>MORI 的竞争位置</CardTitle>
                  <CardDescription>价格 × 品牌专业度矩阵的结论化解读。</CardDescription>
                </div>
                <Badge tone="moss">Market Position</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[13px] leading-relaxed text-ink-muted">{data.summary}</p>
                <div className="surface-muted px-4 py-3.5">
                  <p className="label-text mb-1">定位建议</p>
                  <p className="text-[13px] font-medium leading-relaxed text-ink">{data.positioningAdvice}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3.5 md:grid-cols-3">
              {data.competitiveGaps.map((gap) => (
                <Card key={gap.name} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-[13.5px]">市场空白：{gap.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[12.5px] leading-relaxed text-ink-muted">{gap.gap}</p>
                    <p className="mt-2.5 border-t border-ink-line pt-2.5 text-[11px] leading-relaxed text-ink-soft">
                      <span className="font-medium text-ink-muted">依据：</span>
                      {gap.evidence}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <SignalBlocks bundle={data} columns={2} />

            <BulletList title="下一阶段营销建议" items={data.recommendations.map((item) => item.body)} tone="info" />
          </div>
        )}
      />
    </div>
  );
}
```

## `src/components/portfolio/portfolio-nav.tsx`

```tsx
"use client";

import { ArrowUp, FileDown, Menu, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export const PORTFOLIO_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "product", label: "Product" },
  { id: "campaign", label: "Analytics" },
  { id: "advisor", label: "AI Advisor" },
  { id: "experiment", label: "Experiment" },
  { id: "engineering", label: "AI Engineering" },
  { id: "role", label: "My Role" },
] as const;

export function PortfolioNav() {
  const [active, setActive] = React.useState<string>("overview");
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const ids = PORTFOLIO_SECTIONS.map((section) => section.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 1] },
    );
    elements.forEach((element) => observer.observe(element));

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(scrollTop > 240);
      setProgress(height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header
        data-portfolio-nav
        className={cn(
          "sticky top-0 z-40 border-b transition-colors",
          scrolled ? "border-ink-line bg-canvas/85 backdrop-blur" : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-5 py-3.5 md:px-10">
          <button
            type="button"
            onClick={() => go("overview")}
            className="flex items-center gap-2.5 text-left"
            aria-label="回到顶部"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-serif text-[13px] font-semibold text-canvas">
              M
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-[13.5px] font-semibold">MORI AI Growth OS</span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-ink-soft">Case Study</span>
            </span>
          </button>

          <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
            {PORTFOLIO_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => go(section.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] transition-colors",
                  active === section.id ? "bg-ink text-canvas" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <Link
              href="/"
              className="hidden rounded-full border border-ink-line px-3 py-1.5 text-[12px] text-ink transition-colors hover:bg-surface-muted sm:inline-flex"
            >
              打开产品
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              data-portfolio-noprint
              className="hidden items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12px] text-canvas transition-colors hover:bg-ink/90 sm:inline-flex"
            >
              <FileDown className="h-3.5 w-3.5" /> 导出 PDF
            </button>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-ink lg:hidden"
              aria-label={open ? "关闭章节导航" : "打开章节导航"}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="h-[2px] w-full bg-transparent">
          <div className="h-full bg-moss transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {open ? (
        <div data-portfolio-noprint className="sticky top-[57px] z-30 border-b border-ink-line bg-canvas/95 backdrop-blur lg:hidden">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-1.5 px-5 py-3 md:px-10">
            {PORTFOLIO_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => go(section.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-left text-[12.5px]",
                  active === section.id ? "bg-ink text-canvas" : "bg-surface-muted text-ink-muted",
                )}
              >
                {section.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => window.print()}
              className="col-span-2 mt-1 rounded-xl bg-ink px-3 py-2 text-[12.5px] text-canvas"
            >
              导出 PDF / 打印
            </button>
          </div>
        </div>
      ) : null}

      {scrolled ? (
        <button
          type="button"
          data-portfolio-noprint
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface text-ink shadow-lift transition-transform hover:-translate-y-0.5"
          aria-label="返回顶部"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      ) : null}
    </>
  );
}
```

## `src/components/portfolio/zoomable-shot.tsx`

```tsx
"use client";

import { Maximize2, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * 作品集截图组件：正常显示截图，点击可放大查看（无第三方依赖）。
 * 支持 ESC 关闭、点击遮罩关闭、键盘可达。
 */
export function ZoomableShot({
  src,
  alt,
  caption,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <figure data-portfolio-shot data-portfolio-noprint={undefined} className={cn("group space-y-2.5", className)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative block w-full overflow-hidden rounded-2xl border border-ink-line bg-surface shadow-card transition-shadow hover:shadow-lift"
          aria-label={`放大查看：${alt}`}
        >
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="block w-full"
          />
          <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] text-canvas opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 className="h-3 w-3" /> 点击放大
          </span>
        </button>
        {caption ? (
          <figcaption className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-soft">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-soft" />
            <span>{caption}</span>
          </figcaption>
        ) : null}
      </figure>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          data-portfolio-noprint
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-h-[92vh] w-full max-w-[1500px] overflow-auto rounded-2xl bg-surface p-2">
            <img src={src} alt={alt} className="block w-full rounded-xl" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-canvas"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
```

## `src/components/reports/report-studio.tsx`

```tsx
"use client";

import { Download, FileDown, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Alert, Progress, StatusBadge } from "@/components/ui/feedback";
import { reportToMarkdown, type ReportMeta } from "@/lib/report";
import type { GrowthReport } from "@/lib/ai/schemas";
import type { AgentRunMeta } from "@/types";

type GenerateResponse = {
  ok: boolean;
  data?: { id: string; report: GrowthReport; meta: Omit<ReportMeta, "agentNotes"> };
  meta?: AgentRunMeta;
  error?: { code: string; message: string };
};

export type ReportStudioProps = {
  datasetId?: string | null;
  initial?: { report: GrowthReport; meta: ReportMeta } | null;
};

export function ReportStudio({ datasetId, initial }: ReportStudioProps) {
  const router = useRouter();
  const [state, setState] = React.useState<"idle" | "loading" | "success" | "error">(initial ? "success" : "idle");
  const [payload, setPayload] = React.useState<{ report: GrowthReport; meta: ReportMeta } | null>(initial ?? null);
  const [meta, setMeta] = React.useState<AgentRunMeta | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pdfState, setPdfState] = React.useState<"idle" | "working" | "error">("idle");

  const generate = React.useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: datasetId ?? null }),
      });
      const json = (await response.json()) as GenerateResponse;
      if (!response.ok || !json.ok || !json.data) {
        setState("error");
        setError(json.error?.message ?? `生成失败（HTTP ${response.status}）`);
        return;
      }
      setPayload({ report: json.data.report, meta: json.data.meta });
      setMeta(json.meta ?? null);
      setState("success");
      router.refresh();
    } catch (caught) {
      setState("error");
      setError(caught instanceof Error ? `网络或服务异常：${caught.message}` : "网络或服务异常");
    }
  }, [datasetId, router]);

  const markdown = payload ? reportToMarkdown(payload.report, payload.meta) : "";

  const downloadMarkdown = React.useCallback(() => {
    if (!payload) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `MORI-growth-report-${payload.meta.generatedAt.slice(0, 10)}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [markdown, payload]);

  const downloadPdf = React.useCallback(async () => {
    if (!payload) return;
    setPdfState("working");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const marginX = 48;
      const maxWidth = 595 - marginX * 2;
      let cursorY = 56;

      const write = (text: string, size: number, style: "normal" | "bold" = "normal", gap = 6) => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, maxWidth) as string[];
        lines.forEach((line) => {
          if (cursorY > 780) {
            doc.addPage();
            cursorY = 56;
          }
          doc.text(line, marginX, cursorY);
          cursorY += size * 1.35;
        });
        cursorY += gap;
      };

      write(payload.report.title, 17, "bold", 10);
      write(
        `Data: ${payload.meta.dataLabel} | Engine: ${payload.meta.mode === "ai" ? payload.meta.model : "MORI demo engine"} | ${payload.meta.generatedAt}`,
        9,
        "normal",
        14,
      );

      const sections: Array<[string, string]> = [
        ["1. Executive Summary", payload.report.executiveSummary],
        ["2. Performance", payload.report.performance],
        ["3. Audience", payload.report.audience],
        ["4. Content", payload.report.content],
        ["5. Campaign", payload.report.campaign],
      ];
      sections.forEach(([title, body]) => {
        write(title, 12, "bold");
        write(body, 10, "normal", 12);
      });

      write("6. Key Insights", 12, "bold");
      payload.report.keyInsights.forEach((insight) => {
        write(insight.title, 10, "bold", 2);
        write(insight.body, 10);
        write(`Evidence: ${insight.evidence} (confidence ${insight.confidence}/100)`, 9, "normal", 10);
      });

      write("7. Recommendations", 12, "bold");
      payload.report.recommendations.forEach((item) => write(`- ${item}`, 10, "normal", 2));

      write("8. Experiments", 12, "bold");
      payload.report.experiments.forEach((experiment) => {
        write(experiment.name, 10, "bold", 2);
        write(`A: ${experiment.variantA}`, 9, "normal", 1);
        write(`B: ${experiment.variantB}`, 9, "normal", 1);
        write(`Primary metric: ${experiment.metric} | Success: ${experiment.successCriteria}`, 9, "normal", 8);
      });

      write("Outlook", 12, "bold");
      write(payload.report.outlook, 10, "normal", 12);
      write(
        "Demo / simulated business data - MORI AI Growth OS portfolio project. Not real business results.",
        8,
        "normal",
      );

      doc.save(`MORI-growth-report-${payload.meta.generatedAt.slice(0, 10)}.pdf`);
      setPdfState("idle");
    } catch (caught) {
      console.error(caught);
      setPdfState("error");
    }
  }, [payload]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>本周增长报告</CardTitle>
            <CardDescription>
              一键生成 8 个固定章节：Executive Summary / Performance / Audience / Content / Campaign / Key Insights /
              Recommendations / Experiments。
            </CardDescription>
          </div>
          <Badge tone="moss">
            <Sparkles className="h-3 w-3" /> Report Writer
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="moss" loading={state === "loading"} loadingLabel="Generating report…" onClick={generate}>
              <FileText className="h-3.5 w-3.5" /> 生成本周增长报告
            </Button>
            <CopyButton value={markdown} label="复制 Markdown" disabled={!payload} />
            <Button variant="outline" size="sm" onClick={downloadMarkdown} disabled={!payload}>
              <Download className="h-3.5 w-3.5" /> 下载 Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPdf}
              disabled={!payload}
              loading={pdfState === "working"}
              loadingLabel="生成 PDF…"
            >
              <FileDown className="h-3.5 w-3.5" /> 下载 PDF
            </Button>
            {meta ? <StatusBadge mode={meta.mode} warning={meta.warning} /> : null}
            {meta ? <Badge tone="neutral">{meta.model}</Badge> : null}
          </div>
          {pdfState === "error" ? <Alert tone="error" className="mt-3">PDF 生成失败，请改用 Markdown 下载。</Alert> : null}
          {state === "error" && error ? (
            <Alert tone="error" className="mt-3" title="生成失败">
              {error}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {payload ? (
        <article className="surface animate-fade-up space-y-6 p-6 md:p-8">
          <header className="space-y-2 border-b border-ink-line pb-5">
            <h2 className="text-2xl font-semibold">{payload.report.title}</h2>
            <p className="text-[11.5px] text-ink-soft">
              数据来源：{payload.meta.dataLabel} · 生成方式：
              {payload.meta.mode === "ai" ? `AI（${payload.meta.model}）` : "Demo 结构化分析引擎"} · Prompt{" "}
              {payload.meta.promptVersion} · {payload.meta.generatedAt}
            </p>
          </header>

          <ReportSection index={1} title="Executive Summary" body={payload.report.executiveSummary} />
          <ReportSection index={2} title="Performance" body={payload.report.performance} />
          <ReportSection index={3} title="Audience" body={payload.report.audience} />
          <ReportSection index={4} title="Content" body={payload.report.content} />
          <ReportSection index={5} title="Campaign" body={payload.report.campaign} />

          <section className="space-y-3">
            <h3 className="text-[15px] font-semibold">6. Key Insights</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {payload.report.keyInsights.map((insight) => (
                <div key={insight.title} className="surface-muted flex h-full flex-col gap-2 px-4 py-3.5">
                  <p className="text-[12.5px] font-semibold leading-snug">{insight.title}</p>
                  <p className="flex-1 text-[11.5px] leading-relaxed text-ink-muted">{insight.body}</p>
                  <Progress value={insight.confidence} tone="moss" />
                  <p className="text-[10.5px] leading-relaxed text-ink-soft">{insight.evidence}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-[15px] font-semibold">7. Recommendations</h3>
            <ol className="space-y-2">
              {payload.report.recommendations.map((item, index) => (
                <li key={item} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss/12 font-mono text-[10px] text-moss-strong">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="text-[15px] font-semibold">8. Experiments</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {payload.report.experiments.map((experiment) => (
                <div key={experiment.name} className="surface-muted px-4 py-3.5">
                  <p className="text-[12.5px] font-semibold">{experiment.name}</p>
                  <div className="mt-2 space-y-1 text-[11.5px] text-ink-muted">
                    <p>A：{experiment.variantA}</p>
                    <p>B：{experiment.variantB}</p>
                    <p>
                      主指标：<span className="font-mono">{experiment.metric}</span>
                    </p>
                    <p className="text-ink-soft">成功标准：{experiment.successCriteria}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2 rounded-xl bg-surface-muted px-5 py-4">
            <h3 className="text-[15px] font-semibold">Outlook</h3>
            <p className="text-[12.5px] leading-relaxed text-ink-muted">{payload.report.outlook}</p>
          </section>
        </article>
      ) : (
        <Alert tone="info" title="还没有生成报告">
          点击「生成本周增长报告」，系统会读取当前数据集的全部指标、人群、内容与实验数据，输出 8 个章节的结构化周报。
        </Alert>
      )}
    </div>
  );
}

function ReportSection({ index, title, body }: { index: number; title: string; body: string }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[15px] font-semibold">
        {index}. {title}
      </h3>
      {body.split("\n").map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="text-[12.5px] leading-relaxed text-ink-muted">
          {paragraph}
        </p>
      ))}
    </section>
  );
}
```

## `src/components/settings/settings-panel.tsx`

```tsx
"use client";

import { CheckCircle2, Database, Moon, Palette, PlugZap, RefreshCw, Sun, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

type AiStatus = {
  mode: "demo" | "ai";
  providerId?: string;
  provider: string;
  baseUrl: string;
  model: string;
  demoMode: boolean;
  apiKeyConfigured: boolean;
  keySource?: string | null;
  supportsJsonSchema?: boolean;
  requestShapes?: readonly string[];
  reason: string;
};

type TestResult = { ok: boolean; mode: "demo" | "ai"; message: string; latencyMs: number; model: string };

export function SettingsPanel({
  aiStatus,
  counts,
}: {
  aiStatus: AiStatus;
  counts: { metrics: number; audienceMetrics: number; datasets: number; contents: number; experiments: number; reports: number };
}) {
  const router = useRouter();
  const { theme, setTheme, mounted } = useTheme();
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);
  const [dataState, setDataState] = React.useState<"idle" | "working">("idle");
  const [dataMessage, setDataMessage] = React.useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const runTest = React.useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/settings/test-ai", { method: "POST" });
      const json = (await response.json()) as { ok: boolean; data?: TestResult; error?: { message: string } };
      if (!response.ok || !json.ok || !json.data) {
        setTestResult({
          ok: false,
          mode: aiStatus.mode,
          message: json.error?.message ?? "AI 状态检查失败",
          latencyMs: 0,
          model: aiStatus.model,
        });
        return;
      }
      setTestResult(json.data);
    } catch (error) {
      setTestResult({
        ok: false,
        mode: aiStatus.mode,
        message: error instanceof Error ? error.message : "网络异常",
        latencyMs: 0,
        model: aiStatus.model,
      });
    } finally {
      setTesting(false);
    }
  }, [aiStatus.mode, aiStatus.model]);

  const runDataAction = React.useCallback(
    async (action: "clear-uploads" | "regenerate-demo") => {
      setDataState("working");
      setDataMessage(null);
      try {
        const response = await fetch("/api/settings/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const json = (await response.json()) as { ok: boolean; data?: { message: string }; error?: { message: string } };
        if (!response.ok || !json.ok || !json.data) {
          setDataMessage({ tone: "error", text: json.error?.message ?? "操作失败" });
          return;
        }
        setDataMessage({ tone: "success", text: json.data.message });
        router.refresh();
      } catch (error) {
        setDataMessage({ tone: "error", text: error instanceof Error ? error.message : "网络异常" });
      } finally {
        setDataState("idle");
      }
    },
    [router],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-moss-strong" /> AI Provider
            </CardTitle>
            <CardDescription>当前使用 OpenAI-compatible 接口，支持 structured outputs（JSON Schema）。</CardDescription>
          </div>
          <Badge tone={aiStatus.mode === "ai" ? "moss" : "neutral"}>{aiStatus.mode === "ai" ? "AI 模式" : "Demo 模式"}</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-[12px]">
          <Row label="Provider" value={aiStatus.provider} />
          <Row label="Base URL" value={aiStatus.baseUrl} />
          <Row label="Model" value={aiStatus.model} />
          <Row label="DEMO_MODE" value={aiStatus.demoMode ? "true" : "false"} />
          <Row
            label="API Key"
            value={
              aiStatus.apiKeyConfigured
                ? `已配置（来源 ${aiStatus.keySource ?? "环境变量"}，不显示明文）`
                : `未配置（需设置 ${aiStatus.providerId === "deepseek" ? "DEEPSEEK_API_KEY" : "API Key"}）`
            }
          />
          <Row
            label="输出方式"
            value={
              aiStatus.supportsJsonSchema
                ? "json_schema (strict) → json_object → plain"
                : `${(aiStatus.requestShapes ?? ["json_object", "plain"]).join(" → ")}（该 Provider 不支持 strict json_schema，Schema 注入 Prompt + Zod 校验）`
            }
          />
          <Alert tone={aiStatus.mode === "ai" ? "success" : "info"}>{aiStatus.reason}</Alert>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" loading={testing} loadingLabel="Testing…" onClick={runTest}>
              <RefreshCw className="h-3.5 w-3.5" /> 测试 AI 连接
            </Button>
            {testResult ? (
              <span className={cn("flex items-center gap-1.5 text-[12px]", testResult.ok ? "text-tone-good" : "text-tone-bad")}>
                {testResult.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {testResult.message} {testResult.latencyMs > 0 ? `（${testResult.latencyMs}ms）` : ""}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-moss-strong" /> 主题
            </CardTitle>
            <CardDescription>主题偏好保存在浏览器 localStorage，刷新后保持。</CardDescription>
          </div>
          <Badge tone="neutral">{mounted ? theme : "loading"}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={theme === "light" ? "primary" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-3.5 w-3.5" /> 浅色（默认）
            </Button>
            <Button variant={theme === "dark" ? "primary" : "outline"} size="sm" onClick={() => setTheme("dark")}>
              <Moon className="h-3.5 w-3.5" /> 深色
            </Button>
          </div>
          <p className="text-[11.5px] leading-relaxed text-ink-muted">
            设计基调为米白 / 深灰 / 浅绿，图表颜色随主题切换（Recharts 读取主题色板），保证两个主题下的可读性。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-moss-strong" /> Data Management
            </CardTitle>
            <CardDescription>数据库当前内容（SQLite + Prisma）。</CardDescription>
          </div>
          <Badge tone="neutral">prisma/dev.db</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MiniStat label="投放记录" value={counts.metrics} />
            <MiniStat label="人群记录" value={counts.audienceMetrics} />
            <MiniStat label="上传数据集" value={counts.datasets} />
            <MiniStat label="内容记录" value={counts.contents} />
            <MiniStat label="实验" value={counts.experiments} />
            <MiniStat label="报告" value={counts.reports} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={dataState === "working"}
              onClick={() => runDataAction("regenerate-demo")}
            >
              <RefreshCw className="h-3.5 w-3.5" /> 重新生成 Demo 数据
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={dataState === "working"}
              onClick={() => runDataAction("clear-uploads")}
            >
              <Trash2 className="h-3.5 w-3.5" /> 清除上传数据集
            </Button>
          </div>
          {dataMessage ? <Alert tone={dataMessage.tone}>{dataMessage.text}</Alert> : null}
          <p className="text-[11.5px] leading-relaxed text-ink-soft">
            命令行等价操作：<code className="font-mono">npm run db:reset</code>（重建并重新写入全部 Demo 数据）、
            <code className="font-mono">npm run db:studio</code>（可视化查看数据库）。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>环境变量</CardTitle>
            <CardDescription>
              参照 <code className="font-mono">.env.example</code>，把真实 Key 放在 <code className="font-mono">.env.local</code>
              （已被 .gitignore 忽略）。
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-xl bg-surface-muted p-4 font-mono text-[11px] leading-relaxed text-ink-muted">
{`DATABASE_URL="file:./dev.db"
DEMO_MODE="true"          # true = 本地结构化引擎，无需 API Key
OPENAI_API_KEY=""         # DEMO_MODE=false 时必填
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"
AI_REQUEST_TIMEOUT_MS="45000"`}
          </pre>
          <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
            切换到 AI 模式：把 <code className="font-mono">DEMO_MODE</code> 改为 <code className="font-mono">false</code>
            并填入 <code className="font-mono">OPENAI_API_KEY</code>，重启开发服务器即可。若调用失败，系统会自动回退到 Demo
            引擎，并在结果中标注「AI 失败 · 已回退」。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-line pb-2 last:border-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span className="truncate font-mono text-ink">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-muted px-3.5 py-3">
      <p className="text-[10.5px] text-ink-soft">{label}</p>
      <p className="data-value mt-1 text-[15px] font-semibold">{value.toLocaleString("zh-CN")}</p>
    </div>
  );
}
```

## `src/components/theme-provider.tsx`

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeName = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

const STORAGE_KEY = "mori-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const preferred: ThemeName =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setThemeState(preferred);
    document.documentElement.dataset.theme = preferred;
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
      mounted,
    }),
    [theme, setTheme, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const CHART_TOKENS: Record<ThemeName, Record<string, string>> = {
  light: {
    grid: "#E4E1D9",
    axis: "#8B948E",
    moss: "#618C68",
    mossSoft: "#A3C4A6",
    clay: "#C08A6A",
    ink: "#1E2320",
    good: "#3F7D5B",
    warn: "#B07434",
    bad: "#A8483F",
    info: "#4B6C8F",
    neutral: "#B9C0BA",
  },
  dark: {
    grid: "#343A35",
    axis: "#808982",
    moss: "#8ABA92",
    mossSoft: "#4E6F56",
    clay: "#D1A080",
    ink: "#EBEEE9",
    good: "#6FAF89",
    warn: "#D8A15F",
    bad: "#D98A81",
    info: "#8FB0D1",
    neutral: "#5C6660",
  },
};
```

## `src/components/ui/badge.tsx`

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva("chip", {
  variants: {
    tone: {
      moss: "chip-moss",
      neutral: "chip-neutral",
      good: "chip-good",
      warn: "chip-warn",
      bad: "chip-bad",
      info: "chip-info",
      clay: "chip-clay",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const TONE_BY_VALUE: Record<string, VariantProps<typeof badgeVariants>["tone"]> = {
  good: "good",
  warn: "warn",
  bad: "bad",
  info: "info",
  moss: "moss",
  clay: "clay",
  neutral: "neutral",
};

export function toneFromValue(value: string | undefined) {
  return TONE_BY_VALUE[value ?? "neutral"] ?? "neutral";
}
```

## `src/components/ui/button.tsx`

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[13px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-55",
  {
    variants: {
      variant: {
        primary: "bg-ink text-canvas hover:bg-ink/90 shadow-card",
        moss: "bg-moss text-white hover:bg-moss/90 shadow-card",
        outline: "border border-ink-line bg-surface text-ink hover:border-ink-soft/60 hover:bg-surface-muted",
        ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
        subtle: "bg-surface-muted text-ink hover:bg-ink-line/60",
        danger: "bg-tone-bad/10 text-tone-bad hover:bg-tone-bad/18 border border-tone-bad/25",
      },
      size: {
        sm: "h-8 px-3 text-[12px]",
        md: "h-9 px-4 py-2",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    loadingLabel?: string;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading = false, loadingLabel, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
      {loading ? (loadingLabel ?? "处理中…") : children}
    </button>
  );
});

export { buttonVariants };
```

## `src/components/ui/card.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("surface p-5", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex items-start justify-between gap-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-[15px] font-semibold leading-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-xs leading-relaxed text-ink-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex items-center justify-between gap-3", className)} {...props} />;
}
```

## `src/components/ui/copy-button.tsx`

```tsx
"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "复制",
  copiedLabel = "已复制",
  variant = "outline",
  size = "sm",
  className,
  ...rest
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const area = document.createElement("textarea");
        area.value = value;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={copy} {...rest}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
```

## `src/components/ui/feedback.tsx`

```tsx
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-ink-line/40 via-ink-line/70 to-ink-line/40",
        className,
      )}
    />
  );
}

const ALERT_TONES = {
  info: { icon: Info, className: "border-tone-info/30 bg-tone-info/8 text-tone-info" },
  success: { icon: CheckCircle2, className: "border-tone-good/30 bg-tone-good/8 text-tone-good" },
  warning: { icon: AlertTriangle, className: "border-tone-warn/30 bg-tone-warn/10 text-tone-warn" },
  error: { icon: XCircle, className: "border-tone-bad/30 bg-tone-bad/8 text-tone-bad" },
} as const;

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof ALERT_TONES;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const config = ALERT_TONES[tone];
  const Icon = config.icon;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12px]", config.className, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="leading-relaxed opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-line bg-surface-muted/60 px-6 py-10 text-center">
      {icon ? <div className="text-ink-soft">{icon}</div> : null}
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {description ? <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Progress({
  value,
  tone = "moss",
  className,
}: {
  value: number;
  tone?: "moss" | "good" | "warn" | "bad" | "info";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const toneClass = {
    moss: "bg-moss",
    good: "bg-tone-good",
    warn: "bg-tone-warn",
    bad: "bg-tone-bad",
    info: "bg-tone-info",
  }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ink-line/70", className)}>
      <div className={cn("h-full rounded-full transition-all", toneClass)} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function ScoreBar({ label, value, tone }: { label: string; value: number; tone?: "moss" | "good" | "warn" | "bad" | "info" }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
        <span className="text-ink-muted">{label}</span>
        <span className="font-mono text-ink">{value}</span>
      </div>
      <Progress value={value} tone={tone ?? (value >= 85 ? "good" : value >= 70 ? "moss" : "warn")} />
    </div>
  );
}

export function StatusBadge({ mode, warning }: { mode: string; warning?: string }) {
  if (mode === "ai") return <Badge tone="moss">AI 生成</Badge>;
  if (mode === "fallback") return <Badge tone="warn">AI 失败 · 已回退</Badge>;
  return <Badge tone="neutral" title={warning}>Demo 引擎</Badge>;
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-ink-line", className)} />;
}
```

## `src/components/ui/field.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const baseControl =
  "w-full rounded-xl border border-ink-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-ink-soft focus:border-moss/60 focus:outline-none focus:ring-2 focus:ring-moss/20 disabled:cursor-not-allowed disabled:opacity-60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(baseControl, "h-10", className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(baseControl, "min-h-[96px] resize-y", className)} {...props} />;
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(baseControl, "h-10 appearance-none bg-[length:0] pr-8", className)} {...props}>
        {children}
      </select>
    );
  },
);

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-medium text-ink-muted", className)} {...props} />;
}

export function FieldGroup({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
      {hint ? <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn("h-4 w-4 rounded border-ink-line text-moss focus:ring-moss/30", className)}
      {...props}
    />
  );
}
```

## `src/components/ui/page.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  titleEn,
  description,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: string;
  titleEn?: string;
  description?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-ink-line pb-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? <p className="label-text">{eyebrow}</p> : null}
        <div className="flex flex-wrap items-baseline gap-2.5">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {titleEn ? <span className="font-serif text-sm italic text-ink-soft">{titleEn}</span> : null}
        </div>
        {description ? <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">{description}</p> : null}
        {meta ? <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Section({
  id,
  title,
  titleEn,
  description,
  actions,
  children,
  className,
}: {
  id?: string;
  title: string;
  titleEn?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            {titleEn ? <span className="font-serif text-xs italic text-ink-soft">{titleEn}</span> : null}
          </div>
          {description ? <p className="mt-1 max-w-3xl text-xs leading-relaxed text-ink-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "chip chip-clay",
        className,
      )}
      title="本页面所有业务数据均为模拟数据，用于验证产品工作流"
    >
      Demo / 模拟业务数据
    </span>
  );
}
```

## `src/components/ui/table.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-[12.5px]", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("text-left", className)} {...props} />;
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-ink-line", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors hover:bg-surface-muted/70", className)} {...props} />;
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "whitespace-nowrap border-b border-ink-line px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-soft",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("whitespace-nowrap px-3 py-2.5 align-middle text-ink", className)} {...props} />;
}
```

## `src/components/ui/tabs.tsx`

```tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolled;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-full border border-ink-line bg-surface-muted p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => context?.setValue(value)}
      className={cn(
        "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
        active ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return (
    <div role="tabpanel" className={cn("animate-fade-up", className)}>
      {children}
    </div>
  );
}
```

## `src/lib/ai/client.ts`

```ts
import { z, type ZodTypeAny } from "zod";

import { jsonSchemaPromptHint, zodToStructuredOutputFormat } from "@/lib/ai/json-schema";
import { redactSecrets } from "@/lib/utils";

export type AiConfig = {
  demoMode: boolean;
  enabled: boolean;
  providerId: AiProviderId;
  /** display label, e.g. "DeepSeek" */
  provider: string;
  model: string;
  baseUrl: string;
  apiKeyConfigured: boolean;
  /** name of the env var the key was read from (never the value itself) */
  keySource: string | null;
  /** whether the provider officially supports strict json_schema structured outputs */
  supportsJsonSchema: boolean;
  timeoutMs: number;
  /** human readable reason for the current mode */
  reason: string;
};

export type AiProviderId = "deepseek" | "openai" | "mock" | "custom";

type ProviderPreset = {
  id: AiProviderId;
  label: string;
  baseUrl: string;
  model: string;
  supportsJsonSchema: boolean;
  /** the provider specific env var holding the API key */
  apiKeyEnv: string;
};

/**
 * Provider presets. `AI_PROVIDER=deepseek` is all you need to switch to
 * DeepSeek: the base URL, model and key env var come from the preset, so a
 * leftover OPENAI_* value from another provider can never leak into the call.
 */
const PROVIDER_PRESETS: Record<AiProviderId, ProviderPreset> = {
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-flash",
    supportsJsonSchema: false,
    apiKeyEnv: "DEEPSEEK_API_KEY",
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    supportsJsonSchema: true,
    apiKeyEnv: "OPENAI_API_KEY",
  },
  mock: {
    id: "mock",
    label: "Local mock provider",
    baseUrl: "http://127.0.0.1:8787/v1",
    model: "mock-model",
    supportsJsonSchema: true,
    apiKeyEnv: "AI_API_KEY",
  },
  custom: {
    id: "custom",
    label: "OpenAI-compatible",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    supportsJsonSchema: true,
    apiKeyEnv: "AI_API_KEY",
  },
};

function readEnv(name: string) {
  return (process.env[name] ?? "").trim();
}

function firstConfigured(names: string[]): { name: string; value: string } | null {
  for (const name of names) {
    const value = readEnv(name);
    if (value.length > 0) return { name, value };
  }
  return null;
}

/**
 * Resolves the API key for a provider. The value is intentionally NOT part of
 * `AiConfig` (so it can never be serialised into a response or log by mistake);
 * only the name of the variable is exposed there.
 */
function resolveApiKey(providerId: AiProviderId): { name: string; value: string } | null {
  const preset = PROVIDER_PRESETS[providerId];
  const candidates = Array.from(new Set(["AI_API_KEY", preset.apiKeyEnv, "OPENAI_API_KEY", "DEEPSEEK_API_KEY"]));
  return firstConfigured(candidates);
}

function detectProviderId(explicit: string, baseUrl: string): AiProviderId {
  const normalized = explicit.toLowerCase();
  if (normalized === "deepseek" || normalized === "openai" || normalized === "mock" || normalized === "custom") {
    return normalized;
  }
  if (baseUrl.includes("api.deepseek.com")) return "deepseek";
  if (/127\.0\.0\.1|localhost/i.test(baseUrl)) return "mock";
  if (baseUrl.includes("api.openai.com")) return "openai";
  return "custom";
}

export type AiProviderErrorCode =
  | "MISSING_API_KEY"
  | "HTTP_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "EMPTY_RESPONSE"
  | "TRUNCATED"
  | "INVALID_JSON"
  | "REFUSED"
  | "UNKNOWN";

export class AiProviderError extends Error {
  code: AiProviderErrorCode;
  status?: number;

  constructor(code: AiProviderErrorCode, message: string, status?: number) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
    this.status = status;
  }
}

export function getAiConfig(): AiConfig {
  const demoModeRaw = (readEnv("DEMO_MODE") || "true").toLowerCase();
  const demoMode = demoModeRaw === "true" || demoModeRaw === "1" || demoModeRaw === "yes";

  const explicitProvider = readEnv("AI_PROVIDER");
  const aiBaseUrl = readEnv("AI_BASE_URL");
  const legacyBaseUrl = readEnv("OPENAI_BASE_URL");
  const providerId = detectProviderId(explicitProvider, aiBaseUrl || legacyBaseUrl || PROVIDER_PRESETS.openai.baseUrl);
  const preset = PROVIDER_PRESETS[providerId];

  // When AI_PROVIDER is set explicitly the preset wins, so stale OPENAI_* values
  // from a previous provider cannot silently override DeepSeek settings.
  const baseUrl = (aiBaseUrl || (explicitProvider ? preset.baseUrl : legacyBaseUrl) || preset.baseUrl).replace(
    /\/+$/,
    "",
  );
  const model = readEnv("AI_MODEL") || (explicitProvider ? preset.model : readEnv("OPENAI_MODEL")) || preset.model;

  const key = resolveApiKey(providerId);
  const apiKeyConfigured = key !== null;
  // DeepSeek + a ~29KB business context regularly takes 30-90s, and the largest
  // agent (campaign analysis) can exceed two minutes. 45s used to cut those
  // calls off, so the default is now 120s (override with AI_REQUEST_TIMEOUT_MS).
  const timeoutMs = Number(readEnv("AI_REQUEST_TIMEOUT_MS") || 120_000);

  let enabled = false;
  let reason = "";

  if (demoMode) {
    reason = `DEMO_MODE=true，使用本地结构化分析引擎（不调用外部模型）。`;
  } else if (!apiKeyConfigured) {
    reason = `未检测到 API Key（可设置 ${preset.apiKeyEnv}），已自动回退到 Demo Mode。`;
  } else {
    enabled = true;
    reason = `已启用 ${preset.label} 模式：${model} @ ${baseUrl}（密钥来源 ${key.name}）`;
  }

  return {
    demoMode,
    enabled,
    providerId,
    provider: preset.label,
    model,
    baseUrl,
    apiKeyConfigured,
    keySource: key?.name ?? null,
    supportsJsonSchema: preset.supportsJsonSchema,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 120_000,
    reason,
  };
}

export type StructuredCallInput<T extends ZodTypeAny> = {
  schema: T;
  schemaName: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  model?: string;
};

/** Which request shape the provider accepted (useful for Settings + tests). */
export type StructuredCallMode = "json_schema" | "json_object" | "plain";

export type StructuredCallResult<TOutput> = {
  raw: unknown;
  output: TOutput;
  model: string;
  latencyMs: number;
  mode: StructuredCallMode;
};

type ProviderAttempt = {
  mode: StructuredCallMode;
  responseFormat?: unknown;
  includeTemperature: boolean;
  includeMaxTokens: boolean;
  systemSuffix: string;
};

type AttemptOutcome =
  | { kind: "ok"; raw: unknown; mode: StructuredCallMode; latencyMs: number }
  /** request shape / truncation problem → try a lighter request shape */
  | { kind: "retry"; error: AiProviderError }
  /** valid JSON but failed zod → ask again with an explicit "what was missing" note */
  | { kind: "retry_parse"; error: AiProviderError; issues: string[] }
  /** must not be retried: refusal, timeout, network failure */
  | { kind: "fatal"; error: AiProviderError };

/** HTTP statuses that may simply mean "this request shape is not supported". */
const FORMAT_RELATED_STATUS = new Set([400, 404, 405, 415, 422]);

function providerError(code: AiProviderErrorCode, message: string, status?: number) {
  return new AiProviderError(code, redactSecrets(message), status);
}

function resolveTemperature(explicit?: number): number | undefined {
  if (typeof explicit === "number" && Number.isFinite(explicit)) return explicit;
  const raw = (process.env.AI_TEMPERATURE ?? "").trim().toLowerCase();
  if (raw === "default" || raw === "none" || raw === "omit") return undefined;
  if (raw === "") return 0.4;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0.4;
}

function resolveMaxTokens(): number | undefined {
  const raw = (process.env.AI_MAX_TOKENS ?? "").trim();
  if (raw === "" || raw === "0") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

/**
 * Removes trailing commas that models occasionally emit. Implemented with a
 * scanner so commas *inside* string values are never touched: we repair the
 * JSON syntax only, never the business data.
 */
function stripTrailingCommas(text: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      out += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
      continue;
    }
    if (char === ",") {
      let lookahead = index + 1;
      while (lookahead < text.length && /\s/.test(text[lookahead])) lookahead += 1;
      if (text[lookahead] === "}" || text[lookahead] === "]") continue;
    }
    out += char;
  }

  return out;
}

/** Tells the model exactly which required fields were missing or invalid. */
function repairSuffix(issues: string[]): string {
  return [
    "",
    "【上一次输出未通过结构校验，请修正后重新输出完整的 json 对象】",
    `校验未通过的原因：${issues.join("; ")}`,
    "必须满足：① 返回 Schema 中列出的每一个字段，一个都不能少；② 不允许用 null 代替字段；",
    "③ 数组没有内容时返回 []；④ 数字字段必须输出数字（不要加引号或单位）。",
  ].join("\n");
}

/** A truncated answer needs shorter wording, not a different schema. */
function concisionSuffix(): string {
  return [
    "",
    "【上一次输出因长度被截断，请重新输出】",
    "要求：仍然必须包含全部字段，但文字更精简（每个说明性字段 1–2 句，不要展开长段落）。",
  ].join("\n");
}

/** Providers often wrap JSON in ```json fences or add a sentence around it. */
function extractJson(content: string): unknown {
  const trimmed = content.trim();
  const unfenced = trimmed
    .replace(/^```(?:json|JSON)?\s*/, "")
    .replace(/```\s*$/, "")
    .trim();

  try {
    return JSON.parse(unfenced);
  } catch {
    // fall through to brace extraction
  }

  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const candidate = unfenced.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      try {
        return JSON.parse(stripTrailingCommas(candidate));
      } catch {
        // fall through to error
      }
    }
  }

  try {
    return JSON.parse(stripTrailingCommas(unfenced));
  } catch {
    // fall through to error
  }

  throw providerError("INVALID_JSON", "模型返回的内容不是合法 JSON（已尝试去除代码块并提取花括号内容）。");
}

async function attemptProviderCall<T extends ZodTypeAny>(
  input: StructuredCallInput<T>,
  attempt: ProviderAttempt,
  config: AiConfig,
  model: string,
  temperature: number | undefined,
  maxTokens: number | undefined,
): Promise<AttemptOutcome> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: input.systemPrompt + attempt.systemSuffix },
      { role: "user", content: input.userPrompt },
    ],
  };
  if (attempt.responseFormat) body.response_format = attempt.responseFormat;
  if (attempt.includeTemperature && temperature !== undefined) body.temperature = temperature;
  if (attempt.includeMaxTokens && maxTokens !== undefined) body.max_tokens = maxTokens;

  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    let response: Response;
    try {
      const apiKey = resolveApiKey(config.providerId);
      response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Must use the resolved provider key (DeepSeek / OpenAI / generic),
          // never a hard-coded env var name.
          Authorization: `Bearer ${apiKey?.value ?? ""}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      // undici sometimes reports an aborted request as `TypeError: terminated`
      // instead of an AbortError, so the signal state is the reliable signal.
      if ((error instanceof Error && error.name === "AbortError") || controller.signal.aborted) {
        return { kind: "fatal", error: providerError("TIMEOUT", `模型请求超时（>${config.timeoutMs}ms）。`) };
      }
      if (error instanceof Error && /terminated|UND_ERR_SOCKET|socket hang up/i.test(error.message)) {
        return {
          kind: "fatal",
          error: providerError(
            "NETWORK_ERROR",
            `与模型服务的连接被中断（${error.message}）。常见原因：本地代理/VPN 掐断长连接、` +
              `或请求耗时超过代理上限。可尝试把 api.deepseek.com 加入代理直连白名单，` +
              `或在 .env.local 调大 AI_REQUEST_TIMEOUT_MS。`,
          ),
        };
      }
      return {
        kind: "fatal",
        error: providerError(
          "NETWORK_ERROR",
          `无法连接模型服务 ${config.baseUrl}：${error instanceof Error ? error.message : "网络错误"}。` +
            "请检查网络、代理/VPN 设置与 Base URL 是否正确。",
        ),
      };
    }

    if (!response.ok) {
      const text = redactSecrets(await safeText(response));
      const error = providerError(
        "HTTP_ERROR",
        `模型接口返回 ${response.status}：${text.slice(0, 240)}`,
        response.status,
      );
      return FORMAT_RELATED_STATUS.has(response.status) ? { kind: "retry", error } : { kind: "fatal", error };
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: { content?: string | null; refusal?: string | null };
        finish_reason?: string;
      }>;
    };

    const choice = payload.choices?.[0];
    const message = choice?.message;

    if (message?.refusal) {
      return {
        kind: "fatal",
        error: providerError("REFUSED", `模型拒绝了该请求：${message.refusal.slice(0, 200)}`),
      };
    }

    if (choice?.finish_reason === "length") {
      return {
        kind: "retry",
        error: providerError("TRUNCATED", "模型输出被 token 上限截断（finish_reason=length），无法解析为完整 JSON。"),
      };
    }

    if (!message?.content) {
      return { kind: "retry", error: providerError("EMPTY_RESPONSE", "模型返回了空内容。") };
    }

    let parsed: unknown;
    try {
      parsed = extractJson(message.content);
    } catch (error) {
      const providerFailure =
        error instanceof AiProviderError ? error : providerError("INVALID_JSON", "模型返回的内容不是合法 JSON。");
      return { kind: "retry", error: providerFailure };
    }

    const validated = input.schema.safeParse(parsed);
    if (!validated.success) {
      const issues = validated.error.issues.slice(0, 8).map((issue) => {
        const path = issue.path.join(".") || "root";
        if (issue.code === "invalid_type") {
          const received = String((issue as { received?: unknown }).received ?? "unknown");
          if (received === "undefined") return `${path}: 缺失（Required）`;
          return `${path}: 类型错误（期望 ${String((issue as { expected?: unknown }).expected)}，实际 ${received}）`;
        }
        return `${path}: ${issue.message}`;
      });
      return {
        kind: "retry_parse",
        error: providerError("INVALID_JSON", `模型输出不符合结构约束：${issues.join("; ")}`),
        issues,
      };
    }

    return { kind: "ok", raw: parsed, mode: attempt.mode, latencyMs: Date.now() - startedAt };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Calls an OpenAI-compatible /chat/completions endpoint and validates the
 * payload with zod before returning it.
 *
 * Request shapes are tried from strongest to weakest so that any
 * OpenAI-compatible provider can work, never at the cost of validation:
 *   1. json_schema (official Structured Outputs, strict)
 *   2. json_object (+ JSON Schema injected into the prompt)
 *   3. plain JSON (+ JSON Schema injected into the prompt)
 * Providers that do not support strict json_schema (e.g. DeepSeek) start at
 * step 2 so every call does not waste a guaranteed 400 + a round trip.
 * Only a schema/format related failure degrades; refusals, timeouts and network
 * errors are surfaced immediately (the runner then falls back to the demo engine).
 */
export async function callStructured<T extends ZodTypeAny>(
  input: StructuredCallInput<T>,
): Promise<StructuredCallResult<z.infer<T>>> {
  const config = getAiConfig();
  if (!config.apiKeyConfigured) {
    throw providerError("MISSING_API_KEY", "缺少 OPENAI_API_KEY，无法调用外部模型。");
  }

  const model = (input.model ?? config.model).trim();
  const temperature = resolveTemperature(input.temperature);
  const maxTokens = resolveMaxTokens();

  const jsonSchemaAttempt: ProviderAttempt = {
    mode: "json_schema",
    responseFormat: zodToStructuredOutputFormat(input.schema, input.schemaName),
    includeTemperature: true,
    includeMaxTokens: true,
    systemSuffix: "",
  };
  const jsonObjectAttempt: ProviderAttempt = {
    mode: "json_object",
    responseFormat: { type: "json_object" },
    includeTemperature: true,
    includeMaxTokens: true,
    systemSuffix: jsonSchemaPromptHint(input.schema, input.schemaName),
  };
  const plainAttempt: ProviderAttempt = {
    mode: "plain",
    includeTemperature: true,
    includeMaxTokens: true,
    systemSuffix: jsonSchemaPromptHint(input.schema, input.schemaName),
  };

  const orderedAttempts: ProviderAttempt[] = config.supportsJsonSchema
    ? [jsonSchemaAttempt, jsonObjectAttempt, plainAttempt]
    : [jsonObjectAttempt, plainAttempt];

  // Only the primary attempt carries the configured sampling parameters:
  // whatever triggers a degradation may have been caused by exactly those
  // parameters, so the retries go out with the plainest possible request body.
  const attempts: ProviderAttempt[] = orderedAttempts.map((attempt, index) => ({
    ...attempt,
    includeTemperature: index === 0,
    includeMaxTokens: index === 0,
  }));

  let lastError: AiProviderError | null = null;
  let shapeIndex = 0;
  let repairsForShape = 0;
  let pendingRepair = "";
  let suffixAfterFailure = "";
  let totalCalls = 0;
  const MAX_REPAIRS_PER_SHAPE = 2;
  const MAX_TOTAL_CALLS = 7;

  while (shapeIndex < attempts.length && totalCalls < MAX_TOTAL_CALLS) {
    const baseAttempt = attempts[shapeIndex];
    const attempt: ProviderAttempt = {
      ...baseAttempt,
      systemSuffix: baseAttempt.systemSuffix + pendingRepair + suffixAfterFailure,
    };
    pendingRepair = "";
    suffixAfterFailure = "";

    const outcome = await attemptProviderCall(input, attempt, config, model, temperature, maxTokens);
    totalCalls += 1;

    if (outcome.kind === "ok") {
      return {
        raw: outcome.raw,
        output: input.schema.parse(outcome.raw) as z.infer<T>,
        model,
        latencyMs: outcome.latencyMs,
        mode: outcome.mode,
      };
    }

    if (outcome.kind === "fatal") throw outcome.error;

    lastError = outcome.error;

    // Fields missing / wrong type: ask again with the exact validation errors
    // instead of discarding a perfectly parseable answer.
    if (outcome.kind === "retry_parse") {
      if (repairsForShape < MAX_REPAIRS_PER_SHAPE) {
        repairsForShape += 1;
        pendingRepair = repairSuffix(outcome.issues);
        continue;
      }
      shapeIndex += 1;
      repairsForShape = 0;
      continue;
    }

    // Output cut off by the token limit: retry the same shape, but shorter.
    if (outcome.error.code === "TRUNCATED" && repairsForShape < MAX_REPAIRS_PER_SHAPE) {
      repairsForShape += 1;
      suffixAfterFailure = concisionSuffix();
      continue;
    }

    shapeIndex += 1;
    repairsForShape = 0;
  }

  throw lastError ?? providerError("UNKNOWN", "调用模型失败，且没有可用的降级请求。");
}

async function safeText(response: Response) {
  try {
    return await response.text();
  } catch {
    return "<no body>";
  }
}

/** Quick connectivity probe used by Settings → AI Status. */
export async function testAiConnection(): Promise<{
  ok: boolean;
  mode: "demo" | "ai";
  message: string;
  latencyMs: number;
  model: string;
}> {
  const config = getAiConfig();
  const startedAt = Date.now();

  if (!config.enabled) {
    return {
      ok: true,
      mode: "demo",
      message: config.reason,
      latencyMs: Date.now() - startedAt,
      model: "MORI local structured engine",
    };
  }

  try {
    const probeSchema = z.object({ ok: z.boolean() });
    const result = await callStructured({
      schema: probeSchema,
      schemaName: "mori_connectivity_probe",
      systemPrompt: "Return a JSON object with a single boolean field named ok set to true.",
      userPrompt: "Health check. Reply with { \"ok\": true }.",
      temperature: 0,
    });
    return {
      ok: true,
      mode: "ai",
      message: `模型连接正常（${result.model} · 请求方式 ${result.mode}）。`,
      latencyMs: result.latencyMs,
      model: result.model,
    };
  } catch (error) {
    return {
      ok: false,
      mode: "ai",
      message: redactSecrets(
        error instanceof AiProviderError
          ? `${error.code}: ${error.message}`
          : error instanceof Error
            ? error.message
            : "未知错误",
      ),
      latencyMs: Date.now() - startedAt,
      model: config.model,
    };
  }
}
```

## `src/lib/ai/context.ts`

```ts
import type { AudienceSegmentSummary, WindowComparison } from "@/lib/analytics";
import type { CreativeScorecard } from "@/types";
import type {
  BrandRecord,
  ContentRecord,
  DerivedMetrics,
  DailyPoint,
  ExperimentRecord,
  GroupedPerformance,
  MetricRow,
  PersonaRecord,
  CompetitorRecord,
  ProductRecord,
  SignalBundle,
} from "@/types";

/**
 * The business context every agent receives. It is assembled on the server
 * from the database so the AI never has to guess what the brand sells.
 */
export type BusinessContext = {
  brand: BrandRecord;
  product: ProductRecord;
  personas: PersonaRecord[];
  competitors: CompetitorRecord[];
  period: { start: string; end: string; label: string; days: number };
  totals: DerivedMetrics;
  daily: DailyPoint[];
  platforms: GroupedPerformance[];
  campaigns: GroupedPerformance[];
  creatives: CreativeScorecard[];
  comparison: WindowComparison | null;
  audience: AudienceSegmentSummary[];
  signals: SignalBundle;
  contents: ContentRecord[];
  experiments: ExperimentRecord[];
  dataSource: { kind: "demo" | "upload"; label: string; rows: number };
};

export type ContentSelection = {
  platform: string;
  contentType: string;
  goal: string;
  topic: string;
  audience: string;
};

export type CreativeSelection = {
  platform: string;
  objective: string;
  audience: string;
  theme: string;
};

export type AgentPayload = {
  context: BusinessContext;
  question?: string;
  contentSelection?: ContentSelection;
  creativeSelection?: CreativeSelection;
  extraNotes?: string;
};

/**
 * Compacts the context into the JSON payload handed to the model. Keeping this
 * explicit (instead of dumping the whole context object) keeps prompts small,
 * deterministic and cheap.
 */
export function contextToPromptPayload(payload: AgentPayload) {
  const { context } = payload;
  return {
    brand: {
      name: context.brand.name,
      positioning: context.brand.positioning,
      product: context.product.name,
      price: context.product.price,
      benefits: context.product.keyBenefits,
      targetAudience: context.brand.targetAudience,
      channels: context.brand.channels,
      keywords: context.brand.keywords,
    },
    period: context.period,
    dataSource: {
      ...context.dataSource,
      simulated: context.dataSource.kind === "demo",
      notice:
        context.dataSource.kind === "demo"
          ? "全部为 Demo / 模拟业务数据：不得把实验或指标变化表述为真实投放、真实用户实验或真实商业成绩；" +
            "请使用「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」。"
          : "用户上传的投放数据：不得声称真实业务增长（转化与收入口径未知），请写「基于上传的投放数据」。",
    },
    totals: roundMetricsForPrompt(context.totals),
    last7VsPrevious7: context.comparison
      ? {
          windowDays: context.comparison.windowDays,
          current: roundMetricsForPrompt(context.comparison.current),
          previous: roundMetricsForPrompt(context.comparison.previous),
          deltasPct: context.comparison.deltas,
        }
      : null,
    dailyTrend: context.daily.map((point) => ({
      date: point.date,
      spend: Math.round(point.spend),
      ctr: Number((point.ctr * 100).toFixed(2)),
      cvr: Number((point.cvr * 100).toFixed(2)),
      roas: Number(point.roas.toFixed(2)),
    })),
    platformPerformance: context.platforms.map((item) => ({
      platform: item.name,
      spend: Math.round(item.spend),
      impressions: item.impressions,
      ctr: Number((item.ctr * 100).toFixed(2)),
      cpc: Number(item.cpc.toFixed(2)),
      cvr: Number((item.cvr * 100).toFixed(2)),
      cpa: Number(item.cpa.toFixed(2)),
      roas: Number(item.roas.toFixed(2)),
      conversionShare: Number((item.share * 100).toFixed(1)),
    })),
    creativeRanking: context.creatives.map((item) => ({
      creative: item.name,
      platform: item.platform,
      spend: Math.round(item.spend),
      ctr: Number((item.ctr * 100).toFixed(2)),
      cvr: Number((item.cvr * 100).toFixed(2)),
      cpa: Number(item.cpa.toFixed(2)),
      roas: Number(item.roas.toFixed(2)),
      ctrIndex: Number(item.ctrIndex.toFixed(2)),
      roasIndex: Number(item.roasIndex.toFixed(2)),
    })),
    audienceSegments: context.audience.map((item) => ({
      segment: item.segment,
      impressions: item.impressions,
      ctr: Number((item.ctr * 100).toFixed(2)),
      cvr: Number((item.cvr * 100).toFixed(2)),
      roas: Number(item.roas.toFixed(2)),
      conversionShare: Number((item.share * 100).toFixed(1)),
    })),
    personas: context.personas.map((persona) => ({
      name: persona.name,
      ageBand: persona.ageBand,
      occupation: persona.occupation,
      share: persona.share,
      painPoints: persona.painPoints,
      motivations: persona.motivations,
      barriers: persona.barriers,
      contentPreferences: persona.contentPreferences,
    })),
    competitors: context.competitors.map((competitor) => ({
      name: competitor.name,
      positioning: competitor.positioning,
      price: competitor.price,
      priceTier: competitor.priceTier,
      professionalScore: competitor.professional,
      audience: competitor.audience,
      contentThemes: competitor.contentThemes,
      adThemes: competitor.adThemes,
      strength: competitor.strength,
      weakness: competitor.weakness,
      isSelf: competitor.isSelf,
    })),
    computedSignals: context.signals,
    experiments: context.experiments.map((experiment) => ({
      name: experiment.name,
      status: experiment.status,
      /**
       * 数据字段定义：实验来自模拟数据集。status(running/completed) 只描述推演状态，
       * 不代表真实实验已经跑完并得到验证。模型必须据此约束表述。
       */
      simulated: true,
      statusNote:
        "该实验为模拟实验（Demo 数据集），status 仅表示推演状态；不得写成“实验已完成/已验证/实际提升 X%”。",
      primaryMetric: experiment.primaryMetric,
      summary: experiment.summary,
      aiRecommendation: experiment.aiRecommendation,
      variants: experiment.variants.map((variant) => ({
        label: variant.label,
        name: variant.name,
        impressions: variant.impressions,
        clicks: variant.clicks,
        conversions: variant.conversions,
        spend: variant.spend,
        revenue: variant.revenue,
      })),
    })),
    contentLibrarySample: context.contents.slice(0, 8).map((content) => ({
      title: content.title,
      platform: content.platform,
      goal: content.goal,
      overallScore: content.overallScore,
    })),
    request: {
      question: payload.question ?? null,
      contentSelection: payload.contentSelection ?? null,
      creativeSelection: payload.creativeSelection ?? null,
      notes: payload.extraNotes ?? null,
    },
  };
}

function roundMetricsForPrompt(metrics: DerivedMetrics) {
  return {
    spend: Math.round(metrics.spend),
    impressions: metrics.impressions,
    clicks: metrics.clicks,
    conversions: metrics.conversions,
    revenue: Math.round(metrics.revenue),
    ctrPct: Number((metrics.ctr * 100).toFixed(2)),
    cpc: Number(metrics.cpc.toFixed(2)),
    cvrPct: Number((metrics.cvr * 100).toFixed(2)),
    cpa: Number(metrics.cpa.toFixed(2)),
    roas: Number(metrics.roas.toFixed(2)),
  };
}

export type ContextMetricRow = MetricRow;
```

## `src/lib/ai/demo-engine.ts`

```ts
import type { AgentPayload, ContentSelection, CreativeSelection } from "@/lib/ai/context";
import type {
  AudienceAnalysis,
  CampaignAnalysis,
  ContentStrategy,
  CreativeDirections,
  GrowthAdvice,
  GrowthReport,
  MarketAnalysis,
} from "@/lib/ai/schemas";
import type { Signal, SignalBundle } from "@/types";

/**
 * Local structured analysis engine ("Demo Mode").
 *
 * This is NOT a set of hard-coded answers: every sentence is assembled from the
 * numbers that were just computed from the (simulated) database rows, so if you
 * change the demo data or upload your own CSV, the analysis changes with it.
 *
 * When DEMO_MODE=false and an API key is present, `lib/ai/runner.ts` calls the
 * real structured-output model instead and only falls back to this engine when
 * the provider fails or returns invalid data.
 */

const money = (value: number) => `¥${Math.round(value).toLocaleString("zh-CN")}`;
const pct = (value: number, digits = 2) => `${(value * 100).toFixed(digits)}%`;
const ratio = (value: number, digits = 2) => value.toFixed(digits);

/**
 * 所有 Demo 引擎生成的结论都必须带数据口径前缀。
 * 这些结果是基于模拟数据的推演，不能被读成真实投放/真实实验的结论。
 */
const DEMO_TAG = "（Demo / 模拟业务数据）";

function take(primary: Signal[], count: number, fallback: Signal[]): Signal[] {
  const merged = [...primary, ...fallback];
  const used = new Set<string>();
  const result: Signal[] = [];
  merged.forEach((signal) => {
    if (result.length >= count) return;
    if (used.has(signal.title)) return;
    used.add(signal.title);
    result.push(signal);
  });
  return result;
}

function emptySignals(bundle: SignalBundle): boolean {
  return bundle.insights.length + bundle.opportunities.length + bundle.risks.length + bundle.recommendations.length === 0;
}

function fallbackSignal(title: string, body: string, evidence: string, confidence = 70): Signal {
  return { title, body, evidence, confidence };
}

function lowestCpc(list: AgentPayload["context"]["platforms"]) {
  return list.reduce((best, item) => (item.cpc < best.cpc ? item : best), list[0]);
}

/* -------------------------------------------------------------------------- */
/* Agent 1 - Market Analyst                                                    */
/* -------------------------------------------------------------------------- */

export function demoMarketAnalysis(payload: AgentPayload): MarketAnalysis {
  const context = payload.context;
  const self = context.competitors.find((item) => item.isSelf);
  const others = context.competitors.filter((item) => !item.isSelf);
  const cheapest = [...context.competitors].sort((a, b) => a.price - b.price)[0];
  const priciest = [...context.competitors].sort((a, b) => b.price - a.price)[0];
  const professionalLeader = [...context.competitors].sort((a, b) => b.professional - a.professional)[0];

  const themeCount = new Map<string, number>();
  others.forEach((competitor) => {
    competitor.contentThemes.forEach((theme) => themeCount.set(theme, (themeCount.get(theme) ?? 0) + 1));
  });
  const crowded = Array.from(themeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme, count]) => theme + "(" + count + ")")
    .join("、");

  const summary =
    "基于模拟数据（Demo 数据集）的竞品矩阵分析：在 4 个虚拟竞品构成的价格 × 专业度矩阵中，" +
    (self?.name ?? context.brand.name) +
    " 位于「" +
    (self?.priceTier ?? "中低价位") +
    " × 专业度 " +
    (self?.professional ?? 60) +
    "」的位置：价格低于 " +
    (professionalLeader?.name ?? "头部竞品") +
    "（" +
    money(professionalLeader?.price ?? 0) +
    "），高于 " +
    (cheapest?.name ?? "低价竞品") +
    "（" +
    money(cheapest?.price ?? 0) +
    "）。这一区间既避开了高价品牌的正面专业竞争，也不必卷入价格战，但需要自己补齐「专业信任」这块短板。";

  const competitiveGaps = [
    {
      name: "可信的年轻表达",
      gap:
        others.map((item) => item.name).join(" / ") +
        " 要么用专业数据说话（偏理性、门槛高），要么用氛围与低价直给（缺产品机理），中间缺少「用年轻语言把成分与用法讲清楚」的位置。",
      evidence: others.map((item) => item.name + " 弱点：" + item.weakness).join("；"),
    },
    {
      name: "长期使用记录",
      gap:
        "竞品内容以单点卖点与氛围为主，缺少可追踪的长期记录内容（如 30 天状态记录），而年轻用户真正需要的是「别人用完是什么样」的确定性。",
      evidence: "竞品内容主题高频词：" + (crowded || "数据不足"),
    },
    {
      name: "价格解释",
      gap:
        "竞品普遍直接给价格或折扣，缺少「单次使用成本 / 可使用天数」的解释方式，对预算敏感人群（" +
        (context.personas[1]?.name ?? "学生党人群") +
        "）不够友好。",
      evidence:
        "MORI 价格 " +
        money(context.product.price) +
        "；竞品价格区间 " +
        money(cheapest?.price ?? 0) +
        "–" +
        money(priciest?.price ?? 0),
    },
  ];

  const insights: Signal[] = [
    {
      title: "价格带存在结构空隙",
      body:
        "竞品价格分布在 " +
        money(cheapest?.price ?? 0) +
        " 到 " +
        money(priciest?.price ?? 0) +
        " 之间，MORI 的 " +
        money(context.product.price) +
        " 同时避开了低价爆款与高价功效型，适合用「中价位 + 可信内容」切入。",
      evidence: context.competitors.map((item) => item.name + "=" + money(item.price)).join("、"),
      confidence: 84,
    },
    {
      title: "专业度是 MORI 最明显的短板",
      body:
        "在专业度维度上 " +
        (professionalLeader?.name ?? "头部竞品") +
        " 达到 " +
        (professionalLeader?.professional ?? 0) +
        " 分，MORI 为 " +
        (self?.professional ?? 0) +
        " 分。这不阻挡短期转化，但会影响 " +
        (context.personas[2]?.name ?? "轻熟人群") +
        " 的长期决策。",
      evidence: "competitors.professional（0–100 感知分，Demo）",
      confidence: 80,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "用「成分讲人话」补专业信任",
      body: "把成分表拆成三个问题讲清楚：解决什么、适合谁、怎么用。既保留专业感，又不会像竞品那样让年轻用户看不懂。",
      evidence: "竞品内容主题以实验数据与氛围为主，缺少通俗解释型内容",
      confidence: 78,
    },
    {
      title: "把 30 天记录做成品牌资产",
      body: "连续记录比单点卖点更难被复制，可以沉淀为长期内容系列，同时为落地页提供真实素材。",
      evidence: others.map((item) => item.name + " 广告主题：" + item.adThemes.join("/")).join("；"),
      confidence: 81,
    },
  ];

  const risks: Signal[] = [
    {
      title: "低价竞品随时能用价格带走年轻用户",
      body:
        (cheapest?.name ?? "低价竞品") +
        " 价格仅 " +
        money(cheapest?.price ?? 0) +
        "。如果 MORI 只讲价格与性价比，很容易被更低价替代，必须把内容重心放在「为什么值得多花这部分钱」。",
      evidence: "价格差 " + money(Math.max(0, context.product.price - (cheapest?.price ?? 0))),
      confidence: 83,
    },
    {
      title: "没有证据时不要做功效型对比",
      body: "在缺少第三方检测数据的情况下，任何功效对比都会带来合规与信任风险，应保持克制表述。",
      evidence: "品牌 credibility 字段：Demo 数据，不含功效承诺",
      confidence: 90,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "下一阶段主攻「可信的年轻表达」",
      body: "用三类内容组合：① 通俗成分解释；② 真实使用记录；③ 具体场景（熬夜 / 通勤 / 空调房）。三类内容分别对应信任、确定性与场景代入。",
      evidence: "MORI 品牌关键词：" + context.brand.keywords.join("、"),
      confidence: 82,
    },
    {
      title: "把竞品弱点转成选题清单",
      body:
        "针对「" +
        (professionalLeader?.name ?? "头部竞品") +
        " 内容偏理性」做通俗化改编，针对「" +
        (cheapest?.name ?? "低价竞品") +
        " 复购弱」做长期使用记录内容。",
      evidence: "competitors.weakness 字段",
      confidence: 76,
    },
  ];

  return {
    summary,
    competitiveGaps,
    positioningAdvice:
      "建议 MORI 占住「中价位 + 可验证的年轻护肤」：不打价格战，也不堆砌功效数据，而是用成分透明、真实使用记录与具体场景建立可信度。",
    insights: take(insights, 3, context.signals.insights),
    opportunities: take(opportunities, 3, context.signals.opportunities),
    risks: take(risks, 3, context.signals.risks),
    recommendations: take(recommendations, 3, context.signals.recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 2 - Audience Analyst                                                  */
/* -------------------------------------------------------------------------- */

export function demoAudienceAnalysis(payload: AgentPayload): AudienceAnalysis {
  const context = payload.context;
  const byCtr = [...context.audience].sort((a, b) => b.ctr - a.ctr);
  const byCvr = [...context.audience].sort((a, b) => b.cvr - a.cvr);
  const highestCtr = byCtr[0];
  const highestCvr = byCvr[0];
  const lowestCvr = byCvr[byCvr.length - 1];

  const personas = context.personas.map((persona) => ({
    name: persona.name,
    segment: persona.ageBand + " · " + persona.occupation,
    painPoints: persona.painPoints,
    motivations: persona.motivations,
    barriers: persona.barriers,
    contentPreferences: persona.contentPreferences,
  }));

  const adAngles = [
    {
      angle: "熬夜场景 + 结果不确定性",
      hook: "连续熬夜第 12 天，我的脸终于不闹脾气了",
      audience: context.personas[0]?.name ?? "熬夜人群",
      rationale: "把痛点锁定在具体时间点，让用户先代入场景，再接受产品作为解决方案。",
    },
    {
      angle: "成分讲人话",
      hook: "修护和保湿不是一回事，选错方向当然没感觉",
      audience: context.personas[2]?.name ?? "轻熟人群",
      rationale: "用纠错式判断制造认知冲突，适合专业度敏感人群，同时补齐品牌信任短板。",
    },
    {
      angle: "单次使用成本",
      hook: "¥169 分摊到每天是多少钱？我算给你看",
      audience: context.personas[1]?.name ?? "学生党人群",
      rationale: "预算敏感人群的阻力是「值不值」，把价格换算成单次成本可以直接降低首单门槛。",
    },
    {
      angle: "肤感实测",
      hook: "怕黏腻的人，先看这个 10 秒质地测试",
      audience: "油皮 / 混合皮年轻用户",
      rationale: "肤感是年轻用户最直观的决策点，可视化测试比形容词更可信。",
    },
  ];

  const insights: Signal[] = [
    {
      title: highestCtr ? highestCtr.segment + " 点击意愿最强，但购买理由不足" : "分人群数据不足",
      body: highestCtr
        ? highestCtr.segment +
          " 的 CTR 为 " +
          pct(highestCtr.ctr) +
          "（全账户最高），但 CVR 仅 " +
          pct(highestCtr.cvr) +
          "，低于 " +
          (highestCvr?.segment ?? "高转化人群") +
          "（" +
          pct(highestCvr?.cvr ?? 0) +
          "）。内容吸引力不是瓶颈，缺的是「现在值得买」的解释与信任证据。"
        : "当前数据集没有分人群指标，无法给出人群结论。",
      evidence: context.audience
        .map((item) => item.segment + ": CTR=" + pct(item.ctr) + ", CVR=" + pct(item.cvr) + ", ROAS=" + ratio(item.roas))
        .join("; "),
      confidence: 86,
    },
    {
      title: "年轻用户买的是确定性，而不是「便宜」",
      body: "预算敏感人群的内容偏好集中在真实测评、成分透明与长期记录，而不是最低价。低价只解决第一次尝试，复购靠的是稳定预期。",
      evidence: context.personas
        .map((persona) => persona.name + " 购买驱动：" + persona.purchaseDrivers.join("/"))
        .join("；"),
      confidence: 79,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "为高点击人群补「信任 + 价格解释」内容",
      body:
        (highestCtr?.segment ?? "年轻人群") +
        " 需要三类内容拉高 CVR：真实使用记录（30 天）、成分与用法说明、单次使用成本换算，并可用试用规格降低首单门槛。",
      evidence: "CTR " + pct(highestCtr?.ctr ?? 0) + " vs CVR " + pct(highestCtr?.cvr ?? 0),
      confidence: 83,
    },
    {
      title: "把高转化人群的内容结构复制到低效人群",
      body:
        (highestCvr?.segment ?? "高转化人群") +
        " 的 CVR 达到 " +
        pct(highestCvr?.cvr ?? 0) +
        "，说明「专业解释 + 长期视角」的结构有效，可以改写成更轻量的版本用于年轻人群。",
      evidence: context.audience.map((item) => item.segment + "=" + pct(item.cvr)).join("、"),
      confidence: 77,
    },
  ];

  const risks: Signal[] = [
    {
      title: "低转化人群持续消耗预算",
      body: lowestCvr
        ? lowestCvr.segment +
          " 的 CVR 仅 " +
          pct(lowestCvr.cvr) +
          "，却占用 " +
          pct(lowestCvr.spendShare, 1) +
          " 的预算；如果不做内容与承接调整，CPA 会继续被推高。"
        : "分人群预算分布数据不足。",
      evidence:
        "segment=" +
        (lowestCvr?.segment ?? "-") +
        "; CVR=" +
        pct(lowestCvr?.cvr ?? 0) +
        "; spendShare=" +
        pct(lowestCvr?.spendShare ?? 0, 1),
      confidence: 82,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "按人群拆分内容测试，而不是全账户一起测",
      body: "把 18–24 岁女性与 25–30 岁女性分成两组素材，分别观察 CTR 与 CVR，避免用同一套素材服务两种完全不同的购买逻辑。",
      evidence: "AudienceMetric 分人群指标（Demo）",
      confidence: 80,
    },
  ];

  return {
    summary: context.audience.length
      ? "基于模拟数据（Demo 数据集）的分人群结论：" +
        (highestCtr?.segment ?? "-") +
        " 的点击效率最高（CTR " +
        pct(highestCtr?.ctr ?? 0) +
        "），而转化效率最高的是 " +
        (highestCvr?.segment ?? "-") +
        "（CVR " +
        pct(highestCvr?.cvr ?? 0) +
        "）。人群策略应从「覆盖更多人」转向「给不同人群不同的购买理由」。"
      : "当前数据集没有分人群指标，建议先导出人群维度报表后再做人群结论。",
    personas,
    opportunityCards: {
      user: [
        (highestCtr?.segment ?? "高点击人群") +
          " 点击意愿最强但购买理由不足：需要用内容补齐「值得买」的解释，而不是继续加大曝光。",
        (highestCvr?.segment ?? "高转化人群") +
          " 的转化效率最高（CVR " +
          pct(highestCvr?.cvr ?? 0) +
          "），可以把它有效的内容结构改写成更轻量的版本用于年轻人群。",
      ],
      content: [
        "真实使用记录类内容（30 天）：用可追踪的记录替代形容词，提升信任。",
        "价格解释类内容：把 " +
          money(context.product.price) +
          " 换算成单次使用成本，降低预算敏感人群的决策门槛。",
        "场景对比类内容：同一人群在不同场景（熬夜 / 通勤 / 空调房）下的使用方法差异。",
      ],
      product: [
        "强调「一步完成晚间修护 + 保湿」的简化价值，回应「不想复杂护肤」的核心痛点。",
        "突出清爽肤感（不黏枕头）与可长期使用的配方思路，回应年轻用户对肤感的敏感度。",
        "增加成分与用法的透明说明，补齐品牌在专业信任上的短板。",
      ],
      ad: [
        "广告开头 3 秒直接给出具体场景（时间 + 动作 + 状态），而不是抽象卖点。",
        "落地页首屏复述素材承诺，并放置真实使用记录与价格解释模块。",
        "针对高点击低转化人群单独建组，用「信任 + 价格」型素材做定向测试。",
      ],
    },
    adAngles,
    insights: take(insights, 3, context.signals.insights),
    opportunities: take(opportunities, 3, context.signals.opportunities),
    risks: take(risks, 3, context.signals.risks),
    recommendations: take(recommendations, 3, context.signals.recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 3 - Content Strategist                                                */
/* -------------------------------------------------------------------------- */

const PLATFORM_HINT: Record<string, string> = {
  小红书: "真诚的用户口吻，多讲过程与感受，少讲结论",
  抖音: "前 3 秒必须有场景冲突，15 秒内完成痛点 → 方案 → 行动",
  公众号: "用知识结构建立信任，段落短、结论前置",
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100_000;
  }
  return hash;
}

function topicAffinity(topic: string, payload: AgentPayload) {
  const tokens = topic
    .split(/[\s/、,，]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
  const best = payload.context.creatives.reduce((acc, creative) => Math.max(acc, creative.roasIndex), 0);
  if (tokens.length === 0) return Math.min(1, 0.5 + best * 0.12);
  const matched = payload.context.creatives.filter((creative) =>
    tokens.some((token) => creative.name.includes(token) || creative.name.includes(token.slice(0, 2))),
  );
  const matchRatio = matched.length / Math.max(payload.context.creatives.length, 1);
  return Math.min(1, 0.45 + matchRatio * 0.3 + Math.min(best, 1.5) * 0.12);
}

export function demoContentStrategy(payload: AgentPayload): ContentStrategy {
  const context = payload.context;
  const selection: ContentSelection =
    payload.contentSelection ?? {
      platform: "小红书",
      contentType: "种草",
      goal: "互动",
      topic: "熬夜修护",
      audience: context.personas[0]?.name ?? "熬夜型都市新人",
    };

  const affinity = topicAffinity(selection.topic, payload);
  const seed = hashString(selection.platform + "-" + selection.topic + "-" + selection.goal);
  const jitter = (offset: number) => ((seed + offset * 37) % 13) - 6;

  const hookScore = Math.max(50, Math.min(98, Math.round(74 + affinity * 18 + jitter(1))));
  const relevanceScore = Math.max(55, Math.min(98, Math.round(78 + affinity * 14 + jitter(2))));
  const conversionScore = Math.max(
    45,
    Math.min(96, Math.round((selection.goal.includes("转化") ? 80 : 68) + affinity * 14 + jitter(3))),
  );
  const brandFitScore = Math.max(60, Math.min(98, Math.round(84 + affinity * 8 + jitter(4))));
  const overallScore = Math.round(
    hookScore * 0.25 + relevanceScore * 0.3 + conversionScore * 0.25 + brandFitScore * 0.2,
  );

  const titles = [
    {
      title: "每天熬夜的人，真的需要一瓶" + selection.topic + "吗？",
      angle: "质疑式提问",
      whyItWorks: "用反问制造轻微认知冲突，让熬夜人群先怀疑自己的护肤逻辑，再进入阅读。",
    },
    {
      title: "连续加班 12 天，我唯一没放弃的护肤步骤",
      angle: "时间线叙述",
      whyItWorks: "具体数字提升可信度，「唯一没放弃」暗示步骤足够简单。",
    },
    {
      title: "预算有限也能坚持的" + selection.topic + "，我算了单次成本",
      angle: "价格解释",
      whyItWorks: "直接回应目标人群的核心阻力，把价格问题转成可计算的小额成本。",
    },
    {
      title: selection.topic + "不是越贵越好，先搞清楚这两件事",
      angle: "纠错型干货",
      whyItWorks: "纠错型标题自带信息量，适合搜索场景并建立专业感。",
    },
    {
      title: "换季又开始起皮的第 3 天，我做了一个减法",
      angle: "场景切片",
      whyItWorks: "用具体天数与状态描述还原真实感，减少广告感。",
    },
  ];

  const bodyLines = [
    "最近加班比较多，皮肤状态很不稳定：脸颊发干、上妆卡粉。我把护肤步骤砍到只剩两步，基础保湿加一支质地清爽的晚间修护精华（Demo 示例产品）。",
    "用了大概两周，比较明显的变化是第二天早上起来脸不那么紧绷，起皮的情况也少了。它不是那种「一晚就变好」的产品，更像是让状态别继续往下掉。",
    "质地偏水感，涂完不用等就能睡，不会粘枕头。价格 " +
      money(context.product.price) +
      "，我算了下一瓶 40ml 日常用量能用 1.5–2 个月，单次成本大概两三块。",
    "如果你也是熬夜党，建议先别急着加产品，先把自己的流程简化下来。（Demo 示例文案，不含功效承诺）",
  ];

  const script = [
    {
      timeRange: "0–3s",
      section: "Hook",
      content: "凌晨 1 点的电脑屏幕与一张疲惫的脸：「连续熬夜第 12 天，我的脸终于不闹脾气了」。",
    },
    {
      timeRange: "3–8s",
      section: "痛点",
      content: "起皮、卡粉、第二天显疲态；护肤步骤越多越坚持不下来。",
    },
    {
      timeRange: "8–12s",
      section: "解决方案",
      content: "睡前一步：质地清爽的" + context.product.name + "，吸收后再做基础保湿（Demo 演示）。",
    },
    {
      timeRange: "12–15s",
      section: "CTA",
      content: "点进来看真实使用第 30 天的记录。",
    },
  ];

  const insights: Signal[] = [
    {
      title:
        selection.platform +
        " 的内容策略应以「" +
        (PLATFORM_HINT[selection.platform] ?? "真实场景 + 明确下一步") +
        "」为主",
      body:
        "在这个平台上，" +
        selection.audience +
        " 对「" +
        selection.topic +
        "」的关注点更偏向「" +
        (selection.topic.includes("预算") ? "价格是否合理" : "步骤是否简单、值得坚持") +
        "」。建议结构：具体场景切入 → 说清做法 → 给出可验证的下一步。",
      evidence:
        "内容库中该平台高分选题：" +
        (context.contents
          .filter((content) => content.platform === selection.platform)
          .sort((a, b) => b.overallScore - a.overallScore)
          .slice(0, 2)
          .map((content) => content.title)
          .join("、") || "暂无"),
      confidence: 85,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "把最高效素材的主题做成系列",
      body:
        (context.creatives[0]?.name ?? "高效素材") +
        " 的 ROAS 为 " +
        ratio(context.creatives[0]?.roas ?? 0) +
        "（全账户最高）。围绕该主题再产 3 条同结构不同场景的内容，验证是主题红利还是单条素材运气。",
      evidence: "creative=" + (context.creatives[0]?.name ?? "-") + "; ROAS=" + ratio(context.creatives[0]?.roas ?? 0),
      confidence: 82,
    },
  ];

  const risks: Signal[] = [
    {
      title: "避免把「状态稳定」写成功效承诺",
      body: "涉及治疗效果或绝对化结果的表述都不能出现，用「更有规律」「不那么紧绷」「更容易坚持」这类可感知但克制的描述替代。",
      evidence: "品牌合规约束 + Demo 数据说明",
      confidence: 95,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "先测 Hook，再测正文",
      body: "同一正文准备 3 个不同 Hook，投 3–5 天看 CTR 差异，再决定保留哪个方向，这样每次只改变一个变量。",
      evidence: "当前账户 CTR=" + pct(context.totals.ctr) + "，可作为测试基准",
      confidence: 84,
    },
  ];

  return {
    summary:
      "基于模拟数据（Demo 数据集）的内容方案：围绕「" +
      selection.topic +
      "」为 " +
      selection.platform +
      "（" +
      selection.contentType +
      " / 目标：" +
      selection.goal +
      "）生成一套内容方案：5 个标题、1 篇正文、1 条 15 秒脚本，并给出可解释的评分。目标人群：" +
      selection.audience +
      "。",
    xiaohongshu: { titles, body: bodyLines.join("\n\n") },
    douyin: {
      hook: script[0].content,
      caption: "熬夜党的夜间一步护肤｜" + selection.topic + "（Demo 示例）",
      script,
    },
    scores: {
      hookScore,
      relevanceScore,
      conversionScore,
      brandFitScore,
      overallScore,
      whyTest:
        "Hook 分 " +
        hookScore +
        "，与「" +
        selection.topic +
        "」相关性 " +
        relevanceScore +
        "，适合作为该主题的基准版本先跑 3–5 天；若 CTR 高于账户均值 " +
        pct(context.totals.ctr) +
        "，即可进入放量测试。",
      howToImprove:
        "把第 3–8 秒的痛点再具体化（加入时间、地点、动作），并在结尾补一条真实使用记录，预期可把转化潜力从 " +
        conversionScore +
        " 提升 5–8 分。",
    },
    keywords: [selection.topic, "熬夜修护", "清爽肤感", "单次使用成本", "30 天记录", "成分透明"],
    insights: take(insights, 3, context.signals.insights),
    opportunities: take(opportunities, 3, context.signals.opportunities),
    risks: take(risks, 3, context.signals.risks),
    recommendations: take(recommendations, 3, context.signals.recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 4 - Creative Strategist                                               */
/* -------------------------------------------------------------------------- */

export function demoCreativeDirections(payload: AgentPayload): CreativeDirections {
  const context = payload.context;
  const selection: CreativeSelection =
    payload.creativeSelection ?? {
      platform: "抖音",
      objective: "转化",
      audience: "23 岁熬夜女性",
      theme: "夜间修护",
    };

  const accountCtr = context.totals.ctr;
  const basePriority = 78;
  const step = (timeRange: string, section: string, content: string) => ({ timeRange, section, content });

  const directions = [
    {
      code: "A",
      angle: "熬夜场景",
      hook: "凌晨一点还在改方案的人，睡前只剩一件事",
      cta: "看 30 天记录",
      audience: selection.audience,
      priorityScore: basePriority + 14,
      rationale:
        "与账户内 ROAS 最高的素材同属场景痛点族，历史点击效率更高。先测它可以验证「主题红利」是否可复制。",
      script: [
        step("0–3s", "Hook", "凌晨的办公桌、冷掉的咖啡、疲惫的脸：「连续熬夜第 12 天，我的脸终于不闹脾气了」"),
        step("3–8s", "痛点", "起皮、卡粉、第二天显疲态；护肤步骤越多越坚持不下来。"),
        step("8–12s", "解决方案", "睡前一步，质地清爽的晚间修护精华，吸收后再做基础保湿。"),
        step("12–15s", "CTA", "点进来看真实使用第 30 天的记录。"),
      ],
    },
    {
      code: "B",
      angle: "睡前护肤流程",
      hook: "睡前 5 分钟，把自己从工作里捞出来",
      cta: "看睡前流程",
      audience: "23–30 岁都市女性",
      priorityScore: basePriority + 6,
      rationale: "情绪价值方向尚未在账户内充分测试，但同主题内容互动稳定，适合作为第二优先方向。",
      script: [
        step("0–3s", "Hook", "暖色灯光、关掉电脑的声音：「今天到这里。」"),
        step("3–8s", "痛点", "一天的紧绷感被带到床上，睡前状态很难放松。"),
        step("8–12s", "解决方案", "把晚间护肤固定成一个放松动作，只需要 5 分钟。"),
        step("12–15s", "CTA", "今晚试试这 5 分钟。"),
      ],
    },
    {
      code: "C",
      angle: "办公室疲惫肌",
      hook: "在空调房待 8 小时，脸会变成什么样",
      cta: "拿办公桌护肤清单",
      audience: "23–30 岁办公室女性",
      priorityScore: basePriority + 2,
      rationale: "场景具体、人群明确，但账户内同场景素材 ROAS 处于中位，优先级略低。",
      script: [
        step("0–3s", "Hook", "办公室空调出风口 + 下午起皮的特写。"),
        step("3–8s", "痛点", "下午脸紧绷、卡粉、摸上去发干。"),
        step("8–12s", "解决方案", "夜间修护 + 日间基础保湿的组合思路。"),
        step("12–15s", "CTA", "点进来拿办公桌护肤清单。"),
      ],
    },
    {
      code: "D",
      angle: "30 天挑战",
      hook: "30 天只加一步护肤，记录每天的状态变化",
      cta: "加入 30 天挑战",
      audience: "20–28 岁关注肌肤稳定状态的女性",
      priorityScore: basePriority + 9,
      rationale: "挑战式内容能沉淀长期素材资产，账户内同主题素材 ROAS 高于均值，建议与方向 A 同期测试。",
      script: [
        step("0–3s", "Hook", "日历翻到 Day 1，素颜出镜。"),
        step("3–8s", "痛点", "状态忽好忽坏，产品越换越乱。"),
        step("8–12s", "解决方案", "只在夜间加一步，其他护肤保持不变。"),
        step("12–15s", "CTA", "评论区回复「挑战」领取记录表。"),
      ],
    },
    {
      code: "E",
      angle: "极简护肤",
      hook: "护肤做太多，状态反而更不稳定",
      cta: "看极简流程",
      audience: "20–28 岁想简化护肤流程的女性",
      priorityScore: basePriority - 4,
      rationale: "与品牌克制、简单的调性最契合，但点击驱动力偏弱，适合作为结构对标组而不是首测方向。",
      script: [
        step("0–3s", "Hook", "护肤台上被一件件移走的产品。"),
        step("3–8s", "痛点", "步骤越多，越难坚持。"),
        step("8–12s", "解决方案", "把复杂步骤放在夜间，早上只做基础保湿。"),
        step("12–15s", "CTA", "看极简流程。"),
      ],
    },
  ].map((direction) => ({ ...direction, priorityScore: Math.min(99, direction.priorityScore) }));

  const testingOrder = [...directions]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map((direction) => direction.code + "｜" + direction.angle);

  const insights: Signal[] = [
    {
      title: "同一主题下，场景痛点族的历史效率最高",
      body:
        "账户内场景类素材 CTR 达到 " +
        pct(context.creatives[0]?.ctr ?? accountCtr) +
        "，高于账户均值 " +
        pct(accountCtr) +
        "。因此方向 A（熬夜场景）应作为首测方向，而不是从文案最漂亮的方向开始测。",
      evidence:
        "creative=" +
        (context.creatives[0]?.name ?? "-") +
        "; CTR=" +
        pct(context.creatives[0]?.ctr ?? 0) +
        "; ROAS=" +
        ratio(context.creatives[0]?.roas ?? 0),
      confidence: 86,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "用 5 个方向覆盖完整决策链路",
      body: "A（场景）解决代入，D（挑战）解决确定性，E（极简）解决坚持难度，B（情绪）解决感受，C（办公室）解决具体痛点。一次投放即可看出人群真正卡在哪一环。",
      evidence: "5 个方向来自不同角度族，结构性差异明确",
      confidence: 80,
    },
  ];

  const risks: Signal[] = [
    {
      title: "方向过多会摊薄预算，导致每个方向都测不出结论",
      body:
        "按当前账户日均花费约 " +
        money(context.totals.spend / Math.max(context.period.days, 1)) +
        " 计算，5 个方向同时测试时单方向样本量偏小。建议第一轮只测 A、D、E。",
      evidence: "账户总花费 " + money(context.totals.spend) + " / " + context.period.days + " 天",
      confidence: 84,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "先测 3 个方向，保留 2 个作为下一轮",
      body: "第一轮只跑 A / D / E，观察 CTR 与 CVR 的差异；第二轮用胜出方向的语义结构改造 B / C，避免同时引入过多变量。",
      evidence: "历史 CTR 均值 " + pct(accountCtr) + " 可作为首轮判断基准",
      confidence: 85,
    },
  ];

  return {
    summary:
      "基于模拟数据（Demo 数据集）：为 " +
      selection.platform +
      "（目标：" +
      selection.objective +
      "，人群：" +
      selection.audience +
      "，主题：" +
      selection.theme +
      "）生成 5 个结构性差异的素材方向，并按测试优先级排序。排序依据来自账户历史效率（CTR " +
      pct(accountCtr) +
      "，ROAS " +
      ratio(context.totals.roas) +
      "）与方向之间的角度差异。",
    directions,
    testingOrder,
    insights: take(insights, 3, context.signals.insights),
    opportunities: take(opportunities, 3, context.signals.opportunities),
    risks: take(risks, 3, context.signals.risks),
    recommendations: take(recommendations, 3, context.signals.recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 5 - Performance Analyst                                               */
/* -------------------------------------------------------------------------- */

export function demoCampaignAnalysis(payload: AgentPayload): CampaignAnalysis {
  const context = payload.context;
  const comparison = context.comparison;
  const sorted = [...context.creatives].sort((a, b) => b.roas - a.roas);
  const winners = sorted.slice(0, 3);
  const losers = [...sorted].reverse().slice(0, 3);

  const current = comparison?.current;
  const previous = comparison?.previous;
  const roasDelta = comparison?.deltas.roas ?? 0;
  const ctrDelta = comparison?.deltas.ctr ?? 0;
  const cvrDelta = comparison?.deltas.cvr ?? 0;
  const funnelDriver = Math.abs(cvrDelta) >= Math.abs(ctrDelta) ? "承接与转化环节（CVR）" : "流量与素材环节（CTR）";

  const diagnosis = comparison
    ? "最近 " +
      comparison.windowDays +
      " 天账户 ROAS 为 " +
      ratio(current?.roas ?? 0) +
      "，相比前 " +
      comparison.windowDays +
      " 天（" +
      ratio(previous?.roas ?? 0) +
      "）" +
      (roasDelta >= 0 ? "上升 " : "下降 ") +
      Math.abs(roasDelta).toFixed(1) +
      "%；CPA 从 " +
      money(previous?.cpa ?? 0) +
      " 变为 " +
      money(current?.cpa ?? 0) +
      "，主要变化发生在" +
      funnelDriver +
      "。"
    : "当前数据集只有单一时间窗口，账户整体 ROAS 为 " +
      ratio(context.totals.roas) +
      "，CPC " +
      ratio(context.totals.cpc) +
      "，CPA " +
      money(context.totals.cpa) +
      "。";

  const mainReason = comparison
    ? "主导环节是" +
      funnelDriver +
      "：CTR 变化 " +
      ctrDelta.toFixed(1) +
      "%，而 CVR 变化 " +
      cvrDelta.toFixed(1) +
      "%（" +
      pct(previous?.cvr ?? 0) +
      " → " +
      pct(current?.cvr ?? 0) +
      "）。点击效率基本稳定说明素材吸引力不是主因，因此可以排除「素材失效」，优先检查落地页一致性、价格解释与信任证据。"
    : "数据窗口不足，暂时无法确定主导环节，至少需要两个等长窗口才能做归因。";

  const hypotheses = [
    {
      hypothesis: "新素材的承诺与落地页首屏信息不一致，用户点击后没有找到承诺的信息",
      evidence:
        "CTR 变化 " +
        ctrDelta.toFixed(1) +
        "%（基本持平），CVR 从 " +
        pct(previous?.cvr ?? 0) +
        " 变为 " +
        pct(current?.cvr ?? 0) +
        "，说明流量质量与承接体验之间存在落差",
      confidence: 78,
    },
    {
      hypothesis: "新增年轻人群流量占比提高，该人群购买理由不足",
      evidence: context.audience.length
        ? "分人群数据：" +
          (context.audience[0]?.segment ?? "-") +
          " CTR " +
          pct(context.audience[0]?.ctr ?? 0) +
          " 但 CVR 仅 " +
          pct(context.audience[0]?.cvr ?? 0)
        : "缺少分人群数据，需补充人群维度报表",
      confidence: 72,
    },
    {
      hypothesis: "促销节奏变化影响转化（折扣结束或权益减少）",
      evidence: "当前数据集不包含促销字段，需要用业务日历交叉验证，属于待验证假设",
      confidence: 55,
    },
  ];

  const budgetMoves = [
    {
      from: losers[0]?.name ?? "低效素材",
      to: winners[0]?.name ?? "高效素材",
      amount: money(Math.max(0, (losers[0]?.spend ?? 0) * 0.5)) + "（释放该素材约 50% 预算）",
      rationale:
        "低效素材 ROAS " +
        ratio(losers[0]?.roas ?? 0) +
        "，低于账户均值 " +
        ratio(context.totals.roas) +
        "；高效素材 ROAS " +
        ratio(winners[0]?.roas ?? 0) +
        "，CPA " +
        money(winners[0]?.cpa ?? 0) +
        "。",
    },
    {
      from: "账户通用预算",
      to: "A/B 测试预算",
      amount: money(Math.max(2_000, context.totals.spend * 0.08)),
      rationale: "在修复 CVR 之前保留固定测试预算，避免全线收缩导致后续没有新素材可用。",
    },
  ];

  const audiencesToTest = context.audience.length
    ? [...context.audience]
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 2)
        .map((item) => item.segment + "（CTR " + pct(item.ctr) + " / CVR " + pct(item.cvr) + "）")
    : ["建议先导出人群维度数据后再确定测试人群"];

  const experiments = [
    {
      name: "真实使用场景 + 用户评价 vs 现有素材",
      variantA: "现有高效素材（原结构）",
      variantB: "真实使用场景 + 用户评价（新增信任模块）",
      metric: "CVR",
      hypothesis: "补充真实使用与评价证据后，CVR 可回到前 7 天水平（提升 15% 以上）。",
    },
    {
      name: "价格解释型落地页 vs 原落地页",
      variantA: "原落地页首屏",
      variantB: "首屏加入单次使用成本与试用规格说明",
      metric: "CPA",
      hypothesis: "降低首单决策门槛后，年轻人群 CPA 可下降 10% 以上。",
    },
  ];

  const cheap = context.platforms.length ? lowestCpc(context.platforms) : undefined;

  const insights: Signal[] = [
    {
      title: "效率高度集中在少数素材上",
      body:
        "Top 3 素材贡献了 " +
        pct(winners.reduce((acc, item) => acc + item.share, 0), 1) +
        " 的转化。集中度高意味着放量弹性好，但单一素材衰退会带来较大波动，需要保持新素材测试节奏。",
      evidence: winners
        .map((item) => item.name + ": ROAS=" + ratio(item.roas) + ", 转化占比=" + pct(item.share, 1))
        .join("; "),
      confidence: 88,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: cheap ? cheap.name + " 的低 CPC 值得配合更高意向内容" : "渠道数据不足",
      body: cheap
        ? cheap.name +
          " 的 CPC 最低（" +
          ratio(cheap.cpc) +
          "），适合承接高意向内容，把预算效率进一步提高。"
        : "当前数据集没有渠道维度数据。",
      evidence: context.platforms
        .map((item) => item.name + ": CPC=" + ratio(item.cpc) + ", CVR=" + pct(item.cvr))
        .join("; "),
      confidence: 79,
    },
  ];

  const risks: Signal[] = [
    {
      title: "CPA 上升会直接压缩盈利空间",
      body:
        "CPA 从 " +
        money(previous?.cpa ?? 0) +
        " 变为 " +
        money(current?.cpa ?? 0) +
        "；在客单价 " +
        money(context.product.price) +
        " 与当前 ROAS " +
        ratio(context.totals.roas) +
        " 下，修复 CVR 比继续加预算更关键。",
      evidence: "CPA=" + money(context.totals.cpa) + ", ROAS=" + ratio(context.totals.roas),
      confidence: 89,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "先修复承接，再考虑放量",
      body:
        "下一周期动作排序：① 对齐素材承诺与落地页首屏；② 增加真实使用与评价模块；③ 扩大价格解释内容；④ 观察 7 天 CVR 是否回升到 " +
        pct(previous?.cvr ?? 0) +
        " 以上，再决定是否加预算。",
      evidence: "目标 CVR ≥ " + pct(previous?.cvr ?? 0) + "；当前 " + pct(current?.cvr ?? 0),
      confidence: 86,
    },
  ];

  const bundle = context.signals;
  const useFallback = emptySignals(bundle);

  return {
    summary:
      "本次分析覆盖 " +
      context.dataSource.label +
      "（" +
      context.dataSource.rows +
      " 行数据，" +
      context.period.days +
      " 天）。账户整体：花费 " +
      money(context.totals.spend) +
      "，CTR " +
      pct(context.totals.ctr) +
      "，CVR " +
      pct(context.totals.cvr) +
      "，CPA " +
      money(context.totals.cpa) +
      "，ROAS " +
      ratio(context.totals.roas) +
      "。",
    diagnosis: DEMO_TAG + diagnosis,
    mainReason: DEMO_TAG + mainReason,
    hypotheses,
    winners: winners.map((item) => ({
      creative: item.name,
      why:
        "ROAS " +
        ratio(item.roas) +
        "（账户均值 " +
        ratio(context.totals.roas) +
        "），CTR " +
        pct(item.ctr) +
        "，CPA " +
        money(item.cpa) +
        "。",
      action:
        item.roas >= context.totals.roas * 1.15
          ? "增加预算（建议 +20%，分两次加量）并保持 7 天观察"
          : "保留主预算，同时复制其内容结构生产 2 条变体做横向测试",
    })),
    losers: losers.map((item) => ({
      creative: item.name,
      why:
        "ROAS " +
        ratio(item.roas) +
        "，比账户均值低 " +
        Math.max(0, (1 - item.roas / Math.max(context.totals.roas, 0.0001)) * 100).toFixed(0) +
        "%，CPA " +
        money(item.cpa) +
        "。",
      action: "预算下调 50%，同时替换开头 3 秒 Hook，保留最低测试量",
    })),
    budgetMoves,
    audiencesToTest,
    experiments,
    insights: useFallback
      ? [fallbackSignal("数据量不足", "当前数据集缺少足够的对比窗口。", "单窗口数据", 60)]
      : take(bundle.insights, 3, insights),
    opportunities: take(bundle.opportunities, 3, opportunities),
    risks: take(bundle.risks, 3, risks),
    recommendations: take(bundle.recommendations, 3, recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 6 - Growth Advisor                                                    */
/* -------------------------------------------------------------------------- */

export function demoGrowthAdvice(payload: AgentPayload): GrowthAdvice {
  const context = payload.context;
  const question = (payload.question ?? "").trim() || "最近 ROAS 为什么下降？";
  const comparison = context.comparison;
  const sorted = [...context.creatives].sort((a, b) => b.roas - a.roas);
  const winner = sorted[0];
  const loser = sorted[sorted.length - 1];
  const ctrDelta = comparison?.deltas.ctr ?? 0;
  const cvrDelta = comparison?.deltas.cvr ?? 0;
  const roasDelta = comparison?.deltas.roas ?? 0;
  const targetCvr = comparison?.previous.cvr ?? 0.041;
  const asksAboutRoas = /roas|下降|效率|下滑|为什么/i.test(question);

  const diagnosis = comparison
    ? "过去 " +
      comparison.windowDays +
      " 天 ROAS 从 " +
      ratio(comparison.previous.roas) +
      " 变为 " +
      ratio(comparison.current.roas) +
      "（" +
      (roasDelta >= 0 ? "+" : "") +
      roasDelta.toFixed(1) +
      "%）；同期 CTR 变化 " +
      ctrDelta.toFixed(1) +
      "%，CVR 从 " +
      pct(comparison.previous.cvr) +
      " 变为 " +
      pct(comparison.current.cvr) +
      "（" +
      cvrDelta.toFixed(1) +
      "%），CPA 从 " +
      money(comparison.previous.cpa) +
      " 变为 " +
      money(comparison.current.cpa) +
      "。"
    : "当前数据集只包含单一时间窗口，账户 ROAS 为 " +
      ratio(context.totals.roas) +
      "；建议补充至少 14 天数据后再做趋势归因。";

  const mainReason = comparison
    ? Math.abs(cvrDelta) >= Math.abs(ctrDelta)
      ? "主要原因是转化率下滑而不是素材吸引力下降：CTR 仅变化 " +
        ctrDelta.toFixed(1) +
        "%，CVR 变化 " +
        cvrDelta.toFixed(1) +
        "%。素材仍能把人带来，但来了之后没有下单。"
      : "主要原因是点击效率下降：CTR 变化 " +
        ctrDelta.toFixed(1) +
        "%，素材对目标人群的吸引力出现衰减，需要更新 Hook 与场景。"
    : "数据窗口不足，暂时无法区分是素材问题还是承接问题。";

  const hypotheses = [
    {
      hypothesis: "流量结构变化：新增年轻人群占比提高，该人群需要更多购买理由",
      evidence: context.audience.length
        ? "分人群数据：" +
          (context.audience[0]?.segment ?? "-") +
          " CTR " +
          pct(context.audience[0]?.ctr ?? 0) +
          "，CVR 仅 " +
          pct(context.audience[0]?.cvr ?? 0)
        : "缺少分人群数据，建议补充人群维度报表",
      confidence: 76,
    },
    {
      hypothesis: "素材承诺与落地页不一致，用户点击后没有找到承诺的信息",
      evidence: "CTR 变化 " + ctrDelta.toFixed(1) + "%（稳定）但 CVR 变化 " + cvrDelta.toFixed(1) + "%（下滑），典型的承接层问题",
      confidence: 81,
    },
    {
      hypothesis: "价格或权益变化降低了首单吸引力",
      evidence: "数据集不含促销字段，需要与业务日历核对，属于待验证假设",
      confidence: 52,
    },
  ];

  const recommendation = [
    "优先做「承诺一致性」修复：让素材开头出现的场景与利益点，在落地页首屏 3 秒内被再次确认。",
    "补充信任证据：真实使用记录（30 天）、成分与用法说明、常见问题解答，降低首次购买的不确定感。",
    loser
      ? "对「" +
        loser.name +
        "」（ROAS " +
        ratio(loser.roas) +
        "，CPA " +
        money(loser.cpa) +
        "）执行止损：预算下调 50%，释放预算转移到「" +
        (winner?.name ?? "高效素材") +
        "」（ROAS " +
        ratio(winner?.roas ?? 0) +
        "）。"
      : "调整预算结构，把低效素材预算转移到高效素材。",
  ];

  const experiment = asksAboutRoas
    ? {
        name: "真实使用场景 + 用户评价 vs 当前素材",
        variantA: "当前高效素材（原结构）",
        variantB: "真实使用场景 + 用户评价（增加信任模块）",
        metric: "CVR",
        successCriteria: "7 天内 CVR 回到 " + pct(targetCvr) + " 以上，CPA 下降 10% 以上",
      }
    : {
        name: "价格解释型落地页 vs 原落地页",
        variantA: "原落地页",
        variantB: "首屏增加单次使用成本与试用规格",
        metric: "CPA",
        successCriteria: "14 天内 CPA 下降 10% 以上且转化量不下降",
      };

  const insights: Signal[] = [
    {
      title: "效率变化主要来自承接环节",
      body:
        "CTR 变化 " +
        ctrDelta.toFixed(1) +
        "%，CVR 变化 " +
        cvrDelta.toFixed(1) +
        "%。这意味着继续优化素材的边际收益，低于修复落地页与信任内容。",
      evidence: "CTR=" + pct(context.totals.ctr) + ", CVR=" + pct(context.totals.cvr) + ", CPA=" + money(context.totals.cpa),
      confidence: 87,
    },
  ];

  const opportunities: Signal[] = [
    {
      title: "复制高效素材的「结构」而不是「文案」",
      body:
        "「" +
        (winner?.name ?? "高效素材") +
        "」的 ROAS 为 " +
        ratio(winner?.roas ?? 0) +
        "。真正可复制的是它的三段结构（场景 → 具体做法 → 可验证结果），而不是具体句子。",
      evidence:
        "creative=" +
        (winner?.name ?? "-") +
        "; CTR=" +
        pct(winner?.ctr ?? 0) +
        "; CVR=" +
        pct(winner?.cvr ?? 0),
      confidence: 82,
    },
  ];

  const risks: Signal[] = [
    {
      title: "在 CVR 修复前放量会放大亏损",
      body:
        "当前 CPA 为 " +
        money(context.totals.cpa) +
        "。只增加预算而不修复转化，CPA 会随流量规模进一步上升，ROAS 继续下滑。",
      evidence: "CPA=" + money(context.totals.cpa) + "; ROAS=" + ratio(context.totals.roas),
      confidence: 88,
    },
  ];

  const recommendations: Signal[] = [
    {
      title: "把下周期目标从 ROAS 改为「先修 CVR，再看 ROAS」",
      body:
        "给团队一个两周修复窗口：第 1 周只做承接与信任内容的对照实验，第 2 周观察 CVR 是否回到 " +
        pct(targetCvr) +
        "；达标后再讨论放量。",
      evidence: "目标 CVR ≥ " + pct(targetCvr),
      confidence: 84,
    },
  ];

  const bundle = context.signals;
  const useFallback = emptySignals(bundle);

  return {
    question,
    diagnosis: DEMO_TAG + diagnosis,
    mainReason: DEMO_TAG + mainReason,
    hypotheses,
    recommendation,
    experiment,
    dataUsed: [
      "Metric 表（" + context.dataSource.label + "，" + context.dataSource.rows + " 行，" + context.period.start + " ~ " + context.period.end + "）",
      "Metric 聚合：日趋势 / 渠道 / 素材 / 近 7 天 vs 前 7 天窗口对比",
      context.audience.length ? "AudienceMetric 表（分人群 CTR / CVR / ROAS）" : "AudienceMetric 表（无数据）",
      "Persona 表（人群画像与购买阻力）",
      "Creative 表（素材角度与目标基准）",
    ],
    insights: take(bundle.insights, 3, insights),
    opportunities: take(bundle.opportunities, 3, opportunities),
    risks: take(bundle.risks, 3, risks),
    recommendations: take(bundle.recommendations, 3, recommendations),
  };
}

/* -------------------------------------------------------------------------- */
/* Agent 7 - Report Writer                                                     */
/* -------------------------------------------------------------------------- */

export function demoGrowthReport(payload: AgentPayload): GrowthReport {
  const context = payload.context;
  const comparison = context.comparison;
  const sorted = [...context.creatives].sort((a, b) => b.roas - a.roas);
  const winner = sorted[0];
  const loser = sorted[sorted.length - 1];
  const bestPlatform = context.platforms.length
    ? [...context.platforms].sort((a, b) => b.roas - a.roas)[0]
    : undefined;
  const topContent = [...context.contents].sort((a, b) => b.overallScore - a.overallScore)[0];

  const executiveSummary = comparison
    ? "本周账户花费 " +
      money(comparison.current.spend) +
      "，ROAS " +
      ratio(comparison.current.roas) +
      "（环比 " +
      (comparison.deltas.roas >= 0 ? "+" : "") +
      comparison.deltas.roas.toFixed(1) +
      "%）。效率变化主要来自转化环节：CVR " +
      pct(comparison.previous.cvr) +
      " → " +
      pct(comparison.current.cvr) +
      "，而 CTR 变化仅 " +
      comparison.deltas.ctr.toFixed(1) +
      "%。下周重点是修复承接与信任内容，而不是继续加预算。"
    : "账户当前花费 " +
      money(context.totals.spend) +
      "，ROAS " +
      ratio(context.totals.roas) +
      "。建议补充至少两周数据后再做环比结论。";

  const performance =
    "核心指标：花费 " +
    money(context.totals.spend) +
    "，曝光 " +
    context.totals.impressions.toLocaleString("zh-CN") +
    "，点击 " +
    context.totals.clicks.toLocaleString("zh-CN") +
    "，CTR " +
    pct(context.totals.ctr) +
    "，CPC " +
    ratio(context.totals.cpc) +
    "，转化 " +
    context.totals.conversions.toLocaleString("zh-CN") +
    "，CPA " +
    money(context.totals.cpa) +
    "，ROAS " +
    ratio(context.totals.roas) +
    "。" +
    (comparison
      ? "环比上一周期：花费 " +
        comparison.deltas.spend.toFixed(1) +
        "%，CTR " +
        comparison.deltas.ctr.toFixed(1) +
        "%，CVR " +
        comparison.deltas.cvr.toFixed(1) +
        "%，CPA " +
        comparison.deltas.cpa.toFixed(1) +
        "%，ROAS " +
        comparison.deltas.roas.toFixed(1) +
        "%。"
      : "");

  const audience = context.audience.length
    ? "分人群表现：" +
      context.audience
        .map((item) => item.segment + "（CTR " + pct(item.ctr) + " / CVR " + pct(item.cvr) + " / ROAS " + ratio(item.roas) + "）")
        .join("；") +
      "。点击效率最高的是 " +
      context.audience.reduce((best, item) => (item.ctr > best.ctr ? item : best), context.audience[0]).segment +
      "，转化效率最高的是 " +
      context.audience.reduce((best, item) => (item.cvr > best.cvr ? item : best), context.audience[0]).segment +
      "；两者差异说明人群策略需要按购买理由分层。"
    : "分人群数据缺失：当前数据集没有人群维度，建议补充人群报表后再做人群结论。";

  const content =
    "内容库共 " +
    context.contents.length +
    " 条记录，最高分内容为「" +
    (topContent?.title ?? "-") +
    "」（Overall " +
    (topContent?.overallScore ?? 0) +
    "）。" +
    (topContent ? "值得测试的原因：" + topContent.whyTest + " 优化方向：" + topContent.howToImprove : "建议先补充内容测试记录。");

  const campaign =
    "素材层面：ROAS 最高的是「" +
    (winner?.name ?? "-") +
    "」（" +
    ratio(winner?.roas ?? 0) +
    "，CPA " +
    money(winner?.cpa ?? 0) +
    "），最低的是「" +
    (loser?.name ?? "-") +
    "」（" +
    ratio(loser?.roas ?? 0) +
    "，CPA " +
    money(loser?.cpa ?? 0) +
    "）。渠道层面效率最高的是 " +
    (bestPlatform?.name ?? "-") +
    "（ROAS " +
    ratio(bestPlatform?.roas ?? 0) +
    "，CPC " +
    ratio(bestPlatform?.cpc ?? 0) +
    "）。预算建议向「高 ROAS 素材 × 低 CPC 渠道」的组合倾斜。";

  const keyInsights: Signal[] =
    context.signals.insights.length > 0
      ? context.signals.insights.slice(0, 3)
      : [
          fallbackSignal(
            "效率集中在少数素材",
            "Top 3 素材贡献了 " + pct(sorted.slice(0, 3).reduce((acc, item) => acc + item.share, 0), 1) + " 的转化。",
            "creative ranking",
            84,
          ),
        ];

  return {
    title: "MORI 森屿增长周报（" + context.period.start + " ~ " + context.period.end + " · Demo）",
    executiveSummary: DEMO_TAG + executiveSummary,
    performance: DEMO_TAG + performance,
    audience: DEMO_TAG + audience,
    content: DEMO_TAG + content,
    campaign: DEMO_TAG + campaign,
    keyInsights,
    recommendations: [
      "修复承接：让素材承诺在落地页首屏 3 秒内被确认，并把真实使用记录放到首屏可见区域。",
      "预算调整：把「" + (loser?.name ?? "低效素材") + "」预算下调 50%，转移到「" + (winner?.name ?? "高效素材") + "」。",
      "人群分层：为高点击人群补充价格解释与信任内容，为高转化人群强化场景与钩子。",
      "保留测试预算：至少 " + money(Math.max(2_000, context.totals.spend * 0.08)) + " 用于新素材与落地页实验。",
    ],
    experiments: [
      {
        name: "真实使用场景 + 用户评价 vs 现有素材",
        variantA: "现有高效素材（原结构）",
        variantB: "真实使用场景 + 用户评价",
        metric: "CVR",
        successCriteria: "7 天内 CVR 提升 15% 以上，CPA 下降 10% 以上",
      },
      {
        name: "价格解释型落地页 vs 原落地页",
        variantA: "原落地页",
        variantB: "首屏加入单次使用成本与试用规格",
        metric: "CPA",
        successCriteria: "14 天内 CPA 下降 10% 以上且转化量不下降",
      },
      {
        name: "15 秒短视频 vs 60 秒长内容",
        variantA: "15 秒转化型短片",
        variantB: "60 秒长内容记录",
        metric: "CTR / ROAS",
        successCriteria: "两类内容分别设定 KPI，分别判断是否达标",
      },
    ],
    outlook:
      "下周把目标从「提高 ROAS」替换为「先修 CVR，再谈放量」：第 1 周只做承接与信任内容的对照实验，第 2 周依据数据决定是否放量。" +
      (context.dataSource.kind === "demo"
        ? "本报告基于模拟业务数据验证产品工作流，不代表真实市场表现。"
        : "本报告基于上传的投放数据生成。"),
  };
}
```

## `src/lib/ai/json-schema.ts`

```ts
import type { z } from "zod";

/**
 * Minimal zod → JSON Schema converter.
 *
 * We only need the subset of JSON Schema that OpenAI's Structured Outputs
 * (`response_format: { type: "json_schema", strict: true }`) accepts:
 * objects with `additionalProperties: false`, every property listed in
 * `required`, arrays, enums and primitives. Keeping the converter local means
 * the runtime prompt schema and the validation schema can never drift apart.
 */

export type JsonSchema = Record<string, unknown>;

export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  const definition = (schema as unknown as { _def?: { typeName?: string } })._def;
  const typeName = definition?.typeName ?? "ZodUnknown";
  const def = definition as unknown as Record<string, unknown>;
  const description = typeof def.description === "string" ? def.description : undefined;

  /** ZodObject/ZodArray 等分支共用：把 .describe() 的内容带进 JSON Schema。 */
  const withDescription = (result: JsonSchema): JsonSchema =>
    description ? { ...result, description } : result;

  switch (typeName) {
    case "ZodObject": {
      const shapeFactory = def.shape as () => Record<string, z.ZodTypeAny>;
      const shape = shapeFactory();
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      Object.entries(shape).forEach(([key, value]) => {
        properties[key] = zodToJsonSchema(value);
        required.push(key);
      });
      return withDescription({
        type: "object",
        properties,
        required,
        additionalProperties: false,
      });
    }
    case "ZodArray": {
      const inner = def.type as z.ZodTypeAny;
      return withDescription({ type: "array", items: zodToJsonSchema(inner) });
    }
    case "ZodString":
      return withDescription({ type: "string" });
    case "ZodNumber": {
      const checks = (def.checks as Array<{ kind: string; value?: number }> | undefined) ?? [];
      const result: JsonSchema = { type: "number" };
      checks.forEach((check) => {
        if (check.kind === "min" && typeof check.value === "number") result.minimum = check.value;
        if (check.kind === "max" && typeof check.value === "number") result.maximum = check.value;
        if (check.kind === "int") result.type = "integer";
      });
      return withDescription(result);
    }
    case "ZodBoolean":
      return withDescription({ type: "boolean" });
    case "ZodEnum":
      return withDescription({ type: "string", enum: def.values as string[] });
    case "ZodNativeEnum":
      return { type: "string", enum: Object.values(def.values as Record<string, string>) };
    case "ZodLiteral":
      return { enum: [def.value as string | number | boolean] };
    case "ZodUnion": {
      const options = (def.options as z.ZodTypeAny[]) ?? [];
      const literals = options
        .map((option) => {
          const optionDef = (option as unknown as { _def?: { typeName?: string; value?: unknown } })._def;
          return optionDef?.typeName === "ZodLiteral" ? optionDef.value : undefined;
        })
        .filter((value): value is string | number => value !== undefined);
      if (literals.length === options.length && literals.length > 0) {
        return { type: "string", enum: literals.map(String) };
      }
      return { anyOf: options.map((option) => zodToJsonSchema(option)) };
    }
    case "ZodOptional":
    case "ZodNullable":
    case "ZodDefault":
    case "ZodCatch":
    case "ZodReadonly": {
      const inner = (def.innerType ?? def.type) as z.ZodTypeAny;
      return inner ? zodToJsonSchema(inner) : { type: "string" };
    }
    case "ZodEffects": {
      const inner = def.schema as z.ZodTypeAny;
      return inner ? zodToJsonSchema(inner) : { type: "string" };
    }
    default:
      return { type: "string" };
  }
}

/**
 * JSON Schema keywords that OpenAI's Structured Outputs (strict mode) rejects.
 * The zod schema still enforces all of these constraints on the response — we
 * only strip them from the schema we send on the wire, because sending e.g.
 * `minimum`/`maximum` makes the provider answer 400
 * ("Invalid schema for response_format") and every agent would silently fall
 * back to the demo engine.
 */
const STRICT_UNSUPPORTED_KEYWORDS = new Set([
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "minLength",
  "maxLength",
  "pattern",
  "format",
  "minItems",
  "maxItems",
  "uniqueItems",
  "contains",
  "minContains",
  "maxContains",
  "minProperties",
  "maxProperties",
  "propertyNames",
  "patternProperties",
  "dependencies",
  "dependentRequired",
  "dependentSchemas",
  "if",
  "then",
  "else",
  "not",
  "default",
  "examples",
  "$comment",
]);

/** Deep-clones the schema without the keywords strict mode cannot accept. */
export function stripUnsupportedForStrict(schema: JsonSchema): JsonSchema {
  if (Array.isArray(schema)) {
    return schema.map((item) => stripUnsupportedForStrict(item as JsonSchema)) as unknown as JsonSchema;
  }
  const result: JsonSchema = {};
  Object.entries(schema).forEach(([key, value]) => {
    if (STRICT_UNSUPPORTED_KEYWORDS.has(key)) return;
    if (value && typeof value === "object") {
      result[key] = stripUnsupportedForStrict(value as JsonSchema);
      return;
    }
    result[key] = value;
  });
  return result;
}

export function zodToStructuredOutputFormat(schema: z.ZodTypeAny, name: string) {
  return {
    type: "json_schema" as const,
    json_schema: {
      name,
      strict: true,
      schema: stripUnsupportedForStrict(zodToJsonSchema(schema)),
    },
  };
}

/**
 * Human readable schema text used when a provider does not support
 * `response_format: json_schema` and we degrade to `json_object` / plain JSON.
 *
 * The schema *name* is included on purpose: in json_object mode the provider no
 * longer sees `response_format.json_schema.name`, so the prompt is the only
 * place where the expected output contract can be stated.
 */
export function jsonSchemaPromptHint(schema: z.ZodTypeAny, schemaName?: string): string {
  return [
    "",
    // Some providers (e.g. DeepSeek JSON Output) require the literal word "json"
    // to appear in the prompt, otherwise they may return empty content.
    `输出契约名称：${schemaName ?? "mori_structured_output"}`,
    "输出格式要求：必须返回合法的 json（JSON）对象，严格遵守下面的 JSON Schema，",
    "只输出 json 本身，不要输出 Markdown 代码块、解释文字或任何前后缀：",
    "",
    "必填字段清单（**每一个字段都必须出现**；不允许省略任何 key；不允许用 null 代替；",
    "数组无内容时返回 []；数字字段必须是数字而不是字符串）：",
    ...requiredFieldChecklist(schema).map((line) => `- ${line}`),
    "",
    "完整 JSON Schema：",
    JSON.stringify(stripUnsupportedForStrict(zodToJsonSchema(schema)), null, 2),
  ].join("\n");
}

/**
 * Builds an explicit "every field must be present" checklist from the zod schema.
 *
 * Why this exists: in `json_object` / plain mode (DeepSeek does not support
 * strict `json_schema`) the model only sees a JSON Schema. Models frequently
 * drop the *last* nested string fields of a contract (e.g.
 * `scores.howToImprove`), which then fails zod validation and triggers the
 * demo fallback. An explicit flat checklist is what reliably prevents that —
 * deleting `required` or skipping validation is not an option.
 */
export function requiredFieldChecklist(schema: z.ZodTypeAny, maxLines = 160): string[] {
  const json = stripUnsupportedForStrict(zodToJsonSchema(schema));
  const lines: string[] = [];

  const describe = (node: JsonSchema | undefined) => {
    if (!node) return "";
    const parts: string[] = [];
    if (typeof node.description === "string" && node.description.length > 0) parts.push(node.description);
    if (Array.isArray(node.enum)) parts.push(`可选值：${(node.enum as string[]).join(" | ")}`);
    return parts.length > 0 ? ` — ${parts.join("；")}` : "";
  };

  const walkObject = (node: JsonSchema, path: string) => {
    const properties = node.properties as Record<string, JsonSchema> | undefined;
    if (!properties) return;
    Object.entries(properties).forEach(([key, child]) => {
      if (lines.length >= maxLines) return;
      const childPath = path ? `${path}.${key}` : key;
      if (child.type === "object") {
        lines.push(`${childPath}: object（必填对象，其下每个子字段都必须出现）${describe(child)}`);
        walkObject(child, childPath);
        return;
      }
      if (child.type === "array") {
        const items = (child.items ?? {}) as JsonSchema;
        if (items.type === "object" && items.properties) {
          const itemKeys = Object.keys(items.properties as Record<string, JsonSchema>);
          lines.push(
            `${childPath}: array（必填，可为 []；每个元素必须包含 ${itemKeys.join(", ")}）${describe(child)}`,
          );
          walkObject(items, `${childPath}[]`);
          return;
        }
        lines.push(`${childPath}: array<${String(items.type ?? "any")}>（必填，可为 []）${describe(child)}`);
        return;
      }
      lines.push(`${childPath}: ${String(child.type ?? "any")}（必填）${describe(child)}`);
    });
  };

  walkObject(json, "");
  return lines;
}
```

## `src/lib/ai/runner.ts`

```ts
import { AiProviderError, callStructured, getAiConfig, type StructuredCallInput } from "@/lib/ai/client";
import { contextToPromptPayload, type AgentPayload } from "@/lib/ai/context";
import {
  demoAudienceAnalysis,
  demoCampaignAnalysis,
  demoContentStrategy,
  demoCreativeDirections,
  demoGrowthAdvice,
  demoGrowthReport,
  demoMarketAnalysis,
} from "@/lib/ai/demo-engine";
import { AGENT_SCHEMAS, type AgentOutputMap } from "@/lib/ai/schemas";
import { getPromptTemplate } from "@/lib/prompts";
import type { AgentId, AgentRunResult } from "@/types";

/**
 * Single entry point for every AI capability.
 *
 * demo      → DEMO_MODE=true or no API key: local structured engine
 * ai        → provider answered with schema-valid JSON
 * fallback  → provider failed / returned invalid data, local engine used and a
 *             warning is surfaced in the UI
 */

export function demoFor<K extends AgentId>(agent: K, payload: AgentPayload): AgentOutputMap[K] {
  switch (agent) {
    case "market_analyst":
      return demoMarketAnalysis(payload) as AgentOutputMap[K];
    case "audience_analyst":
      return demoAudienceAnalysis(payload) as AgentOutputMap[K];
    case "content_strategist":
      return demoContentStrategy(payload) as AgentOutputMap[K];
    case "creative_strategist":
      return demoCreativeDirections(payload) as AgentOutputMap[K];
    case "performance_analyst":
      return demoCampaignAnalysis(payload) as AgentOutputMap[K];
    case "growth_advisor":
      return demoGrowthAdvice(payload) as AgentOutputMap[K];
    case "report_writer":
      return demoGrowthReport(payload) as AgentOutputMap[K];
    default:
      throw new Error(`Unknown agent: ${String(agent)}`);
  }
}

export type RunAgentOptions = {
  temperature?: number;
  /** dependency injection point used by the automated tests */
  callProvider?: typeof callStructured;
};

export async function runAgent<K extends AgentId>(
  agent: K,
  payload: AgentPayload,
  options: RunAgentOptions = {},
): Promise<AgentRunResult<AgentOutputMap[K]>> {
  const template = getPromptTemplate(agent);
  const config = getAiConfig();
  const startedAt = Date.now();

  if (!config.enabled) {
    return {
      data: demoFor(agent, payload),
      meta: {
        mode: "demo",
        agent,
        model: "MORI local structured engine",
        promptVersion: template.version,
        latencyMs: Date.now() - startedAt,
        generatedAt: new Date().toISOString(),
        warning: config.reason,
      },
    };
  }

  const callProvider = options.callProvider ?? callStructured;

  try {
    const request = {
      schema: AGENT_SCHEMAS[agent],
      schemaName: template.schemaName,
      systemPrompt: template.body,
      userPrompt: JSON.stringify(contextToPromptPayload(payload)),
      temperature: options.temperature ?? 0.4,
    } as StructuredCallInput<typeof AGENT_SCHEMAS[K]>;

    const result = await callProvider(request);
    return {
      data: result.output as AgentOutputMap[K],
      meta: {
        mode: "ai",
        agent,
        model: result.model,
        promptVersion: template.version,
        latencyMs: result.latencyMs,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    const warning =
      error instanceof AiProviderError
        ? `${error.code}: ${error.message}`
        : error instanceof Error
          ? error.message
          : "未知错误";

    return {
      data: demoFor(agent, payload),
      meta: {
        mode: "fallback",
        agent,
        model: "MORI local structured engine",
        promptVersion: template.version,
        latencyMs: Date.now() - startedAt,
        generatedAt: new Date().toISOString(),
        warning: `AI 调用失败，已自动切换到 Demo 分析引擎。原因：${warning}`,
      },
    };
  }
}

export function agentStatusSummary() {
  const config = getAiConfig();
  return {
    mode: config.enabled ? ("ai" as const) : ("demo" as const),
    providerId: config.providerId,
    model: config.enabled ? config.model : "MORI local structured engine",
    provider: config.provider,
    baseUrl: config.baseUrl,
    apiKeyConfigured: config.apiKeyConfigured,
    keySource: config.keySource,
    supportsJsonSchema: config.supportsJsonSchema,
    requestShapes: config.supportsJsonSchema
      ? (["json_schema", "json_object", "plain"] as const)
      : (["json_object", "plain"] as const),
    demoMode: config.demoMode,
    reason: config.reason,
    agents: Object.keys(AGENT_SCHEMAS) as AgentId[],
  };
}
```

## `src/lib/ai/schemas.ts`

```ts
import { z } from "zod";

import type { AgentId } from "@/types";

/**
 * Structured output contracts for every agent.
 *
 * The same zod objects are used for (1) generating the JSON Schema sent to the
 * provider, and (2) validating whatever comes back. Invalid or malformed model
 * output can therefore never reach the UI.
 */

export const signalSchema = z.object({
  title: z.string().describe("必填。结论标题，一句话，不要省略"),
  body: z.string().describe(
    "必填。结论文本，2-3 句，含具体数字。涉及实验或提升幅度时，必须写成「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」，禁止写成已完成实验/已验证/实际提升 X%",
  ),
  evidence: z.string().describe(
    "必填。支撑结论的具体指标或字段（例如 CTR=1.77%, ROAS=3.12），不要留空；若引用实验，请标注为 Demo 数据集",
  ),
  confidence: z.number().min(0).max(100).describe("必填。置信度，0-100 的整数"),
});

const signalBundleShape = {
  insights: z.array(signalSchema),
  opportunities: z.array(signalSchema),
  risks: z.array(signalSchema),
  recommendations: z.array(signalSchema),
};

export const MarketAnalysisSchema = z.object({
  summary: z.string(),
  competitiveGaps: z.array(
    z.object({
      name: z.string().describe("必填。市场空白名称"),
      gap: z.string().describe("必填。空白点说明，2-3 句"),
      evidence: z.string().describe("必填。依据，引用具体竞品字段"),
    }),
  ),
  positioningAdvice: z.string().describe("必填。一句话定位建议：占哪个位置、不去哪个区间竞争"),
  ...signalBundleShape,
});

export const AudienceAnalysisSchema = z.object({
  summary: z.string(),
  personas: z.array(
    z.object({
      name: z.string(),
      segment: z.string(),
      painPoints: z.array(z.string()),
      motivations: z.array(z.string()),
      barriers: z.array(z.string()),
      contentPreferences: z.array(z.string()),
    }),
  ),
  /**
   * Four opportunity cards shown on the Audience page:
   * 用户机会 / 内容机会 / 产品机会 / 广告机会
   */
  opportunityCards: z.object({
    user: z.array(z.string()).describe("必填。用户机会，至少 1 条；无内容时返回 []"),
    content: z.array(z.string()).describe("必填。内容机会，至少 1 条；无内容时返回 []"),
    product: z.array(z.string()).describe("必填。产品机会，至少 1 条；无内容时返回 []"),
    ad: z.array(z.string()).describe("必填。广告机会，至少 1 条；无内容时返回 []"),
  }).describe("四张机会卡片：user/content/product/ad 四个数组都必须出现"),
  adAngles: z.array(
    z.object({
      angle: z.string().describe("必填。广告角度名"),
      hook: z.string().describe("必填。可直接使用的开场 Hook"),
      audience: z.string().describe("必填。目标人群"),
      rationale: z.string().describe("必填。为什么这个角度对该人群有效"),
    }),
  ),
  ...signalBundleShape,
});

export const ContentStrategySchema = z.object({
  summary: z.string(),
  xiaohongshu: z.object({
    titles: z.array(
      z.object({
        title: z.string().describe("必填。标题本身"),
        angle: z.string().describe("必填。标题角度，如「质疑式提问」"),
        whyItWorks: z.string().describe("必填。为什么有效，1 句"),
      }),
    ).describe("必填。5 个标题，每个都必须有 title/angle/whyItWorks"),
    body: z.string().describe("必填。正文 150-260 字，段落用 \\n\\n 分隔"),
  }).describe("小红书内容：titles 与 body 均为必填"),
  douyin: z.object({
    hook: z.string().describe("必填。0-3 秒开场台词"),
    caption: z.string().describe("必填。视频文案，不要省略"),
    script: z.array(
      z.object({
        timeRange: z.string().describe("必填。时间区间，如 0–3s"),
        section: z.string().describe("必填。段落名：Hook / 痛点 / 解决方案 / CTA"),
        content: z.string().describe("必填。该段台词或画面描述"),
      }),
    ).describe("必填。4 个时间轴段落，缺一段都会校验失败"),
  }).describe("抖音 15 秒脚本：hook/caption/script 均必填"),
  scores: z.object({
    hookScore: z.number().min(0).max(100).describe("必填。Hook 抓取能力，0-100 数字"),
    relevanceScore: z.number().min(0).max(100).describe("必填。相关性，0-100 数字"),
    conversionScore: z.number().min(0).max(100).describe("必填。转化潜力，0-100 数字"),
    brandFitScore: z.number().min(0).max(100).describe("必填。品牌契合度，0-100 数字"),
    overallScore: z.number().min(0).max(100).describe("必填。综合分，0-100 数字"),
    whyTest: z.string().describe("必填。为什么值得测试，1-2 句，引用指标或人群依据；不得为空字符串"),
    howToImprove: z.string().describe(
      "必填。怎么进一步优化，1-2 句，必须具体到改哪一句/加什么模块（例如：把第 3-8 秒痛点加入具体时间与动作）。不得为空字符串，不得省略该字段",
    ),
  }).describe(
    "内容评分模块：7 个字段全部必填 —— hookScore/relevanceScore/conversionScore/brandFitScore/overallScore/whyTest/howToImprove 一个都不能少",
  ),
  keywords: z.array(z.string()).describe("必填。关键词数组，至少 3 个；无内容时返回 []"),
  ...signalBundleShape,
});

export const CreativeDirectionsSchema = z.object({
  summary: z.string(),
  directions: z.array(
    z.object({
      code: z.string().describe("必填。方向编号 A-E"),
      angle: z.string().describe("必填。角度名"),
      hook: z.string().describe("必填。开场 3 秒台词"),
      script: z.array(
        z.object({
          timeRange: z.string().describe("必填。时间区间"),
          section: z.string().describe("必填。段落名"),
          content: z.string().describe("必填。该段内容"),
        }),
      ).describe("必填。时间轴脚本，4 段"),
      cta: z.string().describe("必填。行动号召"),
      audience: z.string().describe("必填。目标人群"),
      priorityScore: z.number().min(0).max(100).describe("必填。测试优先级 0-100 数字，越高越先测"),
      rationale: z.string().describe("必填。为什么给它这个优先级"),
    }),
  ).describe("必填。5 个素材方向（A-E），每个方向的全部字段都必须出现"),
  testingOrder: z.array(z.string()).describe("必填。建议测试顺序，至少 3 条；无内容时返回 []"),
  ...signalBundleShape,
});

export const CampaignAnalysisSchema = z.object({
  summary: z.string().describe("必填。概述，须标明数据口径（Demo / 模拟业务数据）"),
  diagnosis: z.string().describe(
    "必填。一句话结论 + 具体数值，必须写成 Demo 口径（例如「Demo 数据显示近 7 天 ROAS 从 3.23 降到 2.73」），不得声称真实业绩",
  ),
  mainReason: z.string().describe("必填。主导原因与排除依据，仍须为 Demo / 模拟数据口径"),
  hypotheses: z.array(
    z.object({
      hypothesis: z.string(),
      evidence: z.string(),
      confidence: z.number().min(0).max(100),
    }),
  ),
  winners: z.array(
    z.object({
      creative: z.string(),
      why: z.string(),
      action: z.string(),
    }),
  ),
  losers: z.array(
    z.object({
      creative: z.string(),
      why: z.string(),
      action: z.string(),
    }),
  ),
  budgetMoves: z.array(
    z.object({
      from: z.string().describe("必填。从哪里调整预算"),
      to: z.string().describe("必填。预算转给谁"),
      amount: z.string().describe("必填。调整金额或比例描述，如「¥9,492 的 50%」"),
      rationale: z.string().describe("必填。调整依据，引用 ROAS/CPA 数字"),
    }),
  ).describe("必填。预算调整建议，至少 1 条"),
  audiencesToTest: z.array(z.string()).describe("必填。建议继续测试的人群，至少 1 条；无内容时返回 []"),
  experiments: z.array(
    z.object({
      name: z.string().describe("必填。实验名称"),
      variantA: z.string().describe("必填。A 变体说明"),
      variantB: z.string().describe("必填。B 变体说明"),
      metric: z.string().describe("必填。主指标，如 CVR / CPA / CTR"),
      hypothesis: z.string().describe(
        "必填。实验假设，写成「若在真实投放中测试…」而非已完成实验的结论；禁止「已验证/已完成」",
      ),
    }),
  ).describe("必填。下一轮实验建议，至少 2 条"),
  ...signalBundleShape,
});

export const GrowthAdviceSchema = z.object({
  question: z.string(),
  diagnosis: z.string().describe(
    "必填。必须写 Demo / 模拟数据口径（例如「Demo 数据显示…」），引用实验时写「模拟实验结果」",
  ),
  mainReason: z.string().describe("必填。主导原因与排除依据，保持 Demo 口径，不得声称真实投放结果"),
  hypotheses: z.array(
    z.object({
      hypothesis: z.string(),
      evidence: z.string(),
      confidence: z.number().min(0).max(100),
    }),
  ),
  recommendation: z.array(z.string()).describe(
    "必填。可执行动作；涉及实验或效果时写「基于模拟数据推演」「若在真实投放中…」，禁止已完成实验/实际提升 X%",
  ),
  experiment: z.object({
    name: z.string().describe("必填。实验名称"),
    variantA: z.string().describe("必填。A 变体"),
    variantB: z.string().describe("必填。B 变体"),
    metric: z.string().describe("必填。主指标"),
    successCriteria: z.string().describe(
      "必填。成功标准，含目标数值与时间窗（如「7 天内 CVR ≥ 3.96%」）；这是待验证的模拟实验假设，不得写成已完成的验证",
    ),
  }).describe("必填。至少 1 个可执行（待验证的）实验方案，不得表述为已完成的真实实验"),
  dataUsed: z.array(z.string()).describe("必填。本次回答使用的数据来源清单，至少 1 条；无内容时返回 []"),
  ...signalBundleShape,
});

export const GrowthReportSchema = z.object({
  title: z.string(),
  executiveSummary: z.string().describe("必填。首句必须标明数据口径：Demo / 模拟业务数据"),
  performance: z.string().describe("必填。只描述 Demo 数据集中计算出的指标，不得写成真实业务成绩"),
  audience: z.string().describe("必填。分人群结论须标注来自 Demo 数据集（模拟数据）"),
  content: z.string().describe("必填。内容结论须标明数据口径；引用实验时写「模拟实验结果」"),
  campaign: z.string().describe("必填。素材/渠道结论须标明 Demo 口径，禁止写“已验证/实际提升 X%”"),
  keyInsights: z.array(signalSchema).describe("必填。三条最重要洞察"),
  recommendations: z.array(z.string()).describe("必填。下一周建议，至少 3 条"),
  experiments: z.array(
    z.object({
      name: z.string().describe("必填。实验名称"),
      variantA: z.string().describe("必填。A 变体"),
      variantB: z.string().describe("必填。B 变体"),
      metric: z.string().describe("必填。主指标"),
      successCriteria: z.string().describe("必填。成功标准（含数值与时间窗）"),
    }),
  ).describe("必填。下周建议实验，至少 3 条"),
  outlook: z.string().describe("必填。下周展望与复盘节奏"),
});

export type MarketAnalysis = z.infer<typeof MarketAnalysisSchema>;
export type AudienceAnalysis = z.infer<typeof AudienceAnalysisSchema>;
export type ContentStrategy = z.infer<typeof ContentStrategySchema>;
export type CreativeDirections = z.infer<typeof CreativeDirectionsSchema>;
export type CampaignAnalysis = z.infer<typeof CampaignAnalysisSchema>;
export type GrowthAdvice = z.infer<typeof GrowthAdviceSchema>;
export type GrowthReport = z.infer<typeof GrowthReportSchema>;

export type AgentOutputMap = {
  market_analyst: MarketAnalysis;
  audience_analyst: AudienceAnalysis;
  content_strategist: ContentStrategy;
  creative_strategist: CreativeDirections;
  performance_analyst: CampaignAnalysis;
  growth_advisor: GrowthAdvice;
  report_writer: GrowthReport;
};

export const AGENT_SCHEMAS: Record<AgentId, z.ZodTypeAny> = {
  market_analyst: MarketAnalysisSchema,
  audience_analyst: AudienceAnalysisSchema,
  content_strategist: ContentStrategySchema,
  creative_strategist: CreativeDirectionsSchema,
  performance_analyst: CampaignAnalysisSchema,
  growth_advisor: GrowthAdviceSchema,
  report_writer: GrowthReportSchema,
};
```

## `src/lib/analytics.ts`

```ts
import { calcCpa, calcCpc, calcCtr, calcCvr, calcRoas, computeMetrics } from "@/lib/metrics";
import { dayKey, round, safeJsonArray } from "@/lib/utils";
import type {
  CreativeScorecard,
  DailyPoint,
  DerivedMetrics,
  GroupedPerformance,
  MetricRow,
  Signal,
  SignalBundle,
} from "@/types";

export function dailySeries(rows: MetricRow[]): DailyPoint[] {
  const buckets = new Map<string, MetricRow[]>();
  rows.forEach((row) => {
    const key = dayKey(row.date);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  });

  return Array.from(buckets.entries())
    .map(([date, bucketRows]) => ({ date, ...computeMetrics(bucketRows) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function groupPerformance(
  rows: MetricRow[],
  key: "platform" | "campaign" | "creative",
): GroupedPerformance[] {
  const buckets = new Map<string, MetricRow[]>();
  rows.forEach((row) => {
    const name = row[key];
    const bucket = buckets.get(name);
    if (bucket) bucket.push(row);
    else buckets.set(name, [row]);
  });

  const totalSpend = rows.reduce((acc, row) => acc + row.spend, 0);
  const totalConversions = rows.reduce((acc, row) => acc + row.conversions, 0);

  return Array.from(buckets.entries())
    .map(([name, bucketRows]) => {
      const metrics = computeMetrics(bucketRows);
      const sample = bucketRows[0];
      return {
        name,
        ...metrics,
        share: totalConversions > 0 ? metrics.conversions / totalConversions : 0,
        spendShare: totalSpend > 0 ? metrics.spend / totalSpend : 0,
        platform: sample?.platform,
        campaign: sample?.campaign,
        creative: sample?.creative,
      };
    })
    .sort((a, b) => b.spend - a.spend);
}

export function creativeScorecard(rows: MetricRow[]): CreativeScorecard[] {
  const creatives = groupPerformance(rows, "creative");
  const benchmarks = computeMetrics(rows);

  const scorecards: CreativeScorecard[] = creatives.map((item) => ({
    ...item,
    ctrIndex: benchmarks.ctr > 0 ? item.ctr / benchmarks.ctr : 0,
    roasIndex: benchmarks.roas > 0 ? item.roas / benchmarks.roas : 0,
  }));

  return scorecards.sort((a, b) => b.roas - a.roas);
}

export type WindowComparison = {
  windowDays: number;
  current: DerivedMetrics;
  previous: DerivedMetrics;
  currentRange: { start: string; end: string };
  previousRange: { start: string; end: string };
  deltas: Record<keyof DerivedMetrics, number>;
};

export function compareWindows(rows: MetricRow[], windowDays = 7): WindowComparison | null {
  const series = dailySeries(rows);
  if (series.length === 0) return null;

  const days = series.map((point) => point.date);
  const currentDates = new Set(days.slice(-windowDays));
  const previousDates = new Set(days.slice(-windowDays * 2, -windowDays));

  const currentRows = rows.filter((row) => currentDates.has(dayKey(row.date)));
  const previousRows = rows.filter((row) => previousDates.has(dayKey(row.date)));

  const current = computeMetrics(currentRows);
  const previous = computeMetrics(previousRows);
  const deltaOf = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100);

  const currentSorted = Array.from(currentDates).sort();
  const previousSorted = Array.from(previousDates).sort();

  return {
    windowDays,
    current,
    previous,
    currentRange: {
      start: currentSorted[0] ?? "",
      end: currentSorted[currentSorted.length - 1] ?? "",
    },
    previousRange: {
      start: previousSorted[0] ?? "",
      end: previousSorted[previousSorted.length - 1] ?? "",
    },
    deltas: {
      spend: deltaOf(current.spend, previous.spend),
      impressions: deltaOf(current.impressions, previous.impressions),
      clicks: deltaOf(current.clicks, previous.clicks),
      conversions: deltaOf(current.conversions, previous.conversions),
      revenue: deltaOf(current.revenue, previous.revenue),
      ctr: deltaOf(current.ctr, previous.ctr),
      cpc: deltaOf(current.cpc, previous.cpc),
      cvr: deltaOf(current.cvr, previous.cvr),
      cpa: deltaOf(current.cpa, previous.cpa),
      roas: deltaOf(current.roas, previous.roas),
    },
  };
}

export type AudienceSegmentSummary = GroupedPerformance & {
  segment: string;
  age: string;
  gender: string;
  cvrIndex: number;
  ctrIndex: number;
};

export type AudienceSegmentRow = MetricRow & {
  segment: string;
  age: string;
  gender: string;
  personaCode?: string;
};

export function audienceBreakdown(rows: AudienceSegmentRow[]): AudienceSegmentSummary[] {
  const buckets = new Map<string, AudienceSegmentRow[]>();
  rows.forEach((row) => {
    const bucket = buckets.get(row.segment);
    if (bucket) bucket.push(row);
    else buckets.set(row.segment, [row]);
  });

  const account = computeMetrics(rows);
  const totalConversions = rows.reduce((acc, row) => acc + row.conversions, 0);
  const totalSpend = rows.reduce((acc, row) => acc + row.spend, 0);

  return Array.from(buckets.entries())
    .map(([segment, segmentRows]) => {
      const metrics = computeMetrics(segmentRows);
      const sample = segmentRows[0];
      const enriched: AudienceSegmentSummary = {
        name: segment,
        segment,
        age: sample.age,
        gender: sample.gender,
        ...metrics,
        share: totalConversions > 0 ? metrics.conversions / totalConversions : 0,
        spendShare: totalSpend > 0 ? metrics.spend / totalSpend : 0,
        ctrIndex: account.ctr > 0 ? metrics.ctr / account.ctr : 0,
        cvrIndex: account.cvr > 0 ? metrics.cvr / account.cvr : 0,
      };
      return enriched;
    })
    .sort((a, b) => b.impressions - a.impressions);
}

/**
 * Rule-based growth signals computed from the actual metric rows.
 * The AI agents receive these signals as evidence, so the narrative can never
 * drift away from the underlying (simulated) data.
 */
export function deriveSignals(rows: MetricRow[], audienceRows: MetricRow[] = []): SignalBundle {
  const account = computeMetrics(rows);
  const creatives = groupPerformance(rows, "creative");
  const platforms = groupPerformance(rows, "platform");
  const comparison = compareWindows(rows, 7);

  const insights: Signal[] = [];
  const opportunities: Signal[] = [];
  const risks: Signal[] = [];
  const recommendations: Signal[] = [];

  if (account.impressions === 0) {
    return {
      insights: [
        {
          title: "暂无可用投放数据",
          body: "当前数据集为空，请先运行 seed 或上传 CSV。",
          evidence: "Metric 表 0 行",
          confidence: 100,
        },
      ],
      opportunities: [],
      risks: [],
      recommendations: [],
    };
  }

  // 1. Best / worst creative by ROAS with real index maths.
  const ranked = [...creatives].filter((item) => item.spend > 0).sort((a, b) => b.roas - a.roas);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  if (best) {
    const ctrIndex = account.ctr > 0 ? (best.ctr / account.ctr - 1) * 100 : 0;
    const roasIndex = account.roas > 0 ? (best.roas / account.roas - 1) * 100 : 0;
    insights.push({
      title: `“${best.name}”是当前效率最高的素材`,
      body: `“${best.name}”贡献 ¥${Math.round(best.spend).toLocaleString("zh-CN")} 花费、ROAS ${best.roas.toFixed(2)}，高于账户均值 ${roasIndex.toFixed(0)}%；CTR ${(best.ctr * 100).toFixed(2)}% 高于账户均值 ${ctrIndex.toFixed(0)}%。该素材同时具备“高点击 + 高转化”，是本周期可放量的首要候选。`,
      evidence: `creative=${best.name}; spend=${best.spend.toFixed(0)}; CTR=${(best.ctr * 100).toFixed(2)}%; ROAS=${best.roas.toFixed(2)}; 账户均值 ROAS=${account.roas.toFixed(2)}`,
      confidence: 88,
    });
  }

  if (best) {
    recommendations.push({
      title: `下一周期把预算向“${best.name}”主题倾斜`,
      body: `建议将“${best.name}”的预算占比从 ${((best.spend / account.spend) * 100).toFixed(1)}% 提升到 ${Math.min(45, (best.spend / account.spend) * 100 + 12).toFixed(0)}% 左右，并用同一主题生产 3 条新素材做横向测试，验证是“主题红利”还是单条素材偶然胜出。`,
      evidence: `当前 spend share=${((best.spend / account.spend) * 100).toFixed(1)}%, ROAS=${best.roas.toFixed(2)}`,
      confidence: 82,
    });
  }

  if (worst && worst.spend > 0 && worst.roas < account.roas) {
    const gap = account.roas > 0 ? (1 - worst.roas / account.roas) * 100 : 0;
    risks.push({
      title: `“${worst.name}”持续拉低整体效率`,
      body: `“${worst.name}”的 ROAS 为 ${worst.roas.toFixed(2)}，比账户均值低 ${gap.toFixed(0)}%，却仍占用 ${((worst.spend / account.spend) * 100).toFixed(1)}% 预算（¥${Math.round(worst.spend).toLocaleString("zh-CN")}）。若维持现状，将按当前 CPA ¥${worst.cpa.toFixed(2)} 持续消耗预算。`,
      evidence: `creative=${worst.name}; ROAS=${worst.roas.toFixed(2)}; CPA=${worst.cpa.toFixed(2)}; spend share=${((worst.spend / account.spend) * 100).toFixed(1)}%`,
      confidence: 85,
    });
    recommendations.push({
      title: `对“${worst.name}”执行止损式优化`,
      body: `两种处理方式：① 立刻将该素材预算下调 50%，把释放预算转移到高效率素材；② 保留最低测试预算，但替换 Hook 与开头 3 秒，做一次“素材诊断实验”。建议先执行 ①，避免继续以 CPA ¥${worst.cpa.toFixed(2)} 获取低质流量。`,
      evidence: `CPA=${worst.cpa.toFixed(2)} vs 账户均价 ${account.cpa.toFixed(2)}`,
      confidence: 80,
    });
  }

  // 2. Platform efficiency comparison.
  const platformByCpc = [...platforms].filter((item) => item.clicks > 0).sort((a, b) => a.cpc - b.cpc);
  const cheapest = platformByCpc[0];
  const mostExpensive = platformByCpc[platformByCpc.length - 1];
  if (cheapest && mostExpensive && cheapest.name !== mostExpensive.name) {
    const conversionShare = new Map(platforms.map((item) => [item.name, item.share]));
    const cheapShare = (conversionShare.get(cheapest.name) ?? 0) * 100;
    const expensiveShare = (conversionShare.get(mostExpensive.name) ?? 0) * 100;
    insights.push({
      title: `${cheapest.name} 流量成本更低，但转化贡献不成比例`,
      body: `${cheapest.name} 的 CPC 为 ¥${cheapest.cpc.toFixed(2)}，比 ${mostExpensive.name}（¥${mostExpensive.cpc.toFixed(2)}）低 ${(
        (1 - cheapest.cpc / mostExpensive.cpc) * 100
      ).toFixed(0)}%；但 ${cheapest.name} 只贡献 ${cheapShare.toFixed(1)}% 的转化，而 ${mostExpensive.name} 贡献 ${expensiveShare.toFixed(1)}%。说明 ${cheapest.name} 目前更偏“低意向流量”，需要提高高意向内容占比。`,
      evidence: `${cheapest.name}: CPC=¥${cheapest.cpc.toFixed(2)}, CVR=${(cheapest.cvr * 100).toFixed(2)}%; ${mostExpensive.name}: CPC=¥${mostExpensive.cpc.toFixed(2)}, CVR=${(mostExpensive.cvr * 100).toFixed(2)}%`,
      confidence: 84,
    });
    opportunities.push({
      title: `把 ${mostExpensive.name} 的高转化结构复制到 ${cheapest.name}`,
      body: `${mostExpensive.name} 的 CVR 为 ${(mostExpensive.cvr * 100).toFixed(2)}%，是 ${cheapest.name}（${(cheapest.cvr * 100).toFixed(2)}%）的 ${(
        mostExpensive.cvr / Math.max(cheapest.cvr, 0.0001)
      ).toFixed(1)} 倍。建议把 ${mostExpensive.name} 中表现最好的内容结构（真实使用场景 + 评价证据）改写为适配 ${cheapest.name} 的版本，用更低 CPC 的流量测试更高 CVR 的内容。`,
      evidence: `CVR 差异 ${(mostExpensive.cvr * 100).toFixed(2)}% vs ${(cheapest.cvr * 100).toFixed(2)}%`,
      confidence: 76,
    });
  }

  // 3. Weekly efficiency change (drives the AI Advisor narrative).
  if (comparison && comparison.previous.spend > 0) {
    const roasDelta = comparison.deltas.roas;
    const cvrDelta = comparison.deltas.cvr;
    const ctrDelta = comparison.deltas.ctr;
    const direction = roasDelta >= 0 ? "上升" : "下降";
    insights.push({
      title: `最近 ${comparison.windowDays} 天 ROAS ${direction} ${Math.abs(roasDelta).toFixed(1)}%`,
      body: `ROAS 从 ${comparison.previous.roas.toFixed(2)} 变化到 ${comparison.current.roas.toFixed(2)}；同期 CTR 变化 ${ctrDelta.toFixed(1)}%，CVR 从 ${(
        comparison.previous.cvr * 100
      ).toFixed(2)}% 变化到 ${(comparison.current.cvr * 100).toFixed(2)}%（${cvrDelta.toFixed(1)}%）。${
        Math.abs(ctrDelta) < Math.abs(cvrDelta)
          ? "点击效率基本稳定，效率变化主要来自后端转化环节，而不是素材吸引力。"
          : "点击效率同时发生变化，需要同时检查素材与落地页。"
      }`,
      evidence: `current ROAS=${comparison.current.roas.toFixed(2)}, previous ROAS=${comparison.previous.roas.toFixed(2)}, dCTR=${ctrDelta.toFixed(1)}%, dCVR=${cvrDelta.toFixed(1)}%`,
      confidence: 90,
    });

    if (roasDelta < 0) {
      risks.push({
        title: "转化环节效率下滑是当前最大的增长风险",
        body: `CPA 从 ¥${comparison.previous.cpa.toFixed(2)} 上升到 ¥${comparison.current.cpa.toFixed(2)}（${
          comparison.deltas.cpa >= 0 ? "+" : ""
        }${comparison.deltas.cpa.toFixed(1)}%）。若流量成本（CPC ¥${comparison.current.cpc.toFixed(2)}）保持稳定，说明问题更可能出在承接环节：落地页一致性、价格解释与信任证据。`,
        evidence: `CPA ${comparison.previous.cpa.toFixed(2)} → ${comparison.current.cpa.toFixed(2)}; CPC ${comparison.previous.cpc.toFixed(2)} → ${comparison.current.cpc.toFixed(2)}`,
        confidence: 87,
      });

      recommendations.push({
        title: "优先修复“承诺一致性”，而不是继续加预算",
        body: `在 CVR 修复前不建议放量：先对齐素材承诺与落地页首屏信息，再叠加真实使用场景与用户评价模块，观察 7 天 CVR 是否回到 ${(
          comparison.previous.cvr * 100
        ).toFixed(1)}% 以上，再决定放量节奏。`,
        evidence: `目标 CVR ≥ ${(comparison.previous.cvr * 100).toFixed(1)}%；当前 ${(comparison.current.cvr * 100).toFixed(2)}%`,
        confidence: 83,
      });
    }
  }

  // 4. Audience-level signals (when audience rows exist).
  if (audienceRows.length > 0) {
    const segments = groupPerformance(audienceRows, "creative");
    const bestCtrSegment = [...segments].sort((a, b) => b.ctr - a.ctr)[0];
    const bestCvrSegment = [...segments].sort((a, b) => b.cvr - a.cvr)[0];
    if (bestCtrSegment && bestCvrSegment && bestCtrSegment.name !== bestCvrSegment.name) {
      insights.push({
        title: `${bestCtrSegment.name} 点击意愿最强，但付费转化落后`,
        body: `${bestCtrSegment.name} 的 CTR 为 ${(bestCtrSegment.ctr * 100).toFixed(2)}%（全账户最高），但 CVR 仅 ${(
          bestCtrSegment.cvr * 100
        ).toFixed(2)}%，低于 ${bestCvrSegment.name} 的 ${(bestCvrSegment.cvr * 100).toFixed(2)}%。这说明年轻用户对内容有兴趣，但对“是否值得现在购买”仍有顾虑。`,
        evidence: `${bestCtrSegment.name}: CTR=${(bestCtrSegment.ctr * 100).toFixed(2)}%, CVR=${(bestCtrSegment.cvr * 100).toFixed(2)}%; ${bestCvrSegment.name}: CVR=${(bestCvrSegment.cvr * 100).toFixed(2)}%`,
        confidence: 86,
      });
      opportunities.push({
        title: `${bestCtrSegment.name} 需要“信任 + 价格解释”型内容`,
        body: `该人群点击成本低、兴趣高，缺的是购买理由。建议补充三类内容：① 30 天使用记录；② 成分与安全性说明；③ 单次使用成本换算（把 ¥169 拆解到每天）。同时用学生优惠 / 小规格试用降低首单门槛。`,
        evidence: `CTR=${(bestCtrSegment.ctr * 100).toFixed(2)}% 但 CVR=${(bestCtrSegment.cvr * 100).toFixed(2)}%`,
        confidence: 81,
      });
    }
  }

  return {
    insights: dedupe(insights),
    opportunities: dedupe(opportunities),
    risks: dedupe(risks),
    recommendations: dedupe(recommendations),
  };
}

function dedupe(signals: Signal[]) {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = `${signal.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function signalsFromInsightRows(
  rows: Array<{ category: string; title: string; body: string; evidence: string; confidence: number }>,
): SignalBundle {
  const bundle: SignalBundle = { insights: [], opportunities: [], risks: [], recommendations: [] };
  rows.forEach((row) => {
    const signal: Signal = {
      title: row.title,
      body: row.body,
      evidence: row.evidence,
      confidence: row.confidence,
    };
    if (row.category === "insight") bundle.insights.push(signal);
    else if (row.category === "opportunity") bundle.opportunities.push(signal);
    else if (row.category === "risk") bundle.risks.push(signal);
    else bundle.recommendations.push(signal);
  });
  return bundle;
}

export function personaParsed<T extends { painPoints: string }>(row: T) {
  return safeJsonArray(row.painPoints);
}

export function efficiencyQuadrant(item: GroupedPerformance, benchmarks: DerivedMetrics) {
  const ctrOk = item.ctr >= benchmarks.ctr;
  const roasOk = item.roas >= benchmarks.roas;
  if (ctrOk && roasOk) return { code: "scale", label: "放量", tone: "good" as const };
  if (!ctrOk && roasOk) return { code: "optimize_hook", label: "优化 Hook", tone: "info" as const };
  if (ctrOk && !roasOk) return { code: "fix_funnel", label: "修复承接", tone: "warn" as const };
  return { code: "pause", label: "暂停", tone: "bad" as const };
}

export function roundMetrics(metrics: DerivedMetrics): DerivedMetrics {
  return {
    spend: round(metrics.spend, 2),
    impressions: round(metrics.impressions, 0),
    clicks: round(metrics.clicks, 0),
    conversions: round(metrics.conversions, 0),
    revenue: round(metrics.revenue, 2),
    ctr: metrics.ctr,
    cpc: metrics.cpc,
    cvr: metrics.cvr,
    cpa: metrics.cpa,
    roas: metrics.roas,
  };
}

export function metricFromParts(parts: {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}): DerivedMetrics {
  return {
    ...parts,
    ctr: calcCtr(parts.clicks, parts.impressions),
    cpc: calcCpc(parts.spend, parts.clicks),
    cvr: calcCvr(parts.conversions, parts.clicks),
    cpa: calcCpa(parts.spend, parts.conversions),
    roas: calcRoas(parts.revenue, parts.spend),
  };
}
```

## `src/lib/api.ts`

```ts
import { NextResponse } from "next/server";
import type { z } from "zod";

import { redactSecrets } from "@/lib/utils";
import type { AgentRunMeta } from "@/types";

export function ok<T>(data: T, meta: AgentRunMeta, status = 200) {
  return NextResponse.json({ ok: true, data, meta }, { status });
}

export function fail(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

export function parseBody<T>(schema: z.ZodType<T>, body: unknown):
  | { success: true; data: T }
  | { success: false; response: NextResponse } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      response: fail(
        "INVALID_REQUEST",
        "请求参数不合法：" +
          parsed.error.issues
            .slice(0, 3)
            .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
            .join("; "),
        422,
      ),
    };
  }
  return { success: true, data: parsed.data };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function serverError(error: unknown, fallbackMessage = "服务内部错误，请稍后重试。") {
  const message = redactSecrets(error instanceof Error ? error.message : fallbackMessage);
  console.error(
    "[MORI][api]",
    redactSecrets(error instanceof Error ? `${error.name}: ${error.message}` : String(error)),
  );
  return fail("SERVER_ERROR", message, 500);
}
```

## `src/lib/csv.ts`

```ts
import type { MetricRow } from "@/types";

export const CAMPAIGN_CSV_COLUMNS = [
  "date",
  "platform",
  "campaign",
  "creative",
  "spend",
  "impressions",
  "clicks",
  "conversions",
  "revenue",
] as const;

export type CampaignCsvColumn = (typeof CAMPAIGN_CSV_COLUMNS)[number];

export type CsvIssue = {
  row: number;
  column: string;
  message: string;
  severity: "error" | "warning";
};

export type CampaignCsvResult = {
  rows: MetricRow[];
  issues: CsvIssue[];
  totalRows: number;
  skippedRows: number;
  platforms: string[];
  creatives: string[];
  dateRange: { start: string; end: string } | null;
};

export type CsvErrorCode =
  | "EMPTY_FILE"
  | "MISSING_HEADER"
  | "MISSING_COLUMNS"
  | "NO_DATA_ROWS"
  | "TOO_MANY_ROWS";

export class CsvValidationError extends Error {
  code: CsvErrorCode;
  issues: CsvIssue[];

  constructor(code: CsvErrorCode, message: string, issues: CsvIssue[] = []) {
    super(message);
    this.name = "CsvValidationError";
    this.code = code;
    this.issues = issues;
  }
}

const HEADER_ALIASES: Record<CampaignCsvColumn, string[]> = {
  date: ["date", "日期", "day", "时间"],
  platform: ["platform", "平台", "渠道", "channel"],
  campaign: ["campaign", "广告计划", "计划", "campaign name", "计划名称"],
  creative: ["creative", "素材", "素材名称", "创意", "ad"],
  spend: ["spend", "花费", "消耗", "cost", "金额"],
  impressions: ["impressions", "曝光", "曝光量", "show", "展现"],
  clicks: ["clicks", "点击", "点击量", "click"],
  conversions: ["conversions", "转化", "转化数", "下单", "orders"],
  revenue: ["revenue", "收入", "gmv", "销售额", "成交金额"],
};

const MAX_ROWS = 20_000;

/** Minimal RFC4180-ish CSV parser: quotes, escaped quotes, CRLF, BOM. */
export function parseCsv(raw: string): string[][] {
  const text = raw.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\r") {
      if (text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((line) => line.some((cell) => cell.trim() !== ""));
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveHeaderMap(header: string[]) {
  const normalized = header.map(normalizeHeader);
  const map = new Map<CampaignCsvColumn, number>();

  (Object.keys(HEADER_ALIASES) as CampaignCsvColumn[]).forEach((column) => {
    const aliases = HEADER_ALIASES[column];
    const index = normalized.findIndex((cell) => aliases.some((alias) => normalizeHeader(alias) === cell));
    if (index >= 0) map.set(column, index);
  });

  return map;
}

export function parseNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const cleaned = value
    .replace(/[¥$€,\s]/g, "")
    .replace(/[%％]$/, "")
    .trim();
  if (cleaned === "" || cleaned === "-" || cleaned === "null" || cleaned === "NULL") return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct;

  const normalized = trimmed.replace(/[/.]/g, "-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const [, y, m, d] = match;
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    if (!Number.isNaN(date.getTime())) return date;
  }

  return null;
}

/**
 * Validates and maps an uploaded campaign CSV into metric rows.
 * Throws CsvValidationError for structural problems (empty file, missing
 * columns, no usable rows) and reports row-level issues as `issues`.
 */
export function parseCampaignCsv(raw: string): CampaignCsvResult {
  const trimmed = raw.replace(/^\uFEFF/, "").trim();
  if (!trimmed) {
    throw new CsvValidationError("EMPTY_FILE", "CSV 文件为空，请上传包含投放数据的文件。");
  }

  const table = parseCsv(raw);
  if (table.length === 0) {
    throw new CsvValidationError("EMPTY_FILE", "CSV 文件为空，请上传包含投放数据的文件。");
  }

  const [header, ...dataRows] = table;
  const headerMap = resolveHeaderMap(header);
  const missing = CAMPAIGN_CSV_COLUMNS.filter((column) => !headerMap.has(column));

  if (missing.includes("date") && header.length === 1 && header[0].trim().length > 0 && dataRows.length === 0) {
    throw new CsvValidationError("MISSING_HEADER", "CSV 缺少表头行，请包含 date, platform, campaign, creative, spend, impressions, clicks, conversions, revenue。");
  }

  if (missing.length > 0) {
    throw new CsvValidationError(
      "MISSING_COLUMNS",
      `CSV 缺少必要字段：${missing.join(", ")}`,
      missing.map((column) => ({
        row: 1,
        column,
        message: `缺少字段 ${column}`,
        severity: "error" as const,
      })),
    );
  }

  if (dataRows.length === 0) {
    throw new CsvValidationError("NO_DATA_ROWS", "CSV 只有表头，没有数据行。");
  }

  if (dataRows.length > MAX_ROWS) {
    throw new CsvValidationError(
      "TOO_MANY_ROWS",
      `数据行数超过 ${MAX_ROWS} 行的上限（当前 ${dataRows.length} 行），请拆分文件后重试。`,
    );
  }

  const rows: MetricRow[] = [];
  const issues: CsvIssue[] = [];
  let skippedRows = 0;

  dataRows.forEach((cells, index) => {
    const lineNumber = index + 2; // 1-based, +1 for header
    const get = (column: CampaignCsvColumn) => cells[headerMap.get(column) ?? -1];

    const date = parseDate(get("date"));
    if (!date) {
      skippedRows += 1;
      issues.push({
        row: lineNumber,
        column: "date",
        message: `无法解析日期 “${(get("date") ?? "").trim() || "空"}”，已跳过该行`,
        severity: "error",
      });
      return;
    }

    const platform = (get("platform") ?? "").trim();
    const campaign = (get("campaign") ?? "").trim();
    const creative = (get("creative") ?? "").trim();

    if (!platform || !campaign || !creative) {
      skippedRows += 1;
      issues.push({
        row: lineNumber,
        column: "creative",
        message: "platform / campaign / creative 存在空值，已跳过该行",
        severity: "error",
      });
      return;
    }

    const numericColumns: Array<Exclude<CampaignCsvColumn, "date" | "platform" | "campaign" | "creative">> = [
      "spend",
      "impressions",
      "clicks",
      "conversions",
      "revenue",
    ];

    const values: Record<string, number> = {};
    let hasError = false;

    numericColumns.forEach((column) => {
      const parsed = parseNumber(get(column));
      if (parsed === null) {
        // Missing numeric fields are treated as 0 (common in exported reports)
        // but surfaced as a warning so the operator can verify the export.
        issues.push({
          row: lineNumber,
          column,
          message: `${column} 字段为空或非数字，已按 0 处理`,
          severity: "warning",
        });
        values[column] = 0;
        return;
      }
      if (parsed < 0) {
        issues.push({
          row: lineNumber,
          column,
          message: `${column} 为负数（${parsed}），已按 0 处理`,
          severity: "error",
        });
        values[column] = 0;
        hasError = true;
        return;
      }
      values[column] = parsed;
    });

    if (hasError) {
      skippedRows += 1;
      return;
    }

    if (values.impressions === 0) {
      issues.push({
        row: lineNumber,
        column: "impressions",
        message: "曝光为 0，CTR/CPC 会按 0 处理（避免除 0）",
        severity: "warning",
      });
    } else if (values.clicks > values.impressions) {
      issues.push({
        row: lineNumber,
        column: "clicks",
        message: "点击数大于曝光数，可能是数据口径问题，请检查导出",
        severity: "warning",
      });
    }

    if (values.conversions > values.clicks) {
      issues.push({
        row: lineNumber,
        column: "conversions",
        message: "转化数大于点击数，可能是回传口径问题，请检查导出",
        severity: "warning",
      });
    }

    rows.push({
      date,
      platform,
      campaign,
      creative,
      spend: values.spend,
      impressions: Math.round(values.impressions),
      clicks: Math.round(values.clicks),
      conversions: Math.round(values.conversions),
      revenue: values.revenue,
    });
  });

  if (rows.length === 0) {
    throw new CsvValidationError(
      "NO_DATA_ROWS",
      "所有数据行都无法解析，请检查日期与数字字段格式。",
      issues.slice(0, 20),
    );
  }

  const timestamps = rows.map((row) => new Date(row.date).getTime());

  return {
    rows,
    issues: issues.slice(0, 200),
    totalRows: dataRows.length,
    skippedRows,
    platforms: Array.from(new Set(rows.map((row) => row.platform))),
    creatives: Array.from(new Set(rows.map((row) => row.creative))),
    dateRange: {
      start: new Date(Math.min(...timestamps)).toISOString().slice(0, 10),
      end: new Date(Math.max(...timestamps)).toISOString().slice(0, 10),
    },
  };
}

export function rowsToCsv(rows: MetricRow[]): string {
  const header = CAMPAIGN_CSV_COLUMNS.join(",");
  const lines = rows.map((row) =>
    [
      typeof row.date === "string" ? row.date : row.date.toISOString().slice(0, 10),
      row.platform,
      row.campaign,
      row.creative,
      row.spend,
      row.impressions,
      row.clicks,
      row.conversions,
      row.revenue,
    ]
      .map((value) => {
        const text = String(value);
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
      })
      .join(","),
  );
  return [header, ...lines].join("\n");
}
```

## `src/lib/data.ts`

```ts
import { prisma } from "@/lib/db";
import {
  audienceBreakdown,
  compareWindows,
  creativeScorecard,
  dailySeries,
  deriveSignals,
  groupPerformance,
  type AudienceSegmentRow,
} from "@/lib/analytics";
import type { BusinessContext } from "@/lib/ai/context";
import { computeMetrics } from "@/lib/metrics";
import {
  buildDemoBrand,
  buildDemoCompetitors,
  buildDemoPersonas,
  buildDemoProduct,
  DEMO_PERIOD_DAYS,
  DEMO_PERIOD_END,
  DEMO_PERIOD_START,
} from "@/lib/demo-data";
import { safeJsonArray } from "@/lib/utils";
import type {
  BrandRecord,
  CampaignRecord,
  CompetitorRecord,
  ContentRecord,
  CreativeRecord,
  DatasetRecord,
  ExperimentRecord,
  InsightRecord,
  MetricRow,
  PersonaRecord,
  ProductRecord,
} from "@/types";

export type DatasetSelection = {
  datasetId?: string | null;
  source?: "demo" | "upload";
};

/* -------------------------------------------------------------------------- */
/* row mappers                                                                 */
/* -------------------------------------------------------------------------- */

export function toMetricRow(row: {
  date: Date;
  platform: string;
  campaign: string;
  creative: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}): MetricRow {
  return {
    date: row.date,
    platform: row.platform,
    campaign: row.campaign,
    creative: row.creative,
    spend: row.spend,
    impressions: row.impressions,
    clicks: row.clicks,
    conversions: row.conversions,
    revenue: row.revenue,
  };
}

function toPersona(row: {
  id: string;
  code: string;
  name: string;
  ageBand: string;
  occupation: string;
  city: string;
  share: number;
  painPoints: string;
  motivations: string;
  contentPreferences: string;
  purchaseDrivers: string;
  barriers: string;
  channels: string;
  quote: string;
  accent: string;
}): PersonaRecord {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    ageBand: row.ageBand,
    occupation: row.occupation,
    city: row.city,
    share: row.share,
    painPoints: safeJsonArray(row.painPoints),
    motivations: safeJsonArray(row.motivations),
    contentPreferences: safeJsonArray(row.contentPreferences),
    purchaseDrivers: safeJsonArray(row.purchaseDrivers),
    barriers: safeJsonArray(row.barriers),
    channels: safeJsonArray(row.channels),
    quote: row.quote,
    accent: row.accent,
  };
}

function toCompetitor(row: {
  id: string;
  name: string;
  positioning: string;
  price: number;
  priceTier: string;
  professional: number;
  audience: string;
  contentThemes: string;
  mainChannels: string;
  adThemes: string;
  strength: string;
  weakness: string;
  colorToken: string;
  isSelf: boolean;
}): CompetitorRecord {
  return {
    id: row.id,
    name: row.name,
    positioning: row.positioning,
    price: row.price,
    priceTier: row.priceTier,
    professional: row.professional,
    audience: row.audience,
    contentThemes: safeJsonArray(row.contentThemes),
    mainChannels: safeJsonArray(row.mainChannels),
    adThemes: safeJsonArray(row.adThemes),
    strength: row.strength,
    weakness: row.weakness,
    colorToken: row.colorToken,
    isSelf: row.isSelf,
  };
}

export function toContentRecord(row: {
  id: string;
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
}): ContentRecord {
  return { ...row };
}

export function toExperimentRecord(row: {
  id: string;
  name: string;
  hypothesis: string;
  goal: string;
  primaryMetric: string;
  status: string;
  startDate: Date;
  endDate: Date;
  summary: string;
  aiRecommendation: string;
  mode: string;
  variants: Array<{
    id: string;
    label: string;
    name: string;
    description: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    isWinner: boolean;
  }>;
}): ExperimentRecord {
  return {
    id: row.id,
    name: row.name,
    hypothesis: row.hypothesis,
    goal: row.goal,
    primaryMetric: row.primaryMetric,
    status: row.status,
    startDate: row.startDate,
    endDate: row.endDate,
    summary: row.summary,
    aiRecommendation: row.aiRecommendation,
    mode: row.mode,
    variants: row.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      name: variant.name,
      description: variant.description,
      impressions: variant.impressions,
      clicks: variant.clicks,
      conversions: variant.conversions,
      spend: variant.spend,
      revenue: variant.revenue,
      isWinner: variant.isWinner,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* business context                                                            */
/* -------------------------------------------------------------------------- */

export async function getDatasetOptions(): Promise<DatasetRecord[]> {
  const rows = await prisma.dataset.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    source: row.source,
    rowCount: row.rowCount,
    note: row.note,
    createdAt: row.createdAt,
  }));
}

export async function getBusinessContext(selection: DatasetSelection = {}): Promise<BusinessContext> {
  const [brandRow, productRow, personaRows, competitorRows, contentRows, experimentRows] = await Promise.all([
    prisma.brand.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.product.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.persona.findMany({ orderBy: { share: "desc" } }),
    prisma.competitor.findMany({ orderBy: { professional: "desc" } }),
    prisma.contentItem.findMany({ orderBy: { overallScore: "desc" }, take: 60 }),
    prisma.experiment.findMany({ include: { variants: true }, orderBy: { startDate: "desc" } }),
  ]);

  const brandFallback = buildDemoBrand();
  const brand: BrandRecord = brandRow
    ? {
        id: brandRow.id,
        name: brandRow.name,
        nameEn: brandRow.nameEn,
        positioning: brandRow.positioning,
        description: brandRow.description,
        productName: brandRow.productName,
        priceRange: brandRow.priceRange,
        targetAudience: brandRow.targetAudience,
        channels: safeJsonArray(brandRow.channels),
        keywords: safeJsonArray(brandRow.keywords),
      }
    : { id: "demo-brand", ...brandFallback, channels: safeJsonArray(brandFallback.channels), keywords: safeJsonArray(brandFallback.keywords) };

  const productFallback = buildDemoProduct();
  const product: ProductRecord = productRow
    ? {
        id: productRow.id,
        brandName: productRow.brandName,
        name: productRow.name,
        category: productRow.category,
        positioning: productRow.positioning,
        price: productRow.price,
        volume: productRow.volume,
        keyBenefits: safeJsonArray(productRow.keyBenefits),
        sellingPoints: safeJsonArray(productRow.sellingPoints),
        usageScenario: safeJsonArray(productRow.usageScenario),
        credibility: safeJsonArray(productRow.credibility),
      }
    : {
        id: "demo-product",
        ...productFallback,
        keyBenefits: safeJsonArray(productFallback.keyBenefits),
        sellingPoints: safeJsonArray(productFallback.sellingPoints),
        usageScenario: safeJsonArray(productFallback.usageScenario),
        credibility: safeJsonArray(productFallback.credibility),
      };

  const personas: PersonaRecord[] = personaRows.length
    ? personaRows.map(toPersona)
    : buildDemoPersonas().map((persona, index) => toPersona({ id: `demo-persona-${index}`, ...persona }));

  const competitors: CompetitorRecord[] = competitorRows.length
    ? competitorRows.map(toCompetitor)
    : buildDemoCompetitors().map((competitor, index) => toCompetitor({ id: `demo-competitor-${index}`, ...competitor }));

  const contents: ContentRecord[] = contentRows.map(toContentRecord);
  const experiments: ExperimentRecord[] = experimentRows.map(toExperimentRecord);

  const metricWhere = selection.datasetId
    ? { datasetId: selection.datasetId }
    : { source: selection.source ?? "demo" };

  const [metricRows, audienceRows] = await Promise.all([
    prisma.metric.findMany({ where: metricWhere, orderBy: { date: "asc" } }),
    selection.datasetId ? Promise.resolve([]) : prisma.audienceMetric.findMany({ orderBy: { date: "asc" } }),
  ]);

  const rows = metricRows.map(toMetricRow);
  const audienceSegmentRows: AudienceSegmentRow[] = audienceRows.map((row) => ({
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

  const totals = computeMetrics(rows);
  const daily = dailySeries(rows);

  let datasetLabel = "Demo 数据集（30 天模拟投放数据）";
  if (selection.datasetId) {
    const dataset = await prisma.dataset.findUnique({ where: { id: selection.datasetId } });
    if (dataset) datasetLabel = `上传数据集：${dataset.name}`;
  }

  return {
    brand,
    product,
    personas,
    competitors,
    period: {
      start: daily[0]?.date ?? DEMO_PERIOD_START,
      end: daily[daily.length - 1]?.date ?? DEMO_PERIOD_END,
      label:
        (daily[0]?.date ?? DEMO_PERIOD_START) + " ~ " + (daily[daily.length - 1]?.date ?? DEMO_PERIOD_END) + "（Demo）",
      days: daily.length || DEMO_PERIOD_DAYS,
    },
    totals,
    daily,
    platforms: groupPerformance(rows, "platform"),
    campaigns: groupPerformance(rows, "campaign"),
    creatives: creativeScorecard(rows),
    comparison: compareWindows(rows, 7),
    audience: audienceBreakdown(audienceSegmentRows),
    signals: deriveSignals(rows, audienceSegmentRows),
    contents,
    experiments,
    dataSource: {
      kind: selection.datasetId ? "upload" : "demo",
      label: datasetLabel,
      rows: rows.length,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* page level helpers                                                          */
/* -------------------------------------------------------------------------- */

export async function getCampaignRecords(): Promise<CampaignRecord[]> {
  const rows = await prisma.campaign.findMany({ orderBy: { startDate: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    objective: row.objective,
    platform: row.platform,
    status: row.status,
    budget: row.budget,
    startDate: row.startDate,
    endDate: row.endDate,
    note: row.note,
  }));
}

export async function getCreativeRecords(): Promise<CreativeRecord[]> {
  const rows = await prisma.creative.findMany({ orderBy: { priority: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    campaign: row.campaign,
    platform: row.platform,
    theme: row.theme,
    angle: row.angle,
    hook: row.hook,
    cta: row.cta,
    audience: row.audience,
    script: row.script,
    priority: row.priority,
    status: row.status,
    targetCtr: row.targetCtr,
    targetRoas: row.targetRoas,
  }));
}

export async function getContentLibrary(limit = 36): Promise<ContentRecord[]> {
  const rows = await prisma.contentItem.findMany({ orderBy: [{ overallScore: "desc" }], take: limit });
  return rows.map(toContentRecord);
}

export async function getExperimentList(): Promise<ExperimentRecord[]> {
  const rows = await prisma.experiment.findMany({
    include: { variants: true },
    orderBy: [{ status: "asc" }, { startDate: "desc" }],
  });
  return rows.map(toExperimentRecord);
}

export async function getInsightHistory(limit = 12): Promise<InsightRecord[]> {
  const rows = await prisma.insight.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return rows.map((row) => ({
    id: row.id,
    scope: row.scope,
    category: row.category,
    title: row.title,
    body: row.body,
    evidence: row.evidence,
    confidence: row.confidence,
    agent: row.agent,
    mode: row.mode,
  }));
}

export async function saveInsights(
  scope: string,
  agent: string,
  mode: string,
  bundle: { insights: Array<{ title: string; body: string; evidence: string; confidence: number }>; opportunities: Array<{ title: string; body: string; evidence: string; confidence: number }>; risks: Array<{ title: string; body: string; evidence: string; confidence: number }>; recommendations: Array<{ title: string; body: string; evidence: string; confidence: number }> },
) {
  const payload = [
    ...bundle.insights.map((item) => ({ ...item, category: "insight" })),
    ...bundle.opportunities.map((item) => ({ ...item, category: "opportunity" })),
    ...bundle.risks.map((item) => ({ ...item, category: "risk" })),
    ...bundle.recommendations.map((item) => ({ ...item, category: "recommendation" })),
  ];

  if (payload.length === 0) return 0;

  await prisma.insight.createMany({
    data: payload.map((item) => ({
      scope,
      category: item.category,
      title: item.title,
      body: item.body,
      evidence: item.evidence,
      confidence: Math.round(item.confidence),
      agent,
      mode,
    })),
  });

  return payload.length;
}

export type CsvPersistResult = {
  dataset: DatasetRecord;
  inserted: number;
};

export async function persistUploadedCsv(
  name: string,
  rows: MetricRow[],
  note: string,
): Promise<CsvPersistResult> {
  const dataset = await prisma.dataset.create({
    data: {
      name,
      source: "upload",
      rowCount: rows.length,
      note,
    },
  });

  await prisma.metric.createMany({
    data: rows.map((row) => ({
      date: new Date(row.date),
      platform: row.platform,
      campaign: row.campaign,
      creative: row.creative,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
      revenue: row.revenue,
      source: "upload",
      datasetId: dataset.id,
    })),
  });

  return {
    dataset: {
      id: dataset.id,
      name: dataset.name,
      source: dataset.source,
      rowCount: dataset.rowCount,
      note: dataset.note,
      createdAt: dataset.createdAt,
    },
    inserted: rows.length,
  };
}

export async function deleteDataset(id: string) {
  await prisma.dataset.delete({ where: { id } });
}

/** Used by /api/campaign/sample to hand the reviewer a ready-to-upload CSV. */
export async function getDemoMetricRows(limit = 90): Promise<MetricRow[]> {
  const rows = await prisma.metric.findMany({
    where: { source: "demo" },
    orderBy: [{ creative: "asc" }, { date: "asc" }],
    take: limit,
  });
  return rows.map(toMetricRow);
}
```

## `src/lib/db.ts`

```ts
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton (avoids exhausting connections during Next.js
 * hot reload in development).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function databaseHealthCheck() {
  try {
    const [metricCount, brandCount, datasetCount] = await Promise.all([
      prisma.metric.count(),
      prisma.brand.count(),
      prisma.dataset.count(),
    ]);
    return { ok: true, metricCount, brandCount, datasetCount };
  } catch (error) {
    return {
      ok: false,
      metricCount: 0,
      brandCount: 0,
      datasetCount: 0,
      error: error instanceof Error ? error.message : "数据库连接失败",
    };
  }
}
```

## `src/lib/demo-data.ts`

```ts
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
```

## `src/lib/experiments.ts`

```ts
import { twoProportionZTest, type ProportionTest } from "@/lib/statistics";

export type VariantMetrics = {
  label: string;
  name: string;
  description: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
};

export type ExperimentEvaluation = {
  primaryMetric: string;
  a: VariantMetrics;
  b: VariantMetrics;
  metrics: {
    a: { ctr: number; cvr: number; cpa: number; roas: number };
    b: { ctr: number; cvr: number; cpa: number; roas: number };
  };
  test: ProportionTest | null;
  liftPct: number;
  significant: boolean;
  winner: "A" | "B" | "tie";
  recommendation: string;
};

const METRIC_LABEL: Record<string, string> = {
  ctr: "CTR",
  cvr: "CVR",
  cpa: "CPA",
  roas: "ROAS",
};

/**
 * Evaluates an A/B test using a two-proportion z-test for rate metrics
 * (CTR / CVR) and lift comparison for ratio metrics (CPA / ROAS).
 *
 * Using statistics instead of an LLM opinion here is deliberate: the model is
 * good at interpreting *why*, but the "is this difference real" question must
 * be answered by maths.
 */
export function evaluateExperiment(
  a: VariantMetrics,
  b: VariantMetrics,
  primaryMetric: string,
): ExperimentEvaluation {
  const safe = (numerator: number, denominator: number) => (denominator > 0 ? numerator / denominator : 0);

  const metricsA = {
    ctr: safe(a.clicks, a.impressions),
    cvr: safe(a.conversions, a.clicks),
    cpa: safe(a.spend, a.conversions),
    roas: safe(a.revenue, a.spend),
  };
  const metricsB = {
    ctr: safe(b.clicks, b.impressions),
    cvr: safe(b.conversions, b.clicks),
    cpa: safe(b.spend, b.conversions),
    roas: safe(b.revenue, b.spend),
  };

  const metric = METRIC_LABEL[primaryMetric] ? primaryMetric : "cvr";
  let test: ProportionTest | null = null;

  if (metric === "ctr") {
    test = twoProportionZTest(a.clicks, a.impressions, b.clicks, b.impressions);
  } else if (metric === "cvr") {
    test = twoProportionZTest(a.conversions, a.clicks, b.conversions, b.clicks);
  }

  const valueA = metric === "cpa" ? metricsA.cpa : metric === "roas" ? metricsA.roas : metric === "ctr" ? metricsA.ctr : metricsA.cvr;
  const valueB = metric === "cpa" ? metricsB.cpa : metric === "roas" ? metricsB.roas : metric === "ctr" ? metricsB.ctr : metricsB.cvr;

  // For CPA, lower is better; for everything else, higher is better.
  const lowerIsBetter = metric === "cpa";
  const rawLift = valueA === 0 ? 0 : ((valueB - valueA) / Math.abs(valueA)) * 100;
  const liftPct = lowerIsBetter ? -rawLift : rawLift;

  const significant = test ? test.significant : Math.abs(liftPct) >= 15;
  let winner: "A" | "B" | "tie" = "tie";
  if (significant) winner = liftPct > 0 ? "B" : "A";
  else if (Math.abs(liftPct) < 5) winner = "tie";

  const label = METRIC_LABEL[metric];
  const metricText = metric === "cpa" || metric === "roas" ? valueB.toFixed(2) : `${(valueB * 100).toFixed(2)}%`;
  const metricTextA = metric === "cpa" || metric === "roas" ? valueA.toFixed(2) : `${(valueA * 100).toFixed(2)}%`;

  const scope = "基于模拟数据（Demo 数据集）的统计检验";
  let recommendation: string;
  if (winner === "B") {
    recommendation = `${scope}：建议在下一轮模拟实验中保留 B（${b.name}），并把预算向 B 倾斜 60/40。${label}：A ${metricTextA} → B ${metricText}（Demo 数据中差异 ${Math.abs(liftPct).toFixed(1)}%）。${
      test
        ? `显著性：p=${test.pValue.toFixed(4)}（${test.significant ? "显著" : "未达显著，建议继续收集样本"}）。`
        : "该指标为比率型指标，使用提升幅度判断，建议再用 CTR/CVR 交叉验证。"
    }该结论来自模拟数据，若要在真实投放中复现需要扩样验证。`;
  } else if (winner === "A") {
    recommendation = `${scope}：建议在下一轮模拟实验中保留 A（${a.name}），暂不把预算转向 B。${label}：A ${metricTextA} → B ${metricText}（Demo 数据中 B ${
      liftPct < 0 ? "下降" : "上升"
    } ${Math.abs(liftPct).toFixed(1)}%）。${test ? `显著性：p=${test.pValue.toFixed(4)}。` : ""}该结论来自模拟数据，需真实数据验证。`;
  } else {
    recommendation = `${scope}：当前差异不足以判断胜负（${label}：A ${metricTextA} vs B ${metricText}，差异 ${Math.abs(
      liftPct,
    ).toFixed(1)}%）。建议：① 在模拟实验中继续平量测试直到样本更充分；② 检查是否被落地页或人群差异干扰；③ 若仍无差异，改为测试新的角度族。以上均为模拟数据推演，不代表真实投放结果。`;
  }

  return {
    primaryMetric: metric,
    a,
    b,
    metrics: { a: metricsA, b: metricsB },
    test,
    liftPct,
    significant,
    winner,
    recommendation,
  };
}

export function experimentMetricTable(evaluation: ExperimentEvaluation) {
  return [
    { metric: "CTR %", A: Number((evaluation.metrics.a.ctr * 100).toFixed(2)), B: Number((evaluation.metrics.b.ctr * 100).toFixed(2)) },
    { metric: "CVR %", A: Number((evaluation.metrics.a.cvr * 100).toFixed(2)), B: Number((evaluation.metrics.b.cvr * 100).toFixed(2)) },
    { metric: "CPA ¥", A: Number(evaluation.metrics.a.cpa.toFixed(2)), B: Number(evaluation.metrics.b.cpa.toFixed(2)) },
    { metric: "ROAS", A: Number(evaluation.metrics.a.roas.toFixed(2)), B: Number(evaluation.metrics.b.roas.toFixed(2)) },
  ];
}
```

## `src/lib/metrics.ts`

```ts
import type { DerivedMetrics, MetricRow } from "@/types";

/**
 * All KPI math lives here so that both the app and the tests use a single
 * source of truth:
 *
 *   CTR  = clicks / impressions
 *   CPC  = spend / clicks
 *   CVR  = conversions / clicks
 *   CPA  = spend / conversions
 *   ROAS = revenue / spend
 *
 * Every division is guarded: when the denominator is missing, zero, negative
 * or not a finite number we return a safe fallback instead of NaN/Infinity.
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  const n = Number.isFinite(numerator) ? numerator : 0;
  const d = Number.isFinite(denominator) ? denominator : 0;
  if (d === 0) return fallback;
  const result = n / d;
  return Number.isFinite(result) ? result : fallback;
}

export const calcCtr = (clicks: number, impressions: number) => safeDivide(clicks, impressions);
export const calcCpc = (spend: number, clicks: number) => safeDivide(spend, clicks);
export const calcCvr = (conversions: number, clicks: number) => safeDivide(conversions, clicks);
export const calcCpa = (spend: number, conversions: number) => safeDivide(spend, conversions);
export const calcRoas = (revenue: number, spend: number) => safeDivide(revenue, spend);

export const EMPTY_METRICS: DerivedMetrics = {
  spend: 0,
  impressions: 0,
  clicks: 0,
  conversions: 0,
  revenue: 0,
  ctr: 0,
  cpc: 0,
  cvr: 0,
  cpa: 0,
  roas: 0,
};

export function sumRows(rows: MetricRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.spend += numeric(row.spend);
      acc.impressions += numeric(row.impressions);
      acc.clicks += numeric(row.clicks);
      acc.conversions += numeric(row.conversions);
      acc.revenue += numeric(row.revenue);
      return acc;
    },
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
  );
}

export function computeMetrics(rows: MetricRow[]): DerivedMetrics {
  const totals = sumRows(rows);
  return {
    ...totals,
    ctr: calcCtr(totals.clicks, totals.impressions),
    cpc: calcCpc(totals.spend, totals.clicks),
    cvr: calcCvr(totals.conversions, totals.clicks),
    cpa: calcCpa(totals.spend, totals.conversions),
    roas: calcRoas(totals.revenue, totals.spend),
  };
}

function numeric(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export type MetricKey = keyof Pick<DerivedMetrics, "spend" | "impressions" | "clicks" | "conversions" | "revenue" | "ctr" | "cpc" | "cvr" | "cpa" | "roas">;

export type MetricDefinition = {
  key: MetricKey;
  label: string;
  labelEn: string;
  hint: string;
  format: "currency" | "currency2" | "number" | "compact" | "percent" | "ratio";
  /** true when a higher value is better */
  higherIsBetter: boolean;
};

export const KPI_DEFINITIONS: MetricDefinition[] = [
  {
    key: "spend",
    label: "广告花费",
    labelEn: "Ad Spend",
    hint: "所选周期内的媒体投放消耗",
    format: "currency",
    higherIsBetter: false,
  },
  {
    key: "impressions",
    label: "广告曝光",
    labelEn: "Impressions",
    hint: "素材被展示的次数",
    format: "compact",
    higherIsBetter: true,
  },
  {
    key: "clicks",
    label: "点击",
    labelEn: "Clicks",
    hint: "点击进入落地页 / 内容的次数",
    format: "number",
    higherIsBetter: true,
  },
  {
    key: "ctr",
    label: "CTR",
    labelEn: "Click-through Rate",
    hint: "点击 / 曝光，衡量素材吸引力",
    format: "percent",
    higherIsBetter: true,
  },
  {
    key: "cpc",
    label: "CPC",
    labelEn: "Cost per Click",
    hint: "花费 / 点击，衡量流量成本",
    format: "currency2",
    higherIsBetter: false,
  },
  {
    key: "conversions",
    label: "转化",
    labelEn: "Conversions",
    hint: "Demo 口径：下单转化数",
    format: "number",
    higherIsBetter: true,
  },
  {
    key: "cpa",
    label: "CPA",
    labelEn: "Cost per Acquisition",
    hint: "花费 / 转化，衡量获客成本",
    format: "currency2",
    higherIsBetter: false,
  },
  {
    key: "roas",
    label: "ROAS",
    labelEn: "Return on Ad Spend",
    hint: "收入 / 花费，衡量投放效率",
    format: "ratio",
    higherIsBetter: true,
  },
];

export function formatMetricValue(key: MetricKey, value: number) {
  const definition = KPI_DEFINITIONS.find((item) => item.key === key);
  const format = definition?.format ?? "number";
  switch (format) {
    case "currency":
      return `¥${Math.round(value).toLocaleString("zh-CN")}`;
    case "currency2":
      return `¥${value.toFixed(2)}`;
    case "percent":
      return `${(value * 100).toFixed(2)}%`;
    case "ratio":
      return value.toFixed(2);
    case "compact":
      if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万`;
      return Math.round(value).toLocaleString("zh-CN");
    default:
      return Math.round(value).toLocaleString("zh-CN");
  }
}
```

## `src/lib/prompts.ts`

```ts
import type { AgentId } from "@/types";

/**
 * Prompt Library — every AI capability in MORI AI Growth OS is a separate
 * agent with its own system prompt, output schema and version. There is no
 * single mega-prompt.
 *
 * The same objects are rendered on /prompts, persisted into the database by
 * `prisma/seed.ts`, and used by `lib/ai/runner.ts` when a real provider is
 * configured.
 */

export type PromptTemplateDefinition = {
  agent: AgentId;
  name: string;
  nameZh: string;
  version: string;
  description: string;
  body: string;
  schemaName: string;
  outputSchema: string;
  changelog: string;
};

/**
 * 数据真实性与表述规范 —— 最高优先级，追加到每一个 Agent 的 Prompt 末尾。
 *
 * 背景：MORI 的 experiment / metric / audience 数据全部是模拟数据。AI 很容易把
 * 「Demo 数据集里 A 组 CVR 更高」写成「实验已完成、已验证、实际提升 22.6%」，
 * 这在真实业务语境下会被误读为真实业绩。下面的规则把"能推演"和"不能声称"分开。
 */
const DEMO_DATA_RULES = `数据真实性与表述规范（最高优先级，任何 Agent 都不得违反）：
A. 本项目的品牌、竞品、用户、投放与实验数据全部是 Demo / 模拟业务数据；不存在真实投放、
   真实用户实验或真实收入。允许基于模拟数据做分析、归因、假设与推演，但表述必须限定在数据范围内。
B. 引用模拟实验或指标变化时，必须使用带口径的表述，例如：
   「模拟实验结果」「Demo 数据显示」「基于模拟数据推演」「在 Demo 数据集中，该指标从 X 变化到 Y」。
C. 禁止把模拟数据写成既成事实，包括但不限于：已完成实验、已验证、实测验证、上线后提升、
   实际提升 X%、真实投放验证、真实用户实验证明、带来 X% 收入增长。
D. 涉及实验结论或提升幅度时，必须在同一句里写明数据口径与不确定性，例如：
   「模拟实验（Demo 数据集）显示 A→B 差异 22.6%，p=0.03；若在真实投放中复现，需要扩样验证」。
E. 禁止声称任何真实商业成绩（销售额提升、ROI 提升、客户增长、真实 GMV 等）。
   缺少真实数据支持的判断，必须写成「需要真实数据验证」。
F. 若 dataSource.kind = "upload"（用户上传的数据），表述改为「基于上传的投放数据」，
   同样不得声称真实业务增长（转化与收入口径未知）。
G. 实验的 running / completed 只是模拟实验的推演状态，不得写成「实验已经完成并验证」。
`;

const SHARED_RULES = `通用约束（所有 MORI Agent 都必须遵守）：
1. MORI 森屿是虚拟品牌，所有业务数据都是 Demo / 模拟业务数据，禁止把它描述成真实企业或真实业绩。
   （数据表述细则见上方"数据真实性与表述规范"，两者冲突时以更严格的一条为准。）
2. 禁止编造商业成绩（例如“销售额提升 300%”“ROI 提升 200%”），所有数字必须来自输入数据或明确标注为假设。
3. 禁止医疗、绝对化、承诺性功效表达（如“治好”“立刻见效”“永久”）。
4. 只输出符合给定 JSON Schema 的结构化结果：**Schema 中列出的每一个字段都必须出现，一个都不能少**。
   不允许省略任何 key；不允许用 null 占位；数组没有内容时返回 []；数字字段必须输出数字（不要加引号或单位）。
   不要输出 Markdown 代码块或多余解释。
5. 每条结论必须给出 evidence（引用输入中的具体指标或字段）与 confidence（0–100）。
6. 先给判断，再给证据，最后给可执行动作；动作必须具体到“做什么、对谁、验证什么指标”。
7. 输出前按 Schema 逐项自检：即使某个字段信息不足，也要基于已有数据给出合理内容并说明依据，
   绝对不能因为“不确定”而省略该字段——省略字段会被判为无效输出并被系统丢弃。

${DEMO_DATA_RULES}`;

export const PROMPT_LIBRARY: PromptTemplateDefinition[] = [
  {
    agent: "market_analyst",
    name: "Market Analyst",
    nameZh: "市场与竞品分析师",
    version: "v1.2",
    description: "基于品牌定位与虚拟竞品数据，输出竞争结构、市场空白与切入建议。",
    schemaName: "mori_market_analysis",
    outputSchema: "MarketAnalysisSchema",
    changelog: "v1.0 初版；v1.1 增加 Price × Professional 矩阵解读；v1.2 要求区分 Insight / Opportunity / Risk / Recommendation。",
    body: `你是 MORI 森屿的市场与竞品分析师（Market Analyst）。

你的任务：把品牌信息与竞品数据，转换成可用于决策的竞争结构判断。

分析框架：
1. 价格 × 品牌专业度 的二维定位，判断 MORI 的相对位置与拥挤区间。
2. 竞品内容主题与广告主题的重复度，识别“大家都在说”的红海主题。
3. 竞品弱点（weakness）中可被 MORI 利用的结构性空隙。
4. 结合 MORI 的价位与人群，给出 1–2 个可立即测试的切入角度。

输出要求：
- competitiveGaps：至少 2 条，每条必须写清 gap（空白点）与 evidence（引用具体竞品字段）。
- positioningAdvice：一句话，说明 MORI 应该占住哪个位置，以及不要去哪里竞争。
- insights / opportunities / risks / recommendations：每个数组 2–3 条。

${SHARED_RULES}`,
  },
  {
    agent: "audience_analyst",
    name: "Audience Analyst",
    nameZh: "用户洞察分析师",
    version: "v1.3",
    description: "把 Persona 数据与分人群投放数据，转成内容机会与广告角度。",
    schemaName: "mori_audience_analysis",
    outputSchema: "AudienceAnalysisSchema",
    changelog: "v1.0 初版；v1.1 增加购买阻力字段；v1.2 引入分人群 CTR/CVR 对比；v1.3 增加 adAngles 输出。",
    body: `你是 MORI 森屿的用户洞察分析师（Audience Analyst）。

你的任务：把 Persona 画像 + 分人群投放表现，转成“可以马上做内容”的机会点。

分析要求：
1. 对每个人群回答四个问题：核心痛点是什么、为什么现在会买、为什么不买、什么内容能推动决策。
2. 用分人群 CTR / CVR 对比解释“兴趣”与“购买理由”之间的差距：高 CTR 低 CVR 的人群需要信任与价格解释；低 CTR 高 CVR 的人群需要更强的场景与钩子。
3. 严禁把年轻用户写成“冲动消费”，必须基于数据给出动机假设，并标明这是假设。

输出要求：
- personas：每个人群给出 painPoints / motivations / barriers / contentPreferences。
- adAngles：3 条以上，每条包含 angle、hook（可直接作为广告开头）、audience、rationale。
- insights / opportunities / risks / recommendations：每个数组 2–3 条。

${SHARED_RULES}`,
  },
  {
    agent: "content_strategist",
    name: "Content Strategist",
    nameZh: "内容策划专家",
    version: "v1.4",
    description: "按平台 / 内容类型 / 目标 / 主题生成可落地的小红书与短视频内容方案。",
    schemaName: "mori_content_strategy",
    outputSchema: "ContentStrategySchema",
    changelog: "v1.0 初版；v1.1 增加 TikTok 脚本时间轴；v1.2 增加评分字段；v1.3 增加“为什么值得测试”；v1.4 增加 15 秒脚本结构约束。",
    body: `你是 MORI 森屿的内容策划专家（Content Strategist）。

你的任务：根据平台、内容类型、投放目标与主题，产出可直接投放的内容方案。

平台规范：
- 小红书：真实用户口吻，5 个标题（不夸张、不承诺功效），正文 150–260 字，结尾有互动引导。
- 抖音：15 秒脚本，必须严格按 0–3s Hook / 3–8s 痛点 / 8–12s 解决方案 / 12–15s CTA 拆解。
- 公众号：结构化长文大纲 + 关键段落，偏知识与信任建设。

评分（0–100，请给出可解释的判断）：
- hookScore：前 3 秒 / 标题的抓取能力（是否具体、是否有场景冲突）。
- relevanceScore：与目标人群痛点及产品特性的相关度。
- conversionScore：推动下一步动作的能力（是否有明确的价值与低门槛）。
- brandFitScore：是否符合 MORI 克制、清爽、自然的品牌调性。

输出要求：
- 不要写医疗宣传、不要承诺效果、不要使用绝对化词汇。
- 每个标题都要给出 angle 与 whyItWorks。
- recommendations 中至少 1 条要指出该内容的测试方式（对照什么、看什么指标）。

输出完整性自检（最容易漏字段的地方，请逐项确认后再输出）：
- scores 必须包含全部 7 个字段：hookScore / relevanceScore / conversionScore / brandFitScore /
  overallScore / whyTest / howToImprove，一个都不能少。
- scores.howToImprove 不能省：用 1–2 句写清“改哪一句、加什么模块”，
  例如「把第 3–8 秒的痛点补上具体时间与动作，并在结尾加一条真实使用记录」。不要返回空字符串。
- scores.whyTest 同样不能省：写清“为什么这条内容值得测试”，引用指标或人群依据。
- xiaohongshu.titles 必须 5 条（每条含 title/angle/whyItWorks）；xiaohongshu.body 必须有正文；
  douyin.script 必须 4 段（0–3s / 3–8s / 8–12s / 12–15s），douyin.caption 不能为空。

${SHARED_RULES}`,
  },
  {
    agent: "creative_strategist",
    name: "Creative Strategist",
    nameZh: "广告素材策略师",
    version: "v1.2",
    description: "生成 5 个差异化广告素材方向，并给出测试优先级排序。",
    schemaName: "mori_creative_directions",
    outputSchema: "CreativeDirectionsSchema",
    changelog: "v1.0 初版；v1.1 增加测试优先级评分；v1.2 要求方向之间必须“结构性差异”，不能只是换文案。",
    body: `你是 MORI 森屿的广告素材策略师（Creative Strategist）。

你的任务：为指定平台 / 目标 / 人群 / 主题，产出 5 个差异化的素材方向（方向 A–E）。

差异化要求（5 个方向必须来自不同角度族）：
1. 场景痛点族（熬夜、通勤、空调房、宿舍）
2. 质地 / 肤感族（清爽、不黏、吸收快）
3. 价格与性价比族（单次成本、预算解释）
4. 信任与记录族（30 天记录、真实反馈）
5. 专业解释族（成分、配方逻辑）

每个方向必须给出：
- angle（角度名）、hook（开场 3 秒台词）、script（时间轴脚本）、cta、audience
- priorityScore（0–100，越高越先测）与 rationale（为什么先测它）

排序原则：优先测试“人群明确 + 场景具体 + 与现有高表现素材结构不同”的方向；不要只因为文案好听而提高优先级。

${SHARED_RULES}`,
  },
  {
    agent: "performance_analyst",
    name: "Performance Analyst",
    nameZh: "投放数据分析师",
    version: "v1.5",
    description: "基于投放数据与计算结果，诊断素材效率、渠道结构与预算去向。",
    schemaName: "mori_campaign_analysis",
    outputSchema: "CampaignAnalysisSchema",
    changelog: "v1.0 初版；v1.1 增加七窗口对比；v1.2 增加高/低效素材拆解；v1.3 增加预算调整建议；v1.4 增加假设与实验设计；v1.5 强制所有数字引用传入指标。",
    body: `你是 MORI 森屿的投放数据分析师（Performance Analyst）。

输入包含：账户总指标、时间趋势、渠道表现、素材排行、近 7 天 vs 前 7 天窗口对比、分人群表现，以及系统预计算的 signals。

诊断顺序（必须按此顺序思考）：
1. 量级：花费、曝光、点击是否发生结构性变化？
2. 流量效率：CTR、CPC 是否变化？（素材吸引力维度）
3. 承接效率：CVR、CPA 是否变化？（人群质量与落地页维度）
4. 结果效率：ROAS 变化主要由哪一环驱动？
5. 结构：渠道与素材的集中度是否带来风险？

输出要求：
- diagnosis：一句话结论，必须包含具体数值与方向。
- mainReason：指出最可能的主导环节，并说明为什么不是其他环节（用 CTR/CVR 的对比排除）。
- hypotheses：2–3 条，每条带 evidence 与 confidence；必须标注这是假设。
- winners / losers：至少各 2 条，给出 why 与 action（加预算 / 换 Hook / 暂停 / 保留观察）。
- budgetMoves：给出“从谁转给谁”的具体建议。
- experiments：至少 2 个实验，含 A/B 变体与主指标。

数据口径要求（本 Agent 最容易写成"既成事实"，务必检查）：
- 所有素材效率、预算与实验结论都要写成 Demo 口径，例如「Demo 数据显示…」「模拟实验结果显示…」；
  禁止出现「已完成实验」「已验证」「实际提升 X%」「上线后提升」这类表述。
- winners 的 action 只能写“建议（在模拟实验中）加预算/复制结构”，不得写成已经放量并取得结果。
- 历史 experiments 字段只代表模拟实验的推演状态，引用时必须写明「模拟实验结果（Demo 数据集）」。
- hypotheses 必须写清「若在真实投放中出现，需要用真实数据验证」。

输出长度控制（本 Agent 的返回体最大，必须控制篇幅，否则会被截断导致无效输出）：
- winners / losers：各 2–3 条，why 与 action 各不超过 50 字；不要复述原始数据表。
- hypotheses：2–3 条，每条 hypothesis/evidence 各不超过 60 字。
- budgetMoves：1–2 条，amount 用一句话写清金额或比例。
- experiments：2–3 条，每个字段不超过 40 字。
- insights / opportunities / risks / recommendations：每个数组 2–3 条，title 不超过 20 字，body 不超过 80 字。
- 仍然必须包含 Schema 中的全部字段（缺失任意字段都会判为无效输出）。

${SHARED_RULES}`,
  },
  {
    agent: "growth_advisor",
    name: "Growth Advisor",
    nameZh: "增长顾问",
    version: "v2.0",
    description: "像增长顾问一样回答业务问题：诊断 → 原因 → 假设 → 建议 → 实验。",
    schemaName: "mori_growth_advice",
    outputSchema: "GrowthAdviceSchema",
    changelog: "v2.0 重写：固定五段式结构（Diagnosis / Main Reason / Hypothesis / Recommendation / Experiment），并要求列出 dataUsed。",
    body: `你是 MORI 森屿的增长顾问（Growth Advisor）。

你掌握完整的业务上下文：品牌、产品、用户人群、竞品、投放数据、内容库与实验历史。

回答任何业务问题时，必须按以下结构输出：
1. diagnosis：用数据说明现在发生了什么（含具体数值）。
2. mainReason：最可能的主导原因，并解释如何排除其他解释。
3. hypothesis：2–3 条可验证的原因假设，每条带证据与置信度。
4. recommendation：1–3 条可执行动作，按优先级排序，写明责任动作与预期影响指标。
5. experiment：至少 1 个 A/B 实验，包含变体、主指标与成功标准。

其他要求：
- dataUsed：列出本次回答实际使用的数据来源（表 / 字段 / 时间窗）。
- 如果数据不足，必须明确说“数据不足”，并给出需要补充的数据，而不是编造结论。
- 用词克制、可执行，不要写成咨询报告式的空话。

数据口径要求：
- diagnosis / mainReason / recommendation 里引用实验或提升幅度时，必须写成「模拟实验结果（Demo 数据集）」
  或「基于模拟数据推演」，并说明「若在真实投放中复现，需要扩样验证」。
- 禁止出现「已完成实验」「已验证」「实际提升 X%」「真实用户实验证明」「带来收入增长」这类表述。
- dataUsed 中要包含一条数据口径说明，例如「Metric 表（Demo 数据集，模拟数据）」。

${SHARED_RULES}`,
  },
  {
    agent: "report_writer",
    name: "Report Writer",
    nameZh: "增长报告撰写",
    version: "v1.1",
    description: "把一周的经营数据、内容与投放表现，整理成可交付的增长周报。",
    schemaName: "mori_growth_report",
    outputSchema: "GrowthReportSchema",
    changelog: "v1.0 初版；v1.1 增加 Experiments 与下周建议的可执行格式。",
    body: `你是 MORI 森屿的增长报告撰写人（Report Writer）。

你的任务：把本周数据整理成一份可以直接发给团队的增长周报，结构固定为：
Executive Summary → Performance → Audience → Content → Campaign → Key Insights → Recommendations → Experiments。

写作要求：
- Executive Summary：3 句话说清“发生了什么 / 为什么 / 下周做什么”。
- Performance：引用系统实际计算出的指标（Demo 数据口径，含环比变化），不得写成真实业务成绩。
- 所有结论必须能追溯到数据；不确定的地方写“数据不足”。
- Recommendations 必须是可执行动作（谁、做什么、看什么指标、什么时候复盘）。
- Experiments：给出下周要跑的 A/B 实验、主指标与成功标准。
- 每一个章节的第一句都要标明数据口径（例如“Demo 数据显示……”），并在结尾注明
  “基于模拟业务数据验证产品工作流，不代表真实市场表现”。

${SHARED_RULES}`,
  },
];

export function getPromptTemplate(agent: AgentId): PromptTemplateDefinition {
  const template = PROMPT_LIBRARY.find((item) => item.agent === agent);
  if (!template) throw new Error(`Unknown agent: ${agent}`);
  return template;
}

export const AGENT_LABELS: Record<AgentId, { name: string; nameZh: string; scope: string }> = {
  market_analyst: { name: "Market Analyst", nameZh: "市场与竞品分析师", scope: "market" },
  audience_analyst: { name: "Audience Analyst", nameZh: "用户洞察分析师", scope: "audience" },
  content_strategist: { name: "Content Strategist", nameZh: "内容策划专家", scope: "content" },
  creative_strategist: { name: "Creative Strategist", nameZh: "广告素材策略师", scope: "creative" },
  performance_analyst: { name: "Performance Analyst", nameZh: "投放数据分析师", scope: "campaign" },
  growth_advisor: { name: "Growth Advisor", nameZh: "增长顾问", scope: "advisor" },
  report_writer: { name: "Report Writer", nameZh: "增长报告撰写", scope: "report" },
};
```

## `src/lib/report.ts`

```ts
import type { GrowthReport } from "@/lib/ai/schemas";

export type ReportMeta = {
  generatedAt: string;
  mode: string;
  model: string;
  promptVersion: string;
  dataLabel: string;
  agentNotes?: string;
};

export function reportToMarkdown(report: GrowthReport, meta: ReportMeta): string {
  const lines: string[] = [];
  lines.push(`# ${report.title}`);
  lines.push("");
  lines.push(
    `> 数据来源：${meta.dataLabel} ｜ 生成方式：${meta.mode === "ai" ? `AI (${meta.model})` : "Demo 结构化分析引擎"} ｜ Prompt ${meta.promptVersion} ｜ ${meta.generatedAt}`,
  );
  lines.push("");
  lines.push("## 1. Executive Summary");
  lines.push(report.executiveSummary);
  lines.push("");
  lines.push("## 2. Performance");
  lines.push(report.performance);
  lines.push("");
  lines.push("## 3. Audience");
  lines.push(report.audience);
  lines.push("");
  lines.push("## 4. Content");
  lines.push(report.content);
  lines.push("");
  lines.push("## 5. Campaign");
  lines.push(report.campaign);
  lines.push("");
  lines.push("## 6. Key Insights");
  report.keyInsights.forEach((insight, index) => {
    lines.push(`### 洞察 ${index + 1}：${insight.title}`);
    lines.push(insight.body);
    lines.push(`- 证据：${insight.evidence}`);
    lines.push(`- 置信度：${insight.confidence}/100`);
    lines.push("");
  });
  lines.push("## 7. Recommendations");
  report.recommendations.forEach((item) => lines.push(`- ${item}`));
  lines.push("");
  lines.push("## 8. Experiments");
  report.experiments.forEach((experiment) => {
    lines.push(`### ${experiment.name}`);
    lines.push(`- A：${experiment.variantA}`);
    lines.push(`- B：${experiment.variantB}`);
    lines.push(`- 主指标：${experiment.metric}`);
    lines.push(`- 成功标准：${experiment.successCriteria}`);
    lines.push("");
  });
  lines.push("## Outlook");
  lines.push(report.outlook);
  lines.push("");
  lines.push("---");
  lines.push("Demo / 模拟业务数据 — MORI AI Growth OS 作品集项目，不构成真实业务结论。");
  return lines.join("\n");
}

/** Line-by-line plain text used by the client-side PDF export. */
export function reportToTextLines(report: GrowthReport, meta: ReportMeta): Array<{ text: string; style: "title" | "h2" | "h3" | "body" | "bullet" | "muted" }> {
  const lines: Array<{ text: string; style: "title" | "h2" | "h3" | "body" | "bullet" | "muted" }> = [];
  lines.push({ text: report.title, style: "title" });
  lines.push({
    text: `数据来源：${meta.dataLabel} ｜ 生成方式：${meta.mode === "ai" ? `AI (${meta.model})` : "Demo 结构化分析引擎"} ｜ ${meta.generatedAt}`,
    style: "muted",
  });

  const section = (title: string, body: string) => {
    lines.push({ text: title, style: "h2" });
    body.split("\n").forEach((paragraph) => lines.push({ text: paragraph, style: "body" }));
  };

  section("1. Executive Summary", report.executiveSummary);
  section("2. Performance", report.performance);
  section("3. Audience", report.audience);
  section("4. Content", report.content);
  section("5. Campaign", report.campaign);

  lines.push({ text: "6. Key Insights", style: "h2" });
  report.keyInsights.forEach((insight) => {
    lines.push({ text: insight.title, style: "h3" });
    lines.push({ text: insight.body, style: "body" });
    lines.push({ text: `证据：${insight.evidence}（置信度 ${insight.confidence}/100）`, style: "muted" });
  });

  lines.push({ text: "7. Recommendations", style: "h2" });
  report.recommendations.forEach((item) => lines.push({ text: item, style: "bullet" }));

  lines.push({ text: "8. Experiments", style: "h2" });
  report.experiments.forEach((experiment) => {
    lines.push({ text: experiment.name, style: "h3" });
    lines.push({ text: `A：${experiment.variantA}`, style: "bullet" });
    lines.push({ text: `B：${experiment.variantB}`, style: "bullet" });
    lines.push({ text: `主指标：${experiment.metric}｜成功标准：${experiment.successCriteria}`, style: "bullet" });
  });

  section("Outlook", report.outlook);
  lines.push({
    text: "Demo / 模拟业务数据 — MORI AI Growth OS 作品集项目，不构成真实业务结论。",
    style: "muted",
  });
  return lines;
}

export function reportFromStoredPayload(payload: string): GrowthReport | null {
  try {
    const parsed = JSON.parse(payload) as GrowthReport;
    if (!parsed || typeof parsed !== "object" || !parsed.title) return null;
    return parsed;
  } catch {
    return null;
  }
}
```

## `src/lib/statistics.ts`

```ts
import { safeDivide } from "@/lib/metrics";

/**
 * Two-proportion z-test used by the Experiment Lab to decide whether a
 * difference between variants is meaningful or still inside noise.
 */
export type ProportionTest = {
  rateA: number;
  rateB: number;
  lift: number;
  zScore: number;
  pValue: number;
  significant: boolean;
  confidence: number;
  winner: "A" | "B" | "tie";
  note: string;
};

export function twoProportionZTest(
  successesA: number,
  trialsA: number,
  successesB: number,
  trialsB: number,
  alpha = 0.05,
): ProportionTest {
  const rateA = safeDivide(successesA, trialsA);
  const rateB = safeDivide(successesB, trialsB);
  const pool = safeDivide(successesA + successesB, trialsA + trialsB);

  if (trialsA === 0 || trialsB === 0) {
    return {
      rateA,
      rateB,
      lift: 0,
      zScore: 0,
      pValue: 1,
      significant: false,
      confidence: 0,
      winner: "tie",
      note: "样本不足，无法判断显著性（存在 0 曝光变体）。",
    };
  }

  const standardError = Math.sqrt(pool * (1 - pool) * (1 / trialsA + 1 / trialsB));
  const zScore = standardError === 0 ? 0 : (rateB - rateA) / standardError;
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)));
  const significant = pValue < alpha && Number.isFinite(pValue);
  const lift = rateA === 0 ? 0 : ((rateB - rateA) / rateA) * 100;

  let winner: ProportionTest["winner"] = "tie";
  if (significant) winner = rateB > rateA ? "B" : "A";

  return {
    rateA,
    rateB,
    lift,
    zScore,
    pValue,
    significant,
    confidence: Number(((1 - pValue) * 100).toFixed(1)),
    winner,
    note: significant
      ? `差异显著（p=${pValue.toFixed(4)}），可以按 ${winner} 变体进入下一阶段。`
      : `差异未达显著（p=${pValue.toFixed(4)}），需要更多样本再判断。`,
  };
}

/** Abramowitz & Stegun 7.1.26 approximation of the error function. */
function erf(x: number) {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * absX);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function normalCdf(x: number) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

/** Minimum sample size per variant for a detectable relative lift. */
export function requiredSampleSize(baselineRate: number, relativeLift: number, power = 0.8, alpha = 0.05) {
  if (baselineRate <= 0 || relativeLift <= 0) return null;
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + relativeLift);
  const zAlpha = alpha === 0.05 ? 1.959964 : 1.644854;
  const zBeta = power === 0.8 ? 0.841621 : 1.281552;
  const pooled = (p1 + p2) / 2;
  const numerator = (zAlpha * Math.sqrt(2 * pooled * (1 - pooled)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2;
  const denominator = (p2 - p1) ** 2;
  return Math.ceil(numerator / denominator);
}
```

## `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, options?: { digits?: number; compact?: boolean }) {
  const digits = options?.digits ?? 0;
  if (!Number.isFinite(value)) return "—";
  if (options?.compact) {
    if (Math.abs(value) >= 100_000_000) return `¥${(value / 100_000_000).toFixed(2)}亿`;
    if (Math.abs(value) >= 10_000) return `¥${(value / 10_000).toFixed(1)}万`;
  }
  return `¥${value.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatNumber(value: number, digits = 0) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}亿`;
  if (Math.abs(value) >= 10_000) return `${(value / 10_000).toFixed(1)}万`;
  return formatNumber(value);
}

/** Accepts a ratio (0.0177) and renders it as a percentage string. */
export function formatPercent(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatRatio(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

export function formatSigned(value: number, digits = 1, suffix = "%") {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(digits)}${suffix}`;
}

export function formatDateLabel(input: Date | string, withYear = false) {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return withYear ? `${date.getUTCFullYear()}-${pad(month)}-${pad(day)}` : `${pad(month)}-${pad(day)}`;
}

export function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

export function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function dayKey(input: Date | string) {
  const date = typeof input === "string" ? new Date(input) : input;
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Percentage change between two numbers, guarded against division by zero. */
export function pctChange(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function safeJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    return [];
  } catch {
    return value
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export function toJsonArray(value: string[] | string): string {
  if (Array.isArray(value)) return JSON.stringify(value);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? value : JSON.stringify([value]);
  } catch {
    return JSON.stringify([value]);
  }
}

export function truncate(value: string, max = 120) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Scrubs anything that looks like a credential before it can reach a log line,
 * an API response or the UI. Used by the AI provider client and by the shared
 * API error handler, so a provider error body can never leak a key.
 */
const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/\b(sk-[A-Za-z0-9_-]{6,})/g, "sk-***"],
  [/\b(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi, "$1***"],
  [/\b(api[-_]?key|apikey|authorization|access[-_]?token|secret)\b(\s*[:=]\s*)["']?[A-Za-z0-9._~+/=-]{8,}["']?/gi, "$1$2***"],
  [/\b([A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})\b/g, "***jwt***"],
];

export function redactSecrets(input: unknown): string {
  const text = typeof input === "string" ? input : input instanceof Error ? input.message : String(input ?? "");
  return SECRET_PATTERNS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}
```

## `src/types/index.ts`

```ts
/**
 * Shared domain types for MORI AI Growth OS.
 *
 * Everything in this project is DEMO / 模拟业务数据 for a fictional brand.
 */

export type MetricRow = {
  date: Date | string;
  platform: string;
  campaign: string;
  creative: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
};

export type DerivedMetrics = {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  /** click-through rate, 0-1 */
  ctr: number;
  /** cost per click, currency */
  cpc: number;
  /** conversion rate, 0-1 */
  cvr: number;
  /** cost per acquisition, currency */
  cpa: number;
  /** return on ad spend, multiple */
  roas: number;
};

export type DailyPoint = DerivedMetrics & {
  date: string;
};

export type GroupedPerformance = DerivedMetrics & {
  name: string;
  share: number;
  spendShare: number;
  /** extra context for tables */
  platform?: string;
  campaign?: string;
  creative?: string;
};

export type CreativeScorecard = GroupedPerformance & {
  ctrIndex: number;
  roasIndex: number;
};

export type SignalCategory = "insight" | "opportunity" | "risk" | "recommendation";

export type Signal = {
  title: string;
  body: string;
  evidence: string;
  confidence: number;
};

export type SignalBundle = {
  insights: Signal[];
  opportunities: Signal[];
  risks: Signal[];
  recommendations: Signal[];
};

export type AgentId =
  | "market_analyst"
  | "audience_analyst"
  | "content_strategist"
  | "creative_strategist"
  | "performance_analyst"
  | "growth_advisor"
  | "report_writer";

export type RunMode = "demo" | "ai" | "fallback";

export type AgentRunMeta = {
  mode: RunMode;
  agent: AgentId;
  model: string;
  promptVersion: string;
  latencyMs: number;
  warning?: string;
  generatedAt: string;
};

export type AgentRunResult<T> = {
  data: T;
  meta: AgentRunMeta;
};

export type PersonaRecord = {
  id: string;
  code: string;
  name: string;
  ageBand: string;
  occupation: string;
  city: string;
  share: number;
  painPoints: string[];
  motivations: string[];
  contentPreferences: string[];
  purchaseDrivers: string[];
  barriers: string[];
  channels: string[];
  quote: string;
  accent: string;
};

export type CompetitorRecord = {
  id: string;
  name: string;
  positioning: string;
  price: number;
  priceTier: string;
  professional: number;
  audience: string;
  contentThemes: string[];
  mainChannels: string[];
  adThemes: string[];
  strength: string;
  weakness: string;
  colorToken: string;
  isSelf: boolean;
};

export type BrandRecord = {
  id: string;
  name: string;
  nameEn: string;
  positioning: string;
  description: string;
  productName: string;
  priceRange: string;
  targetAudience: string;
  channels: string[];
  keywords: string[];
};

export type ProductRecord = {
  id: string;
  brandName: string;
  name: string;
  category: string;
  positioning: string;
  price: number;
  volume: string;
  keyBenefits: string[];
  sellingPoints: string[];
  usageScenario: string[];
  credibility: string[];
};

export type CampaignRecord = {
  id: string;
  name: string;
  objective: string;
  platform: string;
  status: string;
  budget: number;
  startDate: Date | string;
  endDate: Date | string;
  note: string;
};

export type CreativeRecord = {
  id: string;
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
  targetCtr: number;
  targetRoas: number;
};

export type ContentRecord = {
  id: string;
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
};

export type ExperimentVariantRecord = {
  id: string;
  label: string;
  name: string;
  description: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  isWinner: boolean;
};

export type ExperimentRecord = {
  id: string;
  name: string;
  hypothesis: string;
  goal: string;
  primaryMetric: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  summary: string;
  aiRecommendation: string;
  mode: string;
  variants: ExperimentVariantRecord[];
};

export type DatasetRecord = {
  id: string;
  name: string;
  source: string;
  rowCount: number;
  note: string;
  createdAt: Date | string;
};

export type InsightRecord = {
  id: string;
  scope: string;
  category: string;
  title: string;
  body: string;
  evidence: string;
  confidence: number;
  agent: string;
  mode: string;
};
```

## `start-mori.cmd`

```bat
@echo off
rem ---------------------------------------------------------------------------
rem MORI AI Growth OS - one-click dev server for Windows
rem
rem 1) If something is already listening on port 3000, just open the browser.
rem 2) Otherwise start the dev server and open http://localhost:3000 after 9s.
rem 3) Uses the system npm when available, otherwise the Codex bundled pnpm.
rem
rem NOTE: keep this window open; closing it stops the server (browser will
rem show "connection refused").
rem (This file is intentionally ASCII-only: cmd.exe decodes .cmd as GBK on
rem  Chinese Windows and non-ASCII comments can break the parser.)
rem ---------------------------------------------------------------------------
setlocal
cd /d "%~dp0"
set NEXT_TELEMETRY_DISABLED=1

rem --- already running? just open the browser ---
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if %errorlevel%==0 (
  echo [MORI] service already running - opening browser ...
  start "" http://localhost:3000
  goto :eof
)

echo [MORI] starting MORI AI Growth OS ...
echo [MORI] browser will open automatically at http://localhost:3000 - keep this window open.
start "" /b powershell -NoProfile -Command "Start-Sleep -Seconds 9; Start-Process 'http://localhost:3000'"

where npm >nul 2>nul
if %errorlevel%==0 (
  echo [MORI] using system npm ...
  call npm run dev
  goto :eof
)

set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "PNPM_CJS=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs"

if not exist "%NODE_EXE%" (
  echo [MORI] Node.js not found. Please install Node.js LTS from https://nodejs.org/ and run: npm install ^&^& npm run db:setup ^&^& npm run dev
  pause
  goto :eof
)

echo [MORI] npm not found - using bundled pnpm runtime ...
echo [MORI] open http://localhost:3000 after "Ready" appears. Press Ctrl+C to stop.
"%NODE_EXE%" "%PNPM_CJS%" exec next dev -p 3000
pause
```

## `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          line: "rgb(var(--line) / <alpha-value>)",
        },
        moss: {
          DEFAULT: "rgb(var(--moss) / <alpha-value>)",
          strong: "rgb(var(--moss-strong) / <alpha-value>)",
          soft: "rgb(var(--moss-soft) / <alpha-value>)",
        },
        clay: {
          DEFAULT: "rgb(var(--clay) / <alpha-value>)",
          soft: "rgb(var(--clay-soft) / <alpha-value>)",
        },
        tone: {
          good: "rgb(var(--tone-good) / <alpha-value>)",
          warn: "rgb(var(--tone-warn) / <alpha-value>)",
          bad: "rgb(var(--tone-bad) / <alpha-value>)",
          info: "rgb(var(--tone-info) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Palatino",
          "Georgia",
          "Songti SC",
          "Source Han Serif SC",
          "Noto Serif SC",
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(30,35,32,0.04), 0 8px 24px -16px rgba(30,35,32,0.18)",
        lift: "0 2px 4px rgba(30,35,32,0.05), 0 18px 40px -24px rgba(30,35,32,0.28)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

## `tests/ai-deepseek.test.ts`

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { callStructured, getAiConfig } from "@/lib/ai/client";
import { jsonSchemaPromptHint, zodToJsonSchema } from "@/lib/ai/json-schema";

// 运行时拼接，避免仓库出现完整 Key 形态（内容依旧是假值）
const DEEPSEEK_KEY = ["sk", "deepseek", "test", "not", "a", "real", "key"].join("-");
const OPENAI_KEY = ["sk", "openai", "test", "not", "a", "real", "key"].join("-");

const ProbeSchema = z.object({ ok: z.boolean() });

function mockFetch(responder: (call: { body: Record<string, unknown> }, index: number) => { status?: number; json?: unknown; text?: string }) {
  const calls: Array<{ body: Record<string, unknown>; headers: Record<string, string> }> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      calls.push({ body, headers: (init?.headers ?? {}) as Record<string, string> });
      const result = responder({ body }, calls.length - 1);
      const status = result.status ?? 200;
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => result.json ?? {},
        text: async () => result.text ?? "{}",
      } as unknown as Response;
    }),
  );
  return calls;
}

function completion(content: string) {
  return { choices: [{ message: { content }, finish_reason: "stop" }] };
}

function clearAiEnv() {
  [
    "AI_PROVIDER",
    "AI_API_KEY",
    "DEEPSEEK_API_KEY",
    "OPENAI_API_KEY",
    "AI_BASE_URL",
    "AI_MODEL",
    "OPENAI_BASE_URL",
    "OPENAI_MODEL",
    "DEMO_MODE",
  ].forEach((name) => delete process.env[name]);
}

beforeEach(() => {
  clearAiEnv();
  process.env.DEMO_MODE = "false";
});

afterEach(() => {
  vi.unstubAllGlobals();
  clearAiEnv();
});

describe("DeepSeek provider preset", () => {
  it("sends the DeepSeek key in the Authorization header (not a leftover OPENAI_API_KEY)", async () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    process.env.OPENAI_API_KEY = OPENAI_KEY; // stale value from another provider
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));

    await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(calls[0].headers.Authorization).toBe(`Bearer ${DEEPSEEK_KEY}`);
    expect(calls[0].headers.Authorization).not.toContain(OPENAI_KEY);
  });

  it("uses the OpenAI key when the OpenAI preset is active", async () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = OPENAI_KEY;
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));

    await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(calls[0].headers.Authorization).toBe(`Bearer ${OPENAI_KEY}`);
  });

  it("never sends an empty bearer token when no key is configured", async () => {
    process.env.AI_PROVIDER = "deepseek";
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));
    await expect(
      callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" }),
    ).rejects.toMatchObject({ code: "MISSING_API_KEY" });
    expect(calls).toHaveLength(0);
  });

  it("resolves base URL, model and key env var from AI_PROVIDER=deepseek", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;

    const config = getAiConfig();

    expect(config.providerId).toBe("deepseek");
    expect(config.provider).toBe("DeepSeek");
    expect(config.baseUrl).toBe("https://api.deepseek.com");
    expect(config.model).toBe("deepseek-flash");
    expect(config.enabled).toBe(true);
    expect(config.keySource).toBe("DEEPSEEK_API_KEY");
    expect(config.supportsJsonSchema).toBe(false);
    expect(config.reason).toContain("DeepSeek");
  });

  it("ignores stale OPENAI_* values once AI_PROVIDER is set", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    process.env.OPENAI_BASE_URL = "http://127.0.0.1:8787/v1";
    process.env.OPENAI_MODEL = "gpt-4o-mini";

    const config = getAiConfig();

    expect(config.baseUrl).toBe("https://api.deepseek.com");
    expect(config.model).toBe("deepseek-flash");
  });

  it("lets AI_BASE_URL / AI_MODEL override the preset", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    process.env.AI_BASE_URL = "https://api.deepseek.com/v1";
    process.env.AI_MODEL = "deepseek-chat";

    const config = getAiConfig();

    expect(config.baseUrl).toBe("https://api.deepseek.com/v1");
    expect(config.model).toBe("deepseek-chat");
  });

  it("prefers DEEPSEEK_API_KEY over OPENAI_API_KEY, and AI_API_KEY over both", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.OPENAI_API_KEY = OPENAI_KEY;
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    expect(getAiConfig().keySource).toBe("DEEPSEEK_API_KEY");

    process.env.AI_API_KEY = "generic-key-value";
    expect(getAiConfig().keySource).toBe("AI_API_KEY");
  });

  it("falls back to demo when no key is configured", () => {
    process.env.AI_PROVIDER = "deepseek";
    const config = getAiConfig();
    expect(config.enabled).toBe(false);
    expect(config.reason).toContain("DEEPSEEK_API_KEY");
  });

  it("never exposes the key value through the config object", () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const serialized = JSON.stringify(getAiConfig());
    expect(serialized).not.toContain(DEEPSEEK_KEY);
    expect(serialized).not.toContain("sk-");
  });

  it("still honours DEMO_MODE=true regardless of provider settings", () => {
    process.env.DEMO_MODE = "true";
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const config = getAiConfig();
    expect(config.demoMode).toBe(true);
    expect(config.enabled).toBe(false);
  });
});

describe("DeepSeek request compatibility", () => {
  it("starts at json_object (no wasted strict json_schema attempt) and injects the schema into the prompt", async () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.mode).toBe("json_object");
    expect(calls).toHaveLength(1);
    expect((calls[0].body.response_format as { type: string }).type).toBe("json_object");
    const systemPrompt = (calls[0].body.messages as Array<{ content: string }>)[0].content;
    expect(systemPrompt).toContain("json");
    expect(systemPrompt).toContain("additionalProperties");
    // DeepSeek 官方支持 temperature(0-2)，首个请求会带上配置值；
    // 一旦上游报错，降级重试会自动去掉这些可选参数（见下一个用例）。
    expect(calls[0].body.temperature).toBe(0.4);
  });

  it("keeps the json_schema-first behaviour for providers that support it", async () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = OPENAI_KEY;
    const calls = mockFetch(() => ({ json: completion('{"ok":true}') }));

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.mode).toBe("json_schema");
    expect((calls[0].body.response_format as { type: string }).type).toBe("json_schema");
  });

  it("recovers when DeepSeek returns empty content once (known JSON Output quirk)", async () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const calls = mockFetch((_call, index) =>
      index === 0 ? { json: completion("") } : { json: completion('{"ok":true}') },
    );

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.output).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
    expect(calls[1].body.response_format).toBeUndefined();
  });

  it("degrades to a fully untyped request if json_object is rejected too", async () => {
    process.env.AI_PROVIDER = "deepseek";
    process.env.DEEPSEEK_API_KEY = DEEPSEEK_KEY;
    const calls = mockFetch((_call, index) =>
      index === 0
        ? { status: 400, text: '{"error":{"message":"response_format is not supported"}}' }
        : { json: completion('{"ok":true}') },
    );

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.mode).toBe("plain");
    expect(calls).toHaveLength(2);
    expect(calls[1].body.response_format).toBeUndefined();
  });
});

describe("DeepSeek prompt hint", () => {
  it("contains the literal word json and the strict-safe schema", () => {
    const hint = jsonSchemaPromptHint(ProbeSchema, "mori_connectivity_probe");
    expect(hint).toContain("json");
    expect(hint).toContain("mori_connectivity_probe");
    expect(hint).toContain("additionalProperties");
    expect(hint).not.toContain('"minimum"');
  });

  it("still produces a schema that zod can validate against", () => {
    const schema = zodToJsonSchema(ProbeSchema) as { required: string[] };
    expect(schema.required).toEqual(["ok"]);
    expect(ProbeSchema.safeParse({ ok: "yes" }).success).toBe(false);
  });
});
```

## `tests/ai-demo-wording.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { contextToPromptPayload } from "@/lib/ai/context";
import { demoFor } from "@/lib/ai/runner";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";
import { buildDemoExperiments } from "@/lib/demo-data";
import { evaluateExperiment, type VariantMetrics } from "@/lib/experiments";
import { PROMPT_LIBRARY } from "@/lib/prompts";
import type { AgentId } from "@/types";

import { buildTestContext } from "./helpers/context";

const context = buildTestContext();
const AGENTS = Object.keys(AGENT_SCHEMAS) as AgentId[];

/** 把模拟数据说成既成事实的表述，任何 AI 输出里都不允许出现。 */
const BANNED_PHRASES = [
  "已完成实验",
  "实验已完成",
  "已验证",
  "实测验证",
  "实际提升",
  "真实投放验证",
  "真实用户实验",
  "收入增长",
  "营收提升",
  "带来 ",
];

const DEMO_QUALIFIERS = ["模拟", "Demo", "demo"];

function payloadFor(agent: AgentId) {
  return demoFor(agent, {
    context,
    question: "最近 ROAS 为什么下降？",
    contentSelection: {
      platform: "小红书",
      contentType: "种草",
      goal: "转化",
      topic: "熬夜修护",
      audience: context.personas[0]?.name ?? "熬夜型都市新人",
    },
    creativeSelection: { platform: "抖音", objective: "转化", audience: "23 岁熬夜女性", theme: "夜间修护" },
  });
}

describe("prompt 层：模拟数据表述规范", () => {
  it("把数据真实性规范追加到全部 7 个 Agent 的 Prompt", () => {
    expect(PROMPT_LIBRARY).toHaveLength(7);
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.body).toContain("数据真实性与表述规范");
      expect(template.body).toContain("模拟实验结果");
      expect(template.body).toContain("Demo 数据显示");
      expect(template.body).toContain("基于模拟数据推演");
      expect(template.body).toContain("已完成实验");
      expect(template.body).toContain("需要真实数据验证");
      expect(template.body).toContain("基于上传的投放数据");
    });
  });

  it("禁止 AI 声称真实商业成绩与真实实验结论", () => {
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.body).toMatch(/禁止[\s\S]*真实投放/);
      expect(template.body).toMatch(/禁止[\s\S]*收入增长|禁止[\s\S]*真实商业成绩/);
      expect(template.body).toContain("running / completed");
    });
  });
});

describe("Demo 引擎输出：不能把模拟说成既成事实", () => {
  it("7 个 Agent 的输出都带模拟数据口径，且不含风险表述", () => {
    AGENTS.forEach((agent) => {
      const text = JSON.stringify(payloadFor(agent));
      expect(DEMO_QUALIFIERS.some((qualifier) => text.includes(qualifier))).toBe(true);
      BANNED_PHRASES.forEach((phrase) => {
        expect(text, `${agent} 不应包含「${phrase}」`).not.toContain(phrase);
      });
    });
  });

  it("投放分析与增长顾问结论以数据口径前缀开头", () => {
    const campaign = payloadFor("performance_analyst") as { diagnosis: string; mainReason: string };
    expect(campaign.diagnosis.startsWith("（Demo / 模拟业务数据）")).toBe(true);
    expect(campaign.mainReason.startsWith("（Demo / 模拟业务数据）")).toBe(true);

    const advice = payloadFor("growth_advisor") as { diagnosis: string; mainReason: string };
    expect(advice.diagnosis.startsWith("（Demo / 模拟业务数据）")).toBe(true);
    expect(advice.mainReason.startsWith("（Demo / 模拟业务数据）")).toBe(true);
  });

  it("周报每个章节都标明 Demo 口径", () => {
    const report = payloadFor("report_writer") as {
      executiveSummary: string;
      performance: string;
      audience: string;
      content: string;
      campaign: string;
      outlook: string;
    };
    [report.executiveSummary, report.performance, report.audience, report.content, report.campaign].forEach(
      (section) => {
        expect(section.startsWith("（Demo / 模拟业务数据）")).toBe(true);
      },
    );
    expect(report.outlook).toContain("模拟业务数据");
  });
});

describe("实验数据字段与结论表述", () => {
  it("预置实验文案改写为模拟口径，但实验数据本身保留不变", () => {
    const experiments = buildDemoExperiments();
    expect(experiments).toHaveLength(3);

    experiments.forEach((experiment) => {
      const text = `${experiment.summary} ${experiment.aiRecommendation}`;
      expect(DEMO_QUALIFIERS.some((qualifier) => text.includes(qualifier))).toBe(true);
      BANNED_PHRASES.forEach((phrase) => {
        expect(text).not.toContain(phrase);
      });
      // 数据没有被删除：A/B 变体的指标仍然完整
      expect(experiment.variants).toHaveLength(2);
      experiment.variants.forEach((variant) => {
        expect(variant.impressions).toBeGreaterThan(0);
        expect(variant.clicks).toBeGreaterThan(0);
      });
    });

    // 之前会误导的那条文案的具体指标必须保持原值（只改表述，不改数据）
    const priceExperiment = experiments.find((experiment) => experiment.name.includes("价格解释"));
    expect(priceExperiment?.variants[1].conversions).toBe(214);
    expect(priceExperiment?.variants[0].conversions).toBe(176);
  });

  it("统计检验生成的结论带模拟口径，且不再出现「实际提升」", () => {
    const [a, b] = buildDemoExperiments()[0].variants;
    const toVariant = (label: string, variant: typeof a): VariantMetrics => ({
      label,
      name: variant.name,
      description: variant.description,
      impressions: variant.impressions,
      clicks: variant.clicks,
      conversions: variant.conversions,
      spend: variant.spend,
      revenue: variant.revenue,
    });

    const evaluation = evaluateExperiment(toVariant("A", a), toVariant("B", b), "cvr");
    expect(evaluation.recommendation).toContain("基于模拟数据（Demo 数据集）");
    expect(evaluation.recommendation).toContain("模拟实验");
    expect(evaluation.recommendation).not.toContain("实际提升");
    BANNED_PHRASES.forEach((phrase) => {
      expect(evaluation.recommendation).not.toContain(phrase);
    });
  });

  it("送进模型的业务上下文显式标注了数据来源与模拟属性", () => {
    const payload = contextToPromptPayload({ context, question: "test" }) as unknown as {
      dataSource: { kind: string; simulated: boolean; notice: string };
      experiments: Array<{ simulated: boolean; statusNote: string; summary: string }>;
    };

    expect(payload.dataSource.kind).toBe("demo");
    expect(payload.dataSource.simulated).toBe(true);
    expect(payload.dataSource.notice).toContain("模拟");
    expect(payload.experiments.length).toBeGreaterThan(0);
    payload.experiments.forEach((experiment) => {
      expect(experiment.simulated).toBe(true);
      expect(experiment.statusNote).toContain("模拟实验");
    });
  });

  it("上传数据集时改用「基于上传的投放数据」口径", () => {
    const uploadContext = {
      ...context,
      dataSource: { kind: "upload" as const, label: "上传数据集：demo.csv", rows: 120 },
    };
    const payload = contextToPromptPayload({ context: uploadContext }) as unknown as {
      dataSource: { simulated: boolean; notice: string };
    };
    expect(payload.dataSource.simulated).toBe(false);
    expect(payload.dataSource.notice).toContain("基于上传的投放数据");
  });
});
```

## `tests/ai-provider.test.ts`

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AiProviderError, callStructured, getAiConfig } from "@/lib/ai/client";
import { stripUnsupportedForStrict, zodToJsonSchema, zodToStructuredOutputFormat } from "@/lib/ai/json-schema";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";
import { redactSecrets } from "@/lib/utils";
import type { AgentId } from "@/types";

const AGENTS = Object.keys(AGENT_SCHEMAS) as AgentId[];
// 运行时拼出"看起来像 Key"的字符串：既能验证脱敏逻辑，又不会让仓库里的
// 源码/打包产物命中密钥扫描器（也不含任何真实凭证）。
const FAKE_KEY = ["sk", "test", "not", "a", "real", "key", "0000"].join("-");

type FetchCall = { url: string; body: Record<string, unknown> };

function mockFetch(responder: (call: FetchCall, index: number) => { status?: number; json?: unknown; text?: string }) {
  const calls: FetchCall[] = [];
  const stub = vi.fn(async (url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    calls.push({ url: String(url), body });
    const result = responder({ url: String(url), body }, calls.length - 1);
    const status = result.status ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => result.json ?? {},
      text: async () => result.text ?? JSON.stringify(result.json ?? {}),
    } as unknown as Response;
  });
  vi.stubGlobal("fetch", stub);
  return calls;
}

function completion(content: string, finishReason = "stop") {
  return { choices: [{ message: { content }, finish_reason: finishReason }] };
}

const ProbeSchema = z.object({ ok: z.boolean(), score: z.number().min(0).max(100) });

beforeEach(() => {
  process.env.DEMO_MODE = "false";
  process.env.OPENAI_API_KEY = FAKE_KEY;
  process.env.OPENAI_BASE_URL = "https://provider.invalid/v1";
  process.env.OPENAI_MODEL = "test-model";
  delete process.env.AI_TEMPERATURE;
  delete process.env.AI_MAX_TOKENS;
  delete process.env.AI_REQUEST_TIMEOUT_MS;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.DEMO_MODE;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_BASE_URL;
  delete process.env.OPENAI_MODEL;
  delete process.env.AI_TEMPERATURE;
  delete process.env.AI_MAX_TOKENS;
});

describe("strict structured output payload", () => {
  it("never sends JSON Schema keywords that strict mode rejects", () => {
    AGENTS.forEach((agent) => {
      const payload = JSON.stringify(zodToStructuredOutputFormat(AGENT_SCHEMAS[agent], "schema"));
      ["minimum", "maximum", "minLength", "maxLength", "pattern", "format", "default"].forEach((keyword) => {
        expect(payload).not.toContain(`"${keyword}"`);
      });
      expect(payload).toContain('"additionalProperties":false');
      expect(payload).toContain('"strict":true');
    });
  });

  it("keeps object/array/enum structure intact while stripping constraints", () => {
    const schema = zodToJsonSchema(AGENT_SCHEMAS.market_analyst) as {
      required: string[];
      properties: Record<string, { type: string; items?: { type: string } }>;
    };
    expect(schema.required).toContain("insights");
    expect(schema.properties.insights.type).toBe("array");
    expect(schema.properties.insights.items?.type).toBe("object");

    const stripped = stripUnsupportedForStrict({ type: "number", minimum: 0, maximum: 100, description: "keep me" });
    expect(stripped).toEqual({ type: "number", description: "keep me" });
  });

  it("still enforces numeric ranges through zod validation", () => {
    const tooBig = AGENT_SCHEMAS.growth_advisor.safeParse({
      question: "q",
      diagnosis: "d",
      mainReason: "r",
      hypotheses: [{ hypothesis: "h", evidence: "e", confidence: 999 }],
      recommendation: ["a"],
      experiment: { name: "n", variantA: "a", variantB: "b", metric: "cvr", successCriteria: "s" },
      dataUsed: ["Metric"],
      insights: [],
      opportunities: [],
      risks: [],
      recommendations: [],
    });
    expect(tooBig.success).toBe(false);
  });
});

describe("secret redaction", () => {
  it("scrubs keys, bearer tokens and jwt-like strings", () => {
    const text = `failed with ${FAKE_KEY} / Bearer abcdef1234567890 / api_key=deadbeefdeadbeef / eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcdefghijkl`;
    const safe = redactSecrets(text);
    expect(safe).not.toContain(FAKE_KEY);
    expect(safe).not.toContain("abcdef1234567890");
    expect(safe).not.toContain("deadbeefdeadbeef");
    expect(safe).toContain("sk-***");
  });

  it("never leaks the key through a provider error message", async () => {
    mockFetch(() => ({ status: 401, text: `Incorrect API key provided: ${FAKE_KEY}` }));
    try {
      await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
      throw new Error("should have thrown");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).not.toContain(FAKE_KEY);
      expect(message).toContain("sk-***");
    }
  });
});

describe("real AI mode request behaviour", () => {
  it("uses json_schema strict mode first and returns the parsed result", async () => {
    const calls = mockFetch(() => ({ json: completion('{"ok":true,"score":88}') }));
    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
    expect(result.mode).toBe("json_schema");
    expect(result.output).toEqual({ ok: true, score: 88 });
    expect(calls).toHaveLength(1);
    const responseFormat = calls[0].body.response_format as { type: string; json_schema: { strict: boolean } };
    expect(responseFormat.type).toBe("json_schema");
    expect(responseFormat.json_schema.strict).toBe(true);
    expect(calls[0].body.temperature).toBe(0.4);
  });

  it("degrades to json_object when the provider rejects json_schema (keeps zod validation)", async () => {
    const calls = mockFetch((_call, index) =>
      index === 0
        ? { status: 400, text: '{"error":{"message":"response_format json_schema is not supported by this model"}}' }
        : { json: completion("```json\n{\"ok\":true,\"score\":75}\n```") },
    );

    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "S", userPrompt: "U" });

    expect(result.mode).toBe("json_object");
    expect(result.output.score).toBe(75);
    expect(calls).toHaveLength(2);
    expect((calls[1].body.response_format as { type: string }).type).toBe("json_object");
    expect(calls[1].body.temperature).toBeUndefined();
    // the JSON Schema is injected into the system prompt so the shape is still known
    const messages = calls[1].body.messages as Array<{ role: string; content: string }>;
    expect(messages[0].content).toContain("additionalProperties");
  });

  it("omits temperature when AI_TEMPERATURE=default (reasoning models reject it)", async () => {
    process.env.AI_TEMPERATURE = "default";
    const calls = mockFetch(() => ({ json: completion('{"ok":true,"score":60}') }));
    await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
    expect(calls[0].body).not.toHaveProperty("temperature");
  });

  it("accepts JSON wrapped in prose by extracting the object", async () => {
    mockFetch(() => ({ json: completion('Sure! Here is the data:\n{"ok":false,"score":10}\nHope it helps.') }));
    const result = await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
    expect(result.output).toEqual({ ok: false, score: 10 });
  });

  it("reports truncation explicitly instead of a misleading JSON error", async () => {
    mockFetch(() => ({ json: completion('{"ok":tru', "length") }));
    await expect(
      callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" }),
    ).rejects.toMatchObject({ code: "TRUNCATED" });
  });

  it("does not retry when the model refuses", async () => {
    const calls = mockFetch(() => ({ json: { choices: [{ message: { refusal: "I can't help with that." }, finish_reason: "stop" }] } }));
    await expect(
      callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" }),
    ).rejects.toMatchObject({ code: "REFUSED" });
    expect(calls).toHaveLength(1);
  });

  it("repairs a schema-breaking payload (out-of-range number) and stays bounded", async () => {
    const calls = mockFetch((_call, index) =>
      index < 2 ? { json: completion('{"ok":true,"score":999}') } : { json: completion('{"ok":true,"score":42}') },
    );

    const result = await callStructured({
      schema: ProbeSchema,
      schemaName: "probe",
      systemPrompt: "s",
      userPrompt: "u",
    });

    expect(result.output).toEqual({ ok: true, score: 42 });
    // attempt 1 + one repair attempt = 2 calls, and the repair note names the field
    expect(calls.length).toBeLessThanOrEqual(3);
    const messages = calls[1].body.messages as Array<{ content: string }>;
    expect(messages[0].content).toContain("score");
  });

  it("throws MISSING_API_KEY before ever calling the network", async () => {
    process.env.OPENAI_API_KEY = "";
    const calls = mockFetch(() => ({ json: completion("{}") }));
    await expect(
      callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" }),
    ).rejects.toMatchObject({ code: "MISSING_API_KEY" });
    expect(calls).toHaveLength(0);
  });

  it("reports an unreachable provider as NETWORK_ERROR with the base URL for troubleshooting", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    try {
      await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ code: "NETWORK_ERROR" });
      expect((error as Error).message).toContain("https://provider.invalid/v1");
      expect((error as Error).message).toContain("代理");
    }
  });

  it("maps an aborted request to TIMEOUT even when the runtime says TypeError: terminated", async () => {
    process.env.AI_REQUEST_TIMEOUT_MS = "40";
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (_url: string, init?: RequestInit) =>
          await new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new TypeError("terminated")));
          }),
      ),
    );

    try {
      await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ code: "TIMEOUT" });
    }
  });

  it("explains a mid-request socket termination in a user actionable way", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("terminated");
      }),
    );
    try {
      await callStructured({ schema: ProbeSchema, schemaName: "probe", systemPrompt: "s", userPrompt: "u" });
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toMatchObject({ code: "NETWORK_ERROR" });
      expect((error as Error).message).toContain("AI_REQUEST_TIMEOUT_MS");
    }
  });
});

describe("AI config resolution", () => {
  it("stays in demo mode when DEMO_MODE=true", () => {
    process.env.DEMO_MODE = "true";
    const config = getAiConfig();
    expect(config.demoMode).toBe(true);
    expect(config.enabled).toBe(false);
    expect(config.reason).toContain("DEMO_MODE=true");
  });

  it("enables AI mode when DEMO_MODE=false and a key exists", () => {
    const config = getAiConfig();
    expect(config.enabled).toBe(true);
    expect(config.apiKeyConfigured).toBe(true);
    expect(config.provider).toBe("OpenAI-compatible");
    expect(config.reason).toContain("test-model");
  });

  it("never exposes the key through the config object", () => {
    const config = getAiConfig();
    expect(JSON.stringify(config)).not.toContain(FAKE_KEY);
    expect(JSON.stringify(config)).not.toContain("sk-");
  });
});
```

## `tests/ai-schema.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { zodToJsonSchema } from "@/lib/ai/json-schema";
import { AGENT_SCHEMAS } from "@/lib/ai/schemas";
import { demoFor, runAgent } from "@/lib/ai/runner";
import { AiProviderError } from "@/lib/ai/client";
import { PROMPT_LIBRARY } from "@/lib/prompts";
import type { AgentId } from "@/types";
import { buildTestContext } from "./helpers/context";

const context = buildTestContext();
const AGENTS = Object.keys(AGENT_SCHEMAS) as AgentId[];

describe("structured output contract", () => {
  it("defines a prompt template and a schema for every agent", () => {
    expect(PROMPT_LIBRARY).toHaveLength(AGENTS.length);
    AGENTS.forEach((agent) => {
      expect(PROMPT_LIBRARY.some((template) => template.agent === agent)).toBe(true);
    });
  });

  it("accepts the demo engine output for all 7 agents (structure test 1/7 → 7/7)", () => {
    AGENTS.forEach((agent) => {
      const output = demoFor(agent, {
        context,
        question: "最近 ROAS 为什么下降？",
        contentSelection: {
          platform: "小红书",
          contentType: "种草",
          goal: "转化",
          topic: "熬夜修护",
          audience: "熬夜型新人",
        },
        creativeSelection: { platform: "抖音", objective: "转化", audience: "23 岁熬夜女性", theme: "夜间修护" },
      });
      const parsed = AGENT_SCHEMAS[agent].safeParse(output);
      if (!parsed.success) {
        throw new Error(`${agent} demo output failed validation: ${parsed.error.message}`);
      }
      expect(parsed.success).toBe(true);
    });
  });

  it("produces OpenAI strict-compatible JSON Schema (additionalProperties, required)", () => {
    const schema = zodToJsonSchema(AGENT_SCHEMAS.market_analyst) as {
      type: string;
      additionalProperties: boolean;
      required: string[];
      properties: Record<string, { type: string; items?: { type: string } }>;
    };
    expect(schema.type).toBe("object");
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toContain("insights");
    expect(schema.required).toContain("recommendations");
    expect(schema.properties.insights.type).toBe("array");
    expect(schema.properties.insights.items?.type).toBe("object");
  });

  it("rejects invalid AI payloads instead of rendering them", () => {
    const invalidOutputs: Array<[AgentId, unknown]> = [
      ["market_analyst", { summary: "x" }],
      ["audience_analyst", { summary: "x", personas: [], opportunityCards: {} }],
      ["content_strategist", { summary: "x", xiaohongshu: { titles: "not-an-array" } }],
      ["creative_strategist", { summary: "x", directions: [{ code: "A" }] }],
      ["performance_analyst", { summary: "x", hypotheses: [{ hypothesis: "h", evidence: "e", confidence: "high" }] }],
      ["growth_advisor", { question: "q", diagnosis: "d" }],
      ["report_writer", { title: "t", executiveSummary: "s" }],
    ];

    invalidOutputs.forEach(([agent, payload]) => {
      const parsed = AGENT_SCHEMAS[agent].safeParse(payload);
      expect(parsed.success).toBe(false);
    });
  });

  it("rejects out-of-range confidence values", () => {
    const parsed = AGENT_SCHEMAS.growth_advisor.safeParse({
      ...demoFor("growth_advisor", { context, question: "test" }),
      hypotheses: [{ hypothesis: "h", evidence: "e", confidence: 999 }],
    });
    expect(parsed.success).toBe(false);
  });

  it("falls back to the demo engine when the provider throws", async () => {
    const failingProvider = async () => {
      throw new AiProviderError("HTTP_ERROR", "provider exploded", 500);
    };

    const previousDemoMode = process.env.DEMO_MODE;
    const previousKey = process.env.OPENAI_API_KEY;
    process.env.DEMO_MODE = "false";
    process.env.OPENAI_API_KEY = "test-key";

    try {
      const result = await runAgent(
        "performance_analyst",
        { context },
        { callProvider: failingProvider as never },
      );

      expect(result.meta.mode).toBe("fallback");
      expect(result.meta.warning).toContain("HTTP_ERROR");
      expect(AGENT_SCHEMAS.performance_analyst.safeParse(result.data).success).toBe(true);
    } finally {
      process.env.DEMO_MODE = previousDemoMode;
      process.env.OPENAI_API_KEY = previousKey;
    }
  });

  it("uses demo mode when no API key is configured, even with DEMO_MODE=false", async () => {
    const previousDemoMode = process.env.DEMO_MODE;
    const previousKey = process.env.OPENAI_API_KEY;
    process.env.DEMO_MODE = "false";
    process.env.OPENAI_API_KEY = "";

    try {
      const result = await runAgent("market_analyst", { context });
      expect(result.meta.mode).toBe("demo");
      expect(result.meta.warning).toContain("OPENAI_API_KEY");
    } finally {
      process.env.DEMO_MODE = previousDemoMode;
      process.env.OPENAI_API_KEY = previousKey;
    }
  });
});

describe("prompt library", () => {
  it("keeps the shared compliance rules inside every prompt", () => {
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.body).toContain("Demo / 模拟业务数据");
      expect(template.body).toContain("JSON Schema");
      expect(template.version).toMatch(/^v\d+\.\d+$/);
      expect(template.body.length).toBeGreaterThan(300);
    });
  });

  it("never advertises a single mega prompt", () => {
    const agents = new Set(PROMPT_LIBRARY.map((template) => template.agent));
    expect(agents.size).toBe(PROMPT_LIBRARY.length);
  });

  it("documents a schema name per agent", () => {
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.outputSchema).toMatch(/Schema$/);
    });
    expect(z.object({}).safeParse({}).success).toBe(true);
  });
});
```

## `tests/ai-structured-output.test.ts`

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { callStructured } from "@/lib/ai/client";
import { jsonSchemaPromptHint, requiredFieldChecklist, zodToJsonSchema } from "@/lib/ai/json-schema";
import { ContentStrategySchema } from "@/lib/ai/schemas";
import { PROMPT_LIBRARY } from "@/lib/prompts";
import type { AgentId } from "@/types";

const KEY = ["sk", "test", "not", "a", "real", "key"].join("-");

/** Same shape as the field that broke in production (nested scores object). */
const MiniSchema = z.object({
  summary: z.string().describe("必填。摘要"),
  scores: z
    .object({
      hookScore: z.number().min(0).max(100).describe("必填。Hook 分"),
      whyTest: z.string().describe("必填。为什么值得测试"),
      howToImprove: z.string().describe("必填。怎么进一步优化，必须具体"),
    })
    .describe("评分模块，三个字段全部必填"),
});

type FetchCall = { body: Record<string, unknown>; systemPrompt: string };

function mockFetch(responder: (index: number) => { status?: number; json?: unknown; text?: string }) {
  const calls: FetchCall[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      const messages = (body.messages ?? []) as Array<{ role: string; content: string }>;
      calls.push({ body, systemPrompt: messages[0]?.content ?? "" });
      const result = responder(calls.length - 1);
      const status = result.status ?? 200;
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => result.json ?? {},
        text: async () => result.text ?? "{}",
      } as unknown as Response;
    }),
  );
  return calls;
}

function completion(content: string, finishReason = "stop") {
  return { choices: [{ message: { content }, finish_reason: finishReason }] };
}

beforeEach(() => {
  process.env.DEMO_MODE = "false";
  process.env.AI_PROVIDER = "deepseek";
  process.env.DEEPSEEK_API_KEY = KEY;
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  vi.unstubAllGlobals();
  ["DEMO_MODE", "AI_PROVIDER", "DEEPSEEK_API_KEY", "OPENAI_API_KEY", "AI_TEMPERATURE", "AI_MAX_TOKENS", "AI_MODEL"].forEach(
    (name) => delete process.env[name],
  );
});

describe("required field contract", () => {
  it("keeps scores.howToImprove required (validation is never relaxed)", () => {
    const withoutField = ContentStrategySchema.safeParse({
      summary: "s",
      xiaohongshu: { titles: [], body: "b" },
      douyin: { hook: "h", caption: "c", script: [] },
      scores: { hookScore: 80, relevanceScore: 80, conversionScore: 80, brandFitScore: 80, overallScore: 80, whyTest: "w" },
      keywords: [],
      insights: [],
      opportunities: [],
      risks: [],
      recommendations: [],
    });
    expect(withoutField.success).toBe(false);
    if (!withoutField.success) {
      expect(withoutField.error.issues.some((issue) => issue.path.join(".") === "scores.howToImprove")).toBe(true);
    }
  });

  it("lists every required leaf field, including nested array item fields", () => {
    const checklist = requiredFieldChecklist(MiniSchema).join("\n");
    expect(checklist).toContain("scores.howToImprove");
    expect(checklist).toContain("scores.whyTest");

    const contentChecklist = requiredFieldChecklist(ContentStrategySchema).join("\n");
    expect(contentChecklist).toContain("scores.howToImprove");
    expect(contentChecklist).toContain("douyin.script[]");
    expect(contentChecklist).toContain("xiaohongshu.titles[]");
  });

  it("emits descriptions into the JSON Schema so the model sees the explanation", () => {
    const json = JSON.stringify(zodToJsonSchema(MiniSchema));
    expect(json).toContain("必填。怎么进一步优化");
    expect(json).toContain("评分模块，三个字段全部必填");
  });

  it("injects the checklist and the schema name into the json_object prompt hint", () => {
    const hint = jsonSchemaPromptHint(MiniSchema, "mori_mini");
    expect(hint).toContain("必填字段清单");
    expect(hint).toContain("scores.howToImprove");
    expect(hint).toContain("mori_mini");
    expect(hint).toContain("json");
  });

  it("tells every agent (7/7) to return every field", () => {
    expect(PROMPT_LIBRARY).toHaveLength(7);
    PROMPT_LIBRARY.forEach((template) => {
      expect(template.body).toContain("每一个字段都必须出现");
    });
    const content = PROMPT_LIBRARY.find((template) => template.agent === "content_strategist");
    expect(content?.body).toContain("scores.howToImprove");
    expect(content?.body).toContain("7 个字段");
  });
});

describe("repair retry instead of discarding a parseable answer", () => {
  it("asks again with the exact missing field when the model omits scores.howToImprove", async () => {
    const calls = mockFetch((index) =>
      index === 0
        ? { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w"}}') }
        : { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToImprove":"把开头 3 秒换成具体场景"}}') },
    );

    const result = await callStructured({
      schema: MiniSchema,
      schemaName: "mori_mini",
      systemPrompt: "S",
      userPrompt: "U",
    });

    expect(result.mode).toBe("json_object");
    expect(result.output.scores.howToImprove).toBe("把开头 3 秒换成具体场景");
    expect(calls).toHaveLength(2);
    // the repair request must state what was wrong, and stay in json_object mode
    expect(calls[1].systemPrompt).toContain("scores.howToImprove");
    expect(calls[1].systemPrompt).toContain("缺失");
    expect((calls[1].body.response_format as { type: string }).type).toBe("json_object");
  });

  it("treats null as invalid and asks again instead of filling the value itself", async () => {
    const calls = mockFetch((index) =>
      index === 0
        ? { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToImprove":null}}') }
        : { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToImprove":"来自模型的真实内容"}}') },
    );

    const result = await callStructured({
      schema: MiniSchema,
      schemaName: "mori_mini",
      systemPrompt: "S",
      userPrompt: "U",
    });

    expect(result.output.scores.howToImprove).toBe("来自模型的真实内容");
    expect(calls.length).toBe(2);
    expect(JSON.stringify(result.output)).not.toContain("null");
  });

  it("repairs trailing commas in model JSON without touching string content", async () => {
    mockFetch(() => ({ json: completion('{"summary":"含逗号, 的文本","scores":{"hookScore":80,"whyTest":"w","howToImprove":"a, b"},}') }));

    const result = await callStructured({
      schema: MiniSchema,
      schemaName: "mori_mini",
      systemPrompt: "S",
      userPrompt: "U",
    });

    expect(result.output.summary).toBe("含逗号, 的文本");
    expect(result.output.scores.howToImprove).toBe("a, b");
  });

  it("still falls back to an error (→ demo engine) when the model never completes the contract", async () => {
    const calls = mockFetch(() => ({ json: completion('{"summary":"x","scores":{"hookScore":80}}') }));

    await expect(
      callStructured({ schema: MiniSchema, schemaName: "mori_mini", systemPrompt: "S", userPrompt: "U" }),
    ).rejects.toMatchObject({ code: "INVALID_JSON" });

    // repairs are bounded: never an unbounded retry loop
    expect(calls.length).toBeLessThanOrEqual(7);
  });

  it("asks for a shorter answer when the output was truncated", async () => {
    const calls = mockFetch((index) =>
      index === 0
        ? { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToIm', "length") }
        : { json: completion('{"summary":"x","scores":{"hookScore":80,"whyTest":"w","howToImprove":"精简版建议"}}') },
    );

    const result = await callStructured({
      schema: MiniSchema,
      schemaName: "mori_mini",
      systemPrompt: "S",
      userPrompt: "U",
    });

    expect(result.output.scores.howToImprove).toBe("精简版建议");
    expect(calls[1].systemPrompt).toContain("被截断");
    expect(calls[1].systemPrompt).toContain("精简");
  });
});
```

## `tests/analytics.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { compareWindows, creativeScorecard, dailySeries, deriveSignals, efficiencyQuadrant, groupPerformance } from "@/lib/analytics";
import { buildDemoMetrics, DEMO_TARGETS } from "@/lib/demo-data";
import { computeMetrics } from "@/lib/metrics";

const rows = buildDemoMetrics();

describe("analytics engine", () => {
  it("groups rows into a dense daily series", () => {
    const series = dailySeries(rows);
    expect(series).toHaveLength(30);
    expect(series[0].date < series[series.length - 1].date).toBe(true);
    const totalSpend = series.reduce((acc, point) => acc + point.spend, 0);
    expect(Math.round(totalSpend)).toBe(DEMO_TARGETS.spend);
  });

  it("aggregates by platform and creative with consistent totals", () => {
    const platforms = groupPerformance(rows, "platform");
    const creatives = groupPerformance(rows, "creative");
    expect(platforms).toHaveLength(3);
    expect(creatives).toHaveLength(10);
    expect(platforms.reduce((acc, item) => acc + item.impressions, 0)).toBe(DEMO_TARGETS.impressions);
    expect(Math.round(platforms.reduce((acc, item) => acc + item.share, 0) * 100)).toBe(100);
  });

  it("compares the latest window against the previous one", () => {
    const comparison = compareWindows(rows, 7);
    expect(comparison).not.toBeNull();
    if (!comparison) return;
    expect(comparison.currentRange.start).toBe("2026-09-09");
    expect(comparison.previousRange.end).toBe("2026-09-08");
    expect(comparison.current.spend).toBeGreaterThan(0);
    expect(Object.keys(comparison.deltas)).toContain("roas");
  });

  it("classifies creatives into efficiency quadrants", () => {
    const benchmarks = computeMetrics(rows);
    const scorecards = creativeScorecard(rows);
    const best = scorecards[0];
    const worst = scorecards[scorecards.length - 1];
    expect(efficiencyQuadrant(best, benchmarks).code).toBe("scale");
    expect(efficiencyQuadrant(worst, benchmarks).code).toBe("pause");
  });

  it("derives signals whose evidence quotes the real account metrics", () => {
    const signals = deriveSignals(rows);
    const joined = [...signals.insights, ...signals.opportunities, ...signals.risks, ...signals.recommendations]
      .map((signal) => signal.body + signal.evidence)
      .join(" ");
    expect(joined).toContain("ROAS");
    expect(joined).toContain("CTR");
    expect(signals.insights.length).toBeGreaterThanOrEqual(3);
  });

  it("returns an explicit empty-state signal when there is no data", () => {
    const signals = deriveSignals([]);
    expect(signals.insights).toHaveLength(1);
    expect(signals.insights[0].title).toContain("暂无可用投放数据");
    expect(signals.risks).toHaveLength(0);
  });
});
```

## `tests/csv.test.ts`

```ts
import { describe, expect, it } from "vitest";

import {
  CsvValidationError,
  parseCampaignCsv,
  parseCsv,
  parseNumber,
  rowsToCsv,
} from "@/lib/csv";

const HEADER = "date,platform,campaign,creative,spend,impressions,clicks,conversions,revenue";

describe("CSV parser", () => {
  it("parses quoted fields, escaped quotes, CRLF and a BOM", () => {
    const raw =
      '\uFEFFdate,platform,campaign,creative,spend,impressions,clicks,conversions,revenue\r\n2026-09-01,抖音,"计划, A","素材 ""A""",100,1000,10,1,320\r\n';
    const table = parseCsv(raw);
    expect(table).toHaveLength(2);
    expect(table[1][2]).toBe("计划, A");
    expect(table[1][3]).toBe('素材 "A"');
    expect(table[1][4]).toBe("100");
  });

  it("normalises currency, thousands separators and percentages in numbers", () => {
    expect(parseNumber("¥1,234.50")).toBe(1234.5);
    expect(parseNumber(" 12 ")).toBe(12);
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
});

describe("campaign CSV validation", () => {
  it("maps valid rows and computes the date range", () => {
    const csv = `${HEADER}\n2026-09-01,抖音,计划A,素材A,1000,100000,2000,80,3200\n2026-09-05,小红书,计划B,素材B,500,50000,900,27,1200`;
    const result = parseCampaignCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.dateRange).toEqual({ start: "2026-09-01", end: "2026-09-05" });
    expect(result.platforms).toEqual(["抖音", "小红书"]);
    expect(result.creatives).toEqual(["素材A", "素材B"]);
    expect(result.issues).toHaveLength(0);
  });

  it("accepts Chinese headers and alternative column names", () => {
    const csv = '日期,平台,广告计划,素材名称,花费,曝光,点击,转化,收入\n2026/09/01,抖音,中文计划,中文素材,"¥1,200",50000,900,30,3600';
    const result = parseCampaignCsv(csv);
    expect(result.rows[0].platform).toBe("抖音");
    expect(result.rows[0].spend).toBe(1200);
    expect(result.rows[0].impressions).toBe(50_000);
    expect(result.rows[0].date).toBeInstanceOf(Date);
  });

  it("throws EMPTY_FILE for empty input", () => {
    expect(() => parseCampaignCsv("   ")).toThrowError(CsvValidationError);
    try {
      parseCampaignCsv("");
    } catch (error) {
      expect((error as CsvValidationError).code).toBe("EMPTY_FILE");
    }
  });

  it("throws MISSING_COLUMNS and lists every missing field", () => {
    try {
      parseCampaignCsv("date,platform,campaign,creative\n2026-09-01,抖音,计划,素材");
      throw new Error("should have thrown");
    } catch (error) {
      const csvError = error as CsvValidationError;
      expect(csvError.code).toBe("MISSING_COLUMNS");
      expect(csvError.message).toContain("spend");
      expect(csvError.issues).toHaveLength(5);
    }
  });

  it("throws NO_DATA_ROWS when every row fails to parse", () => {
    try {
      parseCampaignCsv(`${HEADER}\nnot-a-date,抖音,计划,素材,1000,1000,10,1,100`);
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as CsvValidationError).code).toBe("NO_DATA_ROWS");
    }
  });

  it("treats missing numbers as 0 with a warning and skips broken rows", () => {
    const csv = `${HEADER}\n2026-09-01,抖音,计划A,素材A,,30000,500,20,2400\n2026-09-02,抖音,计划B,,300,30000,500,20,2400`;
    const result = parseCampaignCsv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].spend).toBe(0);
    expect(result.skippedRows).toBe(1);
    expect(result.issues.some((issue) => issue.column === "spend" && issue.severity === "warning")).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes("creative"))).toBe(true);
  });

  it("warns on impossible funnel relationships without crashing", () => {
    const csv = `${HEADER}\n2026-09-01,抖音,计划A,素材A,100,1000,10,1,320\n2026-09-02,抖音,计划A,素材A2,100,0,50,60,320\n2026-09-03,抖音,计划A,素材A3,100,30,50,60,320`;
    const result = parseCampaignCsv(csv);
    const messages = result.issues.map((issue) => issue.message).join(" | ");
    expect(messages).toContain("曝光为 0");
    expect(messages).toContain("点击数大于曝光数");
    expect(messages).toContain("转化数大于点击数");
    expect(result.rows).toHaveLength(3);
  });

  it("round-trips rows back to CSV", () => {
    const rows = [
      {
        date: "2026-09-01",
        platform: "抖音",
        campaign: "计划, A",
        creative: '素材 "B"',
        spend: 100,
        impressions: 1000,
        clicks: 10,
        conversions: 1,
        revenue: 320,
      },
    ];
    const csv = rowsToCsv(rows);
    const parsed = parseCampaignCsv(csv);
    expect(parsed.rows[0].campaign).toBe("计划, A");
    expect(parsed.rows[0].creative).toBe('素材 "B"');
  });
});
```

## `tests/demo-data.test.ts`

```ts
import { describe, expect, it } from "vitest";

import {
  allocateExact,
  balanceShares,
  buildDemoAudienceMetrics,
  buildDemoMetrics,
  DEMO_CREATIVE_SPECS,
  DEMO_TARGETS,
  solveCreativeShares,
  TARGET_CTR,
} from "@/lib/demo-data";
import { compareWindows, creativeScorecard, dailySeries, deriveSignals, groupPerformance } from "@/lib/analytics";
import { computeMetrics } from "@/lib/metrics";

const rows = buildDemoMetrics();
const totals = computeMetrics(rows);

describe("demo dataset", () => {
  it("hits every account-level KPI target quoted in the product brief", () => {
    expect(totals.spend).toBe(DEMO_TARGETS.spend);
    expect(totals.impressions).toBe(DEMO_TARGETS.impressions);
    expect(totals.clicks).toBe(DEMO_TARGETS.clicks);
    expect(totals.conversions).toBe(DEMO_TARGETS.conversions);
    expect(totals.revenue).toBe(DEMO_TARGETS.revenue);
    expect(totals.ctr).toBeCloseTo(0.0177, 4);
    expect(totals.cpc).toBeCloseTo(1.49, 2);
    expect(totals.cpa).toBeCloseTo(39.69, 2);
    expect(totals.roas).toBeCloseTo(3.12, 2);
  });

  it("covers 30 days, 10 creatives, 3 platforms and 5 campaigns", () => {
    expect(dailySeries(rows)).toHaveLength(30);
    expect(new Set(rows.map((row) => row.creative)).size).toBe(10);
    expect(new Set(rows.map((row) => row.platform)).size).toBe(3);
    expect(new Set(rows.map((row) => row.campaign)).size).toBe(5);
    expect(rows.length).toBeGreaterThanOrEqual(100);
  });

  it("reproduces the benchmark CTR / ROAS of the quoted creatives", () => {
    const scorecards = creativeScorecard(rows);
    const byName = new Map(scorecards.map((item) => [item.name, item]));

    const night = byName.get("熬夜党晚间修护");
    expect(night?.ctr).toBeCloseTo(0.0241, 3);
    expect(night?.roas).toBeCloseTo(4.26, 1);

    const student = byName.get("学生党护肤预算");
    expect(student?.ctr).toBeCloseTo(0.0218, 3);
    expect(student?.roas).toBeCloseTo(3.91, 1);

    const challenge = byName.get("30天肌肤稳定挑战");
    expect(challenge?.ctr).toBeCloseTo(0.0192, 3);
    expect(challenge?.roas).toBeCloseTo(3.64, 1);

    const ingredient = byName.get("成分党深度解析");
    expect(ingredient?.ctr).toBeCloseTo(0.0121, 3);
    expect(ingredient?.roas).toBeCloseTo(2.13, 1);
  });

  it("keeps the ranking realistic: best creative leads on both CTR and ROAS", () => {
    const scorecards = creativeScorecard(rows);
    expect(scorecards[0].name).toBe("熬夜党晚间修护");
    const worst = scorecards[scorecards.length - 1];
    expect(worst.roas).toBeLessThan(totals.roas);
  });

  it("builds the last-week efficiency drop the AI Advisor talks about", () => {
    const comparison = compareWindows(rows, 7);
    expect(comparison).not.toBeNull();
    if (!comparison) return;
    expect(comparison.current.roas).toBeLessThan(comparison.previous.roas);
    expect(comparison.deltas.roas).toBeLessThan(-5);
    expect(comparison.current.cvr).toBeLessThan(comparison.previous.cvr);
    expect(Math.abs(comparison.deltas.ctr)).toBeLessThan(Math.abs(comparison.deltas.cvr));
    expect(comparison.current.roas).toBeGreaterThan(2.3);
    expect(comparison.current.roas).toBeLessThan(3.2);
  });

  it("produces a genuine audience re-cut of the same totals", () => {
    const audienceRows = buildDemoAudienceMetrics();
    const audienceTotals = computeMetrics(
      audienceRows.map((row) => ({
        date: row.date,
        platform: "全渠道",
        campaign: "全渠道",
        creative: row.segment,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        revenue: row.revenue,
      })),
    );
    expect(audienceTotals.impressions).toBe(DEMO_TARGETS.impressions);
    expect(audienceTotals.clicks).toBe(DEMO_TARGETS.clicks);
    expect(audienceTotals.conversions).toBe(DEMO_TARGETS.conversions);
    expect(audienceTotals.revenue).toBeCloseTo(DEMO_TARGETS.revenue, -1);

    const segments = groupPerformance(
      audienceRows.map((row) => ({
        date: row.date,
        platform: "全渠道",
        campaign: "全渠道",
        creative: row.segment,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
        revenue: row.revenue,
      })),
      "creative",
    );
    const young = segments.find((item) => item.name === "18–24 岁女性");
    const mature = segments.find((item) => item.name === "25–30 岁女性");
    expect(young && mature).toBeTruthy();
    expect(young!.ctr).toBeGreaterThan(mature!.ctr);
    expect(young!.cvr).toBeLessThan(mature!.cvr);
  });

  it("derives signals with concrete evidence strings", () => {
    const audienceRows = buildDemoAudienceMetrics().map((row) => ({
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
    const signals = deriveSignals(rows, audienceRows);
    expect(signals.insights.length).toBeGreaterThanOrEqual(2);
    expect(signals.risks.length).toBeGreaterThanOrEqual(1);
    expect(signals.recommendations.length).toBeGreaterThanOrEqual(1);
    signals.insights.forEach((signal) => {
      expect(signal.evidence.length).toBeGreaterThan(5);
      expect(signal.confidence).toBeGreaterThan(0);
      expect(signal.confidence).toBeLessThanOrEqual(100);
    });
  });
});

describe("allocation helpers", () => {
  it("allocates integers that always sum to the requested total", () => {
    const parts = allocateExact(1000, [1, 1, 1, 7]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1000);
    expect(parts[3]).toBe(700);

    const awkward = allocateExact(7, [0.333, 0.333, 0.334]);
    expect(awkward.reduce((a, b) => a + b, 0)).toBe(7);
  });

  it("returns zeroes instead of throwing on invalid input", () => {
    expect(allocateExact(100, [])).toEqual([]);
    expect(allocateExact(0, [1, 2])).toEqual([0, 0]);
    expect(allocateExact(10, [0, 0])).toEqual([0, 0]);
  });

  it("solves impression shares so the weighted CTR matches the account target", () => {
    const shares = solveCreativeShares();
    const weighted = DEMO_CREATIVE_SPECS.reduce((acc, spec, index) => acc + spec.ctr * shares[index], 0);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 8);
    expect(weighted).toBeCloseTo(TARGET_CTR, 6);
  });

  it("falls back to a proportional nudge when the closed form is infeasible", () => {
    const shares = balanceShares(
      [
        { key: "a", ctr: 0.05 },
        { key: "b", ctr: 0.04 },
        { key: "c", ctr: 0.03 },
      ],
      [0.34, 0.33, 0.33],
      0.01,
      "b",
      "c",
    );
    expect(shares.every((share) => Number.isFinite(share) && share > 0)).toBe(true);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
  });
});
```

## `tests/helpers/context.ts`

```ts
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
```

## `tests/metrics.test.ts`

```ts
import { describe, expect, it } from "vitest";

import {
  calcCpa,
  calcCpc,
  calcCtr,
  calcCvr,
  calcRoas,
  computeMetrics,
  formatMetricValue,
  safeDivide,
} from "@/lib/metrics";
import type { MetricRow } from "@/types";

const rows: MetricRow[] = [
  {
    date: "2026-09-01",
    platform: "抖音",
    campaign: "A",
    creative: "C1",
    spend: 1000,
    impressions: 100_000,
    clicks: 2000,
    conversions: 80,
    revenue: 3200,
  },
  {
    date: "2026-09-02",
    platform: "小红书",
    campaign: "B",
    creative: "C2",
    spend: 500,
    impressions: 50_000,
    clicks: 900,
    conversions: 27,
    revenue: 1200,
  },
];

describe("KPI formulas", () => {
  it("computes CTR, CPC, CVR, CPA and ROAS with the documented formulas", () => {
    expect(calcCtr(2000, 100_000)).toBeCloseTo(0.02, 8);
    expect(calcCpc(1000, 2000)).toBeCloseTo(0.5, 8);
    expect(calcCvr(80, 2000)).toBeCloseTo(0.04, 8);
    expect(calcCpa(1000, 80)).toBeCloseTo(12.5, 8);
    expect(calcRoas(3200, 1000)).toBeCloseTo(3.2, 8);
  });

  it("guards every division against zero instead of returning NaN or Infinity", () => {
    expect(calcCtr(10, 0)).toBe(0);
    expect(calcCpc(10, 0)).toBe(0);
    expect(calcCvr(10, 0)).toBe(0);
    expect(calcCpa(10, 0)).toBe(0);
    expect(calcRoas(10, 0)).toBe(0);
    expect(safeDivide(1, 0, -1)).toBe(-1);
  });

  it("handles non numeric / non finite input", () => {
    expect(safeDivide(Number.NaN, 2)).toBe(0);
    expect(safeDivide(2, Number.NaN)).toBe(0);
    expect(safeDivide(Number.POSITIVE_INFINITY, 2)).toBe(0);
    expect(calcRoas(100, Number.NaN)).toBe(0);
  });

  it("aggregates rows and derives metrics from the aggregated totals", () => {
    const metrics = computeMetrics(rows);
    expect(metrics.spend).toBe(1500);
    expect(metrics.impressions).toBe(150_000);
    expect(metrics.clicks).toBe(2900);
    expect(metrics.conversions).toBe(107);
    expect(metrics.revenue).toBe(4400);
    expect(metrics.ctr).toBeCloseTo(2900 / 150_000, 10);
    expect(metrics.cpc).toBeCloseTo(1500 / 2900, 10);
    expect(metrics.cvr).toBeCloseTo(107 / 2900, 10);
    expect(metrics.cpa).toBeCloseTo(1500 / 107, 10);
    expect(metrics.roas).toBeCloseTo(4400 / 1500, 10);
  });

  it("returns zeroed metrics for an empty dataset", () => {
    const metrics = computeMetrics([]);
    expect(metrics).toMatchObject({ spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 });
    expect(Object.values(metrics).every((value) => Number.isFinite(value))).toBe(true);
  });

  it("formats metric values for the UI", () => {
    expect(formatMetricValue("ctr", 0.0177)).toBe("1.77%");
    expect(formatMetricValue("cpc", 1.4916)).toBe("¥1.49");
    expect(formatMetricValue("roas", 3.12)).toBe("3.12");
    expect(formatMetricValue("spend", 128_600)).toBe("¥128,600");
    expect(formatMetricValue("impressions", 4_860_000)).toBe("486.0万");
  });
});
```

## `tests/statistics.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { requiredSampleSize, twoProportionZTest } from "@/lib/statistics";

describe("experiment statistics", () => {
  it("detects a significant difference between two rates", () => {
    const test = twoProportionZTest(600, 10_000, 780, 10_000);
    expect(test.significant).toBe(true);
    expect(test.winner).toBe("B");
    expect(test.lift).toBeCloseTo(30, 0);
    expect(test.pValue).toBeLessThan(0.01);
  });

  it("treats a small difference as noise", () => {
    const test = twoProportionZTest(500, 10_000, 520, 10_000);
    expect(test.significant).toBe(false);
    expect(test.winner).toBe("tie");
    expect(test.note).toContain("未达显著");
  });

  it("never divides by zero when a variant has no traffic", () => {
    const test = twoProportionZTest(0, 0, 10, 100);
    expect(test.rateA).toBe(0);
    expect(Number.isFinite(test.pValue)).toBe(true);
    expect(test.significant).toBe(false);
    expect(test.note).toContain("样本不足");
  });

  it("computes a required sample size for a detectable lift", () => {
    const size = requiredSampleSize(0.04, 0.15);
    expect(size).toBeGreaterThan(5_000);
    expect(requiredSampleSize(0, 0.1)).toBeNull();
    expect(requiredSampleSize(0.04, 0)).toBeNull();
  });
});
```

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## `vitest.config.ts`

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```
