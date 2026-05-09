import { GlassCard, Icon } from '../../components/ui';

const MobileShowcase = ({ goto }) => (
  <div className="fade-up">
    <div className="page-head">
      <div>
        <div className="crumb"><span onClick={() => goto("dashboard")} style={{ cursor: "pointer" }}>Workspace</span><Icon name="chev-r" size={12} /><span>Patient app</span></div>
        <h1>Patient <em>app</em>.</h1>
        <p>The same design system, distilled for caregivers. Used for plan-of-care visibility, medication confirmation, and appointment check-ins.</p>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "flex-start" }}>
      {/* PHONE */}
      <div style={{ display: "grid", placeItems: "center", padding: "20px 0" }}>
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-screen" style={{ background: "var(--bg-base)" }}>
            <div className="atmosphere" style={{ position: "absolute", borderRadius: 36 }} />
            <div style={{ position: "relative", height: "100%", padding: "44px 14px 14px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0 14px", fontSize: 12, fontWeight: 600 }}>
                <span>9:41</span>
                <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <svg width="14" height="9" viewBox="0 0 14 9" fill="currentColor"><path d="M0 7h2v2H0zM3 5h2v4H3zM6 3h2v6H6zM9 1h2v8H9zM12 0h2v9h-2z" /></svg>
                </span>
              </div>
              <div style={{ padding: "8px 6px 0" }}>
                <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: 0.05 }}>SUNDAY · MAY 10</div>
                <div className="display" style={{ fontSize: 28, lineHeight: 1.1, marginTop: 4 }}>Hi <em>Linh</em>,<br />here&apos;s your day.</div>
              </div>
              <GlassCard strong style={{ padding: 14, borderRadius: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="eyebrow" style={{ fontSize: 9.5 }}>PLAN OF CARE</div>
                  <span className="pill pill--ok" style={{ height: 16, fontSize: 9 }}>Active</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 6 }}>Post-fracture rehab</div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>Day 4 of 60 · Dr. J. Patel</div>
                <div style={{ height: 4, background: "var(--glass-inner)", borderRadius: 999, marginTop: 10, overflow: "hidden" }}>
                  <div style={{ width: "7%", height: "100%", background: "linear-gradient(90deg, var(--accent-grad-1), var(--accent-grad-2))" }} />
                </div>
              </GlassCard>
              <div style={{ padding: "4px 4px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div className="eyebrow" style={{ fontSize: 9.5 }}>TODAY</div>
                  <span className="muted" style={{ fontSize: 10.5 }}>3 of 5</span>
                </div>
                {[
                  { t: "Take Lisinopril 10 mg", time: "8:00 AM", done: true, kind: "med" },
                  { t: "Check weight, log in app", time: "9:00 AM", done: true, kind: "task" },
                  { t: "PT visit · R. Owens", time: "11:00 AM", done: false, kind: "visit" },
                  { t: "Walk 100 ft (2x)", time: "2:00 PM", done: false, kind: "task" },
                ].map((t, i) => (
                  <GlassCard key={i} sm style={{ padding: 10, borderRadius: 12, marginBottom: 6, display: "flex", alignItems: "center", gap: 10, opacity: t.done ? 0.6 : 1 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: t.done ? "var(--ok)" : "var(--glass-inner)", border: "1px solid " + (t.done ? "var(--ok)" : "var(--glass-border-soft)"), display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
                      {t.done && <Icon name="check" size={11} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, textDecoration: t.done ? "line-through" : "none" }}>{t.t}</div>
                      <div className="muted" style={{ fontSize: 10.5 }}>{t.time}</div>
                    </div>
                    <Icon name={t.kind === "med" ? "doc" : t.kind === "visit" ? "user" : "check"} size={13} style={{ color: "var(--accent)" }} />
                  </GlassCard>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", left: 12, right: 12, bottom: 14, display: "flex", justifyContent: "space-around", padding: "10px 8px", background: "var(--glass-bg-strong)", backdropFilter: "blur(20px)", borderRadius: 22, border: "1px solid var(--glass-border-soft)" }}>
              {[
                { i: "dashboard", l: "Today", a: true },
                { i: "poc", l: "Plan" },
                { i: "doc", l: "Records" },
                { i: "user", l: "Account" },
              ].map(t => (
                <div key={t.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", color: t.a ? "var(--accent)" : "var(--ink-3)", fontSize: 9.5, gap: 2 }}>
                  <Icon name={t.i} size={16} />
                  <span>{t.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SPEC */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 24 }}>
        <GlassCard strong style={{ padding: 22 }}>
          <div className="eyebrow">Caregiver-facing</div>
          <h3 className="display" style={{ fontSize: 26, marginTop: 4 }}>One screen,<br /><em>everything that matters today.</em></h3>
          <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>The patient app shares the same color tokens, glass surfaces, and Instrument-Serif headlines as the clinician workstation. Caregivers see only the items the clinician marked as patient-visible.</p>
        </GlassCard>
        <GlassCard strong style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>What&apos;s reused</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["Color tokens", "100%"],
              ["Type system", "100%"],
              ["GlassCard surfaces", "100%"],
              ["StatusPill / Confidence", "Adapted"],
              ["Tab bar (mobile only)", "New"],
              ["Tasks list pattern", "New"],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: 12, background: "var(--glass-inner)", borderRadius: 8, border: "1px solid var(--glass-border-soft)" }}>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  </div>
);

export default MobileShowcase;
