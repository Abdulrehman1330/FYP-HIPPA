import { useState } from 'react';
import { GlassCard, GradientButton, Icon, ConfidenceBadge } from '../../components/ui';
import { useAuth } from '../../context';

const AuthScreen = ({ onLogin }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("CLINICIAN");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.includes("@")) errs.email = "Enter a valid email";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (mode === "register") {
      if (!firstName.trim()) errs.firstName = "First name is required";
      if (!lastName.trim()) errs.lastName = "Last name is required";
    }
    setErrors(errs);
    setApiError("");
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, password, firstName, lastName, role });
      }
      onLogin();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || "Something went wrong";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="atmosphere" />
      <div className="auth">
        {/* LEFT - branded glass panel */}
        <GlassCard xl strong className="auth-side fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="brand-mark" style={{ width: 36, height: 36, borderRadius: 11 }}>H</div>
            <div className="brand-name">Hippa<b>Clinical AI</b></div>
          </div>

          <div style={{ position: "relative", maxWidth: 540, marginTop: -40 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>HIPAA-compliant intake · OASIS-E2</div>
            <h1 className="display" style={{ fontSize: 64, lineHeight: 1.0 }}>
              Intake that <em>thinks</em>,<br />
              review that <em>protects</em>.
            </h1>
            <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 22, maxWidth: 460 }}>
              Upload a scanned OASIS-E2 form. Our pipeline extracts every field with confidence scoring, flags anything below threshold, and routes it to the right clinician — fully audit-trailed.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 32, maxWidth: 520 }}>
              {[
                { k: "97.4%", v: "Field-level OCR accuracy on OASIS-E2" },
                { k: "< 12 s", v: "Average extraction time, 4-page form" },
                { k: "100%", v: "Of edits captured in audit trail" },
              ].map((s, i) => (
                <GlassCard key={i} sm style={{ padding: 14 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--accent)" }}>{s.k}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.4 }}>{s.v}</div>
                </GlassCard>
              ))}
            </div>
          </div>

          <div style={{ position: "absolute", right: -60, top: 80, width: 320, height: 220, pointerEvents: "none", opacity: 0.85 }}>
            <GlassCard xl style={{ position: "absolute", right: 30, top: 0, width: 200, padding: 14, transform: "rotate(-3deg)" }}>
              <div className="eyebrow">M0040 · Patient name</div>
              <div className="mono" style={{ fontSize: 14, color: "var(--ink-1)", marginTop: 6 }}>Alexander A. Hill</div>
              <div style={{ marginTop: 8 }}><ConfidenceBadge value={0.96} /></div>
            </GlassCard>
            <GlassCard xl style={{ position: "absolute", right: 100, top: 110, width: 220, padding: 14, transform: "rotate(2deg)" }}>
              <div className="eyebrow">M1021 · Primary diagnosis</div>
              <div className="mono" style={{ fontSize: 13, color: "var(--ink-1)", marginTop: 6 }}>I50.9 — Heart failure</div>
              <div style={{ marginTop: 8 }}><ConfidenceBadge value={0.42} /></div>
            </GlassCard>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--ink-3)", fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="shield" size={14} /> SOC 2 + HIPAA</span>
            <span>·</span>
            <span>End-to-end encrypted</span>
            <span>·</span>
            <span>Azure US-East</span>
          </div>
        </GlassCard>

        {/* RIGHT - form */}
        <GlassCard xl strong className="auth-form-wrap fade-up" style={{ animationDelay: "120ms" }}>
          <div className="form-stack" style={{ margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(0,0,0,0.04)", borderRadius: 999, width: "fit-content", marginBottom: 28 }}>
              {["login", "register"].map(m => (
                <button key={m} onClick={() => { setMode(m); setApiError(""); setErrors({}); }} style={{
                  border: 0, padding: "6px 14px", borderRadius: 999,
                  background: mode === m ? "var(--glass-bg-strong)" : "transparent",
                  color: mode === m ? "var(--ink-1)" : "var(--ink-3)",
                  fontWeight: 500, fontSize: 12.5, cursor: "pointer",
                  boxShadow: mode === m ? "var(--shadow-1)" : "none",
                  textTransform: "capitalize", fontFamily: "inherit",
                }}>{m === "login" ? "Sign in" : "Create account"}</button>
              ))}
            </div>

            <h2 className="display" style={{ fontSize: 38 }}>
              {mode === "login" ? <>Welcome <em>back</em>.</> : <>Create your <em>account</em>.</>}
            </h2>
            <p className="muted" style={{ marginTop: 8, marginBottom: 28, fontSize: 13.5 }}>
              {mode === "login" ? "Sign in with your clinic credentials to access the intake queue." : "Provision a workspace for your home-health agency."}
            </p>

            {apiError && (
              <div style={{ padding: "10px 14px", background: "var(--danger-bg)", border: "1px solid color-mix(in srgb, var(--danger) 35%, transparent)", borderRadius: "var(--r-2)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="warn" size={14} style={{ color: "var(--danger)" }} />
                <span style={{ fontSize: 13, color: "var(--danger)" }}>{apiError}</span>
              </div>
            )}

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "register" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="label">First name</label>
                    <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                    {errors.firstName && <div className="field-error"><Icon name="warn" size={12} />{errors.firstName}</div>}
                  </div>
                  <div>
                    <label className="label">Last name</label>
                    <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                    {errors.lastName && <div className="field-error"><Icon name="warn" size={12} />{errors.lastName}</div>}
                  </div>
                </div>
              )}

              <div>
                <label className="label">Work email</label>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.org" autoComplete="email" />
                {errors.email && <div className="field-error"><Icon name="warn" size={12} />{errors.email}</div>}
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
                {errors.password && <div className="field-error"><Icon name="warn" size={12} />{errors.password}</div>}
              </div>

              {mode === "register" && (
                <div>
                  <label className="label">Role</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {[["ADMIN", "Admin"], ["CLINICIAN", "Clinician"], ["VIEWER", "Viewer"]].map(([k, l]) => (
                      <button key={k} type="button" onClick={() => setRole(k)} className="glass" style={{
                        padding: "10px 8px",
                        border: role === k ? "1px solid var(--accent)" : "1px solid var(--glass-border-soft)",
                        background: role === k ? "var(--accent-soft)" : "var(--glass-bg)",
                        color: role === k ? "var(--accent)" : "var(--ink-2)",
                        fontWeight: 500, fontSize: 12.5, cursor: "pointer",
                        borderRadius: "var(--r-2)", fontFamily: "inherit",
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "login" && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginTop: -2 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-3)" }}>
                    <input type="checkbox" defaultChecked /> Remember this device
                  </label>
                  <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>Forgot password</a>
                </div>
              )}

              <GradientButton variant="primary" size="lg" block type="submit" iconRight="arrow-r">
                {loading ? (mode === "login" ? "Signing in..." : "Creating account...") : (mode === "login" ? "Sign in" : "Create account")}
              </GradientButton>
            </form>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--ink-3)" }}>
              By continuing you agree to our <a href="#" style={{ color: "var(--ink-2)" }}>BAA</a> and <a href="#" style={{ color: "var(--ink-2)" }}>privacy policy</a>.
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
};

export default AuthScreen;
