import { useEffect, useState } from 'react';
import { GlassCard, GradientButton, Icon, Avatar } from '../../components/ui';
import { patientService, ragService } from '../../services';

const SAFE_PATIENT_QUESTIONS = [
  "What does my care plan say for today?",
  "Why am I seeing a risk score?",
  "What should I ask my care team about my plan?",
  "Can I change my insulin dose?",
];

function readableCitationTitle(citation) {
  return citation.title || String(citation.section || "Evidence")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readableSnippet(snippet = "") {
  return snippet
    .replace(/^Approved extracted field '[^']+':\s*/i, "")
    .replace(/^Approved\/generated Plan of Care section '[^']+':\s*/i, "")
    .trim();
}

function buildDemoPatientAnswer(question, patientName) {
  const normalized = question.toLowerCase();
  const unsafe = /(start|stop|change|increase|decrease|skip|double).*(med|medicine|medication|dose|insulin)/i.test(question);

  if (unsafe) {
    return {
      refused: true,
      confidence: "low",
      answer: "I cannot help change medication or dosage. Please contact your clinician or care team before making any treatment changes.",
      citations: [],
      reason: "Patient-facing assistant cannot provide medication-change advice.",
      source: "demo fallback",
    };
  }

  if (normalized.includes("risk")) {
    return {
      refused: false,
      confidence: "medium",
      answer: `Your risk score is shown from reviewed care-plan information for ${patientName}. It is meant to help your care team monitor you, not to diagnose you or replace clinical advice.`,
      citations: [],
      source: "offline fallback",
    };
  }

  return {
    refused: false,
    confidence: "medium",
    answer: `Simple answer:\nYour approved care-plan information highlights your goals, interventions, and safety instructions.\n\nWhat this means:\n- Follow the plan your care team approved.\n- Use the summary for understanding only.\n- Contact your care team for clinical decisions.`,
    citations: [],
    source: "offline fallback",
  };
}

const PatientDashboard = ({ user, goto }) => {
  const [profile, setProfile] = useState(null);
  const [risk, setRisk] = useState(null);
  const [chatQuestion, setChatQuestion] = useState(SAFE_PATIENT_QUESTIONS[0]);
  const [chatAnswer, setChatAnswer] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([patientService.getMyProfile(), patientService.getMyRisk()])
      .then(([profileResult, riskResult]) => {
        if (cancelled) return;
        if (profileResult.status === 'fulfilled') setProfile(profileResult.value);
        if (riskResult.status === 'fulfilled') setRisk(riskResult.value);
      });
    return () => { cancelled = true; };
  }, []);

  const patientName = profile?.user
    ? `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim()
    : user.name;
  const riskScore = risk?.riskScore ?? risk?.risk_score ?? null;
  const riskClass = risk?.riskClass || risk?.risk_class || 'not scored';

  const myTasks = [
    { t: "Review today's care plan", time: "8:00 AM", done: true, kind: "task" },
    { t: "Log requested vital signs", time: "9:00 AM", done: true, kind: "task" },
    { t: "Check upcoming care-team visit", time: "11:00 AM", done: false, kind: "visit" },
    { t: "Complete approved mobility activity", time: "2:00 PM", done: false, kind: "task" },
    { t: "Follow medication schedule as prescribed", time: "9:00 PM", done: false, kind: "med" },
  ];

  const myKpis = [
    { label: "Plan progress", value: "Day 4",  sub: "of 60",     tone: "ok" },
    { label: "Today's tasks", value: "2 of 5", sub: "completed", tone: "neutral" },
    {
      label: "Risk score",
      value: riskScore === null ? "—" : riskScore.toFixed(2),
      sub: riskClass,
      tone: riskClass === "high" ? "danger" : riskClass === "medium" ? "warn" : riskScore === null ? "neutral" : "ok",
    },
    { label: "Next visit",    value: "Tue",    sub: "Dr. J. Patel", tone: "neutral" },
  ];
  const careTeam = [
    profile?.primaryDoctor && { name: `${profile.primaryDoctor.firstName || ''} ${profile.primaryDoctor.lastName || ''}`.trim(), role: "Primary doctor", primary: true },
    profile?.primaryClinician && { name: `${profile.primaryClinician.firstName || ''} ${profile.primaryClinician.lastName || ''}`.trim(), role: "Primary clinician" },
  ].filter(Boolean);

  const askPatientAssistant = async (question = chatQuestion) => {
    const trimmedQuestion = question.trim();
    setChatQuestion(question);
    if (trimmedQuestion.length < 3) {
      setChatAnswer({
        refused: true,
        confidence: "low",
        answer: "Please ask a complete question about your approved care plan.",
        citations: [],
        reason: "Question is too short to retrieve reliable evidence.",
        source: "local validation",
      });
      return;
    }

    setChatLoading(true);
    try {
      const result = await ragService.askPatient(trimmedQuestion);
      setChatAnswer({ ...result, source: "backend RAG" });
    } catch {
      setChatAnswer(buildDemoPatientAnswer(trimmedQuestion, patientName));
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="stagger">
      <div className="page-head">
        <div>
          <div className="crumb"><span>My health</span><Icon name="chev-r" size={12} /><span>Overview</span></div>
          <h1>Hi, <em>{user.name.split(" ")[0]}</em>.</h1>
          <p>Here's what's on your plan today, and what your care team is watching.</p>
        </div>
        <div className="actions">
          <GradientButton icon="poc" size="sm" variant="ghost" onClick={() => goto("poc")}>My care plan</GradientButton>
          <GradientButton icon="user" variant="primary" size="sm" onClick={() => goto("patient")}>My record</GradientButton>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {myKpis.map((k) => (
          <GlassCard key={k.label} strong style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="eyebrow">{k.label}</div>
              <span className={`pill pill--${k.tone}`} style={{ height: 18, fontSize: 10 }}>{k.sub}</span>
            </div>
            <div className="display" style={{ fontSize: 46, lineHeight: 1, color: "var(--ink-1)", marginTop: 8 }}>{k.value}</div>
          </GlassCard>
        ))}
      </div>

      <div className="spacer" />

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
        <GlassCard strong style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--glass-border-soft)" }}>
            <div>
              <div className="eyebrow">Today</div>
              <h3 className="display" style={{ fontSize: 24, marginTop: 2 }}>Your <em>plan</em>, hour by hour</h3>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={() => goto("poc")}>Full plan <Icon name="arrow-r" size={12} /></button>
          </div>
          <div style={{ padding: "10px 16px 16px" }}>
            {myTasks.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: i < myTasks.length - 1 ? "1px dashed var(--glass-border-soft)" : "none", opacity: t.done ? 0.55 : 1 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: t.done ? "var(--ok)" : "transparent", border: "1px solid " + (t.done ? "var(--ok)" : "var(--glass-border-soft)"), display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
                  {t.done && <Icon name="check" size={11} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, textDecoration: t.done ? "line-through" : "none" }}>{t.t}</div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{t.time}</div>
                </div>
                <Icon name={t.kind === "med" ? "doc" : t.kind === "visit" ? "user" : "check"} size={14} style={{ color: "var(--accent)" }} />
              </div>
            ))}
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard strong style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div className="eyebrow">Care plan assistant</div>
                <h3 className="display" style={{ fontSize: 22, marginTop: 4 }}>Ask about <em>your plan</em>.</h3>
              </div>
              <span className="pill pill--neutral" style={{ height: 18, fontSize: 10 }}>
                <Icon name="shield" size={9} /> Evidence only
              </span>
            </div>

            <p className="muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
              This assistant explains approved care-plan information. It cannot diagnose, change medication, or replace your care team.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {SAFE_PATIENT_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="btn btn--ghost btn--sm"
                  onClick={() => askPatientAssistant(q)}
                  disabled={chatLoading}
                  style={{ fontSize: 11 }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="Ask about your approved care plan..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "1px solid var(--glass-border-soft)",
                  borderRadius: 12,
                  background: "var(--glass-inner)",
                  color: "var(--ink-1)",
                  padding: "9px 10px",
                  fontSize: 12.5,
                }}
              />
              <GradientButton size="sm" variant="primary" icon="sparkle" onClick={() => askPatientAssistant()} disabled={chatLoading}>
                {chatLoading ? "Asking..." : "Ask"}
              </GradientButton>
            </div>

            {chatAnswer && (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: chatAnswer.refused ? "rgba(244, 63, 94, 0.08)" : "var(--glass-inner)", border: "1px solid var(--glass-border-soft)" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <span className={`pill pill--${chatAnswer.refused ? "danger" : "ok"}`} style={{ height: 18, fontSize: 10 }}>
                    {chatAnswer.refused ? "Refused" : "Answered"}
                  </span>
                  <span className="pill pill--neutral" style={{ height: 18, fontSize: 10 }}>
                    {chatAnswer.confidence || "low"} confidence
                  </span>
                  <span className="pill pill--neutral" style={{ height: 18, fontSize: 10 }}>
                    {chatAnswer.source || "backend RAG"}
                  </span>
                </div>
                <p style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>{chatAnswer.answer}</p>
                {chatAnswer.reason && (
                  <p className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>Reason: {chatAnswer.reason}</p>
                )}
                {chatAnswer.citations?.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="eyebrow" style={{ fontSize: 10 }}>Sources used</div>
                    {chatAnswer.citations.slice(0, 3).map((citation, index) => (
                      <div key={`${citation.sourceId || citation.source_id || index}`} style={{ fontSize: 11.5, lineHeight: 1.45, padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.45)", border: "1px solid var(--glass-border-soft)" }}>
                        <div style={{ fontWeight: 600, marginBottom: 3 }}>{readableCitationTitle(citation)}</div>
                        <div className="muted" style={{ color: "var(--ink-2)" }}>{readableSnippet(citation.snippet)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          <GlassCard strong style={{ padding: 18 }}>
            <div className="eyebrow">Your care team</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {(careTeam.length > 0 ? careTeam : [{ name: "Care team", role: "Assigned by your clinic", primary: true }]).map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 8, background: m.primary ? "var(--accent-soft)" : "var(--glass-inner)", border: "1px solid var(--glass-border-soft)" }}>
                  <Avatar name={m.name} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{m.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{m.role}</div>
                  </div>
                  {m.primary && <span className="pill pill--ok" style={{ height: 16, fontSize: 9 }}>Primary</span>}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard strong style={{ padding: 18, flex: 1 }}>
            <div className="eyebrow">Privacy</div>
            <h3 className="display" style={{ fontSize: 22, marginTop: 4 }}>You see <em>only your record</em>.</h3>
            <p className="muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
              Patient access is scoped to your authenticated patient profile. Other patients, the upload pipeline, review queue and audit logs are restricted to clinical and admin roles.
            </p>
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              <span className="pill pill--ok"><Icon name="shield" size={10} /> HIPAA scope</span>
              <span className="pill pill--neutral"><Icon name="check" size={10} /> Read-only</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
