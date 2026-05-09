# Clinician RAG Assistant Workflow

## Purpose

Abdul Rehman's revised semester implementation is a clinician-facing RAG chatbot module. It answers questions only from approved OASIS and Plan of Care evidence, returns source citations, and refuses unsupported questions.

This is not a patient or caregiver chatbot. It is a clinical review assistant for the internal workflow:

```text
Approved OASIS/POC evidence -> Retrieve top snippets -> Generate cited answer -> Clinician reviews output
```

## Semester Scope

For the 30-40% milestone, the working target is:

- Synthetic/de-identified RAG evidence store.
- Local TF-IDF retrieval baseline.
- Backend service function or endpoint adapter.
- 3-5 clinician demo questions.
- Cited answers with source snippets.
- Refusal behavior when approved evidence is missing.

## Safety Rules

- Use only evidence marked `approved: true`.
- Never answer from raw OCR text that has not passed clinician review.
- Never answer from general internet knowledge.
- Return citations for every supported answer.
- Refuse when the retrieved evidence is weak or missing.
- Keep clinician review mandatory before Plan of Care content is accepted.
- Use synthetic or de-identified data during development.

## Allowed Question Types

- What are this patient's main care problems?
- Generate a Plan of Care goal from the approved OASIS fields.
- Which evidence supports this intervention?
- Summarize mobility and fall-risk concerns.
- What information is missing before generating the POC?

## Blocked Behavior

- Patient-facing medical advice.
- Medication changes not supported by approved evidence.
- Diagnosis or treatment recommendations from model memory.
- Use of unapproved OCR as final truth.
- Unsupported Plan of Care statements without citations.

## Current Implementation

The prototype is implemented in `backend/modules/poc/rag_assistant.py`.

The pipeline works as follows:

1. Load synthetic evidence from `data/synthetic/rag_evidence_demo.json`.
2. Filter out unapproved evidence.
3. Tokenize approved snippets and build TF-IDF vectors.
4. Classify the clinician question into a safe template type.
5. Retrieve top matching approved snippets for the patient.
6. Generate a conservative answer using retrieved snippets.
7. Return citations containing source IDs, section names, snippets, and retrieval scores.
8. Refuse the answer if no approved evidence is strong enough.

The API layer is implemented in `backend/api/app/main.py` and `backend/api/app/rag_routes.py`.
It currently uses demo headers for clinician identity and patient access:

```http
X-User-Id: demo-clinician-1
X-Role: clinician
X-Patient-Ids: SYN-001
```

Each successful RAG endpoint call writes an ignored JSONL audit event to `data/processed/rag_audit_log.jsonl`.
Reviewer/admin users can inspect recent demo audit events through `/rag/audit/recent`.

The evidence access layer is implemented in `backend/modules/poc/evidence_repository.py`.
The current repository reads JSON, but the interface is designed so it can be replaced with PostgreSQL later.
`PostgresEvidenceRepository` is already defined as the future database adapter; it needs a real connection factory once PostgreSQL is configured.

The review-to-RAG bridge is implemented in `backend/modules/review/evidence_builder.py`.
It converts approved reviewed fields into RAG evidence snippets and ignores unapproved OCR/review fields.

## Demo Questions

Use this command:

```powershell
python backend\modules\poc\rag_demo.py
```

Demo questions:

- What are this patient's main care problems?
- Generate a Plan of Care goal from the approved OASIS fields.
- Which evidence supports fall-prevention intervention?
- Summarize mobility and fall-risk concerns.
- Should we start insulin for this patient?

The insulin question should be refused because the only insulin-related text is unapproved raw OCR evidence.

## Evaluation Metrics

Use this command:

```powershell
python backend\modules\poc\rag_evaluation.py
```

The evaluator uses `data/synthetic/rag_eval_questions.json` and reports:

- `average_citation_coverage`: how many expected source IDs were returned for supported questions.
- `refusal_accuracy`: whether unsupported questions were refused correctly.
- Per-case matched and returned source IDs.

## How Abdul Should Explain It

Abdul should explain that this is a controlled RAG baseline, not an open chatbot. The assistant does not freely invent answers. It retrieves approved clinical evidence first, then creates a cited response. If evidence is missing, the assistant refuses and asks for clinician-approved support.

This makes RAG a core MVP implementation while keeping the first semester scope realistic and safe.

## Next Steps

- Replace demo header authentication with real JWT/session authentication.
- Wire `PostgresEvidenceRepository` to the real PostgreSQL connection once database setup is available.
- Connect Asad's review approval endpoint to `build_rag_evidence_from_review`.
- Replace the local audit-log viewer with database-backed audit storage and export.
- Replace or supplement TF-IDF with BM25, FAISS, or Chroma when time allows.
- Expand retrieval evaluation with more synthetic patients and supervisor-approved scenarios.
