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
