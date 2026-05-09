"""Evidence repository abstractions for the clinician RAG assistant."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Callable, Protocol

from backend.modules.poc.rag_assistant import EvidenceSnippet


class EvidenceRepository(Protocol):
    """Read approved RAG evidence from a backing store."""

    def list_approved_evidence(self, patient_id: str | None = None) -> list[EvidenceSnippet]:
        """Return approved evidence, optionally scoped to one patient."""


class JsonEvidenceRepository:
    """JSON-backed repository used for the semester demo."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)

    def list_approved_evidence(self, patient_id: str | None = None) -> list[EvidenceSnippet]:
        with self.path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)

        snippets = [
            EvidenceSnippet.from_dict(raw)
            for raw in payload["evidence"]
            if bool(raw.get("approved", True))
        ]
        if patient_id is None:
            return snippets
        return [snippet for snippet in snippets if snippet.patient_id == patient_id]


class InMemoryEvidenceRepository:
    """Test-friendly repository that behaves like the future database adapter."""

    def __init__(self, evidence: list[EvidenceSnippet]) -> None:
        self.evidence = list(evidence)

    def list_approved_evidence(self, patient_id: str | None = None) -> list[EvidenceSnippet]:
        snippets = [snippet for snippet in self.evidence if snippet.approved]
        if patient_id is None:
            return snippets
        return [snippet for snippet in snippets if snippet.patient_id == patient_id]


class PostgresEvidenceRepository:
    """PostgreSQL-backed evidence repository using a DB-API connection factory."""

    def __init__(self, connection_factory: Callable[[], Any]) -> None:
        self.connection_factory = connection_factory

    def list_approved_evidence(self, patient_id: str | None = None) -> list[EvidenceSnippet]:
        query = """
            SELECT source_id, patient_id::text, section, text, approved, source_type, metadata
            FROM rag_evidence_snippets
            WHERE approved = TRUE
        """
        params: tuple[str, ...] = ()
        if patient_id is not None:
            query += " AND patient_id = %s"
            params = (patient_id,)
        query += " ORDER BY created_at ASC"

        connection = self.connection_factory()
        cursor = connection.cursor()
        try:
            cursor.execute(query, params)
            rows = cursor.fetchall()
        finally:
            close = getattr(cursor, "close", None)
            if close is not None:
                close()
            close_connection = getattr(connection, "close", None)
            if close_connection is not None:
                close_connection()

        return [self._row_to_snippet(row) for row in rows]

    def _row_to_snippet(self, row: Any) -> EvidenceSnippet:
        source_id, patient_id, section, text, approved, source_type, metadata = row
        if metadata is None:
            parsed_metadata: dict[str, Any] = {}
        elif isinstance(metadata, str):
            parsed_metadata = json.loads(metadata)
        else:
            parsed_metadata = dict(metadata)

        return EvidenceSnippet(
            source_id=str(source_id),
            patient_id=str(patient_id),
            section=str(section),
            text=str(text),
            approved=bool(approved),
            source_type=str(source_type),
            metadata=parsed_metadata,
        )
