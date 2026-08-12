import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  items: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
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

export const { setItems, setLoading, setError } = userSlice.actions;

export const selectUserItems = (state: any) => state.user.items;
export const selectUserLoading = (state: any) => state.user.isLoading;

export default userSlice.reducer;
