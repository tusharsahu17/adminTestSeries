import apiClient from '../apiClient';

export const getSettings = async () => {
  const response = await apiClient.get('/api/admin/settings');
  return response.data;
};
