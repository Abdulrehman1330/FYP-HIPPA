from datetime import datetime
from typing import Dict

import joblib
import numpy as np
import pandas as pd
import shap
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Risk Prediction Service")

try:
    model = joblib.load("model/readmission_model.pkl")
    explainer = shap.TreeExplainer(model)
except Exception:
    model = None
    explainer = None

FEATURES = [
    "age", "is_female", "mobility_score", "adl_score",
    "has_wound", "diagnosis_count", "medication_count",
    "has_high_risk_meds", "prior_hospitalization",
    "days_since_discharge", "has_diabetes", "has_chf",
    "has_copd", "low_confidence_fields",
]


class PredictionInput(BaseModel):
    features: Dict[str, float]


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None, "timestamp": datetime.utcnow().isoformat()}


@app.post("/predict")
def predict(data: PredictionInput):
    if model is None:
        raise HTTPException(503, "Model not loaded")

    df = pd.DataFrame([data.features])
    for f in FEATURES:
        if f not in df.columns:
            df[f] = 0
    df = df[FEATURES]

    prob = float(model.predict_proba(df)[0][1])
    risk_class = "high" if prob >= 0.35 else "medium" if prob >= 0.20 else "low"

    # SHAP explanation
    sv = explainer.shap_values(df)
    top_factors = []
    for i, feat in enumerate(FEATURES):
        c = float(sv[0][i])
        if abs(c) > 0.01:
            top_factors.append({
                "feature": feat,
                "value": float(data.features.get(feat, 0)),
                "contribution": c,
                "direction": "increases" if c > 0 else "decreases",
            })
    top_factors.sort(key=lambda x: abs(x["contribution"]), reverse=True)

    return {
        "risk_score": round(prob, 4),
        "risk_class": risk_class,
        "explanation": {"top_factors": top_factors[:5], "model_version": "1.0"},
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
