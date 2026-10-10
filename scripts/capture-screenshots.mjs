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
