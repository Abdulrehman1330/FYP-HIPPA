"""Demo authorization helpers for clinician-only RAG endpoints.

This is not a replacement for real authentication. It gives the semester demo a
clear RBAC contract that can later be replaced by JWT/session middleware.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from fastapi import Header, HTTPException, status


ALLOWED_RAG_ROLES = {"clinician", "reviewer", "admin"}


@dataclass(frozen=True)
class UserContext:
    user_id: str
    role: str
    patient_ids: frozenset[str]


def get_current_user(
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
    x_role: Optional[str] = Header(default=None, alias="X-Role"),
    x_patient_ids: Optional[str] = Header(default="", alias="X-Patient-Ids"),
) -> UserContext:
    """Build a demo user context from request headers."""

    if not x_user_id or not x_role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="RAG endpoints require demo clinician identity headers.",
        )

    role = x_role.strip().lower()
    if role not in ALLOWED_RAG_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User role is not allowed to access clinician RAG endpoints.",
        )

    patient_ids = frozenset(
        patient_id.strip()
        for patient_id in (x_patient_ids or "").split(",")
        if patient_id.strip()
    )
    return UserContext(user_id=x_user_id.strip(), role=role, patient_ids=patient_ids)


def require_patient_access(user: UserContext, patient_id: str) -> None:
    """Reject access unless the demo user can view the requested patient."""

    if user.role == "admin":
        return
    if patient_id in user.patient_ids:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User is not authorized for this patient's RAG evidence.",
    )


def require_audit_review_access(user: UserContext) -> None:
    """Allow audit review only for reviewer/admin demo roles."""

    if user.role in {"reviewer", "admin"}:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Only reviewer or admin roles can view RAG audit events.",
    )
