import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LeaderboardState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LeaderboardState = {
  items: [],
  isLoading: false,
  error: null,
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
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

export const { setItems, setLoading, setError } = leaderboardSlice.actions;

export const selectLeaderboardItems = (state: any) => state.leaderboard.items;
export const selectLeaderboardLoading = (state: any) => state.leaderboard.isLoading;

export default leaderboardSlice.reducer;
