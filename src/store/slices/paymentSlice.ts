import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaymentState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  items: [],
  isLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<any[]>) {
      state.items = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setItems, setLoading, setError } = paymentSlice.actions;

export const selectPaymentItems = (state: any) => state.payment.items;
export const selectPaymentLoading = (state: any) => state.payment.isLoading;

export default paymentSlice.reducer;
