# Step 2 — 自动分页 → 多张 HTML

```bash
node {skill-root}/scripts/longform_to_html.js <article.txt> "主标题" --out-dir <out>
```

例：

```bash
node {skill-root}/scripts/longform_to_html.js ai-thinking.txt "AI 越用越快，我却越来越虚" --out-dir ./out
```

## 脚本做什么

- 读 `article.txt`，按字数 +「一、二、三…」小标题自动切页（每页 ~460 字，可调）
- 每页写一个独立的 `xhs_long_01.html` … `xhs_long_NN.html`
- 暖色版式（米色底 + 栗色标题），字体已内联嵌入，每页自带页码 `1 / N`
- 统一 **1080×1440**（小红书 3:4 竖版）
- 首页会用上你传的"主标题"

## 调参

- `--chars 460`（默认）：每页字数
  - **想更满**（每页信息密度高）→ 调高，如 `--chars 550`
  - **想更松**（更易读、留白多）→ 调低，如 `--chars 380`
- `--out-dir <dir>`：输出目录（默认在 article.txt 同目录）

## 输出

```
out/
  xhs_long_01.html   ← 首页（带主标题）
  xhs_long_02.html
  xhs_long_03.html
  …
```

每张 HTML 都**已内联嵌入字体**（`assets/fonts.css` 整段 `@font-face` + `{SKILL_ROOT}` 替换
成本地绝对路径），所以你直接用浏览器打开就能看，**不需要联网、不需要额外配置**。

## 怎么判断"切得合不合适"

打开 `xhs_long_01.html`（首页）看：
- 标题 + 至少一段正文 = 切得合适
- 只有标题没有正文 = 字数太少（建议加内容，或加更多小标题让首页塞进一段）

打开中间几页：
- 小标题没另起页、被打包进上一页 = 正常（脚本只在"当前页已填够"时才另起页）
- 小标题被孤零零丢在最后一页 = 字数分配略偏，正常情况

下一步：`step-3-compliance.md`，过违禁词再出图。
