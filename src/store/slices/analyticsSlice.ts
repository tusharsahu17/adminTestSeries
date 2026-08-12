import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  items: [],
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
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

export const { setItems, setLoading, setError } = analyticsSlice.actions;

export const selectAnalyticsItems = (state: any) => state.analytics.items;
export const selectAnalyticsLoading = (state: any) => state.analytics.isLoading;

export default analyticsSlice.reducer;
