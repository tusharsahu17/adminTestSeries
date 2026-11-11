export type EnrollmentStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | string;

export interface Enrollment {
  id: string | number;
  userId?: string | number;
  userName?: string;
  userEmail?: string;
  testSeriesId?: string | number;
  testSeriesTitle?: string;
  accessType?: string;
  source?: string;
  paymentId?: string | number | null;
  subscriptionId?: string | number | null;
  status: EnrollmentStatus;
  enrolledAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  raw?: Record<string, unknown>;
}

export interface CreateEnrollmentPayload {
  userId: string | number;
  testSeriesId: string | number;
  status?: EnrollmentStatus;
  accessType?: string;
  expiresAt?: string;
  notes?: string;
}

export interface UpdateEnrollmentStatusPayload {
  status: EnrollmentStatus;
  notes?: string;
}

