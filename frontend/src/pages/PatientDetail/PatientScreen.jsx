import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar, ConfidenceBadge, StatusPill, Sparkline } from '../../components/ui';
import { PATIENTS as MOCK_PATIENTS, DOCS as MOCK_DOCS, AUDIT_TRAIL, fieldsFor } from '../../data';
import { documentService } from '../../services';
import { PocScreen } from '../PlanOfCare';
import { RiskScreen } from '../RiskScoring';

const PatientScreen = ({ goto, params, role }) => {
  const [tab, setTab] = useState("overview");
  const [patient, setPatient] = useState(null);
  const [docs, setDocs] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pid = params?.patientId;

    // First try mock data
    const mockPatient = MOCK_PATIENTS.find(p => p.id === pid);
    if (mockPatient) {
      setPatient(mockPatient);
      setDocs(MOCK_DOCS.filter(d => d.patientId === pid));
      setFields(fieldsFor());
      setLoading(false);
      return;
    }

    // If the ID looks like a backend UUID, load from API
    if (pid) {
      documentService.get(pid)
        .then((doc) => {
          const extractedFields = doc.extractedFields || [];
          const nameField = extractedFields.find(f => f.fieldName === 'patient_name');
          const dobField = extractedFields.find(f => f.fieldName === 'date_of_birth');
          const dxField = extractedFields.find(f => f.fieldName === 'primary_diagnosis');
          const icdField = extractedFields.find(f => f.fieldName === 'primary_icd10');
          const socField = extractedFields.find(f => f.fieldName === 'start_of_care' || f.fieldName === 'soc_date');
          const stateField = extractedFields.find(f => f.fieldName === 'state');
          const zipField = extractedFields.find(f => f.fieldName === 'zip');

          setPatient({
            id: pid,
            name: nameField?.fieldValue || 'Unknown Patient',
            dob: dobField?.fieldValue || '—',
            sex: '—',
            state: stateField?.fieldValue || '—',
            zip: zipField?.fieldValue || '—',
            soc: socField?.fieldValue || '—',
            primary_dx: icdField ? `${icdField.fieldValue} — ${dxField?.fieldValue || ''}` : dxField?.fieldValue || '—',
            secondary: [],
            risk: doc.riskScore?.riskScore || 0,
            riskClass: doc.riskScore?.riskClass || 'low',
            docs: 1,
          });
          setDocs([{
            id: doc.id,
            filename: doc.filename,
            pages: 1,
            status: doc.status,
            uploadedBy: doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : 'Unknown',
            confAvg: extractedFields.length > 0 ? extractedFields.reduce((a, f) => a + f.confidence, 0) / extractedFields.length : 0,
          }]);
          setFields(extractedFields.map(f => ({
            key: f.fieldName,
            label: f.fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            oasis: '',
            value: f.fieldValue || '',
            confidence: f.confidence || 0,
            section: categorizeField(f.fieldName),
          })));
        })
        .catch(() => {
          // Final fallback
          setPatient(MOCK_PATIENTS[0]);
          setDocs(MOCK_DOCS.filter(d => d.patientId === MOCK_PATIENTS[0].id));
          setFields(fieldsFor());
        })
        .finally(() => setLoading(false));
    } else {
      setPatient(MOCK_PATIENTS[0]);
      setDocs(MOCK_DOCS.filter(d => d.patientId === MOCK_PATIENTS[0].id));
      setFields(fieldsFor());
      setLoading(false);
    }
  }, [params?.patientId]);

  if (loading || !patient) {
    return (
      <div className="fade-up" style={{ padding: 40, textAlign: "center" }}>
        <div className="muted">Loading patient...</div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="crumb">
            <span onClick={() => goto("dashboard")} style={{ cursor: "pointer" }}>Workspace</span><Icon name="chev-r" size={12} />
            <span onClick={() => goto("patients")} style={{ cursor: "pointer" }}>Patients</span><Icon name="chev-r" size={12} />
            <span className="mono">{typeof patient.id === 'string' && patient.id.length > 12 ? patient.id.slice(0, 8) + '...' : patient.id}</span>
          </div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar name={patient.name} size={48} />
            <span>{patient.name.split(" ").slice(0, -1).join(" ")} <em>{patient.name.split(" ").slice(-1)}</em></span>
          </h1>
          <div style={{ display: "flex", gap: 18, marginTop: 8, fontSize: 12.5, color: "var(--ink-3)" }}>
            <span>DOB {patient.dob}</span>
            {patient.sex !== '—' && <span>Sex {patient.sex}</span>}
            {patient.state !== '—' && <span>{patient.state} · {patient.zip}</span>}
            <span>SOC {patient.soc}</span>
          </div>
        </div>
        <div className="actions">
          <GradientButton size="sm" variant="ghost" icon="upload" onClick={() => goto("upload")}>New document</GradientButton>
          <GradientButton size="sm" variant="primary" icon="poc" onClick={() => goto("poc")}>Open POC</GradientButton>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, borderBottom: "1px solid var(--glass-border-soft)" }}>
        {[["overview", "Overview"], ["data", "Extracted data"], ["poc", "Plan of care"], ["risk", "Risk"], ["audit", "Audit log"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            border: 0, background: "transparent", padding: "10px 14px", fontSize: 13, fontWeight: 500,
            color: tab === k ? "var(--ink-1)" : "var(--ink-3)",
            borderBottom: tab === k ? "2px solid var(--accent)" : "2px solid transparent",
            marginBottom: -1, cursor: "pointer", fontFamily: "inherit",
          }}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GlassCard strong style={{ padding: 22 }}>
              <div className="eyebrow">Diagnoses</div>
              <h3 className="display" style={{ fontSize: 22, marginTop: 2, marginBottom: 12 }}>Clinical <em>summary</em></h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ padding: 12, background: "var(--glass-inner)", border: "1px solid var(--glass-border-soft)", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: 0.05 }}>PRIMARY</div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{patient.primary_dx}</div>
                </div>
                {patient.secondary && patient.secondary.length > 0 && (
                  <div style={{ padding: 12, background: "var(--glass-inner)", border: "1px solid var(--glass-border-soft)", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>SECONDARY</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      {patient.secondary.map(s => <span key={s} className="pill pill--neutral">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
            <GlassCard strong style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div className="eyebrow">Documents · {docs.length}</div>
                  <h3 className="display" style={{ fontSize: 22, marginTop: 2 }}>On <em>file</em></h3>
                </div>
                <GradientButton size="sm" variant="ghost" icon="upload" onClick={() => goto("upload")}>New</GradientButton>
              </div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {docs.map(d => (
                  <div key={d.id} onClick={() => goto("review", { docId: d.id })} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--glass-inner)", border: "1px solid var(--glass-border-soft)", borderRadius: 10, cursor: "pointer" }}>
                    <Icon name="doc" size={16} style={{ color: "var(--accent)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }} className="clamp-1">{d.filename}</div>
                      <div className="mono muted" style={{ fontSize: 11 }}>{typeof d.id === 'string' && d.id.length > 12 ? d.id.slice(0, 8) + '...' : d.id} · {d.pages} pp</div>
                    </div>
                    {d.confAvg !== undefined && <ConfidenceBadge value={d.confAvg} />}
                    <StatusPill status={d.status} />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GlassCard strong style={{ padding: 22 }}>
              <div className="eyebrow">Readmission risk</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6 }}>
                <div className="display" style={{ fontSize: 56, color: patient.riskClass === "high" ? "var(--danger)" : patient.riskClass === "medium" ? "var(--warn)" : "var(--ok)", lineHeight: 1 }}>{(patient.risk || 0).toFixed(2)}</div>
                <span className={`pill pill--${patient.riskClass === "high" ? "danger" : patient.riskClass === "medium" ? "warn" : "ok"}`} style={{ height: 24 }}>{(patient.riskClass || 'low').toUpperCase()}</span>
              </div>
              <Sparkline data={[(patient.risk||0) - 0.18, (patient.risk||0) - 0.12, (patient.risk||0) - 0.14, (patient.risk||0) - 0.08, (patient.risk||0) - 0.04, patient.risk||0]} w={300} h={56} stroke={patient.riskClass === "high" ? "var(--danger)" : "var(--accent)"} />
              <button className="btn btn--block btn--sm btn--ghost" style={{ marginTop: 12 }} onClick={() => goto("risk")}>View risk breakdown <Icon name="arrow-r" size={11} /></button>
            </GlassCard>
            <GlassCard strong style={{ padding: 22 }}>
              <div className="eyebrow">Care team</div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { name: "Dr. J. Patel", role: "Lead clinician", primary: true },
                  { name: "Dr. K. Adler", role: "Reviewer" },
                  { name: "RN M. Solomon", role: "Field nurse" },
                  { name: "PT R. Owens", role: "Physical therapy" },
                ].map(t => (
                  <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={t.name} size={28} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{t.role}</div>
                    </div>
                    {t.primary && <span className="pill pill--ok" style={{ height: 18, fontSize: 10 }}>Primary</span>}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {tab === "data" && (
        <GlassCard strong style={{ padding: 0, overflow: "hidden" }}>
          <table className="tbl">
            <thead><tr><th style={{ width: 90 }}>OASIS</th><th>Field</th><th>Value</th><th style={{ width: 130 }}>Confidence</th><th>Section</th></tr></thead>
            <tbody>
              {fields.map(f => (
                <tr key={f.key}>
                  <td className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{f.oasis || '—'}</td>
                  <td><div style={{ fontWeight: 500 }}>{f.label}</div></td>
                  <td className="mono">{f.value}</td>
                  <td><ConfidenceBadge value={f.confidence} /></td>
                  <td className="muted">{f.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {tab === "poc" && <PocScreen goto={goto} params={{ docId: patient.id }} addToast={() => {}} />}
      {tab === "risk" && <RiskScreen goto={goto} params={{ docId: patient.id }} addToast={() => {}} />}

      {tab === "audit" && (
        <GlassCard strong style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Activity history</div>
          {AUDIT_TRAIL.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < AUDIT_TRAIL.length - 1 ? "1px solid var(--glass-border-soft)" : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={e.icon} size={12} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{e.actor}</span>
                  <span className="mono muted" style={{ fontSize: 11 }}>{e.time}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 2 }}>{e.action} {e.meta && <span className="mono" style={{ color: "var(--ink-3)", marginLeft: 6 }}>· {e.meta}</span>}</div>
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
};

function categorizeField(name) {
  const n = name.toLowerCase();
  if (['patient_name', 'date_of_birth', 'patient_id', 'soc_date', 'start_of_care', 'assessment_date', 'state', 'zip'].some(k => n.includes(k))) return 'Administrative';
  if (['diagnosis', 'icd10', 'risk_hospitalization', 'dx'].some(k => n.includes(k))) return 'Clinical';
  if (['medication', 'allergy'].some(k => n.includes(k))) return 'Medications';
  if (['mobility', 'adl', 'functional'].some(k => n.includes(k))) return 'Functional';
  return 'Other';
}

export default PatientScreen;
