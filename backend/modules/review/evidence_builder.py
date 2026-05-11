"""Convert clinician-approved review output into RAG evidence snippets."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from backend.modules.poc.rag_assistant import EvidenceSnippet


FIELD_SECTION_MAP = {
    "primary_diagnosis": "diagnosis",
    "secondary_diagnosis": "diagnosis",
    "recent_hospitalization": "hospitalization",
    "ambulation_locomotion": "mobility",
    "transfer_ability": "mobility",
    "fall_risk": "safety",
    "home_safety": "safety",
    "medication_management": "medications",
    "medication_reconciliation": "medications",
    "skilled_nursing_interventions": "interventions",
    "patient_goal": "goals",
    "vitals": "vitals",
    "allergies": "allergies",
}


@dataclass(frozen=True)
class ReviewedField:
    field_id: str
    field_name: str
    label: str
    value: str
    approved: bool
    corrected: bool = False
    page_number: int | None = None
    confidence: float | None = None

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "ReviewedField":
        return cls(
            field_id=str(raw["field_id"]),
            field_name=str(raw["field_name"]),
            label=str(raw.get("label", raw["field_name"])),
            value=str(raw.get("value", "")).strip(),
            approved=bool(raw.get("approved", False)),
            corrected=bool(raw.get("corrected", False)),
            page_number=raw.get("page_number"),
            confidence=raw.get("confidence"),
        )


@dataclass(frozen=True)
class ReviewedDocument:
    review_id: str
    document_id: str
    patient_id: str
    form_type: str
    approved_by: str
    approved_at: str
    fields: list[ReviewedField]

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "ReviewedDocument":
        return cls(
            review_id=str(raw["review_id"]),
            document_id=str(raw["document_id"]),
            patient_id=str(raw["patient_id"]),
            form_type=str(raw["form_type"]),
            approved_by=str(raw["approved_by"]),
            approved_at=str(raw["approved_at"]),
            fields=[ReviewedField.from_dict(item) for item in raw.get("fields", [])],
        )


def build_rag_evidence_from_review(raw_review: dict[str, Any]) -> list[EvidenceSnippet]:
    """Build RAG evidence from approved, non-empty reviewed fields only."""

    review = ReviewedDocument.from_dict(raw_review)
    snippets: list[EvidenceSnippet] = []

    for field in review.fields:
        if not field.approved or not field.value:
            continue

        section = FIELD_SECTION_MAP.get(field.field_name, "reviewed_field")
        source_id = f"REVIEW-{review.review_id}-{field.field_id}"
        text = f"Approved {review.form_type} field '{field.label}': {field.value}"
        snippets.append(
            EvidenceSnippet(
                source_id=source_id,
                patient_id=review.patient_id,
                section=section,
                text=text,
                approved=True,
                source_type="approved_review_field",
                metadata={
                    "review_id": review.review_id,
                    "document_id": review.document_id,
                    "form_type": review.form_type,
                    "field_id": field.field_id,
                    "field_name": field.field_name,
                    "approved_by": review.approved_by,
                    "approved_at": review.approved_at,
                    "corrected": field.corrected,
                    "page_number": field.page_number,
                    "extraction_confidence": field.confidence,
                },
            )
        )

    return snippets
