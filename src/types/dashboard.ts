export interface ApiResponse<T> {
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

// Advanced Analytics Types
export interface AdvancedAnalytics {
  overview: {
    totalUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    totalProfit: number;
    avgLTV: number;
  };
  distributions: {
    roles: {
      bronze: number;
      silver: number;
      gold: number;
    };
    paymentMethods: {
      [key: string]: number;
    };
  };
  trends: {
    monthly: Array<{
      month: string;
      revenue: number;
      transactions: number;
      profit: number;
    }>;
    hourlyActivity: Array<{
      hour: number;
      activity: number;
    }>;
  };
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    sold: number;
  }>;
  userMetrics: {
    totalCustomers: number;
    averageOrderValue: number;
    repeatCustomers: number;
  };
}

// Product Performance Analytics
export interface ProductPerformance {
  products: Array<{
    id: string;
    name: string;
    category: string;
    prices: {
      bronze: number;
      silver: number;
      gold: number;
    };
    stock: {
      current: number;
      status: string;
    };
    sales: {
      totalSold: number;
      totalRevenue: number;
      totalProfit: number;
      avgOrderValue: number;
    };
    metrics: {
      conversionRate: number;
      profitMargin: number;
      stockTurnover: number;
    };
  }>;
  summary: {
    totalProducts: number;
    totalRevenue: number;
    totalProfit: number;
    avgProfitMargin: number;
  };
  insights: {
    topByRevenue: any[];
    topByProfit: any[];
    topByConversion: any[];
    lowStock: any[];
  };
}

// User Behavior Analytics
export interface UserBehaviorAnalytics {
  segments: {
    new: any[];
    regular: any[];
    loyal: any[];
    vip: any[];
  };
  segmentStats: {
    [key: string]: {
      count: number;
      totalSpent: number;
      avgSpent: number;
      avgTransactions: number;
      percentage: number;
    };
  };
  churnAnalysis: {
    churnedUsers: number;
    churnRate: number;
    recentlyActive: number;
  };
  insights: {
    paymentPreferences: any;
    mostActiveHour: any;
    topSpenders: any[];
    mostFrequentBuyers: any[];
  };
}

// Financial Analytics
export interface FinancialAnalytics {
  overview: {
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    avgOrderValue: number;
    totalTransactions: number;
    revenueGrowthRate: number;
  };
  distributions: {
    byPaymentMethod: any;
    byUserRole: any;
    profitByRole: any;
  };
  trends: {
    daily: any[];
    monthly: any;
  };
  userFinances: {
    totalBalance: number;
    avgBalance: number;
    balanceDistribution: any;
  };
  insights: {
    healthScore: number;
    recommendations: string[];
  };
}

// Real-time Dashboard Data
export interface RealtimeDashboard {
  timestamp: string;
  today: {
    transactions: number;
    revenue: number;
    avgOrderValue: number;
    topProducts: any[];
  };
  last24h: {
    transactions: number;
    revenue: number;
  };
  realtime: {
    activeUsers: number;
    totalUsers: number;
    conversionRate: number;
    hourlyData: any[];
  };
  recent: {
    transactions: any[];
  };
  alerts: any[];
}

// Predictive Analytics
export interface PredictiveAnalytics {
  revenue: {
    historical: any[];
    predicted: {
      nextMonth: number;
      confidence: string;
    };
  };
  users: {
    historical: any[];
    predicted: {
      nextMonthNewUsers: number;
      totalPredicted: number;
    };
  };
  inventory: {
    stockPredictions: any[];
    totalRecommendedStock: number;
  };
  churnRisk: {
    highRisk: number;
    mediumRisk: number;
    usersAtRisk: any[];
  };
  trends: {
    categories: any;
    insights: any[];
  };
  recommendations: string[];
}

// Stock Analytics
export interface StockAnalytics {
  overview: {
    totalProducts: number;
    totalStockValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  performance: {
    topPerformers: any[];
    slowMovers: any[];
    stockTurnover: any[];
  };
  predictions: {
    restockNeeded: any[];
    demandForecast: any[];
  };
  insights: {
    recommendations: string[];
    trends: any[];
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
  deliveredAccount?: string | null;
  receiptExists?: boolean;
  receiptContent?: string;
  user_id?: string;
  order_id?: string;
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

// New: Product Stock Management Types
export interface ProductStockItemParsed {
  email?: string;
  password?: string;
  profile?: string;
  pin?: string;
  notes?: string;
}

export interface ProductStockItem {
  raw: string;
  parsed?: ProductStockItemParsed;
  isValid?: boolean;
}

export interface ProductStockEntry {
  id: string;
  name: string;
  desc?: string;
  priceB?: number;
  priceS?: number;
  priceG?: number;
  terjual?: number;
  stockCount: number;
  stok?: string[];
  stockStatus: 'out' | 'low' | 'medium' | 'good' | string;
  category?: string;
  minStock?: number;
  lastRestock?: string;
  utilization?: number;
}

export interface ProductStockResponse {
  totalProducts: number;
  totalSold: number;
  products: ProductStockEntry[];
  topProducts?: ProductStockEntry[];
}

export interface StockSummaryResponse {
  totalProducts: number;
  totalStockItems: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  categories: string[];
  stockByCategory: Record<string, number>;
}

export interface StockAlertItem {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  status: 'out' | 'low' | 'medium' | 'good' | string;
  category?: string;
  lastRestock?: string;
  urgency: 'critical' | 'high' | 'medium' | 'low' | string;
}

export interface StockAlertsResponse {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  alerts: StockAlertItem[];
}

export interface StockHistoryItem {
  type: 'restock' | 'deduct' | string;
  timestamp: string;
  description?: string;
  quantity: number;
}

export interface ProductStockHistoryResponse {
  productId: string;
  productName: string;
  currentStock: number;
  history: StockHistoryItem[];
}

export interface ProductStockDetailsResponse {
  productId: string;
  productName: string;
  description?: string;
  prices?: {
    bronze?: number;
    silver?: number;
    gold?: number;
  };
  sales?: {
    total?: number;
  };
  stock: {
    count: number;
    status: string;
    items?: ProductStockItem[];
    metrics?: Record<string, number>;
  };
  category?: string;
  lastRestock?: string;
  terms?: string;
}

export interface StockUpdateRequest {
  action: 'add' | 'remove';
  stockItems: string[];
  notes?: string;
}

export interface StockUpdateResponse {
  productId: string;
  previousStockCount: number;
  newStockCount: number;
  addedItems: number;
  removedItems: number;
  updatedAt: string;
  notes?: string;
}

export interface BulkStockUpdateItemResult {
  productId: string;
  success: boolean;
  previousStockCount?: number;
  newStockCount?: number;
  action?: 'add' | 'remove';
  itemsProcessed?: number;
  error?: string;
}

export interface BulkStockUpdateRequest {
  updates: Array<{
    productId: string;
    action: 'add' | 'remove';
    stockItems: string[];
    notes?: string;
  }>;
}

export interface BulkStockUpdateResponse {
  totalUpdates: number;
  successfulUpdates: number;
  failedUpdates: number;
  results: BulkStockUpdateItemResult[];
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

// Stock Management Types
export interface StockItem {
  email: string;
  password: string;
  profile?: string;
  pin?: string;
  notes?: string;
}

export interface StockItemResponse {
  raw: string;
  index: number;
  email: string;
  password: string;
  profile?: string;
  pin?: string;
  notes?: string;
}

export interface AddStockRequest {
  stockItems: (string | StockItem)[];
  notes?: string;
}

export interface AddStockResponse {
  productId: string;
  productName: string;
  previousStockCount: number;
  newStockCount: number;
  addedItems: number;
  invalidItems: number;
  updatedAt: string;
  notes?: string;
  addedStockItems: string[];
}

export interface EditStockRequest {
  stockItem: StockItem;
  notes?: string;
}

export interface EditStockResponse {
  productId: string;
  productName: string;
  stockIndex: number;
  oldStockItem: string;
  newStockItem: string;
  updatedAt: string;
  notes?: string;
}

export interface DeleteStockRequest {
  notes?: string;
}

export interface DeleteMultipleStockRequest {
  deleteType: 'indexes' | 'first' | 'last' | 'all';
  stockIndexes?: number[];
  notes?: string;
}

export interface DeleteStockResponse {
  productId: string;
  productName: string;
  deletedIndex?: number;
  deletedItem?: string;
  deleteType?: string;
  originalStockCount: number;
  newStockCount: number;
  deletedItemsCount?: number;
  deletedItems?: Array<{ index: number; item: string }>;
  updatedAt: string;
  notes?: string;
}

export interface GetStockItemResponse {
  productId: string;
  productName: string;
  stockIndex: number;
  totalStockCount: number;
  stockItem: StockItemResponse;
}

export interface ReplaceAllStockRequest {
  stockItems: (string | StockItem)[];
  notes?: string;
}

export interface ReplaceAllStockResponse {
  productId: string;
  productName: string;
  originalStockCount: number;
  newStockCount: number;
  validItems: number;
  invalidItems: number;
  updatedAt: string;
  notes?: string;
}

// Single stock item operations (per PRODUCT & STOCK API contract)
export interface AddSingleStockItemRequest {
  value: string; // formatted: "email|password|profile|pin|notes"
  position?: number; // optional insert position
}

export interface AddSingleStockItemResponse {
  productId: string;
  newStockCount: number;
}

export interface EditSingleStockItemRequestByIndex {
  index: number;
  value: string;
}

export interface EditSingleStockItemRequestByMatch {
  match: string;
  value: string;
}

export type EditSingleStockItemRequest = EditSingleStockItemRequestByIndex | EditSingleStockItemRequestByMatch;

export interface EditSingleStockItemResponse {
  success: boolean;
}

export interface DeleteSingleStockItemRequestByIndex {
  index: number;
}

export interface DeleteSingleStockItemRequestByMatch {
  match: string;
}

export type DeleteSingleStockItemRequest = DeleteSingleStockItemRequestByIndex | DeleteSingleStockItemRequestByMatch;

export interface DeleteSingleStockItemResponse {
  success: boolean;
}

// Product CRUD types (minimal per contract)
export interface ProductCreateRequest {
  id: string;
  name: string;
  desc?: string;
  priceB?: number;
  priceS?: number;
  priceG?: number;
  snk?: string;
  minStock?: number;
}

export type ProductUpdateRequest = Partial<ProductCreateRequest>;

export interface ProductCrudResponse<T = any> {
  success: boolean;
  data?: T;
}

export interface BulkOperationRequest {
  operations: Array<{
    productId: string;
    action: 'add' | 'delete' | 'clear';
    data?: any;
    notes?: string;
  }>;
}

export interface BulkOperationResponse {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  results: Array<{
    productId: string;
    action: string;
    success: boolean;
    originalStockCount: number;
    newStockCount: number;
    addedItems?: number;
    deletedItems?: number;
    clearedItems?: number;
    notes?: string;
  }>;
}