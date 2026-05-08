from pydantic import BaseModel


class RiskPredictionResponse(BaseModel):
    document_id: int
    risk_score: float
    risk_class: str
    explanation: dict
