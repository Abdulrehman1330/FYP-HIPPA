import unittest

from fastapi.testclient import TestClient

from backend.api.app.main import app


class RagApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)
        self.headers = {
            "X-User-Id": "demo-clinician-1",
            "X-Role": "clinician",
            "X-Patient-Ids": "SYN-001",
        }
        self.reviewer_headers = {
            "X-User-Id": "demo-reviewer-1",
            "X-Role": "reviewer",
            "X-Patient-Ids": "SYN-001",
        }

    def test_health_check(self) -> None:
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_question_endpoint_returns_cited_answer(self) -> None:
        response = self.client.post(
            "/rag/question",
            headers=self.headers,
            json={
                "patient_id": "SYN-001",
                "question": "Summarize mobility and fall-risk concerns.",
            },
        )

        payload = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertFalse(payload["refused"])
        self.assertGreaterEqual(len(payload["citations"]), 1)
        self.assertIn("audit_event_id", payload)

    def test_question_endpoint_refuses_unsupported_question(self) -> None:
        response = self.client.post(
            "/rag/question",
            headers=self.headers,
            json={
                "patient_id": "SYN-001",
                "question": "Should we start insulin for this patient?",
            },
        )

        payload = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(payload["refused"])
        self.assertEqual(payload["citations"], [])

    def test_poc_section_endpoint_returns_draft(self) -> None:
        response = self.client.post(
            "/rag/poc-section",
            headers=self.headers,
            json={
                "patient_id": "SYN-001",
                "section": "goals",
            },
        )

        payload = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertFalse(payload["refused"])
        self.assertEqual(payload["question_type"], "poc_section")

    def test_question_endpoint_requires_clinician_identity(self) -> None:
        response = self.client.post(
            "/rag/question",
            json={
                "patient_id": "SYN-001",
                "question": "Summarize mobility and fall-risk concerns.",
            },
        )

        self.assertEqual(response.status_code, 401)

    def test_question_endpoint_rejects_wrong_patient_access(self) -> None:
        response = self.client.post(
            "/rag/question",
            headers={
                "X-User-Id": "demo-clinician-2",
                "X-Role": "clinician",
                "X-Patient-Ids": "SYN-002",
            },
            json={
                "patient_id": "SYN-001",
                "question": "Summarize mobility and fall-risk concerns.",
            },
        )

        self.assertEqual(response.status_code, 403)

    def test_audit_endpoint_allows_reviewer(self) -> None:
        self.client.post(
            "/rag/question",
            headers=self.headers,
            json={
                "patient_id": "SYN-001",
                "question": "Summarize mobility and fall-risk concerns.",
            },
        )

        response = self.client.get("/rag/audit/recent?limit=5", headers=self.reviewer_headers)

        self.assertEqual(response.status_code, 200)
        self.assertIn("events", response.json())

    def test_audit_endpoint_rejects_clinician(self) -> None:
        response = self.client.get("/rag/audit/recent?limit=5", headers=self.headers)

        self.assertEqual(response.status_code, 403)


if __name__ == "__main__":
    unittest.main()
