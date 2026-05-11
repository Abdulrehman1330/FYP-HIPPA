# Agent Working Methodology

**Last Updated:** 2026-05-06
**Project:** HIPAA-Compliant Home Health and Hospice AI Platform
**Purpose:** Document the working method for planning, building, testing, and tracking the Final Year Project consistently across sessions

---

## Overview

This document defines how the team should build the product from proposal to MVP without losing control of scope.

The core MVP is:

1. Secure clinician login and role-based access
2. Document upload for OASIS and Plan of Care forms
3. OCR + key information extraction into structured JSON
4. Validation and human review of extracted fields
5. Draft Plan of Care generation with citations
6. 30-day readmission risk prediction
7. Audit logs, metrics, and a demo-ready pilot report

The patient or caregiver portal is **not** the first delivery target. It should only begin after the clinician workflow is stable end-to-end.

Following this methodology ensures:

- Clear ownership across Abdul, Asad, and Ayesh
- Stable build order with fewer blocked tasks
- Security and compliance considered from the start
- Measurable progress each week
- Easy resumability after interruptions

---

## Team Ownership Model

### Abdul Rehman

**Role:** Team Lead, Cloud and ML Owner

**Primary ownership**

- System architecture
- Azure cloud setup and networking
- Security and compliance controls
- Readmission risk model
- CI/CD, deployment, and Dockerization
- Final technical integration decisions

### Asad Rasheed

**Role:** Backend and Document AI Owner

**Primary ownership**

- FastAPI backend
- Database and API contracts
- OCR and document extraction pipeline
- Validation logic and review APIs
- Research-aligned technical documentation
- Backend testing and system coordination

### Ayesh Ahmed

**Role:** Frontend and Clinician Experience Owner

**Primary ownership**

- Next.js frontend
- Authentication and protected routes
- Upload, review, and approval screens
- Care-plan editor and risk dashboard
- Responsive UI and usability testing
- Frontend integration with backend APIs

---

## Core Workflow Pattern

### The 6-Step Cycle

Every meaningful task should follow this cycle:

```text
1. REVIEW PROGRESS
2. LOCK SCOPE + OWNER
3. IMPLEMENT
4. VALIDATE
5. DOCUMENT
6. UPDATE PROGRESS
```

### Explanation and Knowledge Transfer Rule

For every meaningful task, the assistant must explain the work clearly to Abdul Rehman so he understands the know-how, not only the final output.

Each final response should include, when relevant:

1. What was changed or created
2. Why it was needed
3. How it works at a practical level
4. Which files, diagrams, models, or documents were affected
5. How Abdul can explain or demonstrate it in the FYP presentation
6. Any limitations, assumptions, or next steps

The explanation should be concise but complete enough that Abdul can answer supervisor questions about architecture, security, RAG, OCR, the prediction model, and implementation decisions. Avoid hiding important technical reasoning behind vague statements such as "updated the code" or "fixed the issue."

### Step 1: Review Progress

Before starting work:

1. Read `PROGRESS.md`
2. Confirm the current phase
3. Pick the next incomplete task
4. Check dependencies between frontend, backend, cloud, and ML

### Step 2: Lock Scope and Owner

Before building:

1. Define the exact output of the task
2. Assign one clear owner
3. Define inputs and outputs
4. Freeze the contract before parallel work starts

Examples:

- Asad defines the extraction JSON schema before Ayesh builds the review UI
- Abdul defines auth, storage, and security boundaries before upload APIs go live
- Ayesh builds against mock responses while backend work is in progress

### Step 3: Implement

Build the smallest useful vertical slice first.

Preferred build order:

1. Secure foundation
2. Document ingestion
3. OCR and extraction
4. Human review
5. POC generation
6. Risk prediction
7. Reporting and deployment polish

### Step 4: Validate

Do not mark work complete until it is tested.

Minimum validation types:

- Unit or component checks where practical
- Integration checks across APIs and UI
- Manual review of real or synthetic form examples
- Security review for PHI handling
- Metric checks for extraction quality, latency, and model output

### Step 5: Document

After implementation:

1. Record important decisions
2. Note assumptions and limits
3. Update any API, schema, or architecture docs
4. Record blockers or follow-up work

### Step 6: Update Progress

After validation:

1. Mark completed tasks in `PROGRESS.md`
2. Update phase status
3. Add notes for what changed
4. Record what the next person can start without asking again

---

## Product Build Order

### Stage 1: Define the System Before Coding

Do not start by training models or designing fancy dashboards.

Start with:

- Target forms to support in MVP
- Required field list
- Output JSON schema
- User roles
- Upload, review, approve workflow
- Security boundaries

### Stage 2: Build the Core Clinician Workflow

The first complete usable workflow should be:

```text
Login -> Upload form -> Extract fields -> Review/edit -> Save approved record
```

If this does not work, the rest of the product is not ready.

### Stage 3: Add AI Assistance Carefully

After the review workflow is stable:

- Add Plan of Care draft generation
- Add citations and confidence indicators
- Keep a human in the loop

### Stage 4: Add Readmission Risk Prediction

Only after structured data is reliable:

- Engineer features
- Train a baseline model
- Calibrate scores
- Add explanations
- Show the score in the dashboard

### Stage 5: Pilot Readiness

Before the final demo:

- Dockerize services
- Run end-to-end tests
- Measure KPIs
- Prepare screenshots, metrics, and the pilot report

---

## Phase Handoff Rules

### Abdul to Asad

Abdul must provide:

- Approved architecture
- Storage and security model
- Environment strategy
- Allowed services and secrets handling rules

### Asad to Ayesh

Asad must provide:

- API contracts
- Request and response formats
- Validation error shapes
- Mock data for incomplete endpoints

### Ayesh to Abdul and Asad

Ayesh must provide:

- UI feedback on missing backend fields
- UX issues that require API refinement
- Screens that need role or audit support

---

## Definition of Done

A task is complete only when:

- The code or artifact exists
- It works against the agreed contract
- It was tested
- It is documented
- `PROGRESS.md` is updated

For AI-related tasks, done also means:

- Metrics are recorded
- Limitations are stated
- Human review remains possible where required

---

## Security and Data Rules

1. Do not use real PHI during development unless explicitly approved and protected.
2. Prefer synthetic or de-identified datasets.
3. Never hardcode secrets.
4. All document and model access must be role-based.
5. Log important actions for auditability.
6. Public endpoints must not expose sensitive records.

---

## Technical Standards

### Backend

- Prefer `FastAPI` for APIs and ML integration
- Keep schemas typed and versioned
- Separate OCR, validation, and prediction logic cleanly

### Frontend

- Use `Next.js` with TypeScript
- Build reusable review components
- Keep forms and review states explicit and traceable

### ML and AI

- Start with a baseline before optimization
- Keep feature engineering documented
- Prefer explainable outputs over opaque scores
- Do not let the LLM generate unsupported care-plan content without citations

### Infrastructure

- Keep environments reproducible with Docker
- Track config centrally
- Use Azure-native security features where possible

---

## Anti-Patterns to Avoid

Do not do this:

- Start the patient portal before the clinician workflow works
- Build the UI before the schema is defined
- Train models before the data format is stable
- Mix too many stacks without a reason
- Use real patient data casually
- Treat OCR output as final truth without review

Do this instead:

- Lock the MVP and build one complete vertical slice
- Freeze JSON contracts early
- Keep the human review loop central
- Use measurable KPIs from the proposal
- Build for demo quality only after workflow quality exists

---

## Session Continuity

### Starting a New Session

1. Read `PROGRESS.md`
2. Confirm phase and owner
3. Check open blockers
4. Resume from the next incomplete task

### Ending a Session

1. Save or commit meaningful work
2. Update `PROGRESS.md`
3. Leave clear notes for the next step

---

## Conclusion

This project will succeed if the team stays disciplined about order:

```text
Schema and security first
Core workflow second
AI assistance third
Optimization last
```

When in doubt, return to the MVP workflow:

```text
Login -> Upload -> Extract -> Review -> Approve -> Generate -> Predict
```

---

**Document Version:** 1.0
**Maintained By:** Abdul Rehman and Team
