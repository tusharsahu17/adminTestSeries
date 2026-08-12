import apiClient from '../apiClient';

export const getCoupons = async () => {
  const response = await apiClient.get('/api/admin/coupons');
  return response.data;
};
