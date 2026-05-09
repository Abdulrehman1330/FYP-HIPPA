import os
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.document import Document

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_CONTENT_TYPES = {"application/pdf", "image/png", "image/jpeg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
DEFAULT_STORAGE_DIR = "storage/documents"


async def parse_and_validate_upload(file: UploadFile) -> tuple[dict[str, str | int], bytes]:
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required.",
        )

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file extension. Use PDF, PNG, JPG, or JPEG.",
        )

    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported content type.",
        )

    contents = await file.read()
    size_bytes = len(contents)

    if size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if size_bytes > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds 10 MB limit.",
        )

    await file.seek(0)

    metadata = {
        "filename": filename,
        "content_type": file.content_type or "application/octet-stream",
        "size_bytes": size_bytes,
        "extension": extension,
    }
    return metadata, contents


def get_storage_dir() -> Path:
    configured_path = os.getenv("DOCUMENT_STORAGE_DIR", DEFAULT_STORAGE_DIR)
    return Path(configured_path)


async def store_uploaded_document(file: UploadFile, db: Session) -> Document:
    metadata, contents = await parse_and_validate_upload(file)

    storage_dir = get_storage_dir()
    storage_dir.mkdir(parents=True, exist_ok=True)

    stored_filename = f"{uuid4().hex}{metadata['extension']}"
    stored_path = storage_dir / stored_filename

    try:
        stored_path.write_bytes(contents)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store file locally: {exc}",
        ) from exc

    document = Document(
        original_filename=str(metadata["filename"]),
        stored_filename=stored_filename,
        content_type=str(metadata["content_type"]),
        size_bytes=int(metadata["size_bytes"]),
        storage_path=str(stored_path),
    )

    try:
        db.add(document)
        db.commit()
        db.refresh(document)
        return document
    except SQLAlchemyError as exc:
        db.rollback()
        stored_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to save metadata in database.",
        ) from exc
