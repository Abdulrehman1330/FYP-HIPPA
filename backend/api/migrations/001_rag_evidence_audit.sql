-- RAG evidence and audit tables for the clinician assistant.
-- Intended for PostgreSQL. Run after the base patient/document/review tables exist.

CREATE TABLE IF NOT EXISTS rag_evidence_snippets (
    id UUID PRIMARY KEY,
    source_id TEXT NOT NULL UNIQUE,
    patient_id UUID NOT NULL,
    document_id UUID,
    review_id UUID,
    source_type TEXT NOT NULL,
    section TEXT NOT NULL,
    text TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_evidence_patient_approved
ON rag_evidence_snippets (patient_id, approved);

CREATE INDEX IF NOT EXISTS idx_rag_evidence_section
ON rag_evidence_snippets (section);

CREATE INDEX IF NOT EXISTS idx_rag_evidence_metadata
ON rag_evidence_snippets USING GIN (metadata);

CREATE TABLE IF NOT EXISTS rag_audit_events (
    event_id UUID PRIMARY KEY,
    timestamp_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    action TEXT NOT NULL,
    question TEXT NOT NULL,
    refused BOOLEAN NOT NULL,
    source_ids TEXT[] NOT NULL DEFAULT '{}',
    confidence TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_audit_patient_time
ON rag_audit_events (patient_id, timestamp_utc DESC);

CREATE INDEX IF NOT EXISTS idx_rag_audit_user_time
ON rag_audit_events (user_id, timestamp_utc DESC);

CREATE INDEX IF NOT EXISTS idx_rag_audit_refused
ON rag_audit_events (refused);
