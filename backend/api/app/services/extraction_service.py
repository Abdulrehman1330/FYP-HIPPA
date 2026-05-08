import re
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentStatus
from app.models.document_extraction import DocumentExtraction
from app.models.extracted_field import ExtractedField

# Field patterns: (field_name, regex_pattern, required)
FIELD_PATTERNS = [
    ("patient_name", r"(?:patient\s*name|pt\s*name|name)\s*[:\-]\s*([A-Za-z][A-Za-z ,.'-]{1,80})", True),
    ("date_of_birth", r"(?:date\s*of\s*birth|dob)\s*[:\-]\s*([0-3]?\d[/-][0-3]?\d[/-](?:\d{4}|\d{2}))", True),
    ("start_of_care", r"(?:soc|start\s*of\s*care)\s*[:\-]\s*([0-3]?\d[/-][0-3]?\d[/-](?:\d{4}|\d{2}))", True),
    ("primary_icd10", r"(?:primary\s+diagnosis|icd-?10|diagnosis\s*code)\s*[:\-]\s*([A-Z]\d{2}(?:\.\w{1,4})?)", True),
    ("secondary_icd10", r"(?:secondary|other)\s*(?:diagnosis|dx)\s*[:\-]\s*([^\n]+)", False),
    ("mobility_score", r"(?:mobility|ambulation)\s*(?:score)?\s*[:\-]\s*(\d+)", False),
    ("adl_score", r"(?:adl|daily\s*living)\s*(?:score)?\s*[:\-]\s*(\d+)", False),
    ("medication_count", r"(?:medications?|med\s*count)\s*[:\-]\s*(\d+)", False),
    ("diagnosis", r"(?:primary\s+diagnosis|diagnosis|dx)\s*[:\-]\s*([^\n]+)", True),
    ("gender", r"(?:gender|sex)\s*[:\-]\s*(male|female|m|f)", False),
    ("patient_id", r"(?:patient\s*id|pt\s*id|mrn)\s*[:\-]\s*([A-Z0-9]+)", False),
]


def normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.strip() for line in text.split("\n")]
    return "\n".join(line for line in lines if line)


def read_file_text(file_path: Path) -> str:
    raw = file_path.read_bytes().decode("utf-8", errors="ignore")
    return normalize_text(raw)


def extract_field(field_name: str, pattern: str, text: str) -> tuple[str | None, float, str | None]:
    match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    if not match:
        return None, 0.0, None

    value = re.sub(r"\s+", " ", match.group(1)).strip(" .;,-")
    snippet = match.group(0).strip()

    # Confidence based on match quality
    confidence = 0.85
    if text.count(match.group(0)) == 1:
        confidence += 0.05
    if len(value) > 2:
        confidence += 0.05

    return value, min(confidence, 0.95), snippet


def infer_document_type(filename: str) -> str:
    name = filename.lower()
    if "oasis" in name:
        return "oasis"
    if "care" in name or "poc" in name:
        return "plan_of_care"
    return "medical_document"


def run_document_extraction(db: Session, document_id: int) -> DocumentExtraction:
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    file_path = Path(document.storage_path)
    if not file_path.exists():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found on disk")

    # Update status
    document.status = DocumentStatus.PREPROCESSING
    db.commit()

    # Extract text
    source_text = read_file_text(file_path)

    # Extract individual fields
    fields_data = []
    for field_name, pattern, required in FIELD_PATTERNS:
        value, confidence, snippet = extract_field(field_name, pattern, source_text)
        if value or required:
            fields_data.append({
                "field_name": field_name,
                "field_value": value,
                "confidence": confidence,
                "source_snippet": snippet,
            })

    # Save extracted fields
    db.query(ExtractedField).filter(ExtractedField.document_id == document_id).delete()
    for fd in fields_data:
        db.add(ExtractedField(document_id=document_id, **fd))

    # Build summary dict
    fields_dict = {f["field_name"]: f["field_value"] or "unknown" for f in fields_data}
    fields_dict["document_type"] = infer_document_type(document.original_filename)

    # Save or update extraction record
    existing = db.scalar(select(DocumentExtraction).where(DocumentExtraction.document_id == document_id))
    if existing:
        existing.status = "completed"
        existing.provider = "regex_parser"
        existing.extracted_text = source_text
        existing.extracted_fields = fields_dict
        extraction = existing
    else:
        extraction = DocumentExtraction(
            document_id=document_id,
            status="completed",
            provider="regex_parser",
            extracted_text=source_text,
            extracted_fields=fields_dict,
        )
        db.add(extraction)

    document.status = DocumentStatus.EXTRACTED
    db.commit()
    db.refresh(extraction)
    return extraction


def get_document_extraction(db: Session, document_id: int) -> DocumentExtraction:
    extraction = db.scalar(select(DocumentExtraction).where(DocumentExtraction.document_id == document_id))
    if not extraction:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No extraction found for this document")
    return extraction
