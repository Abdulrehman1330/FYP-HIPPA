VALIDATION_RULES = {
    "patient_name": {"required": True, "min_confidence": 0.7},
    "date_of_birth": {"required": True, "min_confidence": 0.8, "pattern": r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"},
    "start_of_care": {"required": True, "min_confidence": 0.8, "pattern": r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"},
    "primary_icd10": {"required": True, "min_confidence": 0.8, "pattern": r"^[A-Z]\d{2}"},
    "diagnosis": {"required": True, "min_confidence": 0.5},
    "mobility_score": {"required": False, "range": (0, 100)},
    "adl_score": {"required": False, "range": (0, 100)},
    "medication_count": {"required": False, "range": (0, 50)},
}


def validate_field(field_name: str, value: str | None, confidence: float) -> dict:
    import re

    rules = VALIDATION_RULES.get(field_name, {})
    errors = []
    warnings = []

    if rules.get("required") and not value:
        errors.append(f"{field_name} is required but missing")

    if value and "pattern" in rules:
        if not re.match(rules["pattern"], value):
            errors.append(f"{field_name} has invalid format")

    if value and "range" in rules:
        try:
            num = float(value)
            lo, hi = rules["range"]
            if num < lo or num > hi:
                errors.append(f"{field_name} out of range [{lo}, {hi}]")
        except ValueError:
            errors.append(f"{field_name} must be numeric")

    min_conf = rules.get("min_confidence", 0)
    if confidence > 0 and confidence < min_conf:
        warnings.append(f"{field_name} confidence {confidence:.2f} below {min_conf}")

    if 0 < confidence < 0.7:
        warnings.append(f"{field_name} has low confidence: {confidence:.2f}")

    return {
        "field_name": field_name,
        "is_valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


def validate_document_fields(fields: list[dict]) -> dict:
    all_errors = []
    all_warnings = []

    for field in fields:
        result = validate_field(field["field_name"], field.get("field_value"), field.get("confidence", 0))
        all_errors.extend(result["errors"])
        all_warnings.extend(result["warnings"])

    return {
        "is_valid": len(all_errors) == 0,
        "errors": all_errors,
        "warnings": all_warnings,
    }
