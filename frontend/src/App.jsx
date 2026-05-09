import { useState, useEffect } from 'react';
import { GlassCard, Toast } from './components/ui';
import { Sidebar, Topbar } from './components/layout';
import { NAV } from './data';
import { useAuth } from './context';

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

// Map backend roles to frontend display roles
const ROLE_MAP = {
  ADMIN: 'ADMIN',
  CLINICIAN: 'DOCTOR',
  VIEWER: 'PATIENT',
};

const ROLE_TITLES = {
  ADMIN: 'Compliance lead',
  DOCTOR: 'MD · Internal medicine',
  PATIENT: 'Patient · personal portal',
};

function mapUser(backendUser) {
  if (!backendUser) return null;
  const displayRole = ROLE_MAP[backendUser.role] || backendUser.role;
  return {
    id: backendUser.id,
    name: `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || backendUser.email,
    email: backendUser.email,
    role: displayRole,
    backendRole: backendUser.role,
    title: ROLE_TITLES[displayRole] || backendUser.role,
    patientId: backendUser.patientId || null,
  };
}

function App() {
  const { user: authUser, isAuthenticated, loading, logout } = useAuth();
  const [screen, setScreen] = useState('dashboard');
  const [params, setParams] = useState({});
  const [toast, setToast] = useState(null);

  const user = mapUser(authUser);
  const role = user?.role || 'DOCTOR';

  useEffect(() => {
    document.documentElement.dataset.theme = 'aurora';
  }, []);

  // Role-based screen gating
  useEffect(() => {
    if (!user) return;
    if (role === 'PATIENT') {
      const allowed = ['dashboard', 'poc', 'risk', 'patient', 'mobile'];
      if (!allowed.includes(screen)) setScreen('dashboard');
    } else {
      if (screen === 'audit' && role !== 'ADMIN') setScreen('dashboard');
    }
  }, [role]);

  const goto = (key, p = {}) => { setScreen(key); setParams(p); };
  const addToast = (t) => setToast(t);
  const allowedNav = NAV.filter(n => n.roles.includes(role));

  // Show loading spinner while restoring session
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
        <AuthScreen onLogin={() => {
          // Auth context handles state, just go to dashboard
          setScreen('dashboard');
        }} />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  return (
    <>
      <div className="atmosphere" />
      <div className="app density-balanced">
        <GlassCard strong className="brand">
          <div className="brand-mark">H</div>
          <div className="brand-name">Hippa<b>Clinical</b></div>
        </GlassCard>

        <Topbar user={user} role={role} />

        <Sidebar
          allowedNav={allowedNav}
          screen={screen}
          goto={goto}
          user={user}
          showMobile={true}
          onSignOut={logout}
        />

        <GlassCard strong className="main">
          <div className="main-scroll">
            {screen === 'dashboard' && <Dashboard user={user} role={role} goto={goto} />}
            {screen === 'upload'    && <UploadScreen goto={goto} addToast={addToast} />}
            {screen === 'review'    && <ReviewScreen goto={goto} params={params} addToast={addToast} />}
            {screen === 'poc'       && <PocScreen goto={goto} params={params} addToast={addToast} />}
            {screen === 'risk'      && <RiskScreen goto={goto} addToast={addToast} />}
            {screen === 'patients'  && role !== 'PATIENT' && <PatientsScreen goto={goto} />}
            {screen === 'patient'   && <PatientScreen goto={goto} params={params} role={role} />}
            {screen === 'mobile'    && <MobileShowcase goto={goto} />}
            {screen === 'audit'     && <AuditFullScreen />}
          </div>
        </GlassCard>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

export default App;
