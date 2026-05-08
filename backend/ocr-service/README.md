# OCR Microservice

FastAPI microservice that extracts text and structured fields from OASIS-E2
and POC documents. Designed to be called by the Express backend over HTTP.

## Architecture

| Module | Responsibility |
|---|---|
| `app.py` | FastAPI routes, request validation, response shaping |
| `config.py` | Environment-driven settings (Tesseract path, DPI, size limits) |
| `schemas.py` | Pydantic response models |
| `pdf_processor.py` | PDF text-layer fast path + 300 DPI rasterization fallback |
| `ocr_engine.py` | Tesseract wrapper with confidence + bbox per token |
| `preprocessor.py` | Grayscale, denoise, CLAHE, deskew, binarize |
| `field_extractor.py` | Regex extraction (generic + OASIS M-code aware) |

### Processing flow

1. Validate file (type, size).
2. **PDFs**: for each page, try `page.get_text()` (text layer). If non-empty,
   use it directly (~ms/page). Otherwise rasterize at 300 DPI and OCR.
3. **Images**: load directly, OCR.
4. Run regex field extractor on combined text.
5. Return structured JSON.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | `{"status":"healthy","service":"ocr"}` |
| `POST` | `/ocr/extract` | Multipart `file` upload (PDF/PNG/JPEG, ≤10 MB) |

### Response

```json
{
  "success": true,
  "raw_text": "...",
  "pages": [{"page_number": 1, "text": "...", "blocks": [...]}],
  "extracted_fields": [
    {"field_name": "patient_name", "value": "Alexander A Hill",
     "confidence": 0.9, "source_page": 1, "extraction_method": "regex"}
  ],
  "processing_time_ms": 19,
  "total_pages": 4
}
```

### Error codes

| Code | Cause |
|---|---|
| `400` | Invalid file type / unreadable PDF |
| `413` | File > 10 MB |
| `500` | OCR or extraction failure |

## Local setup (Windows)

1. Install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
   (default path `C:\Program Files\Tesseract-OCR\` is auto-detected).
2. Install Python deps:

   ```powershell
   cd backend\ocr-service
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. Run:

   ```powershell
   python app.py
   # or
   uvicorn app:app --host 0.0.0.0 --port 5000
   ```

## Docker

```bash
docker build -t hipaa-ocr-service .
docker run --rm -p 5000:5000 hipaa-ocr-service
```

## Configuration (env vars)

| Var | Default | Notes |
|---|---|---|
| `TESSERACT_CMD` | auto-detected | Override if Tesseract is in a non-standard path |
| `TESSERACT_LANG` | `eng` | Tesseract `--lang` |
| `TESSERACT_CONFIG` | `--oem 3 --psm 6` | LSTM engine + uniform block of text |

## Testing

```powershell
# Health
curl http://localhost:5000/health

# Extract from sample
curl -X POST http://localhost:5000/ocr/extract `
  -F "file=@..\..\..\kimi_extract\data\oasis_e2\synthetic_forms\pdf\SYN_001_oasis_e2.pdf"

# Smoke test
python test_service.py path\to\sample.pdf
```

## Performance (observed)

| Input | Time |
|---|---|
| 4-page synthetic OASIS PDF (text layer) | ~20 ms |
| 1-page scanned image (Tesseract) | ~1–2 s |
| 5-page scanned PDF | ~5–10 s |

## Express integration

Called from `backend/src/routes/extraction.routes.js`:

```js
const form = new FormData();
form.append('file', fs.createReadStream(filePath));
const { data } = await axios.post(
  `${process.env.OCR_SERVICE_URL}/ocr/extract`,
  form,
  { headers: form.getHeaders(), timeout: 60000 }
);
```

## HIPAA notes

- No file or text is persisted to disk.
- Logs include filename and counts only — no raw text or PHI.
- Service is internal-only; rate limiting and auth are handled at the
  Express edge.
