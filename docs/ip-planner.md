# IP 智能选题与短视频内容策划 Agent（独立模块）

> 输入一个 IP / 人物 / 品牌，系统自动分析它、联网找热点、生成选题池与评分、
> 选出 TOP 5、写出 30/60/90 秒口播稿、镜头脚本、拍摄清单，并建立内容矩阵与 7 天内容计划。
> 事实与推测全程分开标注，没有可靠来源时不编造热点。

这个模块是加在 **MORI AI Growth OS** 里的一个**独立功能模块**：

- 没有另建一套 AI 系统，直接复用 MORI 已有的 `src/lib/ai/client.ts`（DeepSeek / OpenAI-compatible 结构化输出）
  与 `src/lib/ai/runner.ts` 的 demo / ai / fallback 模式；
- 数据表、API 路由、前端组件、Prompt 全部以 `ip` 前缀独立命名，与 MORI 品牌增长数据互不影响；
- 没有修改 MORI 原有页面与 API 的行为（只在左侧导航、首页模块列表里各加了一个入口）。

---

## 1. 使用方式

打开 `http://localhost:3000/ip`。

1. 输入 IP 名称（例如 `伊宁房产王总`），其余字段（行业 / 城市 / 平台 / 目标客户 / 产品 / 目标）都是**可选**的。
2. 点击 **开始分析**：系统自动执行 `联网热点检索 → IP 分析 → 选题生成与评分`。
3. 在选题池里点 **生成视频方案**：得到主题、核心观点、目标观众、3 个 Hook 版本、30/60/90 秒口播稿、
   镜头脚本、拍摄清单、10+ 标题、5+ 封面文案、5+ 评论引导。
4. 点击 **生成 7 天内容计划**：得到 4-6 个长期栏目（每栏目 10 个可持续选题）与按比例混合的 7 天排期。
5. 每个选题支持 👍 喜欢 / 👎 不喜欢（带原因）/ 收藏 / 换一个；「不喜欢」会按原因重新生成该条。
6. 所有结果写入数据库，输入同一个 IP 时会复用同一条历史记录。

---

## 2. 六个逻辑 Agent（不是一个巨大 Prompt）

| Agent | 职责 | 输出 Schema |
| --- | --- | --- |
| IP Analyst | 判断行业 / 身份 / 领域 / 受众 / 关注动机 / 内容优势 / 信任·互动·转化方向 | `IpAnalysisSchema` |
| Trend Researcher | 结合联网搜索与行业常识，找热点 / 政策 / 争议 / 同行选题 / 用户痛点 | `TrendResearchSchema` |
| Topic Strategist | 生成 ≥10 个选题，给 6 个维度打分与依据，选出 TOP 5 | `TopicStrategySchema` |
| Script Writer | 3 个 Hook 版本 + 30/60/90 秒口播稿 + 10 个标题 + 5 封面 + 5 评论引导 | `ScriptBundleSchema` |
| Shot Planner | 镜头脚本表 + 今天必拍清单 + 设备 / 道具 / 提示 | `ShotPlanSchema` |
| Content Planner | 4-6 个长期栏目（每栏 10 选题）+ 7 天计划 + 内容比例 | `ContentPlanSchema` |

Prompt 在 `src/lib/ip/prompts.ts`，Schema 在 `src/lib/ip/schemas.ts`。

---

## 3. 统一评分模型（数字不是模型随便编的）

模型只负责给 6 个维度的**原始分**，综合推荐分由 `src/lib/ip/scoring.ts` 用固定权重计算：

```
综合推荐分 = 热点相关性×15% + 用户痛点×25% + IP匹配度×20%
           + 内容差异化×15% + 传播潜力×15% + 商业价值×10%
```

每个维度都必须给出评分依据（`scoreBasis`）。传播潜力用 1-5 星展示，但依据要写清楚，
并且明确「效果无法预测，必须发布后用真实数据验证」。

---

## 4. 事实与推测的标注

所有涉及热点 / 政策 / 市场数据 / 人物信息的内容都带 `label`：

- **事实**：输入里明确给出，或有可靠来源；
- **AI推测**：基于行业常识推断；
- **需要进一步验证**：涉及政策、数据、具体人物/公司但没有来源。

没有可靠来源时，`reliabilityNote` 会写「当前没有找到足够可靠的热点信息。」，
并且不会把推测写成事实。

---

## 5. 联网搜索（可插拔）

`src/lib/ip/search.ts` 提供一个真实的搜索适配层，支持 Tavily / Serper / Bing / 自定义：

```bash
# .env.local
SEARCH_PROVIDER="tavily"        # tavily | serper | bing | custom | none
SEARCH_API_KEY="<你的 key>"     # 也支持 TAVILY_API_KEY / SERPER_API_KEY / BING_SEARCH_KEY
SEARCH_BASE_URL=""             # 仅 custom 需要
```

- 配置了：搜索到的信息才会被标为「事实」，并带 `sourceTitle` / `sourceUrl`；
- 没配置 / 搜索失败 / 没有结果：明确显示「当前没有找到足够可靠的热点信息。」，
  热点全部标为 AI 推测，`sourceUrl` 留空。

> 说明：仓库里**没有内置任何搜索 Key**，所以默认状态下热点研究是「无可靠来源」模式。
> 想看到带来源的真实热点，填一个 `SEARCH_API_KEY` 即可，无需改代码。

---

## 6. API 路由

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/ip/analyze` | 输入 IP → 联网检索 + IP 分析 + 热点研究，写入 `IpProfile` |
| POST | `/api/ip/topics` | 生成选题池、评分、TOP 5、今日推荐，写入 `IpTopic` |
| POST | `/api/ip/script` | 选定选题 → Script Writer + Shot Planner，写入 `IpScript` |
| POST | `/api/ip/plan` | Content Planner → 内容矩阵 + 7 天计划，写入 `IpPlan` |
| POST | `/api/ip/topic/feedback` | 喜欢 / 不喜欢（带原因重新生成）/ 收藏 / 换一个 |
| GET | `/api/ip/profile` | 历史记录列表；`?id=` 读取某个 IP 的完整记录 |
| DELETE | `/api/ip/profile?id=` | 删除历史记录 |

响应结构与 MORI 主体一致：`{ ok, data, meta }`，`meta.mode ∈ {demo, ai, fallback}`。

---

## 7. 数据表（Prisma / SQLite）

- `IpProfile`：IP 输入 + IP 分析 + 热点研究 + 搜索状态；
- `IpTopic`：选题、类型、痛点、价值、Hook、创意、6 项分数 + 依据、综合分、TOP5、反馈；
- `IpScript`：某个选题的脚本 + 镜头方案；
- `IpPlan`：内容矩阵 + 7 天计划。

同步表结构：`npm run db:push`（新增表，不会删除 MORI 原有数据）。

---

## 8. 测试

```bash
npm run test        # 含 tests/ip-demo-engine.test.ts / ip-schema.test.ts / ip-scoring.test.ts
npm run typecheck
npm run lint
```

IP 相关测试覆盖：三个不同领域 IP 的输出差异、选题池 ≥10、评分可复核、TOP 5 由系统计算、
脚本结构与 5 类标题、镜头与拍摄清单、内容矩阵与 7 天混合、无来源时的事实标注、有搜索来源时的引用。
