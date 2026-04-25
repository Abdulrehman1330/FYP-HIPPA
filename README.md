# FYP HIPAA Platform

This repository contains the initial monorepo structure for the Final Year Project: a HIPAA-compliant AI-assisted platform for home health and hospice documentation.

## Proposed Stack

- Frontend: Next.js, React, TypeScript
- Backend: FastAPI, PostgreSQL
- AI and ML: Azure Document Intelligence, Azure OpenAI, scikit-learn, XGBoost or LightGBM
- Infrastructure: Azure Blob Storage, Key Vault, Docker, Azure deployment services

## Repository Structure

```text
apps/
  clinician-web/     Main staff and clinician frontend
  patient-portal/    Patient and caregiver portal
  admin-web/         Admin and compliance interface
backend/
  api/               FastAPI app and API contracts
  modules/           Domain modules: documents, review, POC, risk
  workers/           Background processing jobs
  ml/                Risk modeling, pipelines, evaluation
  tests/             Unit and integration tests
packages/
  shared-types/      Shared contracts and constants
  ui/                Shared UI components
  config/            Shared config utilities
infra/
  docker/            Docker and compose setup
  azure/             Azure infrastructure notes and deployment docs
  scripts/           Utility scripts
docs/
  architecture/      Architecture diagrams and design notes
  api/               API documentation
  workflows/         Product and user workflow docs
  reports/           Proposal, reports, and pilot evidence
data/
  samples/           Sample forms
  synthetic/         Synthetic or de-identified data
  processed/         Generated outputs for local testing
```

## Team Ownership

- Abdul Rehman: architecture, cloud, security, ML, deployment
- Asad Rasheed: backend, OCR, APIs, validation
- Ayesh Ahmed: frontend, clinician workflow, portal UX

## Existing Planning Docs

- `AGENTS.md`
- `PROGRESS.md`
- `TEAM_DETAILED_STEPS.md`
- `TEAM_DETAILED_STEPS.pdf`

## Current Goal

The first milestone is not full product implementation. It is to establish the project structure cleanly so each team member can start in the correct folder without fighting over repo organization.
