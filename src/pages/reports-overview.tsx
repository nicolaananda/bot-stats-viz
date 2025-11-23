import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign, CreditCard, Activity } from 'lucide-react';
import { dashboardApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';

export default function ReportsOverviewPage() {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions', 'reports', 10],
    queryFn: () => dashboardApi.getRecentTransactions(10),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading reports...</p>
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
            <p className="text-red-400 mb-2">Failed to load reports</p>
            <p className="text-sm text-gray-400">Please check your API connection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports Overview</h1>
            <p className="text-gray-400 mt-1">WhatsApp Bot Analytics and Insights</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(overview?.totalPendapatan || 0)}</p>
                  <p className="text-sm text-green-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {overview?.transaksiHariIni || 0} transaksi hari ini
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
                  <p className="text-sm text-gray-400 mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold text-white">{overview?.totalTransaksi || 0}</p>
                  <p className="text-sm text-blue-400 flex items-center mt-1">
                    <Activity className="h-3 w-3 mr-1" />
                    {overview?.transaksiHariIni || 0} hari ini
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-400" />
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
                  <p className="text-sm text-purple-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Daily performance
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-white">{recentTransactions?.transactions.length || 0}</p>
                  <p className="text-sm text-orange-400 flex items-center mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    Recent users
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Breakdown */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods Analysis</CardTitle>
            <CardDescription className="text-gray-400">Breakdown by payment method</CardDescription>
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

        {/* Recent Transactions Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions Summary</CardTitle>
            <CardDescription className="text-gray-400">Latest transaction insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions?.transactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 border border-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {transaction.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{transaction.name}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.user_name || 'Unknown User'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{formatCurrency(transaction.totalBayar)}</p>
                    <p className="text-sm text-gray-400">{transaction.metodeBayar || 'Unknown'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
