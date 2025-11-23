import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, ShoppingCart, Package, Calendar } from 'lucide-react';
import { dashboardApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';

export default function SalesReportPage() {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions', 'sales-report', 100],
    queryFn: () => dashboardApi.getRecentTransactions(100),
  });

  // Process sales data from transactions
  const salesData = recentTransactions?.transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: 0,
        orders: 0,
        products: 1,
      };
    }
    
    acc[monthKey].revenue += transaction.totalBayar;
    acc[monthKey].orders += 1;
    
    return acc;
  }, {} as any) || {};

  const monthlyData = Object.values(salesData).slice(-6); // Last 6 months

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading sales report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-400 mb-2">Failed to load sales report</p>
            <p className="text-sm text-gray-400">Please check your API connection</p>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = monthlyData.reduce((sum: number, data: any) => sum + data.revenue, 0);
  const totalOrders = monthlyData.reduce((sum: number, data: any) => sum + data.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sales Report</h1>
            <p className="text-gray-400 mt-1">WhatsApp Bot Sales Performance</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sales Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-green-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Last 6 months
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{totalOrders}</p>
                  <p className="text-sm text-blue-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Last 6 months
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(avgOrderValue)}</p>
                  <p className="text-sm text-purple-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Per transaction
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Today's Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(overview?.pendapatanHariIni || 0)}</p>
                  <p className="text-sm text-orange-400 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Today
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Sales Breakdown */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Monthly Sales Breakdown</CardTitle>
            <CardDescription className="text-gray-400">Sales performance by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 border border-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {data.month.split(' ')[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{data.month}</p>
                      <p className="text-sm text-gray-400">Monthly performance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="font-bold text-white">{formatCurrency(data.revenue)}</p>
                      <p className="text-sm text-gray-400">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white">{data.orders}</p>
                      <p className="text-sm text-gray-400">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white">{formatCurrency(data.revenue / data.orders)}</p>
                      <p className="text-sm text-gray-400">Avg. Value</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Performance */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods Performance</CardTitle>
            <CardDescription className="text-gray-400">Sales breakdown by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-white">QRIS</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{overview?.metodeBayar?.qris || 0}</p>
                  <p className="text-sm text-gray-400">transactions</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-white">Saldo</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{overview?.metodeBayar?.saldo || 0}</p>
                  <p className="text-sm text-gray-400">transactions</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 border border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="font-medium text-white">Lainnya</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{overview?.metodeBayar?.unknown || 0}</p>
                  <p className="text-sm text-gray-400">transactions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
