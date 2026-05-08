from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.auth import get_current_user
from app.models.document import Document, DocumentStatus
from app.models.extracted_field import ExtractedField
from app.models.generated_poc import GeneratedPoc
from app.models.user import User
from app.schemas.poc import POCApproveRequest
from app.services.audit_service import log_action
from app.services.rag_service import generate_full_poc

router = APIRouter(prefix="/poc", tags=["poc"])


@router.post("/generate/{document_id}")
def generate_poc(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    if doc.status != DocumentStatus.APPROVED:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Document must be approved first")

    fields = db.query(ExtractedField).filter(ExtractedField.document_id == document_id).all()
    fields_data = [{"field_name": f.field_name, "field_value": f.field_value, "confidence": f.confidence} for f in fields]

    result = generate_full_poc(fields_data)

    # Save or update
    existing = db.query(GeneratedPoc).filter(GeneratedPoc.document_id == document_id).first()
    if existing:
        existing.sections = result["sections"]
        existing.status = "draft"
    else:
        db.add(GeneratedPoc(document_id=document_id, sections=result["sections"], status="draft"))

    doc.status = DocumentStatus.POC_GENERATED
    db.commit()

    log_action(db, "poc.generate", user_id=user.id, document_id=document_id)

    return {
        "document_id": document_id,
        "status": "draft",
        "sections": result["sections"],
        "total_sections": result["total_sections"],
        "insufficient_count": result["insufficient_count"],
    }


@router.get("/{document_id}")
def get_poc(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    poc = db.query(GeneratedPoc).filter(GeneratedPoc.document_id == document_id).first()
    if not poc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "POC not found")

    return {
        "document_id": document_id,
        "status": poc.status,
        "sections": poc.sections,
        "generated_at": poc.generated_at.isoformat(),
        "approved_at": poc.approved_at.isoformat() if poc.approved_at else None,
    }


@router.post("/{document_id}/approve")
def approve_poc(
    document_id: int,
    body: POCApproveRequest = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    poc = db.query(GeneratedPoc).filter(GeneratedPoc.document_id == document_id).first()
    if not poc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "POC not found")

    if body and body.edits:
        sections = dict(poc.sections)
        for section_name, new_content in body.edits.items():
            if section_name in sections:
                sections[section_name]["content"] = new_content
                sections[section_name]["edited_by_clinician"] = True
        poc.sections = sections

    poc.status = "approved"
    poc.approved_at = datetime.now(timezone.utc)
    db.commit()

    log_action(db, "poc.approve", user_id=user.id, document_id=document_id)
    return {"status": "approved", "document_id": document_id}
