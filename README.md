# xiaohongshu-card-generator

A [Claude Code](https://docs.claude.com/en/docs/claude-code) **skill** that turns text, articles, or topics into 1–10 styled Xiaohongshu / RedNote (小红书) image cards.

HTML is the intermediate format; the final deliverable is **PNG images** (rendered via Playwright/Chromium).

> 中文：把一段文案、一篇文章或一个主题词，自动生成 1–10 张小红书风格的图文卡片（PNG）。HTML 是中间产物，最终交付物是 PNG 图片。

## Features

- **2 focused visual styles** (see `references/style-*.md` for full design tokens)
  | style | 中文 | best for |
  |-------|------|----------|
  | `dazibao` ⭐ | 大字报情绪爆款 | **default** — opinions / rants / tips / checklists / tutorials（big-character poster, marker highlights, least "AI-looking"） |
  | `minimal` | 极简黑白 | hardcore tech / long tutorials where 大字报 feels too loud |
- **Anti-"AI-flavor" copywriting** — `references/copywriting.md` drives emotional-hook titles (救命/谁懂啊/后悔没早知道), first-person colloquial body copy, and an AI-tell red-flag checklist, so posts read like a real person wrote them rather than a template. Default leans **text-first, fewer cards** (1 cover + 2–4 big-text cards + a substantive caption)
- **3 aspect ratios**: `3:4` (1080×1440, default) / `1:1` (1080×1080) / `4:3` (1200×900)
- **Embedded fonts — Chinese *and* emoji** — Noto Sans/Serif SC + ZCOOL fonts **and a color-emoji font (Noto Color Emoji)** bundled as local `woff2` and loaded via `@font-face`, so headless Chromium renders crisp Chinese typography (serif titles, light weights) and full-color emoji instead of falling back — no network needed at render time. Crucially, **emoji no longer depend on a system font**, so they don't turn into `□` tofu boxes on environments that lack one (CI / sandboxes / some clouds)
- **Font preflight + post-render self-check** — `check_fonts.js` verifies (before generating) that every bundled font loads and emoji actually render; `screenshot.js` then audits every PNG (after rendering) for missing-glyph "tofu" boxes and reports exactly which cards/characters are affected
- **Banned-word compliance check** — scans card text & caption against a categorized 小红书 sensitive-word dictionary (ad-law absolutes, medical claims, off-platform diversion, etc.) and suggests replacements, so posts are less likely to get throttled
- Auto-splits content into cover / content / summary cards
- Generates a ready-to-post `小红书文案.md` (title + body + hashtags)

## Install (as a Claude Code skill)

Clone into your skills directory:

```bash
git clone https://github.com/henrywen98/xiaohongshu-card-generator.git \
  ~/.claude/skills/xhs-image-gen
```

Then install the screenshot script's dependency (one time):

```bash
cd ~/.claude/skills/xhs-image-gen/scripts
npm install && npx playwright install chromium
```

## Usage

Inside Claude Code, just ask in natural language, e.g.:

- “帮我把这篇文章生成小红书图文” + paste the article（defaults to the `dazibao` style）
- “把 posts/ai-future.md 做成小红书卡片”
- “用 minimal 风格生成 3 个职场沟通技巧的小红书图片”

The skill triggers on phrases like *生成小红书图文 / 小红书卡片 / 小红书封面 / XHS cards / RedNote images*.

### Font preflight (standalone)

```bash
node scripts/check_fonts.js          # add --strict to exit non-zero on failure
```

Launches headless Chromium, confirms every bundled `@font-face` loads, and renders a Chinese + emoji probe to verify emoji come out in color (not `□` tofu boxes). Run it before generating, especially on a new environment.

### Screenshot script (standalone)

```bash
node scripts/screenshot.js <dir>/xhs_card_*.html --clean
```

Auto-detects each HTML's canvas size from the `body` width/height, renders in parallel, writes PNGs alongside, and (with `--clean`) deletes the intermediate HTML. After rendering it audits each PNG for missing-glyph "tofu" and prints which cards/characters are affected (disable with `--no-audit`).

## Layout

```
SKILL.md                 # skill entrypoint / workflow
references/               # full design tokens per style + guides
  style-dazibao.md       # ⭐ default: big-character poster, emotional, least "AI-looking"
  style-minimal.md       # clean B&W fallback for hardcore tech / tutorials
  copywriting.md         # anti-AI-flavor: hook titles + colloquial body + red-flag checklist
  fonts.md               # font-embedding spec (read before generating)
  banned-words.md        # compliance check rationale & replacement rules
assets/
  fonts.css              # @font-face block incl. emoji (copy into HTML, replace {SKILL_ROOT})
  fonts/*.woff2          # bundled fonts: Noto Sans SC + ZCOOL KuaiLe + Noto Color Emoji
data/
  banned-words.json      # categorized sensitive-word dictionary
scripts/
  screenshot.js          # Playwright HTML → PNG batch renderer (waits for fonts, audits for tofu)
  check_fonts.js         # font preflight: bundled fonts load + emoji renders (run before generating)
  check_banned_words.js  # banned-word scanner (recall) → report + suggestions
  lib/glyph_audit.js     # shared missing-glyph (tofu) detector used by both scripts
  setup_fonts.sh         # (re)download bundled fonts (incl. emoji)
  package.json
examples/
  sample_cover_dazibao.html    # ⭐ default-style cover sample
  sample_cover_dazibao.png
```

## License

MIT — see [LICENSE](LICENSE).
