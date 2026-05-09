# Review to RAG Evidence Contract

## Purpose

This contract defines how Asad's document review workflow should hand approved OASIS/POC fields to Abdul's RAG assistant.

The rule is simple:

```text
Only clinician-approved reviewed fields become RAG evidence.
```

Unapproved OCR output must not be indexed or used by the chatbot.

## Current Builder

```text
backend/modules/review/evidence_builder.py
```

Function:

```python
build_rag_evidence_from_review(raw_review)
```

Input is a reviewed document object. Output is a list of `EvidenceSnippet` objects that Abdul's RAG assistant can index.

## Input Shape

```json
{
  "review_id": "REV-SYN001-001",
  "document_id": "DOC-SYN001-OASIS",
  "patient_id": "SYN-001",
  "form_type": "OASIS-E2",
  "approved_by": "demo-reviewer-1",
  "approved_at": "2026-05-08T12:00:00Z",
  "fields": [
    {
      "field_id": "MOB1",
      "field_name": "ambulation_locomotion",
      "label": "Ambulation and Locomotion",
      "value": "Patient requires walker and one-person assistance.",
      "approved": true,
      "corrected": false,
      "page_number": 4,
      "confidence": 0.88
    }
  ]
}
```

## Output Shape

Each approved field becomes:

```json
{
  "source_id": "REVIEW-REV-SYN001-001-MOB1",
  "patient_id": "SYN-001",
  "section": "mobility",
  "text": "Approved OASIS-E2 field 'Ambulation and Locomotion': Patient requires walker and one-person assistance.",
  "approved": true,
  "source_type": "approved_review_field",
  "metadata": {
    "review_id": "REV-SYN001-001",
    "document_id": "DOC-SYN001-OASIS",
    "form_type": "OASIS-E2",
    "field_id": "MOB1",
    "field_name": "ambulation_locomotion",
    "approved_by": "demo-reviewer-1",
    "approved_at": "2026-05-08T12:00:00Z",
    "corrected": false,
    "page_number": 4,
    "extraction_confidence": 0.88
  }
}
```

## Section Mapping

Current supported mappings:

- `primary_diagnosis`, `secondary_diagnosis` -> `diagnosis`
- `recent_hospitalization` -> `hospitalization`
- `ambulation_locomotion`, `transfer_ability` -> `mobility`
- `fall_risk`, `home_safety` -> `safety`
- `medication_management`, `medication_reconciliation` -> `medications`
- `skilled_nursing_interventions` -> `interventions`
- `patient_goal` -> `goals`
- `vitals` -> `vitals`
- `allergies` -> `allergies`

Unknown approved fields are kept under `reviewed_field` so they are not silently lost.

## Demo Data

```text
data/synthetic/reviewed_oasis_demo.json
```

This file includes approved diagnosis, mobility, and fall-risk fields plus an unapproved medication/OCR field. The builder must ignore the unapproved field.

## Why This Matters

This is the safety boundary between OCR and RAG. The chatbot should not trust OCR directly. It should only trust evidence after a reviewer approves or corrects it.
