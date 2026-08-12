import apiClient from '../apiClient';

export const getNotifications = async () => {
  const response = await apiClient.get('/api/admin/notifications');
  return response.data;
};
