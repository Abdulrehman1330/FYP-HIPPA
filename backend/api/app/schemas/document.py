from datetime import datetime

from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    document_id: int
    filename: str
    status: str
    file_type: str
    size_bytes: int
    message: str


class DocumentResponse(BaseModel):
    id: int
    filename: str
    stored_filename: str
    content_type: str
    file_type: str
    status: str
    size_bytes: int
    created_at: datetime


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
    page: int
    limit: int


class ExtractionResponse(BaseModel):
    extraction_id: int
    document_id: int
    status: str
    provider: str
    extracted_text: str
    extracted_fields: dict[str, str]
    created_at: datetime
    updated_at: datetime
