import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../app/auth/authSlice';
import quizReducer from './slices/quizSlice';
import userReducer from './slices/userSlice';
import testSeriesReducer from './slices/testSeriesSlice';
import testReducer from './slices/testSlice';
import questionReducer from './slices/questionSlice';
import subjectReducer from './slices/subjectSlice';
import resultReducer from './slices/resultSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import paymentReducer from './slices/paymentSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import couponReducer from './slices/couponSlice';
import notificationReducer from './slices/notificationSlice';
import analyticsReducer from './slices/analyticsSlice';
import supportReducer from './slices/supportSlice';
import adminReducer from './slices/adminSlice';
import settingReducer from './slices/settingSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      quizzes: quizReducer,
      users: userReducer,
      testSeries: testSeriesReducer,
      tests: testReducer,
      questions: questionReducer,
      subjects: subjectReducer,
      results: resultReducer,
      leaderboard: leaderboardReducer,
      payments: paymentReducer,
      subscriptions: subscriptionReducer,
      coupons: couponReducer,
      notifications: notificationReducer,
      analytics: analyticsReducer,
      support: supportReducer,
      admins: adminReducer,
      settings: settingReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
