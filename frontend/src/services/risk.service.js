import api from './api';

const riskService = {
  async predict(documentId) {
    const { data } = await api.post(`/risk/predict/${documentId}`, {}, {
      timeout: 30000,
    });
    return data.data || data;
  },

  async get(documentId) {
    const { data } = await api.get(`/risk/${documentId}`);
    return data.data || data;
  },
};

export default riskService;
