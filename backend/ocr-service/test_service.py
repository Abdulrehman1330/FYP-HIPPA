"""Smoke test for the OCR microservice. Requires the service to be running on port 5000."""
import sys
import time
from pathlib import Path

import requests

BASE_URL = "http://localhost:5000"


def test_health() -> None:
    resp = requests.get(f"{BASE_URL}/health", timeout=5)
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body == {"status": "healthy", "service": "ocr"}, body
    print("[PASS] /health")


def test_extract(file_path: Path) -> None:
    assert file_path.exists(), f"Test file not found: {file_path}"

    start = time.perf_counter()
    with file_path.open("rb") as fh:
        resp = requests.post(
            f"{BASE_URL}/ocr/extract",
            files={"file": (file_path.name, fh, "application/octet-stream")},
            timeout=60,
        )
    elapsed = time.perf_counter() - start

    assert resp.status_code == 200, resp.text
    body = resp.json()

    for key in ("success", "raw_text", "pages", "extracted_fields", "processing_time_ms", "total_pages"):
        assert key in body, f"Missing key: {key}"

    assert body["success"] is True
    assert body["total_pages"] >= 1
    assert isinstance(body["pages"], list) and len(body["pages"]) == body["total_pages"]
    assert isinstance(body["extracted_fields"], list)

    print(f"[PASS] /ocr/extract ({elapsed:.2f}s, {body['total_pages']} page(s))")
    print(f"       fields_found={sum(1 for f in body['extracted_fields'] if f['value'])}")
    if elapsed > 5 * body["total_pages"]:
        print(f"[WARN] Performance: {elapsed:.2f}s exceeds 5s/page target")


def test_invalid_type() -> None:
    resp = requests.post(
        f"{BASE_URL}/ocr/extract",
        files={"file": ("bad.txt", b"not an image", "text/plain")},
        timeout=10,
    )
    assert resp.status_code == 400, resp.text
    print("[PASS] invalid file type rejected")


if __name__ == "__main__":
    test_health()
    test_invalid_type()

    if len(sys.argv) > 1:
        test_extract(Path(sys.argv[1]))
    else:
        print("Skipping /ocr/extract test — pass a file path: python test_service.py <file.pdf>")
