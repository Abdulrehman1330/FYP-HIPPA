from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document


def list_documents(db: Session, limit: int = 20, offset: int = 0) -> list[Document]:
    statement = (
        select(Document)
        .order_by(Document.created_at.desc(), Document.id.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def get_document_by_id(db: Session, document_id: int) -> Document | None:
    return db.get(Document, document_id)
