import api from './api';

const ragService = {
  async askPatient(question) {
    const { data } = await api.post('/patient/rag/chat', { question });
    return data.data || data;
  },

  async askForPatient(patientId, question) {
    const { data } = await api.post(`/patients/${patientId}/rag/chat`, { question });
    return data.data || data;
  },
};

export default ragService;
