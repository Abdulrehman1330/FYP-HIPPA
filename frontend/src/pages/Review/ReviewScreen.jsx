import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar, StatusPill, ConfidenceBadge, SlideOver } from '../../components/ui';
import { DOCS as MOCK_DOCS, PATIENTS as MOCK_PATIENTS, fieldsFor, AUDIT_TRAIL } from '../../data';
import { reviewService } from '../../services';
import DocPreview from './DocPreview';
import FieldRow from './FieldRow';

const Stat = ({ label, value, tone = "ok" }) => (
  <div style={{ textAlign: "right" }}>
    <div className="eyebrow" style={{ fontSize: 10 }}>{label}</div>
    <div className="display" style={{ fontSize: 28, color: tone === "danger" ? "var(--danger)" : tone === "warn" ? "var(--warn)" : "var(--ink-1)", marginTop: 2 }}>{value}</div>
  </div>
);

const ReviewScreen = ({ goto, params, addToast }) => {
  const [queue, setQueue] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [auditOpen, setAuditOpen] = useState(false);
  const [fields, setFields] = useState([]);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(null);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load queue
  useEffect(() => {
    reviewService.getQueue()
      .then((result) => {
        const list = Array.isArray(result) ? result : result.queue || result.documents || [];
        if (list.length > 0) {
          setQueue(list);
          setSelectedId(params?.docId || list[0].documentId || list[0].id);
        } else {
          // Fallback to mock data
          setQueue(MOCK_DOCS);
          setSelectedId(params?.docId || MOCK_DOCS[0].id);
          setFields(fieldsFor());
        }
      })
      .catch(() => {
        setQueue(MOCK_DOCS);
        setSelectedId(params?.docId || MOCK_DOCS[0].id);
        setFields(fieldsFor());
      })
      .finally(() => setLoading(false));
  }, []);

  // Load review detail when selection changes
  useEffect(() => {
    if (!selectedId) return;
    // Check if it's a backend UUID or mock ID
    const isMockId = selectedId.startsWith('DOC-');

    if (isMockId) {
      setFields(fieldsFor());
      setReviewHistory(AUDIT_TRAIL);
      return;
    }

    reviewService.getReview(selectedId)
      .then((result) => {
        setReviewDetail(result);
        const f = result.fields || [];
        if (f.length > 0) {
          setFields(f.map(field => ({
            key: field.fieldName,
            label: field.fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            oasis: '',
            value: field.fieldValue || '',
            confidence: field.confidence || 0,
            section: categorizeField(field.fieldName),
            warn: field.validation?.warnings?.length ? field.validation.warnings[0] : (field.confidence < 0.6 ? 'Low confidence' : null),
            errors: field.validation?.errors || [],
          })));
        } else {
          setFields(fieldsFor());
        }
        setReviewHistory(result.reviewHistory || AUDIT_TRAIL);
      })
      .catch(() => {
        setFields(fieldsFor());
        setReviewHistory(AUDIT_TRAIL);
      });
  }, [selectedId]);

  // Build display-ready doc object
  const getSelectedDoc = () => {
    const qItem = queue.find(d => (d.documentId || d.id) === selectedId);
    if (!qItem) return MOCK_DOCS[0];
    // If it has mock shape, return directly
    if (qItem.filename && qItem.confAvg !== undefined) return qItem;
    // Backend shape
    return {
      id: qItem.documentId || qItem.id,
      filename: qItem.filename || 'Document',
      pages: qItem.pages || 1,
      status: qItem.status || 'EXTRACTED',
      uploadedBy: qItem.uploadedBy || 'Unknown',
      uploadedAt: qItem.uploadedAt || qItem.createdAt || new Date().toISOString(),
      confAvg: fields.length > 0 ? fields.reduce((a, f) => a + f.confidence, 0) / fields.length : 0,
      warnings: fields.filter(f => f.warn).length,
      errors: qItem.errorCount || 0,
      claimedBy: qItem.claimedBy || null,
      patientName: fields.find(f => f.key === 'patient_name')?.value || null,
    };
  };

  const selectedDoc = getSelectedDoc();
  const errorCount = fields.filter(f => f.confidence < 0.5).length;

  const filteredDocs = statusFilter === "all" ? queue : queue.filter(d => (d.status || '') === statusFilter);

  const updateField = (key, value) => setFields(prev => prev.map(x => x.key === key ? { ...x, value, confidence: 0.99, edited: true } : x));

  const claim = async () => {
    if (selectedId?.startsWith('DOC-')) return;
    setActionLoading(true);
    try {
      await reviewService.claim(selectedId);
      addToast({ kind: "ok", text: "Document claimed for review" });
    } catch (err) {
      addToast({ kind: "danger", text: err.response?.data?.error || "Could not claim" });
    }
    setActionLoading(false);
  };

  const approve = async () => {
    setActionLoading(true);
    if (selectedId?.startsWith('DOC-')) {
      addToast({ kind: "ok", text: `${selectedDoc.id} approved · POC generation queued` });
      setTimeout(() => goto("poc", { docId: selectedDoc.id }), 600);
      return;
    }
    try {
      // Collect edited fields
      const edits = {};
      fields.filter(f => f.edited).forEach(f => { edits[f.key] = f.value; });

      if (Object.keys(edits).length > 0) {
        await reviewService.editAndApprove(selectedId, edits, comment);
      } else {
        await reviewService.approve(selectedId, comment);
      }
      addToast({ kind: "ok", text: "Document approved · POC generation queued" });
      setTimeout(() => goto("poc", { docId: selectedId }), 600);
    } catch (err) {
      const msg = err.response?.data?.error || "Approval failed — check field validation";
      addToast({ kind: "danger", text: msg });
    }
    setActionLoading(false);
  };

  const reject = async () => {
    setActionLoading(true);
    if (selectedId?.startsWith('DOC-')) {
      addToast({ kind: "danger", text: `${selectedDoc.id} rejected — uploader notified` });
      setActionLoading(false);
      return;
    }
    try {
      await reviewService.reject(selectedId, comment || 'Rejected by reviewer');
      addToast({ kind: "danger", text: "Document rejected — uploader notified" });
    } catch (err) {
      addToast({ kind: "danger", text: err.response?.data?.error || "Rejection failed" });
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="fade-up" style={{ padding: 40, textAlign: "center" }}>
        <div className="muted">Loading review queue...</div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="crumb"><span onClick={() => goto("dashboard")} style={{ cursor: "pointer" }}>Workspace</span><Icon name="chev-r" size={12} /><span>Review</span></div>
          <h1>Review <em>queue</em>.</h1>
          <p>Validate extracted fields, edit anything below threshold, then approve to generate the plan of care.</p>
        </div>
        <div className="actions">
          <GradientButton size="sm" variant="ghost" icon="audit" onClick={() => setAuditOpen(true)}>Audit history</GradientButton>
          <GradientButton size="sm" variant="ghost" icon="x" onClick={reject} disabled={actionLoading}>Reject</GradientButton>
          <GradientButton size="sm" variant="primary" icon="check" onClick={approve} disabled={actionLoading}>
            {actionLoading ? "Processing..." : "Approve & generate POC"}
          </GradientButton>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14, height: "calc(100vh - 220px)", minHeight: 600 }}>
        {/* QUEUE LIST */}
        <GlassCard strong style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: 14, borderBottom: "1px solid var(--glass-border-soft)" }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Queue · {filteredDocs.length}</div>
            <div style={{ display: "flex", gap: 4, overflow: "auto" }}>
              {[["all", "All"], ["EXTRACTED", "Awaiting"], ["IN_REVIEW", "In review"], ["APPROVED", "Approved"]].map(([k, l]) => (
                <button key={k} onClick={() => setStatusFilter(k)} style={{
                  border: 0, padding: "4px 10px", borderRadius: 999,
                  background: statusFilter === k ? "var(--glass-bg-strong)" : "transparent",
                  color: statusFilter === k ? "var(--ink-1)" : "var(--ink-3)",
                  fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredDocs.map(d => {
              const dId = d.documentId || d.id;
              const isSel = dId === selectedId;
              const pName = d.patientName || MOCK_PATIENTS.find(x => x.id === d.patientId)?.name || 'Unknown';
              const avgConf = d.confAvg ?? null;
              return (
                <button key={dId} onClick={() => setSelectedId(dId)} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "12px 14px",
                  borderRadius: 0, border: 0,
                  borderLeft: isSel ? "3px solid var(--accent)" : "3px solid transparent",
                  borderBottom: "1px solid var(--glass-border-soft)",
                  background: isSel ? "var(--glass-bg-strong)" : "transparent",
                  cursor: "pointer", fontFamily: "inherit", color: "inherit",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{typeof dId === 'string' && dId.length > 12 ? dId.slice(0, 8) + '...' : dId}</span>
                    <StatusPill status={d.status} withDot={false} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }} className="clamp-1">{d.filename}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 11.5, color: "var(--ink-3)" }}>
                    <Avatar name={pName} size={18} /> {pName}
                  </div>
                  {avgConf !== null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                      <ConfidenceBadge value={avgConf} />
                      {(d.warnings || d.warningCount || 0) > 0 && <span className="pill pill--warn" style={{ height: 18, fontSize: 10 }}><Icon name="flag" size={10} />{d.warnings || d.warningCount}</span>}
                      {(d.errors || d.errorCount || 0) > 0 && <span className="pill pill--danger" style={{ height: 18, fontSize: 10 }}>{d.errors || d.errorCount} errors</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* DETAIL */}
        <GlassCard strong style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: "1px solid var(--glass-border-soft)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{typeof selectedDoc.id === 'string' && selectedDoc.id.length > 12 ? selectedDoc.id.slice(0, 8) + '...' : selectedDoc.id}</span>
                  <span style={{ color: "var(--ink-4)" }}>·</span>
                  <StatusPill status={selectedDoc.status} />
                  <span style={{ color: "var(--ink-4)" }}>·</span>
                  <span className="muted" style={{ fontSize: 12 }}>{selectedDoc.pages} pages</span>
                </div>
                <h3 className="display" style={{ fontSize: 28 }}>{selectedDoc.filename}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 8, fontSize: 12.5, color: "var(--ink-3)" }}>
                  {selectedDoc.patientName && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar name={selectedDoc.patientName} size={20} /> {selectedDoc.patientName}</span>}
                  <span>Uploaded by {selectedDoc.uploadedBy}</span>
                  {selectedDoc.claimedBy && <span><Icon name="claim" size={11} /> Claimed by {selectedDoc.claimedBy}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <Stat label="Avg confidence" value={`${Math.round((selectedDoc.confAvg || 0) * 100)}%`} />
                <Stat label="Warnings" value={selectedDoc.warnings || 0} tone={(selectedDoc.warnings || 0) > 2 ? "warn" : "ok"} />
                <Stat label="Errors" value={errorCount} tone={errorCount > 0 ? "danger" : "ok"} />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.05fr 1fr", overflow: "hidden" }}>
            <div style={{ background: "var(--glass-inner)", padding: 18, overflowY: "auto", borderRight: "1px solid var(--glass-border-soft)" }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Source · Page 1 of {selectedDoc.pages}</div>
              <DocPreview fields={fields} />
            </div>
            <div style={{ overflowY: "auto" }}>
              {[...new Set(fields.map(f => f.section))].map(section => (
                <div key={section}>
                  <div style={{ position: "sticky", top: 0, padding: "10px 18px", background: "var(--glass-bg-strong)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--glass-border-soft)", zIndex: 1 }}>
                    <div className="eyebrow">{section}</div>
                  </div>
                  {fields.filter(f => f.section === section).map(f => (
                    <FieldRow key={f.key} field={f} editing={editing === f.key} onEdit={() => setEditing(f.key)} onSave={(v) => { updateField(f.key, v); setEditing(null); }} onCancel={() => setEditing(null)} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 14, borderTop: "1px solid var(--glass-border-soft)", display: "flex", gap: 10, alignItems: "center", background: "var(--glass-inner)" }}>
            <Icon name="comment" size={14} style={{ color: "var(--ink-3)" }} />
            <input className="input" placeholder="Add a review comment (visible in audit trail)..." value={comment} onChange={(e) => setComment(e.target.value)} style={{ height: 32, background: "var(--glass-bg)" }} />
            <GradientButton size="sm" variant="ghost" disabled={!comment} onClick={() => { addToast({ kind: "info", text: "Comment added to audit trail" }); setComment(""); }}>Comment</GradientButton>
          </div>
        </GlassCard>
      </div>

      <SlideOver open={auditOpen} onClose={() => setAuditOpen(false)} title="Audit trail">
        <div className="muted" style={{ fontSize: 12, marginBottom: 16 }}>{selectedDoc.id} · {selectedDoc.filename}</div>
        {reviewHistory.map((e, i) => (
          <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 16 }}>
            <div style={{ width: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--glass-bg-strong)", border: "1px solid var(--glass-border-soft)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
                <Icon name={e.icon || "check"} size={12} />
              </div>
              {i < reviewHistory.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--glass-border-soft)", marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{e.actor || e.reviewer || 'System'}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{e.time || new Date(e.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{e.action}</div>
              {(e.meta || e.comments) && <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4, padding: "6px 10px", background: "var(--glass-inner)", borderRadius: 6 }}>{e.meta || e.comments}</div>}
            </div>
          </div>
        ))}
      </SlideOver>
    </div>
  );
};

function categorizeField(name) {
  const n = name.toLowerCase();
  if (['patient_name', 'date_of_birth', 'patient_id', 'soc_date', 'start_of_care', 'assessment_date', 'state', 'zip', 'admission'].some(k => n.includes(k))) return 'Administrative';
  if (['diagnosis', 'icd10', 'risk_hospitalization', 'dx'].some(k => n.includes(k))) return 'Clinical';
  if (['medication', 'allergy'].some(k => n.includes(k))) return 'Medications';
  if (['mobility', 'adl', 'functional'].some(k => n.includes(k))) return 'Functional';
  if (['living', 'situation'].some(k => n.includes(k))) return 'Living';
  if (['emergent', 'discharge', 'episode'].some(k => n.includes(k))) return 'Episode';
  return 'Other';
}

export default ReviewScreen;
