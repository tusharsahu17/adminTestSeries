import apiClient from '../apiClient';

export const getSupports = async () => {
  const response = await apiClient.get('/api/admin/supports');
  return response.data;
};
