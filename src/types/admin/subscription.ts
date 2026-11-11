export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | string;

export interface Subscription {
  id: string | number;
  userId?: string | number;
  userName?: string;
  userEmail?: string;
  testSeriesId?: string | number | null;
  testSeriesTitle?: string;
  planName: string;
  planType?: string;
  amount: number;
  currency?: string;
  status: SubscriptionStatus;
  startsAt?: string | null;
  expiresAt?: string | null;
  paymentId?: string | number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  raw?: Record<string, unknown>;
}

export interface CreateSubscriptionPayload {
  userId: string | number;
  planName: string;
  testSeriesId?: string | number;
  amount?: number;
  durationDays?: number;
  startsAt?: string;
  expiresAt?: string;
  status?: SubscriptionStatus;
  notes?: string;
}

export interface UpdateSubscriptionStatusPayload {
  status: SubscriptionStatus;
  notes?: string;
}
