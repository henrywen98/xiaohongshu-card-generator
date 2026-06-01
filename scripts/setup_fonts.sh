#!/usr/bin/env bash
# 下载小红书卡片所需的中文 woff2 字体到 assets/fonts/
# 仓库已自带这些字体，本脚本仅用于重新下载 / 更新。
# 用法: bash scripts/setup_fonts.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FONT_DIR="$SCRIPT_DIR/../assets/fonts"
BASE="https://cdn.jsdelivr.net/fontsource/fonts"

mkdir -p "$FONT_DIR"

# 格式: <family-id> <subset> <weight> <输出文件名>
# emoji 用 noto-color-emoji 的 emoji 子集（COLRv1 矢量彩色，Chromium 原生支持），
# 嵌入后 emoji 不再依赖系统字体，避免在缺 Noto Color Emoji 的环境渲染成方块 □。
FONTS=(
  "noto-sans-sc chinese-simplified 300 NotoSansSC-300.woff2"
  "noto-sans-sc chinese-simplified 400 NotoSansSC-400.woff2"
  "noto-sans-sc chinese-simplified 500 NotoSansSC-500.woff2"
  "noto-sans-sc chinese-simplified 700 NotoSansSC-700.woff2"
  "noto-serif-sc chinese-simplified 500 NotoSerifSC-500.woff2"
  "noto-serif-sc chinese-simplified 700 NotoSerifSC-700.woff2"
  "noto-serif-sc chinese-simplified 900 NotoSerifSC-900.woff2"
  "zcool-kuaile chinese-simplified 400 ZCOOLKuaiLe-400.woff2"
  "zcool-xiaowei chinese-simplified 400 ZCOOLXiaoWei-400.woff2"
  "noto-color-emoji emoji 400 NotoColorEmoji.woff2"
)

echo "下载字体到 $FONT_DIR ..."
for entry in "${FONTS[@]}"; do
  read -r family subset weight out <<< "$entry"
  url="$BASE/$family@latest/$subset-$weight-normal.woff2"
  code=$(curl -sS -m 60 -L -o "$FONT_DIR/$out" -w "%{http_code}" "$url")
  if [ "$code" = "200" ]; then
    echo "  ✓ $out"
  else
    echo "  ✗ $out (HTTP $code) — 来源: $url" >&2
  fi
done

echo "完成。字体清单："
ls -lh "$FONT_DIR"/*.woff2 | awk '{print "  " $5, $9}'
