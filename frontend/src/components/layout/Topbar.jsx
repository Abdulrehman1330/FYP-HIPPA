import { useState, useRef, useEffect } from 'react';
import { GlassCard, Icon, Avatar } from '../ui';

function notificationsForRole(role) {
  const common = [
    { title: "Security reminder", text: "Use synthetic or de-identified data during demo testing.", tone: "neutral", unread: true },
  ];

  if (role === "PATIENT") {
    return [
      { title: "Care plan available", text: "Your latest care-plan summary is ready to review.", tone: "ok", unread: true },
      { title: "Ask evidence-only questions", text: "The assistant answers only from approved care records.", tone: "neutral", unread: true },
      ...common,
    ];
  }

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return [
      { title: "User access review", text: "Review active users and role assignments for the demo clinic.", tone: "warn", unread: true },
      { title: "Audit logs available", text: "Audit activity can be reviewed from the administration menu.", tone: "neutral", unread: true },
      ...common,
    ];
  }

  return [
    { title: "POC drafts ready", text: "Review generated Plan of Care drafts before finalizing.", tone: "ok", unread: true },
    { title: "RAG assistant updated", text: "Patient RAG now retrieves approved evidence for general care-plan questions.", tone: "neutral", unread: true },
    ...common,
  ];
}

const Topbar = ({ user, role, allowedNav = [], goto, onChangePassword, onSignOut }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef();
  const notificationsRef = useRef();
  const searchRef = useRef();
  const searchInputRef = useRef();
  const notifications = notificationsForRole(role);
  const unreadCount = notificationsRead ? 0 : notifications.filter((item) => item.unread).length;
  const searchItems = [
    ...allowedNav.map((item) => ({
      type: 'nav',
      key: item.key,
      label: item.label,
      detail: item.section,
      icon: item.icon,
      searchText: `${item.label} ${item.section} ${item.key}`,
    })),
    { type: 'action', key: 'change-password', label: 'Change password', detail: 'Account security', icon: 'shield', searchText: 'change password security account' },
    { type: 'action', key: 'sign-out', label: 'Sign out', detail: 'End current session', icon: 'logout', searchText: 'logout sign out session' },
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = (normalizedQuery
    ? searchItems.filter((item) => item.searchText.toLowerCase().includes(normalizedQuery))
    : searchItems
  ).slice(0, 6);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setNotificationsOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const runSearchResult = (item) => {
    setSearchOpen(false);
    setQuery('');
    if (item.type === 'nav') goto?.(item.key);
    if (item.key === 'change-password') onChangePassword?.();
    if (item.key === 'sign-out') onSignOut?.();
  };

  return (
    <GlassCard strong className="topbar" style={{ overflow: 'visible' }}>
      <div ref={searchRef} className="search" style={{ position: 'relative' }}>
        <Icon name="search" size={14} />
        <input
          ref={searchInputRef}
          value={query}
          onFocus={() => setSearchOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchResults[0]) runSearchResult(searchResults[0]);
          }}
          placeholder="Search pages, actions, records..."
        />
        <kbd>Ctrl K</kbd>
        {searchOpen && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 'calc(100% + 8px)',
            background: '#ffffff', border: '1px solid var(--glass-border)',
            borderRadius: 12, boxShadow: 'var(--shadow-3)', padding: 6, zIndex: 60,
          }}>
            <div className="eyebrow" style={{ padding: '8px 10px 6px' }}>
              {normalizedQuery ? `Search results for "${query.trim()}"` : 'Quick navigation'}
            </div>
            {searchResults.length === 0 ? (
              <div className="muted" style={{ padding: '10px', fontSize: 12.5 }}>No matching pages or actions.</div>
            ) : searchResults.map((item) => (
              <button key={`${item.type}-${item.key}`} onClick={() => runSearchResult(item)} style={menuItemStyle}>
                <Icon name={item.icon} size={13} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', color: 'var(--ink-1)' }}>{item.label}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{item.detail}</span>
                </span>
                <Icon name="arrow-r" size={11} style={{ color: 'var(--ink-3)' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clinic context */}
      {user?.clinicName ? (
        <div className="role-pill" style={{
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
        <div className="role-pill" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--accent-soft)', borderRadius: 999 }}>
          <Icon name="shield" size={12} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--accent)' }}>{role}</span>
        </div>
      )}

      <div ref={notificationsRef} style={{ position: 'relative' }}>
        <button
          className="btn btn--ghost btn--icon"
          title="Notifications"
          onClick={(e) => {
            e.stopPropagation();
            setNotificationsOpen((open) => !open);
            setMenuOpen(false);
          }}
          style={{ position: 'relative' }}
        >
          <Icon name="bell" size={15} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 7, right: 7, width: 7, height: 7,
              borderRadius: '50%', background: 'var(--danger)',
              boxShadow: '0 0 0 2px var(--bg-base)',
            }} />
          )}
        </button>

        {notificationsOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 'min(340px, calc(100vw - 24px))',
            background: '#ffffff', border: '1px solid var(--glass-border)',
            borderRadius: 12, boxShadow: 'var(--shadow-3)', padding: 8, zIndex: 55,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px' }}>
              <div>
                <div className="eyebrow">Notifications</div>
                <div className="muted" style={{ fontSize: 11 }}>{unreadCount} unread for {role}</div>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={() => setNotificationsRead(true)}>
                Mark read
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {notifications.map((item) => (
                <div key={item.title} style={{
                  padding: 10, borderRadius: 10, border: '1px solid var(--glass-border-soft)',
                  background: !notificationsRead && item.unread ? 'var(--accent-soft)' : 'var(--glass-inner)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`pill pill--${item.tone}`} style={{ height: 18, fontSize: 10 }}>
                      {!notificationsRead && item.unread ? 'New' : 'Read'}
                    </span>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-1)' }}>{item.title}</div>
                  </div>
                  <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 5 }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
          <div className="user-menu-copy" style={{ lineHeight: 1.1, textAlign: 'left' }}>
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
