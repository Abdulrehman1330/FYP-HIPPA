import api from './api';

const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    const { user, token } = data.data || data;
    localStorage.setItem('hippa_token', token);
    localStorage.setItem('hippa_user', JSON.stringify(user));
    return { user, token };
  },

  async register({ email, password, firstName, lastName, role }) {
    const { data } = await api.post('/auth/register', {
      email, password, firstName, lastName, role,
    });
    const { user, token } = data.data || data;
    localStorage.setItem('hippa_token', token);
    localStorage.setItem('hippa_user', JSON.stringify(user));
    return { user, token };
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.data || data;
  },

  logout() {
    localStorage.removeItem('hippa_token');
    localStorage.removeItem('hippa_user');
  },

  getStoredUser() {
    try {
      const raw = localStorage.getItem('hippa_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('hippa_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('hippa_token');
  },

  async changePassword({ currentPassword, newPassword }) {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
};

export default authService;
