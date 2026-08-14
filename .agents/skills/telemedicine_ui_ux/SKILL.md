---
name: Telemedicine & Evidence Health UI/UX Design System
description: Comprehensive UI/UX design specifications, tokens, and component guidelines for Telemedicine, Clinical Evidence Navigation, and Oncology Patient OS applications.
---

# Telemedicine & Evidence Health UI/UX Design System

This skill defines the visual architecture, psychological design patterns, and engineering standards for digital oncology, telemedicine, and peer-reviewed medical evidence interfaces.

---

## 1. 心理学设计原则 (Psychological Design Foundations)

1. **降低焦虑感 (Anxiety Reduction & Reassurance)**:
   - 肿瘤患者及家属常处于高应激、高焦虑状态。
   - 严禁使用大面积刺激性高饱和度纯红色（仅在极端危机状态使用柔和的 `Rose-600`）。
   - 优先使用传递专业、理性与信任的 **信赖蓝（Trust Blue `#0284c7` / `#2563eb`）**，与传递生机、康复与治愈的 **生命青绿（Healing Teal `#0d9488` / `#10b981`）**。

2. **信息清晰度与无障碍标准 (Information Hierarchy & WCAG Accessibility)**:
   - 所有文本对比度严格满足 **WCAG 2.1 AA/AAA** 标准（正文对比度 $\ge 4.5:1$，大标题 $\ge 3:1$）。
   - 数值与统计量采用等宽数字排版（`font-variant-numeric: tabular-nums`），避免表格与图谱数字抖动。

3. **医学透明度与可溯源性 (Clinical Traceability & Transparency)**:
   - 每一个临床结论、分期判定或风险预测，必须伴随明确的**证据等级星级（⭐）**与**原文文献直达出处链接**。
   - 关键风险指标采用 **四维红绿灯矩阵（Traffic-light chips）**：
     - 安全指标（如切缘阴性）：翡翠绿 (`bg-emerald-50 text-emerald-800 border-emerald-200`)
     - 需关注指标（如 STAS+ / VPI+）：琥珀黄 (`bg-amber-50 text-amber-800 border-amber-200`)
     - 需系统治疗指标（如 N2 转移）：柔和玫瑰红 (`bg-rose-50 text-rose-800 border-rose-200`)

---

## 2. 核心设计参数系统 (Design Tokens)

### 🎨 色彩体系 (60 - 30 - 10 黄金法则)

```css
:root {
  /* 60% 主基调 (柔和临床灰白，缓解眼部疲劳) */
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --bg-card: #ffffff;
  --border-color: #e2e8f0;
  --border-glow: #cbd5e1;

  /* 30% 品牌与信任色 (稳重医学蓝 + 活力青绿) */
  --accent-blue: #0284c7;       /* Sky-600 */
  --accent-blue-dark: #0369a1;  /* Sky-700 */
  --accent-blue-light: #38bdf8; /* Sky-400 */
  --accent-teal: #0d9488;       /* Teal-600 */
  --accent-teal-light: #2dd4bf; /* Teal-400 */

  /* 10% 状态强调色 */
  --status-safe: #059669;       /* Emerald-600 */
  --status-warning: #d97706;    /* Amber-600 */
  --status-danger: #e11d48;     /* Rose-600 */

  /* 高对比度文本 */
  --text-primary: #0f172a;      /* Slate-900 */
  --text-secondary: #334155;    /* Slate-700 */
  --text-muted: #64748b;        /* Slate-500 */
}
```

### 📐 圆角与投影体系 (Radius & Elevation)

- **容器卡片 (Card)**: `rounded-2xl` (`16px`)
- **操作按钮与输入框 (Button/Input)**: `rounded-xl` (`12px`)
- **状态徽章 (Badge/Chip)**: `rounded-full`
- **弥散柔光投影**:
  ```css
  .shadow-soft {
    box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05);
  }
  .shadow-hover {
    box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.08), 0 8px 10px -6px rgba(2, 132, 199, 0.04);
  }
  ```

---

## 3. 组件级设计规范

### 1. 临床卡片 (Clinical Cards)
- 纯白底色 (`#ffffff`)，配极细冷灰边框 (`#e2e8f0`)；
- 顶部带有柔和的品牌渐变装饰条（1.5px 高）；
- 悬停时通过轻微 Y 轴位移（`-2px`）和弥散蓝光微阴影增强触感。

### 2. 操作按钮 (Action Buttons)
- **主要操作 (Primary)**: 采用 `bg-gradient-to-r from-sky-600 to-teal-600`，带有轻微外发光，点击时缩放 `scale(0.98)`；
- **次要操作 (Secondary)**: 纯白背景搭配极细边框，悬停时浅灰背景与文字变色。

### 3. 表单与 Human-in-the-Loop 交互 (Input & Verification)
- 聚焦状态采用 `focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500`；
- 所有字段附带清晰的辅助说明文本与示例。
