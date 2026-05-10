import api from './api';

const superService = {
  async listClinics() {
    const { data } = await api.get('/super/clinics');
    return data.data || data;
  },
  async getClinic(id) {
    const { data } = await api.get(`/super/clinics/${id}`);
    return data.data || data;
  },
  async createClinic(name) {
    const { data } = await api.post('/super/clinics', { name });
    return data.data || data;
  },
  async updateClinic(id, patch) {
    const { data } = await api.patch(`/super/clinics/${id}`, patch);
    return data.data || data;
  },
  async createInitialAdmin(clinicId, payload) {
    const { data } = await api.post(`/super/clinics/${clinicId}/admins`, payload);
    return data.data || data;
  },
  async metrics() {
    const { data } = await api.get('/super/metrics');
    return data.data || data;
  },
  async auditLog(params = {}) {
    const { data } = await api.get('/super/audit-log', { params });
    return data.data || data;
  },
  async disableUser(userId) {
    const { data } = await api.post(`/super/users/${userId}/disable`);
    return data.data || data;
  },
};

export default superService;
