# Project Roadmap

## 1. 概述 (Overview)
This roadmap outlines the strategic development plan for LungEvidence over the next 12+ months, moving from a focused MVP to a comprehensive multi-disease platform.

## 2. Phase 1: MVP (Months 1-3)
**Goal:** Prove the concept. Deliver a functional end-to-end system for early-stage Non-Small Cell Lung Cancer (NSCLC).
- **Milestone 1 (Month 1):** Backend infrastructure setup. PostgreSQL + pgvector running. Core API endpoints designed.
- **Milestone 2 (Month 2):** PubMed ingest pipeline operational. Parse and index 5,000+ papers related to NSCLC pathology (focus on STAS, Micropapillary, LVI).
- **Milestone 3 (Month 3):** Frontend Next.js app launched. Users can input a profile and receive a matched Evidence Report.
- **Deliverable:** Public Beta launch for patient feedback.

## 3. Phase 2: Knowledge Graph & Guidelines (Months 4-6)
**Goal:** Enhance the depth and authority of the evidence provided.
- **Milestone 4 (Month 4):** Full Knowledge Graph implementation. Transition complex SQL joins to optimized graph queries.
- **Milestone 5 (Month 5):** Ingest and map major clinical guidelines (NCCN, CSCO, ESMO) into the graph, linking them to specific patient profiles.
- **Milestone 6 (Month 6):** Advanced PDF parsing. Users can upload image/PDF pathology reports for automated extraction via `ParserAgent`.
- **Deliverable:** V1.0 Release. Comprehensive coverage of NSCLC treatments and guidelines.

## 4. Phase 3: Multi-disease & Integrations (Months 7-12+)
**Goal:** Scale the platform horizontally to other cancers and integrate with clinical workflows.
- **Milestone 7 (Months 7-8):** Expand disease ontology to Small Cell Lung Cancer (SCLC) and begin ingestion of Breast Cancer literature.
- **Milestone 8 (Months 9-10):** Multi-language support (English UI/content alongside Chinese).
- **Milestone 9 (Months 11-12):** EHR (Electronic Health Record) integration pilot. Allow users to securely import their data from participating hospital systems (SMART on FHIR standards).
- **Deliverable:** A scalable, multi-disease evidence platform ready for institutional partnerships.
