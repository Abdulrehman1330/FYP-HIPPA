"""Service configuration loaded from environment variables."""
from __future__ import annotations

import os
import shutil
from dataclasses import dataclass


def _resolve_tesseract_cmd() -> str:
    env_cmd = os.environ.get("TESSERACT_CMD")
    if env_cmd and os.path.isfile(env_cmd):
        return env_cmd

    on_path = shutil.which("tesseract") or shutil.which("tesseract.exe")
    if on_path:
        return on_path

    for path in (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        "/usr/bin/tesseract",
        "/usr/local/bin/tesseract",
    ):
        if os.path.isfile(path):
            return path
    return "tesseract"


@dataclass(frozen=True)
class Settings:
    max_file_size_bytes: int = 10 * 1024 * 1024
    pdf_render_dpi: int = 300
    text_layer_min_chars: int = 30
    tesseract_cmd: str = _resolve_tesseract_cmd()
    tesseract_lang: str = os.environ.get("TESSERACT_LANG", "eng")
    tesseract_config: str = os.environ.get("TESSERACT_CONFIG", "--oem 3 --psm 6")
    allowed_extensions: frozenset[str] = frozenset({".pdf", ".png", ".jpeg", ".jpg"})
    allowed_content_types: frozenset[str] = frozenset(
        {"application/pdf", "image/png", "image/jpeg", "image/jpg"}
    )


settings = Settings()
