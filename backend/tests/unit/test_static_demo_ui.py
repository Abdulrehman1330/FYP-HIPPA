from pathlib import Path
import unittest


UI_PATH = (
    Path(__file__).resolve().parents[3]
    / "apps"
    / "clinician-web"
    / "public"
    / "rag-chatbot-demo.html"
)


class StaticDemoUiTests(unittest.TestCase):
    def test_demo_ui_escapes_backend_content_before_rendering(self) -> None:
        html = UI_PATH.read_text(encoding="utf-8")

        self.assertIn("function escapeHtml", html)
        self.assertIn("escapeHtml(payload.answer)", html)
        self.assertIn("escapeHtml(citation.snippet)", html)
        self.assertIn("escapeHtml(error.message)", html)


if __name__ == "__main__":
    unittest.main()
