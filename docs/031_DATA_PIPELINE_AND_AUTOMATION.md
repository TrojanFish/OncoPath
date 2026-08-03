# LungEvidence Data Pipeline and Automation

Version: 1.0

Status: Draft

Last Updated: 2026-08-03
1. Overview
Purpose
定义 LungEvidence 医学数据自动化系统。

目标：

让平台持续获取：

最新医学论文；
临床指南更新；
重要研究结果；
并自动转换为：

结构化 Evidence。

2. Data Pipeline Philosophy
核心流程：

Medical Literature

↓

AI Extraction

↓

Evidence Structure

↓

Quality Review

↓

Knowledge Graph Update

↓

Patient Report Update
3. Data Sources
第一阶段：

PubMed
主要来源：

肺癌研究；
外科研究；
病理研究。
Clinical Guidelines
包括：

IASLC；
NCCN；
ESMO。
Clinical Trial Registry
未来：

ClinicalTrials.gov。
Journals
重点：

肺癌领域：

Journal of Thoracic Oncology
Lung Cancer
Annals of Thoracic Surgery
European Journal of Cardio-Thoracic Surgery
4. Literature Discovery Agent
建立：

Research Scout Agent
任务：

每天搜索：

关键词：

lung adenocarcinoma

stage IA

ground glass opacity

CTR

STAS

recurrence

survival
输出：

{
title:"",
pmid:"",
year:"",
topic:"",
relevance_score:0.92
}
5. Literature Ingestion Pipeline
流程：

PMID

↓

Metadata Fetch

↓

Abstract Download

↓

Full Text Retrieval

↓

Storage
保存：

research_documents
字段：

id

title

authors

journal

year

pmid

doi

full_text
6. AI Evidence Extraction
论文进入：

Extraction Agent。

任务：

不是总结。

而是：

提取医学关系。

输入：

论文。

输出：

{
population:
{
stage:"IA"
},

factor:
"STAS",

outcome:
"recurrence",

direction:
"higher risk",

effect_size:
"HR 2.1"
}
7. Evidence Normalization
不同论文：

描述不同。

例如：

论文A：

Spread through air spaces

论文B：

STAS

统一：

STAS
建立：

Medical Terminology Map。

例如：

{
"Spread Through Air Spaces":

"STAS"
}
8. Evidence Quality Scoring
AI提取后：

自动评分。

评分因素：

Study Design
Meta-analysis

↓

Multicenter

↓

Single center
Sample Size
人数越大：

权重越高。

Follow-up
长期：

5年

提高权重。

Statistical Strength
例如：

HR、CI。

输出：

{
confidence:
"High",

score:
87
}
9. Human Review Workflow
AI不能直接进入生产。

流程：

AI Extract

↓

Medical Reviewer

↓

Approve

↓

Publish
审核状态：

Draft

Reviewed

Published

Deprecated
10. Knowledge Graph Update
审核通过：

自动更新：

例如：

新增：

STAS

↓

Associated With

↓

Recurrence

↓

Stage IA Adenocarcinoma
11. Evidence Versioning
医学观点变化：

需要版本。

例如：

旧：

STAS evidence v1
新增研究：

STAS evidence v2
旧报告：

保持：

v1。

新报告：

使用：

v2。

12. Scheduled Jobs
任务调度：

每日：

Search new papers
每周：

Process papers
每月：

Review evidence changes
13. Backend Architecture
新增：

backend/

workers/

├── literature_worker

├── extraction_worker

├── scoring_worker

└── update_worker
14. Queue System
推荐：

Redis Queue。

流程：

PubMed Task

↓

Queue

↓

Worker

↓

Database
15. Data Storage
新增：

Research Database
保存论文。

Evidence Database
保存医学关系。

Vector Database
保存语义检索。

Graph Database
保存关系。

16. Monitoring
需要监控：

Pipeline Health
例如：

Last successful update:

2026-08-03
Extraction Failure
记录：

无法解析论文。

Evidence Conflict
发现：

两个研究结果相反。

17. Conflicting Evidence Handling
医学研究经常矛盾。

不能：

选择一个。

模型：

Evidence A

+

Evidence B

↓

Balanced Explanation
例如：

部分研究认为STAS影响复发，
但不同研究结果存在差异。
18. Patient Report Refresh
当Evidence更新：

不是自动修改旧报告。

规则：

提示：

发现新的相关研究。

是否更新你的报告？
19. Long-term Vision
最终形成：

Continuous Medical Intelligence System

=

Literature Engine

+

Knowledge Graph

+

Patient Data

+
 
AI Explanation
End
LungEvidence Data Pipeline and Automation v1.0
