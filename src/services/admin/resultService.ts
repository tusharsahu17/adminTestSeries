import apiClient from '../apiClient';

export const getResults = async () => {
  const response = await apiClient.get('/api/admin/results');
  return response.data;
};
