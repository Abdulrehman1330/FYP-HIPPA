# API

Primary FastAPI application.

Current status (Step 5):

- FastAPI app bootstrap
- Layered package skeleton: API, Services, Models, Schemas
- PostgreSQL + SQLAlchemy connection setup
- Upload API for PDF/image files
- Local file storage + PostgreSQL metadata persistence
- Simple document metadata endpoints (list + retrieve)

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

## Upload API (Step 5)

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
