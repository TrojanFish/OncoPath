# LungEvidence Clinical Knowledge Graph Design

**Version:** 1.0
**Status:** Development Ready
**Last Updated:** 2026-08-03
**Classification:** Core Architecture Blueprint

---

## 1. Overview

### Purpose

建立 LungEvidence 医学知识图谱。

目标：让系统能够回答"**为什么这个研究与你相关？**"，而不仅仅是"找到几篇论文给你看"。

### 战略定位

| 组件 | 角色 |
|------|------|
| Evidence Database | 论文仓库 |
| Case Analysis Engine | 规则计算 |
| AI Report | 解释层 |
| **Knowledge Graph** | **长期壁垒 — 医学概念关系网络** |

知识图谱将决定 LungEvidence 与普通 AI 医疗问答的长期差异。

---

## 2. Knowledge Graph Philosophy

### 传统数据库 vs 知识图谱

**传统数据库：** 存储事实
```
STAS = Positive
```

**知识图谱：** 存储关系
```
STAS
  ↓ associated_with
Recurrence Risk
  ↓ supported_by
Study A (PMIDxxxx, n=3271)
```

核心模型：**Entity + Relationship + Evidence**

```
Entity → Relation → Entity → Evidence
```

---

## 3. Core Entity Types（8 类节点）

### 3.1 Disease Node（疾病节点）

| 字段 | 说明 |
|------|------|
| id | 唯一标识 |
| name | 疾病名称 |
| type | 类型（NSCLC / SCLC） |
| ICD_code | ICD-10 编码 |

示例：
- Non-small cell lung cancer
- Lung adenocarcinoma

### 3.2 Stage Node（分期节点）

| 字段 | 说明 |
|------|------|
| stage_label | IA1 / IA2 / IA3 等 |
| AJCC_version | 8th |
| definition | 分期定义 |

### 3.3 Tumor Feature Node（影像特征节点）

示例：
- Ground Glass Opacity (GGO)
- Solid Component
- CTR（Consolidation-to-Tumor Ratio）
- Invasive Size

### 3.4 Pathology Feature Node（病理特征节点）

示例：
- STAS（Spread Through Air Spaces）
- VPI（Visceral Pleural Invasion）
- LVI（Lymphovascular Invasion）
- Micropapillary Pattern

### 3.5 Treatment Node（治疗节点）

示例：
- Lobectomy（肺叶切除）
- Segmentectomy（肺段切除）
- VATS（胸腔镜手术）

### 3.6 Outcome Node（结果节点）

示例：
- Overall Survival (OS)
- Disease Free Survival (DFS)
- Recurrence

### 3.7 Study Node（论文节点）

| 字段 | 说明 |
|------|------|
| pmid | PubMed ID |
| title | 论文标题 |
| journal | 期刊 |
| year | 发表年份 |
| sample_size | 样本量 |
| evidence_level | High / Moderate / Limited |

### 3.8 Patient Case Node（患者病例节点）

| 字段 | 说明 |
|------|------|
| case_id | 匿名病例 ID |
| stage | 分期 |
| features | 特征列表 |
| created_at | 创建时间 |

---

## 4. Relationship Types

### has_stage
疾病 → 分期

```
NSCLC → has_stage → IA1
```

### has_feature
病例 → 特征

```
Patient Case → has_feature → STAS Negative
```

### associated_with
因素 → 结果

```
STAS Positive → associated_with → Recurrence
```

### supported_by
关系 → 研究证据

```
STAS → associated_with → Recurrence → supported_by → Study A
```

### similar_to
病例 → 研究人群

```
Patient Case → similar_to → Stage IA Research Cohort
```

---

## 5. Example Graph（典型 IA1 病例）

```
Patient Case #10001
    │
    ├─── has_diagnosis ──→ Lung Adenocarcinoma
    │                           │
    │                           └─── has_stage ──→ IA1
    │
    ├─── has_feature ──→ Mixed GGO
    │
    ├─── has_feature ──→ STAS Negative
    │
    └─── similar_to ──→ Stage IA Research Cohort
                              │
                              └─── supported_by ──→ 10-year Follow-up Study
                                                        (PMID: xxxxx, n=3271)
```

---

## 6. Patient Matching Logic

未来 AI 不只是关键词搜索，而是**图路径匹配**：

**用户问：** "我的情况参考哪些研究？"

**查询路径：**
```
Patient
  → Stage (IA1)
  → Histology (Adenocarcinoma)
  → Feature (N0, STAS-)
  → similar_to → Research Cohort
  → supported_by → Studies
```

---

## 7. Graph Matching Score（匹配评分）

| 维度 | 权重 |
|------|------|
| Stage Match | 40% |
| Histology Match | 20% |
| Feature Match | 20% |
| Study Quality | 20% |

**公式：**
```
Similarity Score = Stage × 0.4 + Histology × 0.2 + Feature × 0.2 + Quality × 0.2
```

---

## 8. Evidence Relationship Model

**重要：** 保存支持程度的语义，而不是绝对结论。

**正确：**
```
STAS → may_increase → Recurrence
  ↓
relationship_strength: "moderate"
confidence: 0.78
evidence_level: "High"
```

**错误：**
```
STAS causes recurrence  ← 过度断言
```

### 字段定义

| 字段 | 说明 |
|------|------|
| `relationship_strength` | strong / moderate / weak |
| `confidence` | 0.0–1.0 |
| `evidence_level` | High / Moderate / Limited |
| `direction` | increases / decreases / no_significant_difference |

---

## 9. Handling Conflicting Evidence（冲突证据处理）

医学研究经常出现矛盾结论。

**示例（STAS 的争议）：**

```
Study A → STAS associated_with → Higher Recurrence
Study B → STAS associated_with → No Significant Difference
```

图谱允许同时存在两条关系，并标注冲突状态：

```json
{
  "relationship": "STAS → Recurrence",
  "status": "conflicting_evidence",
  "studies": [
    {"pmid": "xxxx", "finding": "increased_risk", "quality": "high"},
    {"pmid": "yyyy", "finding": "no_difference",  "quality": "moderate"}
  ]
}
```

**AI 输出：**
> 当前研究存在差异，不同研究结论尚未完全一致。

---

## 10. Explainability Benefit

**用户问：** 为什么说 STAS 值得关注？

**系统展示（图路径）：**
```
STAS
  ↓ associated_with
Recurrence
  ↓ supported_by
3 studies
  ↓ covering
12,500 patients
```

这比"因为研究显示"更可信、更透明。

---

## 11. Knowledge Graph Database

### MVP 方案

**PostgreSQL + pgvector**

理由：
- 初期关系数量有限（< 1000 个节点）
- 复杂度可控
- 与现有后端统一

### 未来扩展

**Neo4j**

理由：
- 复杂图查询性能更好
- 原生图模型
- 支持 Cypher 查询语言

迁移触发条件：关系数量超过 10,000 时评估迁移。

---

## 12. Data Import Pipeline

```
PubMed
  ↓
AI Entity Extractor
  ↓
Human Review
  ↓
Knowledge Graph Update
```

### Entity Extraction 示例

**论文原文：**
> "STAS is associated with recurrence after lobectomy"

**AI 提取：**
```json
{
  "entity_1": "STAS",
  "relation": "associated_with",
  "entity_2": "recurrence",
  "context": "after lobectomy",
  "source": "PMID:xxxxx"
}
```

---

## 13. MVP Graph Size（第一阶段目标）

| 节点类型 | 数量目标 |
|----------|----------|
| Disease | 20 |
| Stage | 10 |
| Features | 100 |
| Studies | 300 |
| Relationships | 1,000+ |

---

## 14. Quality Rules

每个关系节点必须包含：

- ✅ 来源 PMID / DOI
- ✅ Evidence 等级
- ✅ 创建时间
- ✅ 审核状态（approved / pending）
- ✅ 置信度分数

---

## 15. Future Expansion

### Genetics Layer
```
EGFR Mutation → targeted_therapy → Osimertinib
```

### Imaging AI Layer
```
CT Feature → radiomics → Outcome Prediction
```

### Pathology AI Layer
```
Histology Image Pattern → AI Classification → Subtype
```

---

## 16. Acceptance Criteria

系统能够回答：

**用户问：** 我的混合磨玻璃结节为什么不是按 2.9cm 算晚期？

**系统通过图路径生成解释：**
```
CT Size (29mm)
  ↓
Invasive Component Priority Rule (AJCC)
  ↓
Invasive Size < 10mm
  ↓
T Descriptor → T1a
  ↓
T1a + N0 + M0 → IA1 Classification
  ↓
AJCC 8th Edition (Evidence)
```

---

*LungEvidence Clinical Knowledge Graph Design v1.0*
