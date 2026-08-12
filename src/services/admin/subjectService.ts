import apiClient from '../apiClient';

export const getSubjects = async () => {
  const response = await apiClient.get('/api/admin/subjects');
  return response.data;
};
