from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document


def list_documents(db: Session, user_id: int, limit: int = 20, offset: int = 0) -> list[Document]:
    stmt = (
        select(Document)
        .where(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def get_document(db: Session, document_id: int, user_id: int) -> Document | None:
    return db.scalar(
        select(Document).where(Document.id == document_id, Document.user_id == user_id)
    )


def count_documents(db: Session, user_id: int) -> int:
    return db.query(Document).filter(Document.user_id == user_id).count()
