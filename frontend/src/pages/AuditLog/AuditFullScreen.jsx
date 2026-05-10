import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar } from '../../components/ui';
import { adminService, superService } from '../../services';

const AuditFullScreen = ({ scope = 'clinic' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetcher = scope === 'platform' ? superService.auditLog({ limit: 100 }) : adminService.auditLog({ limit: 100 });
    fetcher
      .then(r => setItems(r.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [scope]);

  const filtered = items.filter(e => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return e.action.toLowerCase().includes(f)
      || `${e.user?.firstName || ''} ${e.user?.lastName || ''}`.toLowerCase().includes(f)
      || (e.user?.email || '').toLowerCase().includes(f);
  });

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="crumb"><span>{scope === 'platform' ? 'Platform' : 'Administration'}</span><Icon name="chev-r" size={12} /><span>Audit log</span></div>
          <h1>Audit <em>log</em>.</h1>
          <p>{scope === 'platform' ? 'Platform-wide immutable record across all clinics. HIPAA §164.312(b).' : 'Immutable record of every action in this clinic. Required for HIPAA §164.312(b).'}</p>
        </div>
        <div className="actions">
          <input className="input" placeholder="Filter by action or user..." value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 260 }} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }} className="muted">Loading audit log...</div>
      ) : (
        <GlassCard strong style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 160 }}>When</th>
                <th>Actor</th>
                <th>Action</th>
                {scope === 'platform' && <th>Clinic</th>}
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{new Date(e.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                  <td>
                    <div className="row">
                      <Avatar name={e.user ? `${e.user.firstName} ${e.user.lastName}` : 'System'} size={22} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{e.user ? `${e.user.firstName} ${e.user.lastName}` : 'System'}</div>
                        {e.user?.email && <div className="muted" style={{ fontSize: 10.5 }}>{e.user.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="pill pill--neutral mono" style={{ fontSize: 11 }}>{e.action}</span></td>
                  {scope === 'platform' && <td>{e.clinic?.name || <span className="muted">— platform —</span>}</td>}
                  <td className="muted" style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>
                    {e.details ? JSON.stringify(e.details).slice(0, 80) : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={scope === 'platform' ? 5 : 4} style={{ textAlign: 'center', padding: 40 }} className="muted">No matching events</td></tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
};

export default AuditFullScreen;
