import { useState } from 'react';
import { GlassCard, GradientButton, Icon, Modal } from './ui';
import { authService } from '../services';
import { useAuth } from '../context';

/**
 * Forced first-login password change modal.
 * Cannot be dismissed — clicking outside is ignored.
 */
const ChangePasswordModal = ({ forced = false, open, onClose, onSuccess }) => {
  const { user, setUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (newPassword !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await authService.changePassword({ currentPassword: forced ? undefined : currentPassword, newPassword });
      setUser?.({ ...user, mustChangePassword: false });
      onSuccess?.();
      if (!forced) onClose?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Change failed');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 6 };

  return (
    <Modal
      open={open}
      onClose={forced ? () => {} : onClose}
      title={forced ? 'Set a new password to continue' : 'Change password'}
    >
      <form onSubmit={submit}>
        {forced && (
          <div style={{ padding: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, marginBottom: 18, display: 'flex', gap: 10 }}>
            <Icon name="shield" size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.5 }}>
              For your security, you must change your password before continuing. The temporary password issued to you will no longer work after this change.
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: 10, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8, marginBottom: 14, fontSize: 13, color: '#991b1b' }}>
            {error}
          </div>
        )}

        {!forced && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Current password</label>
            <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>New password</label>
          <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" autoFocus required />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Confirm new password</label>
          <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
          {!forced && <GradientButton variant="ghost" type="button" onClick={onClose}>Cancel</GradientButton>}
          <GradientButton variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </GradientButton>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
