import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
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

export const { setItems, setLoading, setError } = notificationSlice.actions;

export const selectNotificationItems = (state: any) => state.notification.items;
export const selectNotificationLoading = (state: any) => state.notification.isLoading;

export default notificationSlice.reducer;
