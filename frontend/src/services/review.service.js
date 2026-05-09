import api from './api';

const reviewService = {
  async getQueue() {
    const { data } = await api.get('/review/queue');
    return data.data || data;
  },

  async getReview(documentId) {
    const { data } = await api.get(`/review/${documentId}`);
    return data.data || data;
  },

  async claim(documentId) {
    const { data } = await api.post(`/review/${documentId}/claim`);
    return data.data || data;
  },

  async release(documentId) {
    const { data } = await api.post(`/review/${documentId}/release`);
    return data.data || data;
  },

  async approve(documentId, comments = '') {
    const { data } = await api.post(`/review/${documentId}/approve`, { comments });
    return data.data || data;
  },

  async editAndApprove(documentId, edits, comments = '') {
    const { data } = await api.post(`/review/${documentId}/edit`, { edits, comments });
    return data.data || data;
  },

  async reject(documentId, reason) {
    const { data } = await api.post(`/review/${documentId}/reject`, { reason });
    return data.data || data;
  },

  async getMetrics(documentId) {
    const { data } = await api.get(`/review/${documentId}/metrics`);
    return data.data || data;
  },
};

export default reviewService;
