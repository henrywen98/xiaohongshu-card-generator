---
name: xhs-image-gen
description: >
  把整篇长文（文章 / 反思 / 教程 / 笔记）自动铺成小红书**可翻阅的长图文图集**
  （多页 PNG，按字数和小标题自动分页，每页 1080×1440 暖色版式）。当用户说
  "把这段 / 这篇做成小红书长图文 / 长文图 / 图集""发小红书""铺成多张图 /
  可翻阅的图"、或丢来一篇长文 / 反思 / 教程 / 读书笔记（300+ 字）想发小红书
  时使用——即使没说"图片"或"skill"。**不做**：单张封面 / 卡片 / 9 宫格 /
  海报 / 公众号 / 抖快视频 / 英文 1:1。生成的图片文字会被烧进 PNG，
  发布前会跑一遍违禁词检查。
---

# xhs-image-gen — 长文 → 小红书图集

把整篇文章 / 反思 / 教程 / 笔记**原文铺成**小红书长图文（多页 PNG 图集）。
暖色版式、统一 1080×1440（3:4 竖版），按字数和「一、二、三…」小标题自动分页。

## 一次性的环境

第一次使用 / 换渲染环境时跑一次（**已有环境可跳过**）：

```bash
cd {skill-root}/scripts && npm install && npx playwright install chromium
node {skill-root}/scripts/check_fonts.js
```

> 字体已本地嵌入在 `assets/fonts/`，不需要联网下。

## 工作流（5 步，每步一个文档，按需读）

| Step | 干什么 | 文档 |
|------|--------|------|
| 1 | 把要发的内容写到 `article.txt`，用「一、二、三…」做小标题 | `references/step-1-prepare.md` |
| 2 | 跑 `longform_to_html.js` 自动分页 → 多张 HTML | `references/step-2-paginate.md` |
| 3 | 跑 `check_banned_words.js` 过违禁词，按建议替换 | `references/step-3-compliance.md` |
| 4 | 跑 `screenshot.js` 出 PNG（自动等字体 + 缺字形自检） | `references/step-4-screenshot.md` |
| 5 | 亲自过一遍图 + 交付 | `references/step-5-deliver.md` |

> **严格按顺序走**。前一步没过不要跳下一步——先修 Step 1 的小标题再分页，先过违禁词
> 再出图，截完图自己看一遍再交付。

## 关键约定（贯穿所有 step）

- **mode-A 的精髓是"原文成图"**：不重写、不缩写、不另写文案。标题和正文直接来自
  `article.txt`，**全烧进 PNG**。
- **字体已本地嵌入**（`assets/fonts.css` + `assets/fonts/NotoSansSC-{400,700}.woff2` +
  `NotoColorEmoji.woff2`），所有 HTML 自动内联 + 替换绝对路径，无需手动处理。
- **版式固定**：暖色底 `#f5efe0` + 栗色强调 `#b4643c`，画布 1080×1440。
  没有多套风格 / 主题切换，**这就是"长图文"该有的样子**——别再纠结风格，
  把精力放在原文上。详见 `references/styles.md`（只读）。
- **中间产物 HTML 出图后会被 `--clean` 删掉**，最终交付是 PNG。

## 文件结构

```
SKILL.md                 ← 你现在在读（入口）
references/
  step-1-prepare.md      ← 写 article.txt
  step-2-paginate.md     ← 跑 longform_to_html.js
  step-3-compliance.md   ← 跑 check_banned_words.js
  step-4-screenshot.md   ← 跑 screenshot.js
  step-5-deliver.md      ← 自检 + 交付
  styles.md              ← 暖色版式设计令牌（只读）
  fonts.md               ← 字体加载细节（排错时读）
assets/
  fonts.css              ← @font-face 声明（自动内联到 HTML）
  fonts/                 ← 3 个 woff2（Noto Sans SC 400/700 + Emoji）
data/
  banned-words.json      ← 违禁词词库
scripts/
  longform_to_html.js    ← 长文 → 分页 HTML
  screenshot.js          ← HTML → PNG（等字体 + 缺字形自检）
  check_fonts.js         ← 字体预检
  check_banned_words.js  ← 违禁词扫描
  lib/glyph_audit.js     ← 缺字形检测（共享）
  setup_fonts.sh         ← 重新下载字体
  package.json
examples/
  sample_longform_title.png  ← 首页样例（已渲染）
  sample_longform_body.png   ← 正文页样例（已渲染）
```

## 触发示例

- "把这篇长文做成小红书长图文 / 图集" + 粘贴整篇文章
- "把 posts/ai-future.md 做成小红书图集"
- "把这段反思发成小红书，原文铺成图就行"
- "把 article.txt 铺成小红书图集"
- "make this into Xiaohongshu swipeable images"
