#!/usr/bin/env node
// 字体预检 —— 生成卡片【之前】先跑一遍，确认渲染机能正确加载本地字体、能渲染 emoji。
//
// 为什么需要：截图在无头 Chromium 里跑，不同环境（CI / 沙箱 / 某些云如 openclaw）
// 装的系统字体不一样。中文字体本仓库已用 @font-face 嵌入；但 emoji 以前依赖系统
// 的 Noto Color Emoji，缺了就渲染成空心方块 □（用户说的"方括号"）。本脚本会：
//   1. 检查所有随仓库字体文件是否都在 assets/fonts/
//   2. 启浏览器，按 assets/fonts.css 注入全部 @font-face，逐个确认真的加载成功
//   3. 实测渲染一组中文 + emoji，用豆腐块检测确认 emoji 不会变方块
//   4. 顺带报告系统是否装了 emoji 字体（仅供参考，不依赖它）
//
// 用法: node check_fonts.js [--strict] [--json]
//   --strict  有任何关键字体缺失 / emoji 渲染失败时退出码为 1（适合 CI 卡关）
//   --json    输出结构化结果

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { auditMissingGlyphsInPage } = require("./lib/glyph_audit");

const SKILL_ROOT = path.resolve(__dirname, "..");
const FONTS_DIR = path.join(SKILL_ROOT, "assets", "fonts");
const FONTS_CSS = path.join(SKILL_ROOT, "assets", "fonts.css");

// 期望随仓库自带的字体文件（与 assets/fonts.css 对应）。
// 长图文只用 Noto Sans SC 400/700 + Noto Color Emoji 三个，其他字重已移除。
const EXPECTED_FILES = [
  "NotoSansSC-400.woff2",
  "NotoSansSC-700.woff2",
  "NotoColorEmoji.woff2",
];

// 要在浏览器里逐个确认能加载的 (family, weight)
const FONT_CHECKS = [
  ["Noto Sans SC", 400],
  ["Noto Sans SC", 700],
  ["Noto Color Emoji", 400],
];

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    strict: args.includes("--strict"),
    json: args.includes("--json"),
  };
}

function checkFiles() {
  return EXPECTED_FILES.map((name) => {
    const p = path.join(FONTS_DIR, name);
    const exists = fs.existsSync(p);
    const size = exists ? fs.statSync(p).size : 0;
    // 空文件 / Git LFS 占位符（几百字节）也算缺失
    const ok = exists && size > 10 * 1024;
    return { name, ok, size };
  });
}

function buildProbeHtml() {
  const css = fs.readFileSync(FONTS_CSS, "utf-8").replace(/\{SKILL_ROOT\}/g, SKILL_ROOT);
  // 覆盖各风格会用到的字体，并带上 emoji；body 字体栈末尾挂 "Noto Color Emoji"
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${css}
body{margin:0;background:#fff;width:600px;}
.row{font-size:40px;padding:8px 16px;}
.sans{font-family:"Noto Sans SC","Noto Color Emoji",sans-serif;}
.kuaile{font-family:"ZCOOL KuaiLe","Noto Sans SC","Noto Color Emoji",sans-serif;}
</style></head><body>
<div class="row sans">小红书无衬线 🎉✨🔥✅💡</div>
<div class="row kuaile">圆体标题 🧸🍰</div>
</body></html>`;
}

async function run() {
  const { strict, json } = parseArgs(process.argv);

  const files = checkFiles();
  const missingFiles = files.filter((f) => !f.ok);

  let fontLoad = [];
  let emojiTofu = [];
  let renderError = null;

  // 文件齐全才值得起浏览器实测
  const html = buildProbeHtml();
  const tmp = path.join(require("os").tmpdir(), `xhs-fontcheck-${process.pid}.html`);
  fs.writeFileSync(tmp, html);

  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 600, height: 240 });
    await page.goto(`file://${tmp}`, { waitUntil: "networkidle" });
    await Promise.race([page.evaluate(() => document.fonts.ready), page.waitForTimeout(5000)]);

    // @font-face 是按需懒加载的：没被用到的字重 document.fonts.check 会返回 false。
    // 所以先用中文样本显式 load 每个 (family, weight)，再判断是否真的可用。
    fontLoad = await page.evaluate(async (checks) => {
      const out = [];
      for (const [family, weight] of checks) {
        const spec = `${weight} 24px "${family}"`;
        let loaded = false;
        try {
          const faces = await document.fonts.load(spec, "小红书");
          loaded = faces.length > 0 && document.fonts.check(spec, "小红书");
        } catch {
          loaded = false;
        }
        out.push({ family, weight, loaded });
      }
      return out;
    }, FONT_CHECKS);

    // emoji 是否回落成豆腐块（核心检查）
    emojiTofu = await page.evaluate(auditMissingGlyphsInPage);

    await page.close();
  } catch (e) {
    renderError = e.message;
  } finally {
    if (browser) await browser.close();
    try { fs.unlinkSync(tmp); } catch {}
  }

  const failedFontLoads = fontLoad.filter((f) => !f.loaded);
  const ok = !renderError && missingFiles.length === 0 && failedFontLoads.length === 0 && emojiTofu.length === 0;

  if (json) {
    console.log(JSON.stringify({ ok, files, fontLoad, emojiTofu, renderError }, null, 2));
  } else {
    printReport({ ok, files, missingFiles, fontLoad, failedFontLoads, emojiTofu, renderError });
  }

  if (strict && !ok) process.exit(1);
}

function printReport({ ok, files, missingFiles, fontLoad, failedFontLoads, emojiTofu, renderError }) {
  console.log("字体预检 (font preflight)\n");

  console.log("① 字体文件:");
  for (const f of files) {
    const kb = (f.size / 1024).toFixed(0);
    console.log(`   ${f.ok ? "✓" : "✗"} ${f.name}${f.ok ? `  (${kb} KB)` : "  缺失/异常"}`);
  }

  if (renderError) {
    console.log(`\n② 浏览器渲染检查: ✗ 无法启动/渲染 —— ${renderError}`);
    console.log("   提示: 先装依赖  cd scripts && npm install && npx playwright install chromium");
  } else {
    console.log("\n② @font-face 加载:");
    for (const f of fontLoad) {
      console.log(`   ${f.loaded ? "✓" : "✗"} ${f.family} ${f.weight}`);
    }

    console.log("\n③ emoji 渲染:");
    if (emojiTofu.length === 0) {
      console.log("   ✓ emoji 正常（已用嵌入的 Noto Color Emoji 彩色渲染，不会出现方块 □）");
    } else {
      console.log("   ✗ 检测到 emoji 渲染成豆腐块/方块 □（即你看到的“方括号”）:");
      for (const t of emojiTofu) console.log(`       ${t.codepoint} ${t.char}`);
      console.log("   修复: 确认 HTML 里嵌入了 assets/fonts.css 的 Noto Color Emoji @font-face,");
      console.log("         并在文字 font-family 栈末尾加上 \"Noto Color Emoji\"。");
    }
  }

  console.log(`\n结论: ${ok ? "✓ 通过，可以开始生成卡片。" : "✗ 有问题，请先按上面提示修复再生成。"}`);
  if (missingFiles.length && missingFiles.some((f) => f.name === "NotoColorEmoji.woff2")) {
    console.log("      （emoji 字体缺失可运行: bash scripts/setup_fonts.sh 重新下载）");
  }
}

run().catch((err) => {
  console.error("字体预检失败:", err.message);
  process.exit(1);
});
