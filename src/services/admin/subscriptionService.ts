import { ENDPOINTS } from '../../constants/apiEndpoints';
import {
  CreateSubscriptionPayload,
  Subscription,
  UpdateSubscriptionStatusPayload,
} from '../../types/admin/subscription';
import { getData, patchData, postData } from '../apiClient';
import { extractArray, normalizeSubscription } from './dashboardNormalizer';

export const subscriptionService = {
  list: async (params?: Record<string, unknown>): Promise<Subscription[]> => {
    const res = await getData(ENDPOINTS.ADMIN_SUBSCRIPTIONS, params);
    return extractArray(res, ['subscriptions', 'items', 'rows']).map(normalizeSubscription);
  },

  create: async (payload: CreateSubscriptionPayload): Promise<unknown> => {
    const body: Record<string, unknown> = {
      userId: payload.userId,
      user_id: payload.userId,
      planName: payload.planName,
      plan_name: payload.planName,
      status: payload.status || 'ACTIVE',
    };
    if (payload.testSeriesId !== undefined && payload.testSeriesId !== '') {
      body.testSeriesId = payload.testSeriesId;
      body.test_series_id = payload.testSeriesId;
    }
    if (payload.amount !== undefined) {
      body.amount = payload.amount;
      body.price = payload.amount;
    }
    if (payload.durationDays !== undefined) {
      body.durationDays = payload.durationDays;
      body.duration_days = payload.durationDays;
    }
    if (payload.startsAt) {
      body.startsAt = payload.startsAt;
      body.starts_at = payload.startsAt;
      body.start_date = payload.startsAt;
    }
    if (payload.expiresAt) {
      body.expiresAt = payload.expiresAt;
      body.expires_at = payload.expiresAt;
      body.end_date = payload.expiresAt;
    }
    if (payload.notes) {
      body.notes = payload.notes;
    }
    return await postData(ENDPOINTS.ADMIN_SUBSCRIPTIONS, body);
  },

  updateStatus: async (
    id: string | number,
    payload: UpdateSubscriptionStatusPayload
  ): Promise<unknown> => {
    const body: Record<string, unknown> = { status: payload.status };
    if (payload.notes) body.notes = payload.notes;
    return await patchData(ENDPOINTS.ADMIN_SUBSCRIPTION_STATUS(id), body);
  },
};

export const getSubscriptions = subscriptionService.list;
