import apiClient from '../apiClient';

export const getQuestions = async () => {
  const response = await apiClient.get('/api/admin/questions');
  return response.data;
};
