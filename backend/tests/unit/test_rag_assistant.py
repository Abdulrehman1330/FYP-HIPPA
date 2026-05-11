from pathlib import Path
import unittest

from backend.modules.poc.rag_assistant import ClinicianRagAssistant


DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "synthetic" / "rag_evidence_demo.json"


class ClinicianRagAssistantTests(unittest.TestCase):
    def setUp(self) -> None:
        self.assistant = ClinicianRagAssistant.from_json(DATA_PATH)

    def test_answers_from_approved_evidence_with_citations(self) -> None:
        answer = self.assistant.ask("SYN-001", "Summarize mobility and fall-risk concerns.")

        self.assertFalse(answer.refused)
        self.assertGreaterEqual(len(answer.citations), 1)
        cited_sections = {citation["section"] for citation in answer.citations}
        self.assertTrue({"mobility", "safety"} & cited_sections)

    def test_refuses_when_only_unapproved_evidence_matches(self) -> None:
        answer = self.assistant.ask("SYN-001", "Should we start insulin for this patient?")

        self.assertTrue(answer.refused)
        self.assertEqual(answer.citations, [])
        self.assertIn("cannot answer", answer.answer.lower())

    def test_unapproved_ocr_is_not_indexed(self) -> None:
        retrieved = self.assistant.retrieve("SYN-001", "insulin sliding scale", top_k=5)

        source_ids = {item.snippet.source_id for item in retrieved}
        self.assertNotIn("OCR-SYN001-RAW-INSULIN", source_ids)

    def test_generates_cited_poc_section(self) -> None:
        answer = self.assistant.generate_poc_section("SYN-001", "goals")

        self.assertFalse(answer.refused)
        self.assertGreaterEqual(len(answer.citations), 1)
        self.assertIn("Draft Plan of Care goals", answer.answer)

    def test_reports_missing_information_from_required_sections(self) -> None:
        answer = self.assistant.ask("SYN-001", "What information is missing before generating the POC?")

        self.assertFalse(answer.refused)
        self.assertIn("missing", answer.answer.lower())
        self.assertIn("allergies", answer.answer.lower())


if __name__ == "__main__":
    unittest.main()
