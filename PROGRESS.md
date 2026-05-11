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

### 2026-05-12 - Isolated Contabo Docker Deployment Scaffold

- Changed: Added production Dockerfiles for the Node backend and Vite frontend, Docker ignore files, an isolated Contabo compose/Caddy deployment package under `infra/contabo/hippa-home`, and a GitHub Actions workflow for GHCR image builds plus VPS deployment to `/opt/hippa-home`.
- Why: Abdul wants the university project deployed on Contabo with `hippa-home.duckdns.org` and `hippa-home-api.duckdns.org`, separate from Ash Systems runtime paths, databases, networks, and secrets.
- Current status: The production stack uses only Caddy public ports `80/443`; Postgres, backend, OCR, ML, and frontend are internal compose services. Public registration is disabled by default in production, and owner bootstrap uses GitHub secret-provided `OWNER_*` variables. Optional AI keys are mapped through project-scoped Compose variables to reduce accidental local shell secret leakage.
- Validation: Frontend production build passed. Prisma schema validation passed. Backend syntax checks passed for deployment-touched files. Docker images built successfully for frontend, backend, OCR, and ML. ML health smoke test returned healthy with `model_loaded=true`. Compose config validation passed after removing the required local `.env` dependency.
- Next steps: Add required GitHub repository secrets, confirm DuckDNS records point to the Contabo VPS IP, then run the `Deploy HIPAA Home to Contabo` workflow manually before relying on push deployment.
- Blockers or risks: The configured global memory path `D:\1.Business\Ash Systems\assets\GLOBAL_MEMORY.md` is unavailable on this machine, so reusable deployment/error lessons could not be persisted there. A local Compose validation run resolved generic host AI key variables before the deployment env names were scoped; rotate any real AI keys present in this machine's environment before production use.

### 2026-05-12 - Project Local Global Memory Created

- Changed: Created `GLOBAL_MEMORY.md` at the FYP repo root for project-specific reusable lessons and deployment memory. Updated `AGENTS.md` so future sessions read and maintain this file.
- Why: The previous configured memory path belonged to Ash Systems and was unavailable on this machine; Abdul wants this university project to keep its own memory.
- Current status: Future FYP work should update `C:\Programming\FYP\GLOBAL_MEMORY.md` instead of the Ash Systems memory file.
- Next steps: Keep this memory concise and add only durable lessons, environment quirks, and recurring project conventions.
- Blockers or risks: Older `PROGRESS.md` entries still mention the old Ash Systems path historically, but the active memory file for this project is now repo-local.

### 2026-05-12 - HIPAA Home Deployed To Contabo

- Changed: Deployed the FYP stack on the Contabo VPS under `/home/deploy/hippa-home`, built production images on the VPS, started isolated Postgres/backend/frontend/OCR/ML containers, ran Prisma migrations, seeded the owner account, and added DuckDNS routes to the existing edge Caddy.
- Why: Abdul asked to deploy the Dockerized university project using `hippa-home.duckdns.org` and `hippa-home-api.duckdns.org` while keeping it separate from Ash Systems app networks and databases.
- Current status: `https://hippa-home.duckdns.org` serves the frontend and `https://hippa-home-api.duckdns.org/api/v1/health` returns healthy with database connected. Public registration returns `403`, and owner login returns `200`.
- Validation: Docker Compose shows all five HIPAA Home containers running; backend, Postgres, and OCR health checks are healthy; ML health reports `model_loaded=true`; Caddy config validated before restart.
- Next steps: Change the owner temporary password after first login, then add GitHub repository secrets if future deployments should run through the workflow instead of direct SSH.
- Blockers or risks: The VPS `deploy` user has no passwordless sudo, so the live path is `/home/deploy/hippa-home` instead of `/opt/hippa-home`. The existing edge Caddy owns `80/443`, so this deployment uses that edge proxy rather than starting the standalone Caddy profile.

### 2026-05-12 - GitHub Auto Deploy Secrets Configured

- Changed: Configured GitHub Actions repository secrets for VPS SSH, database, JWT, owner bootstrap, and Caddy email. Updated the deploy workflow to use GitHub's built-in `GITHUB_TOKEN` for GHCR instead of requiring separate GHCR secrets.
- Why: Abdul wants pushes to `main` to deploy automatically without committing VPS keys or runtime secrets.
- Current status: Required deployment secrets are present in GitHub. The VPS private key remains local and ignored; it was uploaded only as an encrypted Actions secret. Pushes to `main` now run the Contabo deploy workflow automatically.
- Validation: GitHub Actions run `25699122876` completed successfully for commit `31367d8`. Live smoke checks passed: `https://hippa-home-api.duckdns.org/api/v1/health` returned healthy with database connected, and `https://hippa-home.duckdns.org` returned HTTP 200.
- Next steps: Use the seeded owner account to change the temporary password, then treat future `main` pushes as production deploys.
- Blockers or risks: GitHub Actions will use the existing edge Caddy route already configured on the VPS. If the VPS is rebuilt from scratch, the edge Caddy route must be restored or the standalone Caddy profile must be used.

### 2026-05-12 - Synthetic Demo Data Seeded On VPS

- Changed: Seeded the live Contabo database with one synthetic demo clinic, three synthetic patients, three document records, 15 extracted fields, two generated POCs, one risk score, and demo audit entries.
- Why: Abdul asked to fill sample data for the deployed university demo without using real PHI.
- Current status: Demo credentials were generated with strong random temporary passwords and stored only in ignored local access material under `contabo-vps-access/hippa-home-demo-credentials.json`. Public registration remains disabled.
- Validation: Live API health still returns healthy with database connected. A seeded clinician login succeeds and returns `mustChangePassword=true`, so first use is forced through the password-change flow.
- Next steps: Use the local ignored credential file for the demo accounts, change each temporary password at first login, and keep all sample records synthetic.
- Blockers or risks: The GitHub repository is public, so committed content must stay free of PHI and secret values. GitHub Actions secret names are visible to authorized repo users, but values remain encrypted and are not committed.

### 2026-05-12 - ML Model Simplified To Logistic Regression

- Changed: Replaced the ML service's XGBoost/SHAP implementation with a scikit-learn Logistic Regression baseline trained on synthetic readmission data. Removed `xgboost` and `shap` from the ML service requirements and changed explanations to coefficient-based top factors.
- Why: Abdul asked to keep the ML model simpler for now.
- Current status: The `/predict` response shape remains compatible with the backend: `risk_score`, `risk_class`, and `explanation.top_factors` are still returned.
- Validation: Host Anaconda direct training failed because pandas/numpy binaries are mismatched, so validation used the production Docker path. The ML Docker image built successfully, trained the Logistic Regression baseline with AUROC `0.715`, local container `/health` returned `model_type=logistic_regression`, and local container `/predict` returned a compatible high-risk response with coefficient-based top factors. The deployed VPS ML container also returned `model_type=logistic_regression` and `model_version=logistic-regression-v0.1-synthetic`.
- Next steps: Push the workflow retry fix and confirm the next GitHub Actions run completes cleanly.
- Blockers or risks: This is a synthetic demo baseline, not a clinically validated model. The first deploy of this change updated the VPS containers but the GitHub job failed at the final frontend check because DuckDNS resolution briefly failed; the workflow now retries public health checks.

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

### 2026-05-10 - Pulled Friend's Force-Updated GitHub Work

- Changed: Fetched the latest GitHub `origin/main`, which had been force-updated, created backup branch `backup-before-friend-pull-2026-05-10`, and merged the new remote work into local `main`.
- Why: A teammate pushed a large updated backend/frontend implementation and Abdul wanted the latest GitHub code pulled without losing local RAG work.
- Current status: The merge introduced the teammate's Node/Prisma backend, OCR service, ML risk service, Vite frontend, Docker Compose setup, backend docs, and multitenant Prisma migrations. The local Python RAG assistant files were preserved.
- Work done estimate: Pull/merge is complete locally after conflict resolution. RAG unit/API tests pass, and the new Vite frontend production build succeeds.
- Work left: Commit the merge and decide whether to push the merged history back to GitHub, because the remote was force-updated.
- Blockers or risks: The remote force-push removed some previously pushed Python API scaffold files. A backup branch exists before this merge in case rollback or comparison is needed.

### 2026-05-10 - Patient Dashboard RAG Integration

- Changed: Integrated a patient-facing RAG assistant into the pulled Node/Prisma backend and Vite frontend. Added `backend/src/services/rag.service.js`, `backend/src/routes/rag.routes.js`, registered the route in `backend/src/app.js`, added `frontend/src/services/rag.service.js`, exported it from `frontend/src/services/index.js`, and added the care-plan assistant card to `frontend/src/pages/Dashboard/PatientDashboard.jsx`.
- Why: Abdul's RAG work needed to run inside the current teammate frontend/backend stack instead of remaining only as a separate Python/demo module.
- Current status: Patients can ask care-plan questions from the dashboard. The frontend calls `POST /api/v1/patient/rag/chat`; clinicians/admins can call `POST /api/v1/patients/:patientId/rag/chat`. Backend answers are built only from approved extracted fields and generated POC sections, include citations, and refuse medication-change, diagnosis, or insufficient-evidence questions. The dashboard has a safe demo fallback if the backend/database is not running.
- Work done estimate: RAG is now integrated into the current application stack for demo use. Abdul's RAG frontend/backend integration is about 85% complete for the semester milestone.
- Validation: `node --check` passed for the new backend RAG service, RAG route, and app registration. `npm run build` passed in `frontend`. The preserved Python RAG suite passed 23/23 tests.
- Work left: Seed or create real approved patient documents so the Node RAG endpoint can return database-backed citations during a live demo, add Node automated tests when a backend test harness is introduced, and decide whether the final production assistant remains patient-facing or shifts back to clinician-facing only.
- Blockers or risks: The required `ui-ux-pro-max` frontend skill is not available in this session, so the UI follows the existing dashboard design system instead. `D:\1.Business\Ash Systems\assets\GLOBAL_MEMORY.md` was not available, so reusable notes could not be recorded there.

### 2026-05-10 - Local Backend/Frontend Test Run

- Changed: Started Docker Desktop, launched the local PostgreSQL container, installed Node backend dependencies, created a local ignored `backend/.env`, applied Prisma migrations, started the Node backend on port `3000`, started the Vite frontend on port `5173`, and inserted synthetic local RAG test data.
- Why: Abdul needed to test the integrated patient RAG assistant end-to-end with the current frontend/backend stack.
- Current status: Backend health works at `http://localhost:3000/api/v1/health`, frontend works at `http://127.0.0.1:5173/`, and the frontend proxy works at `http://127.0.0.1:5173/api/v1/health`. Patient login `patient.demo@fyp.local` / `Password123!` works locally.
- Validation: Auth login succeeds. Authenticated `POST /api/v1/patient/rag/chat` returns cited care-plan evidence for fall-risk questions and refuses unsafe medication-dose questions.
- Work left: Use the browser manually to log in and test the patient dashboard RAG card, because browser automation could not type into the email input due to a tooling limitation.
- Blockers or risks: If Docker Desktop stops, PostgreSQL stops and the backend will fail or lose connection until Docker/Postgres is restarted. `GLOBAL_MEMORY.md` remains unavailable on this machine.

### 2026-05-10 - Login Troubleshooting

- Changed: Restarted the Node backend and Vite frontend after Abdul saw a browser console login error. Re-tested backend health, frontend proxy health, valid patient login, invalid-login handling, and direct `GET /api/v1/auth/login` behavior.
- Why: The browser message `Cannot GET /api/v1/auth/login` can look like a backend failure, but it is expected when opening the login API URL directly because login is only a `POST` endpoint.
- Current status: Backend is listening on port `3000`, frontend is listening on port `5173`, `POST /api/v1/auth/login` succeeds through both backend and frontend proxy, and invalid credentials return `401` instead of `500`.
- Work left: Abdul should test only from `http://127.0.0.1:5173/` using the login form and the seeded local patient credentials.
- Blockers or risks: Browser console `Permissions policy violation: unload is not allowed` is unrelated to the backend login API and can be ignored during this local test.

### 2026-05-10 - Local CORS Origin Fix

- Changed: Added `CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"` to local backend environment and documented the same value in `backend/.env.example`.
- Why: The browser was testing the frontend from `http://127.0.0.1:5173`, while the backend default CORS allow-list covered `localhost:5173` but not `127.0.0.1:5173`. This caused browser-origin login requests to fail even though non-browser API tests worked.
- Current status: Restarted the backend after updating CORS. Browser-style login requests with `Origin: http://127.0.0.1:5173` now return `200`.
- Validation: Backend health, frontend proxy health, and `POST /api/v1/auth/login` through `127.0.0.1:5173` all pass.
- Work left: Commit/push `backend/.env.example` if the team wants this setup fix shared.
- Blockers or risks: Local `backend/.env` is ignored and must be recreated or copied from `.env.example` on other machines.

### 2026-05-10 - Patient RAG Answer Readability

- Changed: Updated `backend/src/services/rag.service.js` so patient-facing answers no longer include raw source IDs or technical labels inside the main response. Added simple bullet-style wording and cleaner citation titles/snippets. Updated `frontend/src/pages/Dashboard/PatientDashboard.jsx` so answers preserve line breaks and citations appear under a separate `Sources used` heading.
- Why: The assistant was technically correct but difficult for a patient to understand because it mixed answer text with citation IDs such as `FIELD-...` and `POC-...`.
- Current status: The assistant now returns a readable answer such as `Simple answer`, followed by bullets like `Mobility`, `Safety`, and `Care team support`. Citations remain available separately for evidence traceability.
- Validation: Backend syntax check passed. Frontend production build passed. Authenticated RAG test for mobility returns a readable cited answer. Medication-dose question still refuses safely.
- Work left: Optionally add a clinician-facing version with more technical citations, while keeping the patient-facing version simple.
- Blockers or risks: The current response generator is deterministic and rule-based; it is safer for demo, but less flexible than a full LLM summarizer.

### 2026-05-10 - LLM-Based Plan of Care Generator Hardening

- Changed: Upgraded `backend/src/services/poc.service.js` into a clearer LLM-based Plan of Care generator. The generator now uses structured JSON prompts, evidence-only clinical guardrails, section-level citation enforcement, insufficient-evidence warnings, retry handling, and explicit generator metadata. The frontend POC screen now normalizes object/array section responses and shows generator mode plus missing-evidence warnings.
- Why: Abdul wanted a real LLM-based POC generator while keeping the project safe, explainable, and student-testable. The feature must not hallucinate unsupported clinical content or crash when an API key/quota is unavailable.
- Current status: If `OPENAI_API_KEY` is configured and valid, POC generation requests OpenAI using `OPENAI_MODEL`. If the key is blank or the LLM is unavailable, the backend automatically falls back to a deterministic cited draft so local testing continues without cost. All drafts remain clinician-review-only.
- Validation: Backend syntax check passed. Frontend production build passed. Direct service test and HTTP `POST /api/v1/poc/generate/:documentId` both returned versioned POC drafts with citations and generator metadata.
- Work left: Test true LLM output with a funded/valid API key. The current local key returned quota errors, so the endpoint correctly used deterministic fallback instead of failing with `500`.
- Blockers or risks: Any real LLM use requires a valid paid/available API key and must use synthetic/de-identified data only during FYP testing.

### 2026-05-11 - Gemini and Anthropic POC Provider Support

- Changed: Extended `backend/src/services/poc.service.js` with a multi-provider LLM abstraction for `gemini`, `anthropic`, `openai`, `auto`, and `none`. Added Gemini REST calls through `generateContent`, Anthropic REST calls through `/v1/messages`, updated backend environment config, documented provider keys in `backend/.env.example`, updated API docs, and improved the frontend generator label for LLM/mixed/fallback modes.
- Why: Abdul asked to support Gemini keys and Anthropic keys for the LLM-based Plan of Care generator, so the project is not locked to OpenAI and can use more student-friendly provider options.
- Current status: `LLM_PROVIDER=auto` chooses the first available key in this order: Gemini, Anthropic, OpenAI. Provider keys remain backend-only. If the chosen provider fails for any section, that section falls back to deterministic cited generation instead of crashing the endpoint.
- Validation: Backend syntax checks passed. Frontend production build passed. Fallback-only generation with `LLM_PROVIDER=none` returned a complete 7-section POC. HTTP POC generation with the current local environment selected Gemini and returned a mixed result with Gemini metadata plus fallback sections.
- Work left: Test Anthropic with a real `ANTHROPIC_API_KEY`; no Anthropic key was available locally during this session.
- Blockers or risks: Real Gemini/Anthropic/OpenAI use depends on valid API keys, provider quota, and synthetic/de-identified data only.

### 2026-05-11 - Anthropic Local Provider Selection

- Changed: Set local ignored `backend/.env` to `LLM_PROVIDER="anthropic"` and added the Anthropic model/version variables locally.
- Why: Abdul wants to test the Plan of Care generator with an Anthropic key.
- Current status: The key value was intentionally not written by the assistant to avoid duplicating a secret into command history or logs. Abdul should paste the key directly into `ANTHROPIC_API_KEY=""` in local `backend/.env`.
- Work left: After the key is pasted, restart the backend and run `POST /api/v1/poc/generate/:documentId` to confirm Anthropic generation.
- Blockers or risks: The key was pasted into chat, so it should be treated as exposed and rotated after testing.

### 2026-05-11 - Patient Read-Only Plan of Care View

- Changed: Added patient self-service endpoint `GET /api/v1/me/poc`, backed by `caseload.selfLatestPoc`, to return the logged-in patient's latest generated Plan of Care. Updated `pocService.getMyPoc()`, passed role context into `PocScreen`, and made the POC screen read-only for patients.
- Why: Abdul noticed the LLM POC generator was available for clinicians but not properly exposed to patients. Patients should be able to view their generated care plan, but they must not generate, edit, or sign clinical drafts.
- Current status: Patient users can open `My care plan` and see their latest generated POC in a read-only format. Clinicians/admins still keep generation, editing, and signing controls.
- Validation: Backend route/service syntax checks passed. Frontend production build passed. Restarted backend and verified `GET /api/v1/me/poc` with the local patient account returns the latest POC version.
- Work left: Optionally hide internal generator metadata from patient display if the supervisor wants a simpler patient portal.
- Blockers or risks: Patient view currently returns the latest generated POC, including draft status. For production, the endpoint should probably return only clinician-approved POC versions.

### 2026-05-11 - Patient POC Text Simplification

- Changed: Added patient-only Plan of Care text simplification in `frontend/src/pages/PlanOfCare/PocScreen.jsx`. The patient read-only view now derives a simple summary from section citations and hides raw draft phrases such as `draft based on approved evidence`, citation IDs, and clinician-review wording.
- Why: The patient view was technically read-only but still displayed the same clinical/fallback draft text, which was difficult to understand and did not visibly change for patients.
- Current status: Clinicians still see and edit the original clinical draft. Patients see simplified text with `Simple summary` and `What this means` guidance.
- Validation: Frontend production build passed.
- Work left: Optionally move the simplification to the backend later if the team wants a dedicated patient-facing POC API response.
- Blockers or risks: This is a display-layer simplification; the underlying stored POC remains the clinician draft for audit and editing.

### 2026-05-11 - Anthropic Provider Failure Diagnosed

- Changed: Added provider error metadata to fallback POC sections so LLM failures are visible without exposing secret keys.
- Why: The clinician POC text was not changing because every section was falling back to deterministic generation. The team needed to know whether the issue was code, model name, auth, or provider quota.
- Current status: Anthropic requests are reaching the provider, but Anthropic returns `invalid_request_error`: credit balance is too low to access the API. Because of this, `llmSectionCount` remains `0` and generated clinical text stays deterministic fallback text.
- Validation: Regenerated POC after backend restart and confirmed section metadata includes provider error status `400` with low-credit message.
- Work left: Add Anthropic credits, rotate/use a funded Anthropic key, or switch `LLM_PROVIDER` to a working Gemini/OpenAI key.
- Blockers or risks: Until a provider key with available credits is configured, clinical POC text will not be LLM-generated.

### 2026-05-11 - Gemini Local Provider Prepared

- Changed: Switched local ignored `backend/.env` from `LLM_PROVIDER="anthropic"` to `LLM_PROVIDER="gemini"` and added Gemini model/key variables.
- Why: Abdul wants to test POC generation with a Gemini API key after Anthropic failed due to low credit balance.
- Current status: Gemini provider is selected locally, but the actual key value was not written by the assistant to avoid duplicating a secret into command/tool logs. Abdul should paste the key directly into `GEMINI_API_KEY=""` in `backend/.env`.
- Work left: After the key is pasted, restart backend and regenerate POC to confirm `generator.provider = "gemini"` and `llmSectionCount > 0`.
- Blockers or risks: The Gemini key was pasted into chat, so it should be treated as exposed and rotated after testing.

### 2026-05-12 - POC Source Document Selector Added

- Changed: Added a source-document selector to the clinical Plan of Care screen. After selecting a patient, the UI loads that patient's approved/generatable documents (`APPROVED`, `POC_GENERATED`, `RISK_SCORED`) and requires choosing the exact document before generation. Generation now calls `POST /poc/generate/:documentId` for the selected document. Review queue/detail responses now include patient context, and Review approval passes `patientId`/`patientName` into the POC screen.
- Why: If a patient had two documents, the previous patient-only flow could still use the newest document automatically. The clinical workflow now makes the source document explicit and defensible.
- Current status: POC generation is patient-scoped and document-specific. Sidebar flow requires patient plus document selection; review flow carries the approved document into POC directly.
- Validation: Frontend production build passed. Backend syntax checks passed for review, POC service, and POC routes. Backend restarted and health check is healthy.
- Work left: Browser-test a patient with two approved documents and confirm selecting each document generates/loads the matching POC.
- Blockers or risks: The configured global memory path `D:\1.Business\Ash Systems\assets\GLOBAL_MEMORY.md` is still unavailable on this machine.

### 2026-05-12 - Clinical POC Patient Selector Added

- Changed: Added a patient selector directly to the clinical Plan of Care screen. When POC is opened from the sidebar without a patient context, clinicians/admins/doctors now choose a patient first. Generate POC is disabled until a patient or document is selected.
- Why: The backend was already patient-aware, but the clinical POC page did not ask which patient to use when opened globally, so users could not clearly control which patient's care plan was being generated.
- Current status: Sidebar POC flow now explicitly asks for patient context and calls patient-filtered POC APIs. Patient-chart POC flow still preselects and locks the chart patient.
- Validation: Frontend production build passed.
- Work left: Browser-test clinician sidebar POC by selecting two different patients and confirming the header/patient selector changes the loaded/generated POC.
- Blockers or risks: The configured global memory path `D:\1.Business\Ash Systems\assets\GLOBAL_MEMORY.md` is still unavailable on this machine.

### 2026-05-12 - Patient-Specific Clinical Upload and POC Flow

- Changed: Updated clinical patient navigation so selected `patientId` and patient name are carried into Upload, Review, and Plan of Care screens. Upload now requires a selected patient and sends `patientId` in the multipart form. Clinical patient detail now loads from patient endpoints instead of treating a patient ID as a document ID. POC latest/generate-latest APIs now accept an optional `patientId` and filter source documents to that patient before loading or generating care plans.
- Why: The clinical workflow could show Alexander or another fallback patient because backend patient IDs were incorrectly used as document IDs, upload allowed unassigned documents, and sidebar/latest POC generation selected the latest accessible document globally instead of the selected patient's document.
- Current status: Patient cards and patient detail actions now open patient-scoped upload/POC flows. Sidebar upload still works, but it requires choosing a patient first. Backend POC generation refuses missing patient evidence instead of silently using another patient's latest document when a patient filter is provided.
- Validation: Frontend production build passed. Backend syntax checks passed for POC routes, POC service, and document service. Backend was restarted and `GET /api/v1/health` is healthy with a fresh uptime. Authenticated clinician smoke test confirmed `GET /api/v1/poc/latest?patientId=f8b8734e-4b61-4c9b-934a-a9176d0f2e9d` returns Linh Nguyen's selected document, not a global latest document.
- Work left: Do an authenticated browser test with two different patients: upload one document per patient, approve/extract, then confirm each patient's POC uses only that patient's approved fields.
- Blockers or risks: The configured global memory path `D:\1.Business\Ash Systems\assets\GLOBAL_MEMORY.md` is not available on this machine, so reusable error notes could not be persisted there.

### 2026-05-11 - Gemini POC Generation Verified

- Changed: Restarted the backend with local Gemini provider settings and improved `parseJsonSection` so nested JSON returned by Gemini is unwrapped into plain section content.
- Why: Gemini was active, but one response shape returned JSON text inside the `content` field, causing the clinical section to display JSON-like text instead of readable clinical prose.
- Current status: Gemini is generating POC sections. Latest test returned `provider: gemini`, `model: gemini-2.5-flash`, `llmSectionCount: 6`, and `fallbackSectionCount: 1`. Patient Summary now reads as normal clinical text.
- Validation: Backend syntax passed. HTTP `POST /api/v1/poc/generate/:documentId` successfully generated Gemini-backed content.
- Work left: Improve evidence coverage so fewer sections need fallback, especially sections whose required fields are missing from the synthetic OASIS data.
- Blockers or risks: Gemini key was pasted in chat and should be rotated after testing.

### 2026-05-11 - Clinician POC Sidebar Regeneration Fixed

- Changed: Added backend endpoints `POST /api/v1/poc/generate-latest` and `GET /api/v1/poc/latest` so the clinician Plan of Care page can work even when opened from the sidebar without a `documentId`. Updated `frontend/src/pages/PlanOfCare/PocScreen.jsx` to load/generate real backend POC data instead of mock sections in that no-document route. Updated `frontend/src/services/poc.service.js` and `backend/docs/API.md`.
- Why: The clinical text fields were not changing because the sidebar POC screen had `docId = null`, so the frontend used mock text and mock regeneration instead of calling the LLM-backed backend.
- Current status: Sidebar POC now loads the latest accessible generated POC and `Regenerate all` calls the backend using the latest approved/POC/risk-scored document in the clinician/admin caseload. POC generation now requests all sections in one LLM call to reduce Gemini free-tier quota usage and handles provider retry-after messages before falling back.
- Validation: Backend syntax checks passed. Frontend production build passed. Backend restarted successfully and health check is healthy. Authenticated clinician tests confirmed `GET /poc/latest` and `POST /poc/generate-latest` use document `d2b72703-fe13-4a6d-b424-cd0976285da2` and create new POC versions.
- Work left: Re-test after Gemini free-tier quota resets or use a fresh/funded provider key so generated fields show LLM prose instead of deterministic fallback text.
- Blockers or risks: Gemini currently returns HTTP `429` free-tier quota exceeded, so the backend falls back safely and the text may still look unchanged until quota/key availability is fixed. The required global memory path `D:\1.Business\Ash Systems\assets\GLOBAL_MEMORY.md` could not be updated because the `D:` drive is not available in this environment.

### 2026-05-11 - Patient Portal Record Isolation Fix

- Changed: Added patient-only `GET /api/v1/me/risk` and updated patient frontend screens to use `/me/profile`, `/me/documents`, `/me/risk`, and `/me/poc` instead of mock patient/caseload data. Patient risk view now hides the all-patients risk table, cohort comparison, run-prediction action, and share-with-team action. Patient record view now ignores route patient IDs and always loads the authenticated patient's own profile.
- Why: Patient users could see mock records and a mock risk list for other patients because the frontend fell back to shared demo data and the patient risk page reused the clinician risk screen.
- Current status: Patient mode is strict read-only and self-scoped. If backend patient data is missing, it shows empty/not-scored states instead of another synthetic patient's clinical data.
- Validation: Backend syntax checks passed for `caseload.service.js` and `caseload.routes.js`. Frontend production build passed.
- Work left: Start Docker/PostgreSQL and run live patient login tests for `/me/profile`, `/me/documents`, `/me/risk`, and `/me/poc`.
- Blockers or risks: Docker Desktop/PostgreSQL was not running, so live backend HTTP verification could not be completed in this session.

### 2026-05-11 - Patient RAG Retrieval Fix

- Changed: Improved `backend/src/services/rag.service.js` retrieval by expanding general patient questions such as "What does my care plan say for today?" into approved evidence concepts like diagnosis, mobility, fall risk, safety, medication, goals, and interventions.
- Why: The patient had approved evidence, but the RAG retriever refused because general patient wording did not overlap enough with the clinical field names stored in the evidence corpus.
- Current status: Patient RAG now answers general care-plan questions with cited evidence and still refuses unsafe medication-dose change requests.
- Validation: Backend syntax check passed. Frontend production build passed. Direct backend and frontend-proxy tests for `POST /api/v1/patient/rag/chat` returned a cited answer with 4 citations. Unsafe insulin-dose question still refused.
- Work left: Optionally improve wording for specific fall-risk questions so it does not use the generic risk-score explanation when the user means fall risk.
- Blockers or risks: Current RAG response generation is still deterministic/rule-based, not LLM-based.

### 2026-05-11 - Demo Admin Account Seeding

- Changed: Added `backend/scripts/seed-demo-admins.js` and ran it locally to create/update demo `SUPER_ADMIN` and `ADMIN` users. The script is idempotent and attaches the admin account to `Demo Home Health Clinic`.
- Why: The local database had clinician, doctor, and patient demo accounts, but no admin or superadmin accounts for testing role-specific frontend pages.
- Current status: `superadmin.demo@fyp.local` and `admin.demo@fyp.local` now exist locally with active status and `mustChangePassword=false`.
- Validation: Login was verified successfully for `SUPER_ADMIN`, `ADMIN`, `CLINICIAN`, `DOCTOR`, and `PATIENT` demo accounts.
- Work left: Commit/push the reusable seed script if the team wants every machine to recreate these accounts consistently.
- Blockers or risks: The first script version attempted to upsert clinic by name, but `Clinic.name` is not unique in Prisma; it was corrected to `findFirst` by name and update by ID.

### 2026-05-11 - Topbar Search and Notifications

- Changed: Reworked `frontend/src/components/layout/Topbar.jsx` so the search bar is functional and the notification bell opens a role-aware notification dropdown. Passed `allowedNav` and `goto` from `App.jsx` into the topbar, added keyboard search with `Ctrl+K`, enter-to-open first result, quick navigation/action results, sign-out/change-password actions, unread notification state, and a `Mark read` control. Added `*.err` to `.gitignore` so temporary server error logs are not committed.
- Why: Abdul wanted the topbar notification button and search bar to stop being static UI elements and behave like real application controls.
- Current status: Search now works as role-aware navigation/action search for the pages each logged-in role is allowed to access. Notifications are functional client-side demo notifications, not yet database-backed notifications.
- Validation: `npm run build` passed in `frontend`. `git diff --check` passed for the edited frontend files. Frontend and backend were restarted locally; frontend returned `200` on `http://127.0.0.1:5173/` and backend health returned healthy after Docker/PostgreSQL was started.
- Work left: Add persistent backend notification records if the project needs real audit/event notifications, and add full patient/document text search if the supervisor expects database search rather than navigation/action search.
- Blockers or risks: Browser automation could open the app but could not type into the login email field because of a local automation limitation with `input type="email"`. The blocked browser session-injection shortcut was not used. The required global memory path `D:\1.Business\Ash Systems\assets\GLOBAL_MEMORY.md` could not be updated because the `D:` drive is not available.

### 2026-05-11 - OCR Implementation Check

- Changed: Reviewed the OCR microservice and Node extraction route. Fixed `backend/ocr-service/Dockerfile` so the container copies all imported modules, not only `app.py`, `field_extractor.py`, and `preprocessor.py`. Tightened `backend/ocr-service/field_extractor.py` section-boundary handling so list fields such as medications, allergies, goals, and interventions do not swallow later OASIS/POC sections.
- Why: Abdul asked whether OCR works. The code had a real Docker startup issue and the regex extractor was over-capturing multi-line sections in realistic synthetic text.
- Current status: The extraction design is valid: Node uploads documents, `POST /documents/:id/extract` calls the Python OCR service at `OCR_SERVICE_URL`, the OCR service uses PDF text-layer extraction first and Tesseract OCR fallback, then saves normalized fields into PostgreSQL. However, full OCR cannot currently run on this machine until the OCR service dependencies and Tesseract are available.
- Validation: Python compile check passed for `backend/ocr-service`. Node syntax check passed for `backend/src/routes/extraction.routes.js`. Direct field-extractor test found 12/14 synthetic OASIS/POC fields with corrected boundaries. Backend integration test returned the expected `503 UPSTREAM_UNAVAILABLE: OCR service unreachable` when the OCR service was not running.
- Work left: Install OCR Python dependencies and Tesseract locally, or build/run the OCR Docker container once Docker Hub DNS works. Then run `python test_service.py <sample.pdf>` and a full upload-to-extract API test.
- Blockers or risks: `tesseract` is not installed/on PATH. Python OCR dependencies are not installed and `pip install -r backend/ocr-service/requirements.txt` failed because package indexes were unreachable. Docker build also failed because Docker could not resolve `registry-1.docker.io`. A temporary upload used for the integration test exposed an existing delete-flow bug: document deletion conflicts with append-only audit-log constraints, so cleanup had to restore the uploaded file instead of deleting the document.

### 2026-05-11 - Backend Install and Run

- Changed: Re-ran backend `npm install`, regenerated Prisma Client, deployed Prisma migrations, and restarted the Node backend.
- Why: Abdul asked to install and run the backend from the current project state.
- Current status: Backend is running on port `3000` with process ID `33852`. PostgreSQL Docker container `fyp-postgres-1` is running and connected.
- Validation: `npm install` completed successfully after stopping the previous backend process. `npm run db:migrate` reported no pending migrations. `node --check src/server.js` and `node --check src/app.js` passed. `GET http://localhost:3000/api/v1/health` returns `{"status":"healthy","database":"connected"}`.
- Work left: Run `npm audit`/dependency remediation later if needed; install reported two high-severity npm audit findings but did not block startup.
- Blockers or risks: First `npm install` failed because the running backend locked Prisma's Windows query-engine DLL. Stopping the backend before Prisma generation resolved it. `GLOBAL_MEMORY.md` could not be updated because the configured `D:` drive path is not available on this machine.

### 2026-05-11 - OCR Service Installed and Running

- Changed: Installed OCR Python dependencies into Python 3.11, installed/extracted a local portable Tesseract runtime under `tools/tesseract-ocr`, downloaded `eng.traineddata`, and started the OCR FastAPI service on port `5000`. Updated OCR code to preserve Tesseract line breaks and normalize common OCR confusion where ICD-10 `I50.9` is read as `150.9`. Added `tools/` to `.gitignore` so the local binary runtime is not committed.
- Why: Abdul asked to install Tesseract and dependencies so OCR works locally instead of returning `OCR service unreachable`.
- Current status: OCR service is running on port `5000` with process ID `10660`. Backend is running on port `3000`. `POST /api/v1/documents/:id/extract` now reaches the OCR service successfully.
- Validation: `GET http://localhost:5000/health` returns `{"status":"healthy","service":"ocr"}`. OCR startup confirms `Tesseract ready (version=5.5.0.20241111)`. A synthetic OASIS image test returned 11 extracted fields: patient name, DOB, SOC date, primary diagnosis, ICD-10, functional status, medications, allergies, frequency, goals, and interventions. A full backend upload/extract test saved 11 extracted fields into PostgreSQL for document `d6c75251-1c87-46b1-bb10-ca43c4bfa4ea`.
- Work left: Use real/synthetic OASIS PDFs and scanned forms to evaluate accuracy beyond the synthetic image. Optionally create a checked-in PowerShell startup script for OCR so the Tesseract environment variables are set automatically.
- Blockers or risks: The normal Tesseract installer could not run because the installer/UAC flow was cancelled, so a portable extracted runtime is used instead. `pip install` only worked after forcing the official PyPI index. `GLOBAL_MEMORY.md` could not be updated because the configured `D:` drive path is not available.
