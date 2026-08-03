# LungEvidence Case Analysis Engine

**Version:** 1.0
**Status:** Development Ready
**Last Updated:** 2026-08-03
**Classification:** Core Engine Blueprint

---

## 1. Overview

### Purpose

定义 LungEvidence 如何"理解"一个患者病例。

核心问题：

> 给定一份病理报告，系统如何从非结构化的医学信息中，提取出可用于证据匹配的结构化特征？

### 设计目标

- 从患者输入的信息中提取结构化特征
- 根据 AJCC 第 8 版标准计算分期
- 识别有利因素与关注因素
- 匹配相关研究人群
- 生成可解释的分析结果

---

## 2. Input Types

患者可以提供以下类型的信息：

| 输入类型 | 示例 | 优先级 |
|----------|------|--------|
| 病理报告文字 | "浸润成分 8mm，STAS 阴性" | 最高 |
| CT 报告描述 | "右肺上叶 GGO，最大径 2.9cm" | 高 |
| 出院小结 | 包含诊断和手术信息 | 高 |
| 手动填写表单 | 用户逐项输入 | 中 |
| 图片上传（OCR） | 病理报告照片 | 未来功能 |

---

## 3. Information Extraction Pipeline

```
Patient Input
      │
      ▼
Text Preprocessing（清洗、去噪）
      │
      ▼
Entity Extraction（医学实体识别）
      │
      ▼
Value Normalization（数值标准化）
      │
      ▼
Feature Structuring（特征结构化）
      │
      ▼
Structured Case Object
```

---

## 4. Key Extraction Fields

### 4.1 肿瘤基础信息

| 字段 | 提取目标 | 示例 |
|------|----------|------|
| `histology` | 组织学类型 | 肺腺癌 |
| `location` | 肿瘤位置 | 右肺上叶 |
| `ct_size_mm` | CT 影像最大径 | 29 |
| `invasive_size_mm` | 病理浸润成分大小 | 8 |
| `ctr` | Consolidation-to-Tumor Ratio | 0.28 |

### 4.2 病理特征

| 字段 | 提取目标 |
|------|----------|
| `stas` | STAS 状态（阳性/阴性/未提及） |
| `vpi` | 脏层胸膜侵犯 |
| `lvi` | 淋巴血管侵犯 |
| `micropapillary` | 微乳头成分 |
| `solid_component` | 实性成分比例 |

### 4.3 淋巴结与分期信息

| 字段 | 提取目标 |
|------|----------|
| `lymph_node_status` | N0 / N1 / N2 |
| `metastasis` | M0 / M1 |
| `surgical_approach` | 手术方式（肺叶切除 / 肺段切除） |
| `resection_margin` | 切缘状态（R0 / R1） |

---

## 5. Staging Logic（分期计算）

### 5.1 T Descriptor 计算规则

依据 AJCC 第 8 版，**肺癌分期的 T 分级优先参考病理浸润成分大小**，而非 CT 影像大小：

```
IF invasive_size_mm ≤ 10        → T1a (IA1)
IF invasive_size_mm 11–20       → T1b (IA2)
IF invasive_size_mm 21–30       → T1c (IA3)
IF invasive_size_mm 31–40       → T2a (IB)
IF VPI = Positive               → T2a（至少）
IF invasion of main bronchus     → T2b
```

### 5.2 最终分期合成

```python
def calculate_stage(case):
    t = get_t_descriptor(case.invasive_size_mm, case.vpi)
    n = case.lymph_node_status   # N0 / N1 / N2
    m = case.metastasis          # M0 / M1

    if m == "M1":
        return "IV"
    if n == "N2":
        return "IIIA"
    if n == "N1":
        return "IIA"
    if t == "T1a" and n == "N0":
        return "IA1"
    if t == "T1b" and n == "N0":
        return "IA2"
    if t == "T1c" and n == "N0":
        return "IA3"
    # ... 完整逻辑参考 AJCC 8th Edition Table
```

---

## 6. Feature Classification

### 6.1 有利因素（Favorable Factors）

研究中通常与较好结果相关的特征：

- N0（无淋巴结转移）
- STAS 阴性
- 无胸膜侵犯（VPI 阴性）
- 无淋巴血管侵犯（LVI 阴性）
- 纯磨玻璃结节（Pure GGO）
- R0 切除（切缘阴性）

### 6.2 关注因素（Attention Factors）

研究中被持续关注的高风险特征：

- STAS 阳性
- 微乳头成分（Micropapillary Pattern）
- 实性成分为主（Solid Predominant）
- 淋巴血管侵犯（LVI）
- CTR > 0.5

### 6.3 分类逻辑

```python
def classify_features(case):
    favorable = []
    attention = []

    if case.lymph_node_status == "N0":
        favorable.append("N0 — 未发现淋巴结转移")
    if case.stas == "negative":
        favorable.append("STAS 阴性")
    if case.vpi == "negative":
        favorable.append("无胸膜侵犯")

    if case.stas == "positive":
        attention.append("STAS 阳性")
    if case.micropapillary == "present":
        attention.append("微乳头成分")

    return favorable, attention
```

---

## 7. Case Object Schema

最终生成的结构化病例对象：

```json
{
  "case_id": "case_10001",
  "created_at": "2026-08-03T10:00:00Z",

  "diagnosis": {
    "histology": "lung_adenocarcinoma",
    "location": "right_upper_lobe",
    "treatment": "lobectomy"
  },

  "measurements": {
    "ct_size_mm": 29,
    "invasive_size_mm": 8,
    "ctr": 0.28
  },

  "pathology": {
    "stas": "negative",
    "vpi": "negative",
    "lvi": "negative",
    "micropapillary": "absent",
    "lymph_node_status": "N0",
    "resection_margin": "R0"
  },

  "staging": {
    "t_descriptor": "T1a",
    "n_descriptor": "N0",
    "m_descriptor": "M0",
    "ajcc_stage": "IA1",
    "ajcc_version": "8th"
  },

  "features": {
    "favorable": ["N0", "STAS_negative", "VPI_negative"],
    "attention": []
  }
}
```

---

## 8. Explainability Rules

系统必须能够解释每一个分期决策：

### 示例解释

**问题：** 为什么 CT 显示 2.9cm，但分期是 IA1？

**系统解释链：**

```
CT 影像大小：29mm
        ↓
肺癌分期主要参考病理浸润成分
        ↓
你的浸润成分：8mm
        ↓
依据 AJCC 8th Edition，浸润成分 ≤ 10mm → T1a
        ↓
T1a + N0 + M0 = Stage IA1
```

每一步必须关联：
- 使用的标准（AJCC 8th）
- 具体数值依据
- 相关研究支持

---

## 9. Edge Cases

| 场景 | 处理方式 |
|------|----------|
| 浸润成分未报告 | 提示用户补充，或使用 CT 大小估算（标注不确定性） |
| STAS 未检测 | 显示"未提及"，不归入阴性 |
| 多发结节 | 分别处理，按主病灶计算分期 |
| 新辅助治疗后 | 标注 ypTNM，提示解读差异 |

---

## 10. AI Assistance Layer

AI 辅助完成：

- **自由文本解析**：从非结构化报告中提取字段
- **数值识别**：识别 "浸润成分 < 10mm" → `invasive_size_mm: 8`
- **同义词处理**：STAS = spread through air spaces = 气腔播散

AI 不做：

- ❌ 独立诊断
- ❌ 修改已有病理结论
- ❌ 在信息不足时填充假设值

---

## 11. Confidence Score

每个提取字段附带置信度：

```json
{
  "stas": {
    "value": "negative",
    "confidence": 0.95,
    "source": "原文：STAS阴性"
  },
  "invasive_size_mm": {
    "value": 8,
    "confidence": 0.90,
    "source": "原文：浸润成分8mm"
  }
}
```

置信度低的字段：在报告中标注"需确认"。

---

## 12. Acceptance Criteria

系统能够：

- [ ] 从病理文本中正确提取浸润成分大小
- [ ] 根据 AJCC 8th 正确计算 T 描述符
- [ ] 区分 CT 大小 vs 病理浸润大小
- [ ] 识别 STAS / VPI / LVI 状态
- [ ] 生成完整的结构化 Case Object
- [ ] 为每个分期决策提供可解释路径

---

*LungEvidence Case Analysis Engine v1.0*
