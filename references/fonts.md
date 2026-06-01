# 字体加载规范（必读 — 直接决定成图美观度）

## 为什么必须显式嵌入字体

截图在 **无头 Chromium** 里跑，系统**没有** `PingFang SC`、`Microsoft YaHei`、
`Noto Sans SC`，也**没有任何衬线中文字体**——唯一可用的中文字体是
`WenQuanYi Zen Hei（文泉驿正黑）`，且只有 Regular 一个字重。

如果 HTML 只写 `font-family: "PingFang SC", ...`，结果是：

- 中文全部回落成文泉驿黑体，所有"衬线标题""细字重(300)"的设计意图**全部失效**；
- 成图偏糊、偏土，和 `references/style-*.md` 的设计差距很大。

**实测：** 用 Google Fonts `<link>` 也不行——无头 Chromium 在 CI / 沙箱 / 离线 /
TLS 拦截环境下取 `fonts.googleapis.com` 会失败（如 `ERR_CERT_AUTHORITY_INVALID`），
字体加载数为 0，照样回落黑体。

**结论：字体必须落到本地磁盘，用 `@font-face` 走 `file://` 绝对路径引入。**
本仓库已把所需 woff2 放在 `assets/fonts/`，并在 `assets/fonts.css` 提供现成声明。

## 标准做法（每个卡片 HTML 都要做）

1. 把 `assets/fonts.css` 的全部 `@font-face` 声明**整段拷进** HTML 的 `<style>` 顶部。
2. 把其中所有 `{SKILL_ROOT}` 替换为本 skill 根目录的**绝对路径**（含 SKILL.md 的目录）。
   - 例：`file:///home/user/.claude/skills/xhs-image-gen/assets/fonts/NotoSansSC-400.woff2`
3. 在 `font-family` 栈里把 web 字体放**最前**，系统字体兜底（见下方各风格字体栈）。
4. `scripts/screenshot.js` 会在截图前等待 `document.fonts.ready`，确保字体加载完再拍。

> Latin（英文/数字）字形：本地 woff2 是中文子集，不含 Latin —— 这是**有意为之**，
> Latin 会自动回落到字体栈里的 Georgia / Helvetica / 系统字体，正好符合各风格的设计
> （如 anthropic 标题英文用 Georgia 衬线）。

## 各风格推荐字体栈

把下列字体栈用到对应风格的 `font-family` 中（web 字体在最前，系统字体兜底，
**emoji 字体 `"Noto Color Emoji"` 放在最末**——它只含 emoji 字形，挂在栈尾只会
被 emoji 命中，不影响中英文，但能保证 emoji 在任何环境都彩色显示、不变方块）：

### anthropic（暖米色 editorial）
```css
/* 标题 — 衬线（中文衬线靠 Noto Serif SC 真正生效，英文落 Georgia） */
font-family: "Noto Serif SC", Georgia, "Times New Roman", "Songti SC", "Noto Color Emoji", serif;  /* 标题用 700/900 */
/* 正文 */
font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Color Emoji", sans-serif;
```

### notion（结构化白底）
```css
font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", "Noto Color Emoji", sans-serif;
```

### minimal（极简黑白）
```css
/* 正文 light 用 font-weight:300（Noto Sans SC 300 已嵌入），标题 700 */
font-family: "Noto Sans SC", "Helvetica Neue", -apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Color Emoji", sans-serif;
```

### warm（暖色生活方式 / 小红书原生）
```css
/* 标题 — 圆润手写感 */
font-family: "ZCOOL KuaiLe", "Noto Sans SC", "PingFang SC", "Noto Color Emoji", sans-serif;
/* 正文 */
font-family: "Noto Sans SC", -apple-system, "PingFang SC", "Noto Color Emoji", sans-serif;
```

### morandi（莫兰迪低饱和）
```css
/* 标题 — 文艺细衬 */
font-family: "Noto Serif SC", "ZCOOL XiaoWei", Georgia, "Songti SC", "Noto Color Emoji", serif;
/* 正文 */
font-family: "Noto Sans SC", -apple-system, "PingFang SC", "Noto Color Emoji", sans-serif;
```

## 已嵌入的字体与字重

| 字体 | 字重 | 文件 |
|------|------|------|
| Noto Sans SC | 300 / 400 / 500 / 700 | `assets/fonts/NotoSansSC-{300,400,500,700}.woff2` |
| Noto Serif SC | 500 / 700 / 900 | `assets/fonts/NotoSerifSC-{500,700,900}.woff2` |
| ZCOOL KuaiLe（圆体） | 400 | `assets/fonts/ZCOOLKuaiLe-400.woff2` |
| ZCOOL XiaoWei（细衬） | 400 | `assets/fonts/ZCOOLXiaoWei-400.woff2` |
| Noto Color Emoji（彩色 emoji） | 400 | `assets/fonts/NotoColorEmoji.woff2` |

更新 / 重新下载字体：运行 `bash scripts/setup_fonts.sh`。

## emoji（同样必须嵌入，否则会变方块）

> ⚠️ **不要假设渲染机装了 emoji 字体。** CI / 沙箱 / 某些云环境（如 openclaw）
> 没有 `Noto Color Emoji`，缺了之后所有 emoji 会渲染成空心方块 □（豆腐块，
> 看起来就像"方括号"），并被烧进 PNG。中文靠系统字体不可靠，emoji 同理。

做法和中文字体一样——**本地嵌入**：

1. `assets/fonts.css` 里已经包含 `Noto Color Emoji` 的 `@font-face`（COLRv1 矢量
   彩色字体，Chromium 原生支持，约 5.5MB，已随仓库自带）。整段拷进 HTML 即可。
2. 在**每个文字 `font-family` 栈的末尾**追加 `"Noto Color Emoji"`（上面各风格字体栈
   已示范）。它只含 emoji 字形，挂在栈尾不会影响中英文。
3. 生成前用 `node scripts/check_fonts.js` 预检，确认 emoji 能渲染；截图脚本
   `scripts/screenshot.js` 也会在出图后自动检测豆腐块并报警。
