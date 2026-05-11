import unittest

from backend.modules.poc.rag_evaluation import run_default_evaluation


class RagEvaluationTests(unittest.TestCase):
    def test_default_evaluation_reports_metrics(self) -> None:
        result = run_default_evaluation()

        self.assertEqual(result["case_count"], 4)
        self.assertGreaterEqual(result["average_citation_coverage"], 0.7)
        self.assertEqual(result["refusal_accuracy"], 1.0)


if __name__ == "__main__":
    unittest.main()
