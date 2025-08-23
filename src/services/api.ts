import axios from 'axios';
import {
  DashboardOverview,
  ChartData,
  UserActivity,
  UserTransactions,
  TransactionDetail,
  UserStats,
  ProductStats,
  RecentTransactions,
  ExportResponse,
  ApiResponse
} from '@/types/dashboard';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
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
    const response = await api.get<ApiResponse<DashboardOverview>>('/api/dashboard/overview');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch dashboard overview');
  },

  // Chart Data
  async getDailyChart(): Promise<ChartData> {
    const response = await api.get<ApiResponse<ChartData>>('/api/dashboard/chart/daily');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch daily chart data');
  },

  async getMonthlyChart(): Promise<ChartData> {
    const response = await api.get<ApiResponse<ChartData>>('/api/dashboard/chart/monthly');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch monthly chart data');
  },

  // User Management
  async getUserActivity(): Promise<UserActivity> {
    const response = await api.get<ApiResponse<UserActivity>>('/api/dashboard/users/activity');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch user activity');
  },

  async getUserTransactions(userId: string): Promise<UserTransactions> {
    const response = await api.get<ApiResponse<UserTransactions>>(`/api/dashboard/users/${userId}/transactions`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch user transactions');
  },

  async getUserStats(): Promise<UserStats> {
    const response = await api.get<ApiResponse<UserStats>>('/api/dashboard/users/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch user stats');
  },

  // Transactions
  async searchTransaction(reffId: string): Promise<TransactionDetail> {
    const response = await api.get<ApiResponse<TransactionDetail>>(`/api/dashboard/transactions/search/${reffId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to search transaction');
  },

  async getRecentTransactions(limit: number = 20): Promise<RecentTransactions> {
    const response = await api.get<ApiResponse<RecentTransactions>>(`/api/dashboard/transactions/recent?limit=${limit}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch recent transactions');
  },

  // Products
  async getProductStats(): Promise<ProductStats> {
    const response = await api.get<ApiResponse<ProductStats>>('/api/dashboard/products/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch product stats');
  },

  // Export
  async exportData(format: string): Promise<ExportResponse> {
    const response = await api.get<ExportResponse>(`/api/dashboard/export/${format}`);
    return response.data;
  }
};

export default api;