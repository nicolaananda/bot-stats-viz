import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, CreditCard, DollarSign, Activity } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { OverviewChart } from '@/components/charts/overview-chart';
import { EnvironmentBanner } from '@/components/ui/environment-banner';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const chartData = dailyChart ? dailyChart.labels.map((label, index) => ({
    date: label,
    revenue: dailyChart.revenue[index],
    transactions: dailyChart.transactions[index],
    profit: dailyChart.profit[index],
  })) : [];

  return (
    <div className="flex-1 space-y-6 p-6">
      <EnvironmentBanner />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            Your WhatsApp bot performance analytics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(overview?.totalRevenue || 0)}
          change={`+${overview?.quickStats.monthlyGrowth || 0}% from last month`}
          changeType="positive"
          icon={DollarSign}
          className="hover:scale-105"
        />
        <StatsCard
          title="Total Users"
          value={overview?.totalUsers || 0}
          change={`+${overview?.quickStats.userGrowth || 0}% growth`}
          changeType="positive"
          icon={Users}
          className="hover:scale-105"
        />
        <StatsCard
          title="Total Transactions"
          value={overview?.totalTransactions || 0}
          change={`${overview?.quickStats.todayTransactions || 0} today`}
          changeType="neutral"
          icon={CreditCard}
          className="hover:scale-105"
        />
        <StatsCard
          title="Total Profit"
          value={formatCurrency(overview?.totalProfit || 0)}
          change={formatCurrency(overview?.quickStats.todayRevenue || 0) + " today"}
          changeType="positive"
          icon={TrendingUp}
          className="hover:scale-105"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="col-span-4">
          <OverviewChart 
            data={chartData}
            title="Revenue Trends"
            description="Daily revenue, transactions, and profit overview"
          />
        </div>
        
        <div className="col-span-3">
          <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest transactions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overview?.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
                {(!overview?.recentActivity || overview.recentActivity.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest transactions from your WhatsApp bot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions?.transactions.map((transaction) => (
              <div key={transaction.reffId} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.user} • {transaction.metodeBayar}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(transaction.totalBayar)}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
            ))}
            {(!recentTransactions?.transactions || recentTransactions.transactions.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent transactions
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}