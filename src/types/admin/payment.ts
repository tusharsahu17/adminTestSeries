export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | string;

export interface PaymentUserRef {
  id: string | number;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
}

export interface PaymentSeriesRef {
  id: string | number;
  title?: string;
  price?: number;
}

export interface Payment {
  id: string | number;
  userId?: string | number;
  user?: PaymentUserRef | null;
  userName?: string;
  userEmail?: string;
  testSeriesId?: string | number | null;
  testSeries?: PaymentSeriesRef | null;
  testSeriesTitle?: string;
  subscriptionId?: string | number | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  gateway?: string;
  transactionId?: string;
  referenceId?: string;
  paidAt?: string | null;
  refundedAt?: string | null;
  refundReason?: string | null;
  refundAmount?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  raw?: Record<string, unknown>;
}

export interface CreatePaymentPayload {
  userId: string | number;
  testSeriesId?: string | number;
  subscriptionId?: string | number;
  amount: number;
  currency?: string;
  status?: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

export interface UpdatePaymentStatusPayload {
  status: PaymentStatus;
  notes?: string;
  transactionId?: string;
}

export interface RefundPaymentPayload {
  reason?: string;
  amount?: number;
}
