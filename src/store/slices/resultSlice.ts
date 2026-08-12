import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ResultState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ResultState = {
  items: [],
  isLoading: false,
  error: null,
};

const resultSlice = createSlice({
  name: 'result',
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

export const { setItems, setLoading, setError } = resultSlice.actions;

export const selectResultItems = (state: any) => state.result.items;
export const selectResultLoading = (state: any) => state.result.isLoading;

export default resultSlice.reducer;
