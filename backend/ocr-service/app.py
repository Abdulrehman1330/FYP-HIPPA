"""FastAPI OCR microservice — Tesseract + PyMuPDF text-layer fast path."""
from __future__ import annotations

import io
import logging
import time
from contextlib import asynccontextmanager

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image

from config import settings
from field_extractor import extract_fields
from ocr_engine import ocr_image, verify_installation
from pdf_processor import process_pdf
from schemas import ExtractResponse, HealthResponse

logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}',
)
logger = logging.getLogger("ocr-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        version = verify_installation()
        logger.info("Tesseract ready (version=%s, cmd=%s)", version, settings.tesseract_cmd)
    except Exception as exc:
        logger.error("Tesseract not available at %s: %s", settings.tesseract_cmd, exc)
    yield


app = FastAPI(
    title="HIPAA OCR Microservice",
    description="Tesseract OCR + field extraction for OASIS-E2 / POC forms",
    version="2.0.0",
    lifespan=lifespan,
)


def _validate_upload(file: UploadFile, raw_bytes: bytes) -> None:
    if len(raw_bytes) > settings.max_file_size_bytes:
        raise HTTPException(status_code=413, detail="File exceeds 10MB limit")

    name = (file.filename or "").lower()
    ext_ok = any(name.endswith(ext) for ext in settings.allowed_extensions)
    type_ok = file.content_type in settings.allowed_content_types
    if not (ext_ok or type_ok):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {sorted(settings.allowed_extensions)}",
        )


def _load_image(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="healthy", service="ocr")


@app.post("/ocr/extract", response_model=ExtractResponse)
async def ocr_extract(file: UploadFile = File(...)) -> ExtractResponse:
    start = time.perf_counter()

    raw_bytes = await file.read()
    _validate_upload(file, raw_bytes)

    name = (file.filename or "").lower()
    is_pdf = name.endswith(".pdf") or file.content_type == "application/pdf"

    try:
        if is_pdf:
            pages = process_pdf(raw_bytes)
        else:
            pages = [ocr_image(_load_image(raw_bytes), 1)]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("OCR processing failed")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {exc}")

    pages_text = [p["text"] for p in pages]
    full_text = "\n".join(pages_text)

    try:
        extracted = extract_fields(full_text, pages_text)
    except Exception as exc:
        logger.exception("Field extraction failed")
        raise HTTPException(status_code=500, detail=f"Field extraction failed: {exc}")

    processing_ms = int((time.perf_counter() - start) * 1000)
    populated = sum(1 for f in extracted if f["value"] is not None)
    logger.info(
        "extract complete: file=%s pages=%d ms=%d fields=%d/%d",
        file.filename,
        len(pages),
        processing_ms,
        populated,
        len(extracted),
    )

    return ExtractResponse(
        success=True,
        raw_text=full_text,
        pages=pages,
        extracted_fields=extracted,
        processing_time_ms=processing_ms,
        total_pages=len(pages),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=False)
