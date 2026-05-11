import json
from pathlib import Path
import unittest

from backend.modules.review.evidence_builder import build_rag_evidence_from_review


DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "synthetic" / "reviewed_oasis_demo.json"


class ReviewEvidenceBuilderTests(unittest.TestCase):
    def setUp(self) -> None:
        with DATA_PATH.open("r", encoding="utf-8") as handle:
            self.review = json.load(handle)

    def test_builds_evidence_from_approved_review_fields(self) -> None:
        evidence = build_rag_evidence_from_review(self.review)

        self.assertEqual(len(evidence), 3)
        self.assertEqual({item.patient_id for item in evidence}, {"SYN-001"})
        self.assertIn("diagnosis", {item.section for item in evidence})
        self.assertIn("mobility", {item.section for item in evidence})
        self.assertIn("safety", {item.section for item in evidence})

    def test_ignores_unapproved_review_fields(self) -> None:
        evidence = build_rag_evidence_from_review(self.review)

        combined_text = " ".join(item.text for item in evidence)
        self.assertNotIn("insulin sliding scale", combined_text)

    def test_preserves_review_metadata_for_auditability(self) -> None:
        evidence = build_rag_evidence_from_review(self.review)
        first = evidence[0]

        self.assertTrue(first.source_id.startswith("REVIEW-REV-SYN001-001-"))
        self.assertEqual(first.metadata["review_id"], "REV-SYN001-001")
        self.assertEqual(first.metadata["approved_by"], "demo-reviewer-1")


if __name__ == "__main__":
    unittest.main()
