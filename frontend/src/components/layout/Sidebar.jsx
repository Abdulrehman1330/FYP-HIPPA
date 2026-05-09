import { Fragment } from 'react';
import { GlassCard, Icon } from '../ui';
import NavButton from './NavButton';

const MobileMiniCard = ({ onOpen }) => (
  <button onClick={onOpen} className="glass" style={{
    margin: "0 4px 8px", padding: "10px 12px", borderRadius: 10,
    border: "1px solid var(--glass-border-soft)", background: "var(--glass-inner)",
    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    display: "flex", gap: 10, alignItems: "center",
  }}>
    <div style={{
      width: 28, height: 40, borderRadius: 6, flexShrink: 0, position: "relative",
      background: "linear-gradient(180deg, var(--accent-grad-1), var(--accent-grad-2))",
    }}>
      <div style={{ position: "absolute", inset: 3, borderRadius: 4, background: "var(--bg-base)" }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 500 }}>Patient app</div>
      <div className="muted" style={{ fontSize: 10.5 }}>iOS · iPadOS</div>
    </div>
    <Icon name="arrow-r" size={11} style={{ color: "var(--ink-3)" }} />
  </button>
);

const Sidebar = ({ allowedNav, screen, goto, user, showMobile, onSignOut }) => {
  const sections = [...new Set(allowedNav.map(n => n.section))];

  return (
    <GlassCard strong className="nav">
      {sections.map(section => (
        <Fragment key={section}>
          <div className="nav-section">{section}</div>
          {allowedNav.filter(n => n.section === section).map(n => (
            <NavButton
              key={section + "/" + n.key}
              item={n}
              active={screen === n.key}
              onClick={() => goto(n.key, n.key === "patient" && user.role === "PATIENT" ? { id: user.patientId } : {})}
            />
          ))}
        </Fragment>
      ))}

      <div style={{ flex: 1 }} />

      {showMobile && <MobileMiniCard onOpen={() => goto("mobile")} />}

      <div style={{ padding: 10, borderTop: "1px solid var(--glass-border-soft)", marginTop: 8 }}>
        <button className="btn btn--ghost btn--block btn--sm" onClick={onSignOut}>
          <Icon name="logout" size={13} /> Sign out
        </button>
      </div>
    </GlassCard>
  );
};

export default Sidebar;
