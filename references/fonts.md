# 字体加载

**正常情况下你不需要读这个文件。** 字体已本地嵌入，`longform_to_html.js` 自动内联，
`screenshot.js` 截图前自动等 `document.fonts.ready`。

## 已嵌入的字体

| 字体 | 字重 | 文件 | 用途 |
|------|------|------|------|
| Noto Sans SC | 400 | `assets/fonts/NotoSansSC-400.woff2` | 正文 |
| Noto Sans SC | 700 | `assets/fonts/NotoSansSC-700.woff2` | 标题 / 小标题 |
| Noto Color Emoji | 400 | `assets/fonts/NotoColorEmoji.woff2` | emoji 彩色 |

> 只保留这 3 个文件，其他字重（300/500）和 ZCOOL 圆体已移除——长图文用不到。
> 字体对应声明在 `assets/fonts.css`，由 `longform_to_html.js` 自动整段拷进每张 HTML。

## 字体出问题的迹象

- **中文回落成粗黑难看**（说明 Noto Sans SC 没加载）
- **emoji 全部变方块 □**（说明 Noto Color Emoji 没加载）
- **大量 □**（说明字体文件本身有问题或路径错）

## 排查步骤

**1. 跑预检看字体文件 + @font-face 加载情况**

```bash
node {skill-root}/scripts/check_fonts.js
```

- ✓ 全部通过 → 字体文件正常，问题可能出在 `screenshot.js` 没等字体（极少见）
- ✗ 文件缺失 → 跑 `bash {skill-root}/scripts/setup_fonts.sh` 重下
- ✗ 加载失败 → 看下面的"重装依赖"

**2. 重装依赖**

```bash
rm -rf scripts/node_modules
cd {skill-root}/scripts && npm install && npx playwright install chromium
```

**3. 看 `{SKILL_ROOT}` 替换是否生效**

```bash
grep -c 'file://' out/xhs_long_01.html   # 应该 > 0
head -20 out/xhs_long_01.html             # 看 file:///path/to/assets/fonts/...
```

如果 `file://` 是空的，说明 skill 根目录没解析对（少见，多发生在符号链接 / 容器挂载点）。

## 重新下载字体

```bash
bash {skill-root}/scripts/setup_fonts.sh
```

只下载 `Noto Sans SC 400/700` 和 `Noto Color Emoji`。
