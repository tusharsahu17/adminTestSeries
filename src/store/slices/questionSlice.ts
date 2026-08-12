import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuestionState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: QuestionState = {
  items: [],
  isLoading: false,
  error: null,
};

const questionSlice = createSlice({
  name: 'question',
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

export const { setItems, setLoading, setError } = questionSlice.actions;

export const selectQuestionItems = (state: any) => state.question.items;
export const selectQuestionLoading = (state: any) => state.question.isLoading;

export default questionSlice.reducer;
