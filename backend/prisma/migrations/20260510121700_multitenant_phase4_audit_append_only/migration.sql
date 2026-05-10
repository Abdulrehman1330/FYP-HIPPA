-- Phase 4: Make audit_logs append-only.
-- HIPAA §164.312(b) requires immutable audit records. We enforce this at
-- the database level (defence in depth — even an admin SQL session can't
-- tamper with audit history through normal DML).

BEGIN;

-- Function that raises an exception on any UPDATE or DELETE attempt
CREATE OR REPLACE FUNCTION audit_logs_append_only_guard()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only — % is not permitted on this table', TG_OP
    USING HINT = 'Audit records cannot be modified or removed. Insert a corrective row instead.';
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if re-running
DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;
DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;

-- Block UPDATE
CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION audit_logs_append_only_guard();

-- Block DELETE
CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION audit_logs_append_only_guard();

COMMIT;
