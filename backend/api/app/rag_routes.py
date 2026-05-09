"""Optional FastAPI routes for Abdul's clinician RAG assistant.

The module imports cleanly even before FastAPI is installed. Once Asad adds the
backend dependency set, include `router` in the main FastAPI app.
"""

from __future__ import annotations

from typing import Any

from backend.api.app.audit import read_recent_rag_audit_events
from backend.api.app.rag_service import answer_clinician_question, generate_cited_poc_section
from backend.api.app.security import (
    UserContext,
    get_current_user,
    require_audit_review_access,
    require_patient_access,
)


try:
    from fastapi import APIRouter, Depends, Query
    from pydantic import BaseModel, Field
except ModuleNotFoundError:  # pragma: no cover - dependency not present in skeleton repo
    APIRouter = None  # type: ignore[assignment]
    BaseModel = object  # type: ignore[assignment,misc]


if APIRouter is not None:

    class ClinicianQuestionRequest(BaseModel):
        patient_id: str = Field(..., min_length=1)
        question: str = Field(..., min_length=3)


    class PocSectionRequest(BaseModel):
        patient_id: str = Field(..., min_length=1)
        section: str = Field(..., min_length=2)


    router = APIRouter(prefix="/rag", tags=["Clinician RAG Assistant"])

    @router.post("/question")
    def ask_clinician_question(
        payload: ClinicianQuestionRequest,
        user: UserContext = Depends(get_current_user),
    ) -> dict[str, Any]:
        """Answer a clinician question with approved evidence citations."""

        require_patient_access(user, payload.patient_id)
        return answer_clinician_question(payload.patient_id, payload.question, user_id=user.user_id)


    @router.post("/poc-section")
    def create_poc_section(
        payload: PocSectionRequest,
        user: UserContext = Depends(get_current_user),
    ) -> dict[str, Any]:
        """Generate a cited draft Plan of Care section."""

        require_patient_access(user, payload.patient_id)
        return generate_cited_poc_section(payload.patient_id, payload.section, user_id=user.user_id)


    @router.get("/audit/recent")
    def list_recent_audit_events(
        limit: int = Query(default=20, ge=1, le=100),
        user: UserContext = Depends(get_current_user),
    ) -> dict[str, Any]:
        """Return recent local RAG audit events for reviewer/admin demo."""

        require_audit_review_access(user)
        return {"events": read_recent_rag_audit_events(limit=limit)}

else:
    router = None
