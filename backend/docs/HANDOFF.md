# Backend Handoff Guide

For **Ayesh Ahmed** (frontend) and **Abdul Rehman** (ML/cloud).

---

## What you get from this backend

| Surface | Doc |
|---|---|
| All REST endpoints (auth, upload, OCR, review, POC, risk) | [API.md](./API.md) |
| Postman collection (importable) | [postman_collection.json](./postman_collection.json) |
| ML service contract (Abdul) | [RISK_SERVICE_CONTRACT.md](./RISK_SERVICE_CONTRACT.md) |
| OCR microservice (auto-managed) | [../ocr-service/README.md](../ocr-service/README.md) |

---

## Run it locally (5 minutes)

### Prereqs

- Node.js ≥ 20
- PostgreSQL running locally on `:5432`
- Python 3.11+ (for the OCR microservice)
- Tesseract OCR installed: https://github.com/UB-Mannheim/tesseract/wiki
  (Windows installer; defaults are fine)

### Steps

```powershell
# 1. Clone, install
cd backend
npm install

# 2. Configure env
copy .env.example .env
# Edit .env — at minimum fill DATABASE_URL and JWT_SECRET

# 3. DB schema
npx prisma migrate deploy
npx prisma generate

# 4. OCR microservice (separate terminal)
cd ocr-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py        # listens on :5000

# 5. Express
cd ..\backend
npm run dev          # listens on :3000
```

Health checks:
- Backend: `curl http://localhost:3000/api/v1/health`
- OCR: `curl http://localhost:5000/health`

---

## Quickstart workflow

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"asad@example.com","password":"Pass123!","firstName":"Asad","lastName":"Rasheed"}'

# Login → grab token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"asad@example.com","password":"Pass123!"}' | jq -r .data.token)

# Upload
DOCID=$(curl -s -X POST http://localhost:3000/api/v1/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@sample.pdf" | jq -r .data.documentId)

# Extract (calls OCR service, saves fields)
curl -X POST http://localhost:3000/api/v1/documents/$DOCID/extract \
  -H "Authorization: Bearer $TOKEN"

# Review queue
curl http://localhost:3000/api/v1/review/queue -H "Authorization: Bearer $TOKEN"

# Approve
curl -X POST http://localhost:3000/api/v1/review/$DOCID/claim -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:3000/api/v1/review/$DOCID/approve -H "Authorization: Bearer $TOKEN"

# Generate POC draft (versioned, with citations)
curl -X POST http://localhost:3000/api/v1/poc/generate/$DOCID -H "Authorization: Bearer $TOKEN"

# Predict risk (uses fallback unless ML_SERVICE_URL set)
curl -X POST http://localhost:3000/api/v1/risk/predict/$DOCID -H "Authorization: Bearer $TOKEN"
```

---

## For the frontend (Ayesh)

- **Auth**: store JWT in `httpOnly` cookie or memory, NOT `localStorage`. Send as `Authorization: Bearer <token>`.
- **Status flow** (drives UI state machine):
  ```
  UPLOADED → PREPROCESSING → EXTRACTED → IN_REVIEW → APPROVED → POC_GENERATED → RISK_SCORED
  ```
  Plus terminal: `REJECTED`, `FAILED`.
- **Review screen** should call `GET /review/:id` for fields + per-field validation (errors block approve, warnings don't).
- **Source mapping** — every extracted field has `sourceSnippet` like `"page 3"` so the UI can highlight which page the value came from.
- **POC editor** — sections come with `citations[]`; render each as a footnote block. `editedByClinician: true` flag distinguishes user changes from LLM output.
- **CORS** — backend allows `http://localhost:5173` by default. Set `CORS_ORIGIN` in `.env` if your dev server runs elsewhere.

---

## For ML (Abdul)

See [RISK_SERVICE_CONTRACT.md](./RISK_SERVICE_CONTRACT.md). Until your service
exists, the backend uses a heuristic fallback so the frontend can integrate.
When you're ready, set `ML_SERVICE_URL` in `.env` and the backend auto-switches.

---

## Test data

Synthetic OASIS-E2 PDFs (50 samples) live at:
```
D:/PERSONAL/fyp/Kimi_Agent_OASIS-E2 Extraction Pipeline.zip
  └─ data/oasis_e2/synthetic_forms/pdf/SYN_001_oasis_e2.pdf … SYN_050_oasis_e2.pdf
```

These hit the PDF text-layer fast path (~20 ms/file). To test the full
Tesseract OCR path, render a sample to PNG first.

---

## What's owned by whom (per [proposal §7.1](../../../fyp-report/fyp%20proposal%20final.docx))

| Module | Owner |
|---|---|
| Backend / REST APIs / OCR integration | **Asad** |
| Frontend / clinician dashboard | **Ayesh** |
| ML model (XGBoost + SHAP), Azure infra, CI/CD | **Abdul** |

---

## Where things live

```
backend/
├── src/
│   ├── app.js                    # Express bootstrap
│   ├── config/                   # env, db, logger
│   ├── middleware/               # auth, errors, multer
│   ├── routes/                   # one file per resource
│   ├── services/                 # business logic
│   └── utils/
├── prisma/
│   ├── schema.prisma             # source of truth for DB
│   └── migrations/
├── ocr-service/                  # Python FastAPI + Tesseract
│   ├── app.py
│   ├── pdf_processor.py
│   ├── ocr_engine.py
│   ├── field_extractor.py
│   └── ...
├── docs/                         # YOU ARE HERE
│   ├── API.md
│   ├── HANDOFF.md
│   ├── RISK_SERVICE_CONTRACT.md
│   └── postman_collection.json
└── .env.example
```

---

## Common issues

| Symptom | Fix |
|---|---|
| `OCR service unreachable` (503) | Start `ocr-service/app.py`. Check `OCR_SERVICE_URL`. |
| `Tesseract not found` warning at OCR startup | Install Tesseract from UB-Mannheim, restart OCR service. |
| Prisma error after schema edit | `npx prisma generate` then restart Express. |
| 401 on every request | JWT expired (24h default). Login again. |
| 422 on approve | Validation errors on extracted fields — edit them via `/review/:id/edit`. |
| 409 on claim | Already claimed by another reviewer. Either coordinate or call `/release`. |

---

## Contact

Ping Asad on Slack/WhatsApp for backend questions.
