from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import Document
from app.schemas.document import DocumentMetadataResponse, UploadStoredResponse
from app.services.document_service import get_document_by_id, list_documents
from app.services.upload_service import store_uploaded_document

router = APIRouter(prefix="/documents", tags=["documents"])


def to_document_metadata_response(document: Document) -> DocumentMetadataResponse:
    return DocumentMetadataResponse(
        document_id=document.id,
        filename=document.original_filename,
        stored_filename=document.stored_filename,
        content_type=document.content_type,
        size_bytes=document.size_bytes,
        storage_path=document.storage_path,
        created_at=document.created_at,
    )


@router.post(
    "/upload",
    response_model=UploadStoredResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> UploadStoredResponse:
    document = await store_uploaded_document(file=file, db=db)
    return UploadStoredResponse(
        document_id=document.id,
        filename=document.original_filename,
        stored_filename=document.stored_filename,
        content_type=document.content_type,
        size_bytes=document.size_bytes,
        message="File stored and metadata saved successfully.",
    )


@router.get("", response_model=list[DocumentMetadataResponse])
def get_documents(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[DocumentMetadataResponse]:
    documents = list_documents(db=db, limit=limit, offset=offset)
    return [to_document_metadata_response(document) for document in documents]


@router.get("/{document_id}", response_model=DocumentMetadataResponse)
def get_document(document_id: int, db: Session = Depends(get_db)) -> DocumentMetadataResponse:
    document = get_document_by_id(db=db, document_id=document_id)
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return to_document_metadata_response(document)
