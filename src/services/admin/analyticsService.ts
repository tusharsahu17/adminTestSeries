import apiClient from '../apiClient';

export const getAnalyticss = async () => {
  const response = await apiClient.get('/api/admin/analyticss');
  return response.data;
};
