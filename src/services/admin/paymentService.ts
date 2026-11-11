import { ENDPOINTS } from '../../constants/apiEndpoints';
import {
  CreatePaymentPayload,
  Payment,
  RefundPaymentPayload,
  UpdatePaymentStatusPayload,
} from '../../types/admin/payment';
import { getData, patchData, postData } from '../apiClient';
import { extractArray, normalizePayment, unwrapData } from './dashboardNormalizer';

export const paymentService = {
  list: async (params?: Record<string, unknown>): Promise<Payment[]> => {
    const res = await getData(ENDPOINTS.ADMIN_PAYMENTS, params);
    return extractArray(res, ['payments', 'items', 'rows']).map(normalizePayment);
  },

  getById: async (id: string | number): Promise<Payment> => {
    const res = await getData(ENDPOINTS.ADMIN_PAYMENT_DETAIL(id));
    const unwrapped = unwrapData<Record<string, unknown>>(res);
    const record = unwrapped?.payment ?? unwrapped;
    return normalizePayment(record);
  },

  create: async (payload: CreatePaymentPayload): Promise<unknown> => {
    const body: Record<string, unknown> = {
      userId: payload.userId,
      user_id: payload.userId,
      amount: payload.amount,
      currency: payload.currency || 'INR',
      status: payload.status || 'PENDING',
    };
    if (payload.testSeriesId !== undefined && payload.testSeriesId !== '') {
      body.testSeriesId = payload.testSeriesId;
      body.test_series_id = payload.testSeriesId;
    }
    if (payload.subscriptionId !== undefined && payload.subscriptionId !== '') {
      body.subscriptionId = payload.subscriptionId;
      body.subscription_id = payload.subscriptionId;
    }
    if (payload.paymentMethod) {
      body.paymentMethod = payload.paymentMethod;
      body.payment_method = payload.paymentMethod;
    }
    if (payload.transactionId) {
      body.transactionId = payload.transactionId;
      body.transaction_id = payload.transactionId;
    }
    if (payload.notes) {
      body.notes = payload.notes;
    }
    return await postData(ENDPOINTS.ADMIN_PAYMENTS, body);
  },

  updateStatus: async (
    id: string | number,
    payload: UpdatePaymentStatusPayload
  ): Promise<unknown> => {
    const body: Record<string, unknown> = { status: payload.status };
    if (payload.notes) body.notes = payload.notes;
    if (payload.transactionId) {
      body.transactionId = payload.transactionId;
      body.transaction_id = payload.transactionId;
    }
    return await patchData(ENDPOINTS.ADMIN_PAYMENT_STATUS(id), body);
  },

  refund: async (id: string | number, payload?: RefundPaymentPayload): Promise<unknown> => {
    const body: Record<string, unknown> = {};
    if (payload?.reason) {
      body.reason = payload.reason;
      body.refund_reason = payload.reason;
    }
    if (payload?.amount !== undefined && !Number.isNaN(payload.amount)) {
      body.amount = payload.amount;
      body.refund_amount = payload.amount;
    }
    return await postData(ENDPOINTS.ADMIN_PAYMENT_REFUND(id), body);
  },
};

export const getPayments = paymentService.list;
