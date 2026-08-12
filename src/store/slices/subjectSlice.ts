import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubjectState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubjectState = {
  items: [],
  isLoading: false,
  error: null,
};

const subjectSlice = createSlice({
  name: 'subject',
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

export const { setItems, setLoading, setError } = subjectSlice.actions;

export const selectSubjectItems = (state: any) => state.subject.items;
export const selectSubjectLoading = (state: any) => state.subject.isLoading;

export default subjectSlice.reducer;
