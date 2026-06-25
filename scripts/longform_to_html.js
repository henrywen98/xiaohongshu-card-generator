#!/usr/bin/env node
// 长文 → 分页卡片 HTML（「整篇长文 → 分页图集」模式的核心）
//
// 把一整篇长文自动切成多页，每页写成一个独立的 1080×1440 HTML 文件
// （xhs_long_01.html …），再交给 screenshot.js 批量出图。你不手写每一页：
// 脚本按字数 + 「一、二、三」小标题自动分页，统一暖色版式渲染，整组风格一致。
//
// 字体走仓库已嵌入的 Noto Sans SC（无头 Chromium / openclaw 上没有衬线中文字体，
// 只有这套本地 woff2 可靠），所以本地预览 = openclaw 出图。
//
// 用法:
//   node longform_to_html.js <input.(txt|md)> [标题] [--out-dir DIR] [--chars N]

const fs = require("fs");
const path = require("path");

const SKILL_ROOT = path.resolve(__dirname, "..");

const DEFAULT_CHARS_PER_PAGE = 460; // 每页 ~460 字；太少留白多、显空
const HEADING_BREAK_RATIO = 0.4;    // 当前页填到这个比例以上，小标题才另起页（短小节打包同页）
const TITLE_WEIGHT = 180;           // 首页大标题的视觉占位，保持首页清爽

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isHeading(line) {
  return /^[一二三四五六七八九十]、/.test(line.trim());
}

// 按字数切页：小标题在当前页已填够时另起页（否则短小节并入同页），
// 首页用 titleWeight 给大标题预留权重。
function paginate(paragraphs, charsPerPage, titleWeight) {
  const pages = [];
  let cur = [];
  let curChars = titleWeight;
  const breakAt = charsPerPage * HEADING_BREAK_RATIO;

  for (const raw of paragraphs) {
    const s = raw.trim();
    if (!s) continue;
    if (isHeading(s) && curChars >= breakAt && cur.length) {
      pages.push(cur);
      cur = [s];
      curChars = s.length;
    } else if (curChars + s.length > charsPerPage && cur.length) {
      pages.push(cur);
      cur = [s];
      curChars = s.length;
    } else {
      cur.push(s);
      curChars += s.length;
    }
  }
  if (cur.length) pages.push(cur);
  return pages;
}

// 读 assets/fonts.css 并把 {SKILL_ROOT} 换成绝对路径，整段内联进每页 <style>，
// 保证中文（Noto Sans SC）+ emoji（Noto Color Emoji）在任何环境都正常渲染。
function fontFaceBlock() {
  const css = fs.readFileSync(path.join(SKILL_ROOT, "assets", "fonts.css"), "utf-8");
  return css.split("{SKILL_ROOT}").join(SKILL_ROOT);
}

function renderLine(s) {
  if (isHeading(s)) return `  <h2 class="heading">${escapeHtml(s)}</h2>`;
  return `  <p class="para">${escapeHtml(s)}</p>`;
}

function pageHtml({ title, lines, idx, total, fonts }) {
  const head =
    idx === 1 && title
      ? `  <h1 class="title">${escapeHtml(title)}</h1>\n  <div class="divider"></div>\n`
      : "";
  const body = lines.map(renderLine).join("\n");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
${fonts}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { margin: 0; padding: 0; }
body {
  width: 1080px;
  height: 1440px;
  position: relative;
  overflow: hidden;
  background: #f5efe0;
  background-image:
    radial-gradient(circle at 18% 8%, rgba(180,100,60,0.06) 0%, transparent 52%),
    radial-gradient(circle at 84% 92%, rgba(180,100,60,0.08) 0%, transparent 55%);
  color: #1a1a1a;
  font-family: "Noto Sans SC", -apple-system, "PingFang SC", "Noto Color Emoji", sans-serif;
  -webkit-font-smoothing: antialiased;
  padding: 132px 96px;
  /* 垂直居中：内容不足时空白匀到上下，看起来是有意的而非排版断裂 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.title {
  font-size: 68px;
  font-weight: 700;
  line-height: 1.3;
  color: #2a2a2a;
  letter-spacing: 1px;
  position: relative;
  padding-left: 28px;
  margin-bottom: 30px;
}
.title::before {
  content: "";
  position: absolute;
  left: 0; top: 10px; bottom: 10px;
  width: 9px;
  background: #b4643c;
  border-radius: 3px;
}
.divider {
  height: 2px;
  background: linear-gradient(to right, #b4643c 0, #b4643c 92px, transparent 92px);
  margin: 4px 0 46px;
}
.heading {
  font-size: 40px;
  font-weight: 700;
  color: #b4643c;
  line-height: 1.4;
  letter-spacing: 1px;
  margin: 34px 0 22px;
}
.heading:first-child { margin-top: 0; }
.para {
  font-size: 32px;
  font-weight: 400;
  line-height: 1.9;
  color: #1a1a1a;
  letter-spacing: 0.6px;
  text-align: justify;
  text-justify: inter-ideograph;
  margin: 0 0 24px;
  word-break: break-word;
}
.para:last-of-type { margin-bottom: 0; }
.page-num {
  position: absolute;
  left: 0; right: 0; bottom: 56px;
  text-align: center;
  font-size: 24px;
  color: #b8a890;
  letter-spacing: 5px;
}
</style>
</head>
<body>
${head}${body}
  <div class="page-num">${idx} / ${total}</div>
</body>
</html>
`;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const positional = [];
  let outDir = null;
  let chars = DEFAULT_CHARS_PER_PAGE;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out-dir" && args[i + 1]) outDir = args[++i];
    else if (args[i] === "--chars" && args[i + 1]) chars = parseInt(args[++i], 10);
    else if (!args[i].startsWith("--")) positional.push(args[i]);
  }
  return { input: positional[0], title: positional[1] || "", outDir, chars };
}

function main() {
  const { input, title, outDir, chars } = parseArgs(process.argv);
  if (!input) {
    console.error("用法: node longform_to_html.js <input.(txt|md)> [标题] [--out-dir DIR] [--chars N]");
    process.exit(1);
  }

  const text = fs.readFileSync(input, "utf-8");
  const paragraphs = text.trim().split("\n");
  const pages = paginate(paragraphs, chars, title ? TITLE_WEIGHT : 0);
  const total = pages.length;

  const dir = outDir || path.dirname(path.resolve(input));
  fs.mkdirSync(dir, { recursive: true });
  const fonts = fontFaceBlock();

  const written = [];
  pages.forEach((lines, i) => {
    const idx = i + 1;
    const file = path.join(dir, `xhs_long_${String(idx).padStart(2, "0")}.html`);
    fs.writeFileSync(file, pageHtml({ title, lines, idx, total, fonts }), "utf-8");
    written.push(file);
  });

  console.log(`长文分页完成：${text.length} 字 → ${total} 页（~${chars} 字/页）`);
  written.forEach((f) => console.log(`  ${f}`));
  console.log(`\n下一步：node ${path.join("scripts", "screenshot.js")} ${path.join(dir, "xhs_long_*.html")} --clean`);
}

main();
