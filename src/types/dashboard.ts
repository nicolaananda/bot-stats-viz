export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardOverview {
  totalTransaksi: number;
  totalPendapatan: number;
  transaksiHariIni: number;
  pendapatanHariIni: number;
  metodeBayar: {
    saldo: number;
    qris: number;
    unknown: number;
  };
  topUsers: any[];
  chartData: {
    daily: Array<{
      date: string;
      transaksi: number;
      pendapatan: number;
    }>;
    monthly: Array<{
      month: string;
      transaksi: number;
      pendapatan: number;
    }>;
    userActivity: any[];
  };
}

export interface ChartData {
  labels: string[];
  revenue: number[];
  transactions: number[];
  profit: number[];
  userGrowth?: number[];
}

export interface DailyChartData {
  labels: string[];
  revenue: number[];
  transactions: number[];
  profit: number[];
}

export interface MonthlyChartData {
  labels: string[];
  revenue: number[];
  transactions: number[];
  profit: number[];
  userGrowth: number[];
}

export interface UserActivity {
  activeUsers: number;
  newUsers: number;
  userActivity: Array<{
    userId: string;
    username: string;
    lastActivity: string;
    transactionCount: number;
    totalSpent: number;
    saldo: number;
    role: string;
  }>;
  activityTrends: {
    dailyActive: number[];
    weeklyActive: number[];
    monthlyActive: number[];
  };
}

export interface UserTransactions {
  user: string;
  userId: string;
  totalTransaksi: number;
  totalSpent: number;
  currentSaldo?: number;
  transaksi: Transaction[];
}

export interface Transaction {
  id?: string;
  referenceId?: string;
  reffId: string;
  name: string;
  price: number;
  date: string;
  jumlah: number;
  user_name?: string;
  user_id?: string;
  payment_method?: string;
  metodeBayar?: string; // Keep for backward compatibility
  totalBayar: number;
  order_id?: string;
  status?: 'completed' | 'pending' | 'failed' | string;
  // Additional fields for better transaction details
  productDetails?: {
    category?: string;
    description?: string;
  };
  // Payment and shipping info
  paymentStatus?: string;
  shippingStatus?: string;
  notes?: string;
}

export interface TransactionDetail {
  reffId: string;
  user: string;
  user_name?: string;
  userRole: string;
  produk: string;
  idProduk: string;
  harga: number;
  jumlah: number;
  totalBayar: number;
  metodeBayar: string;
  payment_method?: string;
  tanggal: string;
  profit: number;
}

export interface UserStats {
  totalUsers: number;
  totalSaldo: number;
  userStats: {
    [role: string]: {
      count: number;
      totalSaldo: number;
    };
  };
  averageSaldo: number;
}

export interface ProductStats {
  totalProducts: number;
  totalSold: number;
  products: Product[];
  topProducts: Product[];
}

export interface Product {
  id: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  transactionCount: number;
}

export interface RecentTransactions {
  transactions: Transaction[];
  count: number;
  limit: number;
}

export interface ExportResponse {
  success: boolean;
  message: string;
  filename: string;
}