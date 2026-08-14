---
name: UI/UX Pro Max - Healthcare & Evidence Intelligence
description: Production-grade UI/UX design system and reasoning engine based on GitHub's ui-ux-pro-max-skill, specifically tuned for Clinical Healthcare, Telemedicine, Oncology Patient OS, and Evidence-Based Science interfaces.
---

# UI/UX Pro Max - Healthcare & Evidence Intelligence

Based on GitHub's acclaimed `nextlevelbuilder/ui-ux-pro-max-skill` framework, this skill serves as the procedural design intelligence and design system generator for OncoPath.

---

## 1. 核心设计哲学 (Core Philosophy: Trust, Calm, Precision)

```
        ┌───────────────────────────────────────────────────────┐
        │                 Psychological Foundation              │
        │  • Anxiety Reduction: Soft contrast, soothing tones   │
        │  • Clinical Trust: Evidence badges, DOI traceability  │
        │  • Cognitive Ease: Structured Traffic-Light Matrix    │
        └───────────────────────────────────────────────────────┘
                                   │
                                   ▼
        ┌───────────────────────────────────────────────────────┐
        │               60 - 30 - 10 Palette Engine             │
        │  60% Slate Canvas (#f8fafc / #ffffff)                 │
        │  30% Medical Trust Blue (#0284c7) + Teal (#0d9488)    │
        │  10% Clinical State Accents (Emerald / Amber / Rose)  │
        └───────────────────────────────────────────────────────┘
                                   │
                                   ▼
        ┌───────────────────────────────────────────────────────┐
        │              Components & Micro-Interactions          │
        │  • Cards: rounded-2xl + subtle diffuse borders        │
        │  • Buttons: Medical Gradient + active:scale(0.98)     │
        │  • Numbers: font-variant-numeric: tabular-nums        │
        └───────────────────────────────────────────────────────┘
```

---

## 2. 设计规范参数库 (Design Tokens)

### 🎨 色彩体系 (Color Tokens)
- **Canvas Base (60%)**:
  - `bg-primary`: `#f8fafc` (Slate-50 护眼柔白底)
  - `bg-secondary`: `#f1f5f9` (Slate-100 次级灰底)
  - `bg-card`: `#ffffff` (Card 纯白容器)
  - `border-color`: `#e2e8f0` (极细冷灰边框)
  - `border-hover`: `#cbd5e1` (聚焦悬停边框)
- **Brand & Trust (30%)**:
  - `accent-blue`: `#0284c7` (Sky-600 临床专业蓝)
  - `accent-blue-dark`: `#0369a1` (Sky-700 深邃蓝)
  - `accent-teal`: `#0d9488` (Teal-600 生命治愈青绿)
  - `accent-teal-light`: `#2dd4bf` (Teal-400 活力微光)
- **Clinical Traffic Light Accents (10%)**:
  - `status-safe` (R0/N0/低危): `#059669` (Emerald-600) / `bg-emerald-50` / `border-emerald-200`
  - `status-warning` (STAS+/VPI+/需随访): `#d97706` (Amber-600) / `bg-amber-50` / `border-amber-200`
  - `status-alert` (N2/需积极治疗): `#e11d48` (Rose-600) / `bg-rose-50` / `border-rose-200`
- **Text Contrast**:
  - `text-primary`: `#0f172a` (Slate-900 极佳对比度)
  - `text-secondary`: `#334155` (Slate-700 易读正文)
  - `text-muted`: `#64748b` (Slate-500 辅助注释)

### 📐 字体排印 (Typography)
- **Font Stack**: `Inter`, `Noto Sans SC`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Tabular Figures**: 所有临床统计量（HR、5yr RFS、n=病例数）必须应用 `font-variant-numeric: tabular-nums`；
- **字阶层级**:
  - `display-lg`: `clamp(2rem, 5vw, 3.25rem)` / `font-bold` / `tracking-tight`
  - `display-md`: `clamp(1.5rem, 3.5vw, 2.25rem)` / `font-bold` / `leading-snug`
  - `body-base`: `1rem (16px)` / `leading-relaxed` (`1.6`)
  - `caption`: `0.75rem (12px)` / `font-medium`

---

## 3. UI/UX 决策推理规则 (Reasoning Rules)

### Rule 1: 消除患者视觉恐惧感 (De-escalate Anxiety)
- ❌ **Anti-Pattern**: 出现大面积刺眼的 `#ff0000` 纯红背景或黑红色警告弹窗。
- ✅ **Best Practice**: 将风险因素包裹在带有盾牌/图示的圆角小卡片中，使用柔和的 `Rose-600` / `bg-rose-50`，并立即附上同行评审文献或就诊沟通建议。

### Rule 2: 严格的证据可溯源标注 (Evidence Traceability)
- ❌ **Anti-Pattern**: 生成无来源的模糊数字（例如“你的复发率为20%”）。
- ✅ **Best Practice**: 每个关键数字必须伴随 `[来源: 期刊名 · 年份 · n=例数 ⭐⭐⭐⭐]`，并提供可点击的 **「📖 查看原文出处 ↗」** 按钮。

### Rule 3: 极致触感的微动效 (Tactile Micro-Interactions)
- **按钮**: `active:scale(0.98)` 与轻微蓝光外发光；
- **卡片**: 悬停时 `-2px` Y轴平滑位移（`cubic-bezier(0.16, 1, 0.3, 1)`）；
- **加载状态**: 采用带有渐变 Shimmer 光效的骨架屏（Skeleton），避免单一生硬的 Spinner。

---

## 4. 全站设计系统落地校验检查清单 (Audit Checklist)

- [x] 全站页面遵循柔光医疗基底（`bg-slate-50` / `#f8fafc`）；
- [x] 所有卡片统一采用 `rounded-2xl`，细边框 `border-slate-200`，弥散微投影 `shadow-sm`；
- [x] 所有医学数据与百分比采用等宽排版（`tabular-nums`）；
- [x] 国际研究库与管理后台支持一键直达 DOI / PubMed / 期刊原文；
- [x] 循证报告页面配备四维红绿灯矩阵与一键复制门诊就诊清单。
