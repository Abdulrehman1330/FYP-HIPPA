from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(db: Session, action: str, user_id: int | None = None, document_id: int | None = None,
               details: dict | None = None, ip_address: str | None = None) -> None:
    entry = AuditLog(
        action=action,
        user_id=user_id,
        document_id=document_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
