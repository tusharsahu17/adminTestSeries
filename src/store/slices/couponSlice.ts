import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CouponState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CouponState = {
  items: [],
  isLoading: false,
  error: null,
};

const couponSlice = createSlice({
  name: 'coupon',
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

export const { setItems, setLoading, setError } = couponSlice.actions;

export const selectCouponItems = (state: any) => state.coupon.items;
export const selectCouponLoading = (state: any) => state.coupon.isLoading;

export default couponSlice.reducer;
