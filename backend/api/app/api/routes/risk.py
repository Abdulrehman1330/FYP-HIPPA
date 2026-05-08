from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.auth import get_current_user
from app.models.document import Document, DocumentStatus
from app.models.extracted_field import ExtractedField
from app.models.risk_score import RiskScore
from app.models.user import User
from app.schemas.risk import RiskPredictionResponse
from app.services.audit_service import log_action
from app.services.risk_service import extract_features, predict_risk

router = APIRouter(prefix="/risk", tags=["risk"])


@router.post("/predict/{document_id}", response_model=RiskPredictionResponse)
def run_prediction(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    fields = db.query(ExtractedField).filter(ExtractedField.document_id == document_id).all()
    fields_data = [{"field_name": f.field_name, "field_value": f.field_value, "confidence": f.confidence} for f in fields]

    features = extract_features(fields_data)
    prediction = predict_risk(features)

    existing = db.query(RiskScore).filter(RiskScore.document_id == document_id).first()
    if existing:
        existing.risk_score = prediction["risk_score"]
        existing.risk_class = prediction["risk_class"]
        existing.explanation = prediction["explanation"]
    else:
        db.add(RiskScore(
            document_id=document_id,
            risk_score=prediction["risk_score"],
            risk_class=prediction["risk_class"],
            explanation=prediction["explanation"],
        ))

    doc.status = DocumentStatus.RISK_SCORED
    db.commit()

    log_action(db, "risk.predict", user_id=user.id, document_id=document_id,
               details={"risk_score": prediction["risk_score"], "risk_class": prediction["risk_class"]})

    return RiskPredictionResponse(document_id=document_id, **prediction)


@router.get("/{document_id}", response_model=RiskPredictionResponse)
def get_risk_score(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    score = db.query(RiskScore).filter(RiskScore.document_id == document_id).first()
    if not score:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Risk score not found")

    return RiskPredictionResponse(
        document_id=document_id,
        risk_score=score.risk_score,
        risk_class=score.risk_class,
        explanation=score.explanation,
    )
