import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon } from '../../components/ui';
import { adminService, patientService, pocService } from '../../services';
import api from '../../services/api';

const GENERATABLE_STATUSES = new Set(['APPROVED', 'POC_GENERATED', 'RISK_SCORED']);

function normalizePocSections(rawSections) {
  if (!rawSections) return [];
  if (Array.isArray(rawSections)) {
    return rawSections.map(s => ({
      key: s.section || s.key,
      title: s.title,
      body: s.content || s.body || '',
      citations: s.citations || [],
      sufficientEvidence: s.sufficientEvidence,
      generator: s.generator,
      insufficientEvidenceReason: s.insufficientEvidenceReason,
    }));
  }

  return Object.entries(rawSections).map(([key, value]) => ({
    key,
    title: value?.title || key,
    body: value?.content || value?.body || '',
    citations: value?.citations || [],
    sufficientEvidence: value?.sufficientEvidence,
    generator: value?.generator,
    insufficientEvidenceReason: value?.insufficientEvidenceReason,
  }));
}

function generatorLabel(generator) {
  if (!generator) return 'Fallback generator';
  if (generator.mode === 'llm') return `${generator.provider || 'LLM'} · ${generator.model || 'configured model'}`;
  if (generator.mode === 'mixed') return `Mixed · ${generator.llmSectionCount || 0} LLM sections`;
  if (generator.llmRequested) return `Fallback · ${generator.requestedProvider || 'LLM'} unavailable`;
  return 'Fallback generator';
}

function readableFieldName(fieldName = '') {
  const labels = {
    primary_diagnosis: 'Main health problem',
    mobility_status: 'Walking and movement',
    fall_risk: 'Fall safety',
    medication_support: 'Medication support',
    goals: 'Care goal',
    interventions: 'Care team support',
    safety: 'Safety instructions',
    patient_summary: 'Patient summary',
    problems: 'Health problems',
    medication_management: 'Medication plan',
    safety_concerns: 'Safety concerns',
    follow_up: 'Follow-up',
  };
  return labels[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function simplifyPatientPocText(section) {
  const raw = String(section.body || '').trim();
  if (!raw) return 'No patient-visible care-plan text is available for this section yet.';

  const citationItems = (section.citations || [])
    .filter(c => c?.value)
    .map(c => `- ${readableFieldName(c.fieldName)}: ${String(c.value).replace(/\s*\[\d+\]/g, '').trim()}`);

  if (citationItems.length > 0) {
    return [
      'Simple summary:',
      ...citationItems,
      '',
      'What this means:',
      '- This information comes from your approved care plan.',
      '- Use it to understand your plan, not to change treatment yourself.',
      '- Contact your care team if anything is unclear or if symptoms change.',
    ].join('\n');
  }

  const cleaned = raw
    .replace(/^.+draft based on approved evidence:\s*/i, '')
    .replace(/Clinician review required before final approval\./gi, '')
    .replace(/\[\d+\]/g, '')
    .replace(/^\s*-\s*/gm, '- ')
    .trim();

  return [
    'Simple summary:',
    cleaned || raw,
    '',
    'Contact your care team before making medical decisions.',
  ].join('\n');
}

const PocScreen = ({ goto, params, addToast }) => {
  const [sections, setSections] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState(params?.docId || null);
  const [pocMeta, setPocMeta] = useState(null);
  const [signingLoading, setSigningLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(params?.patientId || '');
  const [documents, setDocuments] = useState([]);
  const [documentLoading, setDocumentLoading] = useState(false);
  const role = params?.role;
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const routePatientName = params?.patientId === selectedPatientId ? params?.patientName : '';
  const patientId = selectedPatientId || null;
  const patientName = selectedPatient?.name || routePatientName || '';
  const patientReadOnly = role === 'PATIENT';
  const clinicalMode = !patientReadOnly;

  useEffect(() => {
    let cancelled = false;

    const loadPatients = async () => {
      if (!['ADMIN', 'CLINICIAN', 'DOCTOR'].includes(role)) return;
      setPatientLoading(true);
      try {
        let result;
        if (role === 'ADMIN') {
          result = await adminService.listPatients({});
        } else if (role === 'DOCTOR') {
          result = (await api.get('/doctor/patients')).data.data;
        } else {
          result = (await api.get('/clinician/patients')).data.data;
        }
        const list = (result?.patients || []).map(adaptPatientOption);
        if (!cancelled) setPatients(list);
      } catch (err) {
        if (!cancelled) addToast?.({ kind: 'danger', text: err.response?.data?.error || 'Failed to load patients' });
      } finally {
        if (!cancelled) setPatientLoading(false);
      }
    };

    loadPatients();
    return () => { cancelled = true; };
  }, [role]);

  useEffect(() => {
    setSelectedPatientId(params?.patientId || '');
  }, [params?.patientId]);

  useEffect(() => {
    let cancelled = false;

    const loadDocuments = async () => {
      if (!clinicalMode || !selectedPatientId) {
        setDocuments([]);
        return;
      }

      setDocumentLoading(true);
      try {
        const profile = await patientService.getClinicalPatient(selectedPatientId, role);
        const list = (profile.documents || [])
          .filter((document) => GENERATABLE_STATUSES.has(document.status))
          .map(adaptDocumentOption);

        if (cancelled) return;
        setDocuments(list);
        if (params?.docId && list.some((document) => document.id === params.docId)) {
          setDocId(params.docId);
        } else if (!list.some((document) => document.id === docId)) {
          setDocId('');
        }
      } catch (err) {
        if (!cancelled) {
          setDocuments([]);
          setDocId('');
          addToast?.({ kind: 'danger', text: err.response?.data?.error || 'Failed to load patient documents' });
        }
      } finally {
        if (!cancelled) setDocumentLoading(false);
      }
    };

    loadDocuments();
    return () => { cancelled = true; };
  }, [clinicalMode, selectedPatientId, role, params?.docId]);

  useEffect(() => {
    setDocId(params?.docId || null);
    setPocMeta(null);
    setSections([]);
    setActiveKey('');
    setLoading(true);
  }, [params?.docId, selectedPatientId]);

  // Load existing POC from the backend. The sidebar route may not include a documentId,
  // so clinical users fall back to the latest accessible generated POC instead of mock text.
  useEffect(() => {
    let cancelled = false;

    const applyPocResult = (result) => {
      if (cancelled) return;
      const pocSections = normalizePocSections(result.sections);
      if (pocSections.length > 0) {
        setSections(pocSections);
        setActiveKey((current) => (
          current && pocSections.some((section) => section.key === current)
            ? current
            : pocSections[0].key
        ));
        setPocMeta(result);
        if (!docId) setDocId(result.documentId || result.selectedDocument?.id || result.document?.id || null);
      } else {
        setSections([]);
        setActiveKey('');
        setPocMeta(result);
      }
    };

    if (patientReadOnly) {
      pocService.getMyPoc()
        .then(applyPocResult)
        .catch(() => {
          if (!cancelled) {
            setSections([]);
            setActiveKey('');
            setPocMeta(null);
          }
        })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }

    if (!docId && clinicalMode) {
      setSections([]);
      setActiveKey('');
      setPocMeta(null);
      setLoading(false);
      return () => { cancelled = true; };
    }

    if (!docId) {
      pocService.getLatest({ patientId })
        .then(applyPocResult)
        .catch(() => {
          if (!cancelled) {
            setSections([]);
            setActiveKey('');
            setPocMeta(null);
          }
        })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }

    pocService.get(docId)
      .then(applyPocResult)
      .catch(() => {
        if (!cancelled) {
          setSections([]);
          setActiveKey('');
          setPocMeta(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [docId, patientId, patientReadOnly, clinicalMode]);

  const generatePoc = async () => {
    if (patientReadOnly) return;
    if (!docId) {
      addToast({ kind: "danger", text: "Select the source document for this Plan of Care" });
      return;
    }

    setGenerating(true); setGenStep(0);
    let stepTimer;
    try {
      // Show progress steps
      stepTimer = setInterval(() => {
        setGenStep(prev => prev < 4 ? prev + 1 : prev);
      }, 2000);

      const result = await pocService.generate(docId);
      clearInterval(stepTimer);
      setGenStep(4);

      const pocSections = normalizePocSections(result.sections);
      if (pocSections.length > 0) {
        setSections(pocSections);
        setActiveKey((current) => (
          current && pocSections.some((section) => section.key === current)
            ? current
            : pocSections[0].key
        ));
        setPocMeta(result);
        setDocId(result.documentId || result.selectedDocument?.id || null);
      }
      addToast({ kind: "ok", text: "POC generated successfully" });
    } catch (err) {
      if (stepTimer) clearInterval(stepTimer);
      addToast({ kind: "danger", text: err.response?.data?.error || "POC generation failed" });
    } finally {
      setGenerating(false);
    }
  };

  const changePatient = (nextPatientId) => {
    setSelectedPatientId(nextPatientId);
    setDocId('');
    setDocuments([]);
    setPocMeta(null);
    setSections([]);
    setActiveKey('');
  };

  const changeDocument = (nextDocumentId) => {
    setDocId(nextDocumentId);
    setPocMeta(null);
    setSections([]);
    setActiveKey('');
  };

  const saveSectionEdits = async () => {
    if (patientReadOnly) return;
    if (!docId || docId.startsWith('DOC-')) return;
    const edits = {};
    sections.forEach(s => { edits[s.key] = s.body; });
    try {
      await pocService.edit(docId, edits);
      addToast({ kind: "ok", text: "Edits saved" });
    } catch (err) {
      addToast({ kind: "danger", text: err.response?.data?.error || "Save failed" });
    }
  };

  const signAndFinalize = async () => {
    if (patientReadOnly) return;
    setSigningLoading(true);
    if (!docId || docId.startsWith('DOC-')) {
      addToast({ kind: "ok", text: "POC signed · risk scoring queued" });
      goto("risk");
      return;
    }
    try {
      await pocService.approve(docId);
      addToast({ kind: "ok", text: "POC signed & finalized · risk scoring queued" });
      goto("risk", { docId });
    } catch (err) {
      addToast({ kind: "danger", text: err.response?.data?.error || "Finalization failed" });
    }
    setSigningLoading(false);
  };

  if (loading) {
    return (
      <div className="fade-up" style={{ padding: 40, textAlign: "center" }}>
        <div className="muted">Loading plan of care...</div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="crumb"><span onClick={() => goto("dashboard")} style={{ cursor: "pointer" }}>Workspace</span><Icon name="chev-r" size={12} /><span>Plan of Care</span>{docId && <><Icon name="chev-r" size={12} /><span className="mono">{typeof docId === 'string' && docId.length > 12 ? docId.slice(0, 8) + '...' : docId}</span></>}</div>
          <h1>Plan of <em>care</em>.</h1>
          <p>
            {patientReadOnly
              ? "Your latest care plan, prepared from approved clinical documentation. Contact your care team before making medical decisions."
              : patientName
                ? `Generated from approved OASIS fields for ${patientName}. Review each section, edit anything that needs clinical judgment, then sign to finalize.`
                : "Generated from approved OASIS fields. Review each section, edit anything that needs clinical judgment, then sign to finalize."}
          </p>
        </div>
        {!patientReadOnly && (
          <div className="actions">
            <GradientButton size="sm" variant="ghost" icon="sparkle" onClick={generatePoc} disabled={generating || !docId}>
              {sections.length > 0 ? "Regenerate all" : "Generate POC"}
            </GradientButton>
            {sections.length > 0 && (
              <GradientButton size="sm" variant="primary" icon="check" onClick={signAndFinalize} disabled={signingLoading}>
                {signingLoading ? "Signing..." : "Sign & finalize"}
              </GradientButton>
            )}
          </div>
        )}
      </div>

      {clinicalMode && (
        <GlassCard strong style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) minmax(220px, 1fr) 1.2fr", gap: 14, alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Patient context</div>
              <select
                className="input"
                value={selectedPatientId}
                onChange={(e) => changePatient(e.target.value)}
                disabled={patientLoading || generating}
              >
                <option value="">{patientLoading ? "Loading patients..." : "Select patient for POC generation"}</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name} · {patient.mrn}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Source document</div>
              <select
                className="input"
                value={docId || ''}
                onChange={(e) => changeDocument(e.target.value)}
                disabled={!selectedPatientId || documentLoading || generating}
              >
                <option value="">
                  {!selectedPatientId
                    ? "Select patient first"
                    : documentLoading
                      ? "Loading documents..."
                      : documents.length === 0
                        ? "No approved documents for this patient"
                        : "Select approved document"}
                </option>
                {documents.map((document) => (
                  <option key={document.id} value={document.id}>
                    {document.filename} · {document.status} · {document.uploadedAt}
                  </option>
                ))}
              </select>
            </div>
            <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              The Plan of Care is generated from the selected source document only. If a patient has multiple approved documents, choose exactly which OASIS/POC document should drive the draft.
            </div>
          </div>
        </GlassCard>
      )}

      {pocMeta && (
        <GlassCard strong style={{ padding: 16, marginBottom: 14, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="mono muted" style={{ fontSize: 12 }}>Version {pocMeta.version || 1}</span>
              <span className="pill pill--ok" style={{ height: 18, fontSize: 10 }}>{pocMeta.status || 'draft'}</span>
              <span className="pill pill--neutral" style={{ height: 18, fontSize: 10 }}>
                {generatorLabel(pocMeta.generator)}
              </span>
            </div>
          </div>
          <span className="pill pill--ok"><Icon name="check" size={11} /> {sections.length} sections</span>
        </GlassCard>
      )}

      {sections.length === 0 && !generating ? (
        <GlassCard strong style={{ padding: 40, textAlign: "center" }}>
          <Icon name="poc" size={32} style={{ color: "var(--ink-3)", marginBottom: 12 }} />
          <div className="display" style={{ fontSize: 24 }}>No plan of care <em>yet</em></div>
          <p className="muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 18 }}>
            {!patientReadOnly && !patientId
              ? "Select a patient first, then choose the approved source document for the care plan."
              : !patientReadOnly && !docId
                ? "Select the approved document that should be used to generate this Plan of Care."
                : "Approve a document first, then generate the plan of care from extracted fields."}
          </p>
          {!patientReadOnly && <GradientButton variant="primary" icon="sparkle" onClick={generatePoc} disabled={!docId}>Generate POC</GradientButton>}
        </GlassCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14 }}>
          <GlassCard strong style={{ padding: 10, height: "fit-content", position: "sticky", top: 0 }}>
            <div className="eyebrow" style={{ padding: "8px 10px 6px" }}>POC sections</div>
            {sections.map((s, i) => (
              <button key={s.key} onClick={() => setActiveKey(s.key)} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
                padding: "8px 10px", borderRadius: 6, border: 0,
                background: activeKey === s.key ? "var(--accent-soft)" : "transparent",
                color: activeKey === s.key ? "var(--accent)" : "var(--ink-2)",
                cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 500,
              }}>
                <span className="mono" style={{ fontSize: 10, opacity: 0.6, width: 16 }}>0{i + 1}</span>
                {s.title}
              </button>
            ))}
          </GlassCard>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {sections.map((s, i) => (
              <GlassCard key={s.key} strong style={{ padding: 22, scrollMarginTop: 24 }} id={`poc-${s.key}`}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="mono" style={{ fontSize: 11, padding: "2px 8px", background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 999 }}>0{i + 1}</span>
                    <h3 className="display" style={{ fontSize: 24 }}>{s.title}</h3>
                    <span className="pill pill--neutral" style={{ height: 18, fontSize: 10 }}><Icon name="sparkle" size={9} />AI draft</span>
                    {s.sufficientEvidence === false && (
                      <span className="pill pill--warn" style={{ height: 18, fontSize: 10 }}>Needs evidence</span>
                    )}
                  </div>
                  {!patientReadOnly && (
                    <button className="btn btn--ghost btn--sm" onClick={generatePoc}><Icon name="sparkle" size={11} /> Regenerate</button>
                  )}
                </div>
                {patientReadOnly ? (
                  <div style={{ minHeight: 80, whiteSpace: "pre-line", padding: 14, borderRadius: 12, background: "var(--glass-inner)", border: "1px solid var(--glass-border-soft)", fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-1)" }}>
                    {simplifyPatientPocText(s)}
                  </div>
                ) : (
                  <textarea
                    className="textarea"
                    value={s.body}
                    onChange={(e) => setSections(prev => prev.map(x => x.key === s.key ? { ...x, body: e.target.value } : x))}
                    onBlur={saveSectionEdits}
                    style={{ minHeight: 120, fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-1)" }}
                    rows={Math.max(4, s.body.split("\n").length + 1)}
                  />
                )}
                {s.citations && s.citations.length > 0 && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--glass-inner)", borderRadius: 8, border: "1px solid var(--glass-border-soft)" }}>
                    <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>Citations</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {s.citations.map((c, ci) => (
                        <span key={ci} className="pill pill--neutral" style={{ height: 18, fontSize: 10 }}>
                          [{c.index}] {c.fieldName}: {c.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {s.insufficientEvidenceReason && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--warn-bg)", color: "var(--warn)", borderRadius: 8, border: "1px solid rgba(201,138,42,0.3)", fontSize: 12 }}>
                    Missing evidence: {s.insufficientEvidenceReason}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontSize: 11, color: "var(--ink-3)" }}>
                  <span>Sourced from approved OASIS fields</span>
                  <span>{patientReadOnly ? "Read-only patient view" : `${s.body.length} chars · auto-saved`}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {generating && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 40 }}>
          <GlassCard strong style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, minWidth: 280 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--accent-soft)", borderTopColor: "var(--accent)", animation: "spin 0.7s linear infinite" }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>Generating POC</div>
              <div className="mono muted" style={{ fontSize: 11 }}>Step {genStep} of 4 · {["Reading fields", "Drafting sections", "Adding citations", "Formatting"][genStep] || "Done"}</div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default PocScreen;

function adaptPatientOption(patient) {
  return {
    id: patient.id,
    mrn: patient.mrn || '—',
    name: patient.user
      ? `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() || patient.user.email
      : 'Unnamed patient',
  };
}

function adaptDocumentOption(document) {
  const uploaded = document.uploadedAt ? new Date(document.uploadedAt) : null;
  return {
    id: document.id,
    filename: document.filename || 'Clinical document',
    status: document.status || 'UNKNOWN',
    uploadedAt: uploaded && !Number.isNaN(uploaded.getTime())
      ? uploaded.toLocaleDateString()
      : 'no date',
  };
}
