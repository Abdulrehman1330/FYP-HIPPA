import api from './api';

const patientService = {
  async list() {
    const { data } = await api.get('/patients');
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
