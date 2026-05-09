import unittest

from backend.api.app.rag_service import answer_clinician_question, generate_cited_poc_section


class RagServiceTests(unittest.TestCase):
    def test_question_service_returns_serializable_answer(self) -> None:
        result = answer_clinician_question(
            "SYN-001",
            "Summarize mobility and fall-risk concerns.",
            audit=False,
        )

        self.assertFalse(result["refused"])
        self.assertGreaterEqual(len(result["citations"]), 1)
        self.assertIn("answer", result)

    def test_poc_section_service_returns_serializable_answer(self) -> None:
        result = generate_cited_poc_section("SYN-001", "goals", audit=False)

        self.assertFalse(result["refused"])
        self.assertEqual(result["question_type"], "poc_section")
        self.assertGreaterEqual(len(result["citations"]), 1)


if __name__ == "__main__":
    unittest.main()
