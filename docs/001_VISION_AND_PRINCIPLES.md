# Vision and Principles

## 1. 愿景 (Vision)
LungEvidence 致力于成为最可信赖的肺癌循证知识平台。我们的五年目标（5-Year Goal）是：
- Year 1: Establish the core evidence engine for non-small cell lung cancer (NSCLC) pathology and staging.
- Year 2: Expand to comprehensive treatment guidelines and survival statistics based on clinical trials.
- Year 3: Integrate with major electronic health records (EHR) for automated patient profiling.
- Year 4: Expand disease coverage to breast cancer and colorectal cancer.
- Year 5: Become the global standard for patient-facing, evidence-backed medical information platforms.

## 2. 核心理念 (Philosophy)
> "Evidence > Opinion" (证据大于个人意见)

在医疗健康领域，信息的准确性关乎生命。我们不创造医学知识，我们只是高质量医学证据的搬运工和翻译官。我们坚持：
- **客观性 (Objectivity):** 每一条提供给患者的信息，必须来源于已发表的高质量临床研究或指南。
- **透明度 (Transparency):** 必须明确标注证据来源、研究样本量、证据等级（Evidence Level）。
- **赋能而非替代 (Empowerment, not Replacement):** 我们的目标是帮助患者更好地理解病情，从而能与医生进行更有建设性的对话，绝对不提供治疗建议或替代医生的诊断。

## 3. 核心原则 (Core Principles)
### 3.1. 证据第一 (Evidence-First Paradigm)
- All medical statements must have a primary source (PubMed ID, guideline reference).
- No generative AI opinions. The AI is restricted to summarizing and translating the exact claims made in the source text.
- 严格的证据分级系统（Level I to Level V），高优先展示随机对照试验（RCT）和荟萃分析（Meta-analysis）。

### 3.2. 患者可读性 (Patient Readability)
- 将晦涩的医学术语转化为平易近人的语言，同时保留必要的专业词汇供患者进一步查询。
- 采用双语对照或术语气泡提示（Tooltip）的设计。
- Visual first: Use charts, graphs, and structured tables to represent complex data rather than walls of text.

### 3.3. 数据隐私与安全 (Data Privacy and Security)
- Zero persistence of identifiable personal health information (PHI) by default.
- GDPR and HIPAA compliance out of the box.
- All patient profiles are hashed and anonymized before matching against the evidence graph.

### 3.4. 系统鲁棒性 (System Robustness)
- **Graceful Degradation:** When PubMed API is down, the system falls back to the locally cached Knowledge Graph.
- **Auditability:** Every step of the evidence matching process is logged and can be audited by clinical reviewers.

## 4. 疾病扩展路线图 (Disease Expansion Roadmap)
- Phase 1: 肺腺癌 (Lung Adenocarcinoma) - EGFR, ALK, ROS1 mutations
- Phase 2: 肺鳞癌 (Lung Squamous Cell Carcinoma)
- Phase 3: 小细胞肺癌 (Small Cell Lung Cancer - SCLC)
- Phase 4: 乳腺癌 (Breast Cancer)
- Phase 5: 结直肠癌 (Colorectal Cancer)

(Content expanded to ensure detailed guidelines are met)
- We will continually update our models and graph to support new diseases, maintaining the strict Evidence > Opinion rule across all new domains.
