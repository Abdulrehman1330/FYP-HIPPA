# Backend API Reference

Base URL: `http://localhost:3000/api/v1`

All authenticated endpoints expect:
```
Authorization: Bearer <JWT>
```
returned by `POST /auth/login`.

Standard response envelope:
```json
{ "success": true, "data": <payload> }
```
Errors:
```json
{ "success": false, "error": { "message": "...", "statusCode": 400 } }
```

---

## Roles

| Role | Can do |
|---|---|
| `ADMIN` | Everything |
| `CLINICIAN` | Upload, review, approve, generate POC, view risk |
| `VIEWER` | Read-only on own docs |

Routes that require role: `/review/*`, `/poc/*` → `CLINICIAN` or `ADMIN`.

---

## 1. Health

### `GET /health`
Liveness probe. **No auth.**

```json
{ "status": "ok", "timestamp": "2026-05-09T..." }
```

---

## 2. Authentication

### `POST /auth/register`
**No auth.**
```json
// request
{ "email": "u@x.com", "password": "Pass123!", "firstName": "Asad", "lastName": "Rasheed" }
// response 201
{ "success": true, "data": { "user": { "id": "...", "email": "..." }, "token": "<JWT>" } }
```

### `POST /auth/login`
**No auth.**
```json
// request
{ "email": "u@x.com", "password": "Pass123!" }
// response 200
{ "success": true, "data": { "user": {...}, "token": "<JWT>" } }
```

### `GET /auth/me`
Returns current user from JWT.
```json
{ "success": true, "data": { "id": "...", "email": "...", "firstName": "...", "lastName": "...", "role": "CLINICIAN" } }
```

---

## 3. Documents

### `POST /documents/upload`
`multipart/form-data` with field `file`. Max 10 MB. Accepts PDF / PNG / JPEG.

```json
// response 201
{ "success": true, "data": { "documentId": "<uuid>", "filename": "...", "status": "UPLOADED" } }
```

### `GET /documents?page=1&limit=20`
List uploader's documents.

### `GET /documents/:id`
Single document with status.

### `DELETE /documents/:id`
Soft-delete (cascades to extracted fields, review actions, POCs).

**Document statuses:**
`UPLOADED → PREPROCESSING → EXTRACTED → IN_REVIEW → APPROVED → POC_GENERATED → RISK_SCORED`
(plus `REJECTED`, `FAILED`)

---

## 4. Extraction

### `POST /documents/:id/extract`
Triggers OCR microservice → saves extracted fields → moves status to `EXTRACTED`.

```json
// response 200
{
  "success": true,
  "data": {
    "documentId": "...",
    "status": "EXTRACTED",
    "fields": [
      { "fieldName": "patient_name", "fieldValue": "Alexander Hill",
        "confidence": 0.9, "sourceSnippet": "page 1" }
    ],
    "totalPages": 4,
    "processingTimeMs": 19,
    "rawTextLength": 2843
  }
}
```

### `GET /documents/:id/extraction`
Just the extracted fields (no re-run).

---

## 5. Review (Clinician/Admin)

### `GET /review/queue`
Documents awaiting review (`EXTRACTED` + `IN_REVIEW`).

```json
{ "success": true, "data": [
  { "documentId": "...", "filename": "...", "status": "EXTRACTED",
    "uploadedBy": "Asad Rasheed", "uploadedAt": "...",
    "claimedBy": null, "claimedAt": null,
    "fieldCount": 9, "isValid": true, "errorCount": 0, "warningCount": 1 }
]}
```

### `GET /review/:id`
Full detail with per-field validation and review history.

```json
{ "success": true, "data": {
  "document": { "id": "...", "status": "IN_REVIEW", "claimedBy": {...}, "completedAt": null },
  "summary": { "isValid": true, "errorCount": 0, "warningCount": 1, "fieldCount": 9 },
  "fields": [
    { "id": "...", "fieldName": "patient_name", "fieldValue": "Alexander Hill",
      "confidence": 0.9, "sourceSnippet": "page 1",
      "validation": { "isValid": true, "errors": [], "warnings": [] } }
  ],
  "reviewHistory": [
    { "action": "EDIT", "reviewer": "Jane Doe", "fieldEdits": [...], "comments": "...", "timestamp": "..." }
  ]
}}
```

### `POST /review/:id/claim`
Claim the document (status → `IN_REVIEW`, sets `reviewClaimedAt`).
Conflict 409 if claimed by another reviewer.

### `POST /review/:id/release`
Drop your claim (status → `EXTRACTED`).

### `POST /review/:id/approve`
```json
// request (body optional)
{ "comments": "Looks good" }
// response 200
{ "success": true, "data": { "status": "APPROVED" } }
```
Returns 422 if validation errors exist; edit fields first.

### `POST /review/:id/edit`
Edit fields and approve atomically. Stores `{oldValue, newValue}` per field.
```json
// request
{
  "edits": { "patient_name": "Alexander A. Hill", "primary_icd10": "N18.3" },
  "comments": "Corrected middle initial"
}
// response 200
{ "success": true, "data": { "status": "APPROVED", "editCount": 2 } }
```
Returns 422 if edits leave validation errors.

### `POST /review/:id/reject`
```json
// request
{ "reason": "Document is illegible / wrong form type" }
```

### `GET /review/:id/metrics`
Reviewer-time metrics.
```json
{ "success": true, "data": {
  "reviewerId": "...",
  "startedAt": "2026-05-09T10:00:00Z",
  "completedAt": "2026-05-09T10:08:30Z",
  "reviewSeconds": 510
}}
```

---

## 6. Plan of Care (Clinician/Admin)

POC generation requires the document to be `APPROVED`.

### `POST /poc/generate-latest`
Generates a draft from the latest accessible approved/POC/risk-scored document with extracted fields.
This endpoint is used when the clinician opens the Plan of Care page from the sidebar without a selected `documentId`.
It applies the same clinic/caseload scoping as document access and returns `selectedDocument` metadata with the generated POC.

### `GET /poc/latest`
Returns the latest generated POC available to the logged-in clinician/admin/doctor. This lets the sidebar Plan of Care page load real saved data instead of demo/mock text.

### `POST /poc/generate/:documentId`
Generates a new versioned draft. Each call creates `version = previous + 1`.
Citations are pulled from approved extracted fields with `[N]` indexing.

Generation mode:
- `LLM_PROVIDER` can be `auto`, `gemini`, `anthropic`, `openai`, or `none`.
- In `auto` mode, the backend uses the first configured provider key in this order: Gemini, Anthropic, then OpenAI.
- Gemini uses `GEMINI_API_KEY` and `GEMINI_MODEL`.
- Anthropic uses `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, and `ANTHROPIC_VERSION`.
- OpenAI uses `OPENAI_API_KEY` and `OPENAI_MODEL`.
- The backend requests all POC sections in one LLM call to reduce free-tier quota usage, then falls back per section if the provider is unavailable or returns incomplete data.
- If the provider returns a retry-after quota message, the backend waits before retrying instead of immediately falling back.
- If no provider key is configured, or the selected provider is unavailable, the backend uses a deterministic fallback generator so local/student testing still works without API cost.
- All generated sections are drafts only. A clinician/admin must review, edit, and approve before finalization.
- The LLM prompt is constrained to approved evidence only. If evidence is missing, the section returns an insufficient-evidence warning instead of inventing clinical content.

```json
{ "success": true, "data": {
  "id": "...", "documentId": "...", "version": 1, "parentVersionId": null,
  "status": "draft", "generatedAt": "...",
  "generator": {
    "mode": "llm",
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "requestedProvider": "gemini",
    "requestedModel": "gemini-2.5-flash",
    "version": "poc-llm-v1",
    "llmRequested": true,
    "llmSectionCount": 7,
    "fallbackSectionCount": 0
  },
  "sections": {
    "patient_summary": {
      "section": "patient_summary",
      "title": "Patient Summary",
      "content": "Patient is a 63-year-old with stage 3 CKD [1][2]...",
      "citations": [
        { "index": 1, "fieldName": "primary_icd10", "value": "N18.3", "sourcePage": "page 1" },
        { "index": 2, "fieldName": "date_of_birth", "value": "12/17/1962", "sourcePage": "page 1" }
      ],
      "sufficientEvidence": true,
      "insufficientEvidenceReason": null,
      "editedByClinician": false,
      "generatedAt": "...",
      "generator": {
        "mode": "llm",
        "provider": "openai",
        "model": "gpt-4o-mini",
        "version": "poc-llm-v1"
      }
    },
    "problems": {...}, "goals": {...}, "interventions": {...},
    "medication_management": {...}, "safety_concerns": {...}, "follow_up": {...}
  }
}}
```

### `GET /poc/:documentId`
Latest version (full sections).

### `GET /poc/:documentId/versions`
All versions, metadata only.
```json
[ { "id": "...", "version": 2, "status": "draft", "parentVersionId": "<v1-id>", "generatedAt": "..." } ]
```

### `GET /poc/:documentId/versions/:version`
Specific version (full sections).

### `POST /poc/:documentId/edit`
Edit sections of the latest **draft** (409 if already approved).
```json
{ "edits": {
  "patient_summary": "Updated text...",
  "goals": "Updated text..."
} }
```

### `POST /poc/:documentId/approve`
Finalize the latest draft. Sets `approvedById`, `approvedAt`.

---

## 7. Risk (proxy to ML service — Abdul Rehman)

See [RISK_SERVICE_CONTRACT.md](./RISK_SERVICE_CONTRACT.md) for what the
ML microservice must implement. Until that's deployed, the backend uses
a heuristic fallback so the frontend can integrate against a stable shape.

### `POST /risk/predict/:documentId`
```json
{ "success": true, "data": {
  "documentId": "...",
  "risk_score": 0.42,
  "risk_class": "medium",
  "explanation": {
    "top_factors": [
      { "feature": "age", "value": 75 },
      { "feature": "has_chf", "value": 1 }
    ],
    "model_version": "logistic-regression-v0.1-synthetic"  // or "fallback" when ML_SERVICE_URL unset
  }
}}
```

### `GET /risk/:documentId`
Last stored prediction.

---

## Error codes summary

| Code | Meaning |
|---|---|
| 400 | Validation error / bad input |
| 401 | Missing/invalid JWT |
| 403 | Insufficient role |
| 404 | Resource not found |
| 409 | State conflict (already claimed, wrong status) |
| 413 | Upload too large |
| 422 | Cannot proceed (validation errors block approval) |
| 500 | Server error |
| 502 | Downstream service error (OCR / ML) |
| 503 | Downstream service unreachable |
