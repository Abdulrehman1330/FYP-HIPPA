from datetime import datetime

from pydantic import BaseModel, Field


class UploadStoredResponse(BaseModel):
    document_id: int = Field(..., gt=0)
    filename: str = Field(..., min_length=1)
    stored_filename: str = Field(..., min_length=1)
    content_type: str = Field(..., min_length=1)
    size_bytes: int = Field(..., gt=0)
    message: str


class DocumentMetadataResponse(BaseModel):
    document_id: int = Field(..., gt=0)
    filename: str = Field(..., min_length=1)
    stored_filename: str = Field(..., min_length=1)
    content_type: str = Field(..., min_length=1)
    size_bytes: int = Field(..., ge=0)
    storage_path: str = Field(..., min_length=1)
    created_at: datetime
