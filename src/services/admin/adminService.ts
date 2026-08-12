import apiClient from '../apiClient';

export const getAdmins = async () => {
  const response = await apiClient.get('/api/admin/admins');
  return response.data;
};
