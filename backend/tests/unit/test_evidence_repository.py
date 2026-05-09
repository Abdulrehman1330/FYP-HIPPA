from pathlib import Path
import unittest

from backend.modules.poc.evidence_repository import JsonEvidenceRepository, PostgresEvidenceRepository


DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "synthetic" / "rag_evidence_demo.json"


class EvidenceRepositoryTests(unittest.TestCase):
    def test_json_repository_returns_only_approved_evidence(self) -> None:
        repository = JsonEvidenceRepository(DATA_PATH)

        evidence = repository.list_approved_evidence("SYN-001")
        source_ids = {snippet.source_id for snippet in evidence}

        self.assertIn("OASIS-SYN001-MOB", source_ids)
        self.assertNotIn("OCR-SYN001-RAW-INSULIN", source_ids)

    def test_json_repository_can_filter_by_patient(self) -> None:
        repository = JsonEvidenceRepository(DATA_PATH)

        evidence = repository.list_approved_evidence("SYN-002")

        self.assertEqual(len(evidence), 1)
        self.assertEqual(evidence[0].patient_id, "SYN-002")

    def test_postgres_repository_maps_rows_to_evidence(self) -> None:
        cursor = FakeCursor(
            rows=[
                (
                    "PG-SOURCE-1",
                    "SYN-001",
                    "mobility",
                    "Approved field: patient requires walker.",
                    True,
                    "approved_review_field",
                    '{"field_name":"ambulation_locomotion"}',
                )
            ]
        )
        repository = PostgresEvidenceRepository(lambda: FakeConnection(cursor))

        evidence = repository.list_approved_evidence("SYN-001")

        self.assertEqual(len(evidence), 1)
        self.assertEqual(evidence[0].source_id, "PG-SOURCE-1")
        self.assertEqual(evidence[0].metadata["field_name"], "ambulation_locomotion")
        self.assertEqual(cursor.params, ("SYN-001",))
        self.assertIn("approved = TRUE", cursor.query)


class FakeCursor:
    def __init__(self, rows: list[tuple]) -> None:
        self.rows = rows
        self.query = ""
        self.params: tuple[str, ...] = ()
        self.closed = False

    def execute(self, query: str, params: tuple[str, ...]) -> None:
        self.query = query
        self.params = params

    def fetchall(self) -> list[tuple]:
        return self.rows

    def close(self) -> None:
        self.closed = True


class FakeConnection:
    def __init__(self, cursor: FakeCursor) -> None:
        self._cursor = cursor
        self.closed = False

    def cursor(self) -> FakeCursor:
        return self._cursor

    def close(self) -> None:
        self.closed = True


if __name__ == "__main__":
    unittest.main()
