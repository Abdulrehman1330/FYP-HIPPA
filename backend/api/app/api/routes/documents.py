from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.auth import get_current_user
from app.models.document import Document
from app.models.document_extraction import DocumentExtraction
from app.models.user import User
from app.schemas.document import (
    DocumentListResponse,
    DocumentResponse,
    ExtractionResponse,
    UploadResponse,
)
from app.services.audit_service import log_action
from app.services.document_service import count_documents, get_document, list_documents
from app.services.extraction_service import get_document_extraction, run_document_extraction
from app.services.upload_service import store_document

router = APIRouter(prefix="/documents", tags=["documents"])


def _doc_response(doc: Document) -> DocumentResponse:
    return DocumentResponse(
        id=doc.id,
        filename=doc.original_filename,
        stored_filename=doc.stored_filename,
        content_type=doc.content_type,
        file_type=doc.file_type.value,
        status=doc.status.value,
        size_bytes=doc.size_bytes,
        created_at=doc.created_at,
    )


def _extraction_response(ext: DocumentExtraction) -> ExtractionResponse:
    return ExtractionResponse(
        extraction_id=ext.id,
        document_id=ext.document_id,
        status=ext.status,
        provider=ext.provider,
        extracted_text=ext.extracted_text,
        extracted_fields=ext.extracted_fields,
        created_at=ext.created_at,
        updated_at=ext.updated_at,
    )


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = await store_document(file=file, user_id=user.id, db=db)
    return UploadResponse(
        document_id=doc.id,
        filename=doc.original_filename,
        status=doc.status.value,
        file_type=doc.file_type.value,
        size_bytes=doc.size_bytes,
        message="Document uploaded successfully",
    )


@router.get("", response_model=DocumentListResponse)
def get_documents(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    docs = list_documents(db, user.id, limit, offset)
    total = count_documents(db, user.id)
    return DocumentListResponse(
        documents=[_doc_response(d) for d in docs],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_single_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = get_document(db, document_id, user.id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return _doc_response(doc)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = get_document(db, document_id, user.id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    Path(doc.storage_path).unlink(missing_ok=True)
    log_action(db, "document.delete", user_id=user.id, document_id=doc.id)
    db.delete(doc)
    db.commit()


@router.post("/{document_id}/extract", response_model=ExtractionResponse)
def extract_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = get_document(db, document_id, user.id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    extraction = run_document_extraction(db, document_id)
    log_action(db, "document.extract", user_id=user.id, document_id=document_id)
    return _extraction_response(extraction)


@router.get("/{document_id}/extraction", response_model=ExtractionResponse)
def get_extraction(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = get_document(db, document_id, user.id)
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    extraction = get_document_extraction(db, document_id)
    return _extraction_response(extraction)
