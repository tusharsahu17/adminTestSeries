import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  items: [],
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
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

export const { setItems, setLoading, setError } = adminSlice.actions;

export const selectAdminItems = (state: any) => state.admin.items;
export const selectAdminLoading = (state: any) => state.admin.isLoading;

export default adminSlice.reducer;
