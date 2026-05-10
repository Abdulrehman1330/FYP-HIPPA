"""Tesseract OCR wrapper. Converts a preprocessed image into structured page data."""
from __future__ import annotations

import logging

import cv2
import numpy as np
import pytesseract

from config import settings
from preprocessor import preprocess_image

logger = logging.getLogger(__name__)

pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def verify_installation() -> str:
    """Raise on missing Tesseract binary; return version string on success."""
    version = pytesseract.get_tesseract_version()
    return str(version)


def ocr_image(image: np.ndarray, page_number: int) -> dict:
    """Run Tesseract on a BGR image and return structured page data."""
    preprocessed = preprocess_image(image)
    rgb = cv2.cvtColor(preprocessed, cv2.COLOR_BGR2RGB)

    data = pytesseract.image_to_data(
        rgb,
        output_type=pytesseract.Output.DICT,
        lang=settings.tesseract_lang,
        config=settings.tesseract_config,
    )

    blocks: list[dict] = []
    text_chunks: list[str] = []

    for i in range(len(data.get("text", []))):
        token = (data["text"][i] or "").strip()
        if not token:
            continue
        try:
            conf_raw = float(data["conf"][i])
        except (TypeError, ValueError):
            continue
        if conf_raw < 0:
            continue

        confidence = max(0.0, min(1.0, conf_raw / 100.0))
        x = data["left"][i]
        y = data["top"][i]
        w = data["width"][i]
        h = data["height"][i]

        blocks.append(
            {
                "text": token,
                "confidence": confidence,
                "bbox": [float(x), float(y), float(x + w), float(y + h)],
            }
        )
        text_chunks.append(token)

    return {
        "page_number": page_number,
        "text": " ".join(text_chunks),
        "blocks": blocks,
    }
