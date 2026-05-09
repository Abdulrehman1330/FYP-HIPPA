"""Clinician-facing RAG assistant for approved OASIS/POC evidence.

The first semester implementation intentionally uses a local TF-IDF retriever
and deterministic answer templates. This keeps the prototype free to run,
easy to explain, and safer than allowing an LLM to answer from memory.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from math import log, sqrt
import json
import re
from pathlib import Path
from typing import Any, Iterable


STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "before",
    "can",
    "do",
    "for",
    "from",
    "generate",
    "give",
    "has",
    "have",
    "how",
    "in",
    "is",
    "of",
    "on",
    "or",
    "patient",
    "please",
    "should",
    "show",
    "summarize",
    "tell",
    "the",
    "this",
    "to",
    "use",
    "we",
    "what",
    "which",
    "with",
}


SECTION_KEYWORDS = {
    "diagnosis": {"diagnosis", "condition", "problem", "chf", "heart", "hypertension"},
    "hospitalization": {"hospital", "hospitalization", "readmission", "discharge"},
    "mobility": {"mobility", "ambulation", "walker", "transfer", "gait", "balance"},
    "safety": {"fall", "falls", "safety", "risk", "hazard", "home"},
    "medications": {"medication", "medications", "medicine", "reconciliation", "adherence"},
    "wound": {"wound", "pressure", "ulcer", "skin"},
    "goals": {"goal", "goals", "outcome", "target"},
    "interventions": {"intervention", "interventions", "care", "education", "monitoring"},
    "allergies": {"allergy", "allergies"},
    "vitals": {"vital", "vitals", "blood", "pressure", "weight", "oxygen"},
}


REQUIRED_POC_SECTIONS = {
    "diagnosis",
    "mobility",
    "safety",
    "medications",
    "interventions",
    "goals",
    "allergies",
    "vitals",
}


@dataclass(frozen=True)
class EvidenceSnippet:
    """Approved clinical evidence that can be retrieved by the assistant."""

    source_id: str
    patient_id: str
    section: str
    text: str
    approved: bool = True
    source_type: str = "approved_review"
    metadata: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "EvidenceSnippet":
        return cls(
            source_id=str(raw["source_id"]),
            patient_id=str(raw["patient_id"]),
            section=str(raw["section"]),
            text=str(raw["text"]),
            approved=bool(raw.get("approved", True)),
            source_type=str(raw.get("source_type", "approved_review")),
            metadata=dict(raw.get("metadata", {})),
        )


@dataclass(frozen=True)
class RetrievedEvidence:
    """Evidence returned by the retriever with a similarity score."""

    snippet: EvidenceSnippet
    score: float

    def to_dict(self) -> dict[str, Any]:
        return {
            "source_id": self.snippet.source_id,
            "patient_id": self.snippet.patient_id,
            "section": self.snippet.section,
            "snippet": self.snippet.text,
            "score": round(self.score, 4),
            "source_type": self.snippet.source_type,
            "metadata": self.snippet.metadata,
        }


@dataclass(frozen=True)
class RagAnswer:
    """Assistant response with citations and refusal status."""

    question: str
    answer: str
    citations: list[dict[str, Any]]
    refused: bool
    reason: str | None = None
    confidence: str = "low"
    question_type: str = "general"

    def to_dict(self) -> dict[str, Any]:
        return {
            "question": self.question,
            "answer": self.answer,
            "citations": self.citations,
            "refused": self.refused,
            "reason": self.reason,
            "confidence": self.confidence,
            "question_type": self.question_type,
        }


class ClinicianRagAssistant:
    """Small RAG pipeline for clinician questions over approved evidence only."""

    def __init__(
        self,
        evidence: Iterable[EvidenceSnippet | dict[str, Any]],
        *,
        min_score: float = 0.08,
        top_k: int = 4,
    ) -> None:
        snippets = [
            item if isinstance(item, EvidenceSnippet) else EvidenceSnippet.from_dict(item)
            for item in evidence
        ]
        self.evidence = [snippet for snippet in snippets if snippet.approved]
        self.min_score = min_score
        self.top_k = top_k
        self._doc_tokens = [self._tokenize(self._search_text(snippet)) for snippet in self.evidence]
        self._idf = self._build_idf(self._doc_tokens)
        self._doc_vectors = [self._tfidf(tokens) for tokens in self._doc_tokens]

    @classmethod
    def from_json(cls, path: str | Path, **kwargs: Any) -> "ClinicianRagAssistant":
        with Path(path).open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        return cls(payload["evidence"], **kwargs)

    def ask(self, patient_id: str, question: str, *, top_k: int | None = None) -> RagAnswer:
        question_type = self._classify_question(question)

        if question_type == "missing_info":
            return self._answer_missing_information(patient_id, question)

        retrieved = self.retrieve(patient_id, self._query_for_question(question, question_type), top_k=top_k)
        if not retrieved or retrieved[0].score < self.min_score:
            return self._refuse(question, "No approved evidence was strong enough to answer safely.")

        if question_type == "poc_goal":
            return self._answer_poc_goal(question, retrieved)
        if question_type == "care_problems":
            return self._answer_care_problems(question, retrieved)
        if question_type == "mobility_safety":
            return self._answer_mobility_safety(question, retrieved)
        if question_type == "evidence_support":
            return self._answer_evidence_support(question, retrieved)

        return self._answer_general(question, retrieved)

    def retrieve(self, patient_id: str, question: str, *, top_k: int | None = None) -> list[RetrievedEvidence]:
        query_vector = self._tfidf(self._tokenize(question))
        if not query_vector:
            return []

        matches: list[RetrievedEvidence] = []
        for snippet, vector in zip(self.evidence, self._doc_vectors):
            if snippet.patient_id != patient_id:
                continue
            score = self._cosine_similarity(query_vector, vector)
            if score > 0:
                matches.append(RetrievedEvidence(snippet=snippet, score=score))

        matches.sort(key=lambda match: match.score, reverse=True)
        return matches[: top_k or self.top_k]

    def generate_poc_section(self, patient_id: str, section: str) -> RagAnswer:
        section_name = section.strip().lower()
        query_by_section = {
            "goals": "Plan of Care goals outcomes mobility safety medication wound",
            "interventions": "Plan of Care interventions education monitoring fall prevention medication",
            "safety": "home safety fall risk mobility hazards supervision",
            "summary": "main care problems diagnosis mobility medication safety wound",
        }
        query = query_by_section.get(section_name, section_name)
        retrieved = self.retrieve(patient_id, query, top_k=5)

        if not retrieved or retrieved[0].score < self.min_score:
            return self._refuse(
                f"Generate Plan of Care {section_name} section",
                f"Approved evidence is insufficient to draft the {section_name} section.",
                question_type="poc_section",
            )

        evidence_sections = {item.snippet.section.lower() for item in retrieved}
        citations = self._citations(retrieved)

        if section_name == "goals":
            answer = (
                "Draft Plan of Care goals based on approved evidence: "
                "1) Improve safe mobility and reduce fall risk through supervised transfers, "
                "walker use, and home-safety education. "
                "2) Support medication reconciliation and adherence through clinician review and patient education."
            )
        elif section_name == "interventions":
            answer = (
                "Draft interventions: perform fall-risk teaching, assess transfer safety each visit, "
                "review medication list and adherence barriers, monitor cardiopulmonary symptoms, "
                "and escalate unresolved safety or medication concerns to the supervising clinician."
            )
        elif section_name == "safety":
            answer = (
                "Draft safety notes: patient has documented mobility limitations and fall-risk concerns. "
                "The care plan should include assistive-device use, environmental hazard review, "
                "and clinician verification before independent ambulation is encouraged."
            )
        else:
            ordered = self._format_evidence_bullets(retrieved)
            answer = f"Draft summary from approved evidence: {ordered}"

        if "diagnosis" not in evidence_sections and section_name in {"goals", "interventions", "summary"}:
            answer += " Diagnosis-specific wording should be verified because diagnosis evidence was not in the top retrieved set."

        return RagAnswer(
            question=f"Generate Plan of Care {section_name} section",
            answer=answer,
            citations=citations,
            refused=False,
            confidence=self._confidence(retrieved),
            question_type="poc_section",
        )

    def _answer_care_problems(self, question: str, retrieved: list[RetrievedEvidence]) -> RagAnswer:
        return RagAnswer(
            question=question,
            answer=(
                "The main care problems supported by approved evidence are: "
                f"{self._format_evidence_bullets(retrieved)}"
            ),
            citations=self._citations(retrieved),
            refused=False,
            confidence=self._confidence(retrieved),
            question_type="care_problems",
        )

    def _answer_poc_goal(self, question: str, retrieved: list[RetrievedEvidence]) -> RagAnswer:
        return RagAnswer(
            question=question,
            answer=(
                "Cited draft goal: Patient will improve safety and functional stability by following "
                "clinician-approved mobility, medication, and home-safety instructions during the care episode. "
                "The goal must be reviewed by a licensed clinician before use."
            ),
            citations=self._citations(retrieved),
            refused=False,
            confidence=self._confidence(retrieved),
            question_type="poc_goal",
        )

    def _answer_mobility_safety(self, question: str, retrieved: list[RetrievedEvidence]) -> RagAnswer:
        filtered = [
            item
            for item in retrieved
            if item.snippet.section.lower() in {"mobility", "safety", "hospitalization"}
        ] or retrieved
        return RagAnswer(
            question=question,
            answer=(
                "Mobility and fall-risk summary from approved evidence: "
                f"{self._format_evidence_bullets(filtered)}"
            ),
            citations=self._citations(filtered),
            refused=False,
            confidence=self._confidence(filtered),
            question_type="mobility_safety",
        )

    def _answer_evidence_support(self, question: str, retrieved: list[RetrievedEvidence]) -> RagAnswer:
        return RagAnswer(
            question=question,
            answer=(
                "The following approved evidence supports the requested intervention or care decision: "
                f"{self._format_evidence_bullets(retrieved)}"
            ),
            citations=self._citations(retrieved),
            refused=False,
            confidence=self._confidence(retrieved),
            question_type="evidence_support",
        )

    def _answer_general(self, question: str, retrieved: list[RetrievedEvidence]) -> RagAnswer:
        return RagAnswer(
            question=question,
            answer=(
                "Based only on approved evidence, the safest answer is: "
                f"{self._format_evidence_bullets(retrieved)}"
            ),
            citations=self._citations(retrieved),
            refused=False,
            confidence=self._confidence(retrieved),
            question_type="general",
        )

    def _answer_missing_information(self, patient_id: str, question: str) -> RagAnswer:
        present = {
            self._canonical_section(snippet.section)
            for snippet in self.evidence
            if snippet.patient_id == patient_id
        }
        missing = sorted(REQUIRED_POC_SECTIONS - present)
        retrieved = self.retrieve(
            patient_id,
            "diagnosis mobility safety medications goals interventions vitals allergies",
            top_k=4,
        )

        if not present:
            return self._refuse(question, "No approved evidence exists for this patient.")

        if missing:
            answer = (
                "Before generating a complete Plan of Care, the missing or weak evidence areas are: "
                f"{', '.join(missing)}. Existing approved evidence is available for: "
                f"{', '.join(sorted(present))}."
            )
        else:
            answer = "The required evidence categories are present, but clinician review is still required before approval."

        return RagAnswer(
            question=question,
            answer=answer,
            citations=self._citations(retrieved),
            refused=False,
            confidence="medium" if retrieved else "low",
            question_type="missing_info",
        )

    def _refuse(self, question: str, reason: str, *, question_type: str = "unsupported") -> RagAnswer:
        return RagAnswer(
            question=question,
            answer=(
                "I cannot answer this from the approved OASIS/POC evidence. "
                "A clinician should add or approve supporting evidence before this is used."
            ),
            citations=[],
            refused=True,
            reason=reason,
            confidence="low",
            question_type=question_type,
        )

    def _classify_question(self, question: str) -> str:
        normalized = " ".join(self._tokenize(question))
        if any(term in normalized for term in ("missing", "incomplete", "needed")):
            return "missing_info"
        if "goal" in normalized or "poc" in normalized or "plan care" in normalized:
            return "poc_goal"
        if "main care problem" in normalized or "care problem" in normalized:
            return "care_problems"
        if "evidence" in normalized or "support" in normalized or "intervention" in normalized:
            return "evidence_support"
        if "mobility" in normalized or "fall" in normalized or "safety" in normalized:
            return "mobility_safety"
        return "general"

    def _query_for_question(self, question: str, question_type: str) -> str:
        expansions = {
            "care_problems": "diagnosis hospitalization mobility safety medications wound interventions goals",
            "poc_goal": "goals mobility safety medications interventions diagnosis",
            "mobility_safety": "mobility fall safety walker ambulation transfer balance",
            "evidence_support": f"{question} fall prevention intervention safety mobility medication",
        }
        return expansions.get(question_type, question)

    def _citations(self, retrieved: list[RetrievedEvidence]) -> list[dict[str, Any]]:
        return [item.to_dict() for item in retrieved]

    def _format_evidence_bullets(self, retrieved: list[RetrievedEvidence]) -> str:
        unique: list[str] = []
        seen: set[str] = set()
        for item in retrieved:
            key = item.snippet.source_id
            if key in seen:
                continue
            seen.add(key)
            unique.append(f"[{item.snippet.source_id}] {item.snippet.text}")
        return " ".join(unique)

    def _canonical_section(self, section: str) -> str:
        normalized = section.strip().lower()
        if normalized in REQUIRED_POC_SECTIONS:
            return normalized
        tokens = set(self._tokenize(normalized))
        for canonical, keywords in SECTION_KEYWORDS.items():
            if tokens & keywords:
                return canonical
        return normalized

    def _confidence(self, retrieved: list[RetrievedEvidence]) -> str:
        if not retrieved:
            return "low"
        if retrieved[0].score >= 0.35 and len(retrieved) >= 2:
            return "high"
        if retrieved[0].score >= self.min_score:
            return "medium"
        return "low"

    def _search_text(self, snippet: EvidenceSnippet) -> str:
        return f"{snippet.section} {snippet.text}"

    def _tokenize(self, text: str) -> list[str]:
        return [
            token
            for token in re.findall(r"[a-z0-9]+", text.lower())
            if token not in STOPWORDS and len(token) > 1
        ]

    def _build_idf(self, tokenized_docs: list[list[str]]) -> dict[str, float]:
        doc_count = len(tokenized_docs)
        document_frequency: dict[str, int] = {}
        for tokens in tokenized_docs:
            for token in set(tokens):
                document_frequency[token] = document_frequency.get(token, 0) + 1
        return {
            token: log((1 + doc_count) / (1 + frequency)) + 1
            for token, frequency in document_frequency.items()
        }

    def _tfidf(self, tokens: list[str]) -> dict[str, float]:
        if not tokens:
            return {}
        term_frequency: dict[str, int] = {}
        for token in tokens:
            term_frequency[token] = term_frequency.get(token, 0) + 1
        total = len(tokens)
        return {
            token: (count / total) * self._idf.get(token, 1.0)
            for token, count in term_frequency.items()
        }

    def _cosine_similarity(self, left: dict[str, float], right: dict[str, float]) -> float:
        shared = set(left) & set(right)
        if not shared:
            return 0.0

        numerator = sum(left[token] * right[token] for token in shared)
        left_norm = sqrt(sum(value * value for value in left.values()))
        right_norm = sqrt(sum(value * value for value in right.values()))
        if not left_norm or not right_norm:
            return 0.0
        return numerator / (left_norm * right_norm)
