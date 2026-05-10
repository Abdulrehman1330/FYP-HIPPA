import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Modal } from '../../components/ui';
import { superService } from '../../services';

const ClinicsScreen = ({ goto, addToast }) => {
  const [clinics, setClinics] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [adminOpen, setAdminOpen] = useState(null); // clinic obj when opening admin form
  const [adminForm, setAdminForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [adminCreds, setAdminCreds] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [cl, mt] = await Promise.all([superService.listClinics(), superService.metrics()]);
      setClinics(cl.clinics || []);
      setMetrics(mt);
    } catch (err) {
      addToast?.({ kind: 'danger', text: 'Failed to load clinics' });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refresh(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await superService.createClinic(name.trim());
      addToast?.({ kind: 'ok', text: `Clinic "${name}" created` });
      setName(''); setCreateOpen(false);
      refresh();
    } catch (err) {
      addToast?.({ kind: 'danger', text: err.response?.data?.error || 'Create failed' });
    } finally {
      setCreating(false);
    }
  };

  const submitAdmin = async (e) => {
    e?.preventDefault();
    try {
      const result = await superService.createInitialAdmin(adminOpen.id, adminForm);
      setAdminCreds({ user: result, plainPassword: adminForm.password });
      setAdminOpen(null);
      setAdminForm({ email: '', password: '', firstName: '', lastName: '' });
      refresh();
    } catch (err) {
      addToast?.({ kind: 'danger', text: err.response?.data?.error || 'Could not create admin' });
    }
  };

  const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 6 };

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="crumb"><span>Platform</span><Icon name="chev-r" size={12} /><span>Clinics</span></div>
          <h1>Tenant <em>clinics</em>.</h1>
          <p>Each clinic is an isolated tenant. Create a clinic, then provision its initial Admin to begin onboarding clinicians and patients.</p>
        </div>
        <div className="actions">
          <GradientButton variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>New clinic</GradientButton>
        </div>
      </div>

      {/* METRICS */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            ['Clinics', metrics.clinics],
            ['Users', metrics.users],
            ['Patients', metrics.patients],
            ['Documents', metrics.documents],
            ['Audit entries', metrics.auditLogEntries],
          ].map(([k, v]) => (
            <GlassCard key={k} strong style={{ padding: 18 }}>
              <div className="eyebrow">{k}</div>
              <div className="display" style={{ fontSize: 32, marginTop: 6 }}>{v.toLocaleString()}</div>
            </GlassCard>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }} className="muted">Loading...</div>
      ) : (
        <GlassCard strong style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tbl">
            <thead><tr><th>Clinic</th><th>Status</th><th>Users</th><th>Patients</th><th>Documents</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {clinics.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className="mono muted" style={{ fontSize: 11 }}>{c.id.slice(0, 8)}...</div>
                  </td>
                  <td><span className={`pill pill--${c.status === 'ACTIVE' ? 'ok' : c.status === 'SUSPENDED' ? 'warn' : 'danger'}`}>{c.status}</span></td>
                  <td>{c._count?.users || 0}</td>
                  <td>{c._count?.patients || 0}</td>
                  <td>{c._count?.documents || 0}</td>
                  <td className="muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn--ghost btn--sm" onClick={() => setAdminOpen(c)}>+ Admin</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* CREATE CLINIC MODAL */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create new clinic">
        <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
          A clinic is an isolated tenant. Once created, you can provision an Admin who will manage users and patients within that clinic.
        </p>
        <label style={labelStyle}>Clinic name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Northgate Home Health" autoFocus />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
          <GradientButton variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</GradientButton>
          <GradientButton variant="primary" onClick={create} disabled={creating || !name.trim()}>{creating ? 'Creating...' : 'Create clinic'}</GradientButton>
        </div>
      </Modal>

      {/* CREATE INITIAL ADMIN MODAL */}
      <Modal open={!!adminOpen} onClose={() => setAdminOpen(null)} title={adminOpen ? `New admin for ${adminOpen.name}` : ''}>
        <form onSubmit={submitAdmin}>
          <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
            This admin will manage users and patients within <b>{adminOpen?.name}</b>. They&apos;ll be required to change their password on first login.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={labelStyle}>First name</label><input className="input" value={adminForm.firstName} onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })} required /></div>
            <div><label style={labelStyle}>Last name</label><input className="input" value={adminForm.lastName} onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })} required /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Email</label><input className="input" type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required /></div>
          <div style={{ marginBottom: 20 }}><label style={labelStyle}>Initial password</label><input className="input" type="text" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="Min 8 chars" required /><div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>Admin will be forced to change this on first login.</div></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
            <GradientButton variant="ghost" type="button" onClick={() => setAdminOpen(null)}>Cancel</GradientButton>
            <GradientButton variant="primary" type="submit">Create admin</GradientButton>
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS DISPLAY */}
      <Modal open={!!adminCreds} onClose={() => setAdminCreds(null)} title="Admin account created">
        {adminCreds && (
          <div>
            <div style={{ padding: 14, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, marginBottom: 16, display: 'flex', gap: 10 }}>
              <Icon name="check" size={16} style={{ color: '#059669' }} />
              <div style={{ fontSize: 13, color: '#065f46' }}>Account ready. Share these credentials securely with the new admin.</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}><b>Email:</b> <span className="mono">{adminCreds.user.email}</span></div>
              <div style={{ fontSize: 13 }}><b>Password:</b> <span className="mono">{adminCreds.plainPassword}</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <GradientButton variant="primary" onClick={() => setAdminCreds(null)}>Done</GradientButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClinicsScreen;
