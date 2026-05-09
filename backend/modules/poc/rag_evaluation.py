"""Evaluation helpers for the clinician RAG assistant."""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
import sys
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.modules.poc.rag_assistant import ClinicianRagAssistant

DEFAULT_EVIDENCE_PATH = REPO_ROOT / "data" / "synthetic" / "rag_evidence_demo.json"
DEFAULT_EVAL_PATH = REPO_ROOT / "data" / "synthetic" / "rag_eval_questions.json"


@dataclass(frozen=True)
class RagEvaluationCase:
    case_id: str
    patient_id: str
    question: str
    expected_source_ids: frozenset[str]
    expect_refused: bool

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "RagEvaluationCase":
        return cls(
            case_id=str(raw["case_id"]),
            patient_id=str(raw["patient_id"]),
            question=str(raw["question"]),
            expected_source_ids=frozenset(str(item) for item in raw.get("expected_source_ids", [])),
            expect_refused=bool(raw.get("expect_refused", False)),
        )


def load_eval_cases(path: str | Path = DEFAULT_EVAL_PATH) -> list[RagEvaluationCase]:
    with Path(path).open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    return [RagEvaluationCase.from_dict(raw) for raw in payload["cases"]]


def evaluate_assistant(
    assistant: ClinicianRagAssistant,
    cases: list[RagEvaluationCase],
) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    citation_coverages: list[float] = []
    refusal_matches = 0

    for case in cases:
        answer = assistant.ask(case.patient_id, case.question)
        returned_source_ids = {
            str(citation["source_id"])
            for citation in answer.citations
            if "source_id" in citation
        }

        if case.expected_source_ids:
            matched = returned_source_ids & case.expected_source_ids
            citation_coverage = len(matched) / len(case.expected_source_ids)
            citation_coverages.append(citation_coverage)
        else:
            matched = set()
            citation_coverage = 1.0 if answer.refused else 0.0

        refusal_match = answer.refused == case.expect_refused
        if refusal_match:
            refusal_matches += 1

        results.append(
            {
                "case_id": case.case_id,
                "question": case.question,
                "expected_refused": case.expect_refused,
                "actual_refused": answer.refused,
                "refusal_match": refusal_match,
                "expected_source_ids": sorted(case.expected_source_ids),
                "returned_source_ids": sorted(returned_source_ids),
                "matched_source_ids": sorted(matched),
                "citation_coverage": round(citation_coverage, 3),
            }
        )

    supported_cases = len(citation_coverages)
    average_citation_coverage = (
        sum(citation_coverages) / supported_cases
        if supported_cases
        else 0.0
    )
    return {
        "case_count": len(cases),
        "supported_case_count": supported_cases,
        "average_citation_coverage": round(average_citation_coverage, 3),
        "refusal_accuracy": round(refusal_matches / len(cases), 3) if cases else 0.0,
        "results": results,
    }


def run_default_evaluation() -> dict[str, Any]:
    assistant = ClinicianRagAssistant.from_json(DEFAULT_EVIDENCE_PATH)
    cases = load_eval_cases(DEFAULT_EVAL_PATH)
    return evaluate_assistant(assistant, cases)


if __name__ == "__main__":
    print(json.dumps(run_default_evaluation(), indent=2))
