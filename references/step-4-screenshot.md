# Step 4 — 截图生成 PNG

```bash
node {skill-root}/scripts/screenshot.js ./out/xhs_long_*.html --clean
```

## 脚本做什么

- 启无头 Chromium，自动检测每张 HTML 的画布尺寸（从 `body { width: 1080px; height: 1440px; }`）
- 截图前**等 `document.fonts.ready`**——保证 Noto Sans SC + Noto Color Emoji 真的加载完再拍，
  否则会拍到回落的文泉驿黑体 / 豆腐块 □
- 并行处理所有 HTML，输出同名 `.png` 到同目录
- **出图后自动做缺字形检测**（emoji / 符号有没有变方块 □），在末尾打印《视觉自检》报告
- 加 `--clean` 自动删除中间 HTML（最终交付只剩 PNG）
- 加 `--no-audit` 可关闭缺字形检测（一般不需要）

## 视觉自检报告怎么看

**情况 ①：正常**

```
视觉自检（缺字形检测）:
  ✓ 未发现豆腐块 / 缺字形，emoji 与符号渲染正常。
```

→ 字体 / emoji 都正常，进 Step 5。

**情况 ②：个别字符变方块**

```
视觉自检（缺字形检测）:
  ✗ 1 张卡片有字符渲染成方块 □:
     xhs_long_03.png: U+1F389(🎉)
  修复: 嵌入 Noto Color Emoji @font-face 并把 "Noto Color Emoji" 加到 font-family 栈末尾；
        或换掉该字符。改完重跑本脚本。
```

→ **必须修**。先去 `references/fonts.md` 看是不是字体没嵌入；如果是某张 HTML 自己
拼出来的（少见，本 skill 全自动内联），就**直接换掉那个字符**——重跑脚本。

**情况 ③：大量 □**

→ 字体根本没加载。先跑 `node {skill-root}/scripts/check_fonts.js` 看预检。

## 排错顺序

```
PNG 有 □
  ├─ 个别字符
  │    └─ 直接换字符（emoji 选常见的 🔥💡✅ 之类都自带）
  └─ 大量字符 / 全部 □
       └─ 跑 check_fonts.js
            ├─ 文件缺失 → setup_fonts.sh 重下
            └─ 文件齐全但加载失败 → 删 scripts/node_modules 重装
                 └─ 还不通 → 看 references/fonts.md 排查 {SKILL_ROOT} 替换
```

下一步：`step-5-deliver.md`
