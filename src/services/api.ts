import axios from 'axios';
import {
  DashboardOverview,
  ChartData,
  DailyChartData,
  MonthlyChartData,
  UserActivity,
  UserTransactions,
  TransactionDetail,
  UserStats,
  ProductStats,
  RecentTransactions,
  ExportResponse,
  ApiResponse
} from '@/types/dashboard';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  if (API_CONFIG.enableLogging) {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const dashboardApi = {
  // Dashboard Overview
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get<ApiResponse<DashboardOverview>>(API_ENDPOINTS.dashboard.overview);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch dashboard overview');
  },

  // Chart Data
  async getDailyChart(): Promise<DailyChartData> {
    const response = await api.get<ApiResponse<DailyChartData>>(API_ENDPOINTS.dashboard.dailyChart);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch daily chart data');
  },

  async getMonthlyChart(): Promise<MonthlyChartData> {
    const response = await api.get<ApiResponse<MonthlyChartData>>(API_ENDPOINTS.dashboard.monthlyChart);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch monthly chart data');
  },

  // User Management
  async getUserActivity(): Promise<UserActivity> {
    const response = await api.get<ApiResponse<UserActivity>>(API_ENDPOINTS.users.activity);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch user activity');
  },

  async getUserTransactions(userId: string): Promise<UserTransactions> {
    const response = await api.get<ApiResponse<UserTransactions>>(API_ENDPOINTS.users.transactions(userId));
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch user transactions');
  },

  async getUserStats(): Promise<UserStats> {
    const response = await api.get<ApiResponse<UserStats>>(API_ENDPOINTS.users.stats);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch user stats');
  },

  // Transactions
  async searchTransaction(reffId: string): Promise<TransactionDetail> {
    const response = await api.get<ApiResponse<TransactionDetail>>(API_ENDPOINTS.transactions.search(reffId));
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to search transaction');
  },

  async getRecentTransactions(limit: number = 20): Promise<RecentTransactions> {
    const response = await api.get<ApiResponse<RecentTransactions>>(API_ENDPOINTS.transactions.recent(limit));
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch recent transactions');
  },

  // Products
  async getProductStats(): Promise<ProductStats> {
    const response = await api.get<ApiResponse<ProductStats>>(API_ENDPOINTS.products.stats);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch product stats');
  },

  // Export
  async exportData(format: string): Promise<ExportResponse> {
    const response = await api.get<ExportResponse>(API_ENDPOINTS.export(format));
    return response.data;
  }
};

export default api;