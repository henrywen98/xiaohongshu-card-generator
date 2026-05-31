# Morandi 莫兰迪低饱和风格 — 完整设计令牌参考

> 受意大利画家 Giorgio Morandi 的静物色彩启发：低饱和、高级灰、雾面质感。
> 适合穿搭、家居、艺术、香氛、读书笔记等"高级感/质感"内容。

## 设计理念

莫兰迪风的核心是「高级灰」：所有颜色都掺入灰调、降低饱和度，色与色之间和谐不刺眼。
配合文艺细衬线标题、克制的留白、雾面卡片，营造安静、精致、有品味的氛围。

## 字体（必读 references/fonts.md）

`<head>` 追加 `family=ZCOOL+XiaoWei`（文艺细衬，仅 400）+ Noto Serif SC + Noto Sans SC。

```css
/* 标题 — 文艺细衬线 */
font-family: "Noto Serif SC", "ZCOOL XiaoWei", Georgia, "Songti SC", serif;
/* 正文 */
font-family: "Noto Sans SC", -apple-system, "PingFang SC", sans-serif;
```

| 元素 | 字号 | 字重 | 行高 | 特殊 |
|------|------|------|------|------|
| 大标题 | 70-84px | 500-700 | 1.3 | letter-spacing: 1px |
| 小标题 | 42-46px | 500 | 1.4 | — |
| 正文 | 34-38px | 400 | 1.75 | 行高偏大，呼吸感 |
| 标签 | 28-30px | 400 | — | letter-spacing: 4px（西文大写时） |

## 色彩令牌

### 基础色（雾面灰调）

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg-primary` | `#E8E4DD` | 页面主背景（灰米） |
| `--bg-surface` | `#F3F0EA` | 卡片表面（雾白） |
| `--bg-clay` | `#D9CABA` | 陶土色区块 |
| `--bg-sage` | `#C7CDBF` | 灰绿区块 |

### 文字色

| Token | 色值 | 用途 |
|-------|------|------|
| `--text-primary` | `#4D4843` | 主文字（灰褐） |
| `--text-secondary` | `#7A736B` | 副文字 |
| `--text-muted` | `#A79F95` | 极弱文字/页码 |

### 强调色（莫兰迪低饱和）

| Token | 色值 | 用途 |
|-------|------|------|
| `--accent-terracotta` | `#B08068` | 陶土橘（主强调） |
| `--accent-blue` | `#8E9BA8` | 雾霾蓝 |
| `--accent-sage` | `#9CA98C` | 灰绿 |
| `--accent-mauve` | `#A993A0` | 灰紫 |

### 边框

| Token | 色值 | 用途 |
|-------|------|------|
| `--border` | `#D6CFC4` | 低对比细边框 |
| `--divider` | `#CFC7BB` | 分隔线 |

## 组件样式

### 雾面卡片
```css
background: #F3F0EA;
border: 1px solid #D6CFC4;
border-radius: 14px;       /* 小圆角，克制 */
padding: 44px 48px;
/* 无阴影或极淡阴影，保持雾面平静感 */
```

### 色块标签
```css
font-size: 28px;
font-weight: 400;
letter-spacing: 2px;
padding: 8px 24px;
border-radius: 6px;
background: #D9CABA;
color: #4D4843;
```

### 强调细线（标题下）
```css
width: 72px;
height: 2px;
background: #B08068;
```

### 引用块
```css
border-left: 3px solid #B08068;
padding: 28px 40px;
background: transparent;
font-style: italic;
color: #7A736B;
font-size: 36px;
line-height: 1.75;
```

### 配色色卡条（莫兰迪特色装饰）
```css
/* 一排小色块，展示该卡片的莫兰迪取色，很有"调色盘"质感 */
display: flex; gap: 0;
.swatch { width: 64px; height: 64px; border-radius: 4px; }
/* 用 --accent-terracotta / --accent-blue / --accent-sage / --accent-mauve */
```

### 分隔线
```css
height: 1px;
background: #CFC7BB;
```

## 装饰元素

- **双色拼接背景**（莫兰迪经典）：
  ```css
  background: linear-gradient(105deg, #E8E4DD 0% 58%, #D9CABA 58% 100%);
  ```
  或上下分区不同灰调，区块间用 1px 分隔。
- **大号衬线引号** `"` 作装饰（`--text-muted`，font-size 160px，低透明度）。
- **角标小色块 / 编号**：用 `--accent-terracotta` 的细数字编号。
- **页脚统一组件**：左下页码 `01 / 06`，右下 `swipe →`，均用 `--text-muted` + letter-spacing。

## 布局原则（1080×1440 画布）

- 卡片内边距：80-96px，留白充足但比 minimal 略紧。
- 圆角小（6-14px），不要大圆角，也不要纯直角。
- **不用高饱和色、不用强阴影、不用纯黑纯白**——一切掺灰。
- 同一组卡片只用 1 个主强调 + 1-2 个辅助莫兰迪色，保持和谐。
- 对齐严格、网格感强，靠色块分区而非线条堆叠。
