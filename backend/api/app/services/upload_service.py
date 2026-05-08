import os
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentStatus, DocumentType
from app.services.audit_service import log_action

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_CONTENT_TYPES = {"application/pdf", "image/png", "image/jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024
DEFAULT_STORAGE_DIR = "storage/documents"


def get_storage_dir() -> Path:
    path = Path(os.getenv("DOCUMENT_STORAGE_DIR", DEFAULT_STORAGE_DIR))
    path.mkdir(parents=True, exist_ok=True)
    return path


def validate_file(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Filename is required")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only PDF, PNG, JPG files are supported")

    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unsupported content type")


def infer_document_type(filename: str) -> DocumentType:
    name = filename.lower()
    if "oasis" in name:
        return DocumentType.OASIS_E2
    if "care" in name or "poc" in name:
        return DocumentType.POC
    return DocumentType.OTHER


async def store_document(file: UploadFile, user_id: int, db: Session) -> Document:
    validate_file(file)

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File is empty")
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "File exceeds 10 MB limit")

    ext = Path(file.filename).suffix.lower()
    stored_name = f"{uuid4().hex}{ext}"
    stored_path = get_storage_dir() / stored_name

    try:
        stored_path.write_bytes(contents)
    except OSError as e:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Storage error: {e}")

    document = Document(
        user_id=user_id,
        original_filename=file.filename,
        stored_filename=stored_name,
        content_type=file.content_type or "application/octet-stream",
        file_type=infer_document_type(file.filename),
        status=DocumentStatus.UPLOADED,
        size_bytes=len(contents),
        storage_path=str(stored_path),
    )

    try:
        db.add(document)
        db.commit()
        db.refresh(document)
    except Exception:
        db.rollback()
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Database error")

    log_action(db, "document.upload", user_id=user_id, document_id=document.id,
               details={"filename": file.filename, "size": len(contents)})

    return document
