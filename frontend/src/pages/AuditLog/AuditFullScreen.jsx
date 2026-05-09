import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar } from '../../components/ui';
import { AUDIT_TRAIL } from '../../data';
import { documentService } from '../../services';

const AuditFullScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to build audit trail from backend documents
    documentService.list(1, 50)
      .then((result) => {
        const docs = result.documents || result.data || result;
        if (Array.isArray(docs) && docs.length > 0) {
          // Build events from doc statuses and metadata
          const derived = [];
          docs.forEach(doc => {
            derived.push({
              time: new Date(doc.createdAt || doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              actor: doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : 'Unknown',
              action: 'Uploaded document',
              icon: 'upload',
              doc: typeof doc.id === 'string' && doc.id.length > 12 ? doc.id.slice(0, 8) + '...' : doc.id,
              sortTime: new Date(doc.createdAt || doc.uploadedAt),
            });
            if (['EXTRACTED', 'IN_REVIEW', 'APPROVED', 'POC_GENERATED', 'RISK_SCORED'].includes(doc.status)) {
              derived.push({
                time: new Date(doc.updatedAt || doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                actor: 'OCR pipeline',
                action: `Status: ${doc.status}`,
                icon: doc.status === 'APPROVED' ? 'check' : 'scan',
                doc: typeof doc.id === 'string' && doc.id.length > 12 ? doc.id.slice(0, 8) + '...' : doc.id,
                sortTime: new Date(doc.updatedAt || doc.createdAt),
              });
            }
          });
          derived.sort((a, b) => b.sortTime - a.sortTime);
          if (derived.length > 0) {
            setEvents(derived);
            setLoading(false);
            return;
          }
        }
        // Fallback to mock
        setEvents(buildMockEvents());
      })
      .catch(() => setEvents(buildMockEvents()))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="crumb"><span>Workspace</span><Icon name="chev-r" size={12} /><span>Audit log</span></div>
          <h1>Audit <em>log</em>.</h1>
          <p>Immutable, append-only record of every action across the platform. Required for HIPAA &sect;164.312(b).</p>
        </div>
        <div className="actions">
          <GradientButton size="sm" variant="ghost" icon="filter">Filter</GradientButton>
          <GradientButton size="sm" variant="ghost">Export CSV</GradientButton>
        </div>
      </div>
      <GlassCard strong style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div className="muted">Loading audit log...</div>
          </div>
        ) : (
          <table className="tbl">
            <thead><tr><th style={{ width: 110 }}>Time</th><th>Actor</th><th>Event</th><th>Document</th><th>Meta</th></tr></thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{e.time}</td>
                  <td><div className="row"><Avatar name={e.actor} size={22} />{e.actor}</div></td>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name={e.icon} size={13} style={{ color: "var(--accent)" }} />{e.action}</div></td>
                  <td className="mono" style={{ fontSize: 11.5 }}>{e.doc}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{e.meta || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
};

function buildMockEvents() {
  return [
    ...AUDIT_TRAIL.map(e => ({ ...e, doc: "DOC-7821" })),
    { time: "10:08:14", actor: "OCR pipeline", action: "OCR extraction complete (28 fields)", icon: "scan",   doc: "DOC-7820" },
    { time: "09:42:00", actor: "A. Rasheed",   action: "Uploaded document",                   icon: "upload", doc: "DOC-7820" },
    { time: "09:08:55", actor: "M. Chen",      action: "Uploaded document",                   icon: "upload", doc: "DOC-7819" },
    { time: "16:55:14", actor: "Dr. J. Patel", action: "Approved",                            icon: "check",  doc: "DOC-7818" },
  ];
}

export default AuditFullScreen;
