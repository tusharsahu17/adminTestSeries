import { ENDPOINTS } from '../../constants/apiEndpoints';
import {
  DashboardQueryParams,
  FullDashboardData,
  OverviewStats,
  RevenueAnalytics,
  RevenueAnalyticsParams,
  StudentAnalytics,
  StudentAnalyticsParams,
  StudentPerformanceAnalytics,
  TestAnalytics,
  TestAnalyticsParams,
  TestSeriesPerformance,
  TestSeriesPerformanceParams,
} from '../../types/admin/analytics';
import { getData } from '../apiClient';
import {
  normalizeFullDashboard,
  normalizeOverviewStats,
  normalizeRevenueAnalytics,
  normalizeStudentAnalytics,
  normalizeStudentPerformanceAnalytics,
  normalizeTestAnalytics,
  normalizeTestSeriesPerformance,
} from './dashboardNormalizer';

export const analyticsService = {
  getFullDashboard: async (params?: DashboardQueryParams): Promise<FullDashboardData> => {
    const res = await getData(ENDPOINTS.ADMIN_DASHBOARD, params);
    return normalizeFullDashboard(res);
  },

  getOverview: async (): Promise<OverviewStats> => {
    const res = await getData(ENDPOINTS.ADMIN_DASHBOARD_OVERVIEW);
    return normalizeOverviewStats(res);
  },

  getStudents: async (params?: StudentAnalyticsParams): Promise<StudentAnalytics> => {
    const res = await getData(ENDPOINTS.ADMIN_DASHBOARD_STUDENTS, params);
    return normalizeStudentAnalytics(res);
  },

  getTests: async (params?: TestAnalyticsParams): Promise<TestAnalytics> => {
    const res = await getData(ENDPOINTS.ADMIN_DASHBOARD_TESTS, params);
    return normalizeTestAnalytics(res);
  },

  getTestSeries: async (params?: TestSeriesPerformanceParams): Promise<TestSeriesPerformance> => {
    const res = await getData(ENDPOINTS.ADMIN_DASHBOARD_TEST_SERIES, params);
    return normalizeTestSeriesPerformance(res);
  },

  getRevenue: async (params?: RevenueAnalyticsParams): Promise<RevenueAnalytics> => {
    const res = await getData(ENDPOINTS.ADMIN_DASHBOARD_REVENUE, params);
    return normalizeRevenueAnalytics(res);
  },

  getStudentPerformance: async (): Promise<StudentPerformanceAnalytics> => {
    const res = await getData(ENDPOINTS.ADMIN_DASHBOARD_STUDENT_PERFORMANCE);
    return normalizeStudentPerformanceAnalytics(res);
  },
};

export const getAnalyticss = analyticsService.getFullDashboard;
