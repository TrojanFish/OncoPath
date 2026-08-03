# Information Architecture

## 1. 站点结构 (Site Pages)
The LungEvidence platform is structured to guide the user from general understanding to highly specific, personalized evidence.

- **`/` (Home):** Landing page, value proposition, entry point.
- **`/profile/new` (Profile Input):** The data collection funnel. Interactive forms to capture patient context.
- **`/report/{id}` (Evidence Report):** The core deliverable. An aggregated view of matched evidence.
  - Tabs: Summary, Pathology Details, Genetic Factors, Literature Base.
- **`/graph` (Knowledge Graph):** Visual exploration of medical entities and their relationships.
- **`/library` (Research Library):** Searchable index of all parsed PubMed articles and Guidelines.
- **`/glossary` (Medical Dictionary):** Standalone definitions of medical terms.

## 2. 数据流向 (Data Flows)
### 2.1. 证据摄入流 (Evidence Ingestion Flow)
1. **Source:** PubMed API / ClinicalTrials.gov / NCCN Guidelines.
2. **Fetch:** Backend CRON jobs fetch daily updates based on specific keywords (e.g., "NSCLC", "STAS").
3. **Parse:** `ParserAgent` extracts key claims, entities, and statistical significance (P-value, HR).
4. **Graph Build:** `EvidenceAgent` maps extracted data into `Nodes` (Factors, Studies) and `Edges` (Relationships).
5. **Store:** Persisted in PostgreSQL (relational) + pgvector (semantic search embeddings).

### 2.2. 用户查询流 (User Query Flow)
1. **Input:** User submits `PatientProfile` via Frontend.
2. **Match:** Backend normalizes input and converts to Graph Query.
3. **Retrieve:** 
   - Rule-based match (exact factor match).
   - Semantic match (pgvector) for nuanced clinical presentations.
4. **Aggregate:** System retrieves connected `Study` and `Evidence` nodes.
5. **Render:** Next.js Server-Side Rendering (SSR) compiles the Report UI.

## 3. AI 工作流 (AI Workflow)
- The AI is strictly compartmentalized. It does NOT generate medical advice.
- **Workflow Steps:**
  1. **OCR/NLP Extraction (Optional):** If user uploads a PDF report, AI extracts structured data (TNM, subtypes).
  2. **Entity Resolution:** Maps colloquial terms (e.g., "tumor spread") to standardized ontology (e.g., "STAS").
  3. **Translation & Summarization:** Translates English PubMed abstracts into patient-friendly Chinese summaries.
     - *Prompt constraint:* "Translate the conclusion strictly. Do not add any interpretation."

## 4. 核心实体模型 (Core Entity Models)
- **PatientProfile:** Age, Gender, Stage, Histology, Mutations, Surgical Margin.
- **MedicalFactor:** Independent variables (e.g., STAS, LVI, EGFR L858R).
- **ClinicalStudy:** Papers, Trials, Meta-analyses.
- **EvidenceClaim:** A single, verifiable statement linking a Factor to an Outcome in a specific Study.
