from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.documents import router as documents_router
from app.api.routes.poc import router as poc_router
from app.api.routes.review import router as review_router
from app.api.routes.risk import router as risk_router
from app.db.session import initialize_database


def create_app() -> FastAPI:
    app = FastAPI(
        title="Healthcare Document Automation API",
        version="1.0.0",
        description="HIPAA-compliant backend for healthcare document automation.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:3001"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.include_router(documents_router)
    app.include_router(review_router)
    app.include_router(poc_router)
    app.include_router(risk_router)

    @app.on_event("startup")
    def startup_event() -> None:
        initialize_database()

    @app.get("/")
    async def root():
        return {"message": "Healthcare Document API v1.0"}

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
