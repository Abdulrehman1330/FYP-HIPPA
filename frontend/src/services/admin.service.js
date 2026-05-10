import api from './api';

const adminService = {
  async listUsers(params = {}) {
    const { data } = await api.get('/admin/users', { params });
    return data.data || data;
  },
  async createUser(payload) {
    const { data } = await api.post('/admin/users', payload);
    return data.data || data;
  },
  async updateUser(id, patch) {
    const { data } = await api.patch(`/admin/users/${id}`, patch);
    return data.data || data;
  },
  async disableUser(id) {
    const { data } = await api.post(`/admin/users/${id}/disable`);
    return data.data || data;
  },
  async enableUser(id) {
    const { data } = await api.post(`/admin/users/${id}/enable`);
    return data.data || data;
  },
  async resetPassword(id) {
    const { data } = await api.post(`/admin/users/${id}/reset-password`);
    return data.data || data;
  },
  async auditLog(params = {}) {
    const { data } = await api.get('/admin/audit-log', { params });
    return data.data || data;
  },

  // Patient management
  async listPatients(params = {}) {
    const { data } = await api.get('/admin/patients', { params });
    return data.data || data;
  },
  async createPatient(payload) {
    const { data } = await api.post('/admin/patients', payload);
    return data.data || data;
  },
  async getPatient(id) {
    const { data } = await api.get(`/admin/patients/${id}`);
    return data.data || data;
  },
  async reassignPatient(id, patch) {
    const { data } = await api.patch(`/admin/patients/${id}/assignment`, patch);
    return data.data || data;
  },
};

export default adminService;
