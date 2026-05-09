# HIPAA-Compliant Home Health AI Platform - Implementation Progress

**Project Start Date:** April 03, 2026
**Target MVP:** 14-16 weeks
**Current Phase:** Phase 0 Scope Freeze and Kickoff (In Progress)

> **Development Guide:** See [AGENTS.md](C:\Programming\FYP\AGENTS.md) for the team methodology and execution rules.

---

## Product Goal

Build a secure web platform for home health and hospice agencies that:

1. Accepts scanned forms and PDFs
2. Extracts structured patient data using OCR and document AI
3. Lets clinicians review, correct, and approve extracted data
4. Generates a draft Plan of Care with supporting citations
5. Predicts 30-day readmission risk
6. Preserves privacy, auditability, and role-based access

### MVP Boundary

The first MVP does **not** prioritize a full patient or caregiver portal.

The MVP ends when this workflow works reliably:

```text
Authenticated clinician -> Upload document -> AI extraction -> Human review -> Save approved record -> Generate draft POC -> View risk score
```

---

## Recommended Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS or MUI

### Backend

- FastAPI
- PostgreSQL
- Pydantic schemas

### AI and ML

- Azure AI Document Intelligence for OCR and extraction
- Azure OpenAI for RAG-assisted Plan of Care drafting
- scikit-learn + XGBoost or LightGBM for readmission risk prediction
- SHAP for explanation

### Infrastructure

- Azure Blob Storage
- Azure Key Vault
- Azure App Service or container hosting
- Azure Monitor and Log Analytics
- Docker and Docker Compose

---

## How Abdul Rehman Should Start This Project

### First Team Meeting Agenda

1. Freeze the MVP scope
2. Confirm the final stack as `Next.js + FastAPI + PostgreSQL + Azure`
3. Lock the target forms for MVP
4. Agree on the JSON schema for extracted fields
5. Split ownership clearly
6. Set weekly review and demo checkpoints

### Abdul's First 7 Days

- [ ] Finalize the MVP boundary and tell the team what is **out of scope** for now
- [ ] Create the main architecture diagram
- [ ] Define Azure services to use and which ones are optional
- [ ] Write the security checklist for PHI handling
- [ ] Create the Git repository structure and branch strategy
- [ ] Open a shared task board with phase-based ownership
- [ ] Ask Asad to lock backend contracts before major frontend work
- [ ] Ask Ayesh to start wireframes and frontend shell using mock data

### Abdul's Rule as Team Lead

If two people are blocked on missing decisions, Abdul resolves the contract first instead of letting parallel work drift.

---

## Quick Status

| Phase | Status | Progress |
| --- | --- | --- |
| Phase 0: Scope Freeze and Kickoff | 🚧 IN PROGRESS | 0/7 |
| Phase 1: Foundation and Environment Setup | NOT STARTED | 0/9 |
| Phase 2: Secure Upload and Data Modeling | NOT STARTED | 0/9 |
| Phase 3: OCR and Structured Extraction | NOT STARTED | 0/10 |
| Phase 4: Review, Validation, and Audit Workflow | NOT STARTED | 0/10 |
| Phase 5: Plan of Care Draft Generation | NOT STARTED | 0/9 |
| Phase 6: Readmission Risk Prediction | NOT STARTED | 0/9 |
| Phase 7: Integration, Security Hardening, and KPIs | NOT STARTED | 0/11 |
| Phase 8: Demo, Report, and Final Delivery | NOT STARTED | 0/10 |

---

## Team Responsibilities Summary

| Team Member | Main Ownership | Supporting Ownership |
| --- | --- | --- |
| Abdul Rehman | Cloud, ML, security, DevOps, architecture | integration decisions, compliance review |
| Asad Rasheed | Backend, OCR pipeline, APIs, schemas, research docs | validation logic, testing coordination |
| Ayesh Ahmed | Frontend, clinician UX, dashboard, integrations | usability testing, UI polish |

---

## Phase 0: Scope Freeze and Kickoff (Week 1)

### Objective

Lock the scope, architecture, forms, schema, and team operating model before major development begins.

### Abdul Rehman

- [ ] Finalize MVP workflow and remove non-essential scope from the first release
- [ ] Decide the primary Azure architecture
- [ ] Create first version of system architecture diagram
- [ ] Write HIPAA-oriented security checklist
- [ ] Define team meeting schedule and reporting format
- [ ] Create repository structure and environment strategy
- [ ] Approve the field list for extraction and review

### Asad Rasheed

- [ ] Collect sample OASIS and POC forms for MVP
- [ ] Create a field inventory for extraction targets
- [ ] Define initial JSON output schema for extracted documents
- [ ] Draft backend module structure
- [ ] List required APIs for upload, extraction, review, and save
- [ ] Document assumptions and data constraints
- [ ] Confirm which proposal metrics need backend support

### Ayesh Ahmed

- [ ] Create wireframes for login, upload, review, and dashboard screens
- [ ] Define clinician user flows
- [ ] List frontend screens needed for MVP only
- [ ] Identify reusable UI blocks for file upload, review tables, and risk cards
- [ ] Prepare mock frontend data formats based on proposed backend schema
- [ ] Review usability concerns in the workflow
- [ ] Align screen design with audit and role-based access needs

### Deliverables

- [ ] MVP scope lock
- [ ] Architecture diagram version 1
- [ ] Extraction field dictionary
- [ ] Initial API and JSON contract draft
- [ ] Wireframes for core workflow
- [ ] Security checklist version 1

### Exit Criteria

- [ ] All three members agree on the MVP path
- [ ] No major screen or backend contract is undefined

---

## Phase 1: Foundation and Environment Setup (Weeks 2-3)

### Objective

Create the technical skeleton of the system so each team member can work without blocking others.

### Abdul Rehman

- [ ] Provision Azure resource group and core services
- [ ] Configure storage, secrets, identity, and environment variables strategy
- [ ] Define dev, test, and demo environment boundaries
- [ ] Create Docker base setup
- [ ] Set up CI/CD structure
- [ ] Define RBAC model draft
- [ ] Set logging and monitoring baseline
- [ ] Create deployment checklist
- [ ] Review security baseline with the team

### Asad Rasheed

- [ ] Scaffold FastAPI project
- [ ] Create backend folder structure
- [ ] Configure PostgreSQL connection and migrations
- [ ] Define Pydantic schemas for users, documents, extracted fields, and review state
- [ ] Create health check endpoint
- [ ] Add auth middleware placeholder
- [ ] Add base upload endpoint contract
- [ ] Add API documentation scaffold
- [ ] Verify backend runs locally in Docker

### Ayesh Ahmed

- [ ] Scaffold Next.js project
- [ ] Configure TypeScript and chosen UI framework
- [ ] Build app shell with navigation and protected route structure
- [ ] Create login page and placeholder dashboard
- [ ] Set up shared component library
- [ ] Create upload page shell
- [ ] Create review page shell with mocked data
- [ ] Add API client structure
- [ ] Verify frontend runs locally

### Deliverables

- [ ] Working frontend skeleton
- [ ] Working backend skeleton
- [ ] Database connection
- [ ] Dockerized local environment
- [ ] Cloud environment baseline

### Exit Criteria

- [ ] Frontend and backend both start locally
- [ ] Team can run the system skeleton end-to-end

---

## Phase 2: Secure Upload and Data Modeling (Weeks 3-4)

### Objective

Make document upload secure and define the data model for all later AI stages.

### Abdul Rehman

- [ ] Finalize secure storage pattern in Azure Blob Storage
- [ ] Configure Key Vault secret access
- [ ] Define encryption and access policy documentation
- [ ] Review upload path against privacy constraints
- [ ] Create audit event design for upload actions
- [ ] Lock document retention assumptions
- [ ] Approve final role definitions for uploader, reviewer, and admin
- [ ] Validate storage cost assumptions
- [ ] Review access logs design

### Asad Rasheed

- [ ] Implement upload endpoint
- [ ] Store document metadata in PostgreSQL
- [ ] Create document status lifecycle
- [ ] Finalize document schema and extracted field tables
- [ ] Add validation for supported file types and size limits
- [ ] Create upload-to-storage integration
- [ ] Add audit log records for upload events
- [ ] Return document IDs and processing state to the frontend
- [ ] Test upload flow with sample files

### Ayesh Ahmed

- [ ] Implement upload UI
- [ ] Add file status and progress state
- [ ] Show document queue or history view
- [ ] Add validation feedback for wrong file types or size
- [ ] Build authenticated upload form
- [ ] Create uploaded-document detail page shell
- [ ] Connect frontend to real upload API
- [ ] Handle loading, success, and failure states
- [ ] Test upload experience across screen sizes

### Deliverables

- [ ] Secure document upload workflow
- [ ] Stored file metadata and lifecycle state
- [ ] Upload UI integrated with backend

### Exit Criteria

- [ ] A clinician can log in and upload a document successfully
- [ ] The file and metadata are stored securely

---

## Phase 3: OCR and Structured Extraction (Weeks 4-6)

### Objective

Convert uploaded forms into structured data that can be reviewed and used by later modules.

### Abdul Rehman

- [ ] Configure Azure Document Intelligence resources
- [ ] Define extraction accuracy measurement approach
- [ ] Approve golden set for evaluation
- [ ] Review compute and cost strategy for extraction pipeline
- [ ] Help define fallback logic for low-quality scans
- [ ] Track extraction KPI targets
- [ ] Review security posture of OCR integration
- [ ] Support model/service configuration decisions
- [ ] Record architecture updates for document AI flow
- [ ] Review performance expectations with the team

### Asad Rasheed

- [ ] Build OCR processing pipeline
- [ ] Parse OCR output into agreed schema
- [ ] Normalize dates, codes, and key values
- [ ] Implement field confidence handling
- [ ] Support key-value extraction for target MVP fields
- [ ] Add failure states for poor scans
- [ ] Save extracted JSON and raw OCR artifacts
- [ ] Implement extraction job status updates
- [ ] Measure accuracy on sample documents
- [ ] Expose extraction results API

### Ayesh Ahmed

- [ ] Build extraction results screen
- [ ] Show extracted fields grouped by section
- [ ] Display confidence badges or warning markers
- [ ] Add status indicator for processing, success, and failure
- [ ] Show OCR text snippet or source reference where practical
- [ ] Support refresh or retry actions
- [ ] Add visual treatment for missing fields
- [ ] Connect extraction API to the UI
- [ ] Test the results screen with sample documents
- [ ] Improve readability for clinicians

### Deliverables

- [ ] OCR pipeline integrated with upload workflow
- [ ] Structured extraction output
- [ ] Extraction result review screen

### Exit Criteria

- [ ] Uploaded documents move from pending to extracted state
- [ ] Key fields are visible in a structured review screen

---

## Phase 4: Review, Validation, and Audit Workflow (Weeks 6-8)

### Objective

Add the human-in-the-loop review layer that turns raw extraction into trusted approved records.

### Abdul Rehman

- [ ] Finalize audit log requirements
- [ ] Approve reviewer role permissions
- [ ] Define required compliance events for edits and approvals
- [ ] Review validation rules against business and compliance needs
- [ ] Approve data lineage approach for source citations
- [ ] Review usability of the approval workflow with the team
- [ ] Set KPI method for reviewer time measurement
- [ ] Ensure logging is complete for all critical actions
- [ ] Review data retention and change-history approach
- [ ] Sign off on the reviewer workflow design

### Asad Rasheed

- [ ] Build validation rules for missing and inconsistent fields
- [ ] Implement accept, edit, reject backend actions
- [ ] Save review state and revision history
- [ ] Add source mapping for extracted fields
- [ ] Create audit log entries for review actions
- [ ] Add APIs for reviewer queue and document detail
- [ ] Support comments or reason tracking
- [ ] Implement final approval save path
- [ ] Add reviewer time tracking hooks
- [ ] Test review flows end-to-end

### Ayesh Ahmed

- [ ] Build reviewer queue page
- [ ] Build document detail review screen
- [ ] Add accept, edit, and reject actions
- [ ] Highlight missing or uncertain fields
- [ ] Show source snippets or citations per field
- [ ] Add comment or reason UI where needed
- [ ] Show change history or status timeline
- [ ] Add review completion feedback
- [ ] Integrate reviewer time tracking UX if needed
- [ ] Validate the flow with realistic clinician scenarios

### Deliverables

- [ ] Full human review workflow
- [ ] Validation rules and field correction support
- [ ] Audit trail for review actions

### Exit Criteria

- [ ] A reviewer can approve a document with full traceability
- [ ] Edited values are stored with history

---

## Phase 5: Plan of Care Draft Generation (Weeks 8-10)

### Objective

Generate clinician-editable draft care plans using approved structured data and citation-backed generation.

### Abdul Rehman

- [ ] Define secure LLM usage policy
- [ ] Configure Azure OpenAI access and environment controls
- [ ] Decide retrieval sources for draft generation
- [ ] Approve citation and guardrail requirements
- [ ] Review prompt and template strategy
- [ ] Define evaluation method for section-level acceptance
- [ ] Track latency and cost constraints
- [ ] Review hallucination mitigation steps
- [ ] Approve final generation architecture

### Asad Rasheed

- [ ] Build retrieval and template pipeline
- [ ] Implement POC draft generation endpoint
- [ ] Attach citations or source references to generated sections
- [ ] Add guardrails for unsupported content
- [ ] Save generated drafts and status
- [ ] Implement regeneration or retry logic
- [ ] Add approval/edit persistence for care-plan drafts
- [ ] Create evaluation script for sample drafts
- [ ] Test generation outputs with sample cases

### Ayesh Ahmed

- [ ] Build Plan of Care draft editor UI
- [ ] Show generated sections with citations
- [ ] Add edit and approval workflow
- [ ] Show warnings for uncertain or unsupported text
- [ ] Build version or regeneration controls
- [ ] Add readable formatting for clinician review
- [ ] Integrate POC APIs
- [ ] Test the care-plan editing experience
- [ ] Improve UI for traceability and readability

### Deliverables

- [ ] Citation-backed POC draft generation
- [ ] Clinician-editable care-plan screen
- [ ] Stored draft and approval flow

### Exit Criteria

- [ ] The system generates usable draft care plans from approved data
- [ ] A clinician can edit and approve the draft in the UI

---

## Phase 6: Readmission Risk Prediction (Weeks 10-12)

### Objective

Add baseline readmission risk scoring with explainable outputs.

### Abdul Rehman

- [ ] Define target label and feature set for baseline model
- [ ] Prepare modeling notebook or pipeline
- [ ] Train baseline model
- [ ] Evaluate AUROC and Brier score
- [ ] Calibrate model probabilities
- [ ] Add SHAP-based explanation flow
- [ ] Document assumptions and data limits
- [ ] Create model packaging strategy for deployment
- [ ] Sign off on the final baseline model

### Asad Rasheed

- [ ] Build feature extraction pipeline from approved structured data
- [ ] Create backend inference endpoint
- [ ] Persist model scores and metadata
- [ ] Add model version tracking
- [ ] Expose explanation fields to the frontend
- [ ] Add validation for missing feature scenarios
- [ ] Test prediction API with sample records
- [ ] Support monitoring hooks for model outputs
- [ ] Document backend risk flow

### Ayesh Ahmed

- [ ] Build risk score card in dashboard
- [ ] Show risk band and explanation summary
- [ ] Add feature contribution or reason display
- [ ] Connect prediction results to patient or document context
- [ ] Show fallback state when prediction is unavailable
- [ ] Add visual priority indicators for high-risk cases
- [ ] Integrate risk APIs
- [ ] Test readability of risk outputs
- [ ] Refine clinician-facing presentation

### Deliverables

- [ ] Baseline readmission prediction module
- [ ] Explainable risk output in clinician UI
- [ ] Stored prediction records

### Exit Criteria

- [ ] Risk scores are generated from approved patient records
- [ ] Clinicians can understand why a case is high risk

---

## Phase 7: Integration, Security Hardening, and KPIs (Weeks 12-14)

### Objective

Make the product reliable, secure, measurable, and demo-ready as one complete system.

### Abdul Rehman

- [ ] Complete Dockerization for services
- [ ] Finalize CI/CD pipeline
- [ ] Run security checklist against the implementation
- [ ] Verify encryption at rest and in transit
- [ ] Validate RBAC behavior
- [ ] Set up monitoring dashboards
- [ ] Measure latency and cost per document
- [ ] Verify audit log completeness
- [ ] Create deployment guide
- [ ] Review KPI results against proposal targets
- [ ] Coordinate final integration review

### Asad Rasheed

- [ ] Run integration testing across upload, extraction, review, generation, and prediction
- [ ] Fix backend bugs and contract mismatches
- [ ] Complete API documentation
- [ ] Validate status transitions across modules
- [ ] Measure extraction accuracy and reviewer-time KPIs
- [ ] Record backend error cases and mitigation notes
- [ ] Improve reliability of retries and failure handling
- [ ] Prepare final technical report inputs for backend and methodology
- [ ] Support deployment fixes
- [ ] Validate logs and data consistency
- [ ] Run smoke tests after deployment

### Ayesh Ahmed

- [ ] Complete responsive and usability polish
- [ ] Run frontend integration testing across all MVP screens
- [ ] Fix UI bugs and workflow confusion points
- [ ] Improve loading, error, and empty states
- [ ] Validate role-based page access behavior
- [ ] Prepare demo navigation path
- [ ] Add charts or KPI displays for pilot report visuals
- [ ] Validate accessibility and readability
- [ ] Support post-deploy smoke testing
- [ ] Capture final screenshots for documentation
- [ ] Close remaining UI gaps

### Deliverables

- [ ] Integrated end-to-end MVP
- [ ] KPI measurements
- [ ] Security and deployment checklist
- [ ] Demo-ready build

### Exit Criteria

- [ ] The full workflow works without manual backdoor steps
- [ ] Security and KPI evidence is recorded

---

## Phase 8: Demo, Report, and Final Delivery (Weeks 14-16)

### Objective

Prepare the final report, pilot evidence, presentation flow, and handoff materials.

### Abdul Rehman

- [ ] Finalize architecture and cloud documentation
- [ ] Summarize model results, risk metrics, and compliance controls
- [ ] Create final technical diagrams
- [ ] Review and consolidate all team deliverables
- [ ] Prepare viva and product demo narrative
- [ ] Lead final integration sign-off
- [ ] Prepare pilot report with KPIs
- [ ] Review deployment reproducibility
- [ ] Coordinate final submission package
- [ ] Present team roadmap for future work

### Asad Rasheed

- [ ] Finalize backend and methodology write-up
- [ ] Write extraction and validation results section
- [ ] Write API and system-flow documentation
- [ ] Record limitations and future improvements
- [ ] Prepare demo script for backend-related flow
- [ ] Finalize references and technical evidence
- [ ] Support bug fixes during final review
- [ ] Help produce the pilot report narrative
- [ ] Validate final report consistency
- [ ] Package backend deliverables

### Ayesh Ahmed

- [ ] Finalize UI screenshots and screen walkthroughs
- [ ] Write frontend and usability section
- [ ] Prepare demo path for upload, review, POC, and risk views
- [ ] Refine UI for final presentation
- [ ] Support bug fixes during final review
- [ ] Help create the visual slides
- [ ] Validate final demo flow timing
- [ ] Prepare UI evidence for report and viva
- [ ] Package frontend deliverables
- [ ] Support final rehearsal

### Deliverables

- [ ] Final report inputs
- [ ] Pilot report with three KPIs
- [ ] Demo script and screenshots
- [ ] Submission-ready build and documentation

### Exit Criteria

- [ ] Team can demo the full MVP in a controlled sequence
- [ ] Report, evidence, and product all align

---

## Risks to Control Early

1. Scope explosion from adding the patient portal too early
2. Poor extraction quality from low-quality scans
3. Frontend blocked by unstable backend contracts
4. Delays caused by unclear ownership
5. Security gaps from rushed cloud setup

---

## Working Rules

- [ ] Update this file at the end of each working session
- [ ] Do not move to the next phase with major unresolved blockers in the current one
- [ ] Keep the clinician workflow as the MVP anchor
- [ ] Use synthetic or de-identified data during development whenever possible

---

## Files Created

| File | Purpose |
| --- | --- |
| `C:\Programming\FYP\AGENTS.md` | Team methodology, ownership model, and execution rules |
| `C:\Programming\FYP\PROGRESS.md` | Phase plan, task tracking, and per-member responsibilities |
| `C:\Programming\FYP\TEAM_DETAILED_STEPS.md` | Detailed person-by-person execution guide for Abdul, Asad, and Ayesh |

---

## Next Immediate Steps

1. Abdul should present Phase 0 and Phase 1 in the team discussion.
2. Asad should leave the first meeting with the field dictionary and draft API schema as his immediate deliverable.
3. Ayesh should leave the first meeting with core wireframes and the frontend shell as her immediate deliverable.
4. The team should not start advanced AI features until upload, extraction, and review are working in sequence.

---

## Session Notes

### 2026-04-29 - Documentation Asset Check

- Changed: Verified available documentation assets before starting report work.
- Why: Documentation work needs the existing proposal and official report template as source inputs.
- Current status: `fyp proposal final (1).docx` is available at the project root; no FYP report template was found in the repository or `docs/reports`.
- Next steps: Add the official report template to `docs/reports` before drafting the final report structure.
- Blockers or risks: `D:\1.Business\Ash Systems\assets\GLOBAL_MEMORY.md` cannot be updated in this environment because the `D:` drive is unavailable; `rg` is installed but cannot execute from the Codex app path, so PowerShell recursion is the safer fallback here.

### 2026-04-29 - Chapter 2 Literature Review Draft

- Changed: Created `docs/reports/Chapter_2_Literature_Review_Related_Work_Research_Gap.docx` covering sections 2.1 Literature Review, 2.2 Summary Table of Related Work, and 2.3 Research Gap Identification.
- Why: The report needs a researched Chapter 2 foundation based on the proposal, FYP-I R&D template, and report-writing guide.
- Current status: DOCX generated with IEEE-style citations and visually checked through artifact-tool PNG renders; the related-work table is embedded as high-resolution table images because native DOCX tables rendered incorrectly in artifact-tool.
- Next steps: Review wording with supervisor/team, then merge approved content into the full FYP report template and consolidate references in the final References chapter.
- Blockers or risks: `GLOBAL_MEMORY.md` still cannot be updated because `D:` is unavailable. Environment lessons: use PowerShell here-strings instead of Bash heredocs; set `PYTHONIOENCODING=utf-8` for DOCX text extraction; avoid very long inline Windows commands; artifact-tool may return nonzero while still producing PNGs; LibreOffice cross-check is unavailable because no `soffice` binary is installed.

### 2026-04-29 - Architecture Diagram Source

- Changed: Added `docs/architecture/fyp_architecture_diagram.mmd` and `docs/architecture/fyp_architecture_eraser.io` as architecture diagram source files.
- Why: The FYP report needs a professional system architecture diagram that can be rendered and polished in diagram tools.
- Current status: Eraser.io source covers users, secure Azure cloud boundary, frontend, FastAPI backend, AI processing, data storage, security controls, audit logs, OASIS-E2 extraction, POC generation, and readmission prediction.
- Next steps: Paste the Eraser.io source into Eraser, adjust icon names if Eraser reports unsupported icons, export as PNG/SVG, and insert into the report.
- Blockers or risks: Eraser icon names may vary by workspace; if an icon fails, replace it with a generic icon such as `server`, `database`, `lock`, `cloud`, or `file`.

### 2026-04-29 - Chapter 3 Dataset and AI Models Draft

- Changed: Created `docs/reports/Chapter_3_Dataset_Detail_AI_Models_Algorithms.docx` covering sections 3.7 Dataset Detail and 3.8 AI Models & Algorithms.
- Why: The report needs methodology content after the architecture diagram explaining the planned dataset, privacy posture, feature groups, model pipeline, algorithms, and evaluation metrics.
- Current status: DOCX generated using the FYP report template style and visually checked through artifact-tool PNG renders; wide summary tables are embedded as high-resolution images to avoid DOCX table render issues.
- Next steps: Review with the team/supervisor, then merge approved sections into the full Chapter 3 report document after the architecture diagram.
- Blockers or risks: `GLOBAL_MEMORY.md` still cannot be updated because `D:` is unavailable. Environment lesson: the report template does not expose `List Bullet` to `python-docx`, so generated bullets should use explicit text or verified style names.

### 2026-04-29 - Open-Source Model Revision

- Changed: Revised Chapter 2 and Chapter 3 DOCX drafts to make the primary implementation stack student-friendly and open-source.
- Why: The project must be implementable by students without relying on paid cloud AI services.
- Current status: Chapter 2 and Chapter 3 now emphasize Tesseract OCR, OpenCV preprocessing, rule-based extraction, deterministic validation, template-based POC generation, scikit-learn Logistic Regression/Random Forest, optional XGBoost/LightGBM, and SHAP.
- Next steps: If the architecture diagram still names Azure AI Document Intelligence or Azure OpenAI as core services, update the diagram to mark them as optional future/benchmark components or remove them from the MVP path.
- Blockers or risks: Existing Word temporary lock files may appear when a DOCX is open in Word; close the document before regenerating if overwrite errors occur.

### 2026-04-29 - Open-Source Architecture Diagram Revision

- Changed: Updated `docs/architecture/fyp_architecture_eraser.io` and `docs/architecture/fyp_architecture_diagram.mmd` to match the open-source MVP implementation stack.
- Why: Architecture must align with the revised report sections and avoid presenting paid AI services as required components.
- Current status: Diagram source now uses OpenCV preprocessing, Tesseract OCR, rule-based extraction, validation rules, template-based POC generation, scikit-learn risk model, optional XGBoost/LightGBM, SHAP, PostgreSQL, secure file storage, audit logs, and secrets/config management.
- Next steps: Paste the updated Eraser.io source into Eraser, regenerate the diagram, and replace the old architecture image in the report.
- Blockers or risks: Managed Document AI and LLM/RAG are now marked only as optional future benchmarks/enhancements, not core MVP components.

### 2026-04-29 - Core RAG Implementation Revision

- Changed: Revised Chapter 2, Chapter 3, and both architecture diagram source files to make Retrieval-Augmented Generation a core Plan of Care drafting component.
- Why: The team decided to implement RAG in the MVP instead of describing it as a future enhancement.
- Current status: The documentation now defines a core RAG flow: approved OASIS-E2 fields and source snippets are indexed, a retrieval service returns top-k evidence, the POC generator creates cited drafts, and clinicians must review/approve the output. The implementation remains student-friendly by allowing local FAISS/Chroma retrieval or TF-IDF/BM25 fallback, with optional hosted LLM only as a generator backend.
- Next steps: Select the first RAG implementation path, preferably TF-IDF/BM25 baseline first and FAISS/Chroma embeddings second; create a small evidence corpus with source IDs; add retrieval and citation evaluation metrics.
- Blockers or risks: RAG adds hallucination, retrieval-quality, citation-coverage, and compute/API risks. Keep unsupported-statement checks, missing-evidence warnings, audit logging, and human review mandatory. `GLOBAL_MEMORY.md` still cannot be updated because the `D:` drive is unavailable; artifact-tool again returned nonzero while producing usable DOCX page PNGs, so page images were inspected manually.

### 2026-04-29 - Professional Eraser Architecture Rewrite

- Changed: Rewrote `docs/architecture/fyp_architecture_eraser.io` into a cleaner layered architecture diagram source.
- Why: The previous architecture code was technically correct but visually too flat for a professional report diagram.
- Current status: The new Eraser source separates actors, presentation, identity/access, backend workflow, document AI, core RAG implementation, risk prediction, protected data stores, security/governance, and optional external benchmarks. The RAG path is numbered and shown as a core flow from evidence building to retrieval, cited generation, guardrails, and clinician approval.
- Next steps: Paste the updated source into Eraser.io, auto-layout the diagram, then export as PNG/SVG for the Chapter 3 architecture figure.
- Blockers or risks: Eraser icon names can vary by workspace. If an icon fails, replace only that icon with a generic one such as `server`, `database`, `file`, `lock`, `cloud`, or `shield`.

### 2026-04-29 - Compact Architecture Diagram Source

- Changed: Reduced `docs/architecture/fyp_architecture_eraser.io` from a detailed service-level diagram to a compact report-friendly architecture.
- Why: The professional version was too large for insertion into the report.
- Current status: The compact diagram now uses 11 main nodes across application, AI pipeline, protected data, and governance layers while preserving the numbered upload, extraction, RAG POC, risk, audit, and optional benchmark flows.
- Next steps: Paste the compact source into Eraser.io, use auto-layout, and export the smaller architecture figure.
- Blockers or risks: If Eraser still renders it too wide, use portrait/page-fit export or remove the optional external services node from the final report figure.

### 2026-05-06 - Abdul Semester Scope Review

- Changed: Reviewed proposal, planning docs, Chapter 2, Chapter 3, architecture source, and repository structure to clarify Abdul Rehman's role for a 30-40% semester demonstration.
- Why: The team needs a realistic first-semester target that matches Abdul's ownership: architecture, security, cloud/devops planning, ML/RAG governance, and integration decisions.
- Current status: Recommended focus is a 30-40% vertical slice: finalized architecture and security model, runnable skeleton, synthetic OASIS/POC dataset plan, OCR/extraction proof, RAG evidence/citation prototype, and readmission-risk baseline design or notebook.
- Next steps: Abdul should lock scope with Asad and Ayesh, then drive Phase 0-2 completion before expanding into full RAG and risk integration.
- Blockers or risks: Current repository is still mostly structure and documentation, not implemented product code. `GLOBAL_MEMORY.md` remains unavailable because the `D:` drive is not mounted.

### 2026-05-06 - Explanation Rule Added

- Changed: Added an explanation and knowledge-transfer rule to `AGENTS.md`.
- Why: Abdul wants every task explained properly so he understands what was done, why it matters, and how to present or defend it.
- Current status: Future work should include concise explanations of changed files, practical working logic, affected components, limitations, and presentation talking points where relevant.
- Next steps: Apply this rule to all future documentation, architecture, backend, frontend, RAG, OCR, and prediction-model work.
- Blockers or risks: `GLOBAL_MEMORY.md` remains unavailable because the `D:` drive is not mounted.

### 2026-05-08 - Abdul Clinician RAG Assistant Prototype

- Changed: Implemented Abdul Rehman's clinician-facing RAG chatbot MVP slice with a synthetic approved evidence corpus, TF-IDF retrieval, cited answer generation, refusal behavior, backend service adapter, command-line demo, workflow documentation, and unit tests.
- Why: Abdul's semester contribution is now a concrete technical implementation, not only supervision. The module demonstrates that RAG is a core MVP feature for cited Plan of Care assistance.
- Current status: `python -m unittest backend.tests.unit.test_rag_assistant -v` passes 5/5 tests. `python backend\modules\poc\rag_demo.py` shows supported cited answers and refuses the unsupported insulin question because the only insulin text is unapproved OCR.
- Abdul presentation explanation: The assistant is a controlled clinician RAG baseline, not a public chatbot. It does not answer from internet knowledge or model memory. It first retrieves approved patient-specific OASIS/POC evidence, then returns a cited response. If evidence is missing or only available in unapproved OCR, it refuses and asks for clinician-approved support.
- Next steps: Connect `backend/api/app/rag_service.py` to a FastAPI route, replace the JSON evidence file with PostgreSQL-backed approved snippets, add audit logging for every question/retrieval/answer, and add retrieval metrics such as citation coverage and unsupported-answer refusal rate.
- Blockers or risks: This is a local TF-IDF baseline, not a full LLM system. It is suitable for the 30-40% milestone but still needs API wiring, persistent storage, auth/RBAC checks, audit logs, and clinician review before production use. `GLOBAL_MEMORY.md` remains unavailable because the `D:` drive is not mounted; `rg.exe` also fails from the Codex app path with access denied, so PowerShell file commands are being used as the safer fallback. Avoid Bash heredoc syntax in PowerShell; use `python -c` or PowerShell here-strings instead.

### 2026-05-08 - RAG API Contract and Route Adapter

- Changed: Added `docs/api/rag_assistant_api.md`, `backend/api/app/rag_routes.py`, and `backend/tests/unit/test_rag_service.py`.
- Why: The RAG assistant now needs a clean handoff point for backend and frontend integration. The API contract tells Asad and Ayesh exactly what request/response shape to build against.
- Current status: The route adapter is FastAPI-ready but optional-safe, so it imports cleanly even before FastAPI is installed. The service adapter returns serializable dictionaries for clinician Q&A and cited POC section generation.
- Next steps: Add the real FastAPI app entrypoint, install backend dependencies, include the RAG router, then add auth/RBAC and audit logging before allowing real clinician workflow use.
- Blockers or risks: The route adapter does not yet enforce authentication or patient authorization. It must not be exposed publicly until login, role checks, patient access checks, and audit logs are implemented.

### 2026-05-08 - RAG FastAPI Endpoint Demo

- Changed: Added `backend/api/app/main.py` and `backend/tests/unit/test_rag_api.py`.
- Why: Abdul needs a demonstrable backend endpoint for the 30-40% milestone, not only a command-line demo. The API now exposes `/health`, `/rag/question`, and `/rag/poc-section`.
- Current status: The FastAPI app includes the RAG router in this environment. Endpoint tests verify cited mobility/fall-risk answers, cited POC section generation, and refusal for unsupported insulin questions.
- Next steps: Add dependency pinning, then layer auth, RBAC, patient-access checks, and audit logging around these endpoints before frontend integration.
- Blockers or risks: This is still a demo endpoint using synthetic JSON evidence. It must not be connected to real PHI until secure storage, approved evidence persistence, and audit controls exist.

### 2026-05-08 - RAG Security and Audit Demo Layer

- Changed: Added `backend/requirements.txt`, `backend/api/app/security.py`, `backend/api/app/audit.py`, demo identity headers, patient-access checks, and JSONL audit logging for RAG service calls.
- Why: A clinician chatbot must not be treated as a public endpoint. Abdul needs to show that RAG answers are protected by role checks, patient access, and traceable audit events.
- Current status: RAG endpoints require `X-User-Id`, `X-Role`, and `X-Patient-Ids` headers. Supported roles are clinician, reviewer, and admin. Non-admin users can only query patients listed in `X-Patient-Ids`. Each RAG answer now includes an `audit_event_id` and writes an ignored audit event under `data/processed/rag_audit_log.jsonl`.
- Work done estimate: Abdul's RAG semester slice is now about 70% complete for the 30-40% milestone. Completed: evidence store, retrieval, citations, refusal logic, POC draft support, API contract, FastAPI endpoints, demo RBAC, patient access, audit logging, docs, and tests.
- Work left: Replace demo headers with real authentication, store approved evidence in PostgreSQL, add audit-log review/export, build a simple frontend chatbot screen, add retrieval metrics, and connect with the document review approval workflow.
- Blockers or risks: Header-based identity is for demo only and is not secure enough for production. Audit logs are local JSONL and must move to database-backed immutable audit storage later. Environment lesson: FastAPI/Pydantic in this environment may fail to evaluate `str | None` annotations in dependency functions, so use `Optional[str]` for request dependency parameters.

### 2026-05-08 - RAG Retrieval Evaluation Metrics

- Changed: Added `data/synthetic/rag_eval_questions.json`, `backend/modules/poc/rag_evaluation.py`, and `backend/tests/unit/test_rag_evaluation.py`.
- Why: Abdul needs measurable demo evidence, not only a working chatbot. The evaluator shows citation coverage for supported questions and refusal accuracy for unsupported questions.
- Current status: The default evaluation runs against four synthetic cases: mobility/fall-risk summary, fall-prevention evidence support, main care problems, and unsupported insulin advice. It reports average citation coverage, refusal accuracy, and per-case source ID matches.
- Work done estimate: Abdul's RAG semester slice is now about 78% complete for the 30-40% milestone. Completed: chatbot retrieval, citations, refusal behavior, POC draft support, FastAPI endpoints, demo RBAC, patient access, audit logging, API docs, workflow docs, and retrieval metrics.
- Work left: Build a simple frontend chatbot screen, move evidence storage to PostgreSQL, replace demo auth headers with real authentication, add an audit-log viewer/export, and connect the evidence store to the document review approval workflow.
- Blockers or risks: Current evaluation uses a small synthetic test set, so the metrics prove behavior for the demo cases only. More scenarios are needed before claiming general clinical reliability. Environment lesson: scripts inside package folders need the repository root added to `sys.path` when they are intended to run directly by file path in PowerShell.

### 2026-05-08 - RAG Evidence Repository and PostgreSQL Schema

- Changed: Added `backend/modules/poc/evidence_repository.py`, `backend/tests/unit/test_evidence_repository.py`, and `docs/api/rag_evidence_schema.md`. Updated the RAG service to load evidence through the repository abstraction instead of directly from JSON.
- Why: The RAG assistant needs a clean path from the current synthetic JSON demo store to the real approved-evidence database. The repository contract lets the team replace JSON with PostgreSQL without rewriting chatbot logic.
- Current status: `JsonEvidenceRepository` filters approved evidence and can scope evidence by patient. The schema document defines the future `rag_evidence_snippets` table, indexes, lifecycle, minimum fields, and security rules.
- Work done estimate: Abdul's RAG semester slice is now about 83% complete for the 30-40% milestone. Completed: approved evidence repository, retrieval, citations, refusal behavior, POC draft support, endpoints, demo RBAC, patient access, audit logging, API/docs, workflow docs, metrics, and tests.
- Work left: Implement the actual PostgreSQL repository, build the frontend chatbot screen, replace demo headers with real authentication, add audit-log review/export, and connect approved snippets to Asad's document review workflow.
- Blockers or risks: The repository is still JSON-backed for the demo. PostgreSQL integration depends on the backend database setup and review table design.

### 2026-05-08 - RAG Audit Review Endpoint

- Changed: Added recent audit-log reading in `backend/api/app/audit.py` and exposed `GET /rag/audit/recent` through `backend/api/app/rag_routes.py`. Added tests for reviewer access and clinician rejection.
- Why: Abdul should be able to demonstrate that chatbot actions are traceable. A reviewer/admin can inspect which user asked what, which patient was involved, whether the assistant refused, and which source IDs were returned.
- Current status: The audit review endpoint is restricted to reviewer/admin demo roles. Clinicians can ask RAG questions but cannot view the audit log. Local audit events remain ignored under `data/processed/rag_audit_log.jsonl`.
- Work done estimate: Abdul's RAG semester slice is now about 88% complete for the 30-40% milestone. Completed: RAG chatbot, citations, refusal behavior, POC section drafting, endpoints, demo auth/RBAC, patient access, audit write/read, evidence repository, schema docs, metrics, and tests.
- Work left: Frontend chatbot screen, real authentication, PostgreSQL persistence, database-backed immutable audit storage, and integration with the reviewed document approval workflow.
- Blockers or risks: Local audit reading is acceptable for the demo but should be replaced by database-backed audit storage before any real PHI workflow.

### 2026-05-08 - RAG Supervisor Demo Script

- Changed: Added `docs/workflows/rag_demo_script.md`.
- Why: Abdul needs a clear presentation path showing what was implemented, how to run it, what each result proves, and what remains.
- Current status: The demo script covers tests, command-line chatbot demo, retrieval evaluation, API behavior, refusal behavior, access control, audit review, and final explanation.
- Work done estimate: Abdul's RAG semester slice is now about 90% complete for the 30-40% milestone. The backend demo is presentation-ready.
- Work left: Frontend chatbot screen, real authentication, PostgreSQL-backed evidence/audit storage, and integration with the document review workflow.
- Blockers or risks: The demo script should be updated after frontend and database integration so the final presentation matches the actual running system.

### 2026-05-08 - Review to RAG Evidence Builder

- Changed: Added `backend/modules/review/evidence_builder.py`, `backend/tests/unit/test_review_evidence_builder.py`, `data/synthetic/reviewed_oasis_demo.json`, and `docs/api/review_to_rag_contract.md`.
- Why: The RAG assistant must not use raw OCR directly. This builder defines the safe handoff where Asad's review workflow converts only clinician-approved fields into RAG evidence snippets.
- Current status: Approved diagnosis, mobility, and safety fields become `EvidenceSnippet` objects with stable citation IDs and review metadata. An unapproved insulin/OCR field is ignored by tests.
- Work done estimate: Abdul's RAG semester slice is now about 93% complete for the 30-40% milestone. Completed: RAG backend, approved-evidence filtering, review-to-RAG conversion, citations, refusal behavior, POC drafting, endpoints, demo RBAC, patient access, audit write/read, metrics, schema/docs, demo script, and tests.
- Work left: Frontend chatbot screen, real auth instead of demo headers, actual PostgreSQL repository implementation, database-backed audit storage, and live connection to Asad's future review approval endpoint.
- Blockers or risks: The builder is ready, but actual integration depends on the review API and database tables being implemented.

### 2026-05-08 - PostgreSQL Evidence Repository Adapter

- Changed: Added `PostgresEvidenceRepository` to `backend/modules/poc/evidence_repository.py` and unit coverage for DB row mapping.
- Why: The RAG assistant needs a realistic database path beyond JSON demo files. The adapter can read approved snippets from the future `rag_evidence_snippets` PostgreSQL table without changing the RAG assistant.
- Current status: The adapter uses a DB-API connection factory, filters `approved = TRUE`, optionally scopes by patient ID, maps metadata JSON, and returns `EvidenceSnippet` objects. It is tested with a fake DB cursor until real PostgreSQL is configured.
- Work done estimate: Abdul's RAG semester slice is now about 95% complete for the 30-40% milestone. Completed: demo JSON store, review-to-RAG builder, PostgreSQL repository adapter, retrieval, citations, refusal behavior, POC drafting, endpoints, demo RBAC, patient access, audit write/read, metrics, schema/docs, demo script, and tests.
- Work left: Frontend chatbot screen, real authentication, real PostgreSQL connection/migration execution, database-backed audit storage, and live integration with the review approval endpoint.
- Blockers or risks: The adapter is implemented but cannot be used against a real database until database credentials, migrations, and a connection library such as `psycopg` are added.

### 2026-05-08 - RAG PostgreSQL Migration Draft

- Changed: Added `backend/api/migrations/001_rag_evidence_audit.sql` and added `psycopg[binary]` to `backend/requirements.txt`.
- Why: The project now has executable PostgreSQL schema for approved RAG evidence and RAG audit events, not only documentation.
- Current status: The migration creates `rag_evidence_snippets`, `rag_audit_events`, and supporting indexes for patient scoping, section filtering, metadata search, and audit review.
- Work done estimate: Abdul's RAG semester slice is now about 96% complete for the backend/demo milestone. Completed: implementation, API, demo security, audit, metrics, review handoff, PostgreSQL adapter, and migration SQL.
- Work left: Execute migrations against a real PostgreSQL instance, replace JSON/local audit storage with DB-backed repositories, add real authentication, and build the frontend chatbot screen.
- Blockers or risks: The migration assumes base `users`, `patients`, `documents`, and `reviews` table relationships will be finalized later; foreign keys are intentionally not added yet to avoid blocking on unfinished schemas.

### 2026-05-08 - Clinician RAG Chatbot Demo Screen

- Changed: Added `apps/clinician-web/public/rag-chatbot-demo.html`, updated `apps/clinician-web/README.md`, enabled local demo CORS in `backend/api/app/main.py`, and updated `docs/workflows/rag_demo_script.md`.
- Why: Abdul now has a visible clinician chatbot screen for supervisor demonstration, not only backend endpoints and command-line output.
- Current status: The static demo screen can ask RAG questions, generate cited POC goals, display citations/confidence/refusal status, switch to reviewer role, and load recent RAG audit events.
- Work done estimate: Abdul's RAG semester slice is complete for the 30-40% demo milestone. Completed: backend RAG, review-to-RAG safety boundary, FastAPI endpoints, demo RBAC/patient access, audit logging/review, metrics, PostgreSQL readiness, and a clinician chatbot UI demo.
- Work left for production: Replace demo headers with real auth, execute PostgreSQL migrations, move JSON/local audit storage to database repositories, connect to Asad's live review approval endpoint, and rebuild the static screen as a proper Next.js page.
- Blockers or risks: The UI is static because the Next.js app has not been scaffolded yet and the required `ui-ux-pro-max` skill is unavailable in this session. It is suitable for demo, not final production UI.

### 2026-05-08 - RAG Demo Professionalization Pass

- Changed: Hardened `apps/clinician-web/public/rag-chatbot-demo.html` by escaping backend-provided answer, citation, audit, and error text before inserting it into the page. Added `backend/tests/unit/test_static_demo_ui.py`.
- Why: Even a demo UI should not normalize unsafe rendering patterns. Escaping backend content prevents accidental HTML/script rendering if future evidence text contains special characters.
- Current status: The static demo remains lightweight but now follows a safer rendering pattern and has regression coverage.
- Work done estimate: Abdul's RAG semester slice remains complete for the 30-40% demo milestone, with a more professional UI safety baseline.
- Work left for production: Replace the static demo with a real Next.js implementation using the final design system, real auth, and database-backed RAG storage/audit.
- Blockers or risks: The static page is still a demo artifact, not the final frontend architecture.

### 2026-05-09 - Merge With Remote Backend Scaffold

- Changed: Fetched `origin/main`, committed local RAG/report work, merged the remote backend scaffold, resolved conflicts in `backend/api/app/__init__.py` and `backend/api/app/main.py`, and updated `backend/api/README.md`.
- Why: A teammate pushed the document upload API scaffold to `origin/main`; Abdul's RAG assistant needed to be merged without losing either implementation.
- Current status: The combined FastAPI app includes RAG endpoints and will include document routes when the local environment has the required SQLAlchemy 2.x dependency stack. RAG tests pass after the merge.
- Work done estimate: Merge/integration is complete locally; pending final merge commit and push after validation.
- Work left: Finish merge commit, push `main`, then install backend API dependencies in a clean virtual environment if document upload routes need to be tested locally.
- Blockers or risks: The current machine has SQLAlchemy 1.4, while the teammate scaffold requires SQLAlchemy 2.x. The app now degrades gracefully for document routes instead of crashing, but full document API testing requires installing `backend/api/requirements.txt`.
