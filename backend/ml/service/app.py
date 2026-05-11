from datetime import datetime
from typing import Dict

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Risk Prediction Service")

try:
    artifact = joblib.load("model/readmission_model.pkl")
    if isinstance(artifact, dict):
        model = artifact["model"]
        model_version = artifact.get("model_version", "logistic-regression-v0.1")
        model_type = artifact.get("model_type", "logistic_regression")
        artifact_features = artifact.get("features")
    else:
        model = artifact
        model_version = "legacy"
        model_type = "unknown"
        artifact_features = None
except Exception:
    model = None
    model_version = None
    model_type = None
    artifact_features = None

DEFAULT_FEATURES = [
    "age", "is_female", "mobility_score", "adl_score",
    "has_wound", "diagnosis_count", "medication_count",
    "has_high_risk_meds", "prior_hospitalization",
    "days_since_discharge", "has_diabetes", "has_chf",
    "has_copd", "low_confidence_fields",
]
FEATURES = artifact_features or DEFAULT_FEATURES


class PredictionInput(BaseModel):
    features: Dict[str, float]


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_type": model_type,
        "timestamp": datetime.utcnow().isoformat(),
    }


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

    top_factors = explain_linear_model(df, data.features)

    return {
        "risk_score": round(prob, 4),
        "risk_class": risk_class,
        "explanation": {"top_factors": top_factors[:5], "model_version": model_version},
    }


def explain_linear_model(df, raw_features):
    """Return coefficient contributions for the current Logistic Regression baseline."""
    try:
        classifier = model.named_steps["classifier"]
        scaler = model.named_steps["scaler"]
        scaled = scaler.transform(df)[0]
        coefficients = classifier.coef_[0]
    except Exception:
        return [
            {"feature": feature, "value": float(raw_features.get(feature, 0))}
            for feature in FEATURES[:5]
        ]

    top_factors = []
    for index, feature in enumerate(FEATURES):
        contribution = float(coefficients[index] * scaled[index])
        if abs(contribution) > 0.01:
            top_factors.append({
                "feature": feature,
                "value": float(raw_features.get(feature, 0)),
                "contribution": round(contribution, 4),
                "direction": "increases" if contribution > 0 else "decreases",
            })

    top_factors.sort(key=lambda item: abs(item["contribution"]), reverse=True)
    return top_factors


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
