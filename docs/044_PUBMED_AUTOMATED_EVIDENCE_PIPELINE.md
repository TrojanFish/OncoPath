# LungEvidence PubMed Automated Evidence Pipeline

**Version:** 1.0
**Status:** Development Ready
**Last Updated:** 2026-08-03
**Classification:** Data Infrastructure Blueprint

---

## 1. Overview

### Purpose

建立自动化医学文献更新系统，持续发现并结构化以下类型研究：

- 肺癌术后研究
- IA 期预后研究
- GGO（磨玻璃结节）研究
- 病理风险因素研究（STAS、VPI、LVI 等）

并自动转换为 Evidence 数据，供知识图谱更新使用。

### 核心价值

```
全球医学研究
      ↓
自动发现
      ↓
AI 阅读
      ↓
结构化提取
      ↓
人工审核
      ↓
知识图谱更新
      ↓
患者报告同步更新
```

---

## 2. Pipeline Architecture

```
PubMed
  ↓
Literature Collector（文献采集器）
  ↓
AI Screening（相关性筛选）
  ↓
Information Extraction（信息提取）
  ↓
Evidence Structuring（结构化）
  ↓
Human Review（人工审核）
  ↓
Knowledge Graph Update（图谱更新）
  ↓
AI Report Update（报告更新）
```

---

## 3. Data Sources

### 3.1 第一阶段：PubMed

**选择原因：**
- NIH 官方维护，医学可信度最高
- API 完全开放（E-utilities API）
- 覆盖主要医学期刊

**关键词策略：**

| 主题 | 搜索词 |
|------|--------|
| IA 期 NSCLC | `("stage IA" OR "T1N0") AND "non-small cell lung cancer"` |
| GGO 腺癌 | `"ground glass opacity" AND "adenocarcinoma"` |
| STAS | `"spread through air spaces" AND "lung adenocarcinoma"` |
| 肺段 vs 肺叶 | `"segmentectomy" AND "lobectomy" AND "survival"` |
| 预后研究 | `"stage I NSCLC" AND ("prognosis" OR "survival") AND "surgery"` |

### 3.2 未来扩展数据源

| 数据源 | 用途 |
|--------|------|
| ClinicalTrials.gov | 临床试验追踪 |
| NCCN / IASLC / ESMO | 指南更新 |
| Journal of Thoracic Oncology | 重点期刊自动跟踪 |
| Lung Cancer | 重点期刊自动跟踪 |

---

## 4. Literature Collector

### 4.1 技术实现

- **语言：** Python
- **调度：** Celery + Redis（定时任务）
- **存储表：** `studies_raw`

### 4.2 采集字段

| 字段 | 说明 |
|------|------|
| `pmid` | PubMed ID |
| `title` | 论文标题 |
| `abstract` | 摘要全文 |
| `journal` | 期刊名称 |
| `year` | 发表年份 |
| `authors` | 作者列表 |
| `doi` | DOI 链接 |
| `mesh_terms` | MeSH 医学主题词 |

### 4.3 采集逻辑

```python
def collect_pubmed(query: str, max_results: int = 100):
    """
    通过 E-utilities API 搜索并采集文献
    """
    # 1. 搜索获取 PMID 列表
    search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "sort": "date",
        "api_key": PUBMED_API_KEY
    }

    # 2. 批量获取摘要
    fetch_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

    # 3. 存入 studies_raw 表（status = NEW）
```

---

## 5. AI Screening Layer

### 5.1 目标

判断论文是否值得进入 Evidence 库，避免人工逐篇阅读。

### 5.2 输入 / 输出

**输入：** 论文标题 + 摘要

**输出：**
```json
{
  "relevant": true,
  "topic": "STAS",
  "quality": "high",
  "reason": "Multi-center RCT, n=3271, with 10-year follow-up",
  "exclude_reason": null
}
```

### 5.3 筛选标准

**保留：**
- ✅ 人体研究
- ✅ 手术患者（有明确手术信息）
- ✅ 有结局数据（OS / DFS / 复发率）
- ✅ 相关研究主题

**排除：**
- ❌ 动物实验
- ❌ 纯评论文章（Review / Editorial）
- ❌ 无临床结果数据
- ❌ 研究人群不相关（如 SCLC、化疗为主）

---

## 6. Evidence Extraction

### 6.1 AI 提取结构化信息

**输入：** 论文摘要

**示例：**
> "STAS predicts recurrence after lobectomy in stage I lung adenocarcinoma patients"

**输出：**
```json
{
  "factor": "STAS",
  "outcome": "recurrence",
  "direction": "increased_risk",
  "population": "stage I lung adenocarcinoma",
  "treatment": "lobectomy",
  "sample_size": 3271,
  "follow_up_years": 10,
  "statistical_significance": "p < 0.001",
  "effect_size": "HR 2.3 (95% CI 1.8-2.9)"
}
```

### 6.2 AI Prompt 模板

```
You are a medical literature extraction assistant.

Extract the following from the abstract:
1. Study population (disease, stage, treatment)
2. Primary factor being studied
3. Primary outcome
4. Effect direction (increased / decreased / no significant difference)
5. Sample size
6. Follow-up duration
7. Statistical significance (if reported)
8. Study design (RCT / cohort / case-control / retrospective)

Important rules:
- Do NOT infer beyond what is explicitly stated in the abstract
- If a field is not mentioned, return null
- Use standardized terms (e.g., "STAS" not "spread through air spaces")
```

---

## 7. Evidence Normalization（标准化）

不同论文用不同词描述同一概念，需要统一：

| 原始文本 | 标准化结果 |
|----------|------------|
| "tumor spread through air spaces" | `STAS` |
| "aerogenous spread" | `STAS` |
| "visceral pleural invasion" | `VPI` |
| "pleural infiltration" | `VPI` |
| "lymphovascular invasion" | `LVI` |
| "vascular invasion" | `LVI` |

**规范词典：** 维护在 `medical_terminology.json` 中，人工管理。

---

## 8. Quality Evaluation（自动评分）

### 评分维度

| 维度 | 权重 | 高分标准 |
|------|------|----------|
| Study Design | 30% | RCT > 多中心 > 单中心回顾 |
| Sample Size | 20% | > 500 例 |
| Follow-up Duration | 20% | > 5 年 |
| Statistical Method | 30% | 有多变量分析 / Cox 回归 |

### 输出

```json
{
  "evidence_level": "High",
  "quality_score": 0.85,
  "breakdown": {
    "study_design": 0.9,
    "sample_size": 0.8,
    "follow_up": 0.85,
    "statistics": 0.85
  }
}
```

---

## 9. Human Review Workflow

医疗领域必须有人工审核，AI 结果不可直接发布。

### 审核流程

```
AI Extract
  ↓
Reviewer Queue（待审队列）
  ↓
Reviewer 逐条审核
  ↓
Approve ──→ 进入 Evidence 库
Reject  ──→ 标注原因，丢弃
Request Edit ──→ 退回重新提取
```

### 审核人员

| 阶段 | 人员 |
|------|------|
| MVP | 医生顾问（兼职审核） |
| 成熟期 | 专职医学编辑团队 |

---

## 10. Evidence Version Control

每次 Evidence 库更新记录版本号：

```
Evidence Version: 2026.08
Evidence Version: 2026.09  ← 新研究加入
```

患者报告记录生成时使用的 Evidence 版本：

```json
{
  "report_id": "rpt_10001",
  "evidence_version": "2026.08",
  "generated_at": "2026-08-03"
}
```

当新版本 Evidence 发布，可触发旧报告重新生成。

---

## 11. Conflict Detection

系统自动检测与已有 Evidence 的冲突：

**已有：**
```
STAS → increases → Recurrence (High Evidence)
```

**新研究：**
```
STAS → no significant difference → Recurrence (Moderate Evidence)
```

**系统标记：**
```json
{
  "status": "evidence_conflict",
  "existing_finding": "increased_risk",
  "new_finding": "no_difference",
  "review_required": true
}
```

**AI 解释输出：**
> 当前研究结论尚未完全一致，不同研究存在差异。

---

## 12. Storage Design

### 12.1 新增数据表

**`literature_tasks` 任务表**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| paper_id | UUID | 关联 studies_raw |
| status | ENUM | 任务状态 |
| ai_result | JSONB | AI 提取结果 |
| review_status | ENUM | 审核状态 |
| reviewer_id | UUID | 审核人 |
| created_at | TIMESTAMP | 创建时间 |

### 12.2 任务状态流转

```
NEW
  ↓
SCREENING（AI 筛选中）
  ↓
REVIEW（等待人工审核）
  ↓
APPROVED ──→ 进入 Evidence 库
REJECTED  ──→ 归档
```

---

## 13. Update Frequency

| 阶段 | 频率 |
|------|------|
| MVP | 每周一次 |
| 成熟期 | 每日一次 |

### 推荐时间表（MVP）

| 时间 | 任务 |
|------|------|
| 周一 | PubMed 同步采集 |
| 周二 | AI 筛选 + 提取 |
| 周三–周四 | 人工审核窗口 |
| 周五 | 审核完成，Evidence 库更新 |

---

## 14. Monitoring

每日统计报告：

```
📊 Pipeline 日报 — 2026-08-03

新发现论文：   47
AI 已处理：   45
通过筛选：    23
待人工审核：  18
本周已审批：  15
本周已拒绝：   3
Evidence 库总量：342
```

---

## 15. Security Rules

```
❌ 禁止：
  - AI 结果未经审核直接发布到生产
  - 自动修改知识图谱节点

✅ 要求：
  - AI → Human → Production（三步强制流程）
  - 所有审核操作记录操作日志
  - Evidence 版本不可删除，只可归档
```

---

## 16. MVP Implementation Scope

### ✅ 第一版实现

- PubMed API 搜索采集
- AI 摘要筛选
- Evidence JSON 生成
- 人工审核后台界面

### ❌ 第一版暂不实现

- 自动全文 PDF 下载
- 自动修改知识图谱
- 多数据源同步（ClinicalTrials 等）

---

## 17. Acceptance Criteria

系统能够：

- [ ] 每周自动发现新的肺癌 IA 期研究
- [ ] AI 自动判断相关性（准确率 > 85%）
- [ ] 生成结构化 Evidence Candidate JSON
- [ ] 提供审核后台供医生逐条确认
- [ ] 审核通过后自动更新 Evidence 库
- [ ] 记录 Evidence 版本并支持历史查询

---

*LungEvidence PubMed Automated Evidence Pipeline v1.0*
