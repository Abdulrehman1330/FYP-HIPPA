"""Pydantic response schemas for the OCR API."""
from __future__ import annotations

from typing import Optional, Union

from pydantic import BaseModel, Field


class TextBlock(BaseModel):
    text: str
    confidence: float = Field(ge=0.0, le=1.0)
    bbox: list[float] = Field(min_length=4, max_length=4)


class Page(BaseModel):
    page_number: int = Field(ge=1)
    text: str
    blocks: list[TextBlock]


class ExtractedField(BaseModel):
    field_name: str
    value: Optional[Union[str, list[str]]] = None
    confidence: float = Field(ge=0.0, le=1.0)
    source_page: Optional[int] = None
    extraction_method: str = "regex"


class HealthResponse(BaseModel):
    status: str
    service: str


class ExtractResponse(BaseModel):
    success: bool
    raw_text: str
    pages: list[Page]
    extracted_fields: list[ExtractedField]
    processing_time_ms: int
    total_pages: int
