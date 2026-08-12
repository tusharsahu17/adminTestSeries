import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubscriptionState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  items: [],
  isLoading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
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

export const { setItems, setLoading, setError } = subscriptionSlice.actions;

export const selectSubscriptionItems = (state: any) => state.subscription.items;
export const selectSubscriptionLoading = (state: any) => state.subscription.isLoading;

export default subscriptionSlice.reducer;
