#!/usr/bin/env node
// 小红书违禁词扫描器（召回 / detector）
// 用法: node check_banned_words.js <files...> [--json] [--strict]
//
// 设计：脚本只负责"召回"——按词库找出所有疑似违禁词并给出分类、上下文、
// 建议替换。它不做自动改写，因为中文子串匹配误报很多（如"最近"含"最"），
// 真正的替换交给人/模型结合上下文判断（见 SKILL.md 的合规检查工序）。
//
// 退出码：默认始终 0；加 --strict 时若命中 high 风险词则退出 1（便于卡流程）。

const fs = require("fs");
const path = require("path");

const DICT_PATH = path.join(__dirname, "..", "data", "banned-words.json");

function parseArgs(argv) {
  const args = argv.slice(2);
  const files = [];
  let json = false;
  let strict = false;
  for (const a of args) {
    if (a === "--json") json = true;
    else if (a === "--strict") strict = true;
    else if (!a.startsWith("--")) files.push(a);
  }
  return { files, json, strict };
}

// 去掉 HTML 标签 / <style> / <script>，只留可见文字，避免误命中属性或 CSS
function stripHtml(text) {
  return text
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function loadDict() {
  const raw = fs.readFileSync(DICT_PATH, "utf-8");
  return JSON.parse(raw);
}

// 返回某个词在文本中的所有命中（含上下文片段）
function findHits(text, word) {
  const hits = [];
  let from = 0;
  while (true) {
    const idx = text.indexOf(word, from);
    if (idx === -1) break;
    const start = Math.max(0, idx - 8);
    const end = Math.min(text.length, idx + word.length + 8);
    const snippet = text
      .slice(start, end)
      .replace(/\s+/g, " ")
      .trim();
    hits.push({ index: idx, snippet });
    from = idx + word.length;
  }
  return hits;
}

function scanFile(filePath, dict) {
  const rawText = fs.readFileSync(filePath, "utf-8");
  const isHtml = /\.html?$/i.test(filePath);
  const text = isHtml ? stripHtml(rawText) : rawText;

  const matches = [];
  for (const cat of dict.categories) {
    for (const t of cat.terms) {
      const hits = findHits(text, t.word);
      if (hits.length === 0) continue;
      matches.push({
        word: t.word,
        category: cat.name,
        categoryId: cat.id,
        risk: cat.risk,
        suggest: (t.suggest || []).filter(Boolean),
        count: hits.length,
        hits,
      });
    }
  }
  return { file: filePath, matches };
}

const RISK_LABEL = { high: "高", medium: "中", low: "低" };
const RISK_ICON = { high: "🔴", medium: "🟡", low: "🟢" };

function printHuman(results) {
  let totalHits = 0;
  let highHits = 0;

  for (const r of results) {
    const rel = path.relative(process.cwd(), r.file) || r.file;
    if (r.matches.length === 0) {
      console.log(`\n✅ ${rel} — 未发现违禁词`);
      continue;
    }
    console.log(`\n📄 ${rel}`);
    // 按风险排序：high > medium > low
    const order = { high: 0, medium: 1, low: 2 };
    const sorted = [...r.matches].sort((a, b) => order[a.risk] - order[b.risk]);
    for (const m of sorted) {
      totalHits += m.count;
      if (m.risk === "high") highHits += m.count;
      const sug = m.suggest.length ? `  → 建议：${m.suggest.join(" / ")}` : "  → 建议：改写或删除";
      console.log(
        `  ${RISK_ICON[m.risk]} [${RISK_LABEL[m.risk]}|${m.category}] 「${m.word}」×${m.count}${sug}`
      );
      for (const h of m.hits.slice(0, 3)) {
        console.log(`      …${h.snippet}…`);
      }
      if (m.hits.length > 3) console.log(`      （另有 ${m.hits.length - 3} 处）`);
    }
  }

  console.log("\n" + "─".repeat(48));
  if (totalHits === 0) {
    console.log("✅ 全部通过：未发现违禁词。");
  } else {
    console.log(`⚠️  共命中 ${totalHits} 处违禁词（其中高风险 ${highHits} 处）。`);
    console.log("   请结合上下文判断是否误报，对真实违禁词进行替换后重新检查。");
  }
  return { totalHits, highHits };
}

function main() {
  const { files, json, strict } = parseArgs(process.argv);
  if (files.length === 0) {
    console.error("用法: node check_banned_words.js <files...> [--json] [--strict]");
    process.exit(2);
  }
  for (const f of files) {
    if (!fs.existsSync(f)) {
      console.error(`文件不存在: ${f}`);
      process.exit(2);
    }
  }

  const dict = loadDict();
  const results = files.map((f) => scanFile(f, dict));

  let highHits = 0;
  if (json) {
    const flat = results.flatMap((r) => r.matches);
    highHits = flat.filter((m) => m.risk === "high").reduce((s, m) => s + m.count, 0);
    console.log(
      JSON.stringify(
        { dictVersion: dict.version, results, summary: { highHits } },
        null,
        2
      )
    );
  } else {
    ({ highHits } = printHuman(results));
  }

  if (strict && highHits > 0) process.exit(1);
  process.exit(0);
}

main();
