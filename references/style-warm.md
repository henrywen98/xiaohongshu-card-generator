# Warm 暖色生活方式风格 — 完整设计令牌参考

> 小红书原生感最强的一套：奶油暖色、圆角、手写圆体标题、贴纸/胶带装饰。
> 适合生活方式、美食、好物分享、情感、日常碎碎念等"轻松治愈"内容。

## 设计理念

暖色生活风的核心是「松弛治愈」：奶油/奶咖底色、大圆角、柔和阴影、低饱和的
莫兰迪点缀色、手写圆体标题。整体像一张温暖的手帐贴纸，亲切、有呼吸感、不端着。

## 字体（必读 references/fonts.md）

`<head>` 追加 `family=ZCOOL+KuaiLe`（圆体标题，仅 400）+ Noto Sans SC。

```css
/* 标题 — 圆润手写感 */
font-family: "ZCOOL KuaiLe", "Noto Sans SC", "PingFang SC", "Noto Color Emoji", sans-serif;
/* 正文 */
font-family: "Noto Sans SC", -apple-system, "PingFang SC", "Noto Color Emoji", sans-serif;
```

| 元素 | 字号 | 字重 | 行高 |
|------|------|------|------|
| 大标题 | 72-88px | 400(圆体已够粗) | 1.25 |
| 小标题 | 44-50px | 500-700 | 1.4 |
| 正文 | 36-40px | 400 | 1.7 |
| 辅助/标签 | 28-32px | 400-500 | 1.5 |

## 色彩令牌

### 基础色（奶油暖底）

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg-primary` | `#FBF3E9` | 页面主背景（奶咖） |
| `--bg-surface` | `#FFFDF9` | 卡片表面（暖白） |
| `--bg-soft` | `#FCE9DC` | 柔和强调区（浅桃） |
| `--bg-mint` | `#E5F0E8` | 薄荷点缀区 |

### 文字色

| Token | 色值 | 用途 |
|-------|------|------|
| `--text-primary` | `#4A4039` | 主文字（暖棕黑） |
| `--text-secondary` | `#8A7B6E` | 副文字（暖灰棕） |
| `--text-muted` | `#B9AB9C` | 极弱文字/页码 |

### 强调色（低饱和糖果色）

| Token | 色值 | 用途 |
|-------|------|------|
| `--accent-peach` | `#E8896B` | 主强调（柔桃橘） |
| `--accent-rose` | `#D98E9E` | 玫瑰粉 |
| `--accent-mint` | `#7FB295` | 薄荷绿 |
| `--accent-honey` | `#E0B055` | 蜂蜜黄 |

### 边框 / 阴影

| Token | 色值 | 用途 |
|-------|------|------|
| `--border` | `#EDDFCF` | 暖色细边框 |
| `--shadow` | `0 8px 28px rgba(160,120,80,0.10)` | 柔和暖阴影（本风格允许阴影） |

## 组件样式

### 圆角卡片（核心容器）
```css
background: #FFFDF9;
border: 1.5px solid #EDDFCF;
border-radius: 32px;        /* 大圆角是暖风核心 */
padding: 44px 48px;
box-shadow: 0 8px 28px rgba(160,120,80,0.10);
```

### 标签 / 胶囊（糖果色）
```css
font-size: 30px;
font-weight: 500;
padding: 10px 28px;
border-radius: 999px;
background: #FCE9DC;
color: #E8896B;
```

### 贴纸标题块（手写体 + 高亮底）
```css
display: inline-block;
font-family: "ZCOOL KuaiLe", sans-serif;
font-size: 80px;
color: #4A4039;
/* 标题关键词加马克笔高亮 */
em { background: linear-gradient(transparent 55%, #F7D9B8 55%); font-style: normal; }
```

### 引用 / 碎碎念块
```css
background: #FCE9DC;
border-radius: 24px;
padding: 36px 42px;
color: #8A7B6E;
font-size: 36px;
line-height: 1.7;
```

### 列表项（emoji 圆点）
```css
display: flex;
gap: 24px;
align-items: flex-start;
padding: 16px 0;
/* 前缀用 emoji（🌿☀️🍃🧸）或柔色圆点 */
```

### 分隔（虚线 / 波浪）
```css
border-top: 2px dashed #EDDFCF;   /* 手帐虚线分隔 */
```

## 装饰元素（让卡片更"小红书"）

- **背景微噪点 / 暖渐变**（避免死板平涂）：
  ```css
  background:
    radial-gradient(1200px 800px at 80% -10%, #FCE9DC 0%, transparent 60%),
    radial-gradient(900px 700px at -10% 110%, #E5F0E8 0%, transparent 55%),
    #FBF3E9;
  ```
- **胶带 / washi tape**：用一个小圆角矩形 `transform: rotate(-4deg)` 斜贴在卡片角。
- **手绘小图标 / emoji 贴纸**：散落 1-2 个 emoji 作点缀，不要多。
- **页脚统一组件**：左下页码 `01 / 06`（`--text-muted`），右下 `继续滑 →`。

## 布局原则（1080×1440 画布）

- 卡片内边距：72-88px；卡片本身留 40-56px 外边距，露出暖底。
- 圆角统一 24-32px，所有元素圆润，**不要直角**。
- 允许柔和阴影制造贴纸悬浮感（与 minimal 风相反）。
- 配色克制：暖底 + 1 个主强调糖果色，点缀色不超过 2 个。
- 整体偏松弛，留白充足，氛围 > 信息密度。
