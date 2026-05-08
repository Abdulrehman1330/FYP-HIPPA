# API

Primary FastAPI application.

Current status (Step 6):

- FastAPI app bootstrap
- Layered package skeleton: API, Services, Models, Schemas
- PostgreSQL + SQLAlchemy connection setup
- Upload API for PDF/image files
- Local file storage + PostgreSQL metadata persistence
- Simple document metadata endpoints (list + retrieve)
- OCR extraction endpoint scaffold with persisted output

## Run locally

1. Create and activate a virtual environment.
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the server from this folder:

   ```bash
   uvicorn app.main:app --reload
   ```

4. Open:

- API root: `http://127.0.0.1:8000/`
- Health: `http://127.0.0.1:8000/health`
- DB health: `http://127.0.0.1:8000/health/db`
- Upload: `POST http://127.0.0.1:8000/documents/upload`
- List documents: `GET http://127.0.0.1:8000/documents?limit=20&offset=0`
- Get document: `GET http://127.0.0.1:8000/documents/{document_id}`
- Run extraction: `POST http://127.0.0.1:8000/documents/{document_id}/extract`
- Get extraction: `GET http://127.0.0.1:8000/documents/{document_id}/extract`
- Swagger UI: `http://127.0.0.1:8000/docs`

## Database configuration

Set this environment variable before running the API:

```bash
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/healthcare_docs
```

If `DATABASE_URL` is not set, the API uses the same local default shown above.

## Storage configuration

Optional environment variable:

```bash
DOCUMENT_STORAGE_DIR=storage/documents
```

If not set, uploads are saved to `storage/documents` under `backend/api`.

## Upload API (Step 6)

- Endpoint: `POST /documents/upload`
- Accepted file types: PDF, PNG, JPG, JPEG
- Max size: 10 MB
- Current behavior:
  - validates the uploaded file
  - saves the file to local storage
  - stores file metadata in PostgreSQL table `documents`

Example cURL:

```bash
curl -X POST "http://127.0.0.1:8000/documents/upload" \
   -H "accept: application/json" \
   -H "Content-Type: multipart/form-data" \
   -F "file=@sample.pdf"
```

## Simple endpoints (Step 5)

- List metadata:
  - Endpoint: `GET /documents?limit=20&offset=0`
  - Query params:
    - `limit` range: 1 to 100
    - `offset` minimum: 0
- Get metadata by id:
  - Endpoint: `GET /documents/{document_id}`
  - Returns 404 if the id does not exist

## Extraction endpoints (Step 6)

- Run extraction:
  - Endpoint: `POST /documents/{document_id}/extract`
  - Behavior:
    - reads the stored file from local disk
    - generates a local OCR stub output
    - stores extraction result in PostgreSQL table `document_extractions`
    - if extraction exists already, it updates it
- Get extraction result:
  - Endpoint: `GET /documents/{document_id}/extract`
  - Returns 404 if extraction has not been run yet

Note: This is a local placeholder for now. Replace extraction logic with Azure OCR in the integration phase.
