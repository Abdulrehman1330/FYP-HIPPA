"""FastAPI entrypoint that combines document APIs and RAG assistant APIs."""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.app.rag_routes import router as rag_router


# Friend's scaffold imports modules as `app.*` when running from `backend/api`.
# Tests import from repo root as `backend.api.app.*`, so make both modes work.
BACKEND_API_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_API_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_API_ROOT))

DOCUMENT_API_IMPORT_ERROR: str | None = None

try:
    from app.api.routes.documents import router as documents_router
    from app.db.session import check_db_connection, initialize_database
except ImportError as exc:  # pragma: no cover - depends on local environment packages
    documents_router = None
    DOCUMENT_API_IMPORT_ERROR = str(exc)

    def check_db_connection() -> bool:
        return False

    def initialize_database() -> bool:
        return False


def create_app() -> FastAPI:
    app = FastAPI(
        title="HIPAA-Compliant Home Health AI Platform",
        version="0.1.0",
        description="MVP backend with document upload APIs and clinician RAG assistant endpoints.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://127.0.0.1:8001",
            "http://localhost:8001",
            "http://127.0.0.1:5500",
            "http://localhost:5500",
        ],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    if documents_router is not None:
        app.include_router(documents_router)
    if rag_router is not None:
        app.include_router(rag_router)

    @app.on_event("startup")
    def startup_event() -> None:
        initialize_database()

    @app.get("/")
    async def root() -> dict[str, str]:
        return {"message": "API is running"}

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/health/db")
    async def database_health() -> dict[str, str]:
        if DOCUMENT_API_IMPORT_ERROR:
            return {
                "status": "degraded",
                "database": "unavailable",
                "reason": DOCUMENT_API_IMPORT_ERROR,
            }
        if check_db_connection():
            return {"status": "ok", "database": "connected"}
        return {"status": "degraded", "database": "unreachable"}

    return app


app = create_app()
