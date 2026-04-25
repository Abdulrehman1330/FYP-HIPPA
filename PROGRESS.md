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
