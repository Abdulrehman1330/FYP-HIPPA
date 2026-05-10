# Backend (Asad's part)

Node.js + Express + Prisma + PostgreSQL backend for the HIPAA-compliant
home-health document processing platform. Owns auth, document upload,
OCR integration, review workflow, Plan-of-Care draft generation, and
risk-prediction passthrough.

> **Teammate handoff** → start with [docs/HANDOFF.md](./docs/HANDOFF.md).
> Frontend devs → [docs/API.md](./docs/API.md) and [docs/postman_collection.json](./docs/postman_collection.json).
> ML / Abdul → [docs/RISK_SERVICE_CONTRACT.md](./docs/RISK_SERVICE_CONTRACT.md).

## Stack

- Node.js 20 + Express 4
- Prisma 5 + PostgreSQL 15
- JWT auth, multer uploads, winston logging
- Companion Python OCR microservice ([ocr-service/](./ocr-service)) using FastAPI + Tesseract + PyMuPDF

## Run

```powershell
copy .env.example .env       # then fill in values
npm install
npx prisma migrate deploy
npx prisma generate

# In another terminal
cd ocr-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py                # OCR on :5000

# Back in backend/
npm run dev                  # Express on :3000
```

## Module map

```
src/
├── app.js, server.js           # bootstrap
├── config/                     # env, prisma client, logger
├── middleware/                 # auth (JWT + role), errors, multer
├── routes/                     # one file per resource
│   ├── auth.routes.js
│   ├── documents.routes.js
│   ├── extraction.routes.js   ← calls OCR microservice
│   ├── review.routes.js       ← clinician review workflow
│   ├── poc.routes.js          ← Plan-of-Care drafts (versioned, with citations)
│   ├── risk.routes.js         ← passthrough to ML service
│   └── health.routes.js
├── services/                   # business logic, called by routes
│   ├── auth.service.js
│   ├── document.service.js
│   ├── review.service.js      ← validation rules + state machine
│   ├── poc.service.js         ← LLM orchestration + retry
│   ├── risk.service.js        ← features + ML proxy + heuristic fallback
│   └── audit.service.js
└── utils/

prisma/
├── schema.prisma               # source of truth for DB
└── migrations/                 # 3 migrations: init, phase3_review_tracking, phase4_poc_versioning

ocr-service/                    # Python FastAPI microservice
├── app.py                      # Tesseract + PyMuPDF text-layer fast path
├── pdf_processor.py
├── ocr_engine.py
├── field_extractor.py          # OASIS-E2 + POC regex
├── preprocessor.py             # OpenCV pipeline
├── config.py, schemas.py
└── README.md

docs/                           # handoff package
├── API.md
├── HANDOFF.md
├── RISK_SERVICE_CONTRACT.md
└── postman_collection.json
```

## Phases delivered (per [TEAM_DETAILED_STEPS.md](../TEAM_DETAILED_STEPS.md))

| Asad phase | Status |
|---|---|
| 2 — Upload & Storage | ✅ |
| 3 — OCR & Structured Extraction | ✅ Tesseract microservice + Express integration, OASIS M-code aware regex |
| 4 — Review & Validation | ✅ Per-field rules, claim/release, edit history with before/after, reviewer-time metrics |
| 5 — Plan of Care Draft | ✅ Versioned drafts, LLM-with-citations, retry/regeneration, role-gated |
| 6 — Risk Prediction | Owned by Abdul; backend proxy in place with heuristic fallback |

## Environment

See [.env.example](./.env.example). Required: `DATABASE_URL`, `JWT_SECRET`,
`OCR_SERVICE_URL`. Optional: `OPENAI_API_KEY` (POC LLM), `ML_SERVICE_URL` (risk).
