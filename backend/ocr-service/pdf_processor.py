"""PDF processing: text-layer fast path + 300 DPI rasterization for OCR fallback."""
from __future__ import annotations

import logging
from typing import Optional

import cv2
import fitz  # PyMuPDF
import numpy as np
from PIL import Image

from config import settings
from ocr_engine import ocr_image

logger = logging.getLogger(__name__)


def _extract_text_layer(page, page_number: int) -> Optional[dict]:
    """Return page dict from PDF text layer if present and substantial, else None."""
    text = page.get_text("text") or ""
    if len(text.strip()) < settings.text_layer_min_chars:
        return None

    blocks: list[dict] = []
    for raw in page.get_text("blocks") or []:
        if len(raw) < 5:
            continue
        x0, y0, x1, y1, btext = raw[0], raw[1], raw[2], raw[3], raw[4]
        cleaned = (btext or "").strip()
        if not cleaned:
            continue
        blocks.append(
            {
                "text": cleaned,
                "confidence": 1.0,
                "bbox": [float(x0), float(y0), float(x1), float(y1)],
            }
        )

    return {"page_number": page_number, "text": text, "blocks": blocks}


def _rasterize(page) -> np.ndarray:
    pix = page.get_pixmap(dpi=settings.pdf_render_dpi)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def process_pdf(pdf_bytes: bytes) -> list[dict]:
    """Process every PDF page; prefer text layer, fall back to OCR."""
    pages: list[dict] = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
        if len(pdf) == 0:
            raise ValueError("PDF contains no pages")

        for idx, page in enumerate(pdf, start=1):
            text_page = _extract_text_layer(page, idx)
            if text_page is not None:
                logger.info("page %d: using text layer (%d chars)", idx, len(text_page["text"]))
                pages.append(text_page)
                continue

            logger.info("page %d: rasterizing for OCR", idx)
            try:
                image = _rasterize(page)
                pages.append(ocr_image(image, idx))
            except Exception:
                logger.exception("page %d: OCR failed, returning empty page", idx)
                pages.append({"page_number": idx, "text": "", "blocks": []})

    return pages
