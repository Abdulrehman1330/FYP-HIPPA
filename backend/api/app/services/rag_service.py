import os

from openai import OpenAI

OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

POC_SECTIONS = [
    "patient_summary",
    "problems",
    "goals",
    "interventions",
    "medication_management",
    "safety_concerns",
    "follow_up",
]


def build_evidence_context(fields: list[dict]) -> str:
    lines = []
    for i, f in enumerate(fields, 1):
        if f.get("field_value"):
            lines.append(f"{i}. {f['field_name']}: {f['field_value']}")
    return "\n".join(lines)


def generate_section(section_name: str, evidence: str) -> dict:
    if not OPENAI_KEY:
        return {
            "section": section_name,
            "content": f"[Stub] Draft {section_name} section — configure OPENAI_API_KEY to enable AI generation.",
            "citations": [],
            "sufficient_evidence": False,
        }

    client = OpenAI(api_key=OPENAI_KEY)

    prompt = f"""You are a clinical documentation assistant. Generate a {section_name} section for a Plan of Care.

EVIDENCE (use ONLY this information):
{evidence}

RULES:
- Use only the evidence above
- Add citation numbers [1], [2] after each statement
- If evidence is insufficient, state that clearly
- Be concise and clinically accurate
- Use professional medical language

Generate the {section_name} section:"""

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are a clinical documentation assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=500,
    )

    text = response.choices[0].message.content or ""
    has_evidence = "insufficient" not in text.lower()

    return {
        "section": section_name,
        "content": text,
        "citations": [f["field_name"] for f in fields if f.get("field_value")],
        "sufficient_evidence": has_evidence,
    }


def generate_full_poc(fields: list[dict]) -> dict:
    evidence = build_evidence_context(fields)
    sections = {}

    for section in POC_SECTIONS:
        sections[section] = generate_section(section, evidence)

    insufficient = sum(1 for s in sections.values() if not s["sufficient_evidence"])

    return {
        "sections": sections,
        "total_sections": len(POC_SECTIONS),
        "insufficient_count": insufficient,
    }
