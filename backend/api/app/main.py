"""FastAPI entrypoint for the FYP backend skeleton."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.app.rag_routes import router as rag_router


app = FastAPI(
    title="HIPAA-Compliant Home Health AI Platform",
    version="0.1.0",
    description="Backend skeleton with clinician RAG assistant endpoints.",
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


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


if rag_router is not None:
    app.include_router(rag_router)
