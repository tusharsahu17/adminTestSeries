import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TestSeriesState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TestSeriesState = {
  items: [],
  isLoading: false,
  error: null,
};

const testSeriesSlice = createSlice({
  name: 'testSeries',
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

export const { setItems, setLoading, setError } = testSeriesSlice.actions;

export const selectTestSeriesItems = (state: any) => state.testSeries.items;
export const selectTestSeriesLoading = (state: any) => state.testSeries.isLoading;

export default testSeriesSlice.reducer;
