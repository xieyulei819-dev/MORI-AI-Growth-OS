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
