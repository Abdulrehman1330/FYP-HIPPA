from fastapi import FastAPI

from app.api.routes.documents import router as documents_router
from app.db.session import check_db_connection, initialize_database


def create_app() -> FastAPI:
    app = FastAPI(
        title="Healthcare Document Automation API",
        version="0.1.0",
        description="MVP backend for healthcare document automation.",
    )

    app.include_router(documents_router)

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
        if check_db_connection():
            return {"status": "ok", "database": "connected"}
        return {"status": "degraded", "database": "unreachable"}

    return app


app = create_app()
