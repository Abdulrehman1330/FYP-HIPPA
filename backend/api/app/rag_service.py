"""Backend service adapter for the clinician RAG assistant.

This module is intentionally framework-neutral. Asad can call these functions
from a FastAPI route later without changing Abdul's retrieval implementation.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

from backend.api.app.audit import record_rag_audit_event
from backend.modules.poc.evidence_repository import JsonEvidenceRepository
from backend.modules.poc.rag_assistant import ClinicianRagAssistant


REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_EVIDENCE_PATH = REPO_ROOT / "data" / "synthetic" / "rag_evidence_demo.json"


@lru_cache(maxsize=1)
def load_default_assistant() -> ClinicianRagAssistant:
    repository = JsonEvidenceRepository(DEFAULT_EVIDENCE_PATH)
    return ClinicianRagAssistant(repository.list_approved_evidence())


def answer_clinician_question(
    patient_id: str,
    question: str,
    *,
    user_id: str = "system",
    audit: bool = True,
) -> dict[str, Any]:
    """Return a cited RAG answer for a clinician question."""

    response = load_default_assistant().ask(patient_id, question).to_dict()
    if audit:
        response["audit_event_id"] = record_rag_audit_event(
            user_id=user_id,
            patient_id=patient_id,
            action="rag_question",
            question=question,
            response=response,
        )
    return response


def generate_cited_poc_section(
    patient_id: str,
    section: str,
    *,
    user_id: str = "system",
    audit: bool = True,
) -> dict[str, Any]:
    """Return a cited draft Plan of Care section."""

    response = load_default_assistant().generate_poc_section(patient_id, section).to_dict()
    if audit:
        response["audit_event_id"] = record_rag_audit_event(
            user_id=user_id,
            patient_id=patient_id,
            action="rag_poc_section",
            question=f"Generate Plan of Care {section} section",
            response=response,
        )
    return response
