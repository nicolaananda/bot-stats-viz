export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardOverview {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  totalProfit: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
  quickStats: {
    todayRevenue: number;
    todayTransactions: number;
    monthlyGrowth: number;
    userGrowth: number;
  };
}

export interface ChartData {
  labels: string[];
  revenue: number[];
  transactions: number[];
  profit: number[];
  userGrowth?: number[];
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
  totalTransaksi: number;
  totalSpent: number;
  transaksi: Transaction[];
}

export interface Transaction {
  id: string;
  name: string;
  price: number;
  date: string;
  jumlah: number;
  user?: string;
  metodeBayar: string;
  totalBayar: number;
  reffId: string;
}

export interface TransactionDetail {
  reffId: string;
  user: string;
  userRole: string;
  produk: string;
  idProduk: string;
  harga: number;
  jumlah: number;
  totalBayar: number;
  metodeBayar: string;
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