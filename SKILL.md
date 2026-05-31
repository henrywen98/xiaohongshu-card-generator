---
name: xhs-image-gen
description: >
  This skill should be used when the user asks to generate Xiaohongshu/RedNote
  visual cards, such as "生成小红书图文", "小红书卡片", "小红书图片", "小红书封面",
  "做小红书图", "XHS cards", "RedNote images", or wants to convert text, articles,
  or topics into styled HTML card images for social media posting.
---

# 小红书图文卡片生成器

将文案、文章或主题内容转化为 1-10 张小红书风格的图文卡片（PNG 图片）。

HTML 是中间产物，最终交付物是 PNG 图片。

## 工作流

### Step 1：解析输入

**支持以下输入形式：**
- 文件路径：读取文件内容（markdown、txt、文章）
- Obsidian URL：解析 `obsidian://open?vault=...&file=...` 链接，定位到实际文件路径
- 直接文案：用户直接输入文字内容
- 主题词：如「今日星座运势」，根据主题自行发挥内容

**参数解析：**
- `--style <风格名>` 指定视觉风格（见风格列表）
- `--layout <布局名>` 指定布局方式（见布局列表）
- `--ratio <比例>` 指定图片比例（见下方尺寸规范，默认 `3:4`）
- 无参数时，根据内容智能选择最适合的风格和布局

### Step 2：内容规划

将内容分解为 1-10 个卡片，每张卡片对应一个核心点：
- **第 1 张**：封面卡（标题 + 副标题 + 吸睛元素）
- **中间张**：内容卡（每张聚焦 1 个核心观点）
- **最后 1 张**（可选）：总结/行动卡

**分卡原则：**
- 内容短（200字内）→ 1-2 张
- 内容中等（500字内）→ 3-5 张
- 内容长（500字以上）→ 5-10 张
- 保持每张卡片信息量适中，避免文字过密

### Step 3：生成 HTML（中间产物）

为每张卡片生成一个独立 HTML 文件，命名为 `xhs_card_01.html`、`xhs_card_02.html`……

> HTML 文件是中间缓存，不是最终交付物。

**卡片尺寸规范（小红书平台标准）：**

| 比例 | 尺寸 | 说明 |
|------|------|------|
| **3:4 竖版**（默认） | 1080×1440px | 推荐，占屏面积最大 |
| 1:1 方形 | 1080×1080px | 产品展示/文字配图 |
| 4:3 横版 | 1200×900px | 风景/全景 |

> 小红书整篇笔记只支持一种图片比例，默认使用 3:4 竖版。

**排版注意：**
- 所有字号、间距参数按 1080px 宽度画布设计
- 具体数值因风格而异，生成前务必读取对应的 `references/style-*.md`
- **字体必读 `references/fonts.md`**：渲染机无 PingFang/衬线中文字体，不嵌入字体则中文全部回落成文泉驿黑体、设计失效

**生成要求：**
1. **嵌入字体（最重要）**：把 `assets/fonts.css` 的 `@font-face` 声明整段拷进 `<style>` 顶部，并把 `{SKILL_ROOT}` 替换为本 skill 根目录绝对路径；`font-family` 栈里 web 字体放最前（各风格字体栈见 `references/fonts.md`）
2. 使用选定的风格和布局（读取对应的 `references/style-*.md` 获取完整设计令牌）
3. 所有样式内联（`<style>` 标签内）
4. 使用 emoji 增加活泼感
5. 包含小红书常见元素：话题标签、互动引导语

### Step 4：违禁词合规检查（必做，截图前）

卡片文字会被烧进 PNG，所以**必须在截图前**检查并修正违禁词。对所有卡片 HTML 运行扫描器：

```bash
node {skill-root}/scripts/check_banned_words.js <output-dir>/xhs_card_*.html
```

脚本只负责**召回**——按 `data/banned-words.json` 词库找出疑似违禁词（广告法极限词 /
医疗功效词 / 营销引流词 / 平台敏感词），给出分类、风险等级、上下文和建议替换，**不自动改写**。

**你要做的（关键）：**
1. 逐条看命中项，**结合上下文判断是否误报**（如"最近""一起"等含敏感子串但无害的词，直接跳过）
2. 对真实违禁词，参考建议做**自然替换**，保持语义和语气不变（如「最好」→「个人很推荐」、「治疗」→「改善」、「加微信」→「看主页」）
3. 改完 HTML **重新运行脚本**，直到无高风险命中
4. 记录改了哪些词（用于 Step 8 的《合规报告》）

> 加 `--json` 可输出结构化结果便于处理；加 `--strict` 时若有高风险命中则退出码为 1。

### Step 5：截图生成 PNG 图片（最终交付物）

执行本 skill 目录下的 `scripts/screenshot.js` 将所有 HTML 批量转为 PNG。

> **路径说明：** 本 skill 的根目录即包含此 SKILL.md 的目录。所有相对路径（`scripts/`、`references/`、`assets/`、`examples/`）均相对于此目录。

**首次使用需安装依赖（字体已随仓库自带，无需额外下载）：**
```bash
cd {skill-root}/scripts && npm install && npx playwright install chromium
```

**截图命令：**
```bash
node {skill-root}/scripts/screenshot.js <output-dir>/xhs_card_*.html --clean
```

其中 `{skill-root}` 为本 SKILL.md 所在目录的绝对路径。

**脚本行为：**
- 自动检测每个 HTML 的画布尺寸（从 body 的 width/height）
- 截图前等待 `document.fonts.ready`，确保嵌入字体加载完成再拍（否则会拍到回落黑体）
- 并行处理所有文件
- 输出同名 .png 到同目录
- 加 `--clean` 自动删除中间 HTML
- 加 `--output-dir <dir>` 可指定 PNG 输出目录

### Step 6：截图后视觉自检（必做）

读取生成的每张 PNG，像设计师一样自评一遍：

- **字体是否正常**：中文有没有变成豆腐块（□）或回落成难看的黑体（说明字体没嵌入/路径错）
- **内容是否被裁切**：固定画布高 + `overflow:hidden`，文字过多会被裁掉——若有，缩字号 / 减内容 / 拆成更多张
- **对齐与留白**：元素是否对齐、留白是否均衡、有没有溢出或挤压
- **层次与可读性**：标题/正文对比是否清晰，配色对比度是否够

发现问题就**修改 HTML 并重新截图**（若改了文字，重跑 Step 4 检查）。满意后再清理中间 HTML（仅保留 PNG）。

### Step 7：生成小红书文案（含违禁词检查）

在 PNG 输出目录下生成 `小红书文案.md`，包含发布时所需的文字内容：

```markdown
# <吸睛标题>

<正文：概括内容要点，适合小红书阅读节奏，分段简短>

---

#标签1 #标签2 #标签3 ...
```

**文案要求：**
- **标题**：一行，带竖线或 emoji 分隔，吸引点击（如「Claude Code 安装指南｜国产大模型也能跑」）
- **正文**：提炼卡片核心内容，口语化，分段短小，适合手机阅读
- **推荐标签**：10-15 个相关话题标签，覆盖主题词、工具名、领域词

生成后**对文案文件再跑一遍违禁词检查**并按 Step 4 的方式修正：
```bash
node {skill-root}/scripts/check_banned_words.js <output-dir>/小红书文案.md
```

### Step 8：交付

告知用户：
1. 共生成了几张 PNG 图片和 1 个文案文件，列出完整文件路径
2. **合规报告**：违禁词检查结果——替换了哪些词（原词 → 新词、所属分类），或确认全部通过
3. 图片可直接上传到小红书，文案复制到标题和正文区
4. 可用 `--style` 和 `--layout` 参数重新生成不同风格

---

## 风格（Style）列表

| 风格名 | 中文名 | 适合内容 | 设计参考 |
|--------|--------|----------|---------|
| `anthropic` | Anthropic 官网风 | 技术、AI、产品、教程 | 暖米色底 + 衬线标题 + 赤陶橙强调 |
| `notion` | Notion 风 | 笔记、学习、效率、职场 | 白底 + 无衬线 + 图标化列表 + 扁平 |
| `minimal` | 极简黑白 | 商务、设计、科技 | 纯黑白灰 + 细线条 + 大留白 + 零圆角 |
| `warm` | 暖色生活方式 | 生活、美食、好物、情感 | 奶油暖底 + 圆体标题 + 大圆角 + 糖果色（小红书原生感最强） |
| `morandi` | 莫兰迪低饱和 | 穿搭、家居、艺术、读书 | 高级灰配色 + 文艺细衬 + 雾面质感 |

**默认选择逻辑：**
- 技术/AI/产品/教程类 → `anthropic`
- 知识/职场/效率类 → `notion`
- 商务/科技/设计类 → `minimal`
- 生活/美食/好物/情感类 → `warm`
- 穿搭/家居/艺术/质感类 → `morandi`

每种风格的完整设计令牌（色彩、字体、组件样式、布局参数）见对应的 `references/style-*.md` 文件。

---

## 布局（Layout）列表

| 布局名 | 中文名 | 特点 |
|--------|--------|------|
| `sparse` | 疏朗型 | 大留白，重点突出，视觉轻松 |
| `balanced` | 均衡型 | 图文平衡，标准卡片布局 |
| `list` | 列表型 | 竖向列举，步骤感强 |
| `flow` | 流程型 | 上下流程图感，适合教程步骤 |

**默认选择逻辑：**
- 列举型内容 → `list`
- 步骤/教程类 → `flow` 或 `list`
- 故事/情感类 → `sparse` 或 `balanced`

---

## 卡片必含元素

**封面卡（第 1 张）：**
- 醒目大标题（主要内容/吸引眼球的钩子）
- 1-2 行副标题或摘要
- 装饰性 emoji 或图形元素
- 底部页码（如 `01 / 08`）和提示语

**内容卡（中间张）：**
- 顶部：左侧分类标签 + 右侧页码
- 小标题 + 正文内容
- 适量 emoji 点缀
- 分隔线或图形装饰

**总结卡（最后 1 张，可选）：**
- 核心要点总结（3 条以内）
- 互动引导语（如「你有什么想法？评论区聊聊 →」）
- 话题标签（如 `#主题 #生活分享`）

---

## 示例用法

- "帮我把这篇文章生成小红书图文" + 粘贴文章内容
- "把 posts/ai-future.md 做成小红书卡片，用 anthropic 风格，flow 布局"
- "用 notion 风格生成3个职场沟通技巧的小红书图片"
- "极简风格做一组小红书封面，内容是 content.txt"

---

## 参考资源

### 字体规范（必读）

- **`references/fonts.md`** — 字体嵌入规范：为什么必须本地 `@font-face`、各风格字体栈、`{SKILL_ROOT}` 替换
- **`assets/fonts.css`** — 现成的 `@font-face` 声明，整段拷进 HTML 并替换 `{SKILL_ROOT}`
- **`assets/fonts/*.woff2`** — 随仓库自带的中文字体（Noto Sans/Serif SC、ZCOOL KuaiLe/XiaoWei）

### 风格设计令牌

生成卡片前，读取对应风格文件获取完整的色彩、字体、组件和布局规范：

- **`references/style-anthropic.md`** — 暖米色 + 衬线标题 + 赤陶橙，editorial 风格
- **`references/style-notion.md`** — 白底 + 图标化 + 属性行，结构化风格
- **`references/style-minimal.md`** — 纯黑白灰 + 细线条 + 零圆角，极简风格
- **`references/style-warm.md`** — 奶油暖底 + 圆体 + 大圆角 + 糖果色，小红书原生生活方式风
- **`references/style-morandi.md`** — 高级灰 + 文艺细衬 + 雾面质感，莫兰迪低饱和风

### 违禁词检查

- **`scripts/check_banned_words.js`** — 违禁词扫描器（召回），输出命中词/分类/上下文/建议替换
- **`data/banned-words.json`** — 分类词库（广告法极限词 / 医疗功效 / 营销引流 / 平台敏感），可扩展
- **`references/banned-words.md`** — 词库说明与替换原则
- 用法：`node {skill-root}/scripts/check_banned_words.js <files...> [--json] [--strict]`

### 截图脚本

- **`scripts/screenshot.js`** — Playwright 批量截图脚本，将 HTML 转为 PNG（截图前等 `document.fonts.ready`）
- 首次使用：`cd {skill-root}/scripts && npm install && npx playwright install chromium`
- 用法：`node {skill-root}/scripts/screenshot.js xhs_card_*.html [--clean] [--output-dir <dir>]`
- **`scripts/setup_fonts.sh`** — 重新下载 / 更新 `assets/fonts/` 字体（仓库已自带，一般无需运行）

### 示例输出

- **`examples/sample_cover_anthropic.html`** — Anthropic 风格封面卡示例（已嵌入本地字体），用浏览器打开查看预期效果
