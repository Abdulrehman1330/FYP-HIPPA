import { useState } from 'react';
import { GlassCard, Icon, Avatar } from '../ui';
import { ROLE_USERS } from '../../data';

const RoleSwitcher = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button className="btn btn--ghost btn--sm" onClick={() => setOpen(!open)} style={{ height: 32, gap: 8 }}>
        <Icon name="user" size={12} style={{ color: "var(--accent)" }} />
        Viewing as <b style={{ fontWeight: 600 }}>{value}</b>
        <Icon name="chev-d" size={10} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
          <GlassCard strong xl style={{
            position: "absolute", top: 38, right: 0, width: 260,
            padding: 8, zIndex: 31,
            animation: "fadeUp 200ms var(--ease) both",
          }}>
            <div className="eyebrow" style={{ padding: "8px 10px 4px" }}>Switch role</div>
            {Object.entries(ROLE_USERS).map(([k, u]) => (
              <button key={k} onClick={() => { onChange(k); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                padding: "8px 10px", borderRadius: 6, border: 0,
                background: value === k ? "var(--accent-soft)" : "transparent",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                <Avatar name={u.name} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{u.name}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{u.title}</div>
                </div>
                {value === k && <Icon name="check" size={12} style={{ color: "var(--accent)" }} />}
              </button>
            ))}
            <div style={{ borderTop: "1px solid var(--glass-border-soft)", margin: "6px 0", paddingTop: 6 }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)", padding: "0 10px" }}>
                Role gates the navigation, available actions, and audit-trail visibility.
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default RoleSwitcher;
