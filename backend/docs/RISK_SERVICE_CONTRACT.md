# Risk Prediction Service — Contract for Abdul Rehman

**Owner:** Abdul Rehman (AI / ML / Cloud)
**Consumer:** Express backend (Asad)
**Frontend:** Calls backend, never the ML service directly.

The backend already has a passthrough at `POST /api/v1/risk/predict/:documentId`
that calls your service. As long as your service matches this contract, the
frontend integration just works.

---

## Endpoint

```
POST  {ML_SERVICE_URL}/predict
Content-Type: application/json
```

The backend sets `ML_SERVICE_URL` in `.env`. When unset, the backend uses a
heuristic fallback predictor — useful while you're still training the model.

### Request

```json
{
  "document_id": "<uuid>",
  "features": {
    "age": 75,
    "is_female": 0,
    "mobility_score": 50,
    "adl_score": 50,
    "has_wound": 0,
    "diagnosis_count": 1,
    "medication_count": 5,
    "has_high_risk_meds": 0,
    "prior_hospitalization": 0,
    "days_since_discharge": 7,
    "has_diabetes": 0,
    "has_chf": 1,
    "has_copd": 0,
    "low_confidence_fields": 0
  }
}
```

The backend computes these features from the approved `ExtractedField`
values in [risk.service.js → extractFeatures()](../src/services/risk.service.js).
You can ignore unknown features or request schema changes — coordinate with Asad.

### Response (200)

```json
{
  "risk_score": 0.42,
  "risk_class": "medium",
  "explanation": {
    "top_factors": [
      { "feature": "has_chf", "value": 1, "shap": 0.12 },
      { "feature": "age", "value": 75, "shap": 0.08 }
    ],
    "model_version": "xgboost-v0.3"
  }
}
```

| Field | Type | Notes |
|---|---|---|
| `risk_score` | float `[0, 1]` | 30-day readmission probability |
| `risk_class` | `"low" \| "medium" \| "high"` | Suggested thresholds: ≥0.35 high, ≥0.20 medium |
| `explanation.top_factors` | array | SHAP-style top contributors (≤ 5) |
| `explanation.model_version` | string | Bumps when you retrain |

### Errors

Return standard HTTP status codes. The backend forwards 4xx/5xx as 502 to the client.

```json
{ "error": "Feature 'mobility_score' is required" }
```

### Health check

```
GET {ML_SERVICE_URL}/health  ->  { "status": "healthy" }
```

The backend will use this for service-discovery checks.

---

## What the backend stores

After your service responds, the backend persists:

```
RiskScore {
  documentId, riskScore, riskClass, explanation (JSON), modelVersion, createdAt
}
```

Document status moves `APPROVED` → `RISK_SCORED`.

---

## Suggested implementation stack (per proposal §7.1)

- **Language**: Python 3.11
- **Framework**: FastAPI (matches our OCR microservice convention)
- **Model**: XGBoost or LightGBM
- **Explainability**: SHAP
- **Deployment**: Azure Container Apps or local Docker for development

Minimal skeleton:

```python
from fastapi import FastAPI
from pydantic import BaseModel
import xgboost as xgb
import shap

app = FastAPI()

class PredictRequest(BaseModel):
    document_id: str
    features: dict

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/predict")
def predict(req: PredictRequest):
    # 1. Vectorize features in deterministic order
    # 2. model.predict_proba()
    # 3. shap.TreeExplainer for top_factors
    return {
        "risk_score": float(score),
        "risk_class": "high" if score >= 0.35 else "medium" if score >= 0.20 else "low",
        "explanation": {
            "top_factors": top_factors,
            "model_version": "xgboost-v0.3"
        }
    }
```

---

## How to test against the backend

1. Start your service on any port, e.g. `uvicorn main:app --port 8000`.
2. Set `ML_SERVICE_URL=http://localhost:8000` in `backend/.env`.
3. Restart Express: `npm run dev`.
4. Hit the proxy:
   ```
   POST http://localhost:3000/api/v1/risk/predict/<documentId>
   ```
5. The backend will call your `/predict`, persist the result, and respond.
6. Audit log entry `risk.predict` is written automatically.

---

## Coordination

Ping Asad if you want to:
- Add/remove feature fields → backend `extractFeatures()` needs to match
- Change `risk_class` thresholds → both ends should align
- Receive raw extracted text instead of features → easy switch in
  [risk.service.js](../src/services/risk.service.js)
