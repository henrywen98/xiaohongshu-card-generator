# 暖色版式设计令牌

`longform_to_html.js` 用的固定版式。**这份文档是只读的**——读它只是为了让你理解
脚本在做什么（以及万一你想直接改 `longform_to_html.js` 里的 CSS 时，知道哪个变量对什么）。

## 配色

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg` | `#f5efe0` | 页面底（米色，全局背景） |
| `--bg-glow-1` | `rgba(180,100,60,0.06)` | 左上角暖光斑（`radial-gradient`） |
| `--bg-glow-2` | `rgba(180,100,60,0.08)` | 右下角暖光斑 |
| `--ink` | `#1a1a1a` | 正文 |
| `--ink-title` | `#2a2a2a` | 大标题（比正文略浅） |
| `--accent` | `#b4643c` | 小标题、首页左侧色条、标题分隔线 |
| `--muted` | `#b8a890` | 页码 |

> 整组笔记统一一套，**没有主题切换**——这是 mode A 的刻意选择：长图文最怕"花哨换色"
> 让读者分心，米色 + 栗色既不冷淡也不闹。

## 字号（1080×1440 画布）

| 元素 | 字号 | 字重 | 行高 | 备注 |
|------|------|------|------|------|
| 大标题（首页）| 68px | 700 | 1.3 | `letter-spacing: 1px`；左侧 9px 栗色竖条 |
| 小标题 | 40px | 700 | 1.4 | 栗色 `#b4643c` |
| 正文 | 32px | 400 | 1.9 | `text-align: justify`（`text-justify: inter-ideograph`），`letter-spacing: 0.6px` |
| 页码 | 24px | 400 | — | 底部居中，色 `#b8a890` |

## 留白

- 卡片内边距：`132px 96px`（上下 / 左右）
- 标题与小标题间距：`34px`
- 段落间距：`24px`
- 标题前色条：`9px × (top 10, bottom 10)`
- 标题分隔线：`2px` 栗色，长 92px

## 字体

```css
font-family: "Noto Sans SC", -apple-system, "PingFang SC", "Noto Color Emoji", sans-serif;
```

字体已通过 `assets/fonts.css` 内联嵌入（每个 HTML 自动内联 `@font-face` + 替换 `{SKILL_ROOT}`），
**无需手动处理**。

## 排版决策

| 决策 | 怎么定 | 怎么改 |
|------|--------|--------|
| 画布大小 | 固定 1080×1440（3:4 竖版） | 改 `body { width; height }` |
| 每页字数 | 默认 460 | 改 `DEFAULT_CHARS_PER_PAGE` 或传 `--chars` |
| 配色 | 固定暖色 | 直接改 `body { background; color }` 和 `<h2>` 颜色 |
| 字体 | 自动嵌入 | 见 `references/fonts.md` |
| 标题颜色 | 固定栗色 | 改 `.heading { color }` |
| 段落对齐 | `text-align: justify` | 改 `.para { text-align }`（一般不动） |
