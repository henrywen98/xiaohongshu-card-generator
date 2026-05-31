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

把下列字体栈用到对应风格的 `font-family` 中（web 字体在最前，系统字体兜底）：

### anthropic（暖米色 editorial）
```css
/* 标题 — 衬线（中文衬线靠 Noto Serif SC 真正生效，英文落 Georgia） */
font-family: "Noto Serif SC", Georgia, "Times New Roman", "Songti SC", serif;  /* 标题用 700/900 */
/* 正文 */
font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
```

### notion（结构化白底）
```css
font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
```

### minimal（极简黑白）
```css
/* 正文 light 用 font-weight:300（Noto Sans SC 300 已嵌入），标题 700 */
font-family: "Noto Sans SC", "Helvetica Neue", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
```

### warm（暖色生活方式 / 小红书原生）
```css
/* 标题 — 圆润手写感 */
font-family: "ZCOOL KuaiLe", "Noto Sans SC", "PingFang SC", sans-serif;
/* 正文 */
font-family: "Noto Sans SC", -apple-system, "PingFang SC", sans-serif;
```

### morandi（莫兰迪低饱和）
```css
/* 标题 — 文艺细衬 */
font-family: "Noto Serif SC", "ZCOOL XiaoWei", Georgia, "Songti SC", serif;
/* 正文 */
font-family: "Noto Sans SC", -apple-system, "PingFang SC", sans-serif;
```

## 已嵌入的字体与字重

| 字体 | 字重 | 文件 |
|------|------|------|
| Noto Sans SC | 300 / 400 / 500 / 700 | `assets/fonts/NotoSansSC-{300,400,500,700}.woff2` |
| Noto Serif SC | 500 / 700 / 900 | `assets/fonts/NotoSerifSC-{500,700,900}.woff2` |
| ZCOOL KuaiLe（圆体） | 400 | `assets/fonts/ZCOOLKuaiLe-400.woff2` |
| ZCOOL XiaoWei（细衬） | 400 | `assets/fonts/ZCOOLXiaoWei-400.woff2` |

更新 / 重新下载字体：运行 `bash scripts/setup_fonts.sh`。

## emoji

`Noto Color Emoji` 在渲染机已安装，emoji 直接彩色显示，无需额外处理。
