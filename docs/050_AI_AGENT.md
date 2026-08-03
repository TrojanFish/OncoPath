# AI Agents & RAG System

## 1. 概述 (Overview)
LungEvidence utilizes specialized AI agents powered by Large Language Models (LLMs). To maintain strict medical accuracy and prevent hallucinations, we use a Multi-Agent architecture combined with Retrieval-Augmented Generation (RAG).

## 2. 智能体定义 (Agent Definitions)

### 2.1. `ParserAgent` (解析智能体)
- **Role:** Extracts structured data from unstructured medical text.
- **Input:** Raw pathology reports (user uploaded) or PubMed abstracts.
- **Output:** JSON formatted objects matching the `PatientProfile` or `EvidenceNode` schema.
- **Prompt Strategy:** Few-shot prompting with strict JSON enforcement.
  - *Instruction:* "You are an expert pathologist. Extract the following entities from the text. If an entity is not mentioned, return null. Do not infer or guess."

### 2.2. `ResearchAgent` (检索智能体)
- **Role:** Executes the RAG pipeline. Takes the user's profile and queries the Knowledge Graph and pgvector database.
- **Workflow:**
  1. Receives patient profile.
  2. Constructs search queries (SQL and semantic vector searches).
  3. Retrieves top K relevant `EvidenceNodes`.
  4. Filters out low-quality or contradictory evidence based on internal logic.

### 2.3. `EvidenceAgent` (报告生成智能体)
- **Role:** Synthesizes the retrieved evidence into a patient-friendly report.
- **Constraints:** Bound by the hard rules defined in `012_MEDICAL_RULES.md`.
- **Prompt Strategy:**
  - *Instruction:* "You are a medical translator. Translate and summarize the provided evidence nodes for a patient. Use clear, empathetic, but objective language. YOU MUST cite the provided study for every claim. DO NOT provide treatment advice."

## 3. RAG 架构设置 (RAG Setup)
- **Embedding Model:** OpenAI `text-embedding-ada-002` (or open-source equivalent like BGE-m3 for bilingual support).
- **Chunking Strategy:** PubMed abstracts are chunked by sentence or logical claim to maintain high granularity in the vector space.
- **Retrieval Metric:** Cosine Similarity.
- **Hybrid Search:** We combine semantic search (vector) with keyword/exact-match filtering (e.g., must match `factor_id`) to ensure high precision in medical retrieval.
