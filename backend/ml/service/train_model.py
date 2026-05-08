import os

import numpy as np
import pandas as pd
import xgboost as xgb
import joblib
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss, roc_auc_score
from sklearn.model_selection import train_test_split


def create_synthetic_data(n=2000):
    np.random.seed(42)
    d = {
        "age": np.random.normal(75, 15, n).clip(18, 100),
        "is_female": np.random.binomial(1, 0.6, n),
        "mobility_score": np.random.normal(50, 20, n).clip(0, 100),
        "adl_score": np.random.normal(60, 25, n).clip(0, 100),
        "has_wound": np.random.binomial(1, 0.3, n),
        "diagnosis_count": np.random.poisson(3, n),
        "medication_count": np.random.poisson(8, n),
        "has_high_risk_meds": np.random.binomial(1, 0.4, n),
        "prior_hospitalization": np.random.binomial(1, 0.5, n),
        "days_since_discharge": np.random.exponential(14, n).clip(0, 90),
        "has_diabetes": np.random.binomial(1, 0.3, n),
        "has_chf": np.random.binomial(1, 0.25, n),
        "has_copd": np.random.binomial(1, 0.2, n),
        "low_confidence_fields": np.random.poisson(2, n),
    }
    df = pd.DataFrame(d)

    risk = (
        0.02 * df["age"] + 0.3 * df["prior_hospitalization"] +
        0.4 * df["has_chf"] + 0.3 * df["has_diabetes"] +
        -0.01 * df["mobility_score"] - 0.01 * df["adl_score"] +
        0.02 * df["medication_count"] + 0.3 * df["has_high_risk_meds"] +
        0.2 * df["has_wound"]
    )
    prob = 1 / (1 + np.exp(-risk + 5))
    df["readmitted"] = np.random.binomial(1, prob)
    return df


def train():
    print("Generating synthetic data...")
    df = create_synthetic_data()
    X, y = df.drop("readmitted", axis=1), df["readmitted"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"Train: {len(X_train)}, Test: {len(X_test)}, Readmission rate: {y.mean():.2%}")

    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, eval_metric="auc")
    model.fit(X_train, y_train)

    y_prob = model.predict_proba(X_test)[:, 1]
    print(f"AUROC: {roc_auc_score(y_test, y_prob):.3f}")
    print(f"Brier: {brier_score_loss(y_test, y_prob):.3f}")

    calibrated = CalibratedClassifierCV(model, method="isotonic", cv="prefit")
    calibrated.fit(X_train, y_train)

    os.makedirs("model", exist_ok=True)
    joblib.dump(calibrated, "model/readmission_model.pkl")
    print("Model saved to model/readmission_model.pkl")


if __name__ == "__main__":
    train()
