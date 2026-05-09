import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar, Sparkline, StatusPill, ConfidenceBadge } from '../../components/ui';
import { KPIS, ACTIVITY, DOCS as MOCK_DOCS, PATIENTS as MOCK_PATIENTS } from '../../data';
import { documentService } from '../../services';
import PatientDashboard from './PatientDashboard';

const Dashboard = ({ user, role, goto }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentService.list(1, 5)
      .then((result) => {
        const list = result.documents || result.data || result;
        if (Array.isArray(list) && list.length > 0) {
          setDocs(list);
        } else {
          setDocs(MOCK_DOCS.slice(0, 5));
        }
      })
      .catch(() => setDocs(MOCK_DOCS.slice(0, 5)))
      .finally(() => setLoading(false));
  }, []);

  if (role === "PATIENT") return <PatientDashboard user={user} goto={goto} />;

  // Adapt backend docs to display shape
  const displayDocs = docs.map(d => {
    // If it's already mock-shaped, return as-is
    if (d.patientId && d.confAvg !== undefined) return d;
    // Backend shape -> display shape
    return {
      id: d.id,
      filename: d.filename || 'Unknown',
      pages: d.pages || 1,
      status: d.status || 'UPLOADED',
      uploadedBy: d.user ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown',
      uploadedAt: d.createdAt || d.uploadedAt || new Date().toISOString(),
      confAvg: d.extractedFields?.length
        ? d.extractedFields.reduce((a, f) => a + (f.confidence || 0), 0) / d.extractedFields.length
        : null,
      patientName: d.extractedFields?.find(f => f.fieldName === 'patient_name')?.fieldValue || null,
    };
  });

  return (
    <div className="stagger">
      <div className="page-head">
        <div>
          <div className="crumb"><span>Workspace</span><Icon name="chev-r" size={12} /><span>Overview</span></div>
          <h1>Good morning, <em>{user.name.split(" ").slice(-1)[0]}</em>.</h1>
          <p>{role === "ADMIN" ? "System-wide overview of intake pipeline." : "You have documents awaiting review."}</p>
        </div>
        <div className="actions">
          <GradientButton icon="filter" size="sm" variant="ghost">Last 7 days</GradientButton>
          <GradientButton icon="upload" variant="primary" size="sm" onClick={() => goto("upload")}>Upload document</GradientButton>
        </div>
      </div>

      {/* KPI ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {KPIS.map((k) => (
          <GlassCard key={k.label} strong style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="eyebrow">{k.label}</div>
              <span className={`pill ${k.danger ? "pill--danger" : k.warn ? "pill--warn" : "pill--ok"}`} style={{ height: 18, fontSize: 10 }}>
                <Icon name={k.delta.startsWith("-") ? "trend-dn" : "trend-up"} size={10} />
                {k.delta}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8 }}>
              <div className="display" style={{ fontSize: 46, lineHeight: 1, color: "var(--ink-1)" }}>{k.value.toLocaleString()}</div>
              <Sparkline data={k.trend} stroke={k.danger ? "var(--danger)" : k.warn ? "var(--warn)" : "var(--accent)"} fill={k.danger ? "var(--danger-bg)" : k.warn ? "var(--warn-bg)" : "var(--accent-soft)"} w={90} h={36} />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="spacer" />

      {/* MAIN GRID - Queue + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
        <GlassCard strong style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--glass-border-soft)" }}>
            <div>
              <div className="eyebrow">Recent intake</div>
              <h3 className="display" style={{ fontSize: 24, marginTop: 2 }}>Documents <em>in flight</em></h3>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={() => goto("review")}>Open review queue <Icon name="arrow-r" size={12} /></button>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div className="muted">Loading documents...</div>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr><th>Document</th><th>Patient</th><th>Confidence</th><th>Status</th><th>Updated</th></tr>
              </thead>
              <tbody>
                {displayDocs.map(d => {
                  // Try to find patient from mock data if we have patientId (legacy), or use extracted name
                  const pName = d.patientName || MOCK_PATIENTS.find(pt => pt.id === d.patientId)?.name || '—';
                  return (
                    <tr key={d.id} onClick={() => goto("review", { docId: d.id })}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 40, borderRadius: 4, background: "linear-gradient(180deg, var(--glass-bg-strong), var(--glass-bg))", border: "1px solid var(--glass-border-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                            <Icon name="doc" size={14} style={{ color: "var(--ink-3)" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: "var(--ink-1)" }} className="clamp-1">{d.filename}</div>
                            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{typeof d.id === 'string' && d.id.length > 12 ? d.id.slice(0, 8) + '...' : d.id} · {d.pages} pp</div>
                          </div>
                        </div>
                      </td>
                      <td><div className="row"><Avatar name={pName} size={22} />{pName}</div></td>
                      <td>{d.confAvg !== null && d.confAvg !== undefined ? <ConfidenceBadge value={d.confAvg} /> : <span className="muted">—</span>}</td>
                      <td><StatusPill status={d.status} /></td>
                      <td className="muted">{new Date(d.uploadedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard strong style={{ padding: 18 }}>
            <div className="eyebrow">Quick actions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              {[
                { icon: "upload", label: "Upload", screen: "upload" },
                { icon: "review", label: "Review queue", screen: "review" },
                { icon: "poc", label: "Plan of Care", screen: "poc" },
                { icon: "risk", label: "Risk scoring", screen: "risk" },
              ].map(a => (
                <button key={a.label} onClick={() => goto(a.screen)} className="glass" style={{
                  padding: "12px 14px", border: "1px solid var(--glass-border-soft)",
                  background: "var(--glass-bg)", color: "var(--ink-1)", cursor: "pointer",
                  borderRadius: "var(--r-2)", display: "flex", alignItems: "center", gap: 10,
                  fontSize: 13, fontWeight: 500, fontFamily: "inherit", textAlign: "left",
                }}>
                  <Icon name={a.icon} size={16} style={{ color: "var(--accent)" }} />
                  {a.label}
                  <Icon name="arrow-r" size={12} style={{ marginLeft: "auto", color: "var(--ink-4)" }} />
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard strong style={{ padding: 18, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="eyebrow">Activity</div>
              <span className="pill pill--neutral" style={{ height: 18, fontSize: 10 }}>Live</span>
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column" }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < ACTIVITY.length - 1 ? "1px dashed var(--glass-border-soft)" : "none" }}>
                  <div style={{ flexShrink: 0, marginTop: 4 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: `var(--${a.kind === "ok" ? "ok" : a.kind === "danger" ? "danger" : a.kind === "warn" ? "warn" : "info"})`,
                      display: "block",
                      boxShadow: `0 0 0 3px var(--${a.kind === "ok" ? "ok-bg" : a.kind === "danger" ? "danger-bg" : a.kind === "warn" ? "warn-bg" : "info-bg"})`,
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "var(--ink-1)" }}><b style={{ fontWeight: 500 }}>{a.actor}</b> <span style={{ color: "var(--ink-3)" }}>{a.action}</span> <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{a.target}</span></div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{a.note} · {a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
