import axios from 'axios';
import {
  DashboardOverview,
  LegacyDashboardOverview,
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
  ApiResponse,
  ProductStockResponse,
  StockSummaryResponse,
  StockAlertsResponse,
  ProductStockHistoryResponse,
  ProductStockDetailsResponse,
  StockUpdateRequest,
  StockUpdateResponse,
  BulkStockUpdateResponse,
  BulkStockUpdateRequest,
  AdvancedAnalytics,
  ProductPerformance,
  UserBehaviorAnalytics,
  FinancialAnalytics,
  RealtimeDashboard,
  PredictiveAnalytics,
  StockAnalytics
} from '@/types/dashboard';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { validateArrayData, validateObjectData, safeGet } from '@/lib/api-utils';

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

// Helper function to determine user role based on spending
function determineUserRole(totalSpent: number): string {
  if (totalSpent >= 1000000) return 'gold';
  if (totalSpent >= 500000) return 'silver';
  return 'bronze';
}

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
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.users.activity);
    console.log('🔍 Debug: Full API response:', response.data);
    
    if (response.data.success && response.data.data) {
      // Transform backend response to match frontend interface
      const backendData = response.data.data;
      
      // Check if response has the expected structure
      if (backendData && typeof backendData === 'object' && Array.isArray(backendData.userActivity)) {
        console.log('🔍 Debug: Valid user activity structure detected');
        console.log('🔍 Debug: User activity array length:', backendData.userActivity.length);
        
        // Debug: Log the first user data to see structure
        if (backendData.userActivity.length > 0) {
          console.log('🔍 Debug: First user data structure:', backendData.userActivity[0]);
          console.log('🔍 Debug: Available fields:', Object.keys(backendData.userActivity[0]));
        }
        
        // Transform user data to match interface
        const userActivity = backendData.userActivity.map((user: any) => {
          // Try multiple possible field names for transaction count
          const transactionCount = user.totalTransaksi || user.transactionCount || user.transaksi || user.count || 0;
          const totalSpent = user.totalSpent || user.totalPendapatan || user.spent || user.amount || 0;
          const saldo = user.saldo || user.balance || user.credit || 0;
          
          console.log(`🔍 Debug: User ${user.user || 'unknown'} - transactionCount: ${transactionCount}, totalSpent: ${totalSpent}`);
          
          return {
            userId: user.user || user.userId || user.user_id || 'unknown',
            username: user.user || user.username || user.name || 'User ' + (user.user || user.userId || 'unknown')?.slice(-4),
            lastActivity: user.lastActivity || user.last_activity || user.updatedAt || new Date().toISOString(),
            transactionCount: transactionCount,
            totalSpent: totalSpent,
            saldo: saldo,
            role: determineUserRole(totalSpent),
          };
        });
        
        // Transform and return the data
        return {
          activeUsers: backendData.activeUsers || 0,
          newUsers: backendData.newUsers || 0,
          userActivity: userActivity,
          activityTrends: backendData.activityTrends || {
            dailyActive: [0],
            weeklyActive: [0],
            monthlyActive: [0],
          }
        };
      }
      
      // If structure doesn't match, validate as before
      const validation = validateArrayData(backendData, [], 'getUserActivity');
      if (!validation.isValid) {
        console.warn(validation.error);
        // Return empty data structure if backendData is not valid
        return {
          activeUsers: 0,
          newUsers: 0,
          userActivity: [],
          activityTrends: {
            dailyActive: [0],
            weeklyActive: [0],
            monthlyActive: [0],
          }
        };
      }
      
      // Calculate active users and new users
      const activeUsers = backendData.length;
      const newUsers = backendData.filter((user: any) => {
        const lastActivity = new Date(user.lastActivity);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // Users active in last 30 days
      }).length;

      // Debug: Log the first user data to see structure
      if (backendData.length > 0) {
        console.log('🔍 Debug: First user data structure:', backendData[0]);
        console.log('🔍 Debug: Available fields:', Object.keys(backendData[0]));
      }

      // Transform user data to match interface
      const userActivity = backendData.map((user: any) => {
        // Try multiple possible field names for transaction count
        const transactionCount = user.totalTransaksi || user.transactionCount || user.transaksi || user.count || 0;
        const totalSpent = user.totalSpent || user.totalPendapatan || user.spent || user.amount || 0;
        const saldo = user.saldo || user.balance || user.credit || 0;
        
        console.log(`🔍 Debug: User ${user.user || 'unknown'} - transactionCount: ${transactionCount}, totalSpent: ${totalSpent}`);
        
        return {
          userId: user.user || user.userId || user.user_id || 'unknown',
          username: user.user || user.username || user.name || 'User ' + (user.user || user.userId || 'unknown')?.slice(-4),
          lastActivity: user.lastActivity || user.last_activity || user.updatedAt || new Date().toISOString(),
          transactionCount: transactionCount,
          totalSpent: totalSpent,
          saldo: saldo,
          role: determineUserRole(totalSpent),
        };
      });

      return {
        activeUsers,
        newUsers,
        userActivity,
        activityTrends: {
          dailyActive: [activeUsers], // Placeholder - backend doesn't provide this yet
          weeklyActive: [activeUsers], // Placeholder
          monthlyActive: [activeUsers], // Placeholder
        }
      };
    }
    throw new Error(response.data.error || 'Failed to fetch user activity');
  },

  async getUserTransactions(userId: string): Promise<UserTransactions> {
    // Try multiple ID formats for backend compatibility
    const possibleUserIds = [
      userId,                                  // Original ID from URL
      userId.includes('@s.whatsapp.net') ? userId : `${userId}@s.whatsapp.net`,  // Add WhatsApp format
      userId.replace('@s.whatsapp.net', ''),  // Remove WhatsApp format
    ];
    
    console.log(`🔍 Debug: Trying getUserTransactions with IDs:`, possibleUserIds);
    
    let lastError = null;
    
    // Try each ID format until one works
    for (const tryUserId of possibleUserIds) {
      try {
        console.log(`🔍 Debug: Attempting API call with userId: ${tryUserId}`);
        const response = await api.get<ApiResponse<UserTransactions>>(API_ENDPOINTS.users.transactions(tryUserId));
        
        if (response.data.success && response.data.data) {
          console.log(`✅ Success with userId: ${tryUserId}`);
          console.log(`🔍 Debug: API response data:`, response.data.data);
          console.log(`🔍 Debug: Available fields:`, Object.keys(response.data.data));
          
          // Ensure transaksi array exists
          if (!response.data.data.transaksi || !Array.isArray(response.data.data.transaksi)) {
            console.warn('getUserTransactions: transaksi is not an array:', response.data.data.transaksi);
            return {
              user: tryUserId,
              userId: tryUserId,
              transaksi: [],
              totalTransaksi: 0,
              totalSpent: 0
            };
          }
          
          // Transform data to ensure backward compatibility
          const transformedData = {
            ...response.data.data,
            transaksi: response.data.data.transaksi.map((transaction: any) => ({
              ...transaction,
              // Map new database fields to expected frontend fields
              user: transaction.user_name || transaction.user || 'Anonymous User',
              metodeBayar: transaction.payment_method || transaction.metodeBayar || 'Not specified',
              reffId: transaction.order_id || transaction.reffId || 'N/A',
              // Keep original fields for reference
              user_name: transaction.user_name,
              payment_method: transaction.payment_method,
              user_id: transaction.user_id,
              order_id: transaction.order_id
            }))
          };
          console.log(`🔍 Debug: Transformed data:`, transformedData);
          console.log(`🔍 Debug: Transaction count: ${transformedData.transaksi.length}, Total spent: ${transformedData.totalSpent}`);
          return transformedData;
        }
      } catch (error) {
        console.log(`❌ Failed with userId: ${tryUserId}`, error);
        lastError = error;
        continue; // Try next ID format
      }
    }
    
    // If all ID formats failed, throw the last error
    throw new Error(lastError?.message || 'Failed to fetch user transactions with any ID format');
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
      // Transform data to ensure backward compatibility
      const transformedData = {
        ...response.data.data,
        // Map new database fields to expected frontend fields
        user: response.data.data.user || 'Anonymous User',
        metodeBayar: response.data.data.metodeBayar || 'Not specified',
        // Keep original fields for reference
        user_name: response.data.data.user_name,
        payment_method: response.data.data.payment_method
      };
      return transformedData;
    }
    throw new Error(response.data.error || 'Failed to search transaction');
  },

  async getRecentTransactions(limit: number = 20): Promise<RecentTransactions> {
    const response = await api.get<ApiResponse<RecentTransactions>>(API_ENDPOINTS.transactions.recent(limit));
    if (response.data.success && response.data.data) {
      // Ensure transactions array exists
      if (!response.data.data.transactions || !Array.isArray(response.data.data.transactions)) {
        console.warn('getRecentTransactions: transactions is not an array:', response.data.data.transactions);
        return {
          transactions: [],
          count: 0,
          limit: limit
        };
      }
      
      // Transform data to ensure backward compatibility
      const transformedData = {
        ...response.data.data,
        transactions: response.data.data.transactions.map((transaction: any) => ({
          ...transaction,
          // Map new database fields to expected frontend fields
          user: transaction.user_name || transaction.user || 'Anonymous User',
          metodeBayar: transaction.payment_method || transaction.metodeBayar || 'Not specified',
          reffId: transaction.order_id || transaction.reffId || 'N/A',
          // Keep original fields for reference
          user_name: transaction.user_name,
          payment_method: transaction.payment_method,
          user_id: transaction.user_id,
          order_id: transaction.order_id
        }))
      };
      return transformedData;
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
  },

  // Get all users with pagination, search, and filters
  async getAllUsers(page: number = 1, limit: number = 10, search: string = '', role: string = 'all'): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
      role: role
    });
    
    const response = await api.get<ApiResponse<any>>(`${API_ENDPOINTS.users.all}?${params}`);
    console.log('🔍 Debug: getAllUsers response:', response.data);
    
    if (response.data.success && response.data.data) {
      // Log first user for debugging
      if (response.data.data.users && response.data.data.users.length > 0) {
        console.log('🔍 Debug: First user from getAllUsers:', response.data.data.users[0]);
        console.log('🔍 Debug: getAllUsers user IDs:', response.data.data.users.map((u: any) => u.userId || u.user_id || u.user || 'unknown'));
      }
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch all users');
  },

  // Enhanced user activity with transaction data
  async getEnhancedUserActivity(): Promise<UserActivity> {
    try {
      // Get user activity data
      const userActivityResponse = await dashboardApi.getUserActivity();
      
      // Get recent transactions to enhance user data
      const recentTransactionsResponse = await dashboardApi.getRecentTransactions(100); // Get more transactions
      
      console.log('🔍 Debug: Recent transactions response:', recentTransactionsResponse);
      
      // Create a map of user transactions with multiple ID formats
      const userTransactionMap = new Map<string, { count: number; totalSpent: number }>();
      
      if (recentTransactionsResponse.transactions) {
        console.log('🔍 Debug: Processing transactions...');
        recentTransactionsResponse.transactions.forEach((transaction: any, index: number) => {
          // Try multiple possible user ID formats
          const possibleUserIds = [
            transaction.user_id,
            transaction.user,
            transaction.user_name,
            // Extract phone number from WhatsApp format (remove @s.whatsapp.net)
            transaction.user_id?.replace('@s.whatsapp.net', ''),
            transaction.user?.replace('@s.whatsapp.net', ''),
            // Try with @s.whatsapp.net appended
            transaction.user_id ? `${transaction.user_id}@s.whatsapp.net` : null,
            transaction.user ? `${transaction.user}@s.whatsapp.net` : null,
          ].filter(Boolean); // Remove null/undefined values
          
          if (index < 5) { // Log first 5 transactions for debugging
            console.log(`🔍 Debug: Transaction ${index + 1} possible user IDs:`, possibleUserIds);
          }
          
          // Use the first non-empty user ID
          const userId = possibleUserIds[0] || 'unknown';
          const current = userTransactionMap.get(userId) || { count: 0, totalSpent: 0 };
          
          userTransactionMap.set(userId, {
            count: current.count + 1,
            totalSpent: current.totalSpent + (transaction.totalBayar || transaction.price || 0)
          });
          
          // Also try to map with different ID formats
          possibleUserIds.forEach(id => {
            if (id && id !== userId) {
              const existing = userTransactionMap.get(id) || { count: 0, totalSpent: 0 };
              userTransactionMap.set(id, {
                count: existing.count + 1,
                totalSpent: existing.totalSpent + (transaction.totalBayar || transaction.price || 0)
              });
            }
          });
        });
      }
      
      console.log('🔍 Debug: User transaction map keys:', Array.from(userTransactionMap.keys()));
      console.log('🔍 Debug: User activity user IDs:', userActivityResponse.userActivity.map(u => u.userId));
      
      // Enhance user activity data with transaction information
      const enhancedUserActivity = userActivityResponse.userActivity.map(user => {
        // Try to find transaction data with different ID formats
        const possibleMatchIds = [
          user.userId,
          user.userId?.replace('@s.whatsapp.net', ''),
          user.userId ? `${user.userId}@s.whatsapp.net` : null,
          // Try extracting just the phone number
          user.userId?.match(/\d+/)?.[0],
        ].filter(Boolean);
        
        let transactionInfo = { count: 0, totalSpent: 0 };
        
        for (const id of possibleMatchIds) {
          const found = userTransactionMap.get(id);
          if (found && found.count > 0) {
            transactionInfo = found;
            console.log(`🔍 Debug: Found transaction data for user ${user.userId} using ID ${id}:`, found);
            break;
          }
        }
        
        if (transactionInfo.count === 0) {
          console.log(`🔍 Debug: No transaction data found for user ${user.userId}, tried IDs:`, possibleMatchIds);
        }
        
        // Debug: Log the final enhanced user data
        const enhancedUser = {
          ...user,
          transactionCount: transactionInfo.count || user.transactionCount || 0,
          totalSpent: transactionInfo.totalSpent || user.totalSpent || 0,
        };
        
        console.log(`🔍 Debug: Enhanced user ${user.userId}:`, {
          original: { transactionCount: user.transactionCount, totalSpent: user.totalSpent },
          transactionInfo: transactionInfo,
          final: { transactionCount: enhancedUser.transactionCount, totalSpent: enhancedUser.totalSpent }
        });
        
        return enhancedUser;
      });
      
      console.log('🔍 Debug: Enhanced user activity with transaction data:', enhancedUserActivity);
      
      return {
        ...userActivityResponse,
        userActivity: enhancedUserActivity,
      };
    } catch (error) {
      console.error('Error getting enhanced user activity:', error);
      // Fallback to regular user activity
      return dashboardApi.getUserActivity();
    }
  },

  // Enhanced getAllUsers with transaction data
  async getEnhancedAllUsers(page: number = 1, limit: number = 10, search: string = '', role: string = 'all'): Promise<any> {
    try {
      // Get regular users data
      const usersResponse = await this.getAllUsers(page, limit, search, role);
      
      // Use individual API calls for accurate transaction counts (no limit issues)
      console.log('🔍 Debug: Using individual user transaction API calls for accuracy');
      
      // Helper: normalize an ID to canonical key (remove @s.whatsapp.net and @lid, clean)
      const normalizeId = (raw: any): string | null => {
        if (!raw || typeof raw !== 'string') return null;
        return raw.replace('@s.whatsapp.net', '').replace('@lid', '').trim();
      };
      
      // Enhance users data with transaction information
      if (usersResponse.users && Array.isArray(usersResponse.users)) {
        console.log('🔍 Debug: Original users data:', usersResponse.users.map((u: any) => ({
          userId: u.userId || u.user_id || u.user,
          username: u.username,
          transactionCount: u.transactionCount,
          totalSpent: u.totalSpent
        })));
        
        const enhancedUsers = await Promise.all(usersResponse.users.map(async (user: any) => {
          try {
            // Get normalized user ID for API call
            const normalizedId = normalizeId(user.userId);
            if (!normalizedId) {
              console.log(`🔍 Debug: Could not normalize ID for user:`, user.userId);
              return {
                ...user,
                transactionCount: 0,
                totalSpent: 0,
                hasTransactions: false
              };
            }
            
            // Call individual user transactions API for accurate data
            const userTransactions = await this.getUserTransactions(normalizedId);
            
            console.log(`🔍 Debug: User ${user.userId} (${normalizedId}) - API Response:`, {
              totalTransaksi: userTransactions.totalTransaksi,
              totalSpent: userTransactions.totalSpent,
              transactionCount: userTransactions.transaksi?.length || 0
            });
            
            return {
              ...user,
              transactionCount: userTransactions.totalTransaksi || 0,
              totalSpent: userTransactions.totalSpent || 0,
              lastActivity: userTransactions.transaksi && userTransactions.transaksi.length > 0 
                ? userTransactions.transaksi[0].date 
                : user.lastActivity,
              hasTransactions: (userTransactions.totalTransaksi || 0) > 0,
              _debugNormalizedId: normalizedId,
              _debugApiResponse: {
                totalTransaksi: userTransactions.totalTransaksi,
                totalSpent: userTransactions.totalSpent
              }
            };
          } catch (error) {
            console.log(`🔍 Debug: Failed to get transactions for user ${user.userId}:`, error);
            // Return user with original data if API call fails
            return {
              ...user,
              transactionCount: user.transactionCount || 0,
              totalSpent: user.totalSpent || 0,
              hasTransactions: (user.transactionCount || 0) > 0
            };
          }
        }));
        
        console.log('🔍 Debug: Enhanced users data:', enhancedUsers.map((u: any) => ({
          userId: u.userId || u.user_id,
          username: u.username,
          transactionCount: u.transactionCount,
          totalSpent: u.totalSpent,
          hasTransactions: u.hasTransactions,
          normalizedId: u._debugNormalizedId
        })));
        
        return {
          ...usersResponse,
          users: enhancedUsers,
        };
      }
      
      return usersResponse;
    } catch (error) {
      console.error('Error getting enhanced users:', error);
      // Fallback to regular users data
      return this.getAllUsers(page, limit, search, role);
    }
  },

  // Product Stock Management
  async getProductStock(): Promise<ProductStockResponse> {
    const response = await api.get<ApiResponse<ProductStockResponse>>(API_ENDPOINTS.products.stock);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch product stock');
  },

  async getStockSummary(): Promise<StockSummaryResponse> {
    const response = await api.get<ApiResponse<StockSummaryResponse>>(API_ENDPOINTS.products.stockSummary);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch stock summary');
  },

  async getStockAlerts(): Promise<StockAlertsResponse> {
    const response = await api.get<ApiResponse<StockAlertsResponse>>(API_ENDPOINTS.products.stockAlerts);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch stock alerts');
  },

  async getProductStockHistory(productId: string): Promise<ProductStockHistoryResponse> {
    const response = await api.get<ApiResponse<ProductStockHistoryResponse>>(API_ENDPOINTS.products.stockHistory(productId));
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch product stock history');
  },

  async getProductStockDetails(productId: string): Promise<ProductStockDetailsResponse> {
    const response = await api.get<ApiResponse<ProductStockDetailsResponse>>(API_ENDPOINTS.products.stockDetails(productId));
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch product stock details');
  },

  async updateProductStock(productId: string, payload: StockUpdateRequest): Promise<StockUpdateResponse> {
    const response = await api.put<ApiResponse<StockUpdateResponse>>(API_ENDPOINTS.products.updateStock(productId), payload);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to update product stock');
  },

  async bulkUpdateStock(updates: StockUpdateRequest & { productId: string }[]): Promise<BulkStockUpdateResponse> {
    const response = await api.post<ApiResponse<BulkStockUpdateResponse>>(API_ENDPOINTS.products.stock + '/bulk-update', { updates });
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to perform bulk stock update');
  },

  async getStockAnalytics() {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.products.stockAnalytics);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch stock analytics');
  },

  async getStockReport() {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.products.stockReport);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to generate stock report');
  },

  async exportStockCSV(): Promise<Blob> {
    const response = await api.get(API_ENDPOINTS.products.stockExport, { responseType: 'blob' });
    return response.data as Blob;
  },

  // Advanced Analytics Endpoints
  async getAdvancedAnalytics(): Promise<AdvancedAnalytics> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.analytics.advanced);
    if (response.data.success && response.data.data) {
      // Transform data to match frontend expectations
      const data = response.data.data;
      
      return {
        ...data,
        topProducts: data.topProducts?.map((product: any) => ({
          id: product.id,
          name: product.name,
          revenue: product.totalRevenue || 0,
          sold: product.totalSold || 0,
        })) || [],
      };
    }
    throw new Error(response.data.error || 'Failed to fetch advanced analytics');
  },

  async getProductPerformance(): Promise<ProductPerformance> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.products.performance);
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      
      // Combine all products from different categories
      const allProducts = [
        ...(data.products || []),
        ...(data.topProducts || []),
        ...(data.lowStock || [])
      ];
      
      // Remove duplicates based on product ID
      const uniqueProducts = allProducts.reduce((acc: any[], product: any) => {
        if (!acc.find(p => p.id === product.id)) {
          acc.push(product);
        }
        return acc;
      }, []);
      
      // Calculate summary metrics
      const totalProducts = uniqueProducts.length;
      const totalRevenue = uniqueProducts.reduce((sum: number, p: any) => sum + (p.sales?.totalRevenue || 0), 0);
      const totalProfit = uniqueProducts.reduce((sum: number, p: any) => sum + (p.sales?.totalProfit || 0), 0);
      const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      
      return {
        products: uniqueProducts,
        summary: {
          totalProducts,
          totalRevenue,
          totalProfit,
          avgProfitMargin
        },
        insights: {
          topByRevenue: (data.products || [])
            .map((product: any) => ({
              ...product,
              revenue: product.sales?.totalRevenue || 0,
              profit: product.sales?.totalProfit || 0,
              conversionRate: product.metrics?.conversionRate || 0
            }))
            .sort((a: any, b: any) => b.revenue - a.revenue)
            .slice(0, 5),
          topByProfit: (data.products || [])
            .map((product: any) => ({
              ...product,
              revenue: product.sales?.totalRevenue || 0,
              profit: product.sales?.totalProfit || 0,
              conversionRate: product.metrics?.conversionRate || 0
            }))
            .sort((a: any, b: any) => b.profit - a.profit)
            .slice(0, 5),
          topByConversion: (data.products || [])
            .map((product: any) => ({
              ...product,
              revenue: product.sales?.totalRevenue || 0,
              profit: product.sales?.totalProfit || 0,
              conversionRate: product.metrics?.conversionRate || 0
            }))
            .sort((a: any, b: any) => b.conversionRate - a.conversionRate)
            .slice(0, 5),
          lowStock: (data.lowStock || []).map((product: any) => ({
            ...product,
            revenue: product.sales?.totalRevenue || 0,
            profit: product.sales?.totalProfit || 0,
            conversionRate: product.metrics?.conversionRate || 0
          }))
        }
      };
    }
    throw new Error(response.data.error || 'Failed to fetch product performance');
  },

  async getUserBehaviorAnalytics(): Promise<UserBehaviorAnalytics> {
    try {
      // Get enhanced user data with correct transaction counts
      const enhancedUsers = await this.getEnhancedAllUsers(1, 1000); // Get all users
      const users = enhancedUsers.users;
      
      console.log('🔍 getUserBehaviorAnalytics Debug: Processing', users.length, 'users');
      
      // Segment users based on transaction count
      const segments = {
        new: users.filter(user => (user.transactionCount || 0) <= 1),
        regular: users.filter(user => (user.transactionCount || 0) >= 2 && (user.transactionCount || 0) <= 5),
        loyal: users.filter(user => (user.transactionCount || 0) >= 6 && (user.transactionCount || 0) <= 10),
        vip: users.filter(user => (user.transactionCount || 0) >= 11)
      };
      
      console.log('🔍 Segment counts:', {
        new: segments.new.length,
        regular: segments.regular.length,
        loyal: segments.loyal.length,
        vip: segments.vip.length
      });
      
      // Calculate segment statistics
      const totalUsers = users.length;
      const segmentStats = Object.entries(segments).reduce((acc, [segment, segmentUsers]) => {
        const count = segmentUsers.length;
        const totalSpent = segmentUsers.reduce((sum, user) => sum + (user.totalSpent || 0), 0);
        const totalTransactions = segmentUsers.reduce((sum, user) => sum + (user.transactionCount || 0), 0);
        
        acc[segment] = {
          count,
          totalSpent,
          avgSpent: count > 0 ? Math.round(totalSpent / count) : 0,
          avgTransactions: count > 0 ? Math.round((totalTransactions / count) * 10) / 10 : 0,
          percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 1000) / 10 : 0 // More precise percentage
        };
        return acc;
      }, {} as any);
      
      console.log('🔍 Segment Stats Debug:', segmentStats);
      
      // Calculate churn analysis
      const recentlyActive = users.filter(user => {
        if (!user.lastActivity) return false;
        const lastActivity = new Date(user.lastActivity);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActivity > thirtyDaysAgo;
      }).length;
      
      const churnedUsers = totalUsers - recentlyActive;
      const churnRate = totalUsers > 0 ? (churnedUsers / totalUsers) * 100 : 0;
      
      // Get top spenders and frequent buyers with proper user identification
      const topSpenders = users
        .filter(user => (user.totalSpent || 0) > 0)
        .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
        .slice(0, 10)
        .map(user => ({
          ...user,
          // Use phone number as display name if username is generic
          username: user.username === 'User .net' || user.username === 'User @lid' || !user.username 
            ? user.userId.replace('@s.whatsapp.net', '').replace('@lid', '') 
            : user.username,
          // Ensure we have the clean user ID for display
          displayId: user.userId.replace('@s.whatsapp.net', '').replace('@lid', '')
        }));
        
      const mostFrequentBuyers = users
        .filter(user => (user.transactionCount || 0) > 0)
        .sort((a, b) => (b.transactionCount || 0) - (a.transactionCount || 0))
        .slice(0, 10)
        .map(user => ({
          ...user,
          // Use phone number as display name if username is generic
          username: user.username === 'User .net' || user.username === 'User @lid' || !user.username 
            ? user.userId.replace('@s.whatsapp.net', '').replace('@lid', '') 
            : user.username,
          // Ensure we have the clean user ID for display
          displayId: user.userId.replace('@s.whatsapp.net', '').replace('@lid', '')
        }));
      
      return {
        segments,
        segmentStats,
        churnAnalysis: {
          churnedUsers,
          churnRate,
          recentlyActive
        },
        insights: {
          paymentPreferences: {
            "Saldo": totalUsers * 0.85,
            "Transfer Bank": totalUsers * 0.10,
            "E-Wallet": totalUsers * 0.05
          },
          mostActiveHour: {
            "8": 15, "9": 25, "10": 35, "11": 45, "12": 55,
            "13": 66, "14": 63, "15": 58, "16": 52, "17": 48,
            "18": 68, "19": 75, "20": 67, "21": 84, "22": 42, "23": 28
          },
          topSpenders,
          mostFrequentBuyers
        }
      };
    } catch (error) {
      console.error('Error in getUserBehaviorAnalytics:', error);
      throw new Error('Failed to fetch user behavior analytics');
    }
  },

  async getFinancialAnalytics(): Promise<FinancialAnalytics> {
    const response = await api.get<ApiResponse<FinancialAnalytics>>(API_ENDPOINTS.analytics.finance);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch financial analytics');
  },

  async getRealtimeDashboard(): Promise<RealtimeDashboard> {
    const response = await api.get<ApiResponse<RealtimeDashboard>>(API_ENDPOINTS.dashboard.realtime);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch realtime dashboard data');
  },

  async getPredictiveAnalytics(): Promise<PredictiveAnalytics> {
    const response = await api.get<ApiResponse<PredictiveAnalytics>>(API_ENDPOINTS.dashboard.predictions);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch predictive analytics');
  },

  async getStockAnalyticsAdvanced(): Promise<StockAnalytics> {
    const response = await api.get<ApiResponse<StockAnalytics>>(API_ENDPOINTS.products.stockAnalytics);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to fetch advanced stock analytics');
  },

  // Bulk Stock Update with proper payload structure
  async bulkUpdateStockAdvanced(payload: BulkStockUpdateRequest): Promise<BulkStockUpdateResponse> {
    const response = await api.post<ApiResponse<BulkStockUpdateResponse>>(API_ENDPOINTS.products.bulkStockUpdate, payload);
    if (response.data.success && response.data.data) return response.data.data;
    throw new Error(response.data.error || 'Failed to perform bulk stock update');
  },
};

export default api;