// 共享的"缺字形/豆腐块"检测逻辑（emoji 缺字体时会渲染成空心方块 □，即用户说的"方括号"）。
//
// 原理：在页面里把每个候选字符画到 canvas，再画一个"保证没有字形"的控制码点
// （U+10FFFF）。如果两者像素完全一致，说明该字符回落到了 .notdef 字形（豆腐块）。
// 只检查 emoji / 符号 / 箭头等"中英文字体通常不含"的码点，避开正文标点造成的误报。

// 这个函数会被 page.evaluate 序列化后丢进浏览器执行，所以不能引用外部变量。
function auditMissingGlyphsInPage() {
  function signature(ch, font) {
    const c = document.createElement("canvas");
    c.width = 28;
    c.height = 28;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 28, 28);
    ctx.font = '22px ' + font;
    ctx.textBaseline = "top";
    ctx.fillText(ch, 2, 2);
    return c.toDataURL();
  }

  const CONTROL = String.fromCodePoint(0x10ffff); // 永远没有字形，作为豆腐块基准

  const isSkip = (cp) =>
    cp === 0x200d ||                      // ZWJ（emoji 连接符）
    (cp >= 0xfe00 && cp <= 0xfe0f) ||     // 变体选择符
    (cp >= 0x1f3fb && cp <= 0x1f3ff) ||   // 肤色修饰符
    (cp >= 0x1f1e6 && cp <= 0x1f1ff);     // 区域指示符（国旗，单独渲染会误报）

  const isCandidate = (cp) =>
    (cp >= 0x2190 && cp <= 0x2bff) ||     // 箭头 / 数学符号 / 杂项符号 / 装饰符号
    (cp >= 0x1f300 && cp <= 0x1faff);     // emoji

  const cache = new Map(); // "cp|font" -> 是否有真实字形
  const counts = new Map(); // "U+XXXX char" -> 出现次数

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const el = node.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) continue;
    const font = cs.fontFamily;
    for (const ch of Array.from(node.textContent)) {
      const cp = ch.codePointAt(0);
      if (isSkip(cp) || !isCandidate(cp)) continue;
      const key = cp + "|" + font;
      let hasGlyph;
      if (cache.has(key)) {
        hasGlyph = cache.get(key);
      } else {
        hasGlyph = signature(ch, font) !== signature(CONTROL, font);
        cache.set(key, hasGlyph);
      }
      if (!hasGlyph) {
        const label = "U+" + cp.toString(16).toUpperCase() + " " + ch;
        counts.set(label, (counts.get(label) || 0) + 1);
      }
    }
  }

  const missing = [];
  for (const [label, count] of counts) {
    const sp = label.indexOf(" ");
    missing.push({ codepoint: label.slice(0, sp), char: label.slice(sp + 1), count });
  }
  return missing;
}

module.exports = { auditMissingGlyphsInPage };
