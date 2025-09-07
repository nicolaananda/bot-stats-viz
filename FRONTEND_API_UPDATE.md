# Frontend API Update - Advanced Dashboard Integration

## Overview

Frontend telah diperbarui untuk mendukung semua endpoint advanced yang ada di `ADVANCED_API_DOCUMENTATION.md`. API backend yang sudah ada di `https://api-botwa.nicola.id/` akan digunakan sebagai base URL.

## Changes Made

### 1. API Configuration (`src/config/api.ts`)

**Base URL Updated:**
- Sebelum: `http://185.201.9.64:3002`
- Sesudah: `https://api-botwa.nicola.id`

**New Endpoints Added:**
```typescript
export const API_ENDPOINTS = {
  dashboard: {
    overview: '/api/dashboard/overview',
    dailyChart: '/api/dashboard/chart/daily',
    monthlyChart: '/api/dashboard/chart/monthly',
    realtime: '/api/dashboard/realtime',                    // NEW
    predictions: '/api/dashboard/predictions',              // NEW
  },
  users: {
    activity: '/api/dashboard/users/activity',
    all: '/api/dashboard/users/all',
    stats: '/api/dashboard/users/stats',
    behavior: '/api/dashboard/users/behavior',              // NEW
    transactions: (userId: string) => `/api/dashboard/users/${userId}/transactions`,
  },
  analytics: {                                              // NEW SECTION
    advanced: '/api/dashboard/analytics/advanced',
    finance: '/api/dashboard/finance/analytics',
  },
  products: {
    // ... existing endpoints
    performance: '/api/dashboard/products/performance',     // NEW
    bulkStockUpdate: '/api/dashboard/products/stock/bulk-update', // NEW
  },
}
```

### 2. Type Definitions (`src/types/dashboard.ts`)

**New Advanced Types Added:**
- `AdvancedAnalytics` - Comprehensive analytics with user segments, trends, distributions
- `ProductPerformance` - Detailed product performance metrics and insights
- `UserBehaviorAnalytics` - User segmentation and behavior analysis
- `FinancialAnalytics` - Financial health, profit margins, revenue analysis
- `RealtimeDashboard` - Real-time metrics and live data
- `PredictiveAnalytics` - AI-powered predictions and forecasting
- `StockAnalytics` - Advanced stock analytics and insights
- `BulkStockUpdateRequest` - Proper bulk stock update payload structure

**Updated Existing Types:**
- `DashboardOverview` - Updated to match advanced API response format
- Added `LegacyDashboardOverview` for backward compatibility

### 3. API Services (`src/services/api.ts`)

**New API Functions Added:**
```typescript
// Advanced Analytics
async getAdvancedAnalytics(): Promise<AdvancedAnalytics>
async getProductPerformance(): Promise<ProductPerformance>
async getUserBehaviorAnalytics(): Promise<UserBehaviorAnalytics>
async getFinancialAnalytics(): Promise<FinancialAnalytics>

// Real-time & Predictions
async getRealtimeDashboard(): Promise<RealtimeDashboard>
async getPredictiveAnalytics(): Promise<PredictiveAnalytics>

// Enhanced Stock Management
async getStockAnalyticsAdvanced(): Promise<StockAnalytics>
async bulkUpdateStockAdvanced(payload: BulkStockUpdateRequest): Promise<BulkStockUpdateResponse>
```

## API Endpoints Supported

Sesuai dengan `ADVANCED_API_DOCUMENTATION.md`, frontend sekarang mendukung:

### 🔧 Basic Endpoints (1-8)
✅ Dashboard Overview
✅ Daily/Monthly Chart Data  
✅ User Activity & All Users (Paginated)
✅ User Transactions
✅ Search Transaction by Reference ID
✅ Recent Transactions

### 📊 Advanced Analytics (9-14)
✅ Advanced Analytics Dashboard
✅ Product Performance Analytics
✅ User Behavior Analytics
✅ Financial Analytics & Insights
✅ Real-time Dashboard Data
✅ Predictive Analytics

### 📦 Stock Management (15-24)
✅ Product Stock Overview & Summary
✅ Stock Alerts & Analytics
✅ Update Product Stock
✅ Stock History & Details
✅ Bulk Stock Update
✅ Stock Report & Export

## Environment Configuration

Update your `.env` file:
```bash
# API Configuration
VITE_API_URL=https://api-botwa.nicola.id

# Optional configurations
VITE_API_TIMEOUT=10000
VITE_API_LOGGING=true
```

## Usage Examples

### Advanced Analytics
```typescript
import { dashboardApi } from '@/services/api';

// Get comprehensive analytics
const analytics = await dashboardApi.getAdvancedAnalytics();
console.log(analytics.overview); // totalUsers, totalRevenue, etc.
console.log(analytics.distributions.roles); // bronze, silver, gold counts
console.log(analytics.trends.monthly); // monthly revenue trends

// Get product performance
const performance = await dashboardApi.getProductPerformance();
console.log(performance.insights.topByRevenue);
```

### Real-time Dashboard
```typescript
// Get live dashboard data
const realtime = await dashboardApi.getRealtimeDashboard();
console.log(realtime.today.transactions);
console.log(realtime.realtime.activeUsers);
```

### User Behavior Analytics
```typescript
// Get user segmentation
const behavior = await dashboardApi.getUserBehaviorAnalytics();
console.log(behavior.segments.vip); // VIP users (11+ transactions)
console.log(behavior.churnAnalysis.churnRate);
```

### Predictive Analytics
```typescript
// Get AI predictions
const predictions = await dashboardApi.getPredictiveAnalytics();
console.log(predictions.revenue.predicted.nextMonth);
console.log(predictions.churnRisk.usersAtRisk);
```

## Next Steps

1. **Backend Implementation**: Pastikan semua endpoint di `https://api-botwa.nicola.id/` sudah mengimplementasikan response format sesuai `ADVANCED_API_DOCUMENTATION.md`

2. **Testing**: Test semua endpoint baru untuk memastikan kompatibilitas

3. **UI Components**: Update komponen React untuk menggunakan data dari endpoint advanced analytics

4. **Error Handling**: Implement proper error handling untuk endpoint baru

5. **Caching**: Consider implementing caching untuk endpoint yang data-heavy seperti analytics

## Compatibility

- ✅ Backward compatible dengan API lama
- ✅ Progressive enhancement - endpoint baru bersifat optional
- ✅ Graceful degradation jika endpoint advanced belum tersedia
- ✅ Type safety dengan TypeScript

Frontend sekarang siap untuk mengkonsumsi semua advanced analytics dan features sesuai dokumentasi! 