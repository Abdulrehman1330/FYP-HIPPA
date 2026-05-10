import { useState } from 'react';
import { GlassCard, GradientButton, Icon } from '../../components/ui';
import { useAuth } from '../../context';

const AuthScreen = ({ onLogin }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setApiError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";

    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";

    if (mode === "register") {
      if (!firstName.trim()) errs.firstName = "First name is required";
      if (!lastName.trim()) errs.lastName = "Last name is required";
      if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    setApiError("");
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        // Self-signup is always a clinician account.
        // Patient logins are created by clinicians from inside the app.
        // Admin role is reserved and assigned by email server-side.
        await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: "CLINICIAN",
        });
      }
      onLogin();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || "Something went wrong";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--ink-2)", marginBottom: 6 };
  const errorStyle = { display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--danger)", marginTop: 6 };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 0,
    }}>
      {/* LEFT — branded panel */}
      <div style={{
        background: "linear-gradient(135deg, #0f3a37 0%, #1f6f6b 60%, #2a8a82 100%)",
        color: "#ffffff",
        padding: "56px 64px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative gradient orbs */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,177,163,0.4), transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,125,86,0.25), transparent 70%)", filter: "blur(40px)" }} />

        {/* Brand */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, backdropFilter: "blur(10px)" }}>H</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>HippaClinical</div>
            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.08em", textTransform: "uppercase" }}>Clinical Intake AI</div>
          </div>
        </div>

        {/* Main message */}
        <div style={{ position: "relative", maxWidth: 520 }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: 0,
            color: "#ffffff",
          }}>
            Intake that thinks. Review that protects.
          </h1>
          <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.6, marginTop: 22, maxWidth: 460 }}>
            HIPAA-compliant OASIS-E2 document intake with AI-powered field extraction, confidence scoring, and auditable clinician review.
          </p>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 36 }}>
            {[
              { k: "97.4%", v: "OCR field accuracy" },
              { k: "<12s", v: "Average extraction time" },
              { k: "100%", v: "Audit trail coverage" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "16px 18px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, backdropFilter: "blur(8px)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400 }}>{s.k}</div>
                <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 4, lineHeight: 1.4 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer compliance */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, fontSize: 12, opacity: 0.7 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name="shield" size={14} /> SOC 2 + HIPAA</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>End-to-end encrypted</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>FYP · 2026</span>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 56px",
        background: "#ffffff",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Tab switcher */}
          <div style={{
            display: "inline-flex",
            background: "#f1f5f9",
            padding: 4,
            borderRadius: 10,
            marginBottom: 36,
          }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{
                border: 0,
                padding: "8px 18px",
                borderRadius: 8,
                background: mode === m ? "#ffffff" : "transparent",
                color: mode === m ? "var(--ink-1)" : "var(--ink-3)",
                fontWeight: 500,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 160ms ease",
              }}>
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            color: "var(--ink-1)",
            margin: 0,
            marginBottom: 8,
          }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0, marginBottom: 32, lineHeight: 1.5 }}>
            {mode === "login"
              ? "Sign in with your credentials to access the clinical intake workspace."
              : "Provision a workspace to manage OASIS-E2 intake, review, and care planning."}
          </p>

          {apiError && (
            <div style={{
              padding: "12px 14px",
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              borderRadius: 8,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <Icon name="warn" size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#991b1b" }}>{apiError}</span>
            </div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>First name</label>
                  <input
                    className="input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    autoComplete="given-name"
                  />
                  {errors.firstName && <div style={errorStyle}><Icon name="warn" size={11} />{errors.firstName}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input
                    className="input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    autoComplete="family-name"
                  />
                  {errors.lastName && <div style={errorStyle}><Icon name="warn" size={11} />{errors.lastName}</div>}
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Email address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.org"
                autoComplete="email"
              />
              {errors.email && <div style={errorStyle}><Icon name="warn" size={11} />{errors.email}</div>}
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Min 6 characters" : "Enter your password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "transparent",
                    color: "var(--ink-3)",
                    cursor: "pointer",
                    padding: 6,
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <div style={errorStyle}><Icon name="warn" size={11} />{errors.password}</div>}
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label style={labelStyle}>Confirm password</label>
                  <input
                    className="input"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && <div style={errorStyle}><Icon name="warn" size={11} />{errors.confirmPassword}</div>}
                </div>

                <div style={{
                  padding: "12px 14px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}>
                  <Icon name="shield" size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
                    You&apos;ll be registered as a <b>Clinician</b> — full access to upload, review, generate plans of care, and onboard patients.
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
                      Patients receive login credentials by email from their clinician.
                    </div>
                  </div>
                </div>
              </>
            )}

            <GradientButton
              variant="primary"
              size="lg"
              block
              type="submit"
              disabled={loading}
              iconRight={loading ? null : "arrow-r"}
              style={{ marginTop: 8 }}
            >
              {loading
                ? (mode === "login" ? "Signing in..." : "Creating account...")
                : (mode === "login" ? "Sign in" : "Create account")}
            </GradientButton>
          </form>

          {/* Switch mode prompt */}
          <div style={{
            textAlign: "center",
            marginTop: 28,
            paddingTop: 24,
            borderTop: "1px solid var(--glass-border)",
            fontSize: 13,
            color: "var(--ink-3)",
          }}>
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => switchMode("register")} style={{ border: 0, background: "transparent", color: "var(--accent)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13, padding: 0 }}>
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => switchMode("login")} style={{ border: 0, background: "transparent", color: "var(--accent)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13, padding: 0 }}>
                  Sign in
                </button>
              </>
            )}
          </div>

          <div style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 11.5,
            color: "var(--ink-4)",
            lineHeight: 1.6,
          }}>
            By continuing you agree to our{" "}
            <a href="#" style={{ color: "var(--ink-3)", textDecoration: "underline" }}>Business Associate Agreement</a>
            {" "}and{" "}
            <a href="#" style={{ color: "var(--ink-3)", textDecoration: "underline" }}>Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
