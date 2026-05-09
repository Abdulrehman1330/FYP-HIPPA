import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar, ConfidenceBadge } from '../../components/ui';
import { PATIENTS as MOCK_PATIENTS } from '../../data';
import { documentService } from '../../services';

const PatientsScreen = ({ goto }) => {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState(MOCK_PATIENTS);

  // Try to derive patient list from backend documents
  useEffect(() => {
    documentService.list(1, 100)
      .then((result) => {
        const docs = result.documents || result.data || result;
        if (Array.isArray(docs) && docs.length > 0) {
          // Build patient list from extracted fields
          const patientMap = {};
          docs.forEach(doc => {
            const fields = doc.extractedFields || [];
            const nameField = fields.find(f => f.fieldName === 'patient_name');
            if (nameField) {
              const name = nameField.fieldValue;
              if (!patientMap[name]) {
                const dobField = fields.find(f => f.fieldName === 'date_of_birth');
                const dxField = fields.find(f => f.fieldName === 'primary_diagnosis');
                const icdField = fields.find(f => f.fieldName === 'primary_icd10');
                const socField = fields.find(f => f.fieldName === 'start_of_care' || f.fieldName === 'soc_date');
                patientMap[name] = {
                  id: doc.id,
                  name,
                  dob: dobField?.fieldValue || '—',
                  primary_dx: icdField ? `${icdField.fieldValue} — ${dxField?.fieldValue || ''}` : dxField?.fieldValue || '—',
                  soc: socField?.fieldValue || '—',
                  docs: 1,
                  risk: 0,
                  riskClass: 'low',
                };
              } else {
                patientMap[name].docs += 1;
              }
            }
          });
          const derived = Object.values(patientMap);
          if (derived.length > 0) {
            setPatients(derived);
            return;
          }
        }
        // Fallback to mock
        setPatients(MOCK_PATIENTS);
      })
      .catch(() => setPatients(MOCK_PATIENTS));
  }, []);

  const list = patients.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) || (p.id || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="crumb"><span onClick={() => goto("dashboard")} style={{ cursor: "pointer" }}>Workspace</span><Icon name="chev-r" size={12} /><span>Patients</span></div>
          <h1>All <em>patients</em>.</h1>
          <p>Active caseload across the agency. Click a patient to open the full chart.</p>
        </div>
        <div className="actions">
          <input className="input" placeholder="Search by name or ID..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {list.map(p => (
          <GlassCard key={p.id} strong style={{ padding: 18, cursor: "pointer" }} onClick={() => goto("patient", { patientId: p.id })}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
              <Avatar name={p.name} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }} className="clamp-1">{p.name}</div>
                <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{typeof p.id === 'string' && p.id.length > 12 ? p.id.slice(0, 8) + '...' : p.id} · DOB {p.dob}</div>
              </div>
              {p.risk > 0 && <span className={`pill pill--${p.riskClass === "high" ? "danger" : p.riskClass === "medium" ? "warn" : "ok"}`}>{p.risk.toFixed(2)}</span>}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", padding: "10px 12px", background: "var(--glass-inner)", borderRadius: 8, marginBottom: 10 }}>
              {p.primary_dx}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--ink-3)" }}>
              <span>SOC {p.soc}</span>
              <span>{p.docs} {p.docs === 1 ? "document" : "documents"}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default PatientsScreen;
