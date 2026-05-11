import { useState, useEffect, useRef } from 'react';
import { GlassCard, GradientButton, Icon, ConfidenceBadge } from '../../components/ui';
import { adminService, documentService } from '../../services';
import api from '../../services/api';

const UploadScreen = ({ goto, params, role, addToast }) => {
  const [stage, setStage] = useState("idle");       // idle | uploading | processing | done | error
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fields, setFields] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [filter, setFilter] = useState("all");
  const [docId, setDocId] = useState(null);
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(params?.patientId || "");
  const fileInputRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    let cancelled = false;

    const loadPatients = async () => {
      if (role !== 'ADMIN' && role !== 'CLINICIAN') return;
      setPatientLoading(true);
      try {
        const result = role === 'ADMIN'
          ? await adminService.listPatients({})
          : (await api.get('/clinician/patients')).data.data;
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
    setSelectedPatientId(params?.patientId || "");
  }, [params?.patientId]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const routePatientName = params?.patientId === selectedPatientId ? params?.patientName : '';
  const selectedPatientName = selectedPatient?.name || routePatientName || '';

  const uploadAndExtract = async (file) => {
    if (!selectedPatientId) {
      const msg = "Select a patient before uploading a document";
      setErrorMsg(msg);
      addToast({ kind: "danger", text: msg });
      return;
    }

    setFilename(file.name);
    setStage("uploading");
    setProgress(0);
    setErrorMsg("");
    setPipelineSteps([]);

    // Simulate upload progress (real upload happens via axios)
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 8 + Math.random() * 10;
      if (p >= 90) { clearInterval(timerRef.current); setProgress(90); }
      else setProgress(p);
    }, 120);

    try {
      // 1. Upload
      const uploadResult = await documentService.upload(file, { patientId: selectedPatientId });
      clearInterval(timerRef.current);
      setProgress(100);
      const id = uploadResult.documentId || uploadResult.id;
      setDocId(id);

      setPipelineSteps(prev => [...prev, { k: "Upload", ok: true, meta: `${(file.size / 1024).toFixed(0)} KB` }]);

      // 2. Extract
      setStage("processing");
      setPipelineSteps(prev => [...prev, { k: "Preprocess", ok: true, meta: "Deskew · contrast" }]);

      const extraction = await documentService.extract(id);

      const extractedFields = extraction.fields || extraction.extractedFields || [];
      const totalPages = extraction.totalPages || 1;
      const processingTime = extraction.processingTimeMs || 0;

      setPipelineSteps(prev => [
        ...prev,
        { k: "OCR extraction", ok: true, meta: `${totalPages} pages · ${(processingTime / 1000).toFixed(1)}s` },
        { k: "Field extraction", ok: true, meta: `${extractedFields.length} fields found` },
      ]);

      // Map backend fields to frontend display shape
      if (extractedFields.length > 0) {
        const mapped = extractedFields.map(f => ({
          key: f.fieldName,
          label: f.fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          oasis: '',
          value: f.fieldValue || '',
          confidence: f.confidence || 0,
          section: categorizeField(f.fieldName),
          warn: f.confidence < 0.6 ? 'Low confidence' : null,
          sourceSnippet: f.sourceSnippet || '',
        }));
        setFields(mapped);
        const lowCount = mapped.filter(f => f.confidence < 0.6).length;
        setPipelineSteps(prev => [...prev, {
          k: "Validation",
          ok: lowCount === 0,
          warn: lowCount > 0,
          meta: lowCount > 0 ? `${lowCount} below threshold` : 'All fields above threshold'
        }]);
      } else {
        setFields([]);
        setPipelineSteps(prev => [...prev, { k: "Validation", warn: true, meta: "No structured fields returned by OCR" }]);
      }

      setStage("done");
    } catch (err) {
      clearInterval(timerRef.current);
      const msg = err.response?.data?.error || err.message || "Upload failed";
      setErrorMsg(msg);
      setStage("error");
      addToast({ kind: "danger", text: msg });
    }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) uploadAndExtract(f);
  };

  const onFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) uploadAndExtract(f);
  };

  const sendToReview = () => {
    addToast({ kind: "ok", text: `Sent to review queue · ${docId || 'DOC'}` });
    goto("review", { docId, patientId: selectedPatientId, patientName: selectedPatientName });
  };

  const filtered = filter === "low" ? fields.filter(f => f.confidence < 0.6) : fields;

  return (
    <div className="stagger">
      <div className="page-head">
        <div>
          <div className="crumb"><span onClick={() => goto("dashboard")} style={{ cursor: "pointer" }}>Workspace</span><Icon name="chev-r" size={12} /><span>Upload</span></div>
          <h1>Upload &amp; <em>extract</em>.</h1>
          <p>Drop a scanned OASIS-E2 PDF or image. Our pipeline runs OCR, parses fields against the OASIS schema, and routes the result to review.</p>
          {selectedPatientName && (
            <div className="pill pill--neutral" style={{ width: "fit-content", marginTop: 10 }}>
              Patient: {selectedPatientName}
            </div>
          )}
        </div>
        <div className="actions">
          {stage === "done" && (
            <>
              <GradientButton variant="ghost" size="sm" icon="x" onClick={() => { setStage("idle"); setFields([]); setDocId(null); setPipelineSteps([]); }}>Discard</GradientButton>
              <GradientButton variant="primary" size="sm" iconRight="arrow-r" onClick={sendToReview}>Send to review</GradientButton>
            </>
          )}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: "none" }} onChange={onFileSelect} />

      <GlassCard strong style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 360px) 1fr", gap: 14, alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Patient context</div>
            <select
              className="input"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              disabled={patientLoading || stage === "uploading" || stage === "processing" || Boolean(docId)}
            >
              <option value="">{patientLoading ? "Loading patients..." : "Select patient for this upload"}</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.name} · {patient.mrn}</option>
              ))}
            </select>
          </div>
          <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
            Uploads are linked to the selected patient before OCR starts. This prevents extracted fields and generated care plans from being attached to the wrong chart.
          </div>
        </div>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: stage === "done" ? "minmax(0, 380px) 1fr" : "1fr", gap: 14, alignItems: "flex-start" }}>
        {/* DROP ZONE */}
        <GlassCard strong style={{ padding: 24 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              border: `1.5px dashed ${dragOver ? "var(--accent)" : "var(--glass-border-soft)"}`,
              background: dragOver ? "var(--accent-soft)" : "var(--glass-inner)",
              borderRadius: "var(--r-3)", textAlign: "center",
              padding: stage === "done" ? "20px 18px" : "44px 24px",
              transition: "all 200ms var(--ease)", position: "relative", overflow: "hidden",
            }}
          >
            {stage === "idle" && (
              <>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-grad-1), var(--accent-grad-2))", display: "grid", placeItems: "center", margin: "0 auto 14px", color: "var(--ink-on-accent)", boxShadow: "0 12px 28px -8px var(--accent), inset 0 1px 0 rgba(255,255,255,0.4)" }}>
                  <Icon name="drop" size={22} />
                </div>
                <div className="display" style={{ fontSize: 24 }}>Drop your <em>OASIS form</em></div>
                <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>PDF, PNG, or JPEG · up to 10 MB · multi-page supported</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18 }}>
                  <GradientButton variant="primary" icon="upload" onClick={() => fileInputRef.current?.click()} disabled={!selectedPatientId}>Choose file</GradientButton>
                </div>
              </>
            )}

            {stage === "uploading" && (
              <div>
                <div className="eyebrow">Uploading</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{filename}</div>
                <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 999, marginTop: 14, overflow: "hidden" }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-grad-1), var(--accent-grad-2))", transition: "width 160ms linear", borderRadius: 999 }} />
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{Math.round(progress)}% · encrypting in transit</div>
              </div>
            )}

            {stage === "processing" && (
              <div>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Running OCR pipeline</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Parsing OASIS-E2 fields · estimating confidence</div>
              </div>
            )}

            {stage === "error" && (
              <div>
                <Icon name="warn" size={32} style={{ color: "var(--danger)", marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--danger)" }}>Upload failed</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{errorMsg}</div>
                <GradientButton variant="ghost" size="sm" style={{ marginTop: 14 }} onClick={() => { setStage("idle"); setErrorMsg(""); }}>Try again</GradientButton>
              </div>
            )}

            {stage === "done" && (
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 48, borderRadius: 4, background: "linear-gradient(180deg, var(--glass-bg-strong), var(--glass-bg))", border: "1px solid var(--glass-border-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name="doc" size={16} style={{ color: "var(--accent)" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }} className="clamp-1">{filename}</div>
                    <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{fields.length} fields parsed</div>
                  </div>
                  <span className="pill pill--ok"><Icon name="check" size={11} /> Complete</span>
                </div>
              </div>
            )}
          </div>

          {(stage === "done" || stage === "processing") && pipelineSteps.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Pipeline</div>
              {pipelineSteps.map((s, i) => (
                <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < pipelineSteps.length - 1 ? "1px dashed var(--glass-border-soft)" : "none" }}>
                  <Icon name={s.warn ? "warn" : "check"} size={13} style={{ color: s.warn ? "var(--warn)" : "var(--ok)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.k}</div>
                    {s.meta && <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{s.meta}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* EXTRACTED FIELDS TABLE */}
        {stage === "done" && (
          <GlassCard strong style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--glass-border-soft)" }}>
              <div>
                <div className="eyebrow">Extracted fields</div>
                <h3 className="display" style={{ fontSize: 22, marginTop: 2 }}>{fields.length} fields <em>found</em></h3>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setFilter("all")} className={`btn btn--sm ${filter === "all" ? "btn--primary" : "btn--ghost"}`}>All {fields.length}</button>
                <button onClick={() => setFilter("low")} className={`btn btn--sm ${filter === "low" ? "btn--primary" : "btn--ghost"}`}>Low confidence · {fields.filter(f => f.confidence < 0.6).length}</button>
              </div>
            </div>
            <div style={{ maxHeight: 540, overflowY: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr><th style={{ width: 90 }}>OASIS</th><th>Field</th><th>Value</th><th style={{ width: 130 }}>Confidence</th><th style={{ width: 50 }}></th></tr>
                </thead>
                <tbody>
                  {filtered.map(f => {
                    const isLow = f.confidence < 0.6;
                    return (
                      <tr key={f.key} style={isLow ? { background: "color-mix(in srgb, var(--warn-bg) 50%, transparent)" } : {}}>
                        <td className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{f.oasis || '—'}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{f.label}</div>
                          {f.warn && <div style={{ fontSize: 11, color: "var(--warn)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Icon name="flag" size={11} />{f.warn}</div>}
                        </td>
                        <td>
                          {editingKey === f.key ? (
                            <input className="input" autoFocus defaultValue={f.value} onBlur={(e) => { setFields(prev => prev.map(x => x.key === f.key ? { ...x, value: e.target.value, confidence: 0.99, edited: true } : x)); setEditingKey(null); }} style={{ height: 30 }} />
                          ) : (
                            <div className="mono" style={{ fontSize: 12.5, color: "var(--ink-1)", cursor: "text" }} onClick={() => setEditingKey(f.key)}>
                              {f.value || <span className="dim">—</span>}
                              {f.edited && <span className="pill pill--info" style={{ marginLeft: 8, height: 16, fontSize: 9.5 }}>edited</span>}
                            </div>
                          )}
                        </td>
                        <td><ConfidenceBadge value={f.confidence} /></td>
                        <td><button className="btn btn--ghost btn--icon btn--sm" onClick={() => setEditingKey(f.key)}><Icon name="edit" size={12} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

function categorizeField(name) {
  const n = name.toLowerCase();
  if (['patient_name', 'date_of_birth', 'patient_id', 'soc_date', 'assessment_date', 'state', 'zip'].some(k => n.includes(k))) return 'Administrative';
  if (['diagnosis', 'icd10', 'risk_hospitalization', 'dx'].some(k => n.includes(k))) return 'Clinical';
  if (['medication', 'allergy'].some(k => n.includes(k))) return 'Medications';
  if (['mobility', 'adl', 'functional'].some(k => n.includes(k))) return 'Functional';
  if (['living', 'situation'].some(k => n.includes(k))) return 'Living';
  return 'Other';
}

function adaptPatientOption(patient) {
  return {
    id: patient.id,
    mrn: patient.mrn || '—',
    name: patient.user
      ? `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() || patient.user.email
      : 'Unnamed patient',
  };
}

export default UploadScreen;
