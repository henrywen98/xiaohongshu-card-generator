# xiaohongshu-card-generator

A [Claude Code](https://docs.claude.com/en/docs/claude-code) **skill** that turns text, articles, or topics into 1–10 styled Xiaohongshu / RedNote (小红书) image cards.

HTML is the intermediate format; the final deliverable is **PNG images** (rendered via Playwright/Chromium).

> 中文：把一段文案、一篇文章或一个主题词，自动生成 1–10 张小红书风格的图文卡片（PNG）。HTML 是中间产物，最终交付物是 PNG 图片。

## Features

- **3 visual styles** (see `references/style-*.md` for full design tokens)
  | style | 中文 | best for |
  |-------|------|----------|
  | `anthropic` | Anthropic 官网风 | tech / AI / product / tutorials |
  | `notion` | Notion 风 | notes / learning / productivity |
  | `minimal` | 极简黑白 | business / design / tech |
- **4 layouts**: `sparse` / `balanced` / `list` / `flow`
- **3 aspect ratios**: `3:4` (1080×1440, default) / `1:1` (1080×1080) / `4:3` (1200×900)
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

- “帮我把这篇文章生成小红书图文” + paste the article
- “把 posts/ai-future.md 做成小红书卡片，用 anthropic 风格，flow 布局”
- “用 notion 风格生成 3 个职场沟通技巧的小红书图片”

The skill triggers on phrases like *生成小红书图文 / 小红书卡片 / 小红书封面 / XHS cards / RedNote images*.

### Screenshot script (standalone)

```bash
node scripts/screenshot.js <dir>/xhs_card_*.html --clean
```

Auto-detects each HTML's canvas size from the `body` width/height, renders in parallel, writes PNGs alongside, and (with `--clean`) deletes the intermediate HTML.

## Layout

```
SKILL.md                 # skill entrypoint / workflow
references/               # full design tokens per style
  style-anthropic.md
  style-notion.md
  style-minimal.md
scripts/
  screenshot.js          # Playwright HTML → PNG batch renderer
  package.json
examples/
  sample_cover_anthropic.html
  sample_cover_anthropic.png
```

## License

MIT — see [LICENSE](LICENSE).
