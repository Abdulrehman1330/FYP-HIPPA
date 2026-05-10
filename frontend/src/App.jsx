import { useState, useEffect } from 'react';
import { GlassCard, Toast } from './components/ui';
import { Sidebar, Topbar } from './components/layout';
import { NAV } from './data';
import { useAuth } from './context';
import ChangePasswordModal from './components/ChangePasswordModal';

import { AuthScreen } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { UploadScreen } from './pages/Upload';
import { ReviewScreen } from './pages/Review';
import { PocScreen } from './pages/PlanOfCare';
import { RiskScreen } from './pages/RiskScoring';
import { PatientsScreen } from './pages/Patients';
import { PatientScreen } from './pages/PatientDetail';
import { AuditFullScreen } from './pages/AuditLog';
import { MobileShowcase } from './pages/MobileShowcase';
import { ClinicsScreen } from './pages/SuperClinics';
import { UsersScreen } from './pages/AdminUsers';

// Backend roles map directly to display roles now (no remapping after multi-tenant migration)
const ROLE_TITLES = {
  SUPER_ADMIN: 'Platform administrator',
  ADMIN: 'Clinic administrator',
  CLINICIAN: 'Clinician',
  DOCTOR: 'Doctor',
  PATIENT: 'Patient · personal portal',
};

function adaptUser(backendUser) {
  if (!backendUser) return null;
  return {
    id: backendUser.id,
    name: `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || backendUser.email,
    email: backendUser.email,
    role: backendUser.role,
    title: ROLE_TITLES[backendUser.role] || backendUser.role,
    clinicId: backendUser.clinicId,
    clinicName: backendUser.clinic?.name || null,
    mustChangePassword: backendUser.mustChangePassword,
    patientId: backendUser.id,
  };
}

function defaultScreenFor(role) {
  switch (role) {
    case 'SUPER_ADMIN': return 'clinics';
    case 'ADMIN': return 'users';
    case 'CLINICIAN':
    case 'DOCTOR': return 'dashboard';
    case 'PATIENT': return 'dashboard';
    default: return 'dashboard';
  }
}

function App() {
  const { user: authUser, isAuthenticated, loading, logout } = useAuth();
  const [screen, setScreen] = useState('dashboard');
  const [params, setParams] = useState({});
  const [toast, setToast] = useState(null);
  const [voluntaryPwdChange, setVoluntaryPwdChange] = useState(false);

  const user = adaptUser(authUser);
  const role = user?.role || 'CLINICIAN';

  useEffect(() => {
    document.documentElement.dataset.theme = 'aurora';
  }, []);

  // After login, jump to a sensible default screen for the role
  useEffect(() => {
    if (user) setScreen(defaultScreenFor(user.role));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const goto = (key, p = {}) => { setScreen(key); setParams(p); };
  const addToast = (t) => setToast(t);
  const allowedNav = NAV.filter(n => n.roles.includes(role));

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <div className="atmosphere" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--accent-soft, #e0e0e0)', borderTopColor: 'var(--accent, #6366f1)', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 14, color: 'var(--ink-3, #888)' }}>Restoring session...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen onLogin={() => setScreen(defaultScreenFor(authUser?.role || 'CLINICIAN'))} />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  // Forced first-login password change overrides everything
  const forcePwdChange = !!user?.mustChangePassword;

  return (
    <>
      <div className="atmosphere" />
      <div className="app density-balanced">
        <GlassCard strong className="brand">
          <div className="brand-mark">H</div>
          <div className="brand-name">Hippa<b>Health</b></div>
        </GlassCard>

        <Topbar user={user} role={role} onChangePassword={() => setVoluntaryPwdChange(true)} onSignOut={logout} />

        <Sidebar
          allowedNav={allowedNav}
          screen={screen}
          goto={goto}
          user={user}
          showMobile={role === 'PATIENT'}
          onSignOut={logout}
        />

        <GlassCard strong className="main">
          <div className="main-scroll">
            {/* SUPER_ADMIN screens */}
            {screen === 'clinics' && role === 'SUPER_ADMIN' && <ClinicsScreen goto={goto} addToast={addToast} />}
            {screen === 'platformAudit' && role === 'SUPER_ADMIN' && <AuditFullScreen scope="platform" />}

            {/* ADMIN screens */}
            {screen === 'users' && role === 'ADMIN' && <UsersScreen addToast={addToast} />}
            {screen === 'audit' && role === 'ADMIN' && <AuditFullScreen scope="clinic" />}

            {/* Workspace */}
            {screen === 'dashboard' && <Dashboard user={user} role={role} goto={goto} />}
            {screen === 'upload' && (role === 'CLINICIAN' || role === 'ADMIN') && <UploadScreen goto={goto} addToast={addToast} />}
            {screen === 'review' && (role === 'CLINICIAN' || role === 'ADMIN') && <ReviewScreen goto={goto} params={params} addToast={addToast} />}
            {screen === 'poc' && <PocScreen goto={goto} params={{ ...params, role }} addToast={addToast} />}
            {screen === 'risk' && <RiskScreen goto={goto} addToast={addToast} />}
            {screen === 'patients' && role !== 'PATIENT' && role !== 'SUPER_ADMIN' && <PatientsScreen goto={goto} role={role} addToast={addToast} />}
            {screen === 'patient' && <PatientScreen goto={goto} params={params} role={role} />}
            {screen === 'mobile' && <MobileShowcase goto={goto} />}
          </div>
        </GlassCard>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Forced first-login password change */}
      <ChangePasswordModal
        forced={forcePwdChange}
        open={forcePwdChange || voluntaryPwdChange}
        onClose={() => setVoluntaryPwdChange(false)}
        onSuccess={() => {
          setVoluntaryPwdChange(false);
          addToast({ kind: 'ok', text: 'Password updated' });
        }}
      />
    </>
  );
}

export default App;
