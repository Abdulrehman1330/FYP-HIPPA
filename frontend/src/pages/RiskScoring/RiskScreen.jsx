import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar, Sparkline } from '../../components/ui';
import { RISK_FACTORS as MOCK_FACTORS, PATIENTS as MOCK_PATIENTS } from '../../data';
import { patientService, riskService } from '../../services';
import RiskGauge from './RiskGauge';

const RiskScreen = ({ goto, addToast, params }) => {
  const patientReadOnly = params?.role === 'PATIENT';
  const [score, setScore] = useState(patientReadOnly ? null : 0.62);
  const [klass, setKlass] = useState(patientReadOnly ? "not scored" : "high");
  const [factors, setFactors] = useState(patientReadOnly ? [] : MOCK_FACTORS);
  const [loading, setLoading] = useState(false);
  const [docId] = useState(params?.docId || null);

  const displayScore = score ?? 0;
  const trend = [0.45, 0.48, 0.5, 0.52, 0.51, 0.55, 0.58, 0.6, 0.59, 0.61, 0.62, displayScore];

  // Load risk data if we have a docId
  useEffect(() => {
    if (patientReadOnly) {
      setLoading(true);
      patientService.getMyRisk()
        .then((result) => {
          const nextScore = result.risk_score ?? result.riskScore ?? 0;
          setScore(nextScore);
          setKlass(result.risk_class || result.riskClass || classifyRisk(nextScore));
          if (result.explanation?.top_factors) {
            setFactors(result.explanation.top_factors.map(f => ({
              feature: f.feature,
              value: f.value,
              shap: f.shap || 0.1,
              label: f.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              direction: (f.shap || 0.1) > 0 ? "up" : "down",
            })));
          } else {
            setFactors([]);
          }
        })
        .catch(() => {
          setScore(null);
          setKlass("not scored");
          setFactors([]);
        })
        .finally(() => setLoading(false));
      return;
    }

    if (!docId) return;

    setLoading(true);
    riskService.get(docId)
      .then((result) => {
        if (result && result.risk_score !== undefined) {
          setScore(result.risk_score || result.riskScore);
          setKlass(result.risk_class || result.riskClass || classifyRisk(result.risk_score || result.riskScore));
          if (result.explanation?.top_factors) {
            setFactors(result.explanation.top_factors.map(f => ({
              feature: f.feature,
              value: f.value,
              shap: f.shap || 0.1,
              label: f.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              direction: (f.shap || 0.1) > 0 ? "up" : "down",
            })));
          }
        }
      })
      .catch(() => { /* keep mock data */ })
      .finally(() => setLoading(false));
  }, [docId, patientReadOnly]);

  const runPrediction = async () => {
    if (patientReadOnly) return;
    if (!docId) {
      addToast({ kind: "info", text: "No document selected for prediction" });
      return;
    }
    setLoading(true);
    try {
      const result = await riskService.predict(docId);
      setScore(result.risk_score || result.riskScore || 0);
      setKlass(result.risk_class || result.riskClass || 'low');
      if (result.explanation?.top_factors) {
        setFactors(result.explanation.top_factors.map(f => ({
          feature: f.feature,
          value: f.value,
          shap: f.shap || 0.1,
          label: f.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          direction: (f.shap || 0.1) > 0 ? "up" : "down",
        })));
      }
      addToast({ kind: "ok", text: `Risk scored: ${result.risk_class || result.riskClass}` });
    } catch (err) {
      addToast({ kind: "danger", text: err.response?.data?.error || "Prediction failed" });
    }
    setLoading(false);
  };

  const isHigh = klass === "high";
  const hasRiskScore = score !== null;

  return (
    <div className="stagger">
      <div className="page-head">
        <div>
          <div className="crumb"><span onClick={() => goto("dashboard")} style={{ cursor: "pointer" }}>Workspace</span><Icon name="chev-r" size={12} /><span>Risk</span>{docId && <><Icon name="chev-r" size={12} /><span className="mono">{typeof docId === 'string' && docId.length > 12 ? docId.slice(0, 8) + '...' : docId}</span></>}</div>
          <h1>Readmission <em>risk</em>.</h1>
          <p>
            {patientReadOnly
              ? "Your latest readmission risk score from your approved care records. Contact your care team if you have questions."
              : "Estimated probability of unplanned hospitalization within 30 days, with the top features driving the prediction."}
          </p>
        </div>
        {!patientReadOnly && (
          <div className="actions">
            {docId && <GradientButton size="sm" variant="ghost" icon="sparkle" onClick={runPrediction} disabled={loading}>{loading ? "Predicting..." : "Run prediction"}</GradientButton>}
            <GradientButton size="sm" variant="ghost" icon="audit">Compare cohort</GradientButton>
            <GradientButton size="sm" variant="primary" icon="comment" onClick={() => addToast({ kind: "info", text: "Risk note shared with care team" })}>Share with team</GradientButton>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div className="muted">Running risk prediction...</div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) 1.1fr", gap: 14 }}>
            <GlassCard strong xl style={{ padding: 28, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 50% at 80% 0%, color-mix(in srgb, var(--${isHigh ? "danger" : klass === "medium" ? "warn" : "ok"}) 22%, transparent), transparent 60%)`, pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <div className="eyebrow">30-day readmission probability</div>
                <RiskGauge score={displayScore} klass={hasRiskScore ? klass : "low"} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11.5, color: "var(--ink-3)" }}>
                  <span>Low &lt; 0.20</span><span>Medium 0.20 – 0.35</span><span style={{ color: "var(--danger)", fontWeight: 600 }}>High &ge; 0.35</span>
                </div>
                {!hasRiskScore && (
                  <div style={{ marginTop: 22, padding: 14, background: "var(--glass-inner)", border: "1px solid var(--glass-border-soft)", borderRadius: "var(--r-3)", fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
                    No risk score has been published for your patient record yet.
                  </div>
                )}
                {isHigh && !patientReadOnly && (
                  <div style={{ marginTop: 22, padding: 14, background: "var(--danger-bg)", border: "1px solid color-mix(in srgb, var(--danger) 35%, transparent)", borderRadius: "var(--r-3)", display: "flex", gap: 12 }}>
                    <Icon name="warn" size={18} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)" }}>High-risk recommendation</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.5 }}>
                        Consider increased visit frequency for the first two weeks. Schedule a post-discharge home check. Confirm tele-monitoring is active for daily weights.
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 22 }}>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>30-day trend</div>
                  <Sparkline data={trend} stroke={isHigh ? "var(--danger)" : klass === "medium" ? "var(--warn)" : "var(--ok)"} fill={`color-mix(in srgb, var(--${isHigh ? "danger" : klass === "medium" ? "warn" : "ok"}) 18%, transparent)`} w={360} h={64} />
                </div>
              </div>
            </GlassCard>

            <GlassCard strong style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div className="eyebrow">Feature contributions</div>
                  <h3 className="display" style={{ fontSize: 22, marginTop: 2 }}>What&apos;s <em>driving</em> the score</h3>
                </div>
                <span className="pill pill--neutral" style={{ height: 20 }}>xgboost-v0.3</span>
              </div>
              {(() => {
                const maxAbs = Math.max(...factors.map(f => Math.abs(f.shap)), 0.01);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {factors.length === 0 && (
                      <div className="muted" style={{ fontSize: 12.5 }}>No risk factor breakdown is available for this patient record yet.</div>
                    )}
                    {factors.map(f => (
                      <div key={f.feature}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, fontSize: 12.5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Icon name={f.direction === "up" ? "trend-up" : "trend-dn"} size={12} style={{ color: f.direction === "up" ? "var(--danger)" : "var(--ok)" }} />
                            <span style={{ fontWeight: 500 }}>{f.label}</span>
                            <span className="mono muted" style={{ fontSize: 10.5 }}>{f.feature}</span>
                          </div>
                          <span className="mono" style={{ fontSize: 11.5, color: f.direction === "up" ? "var(--danger)" : "var(--ok)", fontWeight: 600 }}>{f.shap > 0 ? "+" : ""}{f.shap.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--glass-inner)", border: "1px solid var(--glass-border-soft)" }}>
                          <div style={{
                            width: `${Math.abs(f.shap) / maxAbs * 100}%`,
                            background: f.direction === "up" ? "linear-gradient(90deg, color-mix(in srgb, var(--danger) 65%, transparent), var(--danger))" : "linear-gradient(90deg, color-mix(in srgb, var(--ok) 65%, transparent), var(--ok))",
                            transition: "width 480ms var(--ease)",
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              {!patientReadOnly && (
                <>
                  <div className="divider" style={{ margin: "18px 0 14px" }} />
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Comparable cohort</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {[
                      { l: "CHF · 75–80 yo", v: 0.54, n: 218 },
                      { l: "Same agency, 90d", v: 0.38, n: 42 },
                      { l: "All patients", v: 0.23, n: "1.8k" },
                    ].map(c => (
                      <div key={c.l} style={{ padding: 12, background: "var(--glass-inner)", borderRadius: 8, border: "1px solid var(--glass-border-soft)" }}>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.l}</div>
                        <div className="display" style={{ fontSize: 24, marginTop: 2 }}>{Math.round(c.v * 100)}%</div>
                        <div className="mono muted" style={{ fontSize: 10.5 }}>n = {c.n}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </GlassCard>
          </div>

          {!patientReadOnly && (
            <>
              <div className="spacer" />
              <GlassCard strong style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--glass-border-soft)" }}>
                  <div className="eyebrow">Caseload</div>
                  <h3 className="display" style={{ fontSize: 22, marginTop: 2 }}>All <em>active</em> patients by risk</h3>
                </div>
                <table className="tbl">
                  <thead><tr><th>Patient</th><th>Primary diagnosis</th><th>SOC</th><th style={{ width: 280 }}>Risk score</th><th style={{ width: 90 }}>Class</th><th style={{ width: 80 }}>Trend</th></tr></thead>
                  <tbody>
                    {MOCK_PATIENTS.map(p => (
                      <tr key={p.id} onClick={() => goto("patient", { patientId: p.id })}>
                        <td><div className="row"><Avatar name={p.name} size={26} /><div><div style={{ fontWeight: 500 }}>{p.name}</div><div className="mono muted" style={{ fontSize: 11 }}>{p.id}</div></div></div></td>
                        <td className="muted" style={{ fontSize: 12.5 }}>{p.primary_dx}</td>
                        <td className="muted">{p.soc}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, height: 6, background: "var(--glass-inner)", border: "1px solid var(--glass-border-soft)", borderRadius: 999, overflow: "hidden" }}>
                              <div style={{ width: `${p.risk * 100}%`, height: "100%", background: p.riskClass === "high" ? "linear-gradient(90deg, var(--warn), var(--danger))" : p.riskClass === "medium" ? "linear-gradient(90deg, var(--info), var(--warn))" : "linear-gradient(90deg, var(--ok-bg), var(--ok))", borderRadius: 999 }} />
                            </div>
                            <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, width: 38 }}>{p.risk.toFixed(2)}</span>
                          </div>
                        </td>
                        <td><span className={`pill pill--${p.riskClass === "high" ? "danger" : p.riskClass === "medium" ? "warn" : "ok"}`}>{p.riskClass}</span></td>
                        <td><Sparkline data={[p.risk - 0.1, p.risk - 0.05, p.risk - 0.08, p.risk - 0.04, p.risk - 0.02, p.risk]} w={64} h={22} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </>
          )}
        </>
      )}
    </div>
  );
};

function classifyRisk(score) {
  if (score >= 0.35) return 'high';
  if (score >= 0.20) return 'medium';
  return 'low';
}

export default RiskScreen;
