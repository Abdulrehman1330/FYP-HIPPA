import api from './api';

const documentService = {
  async upload(file, { patientId } = {}) {
    const form = new FormData();
    form.append('file', file);
    if (patientId) form.append('patientId', patientId);
    const { data } = await api.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return data.data || data;
  },

  async list(page = 1, limit = 20) {
    const { data } = await api.get('/documents', { params: { page, limit } });
    return data.data || data;
  },

  async get(id) {
    const { data } = await api.get(`/documents/${id}`);
    return data.data || data;
  },

  async remove(id) {
    const { data } = await api.delete(`/documents/${id}`);
    return data.data || data;
  },

  async extract(id) {
    const { data } = await api.post(`/documents/${id}/extract`, {}, {
      timeout: 120000, // OCR can take a while
    });
    return data.data || data;
  },

  async getExtraction(id) {
    const { data } = await api.get(`/documents/${id}/extraction`);
    return data.data || data;
  },
};

export default documentService;
