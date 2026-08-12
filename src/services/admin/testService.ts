import apiClient from '../apiClient';

export const getTests = async () => {
  const response = await apiClient.get('/api/admin/tests');
  return response.data;
};
