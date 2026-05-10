import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar, Modal } from '../../components/ui';
import { adminService } from '../../services';

const ROLE_OPTIONS = [
  { value: 'CLINICIAN', label: 'Clinician', desc: 'Upload, review, sign POCs' },
  { value: 'DOCTOR',    label: 'Doctor',    desc: 'Read-only oversight' },
  { value: 'ADMIN',     label: 'Admin',     desc: 'Manages this clinic' },
];

const UsersScreen = ({ addToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', role: 'CLINICIAN' });
  const [creating, setCreating] = useState(false);
  const [creds, setCreds] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await adminService.listUsers();
      setUsers(result.users || []);
    } catch (err) {
      addToast?.({ kind: 'danger', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refresh(); }, []);

  const submit = async (e) => {
    e?.preventDefault();
    setCreating(true);
    try {
      const r = await adminService.createUser(form);
      setCreds(r);
      setCreateOpen(false);
      setForm({ email: '', firstName: '', lastName: '', role: 'CLINICIAN' });
      refresh();
    } catch (err) {
      addToast?.({ kind: 'danger', text: err.response?.data?.error || 'Create failed' });
    } finally {
      setCreating(false);
    }
  };

  const reset = async (u) => {
    if (!confirm(`Reset password for ${u.firstName} ${u.lastName}? They'll be forced to change it on next login.`)) return;
    try {
      const r = await adminService.resetPassword(u.id);
      setCreds({ user: u, plainPassword: r.plainPassword, emailDelivered: r.emailDelivered, emailReason: r.emailReason });
      refresh();
    } catch (err) {
      addToast?.({ kind: 'danger', text: err.response?.data?.error || 'Reset failed' });
    }
  };

  const toggleStatus = async (u) => {
    try {
      if (u.status === 'DISABLED') await adminService.enableUser(u.id);
      else await adminService.disableUser(u.id);
      refresh();
    } catch (err) {
      addToast?.({ kind: 'danger', text: err.response?.data?.error || 'Update failed' });
    }
  };

  const filtered = filter === 'ALL' ? users : users.filter(u => u.role === filter);
  const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 6 };

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="crumb"><span>Administration</span><Icon name="chev-r" size={12} /><span>Users</span></div>
          <h1>Clinic <em>users</em>.</h1>
          <p>Manage clinicians, doctors, and admins within your clinic. Patient accounts are managed separately under Patients.</p>
        </div>
        <div className="actions">
          <GradientButton variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>New user</GradientButton>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['ALL', 'ADMIN', 'CLINICIAN', 'DOCTOR', 'PATIENT'].map(r => (
          <button key={r} onClick={() => setFilter(r)} className={`btn btn--sm ${filter === r ? 'btn--primary' : 'btn--ghost'}`}>{r}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }} className="muted">Loading...</div>
      ) : (
        <GlassCard strong style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tbl">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last login</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="row">
                      <Avatar name={`${u.firstName} ${u.lastName}`} size={26} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                        <div className="muted" style={{ fontSize: 11 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="pill pill--neutral">{u.role}</span></td>
                  <td>
                    <span className={`pill pill--${u.status === 'ACTIVE' ? 'ok' : 'danger'}`}>{u.status}</span>
                    {u.mustChangePassword && <span className="pill pill--warn" style={{ marginLeft: 6, fontSize: 10 }}>pwd reset</span>}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => reset(u)} title="Reset password">↻</button>
                      <button className="btn btn--ghost btn--sm" onClick={() => toggleStatus(u)} title={u.status === 'ACTIVE' ? 'Disable' : 'Enable'}>{u.status === 'ACTIVE' ? '⏻' : '✓'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* CREATE USER */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create user">
        <form onSubmit={submit}>
          <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
            We&apos;ll generate a temporary password and email it to the user. They&apos;ll be required to change it on first login.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={labelStyle}>First name</label><input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
            <div><label style={labelStyle}>Last name</label><input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {ROLE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setForm({ ...form, role: opt.value })} style={{
                  padding: '12px 10px', textAlign: 'left',
                  border: form.role === opt.value ? '1.5px solid var(--accent)' : '1px solid var(--glass-border)',
                  background: form.role === opt.value ? 'var(--accent-soft)' : '#fff',
                  color: form.role === opt.value ? 'var(--accent)' : 'var(--ink-2)',
                  fontFamily: 'inherit', borderRadius: 8, cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
            <GradientButton variant="ghost" type="button" onClick={() => setCreateOpen(false)}>Cancel</GradientButton>
            <GradientButton variant="primary" type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create & email'}</GradientButton>
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS DISPLAY */}
      <Modal open={!!creds} onClose={() => setCreds(null)} title="Credentials generated">
        {creds && (
          <div>
            <div style={{
              padding: 14,
              background: creds.emailDelivered ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${creds.emailDelivered ? '#a7f3d0' : '#fde68a'}`,
              borderRadius: 10, marginBottom: 16,
              display: 'flex', gap: 10,
            }}>
              <Icon name={creds.emailDelivered ? 'check' : 'warn'} size={16} style={{ color: creds.emailDelivered ? '#059669' : '#d97706' }} />
              <div style={{ fontSize: 13, color: creds.emailDelivered ? '#065f46' : '#92400e' }}>
                {creds.emailDelivered ? `Email sent to ${creds.user?.email || creds.user?.firstName}` : 'Email not configured — share manually.'}
              </div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}><b>Email:</b> <span className="mono">{creds.user?.email}</span></div>
              <div style={{ fontSize: 13 }}><b>Password:</b> <span className="mono">{creds.plainPassword}</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <GradientButton variant="primary" onClick={() => setCreds(null)}>Done</GradientButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersScreen;
