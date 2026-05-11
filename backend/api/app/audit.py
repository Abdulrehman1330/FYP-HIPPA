"""Append-only audit logging for RAG demo interactions."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any
from uuid import uuid4


REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_AUDIT_LOG_PATH = REPO_ROOT / "data" / "processed" / "rag_audit_log.jsonl"


@dataclass(frozen=True)
class RagAuditEvent:
    event_id: str
    timestamp_utc: str
    user_id: str
    patient_id: str
    action: str
    question: str
    refused: bool
    source_ids: list[str]
    confidence: str
    reason: str | None

    def to_dict(self) -> dict[str, Any]:
        return {
            "event_id": self.event_id,
            "timestamp_utc": self.timestamp_utc,
            "user_id": self.user_id,
            "patient_id": self.patient_id,
            "action": self.action,
            "question": self.question,
            "refused": self.refused,
            "source_ids": self.source_ids,
            "confidence": self.confidence,
            "reason": self.reason,
        }


class JsonlAuditLogger:
    def __init__(self, path: Path = DEFAULT_AUDIT_LOG_PATH) -> None:
        self.path = path

    def write(self, event: RagAuditEvent) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event.to_dict(), sort_keys=True) + "\n")

    def read_recent(self, limit: int = 20) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        with self.path.open("r", encoding="utf-8") as handle:
            lines = [line.strip() for line in handle if line.strip()]
        recent = lines[-max(limit, 0) :]
        events = [json.loads(line) for line in recent]
        events.reverse()
        return events


def record_rag_audit_event(
    *,
    user_id: str,
    patient_id: str,
    action: str,
    question: str,
    response: dict[str, Any],
    logger: JsonlAuditLogger | None = None,
) -> str:
    """Persist a compact audit record and return its event ID."""

    event = RagAuditEvent(
        event_id=str(uuid4()),
        timestamp_utc=datetime.now(timezone.utc).isoformat(),
        user_id=user_id,
        patient_id=patient_id,
        action=action,
        question=question,
        refused=bool(response.get("refused")),
        source_ids=[
            str(citation["source_id"])
            for citation in response.get("citations", [])
            if "source_id" in citation
        ],
        confidence=str(response.get("confidence", "unknown")),
        reason=response.get("reason"),
    )
    (logger or JsonlAuditLogger()).write(event)
    return event.event_id


def read_recent_rag_audit_events(limit: int = 20) -> list[dict[str, Any]]:
    """Return recent local RAG audit events for demo review."""

    return JsonlAuditLogger().read_recent(limit=limit)
