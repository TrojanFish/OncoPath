# Database Architecture

## 1. 概述 (Overview)
LungEvidence relies on PostgreSQL as its primary datastore, leveraging the `pgvector` extension to enable semantic search over medical texts alongside standard relational queries.

## 2. 数据库模式 (PostgreSQL Schema)

### 2.1. `studies` 表 (研究文献)
```sql
CREATE TABLE studies (
    id SERIAL PRIMARY KEY,
    pmid VARCHAR(20) UNIQUE,
    title TEXT NOT NULL,
    abstract TEXT,
    authors TEXT,
    journal VARCHAR(255),
    publication_date DATE,
    study_type VARCHAR(100),
    sample_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_studies_pmid ON studies(pmid);
```

### 2.2. `factors` 表 (病理因子)
```sql
CREATE TABLE factors (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_zh VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- e.g., 'Histology', 'Mutation'
    description TEXT
);
```

### 2.3. `evidence_nodes` 表 (证据节点)
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE evidence_nodes (
    id SERIAL PRIMARY KEY,
    study_id INTEGER REFERENCES studies(id) ON DELETE CASCADE,
    factor_id INTEGER REFERENCES factors(id),
    claim_text TEXT NOT NULL,
    claim_text_zh TEXT,
    evidence_level INTEGER CHECK (evidence_level BETWEEN 1 AND 5),
    hazard_ratio NUMERIC,
    p_value NUMERIC,
    embedding vector(1536), -- For OpenAI embeddings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_evidence_factor ON evidence_nodes(factor_id);
-- pgvector index for fast semantic search
CREATE INDEX idx_evidence_embedding ON evidence_nodes USING ivfflat (embedding vector_cosine_ops);
```

### 2.4. `guidelines` 表 (临床指南)
```sql
CREATE TABLE guidelines (
    id SERIAL PRIMARY KEY,
    issuing_body VARCHAR(100),
    version VARCHAR(50),
    topic VARCHAR(255),
    recommendation_text TEXT,
    recommendation_level VARCHAR(50)
);
```

### 2.5. `patient_profiles` 表 (患者画像 - 匿名化)
```sql
CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL, -- Anonymous session tracker
    profile_data JSONB NOT NULL, -- Stores all extracted factors
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_profiles_session ON patient_profiles(session_id);
```

### 2.6. `match_results` 表 (匹配结果缓存)
```sql
CREATE TABLE match_results (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
    report_data JSONB NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. pgvector 设置与应用 (pgvector Setup)
- **Vector Dimension:** 1536 (matching OpenAI `text-embedding-ada-002` or similar models).
- **Index Type:** `ivfflat` or `hnsw` depending on data volume. HNSW is preferred for high accuracy and speed as the dataset grows.
- **Usage:** When a user inputs a complex, non-standard medical description, the system embeds the query and performs a similarity search against `evidence_nodes.embedding` to find relevant claims.
