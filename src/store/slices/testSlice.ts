import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TestState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TestState = {
  items: [],
  isLoading: false,
  error: null,
};

const testSlice = createSlice({
  name: 'test',
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

export const { setItems, setLoading, setError } = testSlice.actions;

export const selectTestItems = (state: any) => state.test.items;
export const selectTestLoading = (state: any) => state.test.isLoading;

export default testSlice.reducer;
