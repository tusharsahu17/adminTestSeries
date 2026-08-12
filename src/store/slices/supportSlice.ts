import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SupportState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  items: [],
  isLoading: false,
  error: null,
};

const supportSlice = createSlice({
  name: 'support',
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

export const { setItems, setLoading, setError } = supportSlice.actions;

export const selectSupportItems = (state: any) => state.support.items;
export const selectSupportLoading = (state: any) => state.support.isLoading;

export default supportSlice.reducer;
