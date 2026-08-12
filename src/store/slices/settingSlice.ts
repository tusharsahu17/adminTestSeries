import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingState = {
  items: [],
  isLoading: false,
  error: null,
};

const settingSlice = createSlice({
  name: 'setting',
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

export const { setItems, setLoading, setError } = settingSlice.actions;

export const selectSettingItems = (state: any) => state.setting.items;
export const selectSettingLoading = (state: any) => state.setting.isLoading;

export default settingSlice.reducer;
