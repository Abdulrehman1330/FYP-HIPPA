import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar } from '../../components/ui';
import { POC_SECTIONS as MOCK_POC, PATIENTS as MOCK_PATIENTS } from '../../data';
import { pocService } from '../../services';

const PocScreen = ({ goto, params, addToast }) => {
  const [sections, setSections] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState(params?.docId || null);
  const [pocMeta, setPocMeta] = useState(null);
  const [signingLoading, setSigningLoading] = useState(false);

  // Load existing POC or show mock
  useEffect(() => {
    if (!docId) {
      setSections(MOCK_POC);
      setActiveKey(MOCK_POC[0].key);
      setLoading(false);
      return;
    }

    pocService.get(docId)
      .then((result) => {
        const pocSections = result.sections || [];
        if (pocSections.length > 0) {
          const mapped = pocSections.map(s => ({
            key: s.section,
            title: s.title,
            body: s.content || '',
            citations: s.citations || [],
            sufficientEvidence: s.sufficientEvidence,
          }));
          setSections(mapped);
          setActiveKey(mapped[0].key);
          setPocMeta(result);
        } else {
          setSections(MOCK_POC);
          setActiveKey(MOCK_POC[0].key);
        }
      })
      .catch(() => {
        setSections(MOCK_POC);
        setActiveKey(MOCK_POC[0].key);
      })
      .finally(() => setLoading(false));
  }, [docId]);

  const generatePoc = async () => {
    if (!docId) {
      // Mock generation
      setGenerating(true); setGenStep(0);
      let i = 0;
      const t = setInterval(() => {
        i++; setGenStep(i);
        if (i >= 4) { clearInterval(t); setGenerating(false); addToast({ kind: "ok", text: "Regenerated section · saved as draft" }); }
      }, 500);
      return;
    }

    setGenerating(true); setGenStep(0);
    try {
      // Show progress steps
      const stepTimer = setInterval(() => {
        setGenStep(prev => prev < 4 ? prev + 1 : prev);
      }, 2000);

      const result = await pocService.generate(docId);
      clearInterval(stepTimer);
      setGenStep(4);

      const pocSections = result.sections || [];
      if (pocSections.length > 0) {
        const mapped = pocSections.map(s => ({
          key: s.section,
          title: s.title,
          body: s.content || '',
          citations: s.citations || [],
          sufficientEvidence: s.sufficientEvidence,
        }));
        setSections(mapped);
        if (!activeKey) setActiveKey(mapped[0].key);
        setPocMeta(result);
      }
      addToast({ kind: "ok", text: "POC generated successfully" });
    } catch (err) {
      addToast({ kind: "danger", text: err.response?.data?.error || "POC generation failed" });
    }
    setGenerating(false);
  };

  const saveSectionEdits = async () => {
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
          <p>Generated from approved OASIS fields. Review each section, edit anything that needs clinical judgment, then sign to finalize.</p>
        </div>
        <div className="actions">
          <GradientButton size="sm" variant="ghost" icon="sparkle" onClick={generatePoc} disabled={generating}>
            {sections.length > 0 ? "Regenerate all" : "Generate POC"}
          </GradientButton>
          {sections.length > 0 && (
            <GradientButton size="sm" variant="primary" icon="check" onClick={signAndFinalize} disabled={signingLoading}>
              {signingLoading ? "Signing..." : "Sign & finalize"}
            </GradientButton>
          )}
        </div>
      </div>

      {pocMeta && (
        <GlassCard strong style={{ padding: 16, marginBottom: 14, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="mono muted" style={{ fontSize: 12 }}>Version {pocMeta.version || 1}</span>
              <span className="pill pill--ok" style={{ height: 18, fontSize: 10 }}>{pocMeta.status || 'draft'}</span>
            </div>
          </div>
          <span className="pill pill--ok"><Icon name="check" size={11} /> {sections.length} sections</span>
        </GlassCard>
      )}

      {sections.length === 0 && !generating ? (
        <GlassCard strong style={{ padding: 40, textAlign: "center" }}>
          <Icon name="poc" size={32} style={{ color: "var(--ink-3)", marginBottom: 12 }} />
          <div className="display" style={{ fontSize: 24 }}>No plan of care <em>yet</em></div>
          <p className="muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 18 }}>Approve a document first, then generate the plan of care from extracted fields.</p>
          <GradientButton variant="primary" icon="sparkle" onClick={generatePoc}>Generate POC</GradientButton>
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
                  </div>
                  <button className="btn btn--ghost btn--sm" onClick={generatePoc}><Icon name="sparkle" size={11} /> Regenerate</button>
                </div>
                <textarea
                  className="textarea"
                  value={s.body}
                  onChange={(e) => setSections(prev => prev.map(x => x.key === s.key ? { ...x, body: e.target.value } : x))}
                  onBlur={saveSectionEdits}
                  style={{ minHeight: 120, fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-1)" }}
                  rows={Math.max(4, s.body.split("\n").length + 1)}
                />
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontSize: 11, color: "var(--ink-3)" }}>
                  <span>Sourced from approved OASIS fields</span>
                  <span>{s.body.length} chars · auto-saved</span>
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
