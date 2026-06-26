# xhs-image-gen

A [Claude Code](https://docs.claude.com/en/docs/claude-code) **skill** that turns a long article / reflection / tutorial into a swipable Xiaohongshu (小红书) image carousel — multiple 1080×1440 PNGs, auto-paginated, warm-tone layout.

> 中文：把整篇文章 / 反思 / 教程 / 笔记自动铺成可翻阅的小红书长图文（多页 PNG），暖色版式、按字数和「一、二、三」小标题自动分页。

## Features

- **One focus: long-text → image carousel** — write `article.txt`, get a folder of `xhs_long_*.png` ready to upload
- **Auto-pagination** — `longform_to_html.js` splits by character count and `一、二、三` subheadings, no manual layout work
- **Warm-tone fixed layout** — 米色底 `#f5efe0` + 栗色强调 `#b4643c`, font sizes & spacing designed for 1080×1440 (`references/styles.md`)
- **Bundled Chinese + emoji fonts** — Noto Sans SC 400/700 + Noto Color Emoji as local `woff2` + `@font-face`, so headless Chromium renders crisp Chinese and color emoji in any environment (CI / sandbox / openclaw). No network at render time
- **Font preflight + post-render self-check** — `check_fonts.js` verifies the bundled fonts load before generating; `screenshot.js` audits every PNG for missing-glyph "tofu" boxes and reports exactly which pages/characters are affected
- **Banned-word compliance check** — scans all pages against a categorized 小红书 sensitive-word dictionary (ad-law absolutes, medical claims, off-platform diversion, etc.) and suggests replacements, so posts are less likely to get throttled

## Install (as a Claude Code skill)

```bash
git clone https://github.com/henrywen98/xiaohongshu-card-generator.git \
  ~/.claude/skills/xhs-image-gen
```

> 远端 repo 名沿用旧的 `xiaohongshu-card-generator`（避免破坏现有 clone 链接），
> 实际装到本地后目录叫 `xhs-image-gen`（skill 名）。

Then one-time setup:

```bash
cd ~/.claude/skills/xhs-image-gen/scripts
npm install && npx playwright install chromium
node scripts/check_fonts.js   # 字体预检
```

## Usage

Inside Claude Code, just ask in natural language, e.g.:

- "把这篇长文做成小红书长图文 / 图集" + paste the article
- "把 posts/ai-future.md 做成小红书图集"
- "把这段反思发成小红书，原文铺成图就行"

The skill triggers on phrases like *小红书长图文 / 长文图 / 图集 / 发小红书 / 铺成图* or any paste of a long article intended for 小红书.

See [SKILL.md](SKILL.md) for the full 5-step workflow.

### One-shot example

```bash
# 1. Write your article to article.txt (use 一、二、三… for subheadings)
# 2. Auto-paginate
node scripts/longform_to_html.js article.txt "我的标题" --out-dir ./out

# 3. Compliance check (fix any high-risk hits)
node scripts/check_banned_words.js ./out/xhs_long_*.html

# 4. Render PNGs (auto waits for fonts + audits for tofu)
node scripts/screenshot.js ./out/xhs_long_*.html --clean
```

Output: `out/xhs_long_01.png` … `xhs_long_NN.png`, ready to upload to 小红书 in order.

## Layout

```
SKILL.md                    # entry point + 5-step workflow index
references/
  step-1-prepare.md         # write article.txt
  step-2-paginate.md        # longform_to_html.js usage
  step-3-compliance.md      # check_banned_words.js usage + replacement guide
  step-4-screenshot.md      # screenshot.js usage + audit report
  step-5-deliver.md         # manual review + delivery
  styles.md                 # warm-tone design tokens (read-only)
  fonts.md                  # font loading (read when troubleshooting)
assets/
  fonts.css                 # @font-face block (auto-inlined into HTML)
  fonts/*.woff2             # bundled: Noto Sans SC 400/700 + Noto Color Emoji
data/
  banned-words.json         # categorized sensitive-word dictionary
scripts/
  longform_to_html.js       # long text → paginated HTML
  screenshot.js             # HTML → PNG batch renderer (waits for fonts, audits for tofu)
  check_fonts.js            # font preflight: bundled fonts load + emoji renders
  check_banned_words.js     # banned-word scanner (recall)
  lib/glyph_audit.js        # shared missing-glyph (tofu) detector
  setup_fonts.sh            # (re)download bundled fonts
  package.json
examples/
  sample_longform_title.png # rendered cover page sample
  sample_longform_body.png  # rendered body page sample
evals/                     # 维护者工具：trigger eval + 调 description
  trigger-eval.json         #   20 条 query（10 should-trigger / 10 should-not）
  run-trigger-eval.sh       #   跑 trigger eval 准确率（需 pi CLI，可选）
```

> `evals/` 是**给维护者调的**——别人 clone 后不跑这个也能正常使用本 skill。脚本要
> pi CLI，没装会报错；不装的话删 evals/ 整目录即可。

## License

MIT — see [LICENSE](LICENSE).
