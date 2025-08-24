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
      
      // Get recent transactions to enhance user data
      const recentTransactionsResponse = await this.getRecentTransactions(100);
      
      console.log('🔍 Debug: Recent transactions for users enhancement:', recentTransactionsResponse);
      
      // Create a map of user transactions with multiple ID formats
      const userTransactionMap = new Map<string, { count: number; totalSpent: number; lastTransaction: string | null }>();
      
      if (recentTransactionsResponse.transactions) {
        console.log('🔍 Debug: Processing transactions for users...');
        recentTransactionsResponse.transactions.forEach((transaction: any, index: number) => {
          // Try multiple possible user ID formats
          const possibleUserIds = [
            transaction.user_id,
            transaction.user,
            transaction.user_name,
            // Extract phone number from WhatsApp format
            transaction.user_id?.replace('@s.whatsapp.net', ''),
            transaction.user?.replace('@s.whatsapp.net', ''),
            // Try with @s.whatsapp.net appended
            transaction.user_id ? `${transaction.user_id}@s.whatsapp.net` : null,
            transaction.user ? `${transaction.user}@s.whatsapp.net` : null,
          ].filter(Boolean);
          
          if (index < 3) { // Log first 3 transactions for debugging
            console.log(`🔍 Debug: Transaction ${index + 1} for users - possible user IDs:`, possibleUserIds);
          }
          
                     // Map to all possible ID formats
           possibleUserIds.forEach(userId => {
             if (userId) {
               const current = userTransactionMap.get(userId) || { count: 0, totalSpent: 0, lastTransaction: null };
               userTransactionMap.set(userId, {
                 count: current.count + 1,
                 totalSpent: current.totalSpent + (transaction.totalBayar || transaction.price || 0),
                 lastTransaction: transaction.date || current.lastTransaction,
               });
             }
           });
        });
      }
      
      console.log('🔍 Debug: User transaction map for users (first 5 entries):', 
        Array.from(userTransactionMap.entries()).slice(0, 5));
      
      // Enhance users data with transaction information
      if (usersResponse.users && Array.isArray(usersResponse.users)) {
        console.log('🔍 Debug: Original users data:', usersResponse.users.map((u: any) => ({
          userId: u.userId || u.user_id || u.user,
          transactionCount: u.transactionCount,
          totalSpent: u.totalSpent
        })));
        
        const enhancedUsers = usersResponse.users.map((user: any) => {
          // Try to find transaction data with different ID formats
          const possibleMatchIds = [
            user.userId,
            user.user_id,
            user.user,
            user.username,
            // Remove @s.whatsapp.net if present
            user.userId?.replace('@s.whatsapp.net', ''),
            user.user_id?.replace('@s.whatsapp.net', ''),
            // Add @s.whatsapp.net if not present
            user.userId && !user.userId.includes('@s.whatsapp.net') ? `${user.userId}@s.whatsapp.net` : null,
            user.user_id && !user.user_id.includes('@s.whatsapp.net') ? `${user.user_id}@s.whatsapp.net` : null,
            // Extract just the phone number
            user.userId?.match(/\d+/)?.[0],
            user.user_id?.match(/\d+/)?.[0],
          ].filter(Boolean);
          
          let transactionInfo = { count: 0, totalSpent: 0, lastTransaction: null };
          let matchedId = null;
          
          for (const id of possibleMatchIds) {
            const found = userTransactionMap.get(id);
            if (found && found.count > 0) {
              transactionInfo = found;
              matchedId = id;
              console.log(`🔍 Debug: Found transaction data for user ${user.userId || user.user_id} using ID ${id}:`, found);
              break;
            }
          }
          
          if (transactionInfo.count === 0) {
            console.log(`🔍 Debug: No transaction data found for user ${user.userId || user.user_id}, tried IDs:`, possibleMatchIds);
          }
          
          return {
            ...user,
            transactionCount: transactionInfo.count || user.transactionCount || 0,
            totalSpent: transactionInfo.totalSpent || user.totalSpent || 0,
            lastActivity: transactionInfo.lastTransaction || user.lastActivity || null,
            _debugMatchedId: matchedId, // For debugging only
          };
        });
        
        console.log('🔍 Debug: Enhanced users data:', enhancedUsers);
        
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
  }
};

export default api;