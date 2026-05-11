# Clinician RAG Assistant API Contract

## Purpose

These endpoints expose Abdul Rehman's RAG chatbot module to the backend/frontend workflow. They are clinician-only endpoints and must sit behind authentication, RBAC, and audit logging before production use.

## Route Module

Current adapter:

```text
backend/api/app/rag_routes.py
```

Backend app entrypoint:

```text
backend/api/app/main.py
```

The adapter is optional-safe: it imports without FastAPI installed. In the current environment FastAPI is available, so the main app includes the RAG router.

## Endpoint 1: Ask Clinician Question

```http
POST /rag/question
```

Request:

```json
{
  "patient_id": "SYN-001",
  "question": "Summarize mobility and fall-risk concerns."
}
```

Required demo headers:

```http
X-User-Id: demo-clinician-1
X-Role: clinician
X-Patient-Ids: SYN-001
```

Response:

```json
{
  "question": "Summarize mobility and fall-risk concerns.",
  "answer": "Mobility and fall-risk summary from approved evidence: ...",
  "citations": [
    {
      "source_id": "OASIS-SYN001-MOB",
      "patient_id": "SYN-001",
      "section": "mobility",
      "snippet": "Approved OASIS mobility field: patient requires a walker...",
      "score": 0.438,
      "source_type": "approved_oasis_field",
      "metadata": {
        "form": "OASIS-E2",
        "field": "ambulation_locomotion"
      }
    }
  ],
  "refused": false,
  "reason": null,
  "confidence": "high",
  "question_type": "mobility_safety",
  "audit_event_id": "generated-uuid"
}
```

## Endpoint 2: Generate Cited Plan of Care Section

```http
POST /rag/poc-section
```

Request:

```json
{
  "patient_id": "SYN-001",
  "section": "goals"
}
```

Response:

```json
{
  "question": "Generate Plan of Care goals section",
  "answer": "Draft Plan of Care goals based on approved evidence: ...",
  "citations": [],
  "refused": false,
  "reason": null,
  "confidence": "medium",
  "question_type": "poc_section"
}
```

## Endpoint 3: Review Recent RAG Audit Events

```http
GET /rag/audit/recent?limit=20
```

Required demo headers:

```http
X-User-Id: demo-reviewer-1
X-Role: reviewer
X-Patient-Ids: SYN-001
```

Only `reviewer` and `admin` demo roles can call this endpoint.

Response:

```json
{
  "events": [
    {
      "event_id": "generated-uuid",
      "timestamp_utc": "2026-05-08T12:00:00+00:00",
      "user_id": "demo-clinician-1",
      "patient_id": "SYN-001",
      "action": "rag_question",
      "question": "Summarize mobility and fall-risk concerns.",
      "refused": false,
      "source_ids": ["OASIS-SYN001-MOB", "OASIS-SYN001-SAFE"],
      "confidence": "high",
      "reason": null
    }
  ]
}
```

## Required Security Controls

- Only authenticated clinicians/reviewers/admins can call these endpoints.
- The current demo uses `X-User-Id`, `X-Role`, and `X-Patient-Ids` headers to simulate identity and patient access.
- The route enforces patient access before retrieval.
- Every request is audit logged with user ID, patient ID, question, returned source IDs, refusal status, confidence, reason, and timestamp.
- Recent audit review is restricted to reviewer/admin roles.
- The endpoint must use approved evidence only.
- Raw OCR text must not be indexed unless a clinician approves it.
- Responses are drafts and require clinician review before becoming part of the final Plan of Care.

## Frontend Display Requirements

- Show the answer separately from citations.
- Show `source_id`, section, and source snippet for every citation.
- Clearly show refusal messages when `refused` is true.
- Label generated Plan of Care content as draft until reviewed.
- Do not hide low confidence responses.

## Next Integration Steps

1. Add backend dependency files so FastAPI and Pydantic versions are locked.
2. Replace demo header authentication with real JWT/session middleware.
3. Replace the JSON demo evidence with PostgreSQL-approved evidence snippets.
4. Connect Ayesh's frontend chatbot UI to `/rag/question` and `/rag/poc-section`.
5. Replace local JSONL audit events with the `rag_audit_events` table from `backend/api/migrations/001_rag_evidence_audit.sql`.
6. Track retrieval quality using `python backend\modules\poc\rag_evaluation.py`.
