import api from './api';

const pocService = {
  async generate(documentId) {
    const { data } = await api.post(`/poc/generate/${documentId}`, {}, {
      timeout: 120000, // LLM generation can be slow
    });
    return data.data || data;
  },

  async generateLatest({ patientId } = {}) {
    const { data } = await api.post('/poc/generate-latest', { patientId }, {
      timeout: 120000, // LLM generation can be slow
    });
    return data.data || data;
  },

  async get(documentId) {
    const { data } = await api.get(`/poc/${documentId}`);
    return data.data || data;
  },

  async getLatest({ patientId } = {}) {
    const { data } = await api.get('/poc/latest', { params: patientId ? { patientId } : {} });
    return data.data || data;
  },

  async getVersions(documentId) {
    const { data } = await api.get(`/poc/${documentId}/versions`);
    return data.data || data;
  },

  async getVersion(documentId, version) {
    const { data } = await api.get(`/poc/${documentId}/versions/${version}`);
    return data.data || data;
  },

  async getMyPoc() {
    const { data } = await api.get('/me/poc');
    return data.data || data;
  },

  async edit(documentId, edits) {
    const { data } = await api.post(`/poc/${documentId}/edit`, { edits });
    return data.data || data;
  },

  async approve(documentId) {
    const { data } = await api.post(`/poc/${documentId}/approve`);
    return data.data || data;
  },
};

export default pocService;
