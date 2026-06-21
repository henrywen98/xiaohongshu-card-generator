# Dazibao 大字报情绪爆款风格 — 完整设计令牌参考

> 小红书"爆款封面"那一挂：高对比亮底、超粗大字、马克笔划重点、便利贴/笔记截图感、
> emoji 热闹、略带手作不完美。**这是去 AI 味、最像"真人随手做"的一套，默认风格。**
> 适合：观点/吐槽/经验贴、干货清单、避坑、教程钩子、情绪共鸣——几乎所有想要高点击的内容。

## 设计理念

大字报的核心是「**一眼抓住 + 不端着**」。它故意**反"精致设计系统"**：

- **要**：超大粗标题占满视觉、高对比亮色、马克笔/荧光划重点、便利贴胶带手账元素、
  emoji 穿插、信息密度高（文字为主）、元素轻微歪斜错位的"手作不完美感"。
- **不要**（这些正是 AI 味/品牌物料感的来源）：均匀网格、冷淡大留白、单一品牌主色、
  优雅衬线、居中对称的"海报范"、句尾整齐排列的 emoji。

一句话：别做得像广告公司的 banner，要做得像一个真人用美图/黄油相机随手拼的笔记封面。

## 字体（必读 references/fonts.md）

中文标题用 **Noto Sans SC 700**（已嵌入的最重中文黑体）+ `-webkit-text-stroke` 再增粗，
撑起"大字报"的冲击力。可选 ZCOOL KuaiLe 圆体做俏皮变体。字体栈末尾必带 `"Noto Color Emoji"`。

```css
/* 大字报标题 — 超粗黑体 + 描边增重 */
font-family: "Noto Sans SC", -apple-system, "PingFang SC", "Microsoft YaHei", "Noto Color Emoji", sans-serif;
/* 正文 / 清单 */
font-family: "Noto Sans SC", -apple-system, "PingFang SC", "Noto Color Emoji", sans-serif;
/* 可选俏皮变体（生活/治愈类）*/
font-family: "ZCOOL KuaiLe", "Noto Sans SC", "PingFang SC", "Noto Color Emoji", sans-serif;
```

| 元素 | 字号 | 字重 | 行高 | 特殊 |
|------|------|------|------|------|
| 封面主标题 | 100-140px | 700 | 1.05-1.15 | `letter-spacing:-1px`；`-webkit-text-stroke: 1.2px currentColor` 增粗 |
| 内容卡标题 | 72-92px | 700 | 1.15 | 关键词单独成行+放大+高亮 |
| 正文 / 清单 | 38-46px | 500 | 1.55-1.7 | 比其它风格更密更实 |
| 标签 / 角标 | 30-36px | 500-700 | 1.4 | 可放进便利贴/胶带里 |

> **增粗技巧**：Noto Sans SC 最重只到 700。封面大字加 `-webkit-text-stroke: 1.2px currentColor`
> （描边色 = 文字色）即可逼近"黑体 Heavy"的厚重感；想更狠可叠一层同色 `text-shadow`。

## 色彩令牌

高对比亮色，**底色鲜明、文字够重、强调够跳**。提供 4 套主题，按内容情绪挑一套，
**整张笔记统一用一套**（封面到内容卡配色一致，像同一个人做的）。

### 主题 A — 奶黄黑（默认，万能、显眼、不挑内容）

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg` | `#FFF3D6` | 主背景（高明度奶黄） |
| `--ink` | `#1A1A1A` | 主文字（近黑，够重） |
| `--accent` | `#FF3B30` | 强调（番茄红，跳） |
| `--hl` | `rgba(255,229,77,.85)` | 马克笔高亮（荧光黄） |
| `--card` | `#FFFFFF` | 便利贴/白块 |

### 主题 B — 樱花粉（情感/好物/女性向）

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg` | `#FFE3EC` | 主背景（樱花粉） |
| `--ink` | `#3A2030` | 主文字（深莓） |
| `--accent` | `#FF4D8D` | 强调（玫红） |
| `--hl` | `rgba(255,122,170,.55)` | 马克笔高亮（荧光粉） |
| `--card` | `#FFFFFF` | 便利贴/白块 |

### 主题 C — 薄荷绿（干货/学习/避坑）

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg` | `#D8F3E3` | 主背景（薄荷） |
| `--ink` | `#15302A` | 主文字（深墨绿） |
| `--accent` | `#00B36B` | 强调（鲜绿） |
| `--hl` | `rgba(126,240,160,.7)` | 马克笔高亮（荧光绿） |
| `--card` | `#FFFFFF` | 便利贴/白块 |

### 主题 D — 电光蓝（科技/效率/职场）

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg` | `#DCE9FF` | 主背景（淡蓝） |
| `--ink` | `#10213D` | 主文字（深藏蓝） |
| `--accent` | `#2B6CFF` | 强调（电光蓝） |
| `--hl` | `rgba(120,180,255,.6)` | 马克笔高亮（荧光蓝） |
| `--card` | `#FFFFFF` | 便利贴/白块 |

> 对比度优先：底色高明度、文字近黑/深色，强调色饱和。**避免低饱和"高级灰/莫兰迪"配色**
> ——那是另一种文艺路线，会削掉大字报的冲击力。

## 组件样式

### 封面主标题（大字报核心）
```css
font-size: 120px;
font-weight: 700;
line-height: 1.1;
letter-spacing: -1px;
color: var(--ink);
-webkit-text-stroke: 1.2px var(--ink);   /* 增重到接近 Heavy */
/* 关键词单独成行、可换强调色 */
```
```css
/* 标题里的强调词 */
.title .pop { color: var(--accent); }
```

### 马克笔高亮（划重点，最具"真人感"的元素）
```css
.hl {
  background: linear-gradient(transparent 58%, var(--hl) 58%);  /* 只盖下半，像荧光笔扫过 */
  padding: 0 4px;
  display: inline-block;
  transform: rotate(-1.5deg);   /* 轻微歪，伪手涂 */
}
```

### 便利贴 / 色块（放要点、金句）
```css
.sticky {
  background: var(--card);
  border-radius: 10px;
  padding: 28px 32px;
  box-shadow: 6px 8px 0 rgba(0,0,0,.10);   /* 硬投影，便签贴纸感（非柔和阴影） */
  transform: rotate(-1deg);                 /* 轻微歪 */
}
```

### 胶带 / washi tape（贴在卡片角或便利贴上）
```css
.tape {
  width: 180px; height: 46px;
  background: rgba(255,255,255,.55);
  transform: rotate(-6deg);
  /* 半透明小矩形斜贴，制造"贴上去"的手账感 */
}
```

### ✅ / ❌ 对比清单（大字报最爱）
```css
.checklist li {
  font-size: 44px;
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 22px;
  list-style: none;
}
/* 前缀直接用 emoji：✅ 对 / ❌ 错 / 👉 重点 / 🔥 / 💡 / ⚠️ */
```

### 圆珠笔波浪下划线（强调短句）
```css
.underline-wave {
  text-decoration: underline wavy var(--accent);
  text-underline-offset: 10px;
  text-decoration-thickness: 4px;
}
```

### 虚线框 / 圈出（手画"圈重点"感）
```css
.circle-it {
  border: 4px dashed var(--accent);
  border-radius: 50% 48% 52% 50%;   /* 非正圆，手画感 */
  padding: 10px 26px;
  transform: rotate(-2deg);
}
```

### 左滑提示（替代冷冰冰的页码）
```css
.swipe {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent);
}
/* 文案要口语：👉 左滑有保姆级教程 / 后面更炸 → / 划到最后有彩蛋🥚 */
```

## 装饰元素（让卡片更"小红书"、更不像 AI）

- **emoji 穿插**：标题里、清单前缀、金句旁都可以放，**不要排在句尾**。常用：
  😭🔥💡✅❌👉🥹💯⚠️🙋‍♀️🉑（数量可以比其它风格多，但别糊成一片）。
- **轻微歪斜**：标题块/便利贴/胶带各 `rotate(-2deg ~ 2deg)`，别全部水平对齐——一点
  不规则就有"真人随手拼"的味道。
- **硬投影而非柔和阴影**：便利贴用 `box-shadow: 6px 8px 0 rgba(0,0,0,.1)`（实心偏移），
  比柔和发光的阴影更有"贴纸"实物感。
- **去系统页码**：不用 `01 / 08` 那种冷冰冰编号；要嘛不放，要嘛换成口语左滑提示。

## 布局原则（1080×1440 画布）

- 卡片内边距：72-90px。背景直接用 `--bg` 平铺亮色，**不留冷淡大白边**。
- **标题占主视觉**：封面 60% 以上面积给大字标题，副信息（钩子句/标签）压在下方。
- 信息密度可比其它风格高——大字报本来就是"文字为主"。但单卡聚焦**一个**点，别堆全文
  （详细干货交给正文文案，见 `references/copywriting.md`）。
- 对齐以**左对齐为主**，少用居中（居中对称=海报范=端着）。
- 允许元素轻微重叠/错位（如标题压着一条色带、便利贴叠在底色块上）。
- 整套笔记**配色/字体统一**：像同一个人一次做完，不要每张换风格。
