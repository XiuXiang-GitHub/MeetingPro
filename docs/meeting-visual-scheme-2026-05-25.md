# meeting — 视觉方案文档 (Visual Scheme)

> 艺术指导：精密图纸 (The Precision Blueprint)  
> 日期：2026-05-25  
> 平台约束：微信小程序原生 (WXML + WXSS)，无 WebGL，无外部 Web 字体，动画仅支持 ease/ease-in/ease-out/ease-in-out/linear

---

## 视觉宣言 (Visual Manifesto)

> **会议空间是一张可以被精确测量、排列和掌控的工程图纸。**
>
> 每一个家具坐标、每一位员工的排班、每一场会议的档期，都是这张蓝图上的一条线、一个标注、一个坐标点。我们拒绝装饰性的视觉噪音，用网格、细线、坐标感构建一个让会议经理感到"一切尽在掌控"的精密指挥台。

---

## 1. 颜色系统 (Color Tokens)

### 1.1 浅色模式（唯一模式）

依托"蓝图晒印"意象，将传统蓝图的铁氰蓝（Prussian Blue）转化为现代数字界面的色彩体系。

| Token | Hex | 角色 | 使用位置 |
|-------|-----|------|----------|
| `--color-bg-canvas` | `#f2f4f7` | 蓝图底纸 | 页面全局背景 |
| `--color-bg-surface` | `#ffffff` | 表面/卡片 | 卡片、列表项、弹窗 |
| `--color-bg-elevated` | `#fafbfc` | 微浮层 | 表头、选中行、hover态 |
| `--color-grid-line` | `#e2e6ed` | 网格线 | 分割线、边框、摆台画布网格 |
| `--color-grid-subtle` | `#eef0f4` | 弱网格线 | 大面积底色网格（摆台画布背景） |
| `--color-brand` | `#1a5cb0` | 品牌蓝图蓝 | 主按钮、选中态、链接、图标高亮 |
| `--color-brand-dim` | `#e8f0fa` | 蓝图淡色 | 选中背景、标签底色、信息条 |
| `--color-text-primary` | `#171a1f` | 主文字 | 标题、正文、列表项主文字 |
| `--color-text-secondary` | `#5f6977` | 次文字 | 辅助说明、时间戳、标签文字 |
| `--color-text-tertiary` | `#949eab` | 弱文字 | 占位符、禁用态、空状态引导 |
| `--color-warning` | `#e67e0a` | 警告橙 | 间距过近警告、库存预警、重复排班 |
| `--color-danger` | `#d9353b` | 危险红 | 删除按钮、库存红线预警、倒计时紧急态 |
| `--color-success` | `#0d8c5e` | 成功绿 | 已完成状态、库存充足标记 |
| `--color-info` | `#5b8cb8` | 信息蓝灰 | 场地占用部分标记、一般提示 |

### 1.2 场地占用状态色（月历/排班专用）

| Token | Hex | 含义 |
|-------|-----|------|
| `--color-room-free` | `#e2e6ed` | 灰色 — 空闲 |
| `--color-room-partial` | `#f5deb3` | 小麦色 — 部分占用 |
| `--color-room-full` | `#f4b8b5` | 浅红 — 满档 |

### 1.3 家具元件色（摆台编辑器专用）

每种家具在画布中有一个专属弱底色，使其在网格上清晰可辨：

| 家具 | Hex | 说明 |
|------|-----|------|
| 圆桌 | `#c8ddf0` | 淡蓝，桌椅类 |
| 长条桌/方桌/课桌 | `#d4e0ed` | 灰蓝，桌类 |
| 讲台 | `#f0e4c8` | 暖米，台类 |
| 投影屏 | `#d8dce3` | 银灰，设备类 |
| 签到台 | `#e8dcc8` | 暖灰，接待类 |
| 单椅 | `#e2eaf2` | 极淡蓝，座椅类 |

---

## 2. 微观排版学 (Micro-Typography)

### 2.1 字体栈

由于微信小程序无法加载外部字体，使用系统原生字体栈：

```css
font-family: -apple-system, "PingFang SC", "Noto Sans SC",
             "Helvetica Neue", "Microsoft YaHei", sans-serif;
```

### 2.2 排版层级矩阵

| 层级 | 字号 (rpx) | 字重 | 字间距 | 行高 | 用途 |
|------|-----------|------|--------|------|------|
| **H0** | 44 | 600 | 0.04em | 1.2 | 页面大标题（首页仪表盘数字） |
| **H1** | 36 | 600 | 0.03em | 1.3 | 页面标题 |
| **H2** | 30 | 600 | 0.02em | 1.35 | 区块标题、卡片标题 |
| **H3** | 26 | 500 | 0.02em | 1.4 | 列表项主文字、弹窗标题 |
| **Body** | 28 | 400 | 0 | 1.6 | 正文、列表项内容 |
| **Body-Small** | 24 | 400 | 0.01em | 1.5 | 辅助说明、标签内文字 |
| **Caption** | 20 | 400 | 0.05em | 1.4 | 时间戳、字段标签、网格坐标标注 |
| **Stat** | 56 | 300 | -0.01em | 1.0 | 仪表盘大数字（首页指标卡片） |

### 2.3 排版规则

- **标题与正文间距**：标题下方留 1.5x 标题行高的间距
- **列表项之间**：不使用分割线，用 28rpx 垂直间距分隔；若必须分割，使用 1rpx `--color-grid-line` 发丝线
- **卡片内部上下内边距**：24rpx；左右内边距：28rpx
- **数字表格式数据**（库存、统计）：使用等宽数字特性 `font-variant-numeric: tabular-nums`（微信小程序不支持此 CSS 属性，通过对齐布局手动补偿）

---

## 3. 动态数学 (Motion Math)

微信小程序动画能力有限，不支持自定义 cubic-bezier。使用以下策略：

### 3.1 页面级过渡

```js
// 页面进入动画
wx.createAnimation({
  duration: 280,
  timingFunction: 'ease-out'  // 从快到慢，类似 deceleration
})
// opacity: 0→1, translateY: 24rpx→0
```

### 3.2 微观交互

| 交互 | 时长 | 曲线 | 效果 |
|------|------|------|------|
| 按钮按下 | 120ms | ease | scale(1)→scale(0.96) |
| 勾选框切换 | 150ms | ease-out | 空→实心 + 轻微弹跳 |
| 弹窗出现 | 220ms | ease-out | opacity 0→1, scale 0.92→1 |
| 弹窗消失 | 180ms | ease-in | opacity 1→0, scale 1→0.95 |
| 卡片列表入场 | 250ms/张 | ease-out | stagger 60ms, translateY 20→0 |
| Tab 切换下划线 | 200ms | ease | 左滑/右滑滑动至目标位置 |
| 警告闪烁 | 600ms | ease | 循环 opacity 1→0.4→1 |

### 3.3 摆台编辑器拖拽物理

- 家具松手后定位到网格：瞬间吸附，**无过渡动画**（保证操作即时感）
- 家具的 `movable-view` 位移：由微信原生处理，不额外干预
- 间距警告条出现/消失：200ms ease-out，从底部滑入

---

## 4. 网格与空间 (Grid & Space)

### 4.1 基础网格系统

| 单位 | 值 | 说明 |
|------|-----|------|
| 基础单元 | 8rpx | 所有间距的基础倍数 |
| 网格吸附 | 20rpx | 摆台画布吸附精度 |
| 发丝线 | 1rpx | 最小可见分割线 |
| 细线 | 2rpx | 强调分割、输入框下划线 |

### 4.2 页面空间规范

```
┌──────────────────────────────────────────────┐
│  ← 32rpx 页面水平边距                            │
│                                              │
│  ┌── 卡片 ─────────────────────────────────┐  │
│  │  ← 28rpx 卡片内边距                      │  │
│  │  ↑ 24rpx                                │  │
│  │  [内容]                                  │  │
│  │  ↓ 24rpx                                │  │
│  └─────────────────────────────────────────┘  │
│                                              │
│  ←── 24rpx 卡片间距 ──→                       │
│                                              │
│  ┌── 卡片 ─────────────────────────────────┐  │
│  │  ...                                     │  │
│  └─────────────────────────────────────────┘  │
│                                              │
│  ← 32rpx 页面水平边距                            │
└──────────────────────────────────────────────┘
```

| 空间 Token | 值 (rpx) | 使用场景 |
|------------|----------|----------|
| `--space-xs` | 8 | 图标与文字间距、标签内部 padding |
| `--space-sm` | 16 | 同类元素间、表格单元格内间距 |
| `--space-md` | 24 | 卡片间距、区块间距 |
| `--space-lg` | 32 | 页面水平边距、大区块分隔 |
| `--space-xl` | 48 | 模块间（首页卡片组之间） |
| `--space-2xl` | 64 | 页面顶部/底部留白 |

### 4.3 摆台编辑器特殊空间

- 左侧家具库宽度：160rpx
- 画布尺寸：750rpx × (屏幕高度 - tabBar - 底部操作栏 100rpx)
- 家具最小间距警告阈值：60rpx（约等于 3 个基础单元）

### 4.4 非对称布局策略

- **首页仪表盘**：顶部关键数字（Stat 层级）左对齐占据 2/3 宽度，右侧 1/3 留白或放置一个细线圆环图表
- **列表页**：左对齐标题 + 右对齐状态标签，形成视觉张力
- **表单页**：标签在上（Caption）、输入框在下（Body-Small），左对齐，不使用左右标签排列
- **排班日历**：7 列均分，日期数字居左上角标注，场地名称为左侧固定列

---

## 5. 组件视觉规范

### 5.1 卡片 (Card)

```
┌──────────────────────────────────┐
│  H2 标题              Caption 标签│  ← 28rpx padding
│                                  │
│  Body 正文内容...                  │  ← 16rpx gap
│                                  │
│  Stat 数字     Caption 单位       │  ← 底部数据区
└──────────────────────────────────┘
```

- 背景 `--color-bg-surface`，1rpx 边框 `--color-grid-line`
- 圆角：12rpx（非圆角，锐利但克制——呼应蓝图直角，仅轻微打磨）
- 无投影（拒绝 Material Design 式浮起阴影）
- 卡片间用 24rpx 间距分隔
- 选中态：边框变为 `--color-brand`，背景变为 `--color-brand-dim`

### 5.2 按钮 (Button)

| 类型 | 背景 | 文字色 | 边框 | 圆角 | 高度 |
|------|------|--------|------|------|------|
| 主按钮 | `--color-brand` | `#fff` | 无 | 8rpx | 88rpx |
| 次按钮 | `--color-bg-surface` | `--color-brand` | 1rpx `--color-brand` | 8rpx | 88rpx |
| 文字按钮 | 透明 | `--color-brand` | 无 | - | 自动 |
| 危险按钮 | `--color-danger` | `#fff` | 无 | 8rpx | 88rpx |
| 家具元件(画布) | 对应底色 | `--color-text-primary` | 1rpx `--color-grid-line` | 4rpx | 可变 |

- 按钮按下态：scale(0.96) + 亮度降低 5%

### 5.3 输入框 (Input)

- 背景 `--color-bg-elevated`，底部 2rpx `--color-grid-line` 下划线
- 聚焦态：底部线变为 `--color-brand`，1rpx→2rpx 过渡
- 高度 88rpx，左右 padding 24rpx
- 占位符文字 `--color-text-tertiary`

### 5.4 标签/徽标 (Tag/Badge)

| 类型 | 背景 | 文字色 | 用途 |
|------|------|--------|------|
| 信息标签 | `--color-brand-dim` | `--color-brand` | 正常状态、技能标签 |
| 警告标签 | `#fef3e3` | `--color-warning` | 待处理、需关注 |
| 危险标签 | `#fde8e9` | `--color-danger` | 已过期、严重告警 |
| 成功标签 | `#e6f4ee` | `--color-success` | 已完成、正常 |
| 中性标签 | `--color-bg-canvas` | `--color-text-secondary` | 默认、草稿 |

- 圆角 4rpx，内边距 4rpx 12rpx
- Capiton 字号 (20rpx)，Medium 字重

### 5.5 弹窗 (Modal)

- 背景 `--color-bg-surface`，顶部圆角 16rpx（仅顶部，底部贴屏幕边缘的 bottom-sheet 风格）
- 顶部拖拽条：40rpx 宽 × 4rpx 高，`--color-grid-line`，圆角 2rpx
- 内边距 32rpx
- 背景蒙层：`rgba(23, 26, 31, 0.5)`（半透明蓝图黑）

---

## 6. 空状态规范

每个空状态必须包含三个要素，禁止空白页：

1. **图标**：96rpx × 96rpx，使用 `--color-grid-line` 色描边的线性图标
2. **引导文案**：H3 层级，`--color-text-tertiary`，一行
3. **操作按钮**（可选）：若需要引导创建，放置次按钮

```
          ┌──────────┐
          │   [图标]   │  ← 96rpx, --color-grid-line 描边
          │          │
          │ 引导提示文字 │  ← H3, --color-text-tertiary
          │          │
          │ [创建方案] │  ← 次按钮 (可选)
          └──────────┘
```

---

## 7. 摆台编辑器蓝图隐喻实现

这是"精密图纸"主题最核心的落地页面：

- **画布背景**：`--color-bg-canvas` 底色上叠加 CSS 绘制的 20rpx 网格线（使用 `background-image` 的 `linear-gradient` 十字交叉实现）
- **家具 movable-view**：背景为对应家具底色，1rpx `--color-grid-line` 边框，左上角 4rpx × 4rpx 小方块作为"坐标锚点"装饰
- **选中态**：边框变为 `--color-brand` + 2rpx 宽，四角各出现一个 8rpx × 8rpx 的蓝色方块作为"工程制图的控制手柄"隐喻
- **坐标信息**：选中家具时，画布左上角浮层显示 `X: 320 Y: 240 R: 0°`，Caption 等宽风格
- **底部统计栏**：仿照工程制图的标题栏——左对齐文字，细线分隔，灰色背景

---

## 8. 传递给前端的 WXSS 变量文件

```css
/* app.wxss — 全局设计令牌 */

page {
  /* 颜色 */
  --color-bg-canvas: #f2f4f7;
  --color-bg-surface: #ffffff;
  --color-bg-elevated: #fafbfc;
  --color-grid-line: #e2e6ed;
  --color-grid-subtle: #eef0f4;
  --color-brand: #1a5cb0;
  --color-brand-dim: #e8f0fa;
  --color-text-primary: #171a1f;
  --color-text-secondary: #5f6977;
  --color-text-tertiary: #949eab;
  --color-warning: #e67e0a;
  --color-danger: #d9353b;
  --color-success: #0d8c5e;
  --color-info: #5b8cb8;

  /* 场地状态 */
  --color-room-free: #e2e6ed;
  --color-room-partial: #f5deb3;
  --color-room-full: #f4b8b5;

  /* 间距 */
  --space-xs: 8rpx;
  --space-sm: 16rpx;
  --space-md: 24rpx;
  --space-lg: 32rpx;
  --space-xl: 48rpx;
  --space-2xl: 64rpx;

  /* 圆角 */
  --radius-sm: 4rpx;
  --radius-md: 8rpx;
  --radius-lg: 12rpx;
  --radius-modal: 16rpx;

  /* 字体 */
  --font-stack: -apple-system, "PingFang SC", "Noto Sans SC",
                "Helvetica Neue", "Microsoft YaHei", sans-serif;

  /* 字号 */
  --text-h0: 44rpx;
  --text-h1: 36rpx;
  --text-h2: 30rpx;
  --text-h3: 26rpx;
  --text-body: 28rpx;
  --text-body-sm: 24rpx;
  --text-caption: 20rpx;
  --text-stat: 56rpx;

  /* 行高 */
  --leading-h0: 1.2;
  --leading-h1: 1.3;
  --leading-h2: 1.35;
  --leading-h3: 1.4;
  --leading-body: 1.6;
  --leading-body-sm: 1.5;
  --leading-caption: 1.4;

  /* 动画 */
  --ease-out: ease-out;
  --ease-in: ease-in;
  --ease: ease;
  --duration-fast: 120ms;
  --duration-normal: 200ms;
  --duration-slow: 280ms;
  --duration-stagger: 60ms;
}
```
