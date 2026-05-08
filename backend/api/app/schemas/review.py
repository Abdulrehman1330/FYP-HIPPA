from pydantic import BaseModel


class ReviewQueueItem(BaseModel):
    document_id: int
    filename: str
    uploaded_by: str
    uploaded_at: str
    field_count: int
    is_valid: bool
    error_count: int
    warning_count: int


class FieldDetail(BaseModel):
    id: int
    field_name: str
    field_value: str | None
    confidence: float
    source_snippet: str | None
    is_valid: bool
    errors: list[str]
    warnings: list[str]


class ReviewDetailResponse(BaseModel):
    document_id: int
    filename: str
    status: str
    fields: list[FieldDetail]
    validation: dict
    review_history: list[dict]


class EditRequest(BaseModel):
    edits: dict[str, str]


class RejectRequest(BaseModel):
    reason: str
