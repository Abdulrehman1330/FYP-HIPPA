import { useState, useEffect } from 'react';
import { GlassCard, GradientButton, Icon, Avatar, Modal } from '../../components/ui';
import { adminService } from '../../services';
import api from '../../services/api';

const PatientsScreen = ({ goto, role, addToast }) => {
  const [q, setQ] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add-patient modal
  const [addOpen, setAddOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [clinicians, setClinicians] = useState([]);
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', dateOfBirth: '',
    primaryDoctorId: '', primaryClinicianId: '', mrn: '',
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [creds, setCreds] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      let result;
      if (role === 'ADMIN') {
        result = await adminService.listPatients({ q });
      } else if (role === 'CLINICIAN') {
        const r = await api.get('/clinician/patients', { params: { q } });
        result = r.data.data;
      } else if (role === 'DOCTOR') {
        const r = await api.get('/doctor/patients');
        result = r.data.data;
      }
      const list = result?.patients || [];
      setPatients(list.map(adaptPatient));
    } catch (err) {
      addToast?.({ kind: 'danger', text: err.response?.data?.error || 'Failed to load patients' });
    } finally {
      setLoading(false);
    }
  };

  // Load eligible primaries when ADMIN opens add-patient form
  const loadPrimaries = async () => {
    try {
      const [docs, clins] = await Promise.all([
        adminService.listUsers({ role: 'DOCTOR' }),
        adminService.listUsers({ role: 'CLINICIAN' }),
      ]);
      setDoctors(docs.users || []);
      setClinicians(clins.users || []);
    } catch (err) { /* ignore */ }
  };

  useEffect(() => { refresh(); }, [role]);

  const openAdd = () => {
    setAddOpen(true);
    setAddError('');
    loadPrimaries();
  };

  const submitAdd = async (e) => {
    e?.preventDefault();
    setAddError('');
    if (!form.firstName || !form.lastName || !form.email || !form.dateOfBirth) {
      setAddError('All fields are required'); return;
    }
    if (!form.primaryDoctorId || !form.primaryClinicianId) {
      setAddError('Assign a primary doctor and clinician'); return;
    }
    setAdding(true);
    try {
      const result = await adminService.createPatient(form);
      setCreds(result);
      setAddOpen(false);
      setForm({ email: '', firstName: '', lastName: '', dateOfBirth: '', primaryDoctorId: '', primaryClinicianId: '', mrn: '' });
      refresh();
    } catch (err) {
      setAddError(err.response?.data?.error || 'Could not create patient');
    } finally {
      setAdding(false);
    }
  };

  const list = patients.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(q.toLowerCase()) ||
    (p.mrn || '').toLowerCase().includes(q.toLowerCase())
  );

  const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 6 };

  const canAdd = role === 'ADMIN';

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <div className="crumb"><span onClick={() => goto('dashboard')} style={{ cursor: 'pointer' }}>Workspace</span><Icon name="chev-r" size={12} /><span>Patients</span></div>
          <h1>{role === 'DOCTOR' ? 'My ' : role === 'CLINICIAN' ? 'My ' : 'All '}<em>patients</em>.</h1>
          <p>
            {role === 'ADMIN' && 'All patients in this clinic. Click to view a patient or add a new one to provision portal access.'}
            {role === 'CLINICIAN' && 'Patients on your caseload. Click a patient to open their chart.'}
            {role === 'DOCTOR' && 'Patients assigned to you as primary doctor. Read-only access.'}
          </p>
        </div>
        <div className="actions">
          <input className="input" placeholder="Search by name, email, or MRN..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 260 }} />
          {canAdd && <GradientButton size="sm" variant="primary" icon="plus" onClick={openAdd}>Add patient</GradientButton>}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }} className="muted">Loading patients...</div>
      ) : list.length === 0 ? (
        <GlassCard strong style={{ padding: 60, textAlign: 'center' }}>
          <Icon name="user" size={36} style={{ color: 'var(--ink-3)', marginBottom: 12 }} />
          <div className="display" style={{ fontSize: 22 }}>No <em>patients</em> yet</div>
          <p className="muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 20 }}>
            {canAdd ? 'Add your first patient to provision their portal access and start building care plans.' : 'No patients on your caseload yet.'}
          </p>
          {canAdd && <GradientButton variant="primary" icon="plus" onClick={openAdd}>Add patient</GradientButton>}
        </GlassCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {list.map(p => (
            <GlassCard key={p.id} strong style={{ padding: 18, cursor: 'pointer' }} onClick={() => goto('patient', { patientId: p.id })}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                <Avatar name={p.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }} className="clamp-1">{p.name}</div>
                  <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{p.mrn} · DOB {p.dob}</div>
                </div>
                <span className="pill pill--ok" style={{ fontSize: 10, height: 20 }}><Icon name="check" size={10} /> Portal</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', padding: '10px 12px', background: 'var(--glass-inner)', borderRadius: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, fontSize: 11.5 }}>
                  {p.primaryDoctor && <span><b>Dr</b> {p.primaryDoctor}</span>}
                  {p.primaryClinician && <span>·</span>}
                  {p.primaryClinician && <span><b>RN</b> {p.primaryClinician}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-3)' }}>
                <span>Enrolled {p.enrolledAt}</span>
                <span>{p.docCount} {p.docCount === 1 ? 'document' : 'documents'}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* ADD PATIENT MODAL */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a new patient">
        <form onSubmit={submitAdd}>
          <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
            We&apos;ll create a patient portal account with a temporary password and email it to the patient. Assign a primary doctor and clinician to scope their care.
          </p>

          {addError && (
            <div style={{ padding: 10, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, marginBottom: 14, fontSize: 13, color: '#991b1b' }}>{addError}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={labelStyle}>First name</label><input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
            <div><label style={labelStyle}>Last name</label><input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Patient email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={labelStyle}>Date of birth</label><input className="input" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required /></div>
            <div><label style={labelStyle}>MRN <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(optional — auto-generated)</span></label><input className="input" value={form.mrn} onChange={(e) => setForm({ ...form, mrn: e.target.value })} placeholder="auto" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Primary doctor</label>
              <select className="input" value={form.primaryDoctorId} onChange={(e) => setForm({ ...form, primaryDoctorId: e.target.value })} required>
                <option value="">— Select doctor —</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Primary clinician</label>
              <select className="input" value={form.primaryClinicianId} onChange={(e) => setForm({ ...form, primaryClinicianId: e.target.value })} required>
                <option value="">— Select clinician —</option>
                {clinicians.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
            <GradientButton variant="ghost" type="button" onClick={() => setAddOpen(false)}>Cancel</GradientButton>
            <GradientButton variant="primary" type="submit" disabled={adding}>{adding ? 'Creating...' : 'Create & email credentials'}</GradientButton>
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS MODAL */}
      <Modal open={!!creds} onClose={() => setCreds(null)} title="Patient created">
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
                {creds.emailDelivered
                  ? `Credentials emailed to ${creds.patient?.user?.email}`
                  : creds.emailConfigured === false
                    ? 'Email is not configured on the server. Share these credentials manually.'
                    : `Email failed: ${creds.emailReason}. Share these credentials manually.`}
              </div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}><b>Name:</b> {creds.patient?.user?.firstName} {creds.patient?.user?.lastName}</div>
              <div style={{ fontSize: 13, marginBottom: 6 }}><b>MRN:</b> <span className="mono">{creds.patient?.mrn}</span></div>
              <div style={{ fontSize: 13, marginBottom: 6 }}><b>Email:</b> <span className="mono">{creds.patient?.user?.email}</span></div>
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

function adaptPatient(p) {
  // Backend Patient row from /admin/patients or /clinician/patients
  return {
    id: p.id,
    mrn: p.mrn || '—',
    name: p.user ? `${p.user.firstName} ${p.user.lastName}` : '—',
    email: p.user?.email || '—',
    dob: p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '—',
    enrolledAt: p.enrolledAt ? new Date(p.enrolledAt).toLocaleDateString() : (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'),
    primaryDoctor: p.primaryDoctor ? `${p.primaryDoctor.firstName?.[0] || ''}. ${p.primaryDoctor.lastName || ''}`.trim() : null,
    primaryClinician: p.primaryClinician ? `${p.primaryClinician.firstName?.[0] || ''}. ${p.primaryClinician.lastName || ''}`.trim() : null,
    docCount: p._count?.documents || 0,
  };
}

export default PatientsScreen;
