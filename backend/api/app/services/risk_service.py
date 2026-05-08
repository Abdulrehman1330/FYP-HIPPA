import os
from datetime import datetime

import httpx


ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8000")


def extract_features(fields: list[dict]) -> dict:
    field_map = {f["field_name"]: f for f in fields}

    def get_val(name, default=0):
        f = field_map.get(name)
        if f and f.get("field_value"):
            try:
                return float(f["field_value"])
            except (ValueError, TypeError):
                return default
        return default

    def calc_age(dob_str):
        if not dob_str:
            return 75
        try:
            for fmt in ("%m/%d/%Y", "%m-%d-%Y", "%d/%m/%Y", "%Y-%m-%d"):
                try:
                    birth = datetime.strptime(dob_str, fmt)
                    return (datetime.now() - birth).days // 365
                except ValueError:
                    continue
        except Exception:
            pass
        return 75

    dob = field_map.get("date_of_birth", {}).get("field_value")
    gender = field_map.get("gender", {}).get("field_value", "")

    icd_codes = []
    primary = field_map.get("primary_icd10", {}).get("field_value")
    if primary:
        icd_codes.append(primary)

    low_conf = sum(1 for f in fields if f.get("confidence", 0) < 0.7 and f.get("confidence", 0) > 0)

    return {
        "age": calc_age(dob),
        "is_female": 1 if gender and gender.lower().startswith("f") else 0,
        "mobility_score": get_val("mobility_score", 50),
        "adl_score": get_val("adl_score", 50),
        "has_wound": 0,
        "diagnosis_count": len(icd_codes),
        "medication_count": get_val("medication_count", 0),
        "has_high_risk_meds": 0,
        "prior_hospitalization": 0,
        "days_since_discharge": 7,
        "has_diabetes": 1 if any(c.startswith("E11") for c in icd_codes) else 0,
        "has_chf": 1 if any(c.startswith("I50") for c in icd_codes) else 0,
        "has_copd": 1 if any(c.startswith("J44") for c in icd_codes) else 0,
        "low_confidence_fields": low_conf,
    }


def predict_risk(features: dict) -> dict:
    try:
        resp = httpx.post(f"{ML_SERVICE_URL}/predict", json={"features": features}, timeout=5.0)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass

    # Fallback: simple rule-based scoring when ML service is unavailable
    score = 0.15
    if features.get("age", 0) > 80:
        score += 0.15
    if features.get("has_chf"):
        score += 0.15
    if features.get("has_diabetes"):
        score += 0.10
    if features.get("medication_count", 0) > 10:
        score += 0.10
    if features.get("mobility_score", 100) < 30:
        score += 0.10

    score = min(score, 0.95)
    risk_class = "high" if score >= 0.35 else "medium" if score >= 0.20 else "low"

    return {
        "risk_score": round(score, 3),
        "risk_class": risk_class,
        "explanation": {
            "top_factors": [
                {"feature": k, "value": v, "contribution": 0.0}
                for k, v in sorted(features.items(), key=lambda x: -abs(x[1] if isinstance(x[1], (int, float)) else 0))[:5]
            ],
            "model_version": "fallback_rules",
        },
    }
