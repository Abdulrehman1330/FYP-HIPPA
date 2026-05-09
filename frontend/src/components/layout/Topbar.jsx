import { GlassCard, Icon, Avatar } from '../ui';

const Topbar = ({ user, role }) => (
  <GlassCard strong className="topbar">
    <div className="search">
      <Icon name="search" size={14} />
      <input placeholder="Search documents, patients, OASIS codes..." />
      <kbd>Ctrl K</kbd>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "var(--glass-inner)", borderRadius: 999, border: "1px solid var(--glass-border-soft)" }}>
      <Icon name="shield" size={12} style={{ color: "var(--accent)" }} />
      <span style={{ fontSize: 11.5, fontWeight: 500, color: "var(--ink-2)" }}>{role}</span>
    </div>

    <button className="btn btn--ghost btn--icon" title="Notifications" style={{ position: "relative" }}>
      <Icon name="bell" size={15} />
      <span style={{
        position: "absolute", top: 7, right: 7, width: 7, height: 7,
        borderRadius: "50%", background: "var(--danger)",
        boxShadow: "0 0 0 2px var(--bg-base)",
      }} />
    </button>

    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "0 6px 0 10px",
      borderLeft: "1px solid var(--glass-border-soft)", marginLeft: 4,
    }}>
      <Avatar name={user.name} size={28} />
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{user.name}</div>
        <div className="muted" style={{ fontSize: 10.5 }}>{user.title}</div>
      </div>
    </div>
  </GlassCard>
);

export default Topbar;
