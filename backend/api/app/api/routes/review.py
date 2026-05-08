from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.auth import get_current_user
from app.models.document import Document, DocumentStatus
from app.models.extracted_field import ExtractedField
from app.models.review_action import ReviewAction, ReviewActionType
from app.models.user import User
from app.schemas.review import (
    EditRequest,
    FieldDetail,
    RejectRequest,
    ReviewDetailResponse,
    ReviewQueueItem,
)
from app.services.audit_service import log_action
from app.services.validation_service import validate_document_fields, validate_field

router = APIRouter(prefix="/review", tags=["review"])


@router.get("/queue", response_model=list[ReviewQueueItem])
def get_review_queue(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = (
        db.query(Document)
        .filter(Document.status == DocumentStatus.EXTRACTED)
        .order_by(Document.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    queue = []
    for doc in docs:
        fields = db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).all()
        fields_data = [{"field_name": f.field_name, "field_value": f.field_value, "confidence": f.confidence} for f in fields]
        validation = validate_document_fields(fields_data)

        owner = db.query(User).filter(User.id == doc.user_id).first()
        queue.append(ReviewQueueItem(
            document_id=doc.id,
            filename=doc.original_filename,
            uploaded_by=f"{owner.first_name} {owner.last_name}" if owner else "Unknown",
            uploaded_at=doc.created_at.isoformat(),
            field_count=len(fields),
            is_valid=validation["is_valid"],
            error_count=len(validation["errors"]),
            warning_count=len(validation["warnings"]),
        ))

    return queue


@router.get("/{document_id}", response_model=ReviewDetailResponse)
def get_review_detail(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    fields = db.query(ExtractedField).filter(ExtractedField.document_id == document_id).all()
    fields_data = [{"field_name": f.field_name, "field_value": f.field_value, "confidence": f.confidence} for f in fields]
    validation = validate_document_fields(fields_data)

    field_details = []
    for f in fields:
        fv = validate_field(f.field_name, f.field_value, f.confidence)
        field_details.append(FieldDetail(
            id=f.id,
            field_name=f.field_name,
            field_value=f.field_value,
            confidence=f.confidence,
            source_snippet=f.source_snippet,
            is_valid=fv["is_valid"],
            errors=fv["errors"],
            warnings=fv["warnings"],
        ))

    history = db.query(ReviewAction).filter(ReviewAction.document_id == document_id).order_by(ReviewAction.timestamp.desc()).all()
    history_data = [{"action": r.action.value, "reviewer_id": r.reviewer_id, "comments": r.comments, "timestamp": r.timestamp.isoformat()} for r in history]

    return ReviewDetailResponse(
        document_id=doc.id,
        filename=doc.original_filename,
        status=doc.status.value,
        fields=field_details,
        validation=validation,
        review_history=history_data,
    )


@router.post("/{document_id}/approve")
def approve_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    doc.status = DocumentStatus.APPROVED
    db.add(ReviewAction(document_id=document_id, reviewer_id=user.id, action=ReviewActionType.APPROVE))
    db.commit()

    log_action(db, "document.approve", user_id=user.id, document_id=document_id)
    return {"status": "approved", "document_id": document_id}


@router.post("/{document_id}/edit")
def edit_and_approve(
    document_id: int,
    body: EditRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    for field_name, new_value in body.edits.items():
        field = db.query(ExtractedField).filter(
            ExtractedField.document_id == document_id,
            ExtractedField.field_name == field_name,
        ).first()
        if field:
            field.field_value = new_value
            field.confidence = 1.0

    doc.status = DocumentStatus.APPROVED
    db.add(ReviewAction(
        document_id=document_id, reviewer_id=user.id,
        action=ReviewActionType.EDIT, field_edits=body.edits,
    ))
    db.commit()

    log_action(db, "document.edit_approve", user_id=user.id, document_id=document_id, details=body.edits)
    return {"status": "approved", "edits": body.edits}


@router.post("/{document_id}/reject")
def reject_document(
    document_id: int,
    body: RejectRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    doc.status = DocumentStatus.REJECTED
    db.add(ReviewAction(
        document_id=document_id, reviewer_id=user.id,
        action=ReviewActionType.REJECT, comments=body.reason,
    ))
    db.commit()

    log_action(db, "document.reject", user_id=user.id, document_id=document_id, details={"reason": body.reason})
    return {"status": "rejected", "reason": body.reason}
