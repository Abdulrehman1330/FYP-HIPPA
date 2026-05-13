import api from './api';

const patientService = {
  async getMyProfile() {
    const { data } = await api.get('/me/profile');
    return data.data || data;
  },

  async getMyDocuments() {
    const { data } = await api.get('/me/documents');
    return data.data || data;
  },

  async getMyRisk() {
    const { data } = await api.get('/me/risk');
    return data.data || data;
  },

  async list() {
    const { data } = await api.get('/patients');
    return data.data || data;
  },

  async getClinicalPatient(id, role) {
    const endpoint = role === 'ADMIN'
      ? `/admin/patients/${id}`
      : role === 'DOCTOR'
        ? `/doctor/patients/${id}`
        : `/clinician/patients/${id}`;
    const { data } = await api.get(endpoint);
    return data.data || data;
  },

  async create({ email, firstName, lastName }) {
    const { data } = await api.post('/patients', { email, firstName, lastName });
    return data.data || data;
  },

  async resendCredentials(patientId) {
    const { data } = await api.post(`/patients/${patientId}/resend`);
    return data.data || data;
  },
};

export default patientService;
