from pydantic import BaseModel


class POCSectionResponse(BaseModel):
    section: str
    content: str
    citations: list[str]
    sufficient_evidence: bool


class POCResponse(BaseModel):
    document_id: int
    status: str
    sections: dict[str, POCSectionResponse]
    total_sections: int
    insufficient_count: int


class POCApproveRequest(BaseModel):
    edits: dict[str, str] | None = None
