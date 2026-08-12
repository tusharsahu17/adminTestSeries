import apiClient from '../apiClient';

export const getTestSeriess = async () => {
  const response = await apiClient.get('/api/admin/testseriess');
  return response.data;
};
