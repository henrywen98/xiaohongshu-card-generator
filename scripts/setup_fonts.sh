#!/usr/bin/env bash
# 下载小红书卡片所需的中文 woff2 字体到 assets/fonts/
# 仓库已自带这些字体，本脚本仅用于重新下载 / 更新。
# 用法: bash scripts/setup_fonts.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FONT_DIR="$SCRIPT_DIR/../assets/fonts"
BASE="https://cdn.jsdelivr.net/fontsource/fonts"
SUB="chinese-simplified"

mkdir -p "$FONT_DIR"

# 格式: <family-id> <weight> <输出文件名>
FONTS=(
  "noto-sans-sc 300 NotoSansSC-300.woff2"
  "noto-sans-sc 400 NotoSansSC-400.woff2"
  "noto-sans-sc 500 NotoSansSC-500.woff2"
  "noto-sans-sc 700 NotoSansSC-700.woff2"
  "noto-serif-sc 500 NotoSerifSC-500.woff2"
  "noto-serif-sc 700 NotoSerifSC-700.woff2"
  "noto-serif-sc 900 NotoSerifSC-900.woff2"
  "zcool-kuaile 400 ZCOOLKuaiLe-400.woff2"
  "zcool-xiaowei 400 ZCOOLXiaoWei-400.woff2"
)

echo "下载字体到 $FONT_DIR ..."
for entry in "${FONTS[@]}"; do
  read -r family weight out <<< "$entry"
  url="$BASE/$family@latest/$SUB-$weight-normal.woff2"
  code=$(curl -sS -m 60 -L -o "$FONT_DIR/$out" -w "%{http_code}" "$url")
  if [ "$code" = "200" ]; then
    echo "  ✓ $out"
  else
    echo "  ✗ $out (HTTP $code) — 来源: $url" >&2
  fi
done

echo "完成。字体清单："
ls -lh "$FONT_DIR"/*.woff2 | awk '{print "  " $5, $9}'
