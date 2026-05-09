# Abdul RAG Assistant Demo Script

## Demo Goal

Show that Abdul implemented a clinician-facing RAG assistant, not only supervision. The assistant retrieves approved OASIS/POC evidence, returns citations, refuses unsupported questions, protects endpoints with demo RBAC, and records audit events.

## Work Done Estimate

Current RAG semester slice: about 90% complete for the 30-40% milestone.

Completed:

- Synthetic approved OASIS/POC evidence store.
- Local TF-IDF retrieval.
- Cited clinician answers.
- Unsupported-answer refusal.
- Cited Plan of Care section drafting.
- FastAPI endpoints.
- Demo clinician/reviewer/admin role checks.
- Patient access checks.
- Audit event writing and reviewer audit endpoint.
- Review-to-RAG evidence builder.
- Static clinician chatbot demo screen.
- Evaluation metrics for citation coverage and refusal accuracy.
- Unit/API tests and documentation.

Left for production:

- Real authentication instead of demo headers.
- Executed PostgreSQL-backed evidence storage.
- Executed database-backed immutable audit storage.
- Full integration with Asad's document review approval workflow.

## Step 1: Run Tests

```powershell
python -m unittest backend.tests.unit.test_evidence_repository backend.tests.unit.test_rag_assistant backend.tests.unit.test_rag_service backend.tests.unit.test_rag_api backend.tests.unit.test_rag_evaluation -v
```

Expected result:

```text
Ran 18 tests
OK
```

What Abdul should say:

```text
These tests prove the RAG assistant retrieves approved evidence, ignores unapproved OCR, refuses unsupported questions, checks patient access, writes audit events, and exposes working API endpoints.
```

## Step 2: Run Command-Line Chatbot Demo

```powershell
python backend\modules\poc\rag_demo.py
```

Show these behaviors:

- Main care problems answer includes diagnosis, hospitalization, mobility, and safety citations.
- Fall-risk answer cites mobility and safety evidence.
- Plan of Care goal is generated as a draft with citations.
- Insulin question is refused because insulin only appears in unapproved OCR.

What Abdul should say:

```text
The assistant does not answer from internet knowledge or model memory. It retrieves approved patient evidence first. If the evidence is missing or unapproved, it refuses.
```

## Step 3: Run Retrieval Evaluation

```powershell
python backend\modules\poc\rag_evaluation.py
```

Expected current demo metrics:

```text
average_citation_coverage: 1.0
refusal_accuracy: 1.0
```

What Abdul should say:

```text
These are demo metrics on synthetic cases. They show the evaluation method, not final clinical reliability. We will expand the test set as more approved OASIS and POC examples are added.
```

## Step 3A: Explain Review-to-RAG Safety Boundary

File to show:

```text
backend/modules/review/evidence_builder.py
```

Demo data:

```text
data/synthetic/reviewed_oasis_demo.json
```

What Abdul should say:

```text
The chatbot does not index raw OCR directly. The review module converts only approved clinician-reviewed fields into evidence snippets. Unapproved OCR fields, such as the insulin example, are ignored.
```

## Step 3B: Explain Database Readiness

File to show:

```text
backend/api/migrations/001_rag_evidence_audit.sql
```

What Abdul should say:

```text
The demo currently uses JSON because the full database is not configured yet, but the PostgreSQL migration is ready. It defines approved RAG evidence snippets and audit events, so the next step is executing this migration and wiring the repository to psycopg.
```

## Step 4: Demonstrate API Behavior

Use authorized clinician headers:

```http
X-User-Id: demo-clinician-1
X-Role: clinician
X-Patient-Ids: SYN-001
```

Endpoint:

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

Expected behavior:

- HTTP 200.
- `refused` is false.
- citations include approved source snippets.
- response includes `audit_event_id`.

## Step 4A: Demonstrate Chatbot Screen

Start the backend:

```powershell
uvicorn backend.api.app.main:app --reload
```

Serve the demo UI:

```powershell
cd apps\clinician-web\public
python -m http.server 8001
```

Open:

```text
http://127.0.0.1:8001/rag-chatbot-demo.html
```

What Abdul should show:

- Click "Mobility and fall risk" and ask the RAG assistant.
- Show citations under the answer.
- Click "Unsupported insulin" and show refusal.
- Click "Use Reviewer", then "Load Audit Events" to show traceability.

## Step 5: Demonstrate Refusal

Endpoint:

```http
POST /rag/question
```

Request:

```json
{
  "patient_id": "SYN-001",
  "question": "Should we start insulin for this patient?"
}
```

Expected behavior:

- HTTP 200.
- `refused` is true.
- citations are empty.
- reason says approved evidence is insufficient.

## Step 6: Demonstrate Access Control

No headers:

```text
Expected: 401 Unauthorized
```

Wrong patient header:

```http
X-User-Id: demo-clinician-2
X-Role: clinician
X-Patient-Ids: SYN-002
```

Question for `SYN-001`:

```text
Expected: 403 Forbidden
```

What Abdul should say:

```text
Even in the demo version, the chatbot is not public. It requires a clinician identity and patient access before retrieval.
```

## Step 7: Demonstrate Audit Review

Reviewer headers:

```http
X-User-Id: demo-reviewer-1
X-Role: reviewer
X-Patient-Ids: SYN-001
```

Endpoint:

```http
GET /rag/audit/recent?limit=5
```

Expected behavior:

- Reviewer/admin gets HTTP 200.
- Clinician gets HTTP 403.
- Events show user ID, patient ID, action, refused status, returned source IDs, confidence, and timestamp.

## Final Explanation

Abdul should close with:

```text
My implemented contribution is the clinician RAG assistant module. It is evidence-grounded, citation-based, refuses unsupported medical questions, and includes endpoint security, patient scoping, audit logging, and evaluation metrics. It is ready for frontend integration and database-backed evidence storage next.
```
