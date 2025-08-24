import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, CreditCard, DollarSign, Activity } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { EnvironmentBanner } from '@/components/ui/environment-banner';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatTime, getTransactionUserName, getTransactionPaymentMethod, getTransactionReferenceId } from '@/lib/utils';
import { lazy, Suspense } from 'react';

// Lazy load chart component
const OverviewChart = lazy(() => import('@/components/charts/overview-chart'));

// Chart loading fallback
const ChartLoading = () => (
  <div className="flex items-center justify-center h-[350px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading chart...</p>
    </div>
  </div>
);

export default function DashboardOverview() {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });

  const { data: dailyChart } = useQuery({
    queryKey: ['daily-chart'],
    queryFn: dashboardApi.getDailyChart,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(5),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground">Please check your API connection</p>
        </div>
      </div>
    );
  }



  const chartData = overview?.chartData?.daily ? overview.chartData.daily.map((item) => ({
    date: item.date,
    revenue: item.pendapatan,
    transactions: item.transaksi,
    profit: item.pendapatan * 0.1, // Assuming 10% profit
  })) : [];

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* <EnvironmentBanner /> */}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Comprehensive analytics for your WhatsApp bot performance
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Pendapatan"
          value={formatCurrency(overview?.totalPendapatan || 0)}
          change={`${overview?.transaksiHariIni || 0} transaksi hari ini`}
          changeType="positive"
          icon={DollarSign}
          className="group hover:shadow-elevated transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
        />
        <StatsCard
          title="Total Transaksi"
          value={overview?.totalTransaksi || 0}
          change={`${overview?.transaksiHariIni || 0} hari ini`}
          changeType="neutral"
          icon={CreditCard}
          className="group hover:shadow-elevated transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20"
        />
        <StatsCard
          title="Pendapatan Hari Ini"
          value={formatCurrency(overview?.pendapatanHariIni || 0)}
          change="Hari ini"
          changeType="positive"
          icon={TrendingUp}
          className="group hover:shadow-elevated transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20"
        />
        <StatsCard
          title="Metode Pembayaran"
          value={`${overview?.metodeBayar?.qris || 0} QRIS, ${overview?.metodeBayar?.saldo || 0} Saldo`}
          change={`${overview?.metodeBayar?.unknown || 0} lainnya`}
          changeType="neutral"
          icon={Users}
          className="group hover:shadow-elevated transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-8 md:grid-cols-7">
        <div className="col-span-4">
          <Suspense fallback={<ChartLoading />}>
            <OverviewChart 
              data={chartData}
              title="Revenue Trends"
              description="Daily revenue, transactions, and profit overview"
            />
          </Suspense>
        </div>
        
        <div className="col-span-3">
          <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 shadow-elevated">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                Metode Pembayaran
              </CardTitle>
              <CardDescription className="text-muted-foreground">Statistik metode pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[hsl(var(--chart-1))] rounded-full"></div>
                    <span className="font-medium text-foreground">QRIS</span>
                  </div>
                  <Badge variant="secondary" className="font-semibold px-3 py-1">{overview?.metodeBayar?.qris || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[hsl(var(--chart-1))] rounded-full"></div>
                    <span className="font-medium text-foreground">Saldo</span>
                  </div>
                  <Badge variant="secondary" className="font-semibold px-3 py-1">{overview?.metodeBayar?.saldo || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[hsl(var(--muted-foreground))] rounded-full"></div>
                    <span className="font-medium text-foreground">Lainnya</span>
                  </div>
                  <Badge variant="secondary" className="font-semibold px-3 py-1">{overview?.metodeBayar?.unknown || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 shadow-elevated">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
          <CardDescription className="text-muted-foreground">Latest transactions from your WhatsApp bot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions?.transactions.map((transaction) => (
              <div key={getTransactionReferenceId(transaction)} className="group flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-elevated transition-all duration-300">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getTransactionUserName(transaction)} • {getTransactionPaymentMethod(transaction)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">{formatCurrency(transaction.totalBayar)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date, 'short')} • {formatTime(transaction.date)}</p>
                </div>
              </div>
            ))}
            {(!recentTransactions?.transactions || recentTransactions.transactions.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No recent transactions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}