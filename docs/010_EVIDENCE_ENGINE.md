# Evidence Engine

## 1. 概述 (Overview)
The Evidence Engine is the heart of LungEvidence. It transforms unstructured medical literature into a structured, queryable knowledge base. It handles the ingestion, parsing, extraction, and scoring of medical evidence.

## 2. PubMed API 管道 (PubMed API Pipeline)
- **Integration:** Utilizes Biopython and direct REST API calls to NCBI Entrez E-utilities.
- **Query Strategy:** Regularly polls PubMed using tailored queries like: `("Carcinoma, Non-Small-Cell Lung"[Mesh]) AND ("Neoplasm Invasiveness"[Mesh] OR "STAS" OR "Spread through air spaces")`.
- **Rate Limiting:** Adheres strictly to NCBI guidelines (max 3-10 requests/second with API key).

## 3. 论文解析与节点提取 (Paper Parsing & Node Extraction)
When a new paper is fetched:
1. **Abstract Analysis:** The `ParserAgent` (LLM-based) scans the abstract and full-text (if available).
2. **Entity Extraction:** Identifies entities matching our ontology (e.g., `Factor: STAS`, `Outcome: Recurrence-Free Survival`).
3. **Claim Extraction:** Extracts the relationship. Example: "Presence of STAS was an independent risk factor for recurrence (HR 2.14, p=0.001)."
4. **Node Creation:** 
   - Creates a `Study` node.
   - Creates an `Evidence` node linking the `Study` to the `Factor`.

## 4. 每日同步流程 (Daily Sync Process)
- **02:00 AM:** Scheduler triggers `fetch_new_papers` job.
- **02:30 AM:** Raw XML/JSON from PubMed is stored in a staging table.
- **03:00 AM:** `ParserAgent` batch processes new papers, extracting nodes and edges.
- **05:00 AM:** Embeddings are generated for new claims and inserted into `pgvector` indexed columns.
- **06:00 AM:** Cache invalidation and Knowledge Graph refresh.

## 5. 证据评分系统 (Evidence Scoring ★★★★★)
每一个提取出的“证据”都会被严格评分，以决定其在前端向患者展示的权重和顺序。评分维度包括：

### 5.1. 证据等级 (Level of Evidence) (Max 5 stars)
- **★★★★★ Level I:** High-quality Meta-analyses, Systematic Reviews of RCTs.
- **★★★★☆ Level II:** High-quality Randomized Controlled Trials (RCTs).
- **★★★☆☆ Level III:** Well-designed controlled trials without randomization, cohort studies.
- **★★☆☆☆ Level IV:** Case-control studies, retrospective series.
- **★☆☆☆☆ Level V:** Expert opinions, single case reports (We generally filter these out).

### 5.2. 统计学显著性 (Statistical Significance)
- Evidence must have a P-value < 0.05 to be considered robust.
- Effect size (Hazard Ratio, Odds Ratio) is parsed to determine the "Strength of Association".

### 5.3. 样本量权重 (Sample Size Weight)
- Studies with N > 1000 receive a multiplier in relevance ranking.
- Small cohorts (N < 50) are penalized in the ranking algorithm.

## 6. 质量控制 (Quality Control)
- **Human-in-the-loop (HITL):** Any evidence node flagged as "Controversial" (conflicting claims across papers) is queued for manual medical review.
- **Version Control:** If a paper is retracted, the system automatically cascades the deletion to all associated Evidence Nodes.
