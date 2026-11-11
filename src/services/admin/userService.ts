import { ENDPOINTS } from '../../constants/apiEndpoints';
import type { Payment } from '../../types/admin/payment';
import type {
  AssignUserTestSeriesPayload,
  ExtendUserTestSeriesPayload,
  GetUsersParams,
  ResetUserPasswordPayload,
  UpdateUserProfilePayload,
  UpdateUserStatusPayload,
  UpdateUserSubscriptionPayload,
  UpdateUserTestSeriesStatusPayload,
  UserActivityQueryParams,
  UserActivityResponse,
  UserAnalytics,
  UserAttemptInspection,
  UserHistoryQueryParams,
  UserPaymentListResponse,
  UserPaymentQueryParams,
  UserProfileOverview,
  UsersListResponse,
  UserTestHistoryResponse,
  UserTestSeriesListResponse,
} from '../../types/admin/user';
import apiClient, { getData, patchData, postData, putData } from '../apiClient';
import {
  normalizeUserActivity,
  normalizeUserAnalytics,
  normalizeUserAttemptInspection,
  normalizeUserPaymentDetail,
  normalizeUserPayments,
  normalizeUserProfileOverview,
  normalizeUsersList,
  normalizeUserTestHistory,
  normalizeUserTestSeries,
} from './userNormalizer';

function cleanQueryParams<T extends object>(params?: T): Record<string, unknown> {
  if (!params) return {};
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

function extractFilenameFromHeader(disposition: string | undefined, fallback: string): string {
  if (!disposition) return fallback;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/['"]/g, ''));
    } catch {
      return utf8Match[1].replace(/['"]/g, '');
    }
  }
  const match = disposition.match(/filename=([^;]+)/i);
  if (match?.[1]) {
    return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return fallback;
}

export const userService = {
  list: async (params?: GetUsersParams): Promise<UsersListResponse> => {
    const res = await getData(ENDPOINTS.ADMIN_USERS, cleanQueryParams(params));
    return normalizeUsersList(res);
  },

  getOverview: async (userId: string | number): Promise<UserProfileOverview> => {
    const res = await getData(ENDPOINTS.ADMIN_USER_DETAIL(userId));
    return normalizeUserProfileOverview(res);
  },

  getAnalytics: async (userId: string | number): Promise<UserAnalytics> => {
    const res = await getData(ENDPOINTS.ADMIN_USER_ANALYTICS(userId));
    return normalizeUserAnalytics(res);
  },

  getTestHistory: async (
    userId: string | number,
    params?: UserHistoryQueryParams
  ): Promise<UserTestHistoryResponse> => {
    const res = await getData(ENDPOINTS.ADMIN_USER_TEST_HISTORY(userId), cleanQueryParams(params));
    return normalizeUserTestHistory(res);
  },

  getAttemptDetail: async (
    userId: string | number,
    attemptId: string | number
  ): Promise<UserAttemptInspection> => {
    const res = await getData(ENDPOINTS.ADMIN_USER_TEST_HISTORY_DETAIL(userId, attemptId));
    return normalizeUserAttemptInspection(res);
  },

  getTestSeries: async (userId: string | number): Promise<UserTestSeriesListResponse> => {
    const res = await getData(ENDPOINTS.ADMIN_USER_TEST_SERIES(userId));
    return normalizeUserTestSeries(res);
  },

  assignTestSeries: async (
    userId: string | number,
    payload: AssignUserTestSeriesPayload
  ): Promise<unknown> => {
    const body: Record<string, unknown> = {
      testSeriesId: payload.testSeriesId,
      test_series_id: payload.testSeriesId,
    };
    if (payload.accessType) {
      body.accessType = payload.accessType;
      body.access_type = payload.accessType;
    }
    if (payload.status) {
      body.status = payload.status;
    }
    if (payload.expiresAt) {
      body.expiresAt = payload.expiresAt;
      body.expires_at = payload.expiresAt;
    }
    if (payload.durationDays !== undefined) {
      body.durationDays = payload.durationDays;
      body.duration_days = payload.durationDays;
    }
    if (payload.notes) {
      body.notes = payload.notes;
    }
    return await postData(ENDPOINTS.ADMIN_USER_TEST_SERIES(userId), body);
  },

  extendTestSeries: async (
    userId: string | number,
    enrollmentId: string | number,
    payload: ExtendUserTestSeriesPayload
  ): Promise<unknown> => {
    const body: Record<string, unknown> = {};
    if (payload.days !== undefined) {
      body.days = payload.days;
      body.extendDays = payload.days;
      body.extend_days = payload.days;
    }
    if (payload.expiresAt) {
      body.expiresAt = payload.expiresAt;
      body.expires_at = payload.expiresAt;
    }
    if (payload.notes) {
      body.notes = payload.notes;
    }
    return await patchData(ENDPOINTS.ADMIN_USER_TEST_SERIES_EXTEND(userId, enrollmentId), body);
  },

  updateTestSeriesStatus: async (
    userId: string | number,
    enrollmentId: string | number,
    payload: UpdateUserTestSeriesStatusPayload
  ): Promise<unknown> => {
    const body: Record<string, unknown> = { status: payload.status };
    if (payload.notes) body.notes = payload.notes;
    return await patchData(ENDPOINTS.ADMIN_USER_TEST_SERIES_STATUS(userId, enrollmentId), body);
  },

  getPayments: async (
    userId: string | number,
    params?: UserPaymentQueryParams
  ): Promise<UserPaymentListResponse> => {
    const res = await getData(ENDPOINTS.ADMIN_USER_PAYMENTS(userId), cleanQueryParams(params));
    return normalizeUserPayments(res);
  },

  getPaymentDetail: async (
    userId: string | number,
    paymentId: string | number
  ): Promise<Payment> => {
    const res = await getData(ENDPOINTS.ADMIN_USER_PAYMENT_DETAIL(userId, paymentId));
    return normalizeUserPaymentDetail(res);
  },

  getActivity: async (
    userId: string | number,
    params?: UserActivityQueryParams
  ): Promise<UserActivityResponse> => {
    const res = await getData(ENDPOINTS.ADMIN_USER_ACTIVITY(userId), cleanQueryParams(params));
    return normalizeUserActivity(res);
  },

  exportReport: async (
    userId: string | number,
    format: 'json' | 'csv' = 'json'
  ): Promise<{ filename: string; format: 'json' | 'csv' }> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN_USER_REPORT(userId), {
      params: { format },
      responseType: 'blob',
    });

    const fallbackName = `student-${userId}-report.${format}`;
    const filename = extractFilenameFromHeader(
      response.headers?.['content-disposition'],
      fallbackName
    );

    if (typeof window !== 'undefined') {
      const mimeType =
        format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)], {
              type: mimeType,
            });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return { filename, format };
  },

  updateStatus: async (
    userId: string | number,
    payload: UpdateUserStatusPayload | string
  ): Promise<unknown> => {
    const body =
      typeof payload === 'string'
        ? { status: payload }
        : { status: payload.status, ...(payload.reason ? { reason: payload.reason } : {}) };
    return await patchData(ENDPOINTS.ADMIN_USER_STATUS(userId), body);
  },

  resetPassword: async (
    userId: string | number,
    payload: ResetUserPasswordPayload
  ): Promise<unknown> => {
    return await patchData(ENDPOINTS.ADMIN_USER_RESET_PASSWORD(userId), {
      newPassword: payload.newPassword,
      password: payload.newPassword,
      confirmPassword: payload.confirmPassword,
    });
  },

  updateProfile: async (
    userId: string | number,
    payload: UpdateUserProfilePayload
  ): Promise<unknown> => {
    return await patchData(ENDPOINTS.ADMIN_USER_PROFILE(userId), payload);
  },

  replaceUser: async (
    userId: string | number,
    payload: UpdateUserProfilePayload
  ): Promise<unknown> => {
    return await putData(ENDPOINTS.ADMIN_USER_DETAIL(userId), payload);
  },

  updateSubscription: async (
    userId: string | number,
    payload: UpdateUserSubscriptionPayload | string
  ): Promise<unknown> => {
    const subStatus =
      typeof payload === 'string' ? payload : payload.subscriptionStatus;
    return await patchData(ENDPOINTS.ADMIN_USER_SUBSCRIPTION(userId), {
      status: subStatus,
      subscriptionStatus: subStatus,
      subscription_status: subStatus,
    });
  },
};

export const getUsers = async (params?: GetUsersParams) => {
  return await getData(ENDPOINTS.ADMIN_USERS, cleanQueryParams(params));
};
