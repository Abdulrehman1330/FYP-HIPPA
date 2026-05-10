import { useState, useRef, useEffect } from 'react';
import { GlassCard, Icon, Avatar } from '../ui';

const Topbar = ({ user, role, onChangePassword, onSignOut }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <GlassCard strong className="topbar">
      <div className="search">
        <Icon name="search" size={14} />
        <input placeholder="Search documents, patients, OASIS codes..." />
        <kbd>Ctrl K</kbd>
      </div>

      {/* Clinic context */}
      {user?.clinicName ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
          background: 'var(--glass-inner)', borderRadius: 999,
          border: '1px solid var(--glass-border-soft)',
        }}>
          <Icon name="shield" size={12} style={{ color: 'var(--accent)' }} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-1)' }}>{user.clinicName}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>{role}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--accent-soft)', borderRadius: 999 }}>
          <Icon name="shield" size={12} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--accent)' }}>{role}</span>
        </div>
      )}

      <button className="btn btn--ghost btn--icon" title="Notifications" style={{ position: 'relative' }}>
        <Icon name="bell" size={15} />
        <span style={{
          position: 'absolute', top: 7, right: 7, width: 7, height: 7,
          borderRadius: '50%', background: 'var(--danger)',
          boxShadow: '0 0 0 2px var(--bg-base)',
        }} />
      </button>

      {/* User menu */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 4px 10px',
            borderLeft: '1px solid var(--glass-border-soft)', marginLeft: 4,
            border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Avatar name={user.name} size={28} />
          <div style={{ lineHeight: 1.1, textAlign: 'left' }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{user.name}</div>
            <div className="muted" style={{ fontSize: 10.5 }}>{user.title}</div>
          </div>
          <Icon name="chev-r" size={11} style={{ transform: 'rotate(90deg)', color: 'var(--ink-3)' }} />
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 220,
            background: '#ffffff', border: '1px solid var(--glass-border)',
            borderRadius: 10, boxShadow: 'var(--shadow-3)',
            padding: 6, zIndex: 50,
          }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border-soft)', marginBottom: 4 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-1)' }}>{user.name}</div>
              <div className="muted" style={{ fontSize: 11 }}>{user.email}</div>
            </div>
            <button onClick={() => { setMenuOpen(false); onChangePassword?.(); }} style={menuItemStyle}>
              <Icon name="shield" size={13} /> Change password
            </button>
            <button onClick={() => { setMenuOpen(false); onSignOut?.(); }} style={{ ...menuItemStyle, color: 'var(--danger)' }}>
              <Icon name="x" size={13} /> Sign out
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
  padding: '8px 12px', border: 0, background: 'transparent',
  fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
  cursor: 'pointer', fontFamily: 'inherit', borderRadius: 6,
};

export default Topbar;
