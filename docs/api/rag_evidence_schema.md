# RAG Evidence Store Schema

## Purpose

The RAG assistant must retrieve from approved clinical evidence only. The JSON file in `data/synthetic/rag_evidence_demo.json` is a demo store. In the real backend, this should become PostgreSQL tables connected to the document review workflow.

## Evidence Lifecycle

```text
Uploaded document -> OCR/extraction -> clinician review -> approved evidence snippet -> RAG index
```

Raw OCR should not enter the RAG index until a clinician approves or corrects it.

## Suggested PostgreSQL Table

Migration source:

```text
backend/api/migrations/001_rag_evidence_audit.sql
```

```sql
CREATE TABLE rag_evidence_snippets (
    id UUID PRIMARY KEY,
    source_id TEXT NOT NULL UNIQUE,
    patient_id UUID NOT NULL,
    document_id UUID,
    review_id UUID,
    source_type TEXT NOT NULL,
    section TEXT NOT NULL,
    text TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Required Indexes

```sql
CREATE INDEX idx_rag_evidence_patient_approved
ON rag_evidence_snippets (patient_id, approved);

CREATE INDEX idx_rag_evidence_section
ON rag_evidence_snippets (section);

CREATE INDEX idx_rag_evidence_metadata
ON rag_evidence_snippets USING GIN (metadata);
```

## Audit Table

The same migration also defines `rag_audit_events` for database-backed RAG audit storage. It stores user ID, patient ID, action, question, refused status, returned source IDs, confidence, reason, and timestamp.

## Minimum Fields

- `source_id`: Stable citation ID shown to clinicians.
- `patient_id`: Used to prevent cross-patient retrieval.
- `source_type`: Example values: `approved_oasis_field`, `approved_poc_snippet`, `approved_review_note`.
- `section`: Clinical category such as diagnosis, mobility, safety, medications, interventions, or goals.
- `text`: The reviewed evidence snippet used by retrieval.
- `approved`: Must be true before indexing.
- `approved_by` and `approved_at`: Required for auditability.
- `metadata`: Stores original form name, field name, page number, or extraction confidence.

## Repository Contract

Current code:

```text
backend/modules/poc/evidence_repository.py
```

The current `JsonEvidenceRepository` loads the synthetic demo file. `PostgresEvidenceRepository` implements the same method using a DB-API connection factory:

```python
list_approved_evidence(patient_id: str | None = None)
```

This lets the RAG assistant move from JSON to PostgreSQL without changing the chatbot interface.

Example future wiring:

```python
from psycopg import connect
from backend.modules.poc.evidence_repository import PostgresEvidenceRepository

repository = PostgresEvidenceRepository(
    lambda: connect("postgresql://user:password@localhost:5432/fyp")
)
evidence = repository.list_approved_evidence(patient_id="SYN-001")
```

## Security Rules

- Query by patient ID before retrieval.
- Never return evidence for a patient the user cannot access.
- Do not index unapproved OCR.
- Keep citation IDs stable so generated POC drafts can be traced back to reviewed evidence.
- Audit each retrieval event with returned `source_id` values.
