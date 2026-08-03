# Knowledge Graph

## 1. 概述 (Overview)
The Knowledge Graph is the structural foundation of LungEvidence. It connects isolated medical concepts into a cohesive network, allowing the system to deduce how a patient's specific combination of pathological features relates to published outcomes.

## 2. 节点类型 (Nodes)
- **`Factor` (病理/生理因子):** 
  - Represents a distinct medical feature.
  - Examples: `STAS` (Spread Through Air Spaces), `EGFR_L858R`, `Micropapillary_Pattern`, `Lymph_Node_Involvement`.
  - Properties: `name`, `category`, `description_zh`, `snomed_ct_code`.
- **`Study` (研究文献):**
  - Represents a specific published paper or clinical trial.
  - Examples: PMID: 3211111.
  - Properties: `title`, `authors`, `journal`, `publication_date`, `study_type`, `sample_size`.
- **`Evidence` (证据声明):**
  - The core node that captures a specific claim from a study.
  - Properties: `claim_text`, `evidence_level`, `hazard_ratio`, `p_value`.
- **`Guideline` (临床指南):**
  - Represents authoritative guidelines (e.g., NCCN, CSCO).
  - Properties: `version`, `issuing_body`, `recommendation_text`.

## 3. 边/关系 (Edges)
- `[Factor] <- (INVESTIGATES) -> [Study]`
- `[Study] <- (PRODUCES) -> [Evidence]`
- `[Evidence] <- (APPLIES_TO) -> [Factor]`
- `[Factor] <- (ASSOCIATED_WITH) -> [Factor]` (e.g., STAS is often associated with Micropapillary pattern)

## 4. 关系建立示例：如何链接 STAS 与证据 (How STAS→Evidence Links Work)
1. **Factor Node:** A node for `STAS` exists in the graph.
2. **Study Node:** A new paper is parsed (PMID: 123456).
3. **Extraction:** The parser detects that PMID: 123456 discusses STAS.
4. **Edge Creation:** 
   - An edge `INVESTIGATES` is created between `Study(123456)` and `Factor(STAS)`.
   - The parser extracts the conclusion: "STAS increases recurrence risk in Stage IA."
   - An `Evidence` node is created: `Evidence(E1)`.
   - Edges are created: `Study(123456) -[PRODUCES]-> Evidence(E1) -[APPLIES_TO]-> Factor(STAS)`.

## 5. 图查询示例 (Graph Queries)
While stored in PostgreSQL (using relational tables to simulate graph traversal or using recursive CTEs), the conceptual queries are:

### 5.1. Find all high-level evidence for STAS
```sql
-- Conceptual representation
SELECT e.claim_text, s.title, e.evidence_level
FROM Evidence e
JOIN Study s ON e.study_id = s.id
JOIN Factor f ON e.factor_id = f.id
WHERE f.name = 'STAS' AND e.evidence_level >= 4;
```

### 5.2. Profile Matching Query
When a patient profile contains `STAS` and `Tumor_Size > 3cm`:
- The system queries for Evidence nodes that `APPLY_TO` both factors or individual factors, ranking the results based on the `evidence_level` and `sample_size` of the producing studies.
