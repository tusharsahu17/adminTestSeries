import apiClient from '../apiClient';

export const getLeaderboards = async () => {
  const response = await apiClient.get('/api/admin/leaderboards');
  return response.data;
};
