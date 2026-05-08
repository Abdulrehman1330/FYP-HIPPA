"""Post-OCR field extraction for OASIS-E2 and POC forms.

Supports two label styles:
  1. Generic: ``Patient Name: John Doe``
  2. OASIS M-code: ``M0040 - Patient Name\\nJohn Doe`` (CMS OASIS-E2 instrument)

Earlier-listed patterns get higher confidence; first match wins.
"""
import re
from typing import Optional


# OASIS-E2 single-value field patterns
OASIS_PATTERNS = {
    "patient_name": [
        r"M0040\s*[-:]?\s*Patient\s*Name\s*[\r\n]+\s*([A-Za-z][A-Za-z\.\-' ]{1,60})",
        r"Patient\s*Name\s*[:\-]\s*([A-Za-z][A-Za-z\.\-' ]{1,60})",
        r"Name\s*of\s*Patient\s*[:\-]\s*([A-Za-z][A-Za-z\.\-' ]{1,60})",
    ],
    "date_of_birth": [
        r"M0066\s*[-:]?\s*Birth\s*Date\s*[\r\n]+\s*([\d/\-\.]{6,10})",
        r"(?:DOB|Date\s*of\s*Birth|Birth\s*Date)\s*[:\-]\s*([\d/\-\.]{6,10})",
    ],
    "start_of_care": [
        r"M0030\s*[-:]?\s*SOC\s*Date\s*[\r\n]+\s*([\d/\-\.]{6,10})",
        r"(?:SOC|Start\s*of\s*Care|Admission\s*Date)\s*[:\-]\s*([\d/\-\.]{6,10})",
    ],
    "primary_diagnosis": [
        r"M1021\s*[-:]?\s*Primary\s*Diagnosis[^\n\r]*[\r\n]+\s*([^\n\r]{2,120})",
        r"Primary\s*Diagnosis\s*[:\-]\s*([^\n\r]{2,120})",
        r"Principal\s*Diagnosis\s*[:\-]\s*([^\n\r]{2,120})",
    ],
    "primary_icd10": [
        r"M1021\s*[-:]?\s*Primary\s*Diagnosis[^\n\r]*[\r\n]+\s*([A-Z]\d{2}\.?\d{0,3})",
        r"(?:Primary\s*)?ICD[\-\s]*10\s*(?:Code)?\s*[:\-]\s*([A-Z]\d{2}\.?\d{0,3})",
        r"\b([A-Z]\d{2}\.\d{1,3})\b",
    ],
    "admission_source": [
        r"M1100\s*[-:]?\s*Living\s*Situation\s*[\r\n]+\s*([^\n\r]{1,80})",
        r"Admission\s*Source\s*[:\-]\s*([^\n\r]{2,80})",
        r"Referred\s*From\s*[:\-]\s*([^\n\r]{2,80})",
    ],
    "functional_status": [
        r"M1860\s*[-:]?\s*Ambulation/?Locomotion\s*[\r\n]+\s*([^\n\r]{1,40})",
        r"(?:ADL|Functional\s*Status|ADL\s*Score)\s*[:\-]\s*([^\n\r]{1,80})",
    ],
}

# OASIS-E2 multi-value (list) field patterns
OASIS_LIST_PATTERNS = {
    "secondary_diagnoses": [
        r"M1023\s*[-:]?\s*Secondary\s*Diagnos[ei]s[^\n\r]*[\r\n]+((?:[A-Z]\d{2}\.?\d{0,3}\s*[\r\n]*){1,10})",
        r"Secondary\s*Diagnos[ei]s\s*[:\-]\s*((?:.+(?:\n|$)){1,8})",
        r"Other\s*Diagnos[ei]s\s*[:\-]\s*((?:.+(?:\n|$)){1,8})",
    ],
    "medications": [
        r"SECTION\s*N\s*[:\-]?\s*MEDICATIONS\s*[\r\n]+((?:.+(?:\n|$)){1,20})",
        r"Current\s*Medications?\s*[:\-]\s*((?:.+(?:\n|$)){1,15})",
        r"Medications?\s*[:\-]\s*((?:.+(?:\n|$)){1,15})",
    ],
    "allergies": [
        r"Known\s*Allergies\s*[:\-]?\s*((?:.+(?:\n|$)){1,5})",
        r"Allerg(?:y|ies)\s*[:\-]?\s*((?:.+(?:\n|$)){1,5})",
    ],
}

# POC field patterns
POC_PATTERNS = {
    "frequency": [
        r"Frequency\s*[:\-]?\s*([^\n\r]{2,80})",
        r"Visit\s*Frequency\s*[:\-]?\s*([^\n\r]{2,80})",
    ],
    "duration": [
        r"Duration\s*[:\-]?\s*([^\n\r]{2,80})",
        r"Treatment\s*Duration\s*[:\-]?\s*([^\n\r]{2,80})",
    ],
}

POC_LIST_PATTERNS = {
    "goals": [
        r"(?:Treatment\s*)?Goals?\s*[:\-]?\s*((?:.+(?:\n|$)){1,8})",
    ],
    "interventions": [
        r"(?:Planned\s*)?Interventions?\s*[:\-]?\s*((?:.+(?:\n|$)){1,8})",
    ],
}

DATE_FORMATS = [
    re.compile(r"^\d{1,2}/\d{1,2}/\d{2,4}$"),
    re.compile(r"^\d{1,2}-\d{1,2}-\d{2,4}$"),
    re.compile(r"^\d{4}-\d{1,2}-\d{1,2}$"),
    re.compile(r"^\d{1,2}\.\d{1,2}\.\d{2,4}$"),
]


def _normalize_date(value: str) -> Optional[str]:
    value = value.strip()
    for pattern in DATE_FORMATS:
        if pattern.match(value):
            return value
    return None


def _split_list(blob: str) -> list[str]:
    """Split multi-line/bullet text into individual items."""
    items = re.split(r"[\n;,]|(?:\s\d+\.\s)|(?:\s-\s)|(?:\s\*\s)", blob)
    cleaned = []
    for item in items:
        s = item.strip(" \t.-*•")
        if 2 <= len(s) <= 200:
            cleaned.append(s)
    return cleaned


def _find_with_confidence(text: str, patterns: list[str]) -> Optional[tuple[str, float]]:
    """Try patterns in order; earlier patterns get higher confidence."""
    for idx, pattern in enumerate(patterns):
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            value = match.group(1).strip()
            if value:
                # First pattern: 0.9, subsequent fall off
                confidence = max(0.6, 0.9 - (idx * 0.1))
                return value, confidence
    return None


def _locate_source_page(value: str, pages_text: list[str]) -> int:
    for i, page_text in enumerate(pages_text, start=1):
        if value and value[:30].lower() in page_text.lower():
            return i
    return 1


def extract_fields(full_text: str, pages_text: list[str]) -> list[dict]:
    """
    Extract structured fields from OCR'd text.

    Args:
        full_text: Concatenated text from all pages
        pages_text: List of per-page text for source page tracking

    Returns:
        List of extracted field dicts
    """
    results: list[dict] = []

    # OASIS single-value fields
    for field_name, patterns in OASIS_PATTERNS.items():
        found = _find_with_confidence(full_text, patterns)
        if found is None:
            results.append(
                {
                    "field_name": field_name,
                    "value": None,
                    "confidence": 0.0,
                    "source_page": None,
                    "extraction_method": "regex",
                }
            )
            continue

        value, confidence = found

        # Date validation bumps/penalizes confidence
        if field_name in ("date_of_birth", "start_of_care"):
            normalized = _normalize_date(value)
            if normalized is None:
                confidence *= 0.6
            else:
                value = normalized

        results.append(
            {
                "field_name": field_name,
                "value": value,
                "confidence": round(confidence, 2),
                "source_page": _locate_source_page(value, pages_text),
                "extraction_method": "regex",
            }
        )

    # OASIS multi-value list fields
    for field_name, patterns in OASIS_LIST_PATTERNS.items():
        found = _find_with_confidence(full_text, patterns)
        if found is None:
            results.append(
                {
                    "field_name": field_name,
                    "value": None,
                    "confidence": 0.0,
                    "source_page": None,
                    "extraction_method": "regex",
                }
            )
            continue

        blob, confidence = found
        items = _split_list(blob)
        if not items:
            results.append(
                {
                    "field_name": field_name,
                    "value": None,
                    "confidence": 0.0,
                    "source_page": None,
                    "extraction_method": "regex",
                }
            )
            continue

        results.append(
            {
                "field_name": field_name,
                "value": items,
                "confidence": round(confidence, 2),
                "source_page": _locate_source_page(items[0], pages_text),
                "extraction_method": "regex",
            }
        )

    # POC single-value fields
    for field_name, patterns in POC_PATTERNS.items():
        found = _find_with_confidence(full_text, patterns)
        if found is None:
            results.append(
                {
                    "field_name": field_name,
                    "value": None,
                    "confidence": 0.0,
                    "source_page": None,
                    "extraction_method": "regex",
                }
            )
            continue

        value, confidence = found
        results.append(
            {
                "field_name": field_name,
                "value": value,
                "confidence": round(confidence, 2),
                "source_page": _locate_source_page(value, pages_text),
                "extraction_method": "regex",
            }
        )

    # POC list fields
    for field_name, patterns in POC_LIST_PATTERNS.items():
        found = _find_with_confidence(full_text, patterns)
        if found is None:
            results.append(
                {
                    "field_name": field_name,
                    "value": None,
                    "confidence": 0.0,
                    "source_page": None,
                    "extraction_method": "regex",
                }
            )
            continue

        blob, confidence = found
        items = _split_list(blob)
        if not items:
            results.append(
                {
                    "field_name": field_name,
                    "value": None,
                    "confidence": 0.0,
                    "source_page": None,
                    "extraction_method": "regex",
                }
            )
            continue

        results.append(
            {
                "field_name": field_name,
                "value": items,
                "confidence": round(confidence, 2),
                "source_page": _locate_source_page(items[0], pages_text),
                "extraction_method": "regex",
            }
        )

    return results
