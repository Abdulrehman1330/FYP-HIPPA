"""Command-line demo for Abdul's clinician RAG assistant."""

from __future__ import annotations

from pathlib import Path
import sys


REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.modules.poc.rag_assistant import ClinicianRagAssistant


DATA_PATH = REPO_ROOT / "data" / "synthetic" / "rag_evidence_demo.json"


DEMO_QUESTIONS = [
    "What are this patient's main care problems?",
    "Generate a Plan of Care goal from the approved OASIS fields.",
    "Which evidence supports fall-prevention intervention?",
    "Summarize mobility and fall-risk concerns.",
    "Should we start insulin for this patient?",
]


def run_demo() -> None:
    assistant = ClinicianRagAssistant.from_json(DATA_PATH)

    print("Clinician RAG Assistant Demo")
    print(f"Evidence file: {DATA_PATH}")
    print("Patient: SYN-001")
    print()

    for index, question in enumerate(DEMO_QUESTIONS, start=1):
        answer = assistant.ask("SYN-001", question)
        print(f"{index}. Question: {question}")
        print(f"Answer: {answer.answer}")
        print(f"Refused: {answer.refused}")
        print(f"Confidence: {answer.confidence}")
        if answer.reason:
            print(f"Reason: {answer.reason}")
        if answer.citations:
            print("Citations:")
            for citation in answer.citations:
                print(
                    f"  - {citation['source_id']} "
                    f"({citation['section']}, score={citation['score']}): "
                    f"{citation['snippet']}"
                )
        print()


if __name__ == "__main__":
    run_demo()
