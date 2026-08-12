import apiClient from '../apiClient';

export const getSubscriptions = async () => {
  const response = await apiClient.get('/api/admin/subscriptions');
  return response.data;
};
