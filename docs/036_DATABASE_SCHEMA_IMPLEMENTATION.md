# LungEvidence Database Schema Implementation

Version: 1.0

Status: Draft

Last Updated: 2026-08-03
Classification: Data Model Blueprint

## 1. Overview
定义 LungEvidence 的 PostgreSQL 数据库表结构，将医学知识模型落地。

## 2. Core Tables

### 2.1 Users (`users`)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | VARCHAR | 邮箱 |
| password_hash | VARCHAR | 密码 |
| created_at | TIMESTAMP | 注册时间 |

### 2.2 Patient Cases (`patient_cases`)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 外键 (users) |
| age | INT | 年龄 |
| gender | VARCHAR | male/female |
| surgery_type | VARCHAR | 手术类型 |

### 2.3 Tumors (`tumors`)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| case_id | UUID | 外键 (patient_cases) |
| location | VARCHAR | 肿瘤位置 |
| tumor_size_mm | DECIMAL | 肿瘤总大小 |
| solid_size_mm | DECIMAL | 实性成分大小 |
| ctr | DECIMAL | CTR 比值 |
| morphology | VARCHAR | GGO 还是实性 |

### 2.4 Pathology Features (`pathology_features`)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| tumor_id | UUID | 外键 (tumors) |
| stas | VARCHAR | 气道播散 |
| vpi | VARCHAR | 脏层胸膜侵犯 |
| lvi | VARCHAR | 淋巴血管侵犯 |
| iaslc_grade | VARCHAR | 2020 IASLC 分级 (1/2/3) |
| margin | VARCHAR | 切缘情况 |

### 2.5 Evidence Studies (`studies`)
| 字段 | 类型 | 说明 |
|------|------|------|
| pmid | VARCHAR | 主键 |
| title | VARCHAR | 标题 |
| year | INT | 年份 |
| journal | VARCHAR | 期刊 |

### 2.6 Knowledge Graph (`knowledge_graph`)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| factor | VARCHAR | 因素（如 STAS） |
| outcome | VARCHAR | 结局（如 Recurrence） |
| effect | VARCHAR | 影响 |
| pmid | VARCHAR | 外键 (studies) |

## 3. Schema Extensibility
- **IASLC 分级**：考虑到 `mggo肺癌预后分析` 中详细讨论了 IASLC 分级对预后的预测作用，在 `pathology_features` 表中预留了 `iaslc_grade` 字段。
- **CTR 与 浸润成分**：针对 IA 期肺癌（如 1a1），`tumors` 表独立记录 `solid_size_mm` 和 `ctr`，因为这比单纯的总大小更有预后价值。

End
LungEvidence Database Schema Implementation v1.0
