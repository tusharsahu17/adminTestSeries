import { ENDPOINTS } from '../../constants/apiEndpoints';
import {
  CreateEnrollmentPayload,
  Enrollment,
  UpdateEnrollmentStatusPayload,
} from '../../types/admin/enrollment';
import { getData, patchData, postData } from '../apiClient';
import { extractArray, normalizeEnrollment } from './dashboardNormalizer';

export const enrollmentService = {
  list: async (params?: Record<string, unknown>): Promise<Enrollment[]> => {
    const res = await getData(ENDPOINTS.ADMIN_ENROLLMENTS, params);
    return extractArray(res, ['enrollments', 'items', 'rows']).map(normalizeEnrollment);
  },

  create: async (payload: CreateEnrollmentPayload): Promise<unknown> => {
    const body: Record<string, unknown> = {
      userId: payload.userId,
      user_id: payload.userId,
      testSeriesId: payload.testSeriesId,
      test_series_id: payload.testSeriesId,
      status: payload.status || 'ACTIVE',
    };
    if (payload.accessType) {
      body.accessType = payload.accessType;
      body.access_type = payload.accessType;
    }
    if (payload.expiresAt) {
      body.expiresAt = payload.expiresAt;
      body.expires_at = payload.expiresAt;
    }
    if (payload.notes) {
      body.notes = payload.notes;
    }
    return await postData(ENDPOINTS.ADMIN_ENROLLMENTS, body);
  },

  updateStatus: async (
    id: string | number,
    payload: UpdateEnrollmentStatusPayload
  ): Promise<unknown> => {
    const body: Record<string, unknown> = { status: payload.status };
    if (payload.notes) body.notes = payload.notes;
    return await patchData(ENDPOINTS.ADMIN_ENROLLMENT_STATUS(id), body);
  },
};

