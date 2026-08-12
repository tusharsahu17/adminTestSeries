import apiClient from '../apiClient';

export const getUsers = async () => {
  const response = await apiClient.get('/api/admin/users');
  return response.data;
};
