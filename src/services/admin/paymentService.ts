import apiClient from '../apiClient';

export const getPayments = async () => {
  const response = await apiClient.get('/api/admin/payments');
  return response.data;
};
