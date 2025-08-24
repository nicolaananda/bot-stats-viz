import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Activity, Users, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/ui/stats-card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { dashboardApi } from '@/services/api';
import { useAIInsightsWithFallback } from '@/hooks/useAIInsights';
import { AIInsightsCard } from '@/components/ui/ai-insights-card';
import { AIStatus } from '@/components/ui/ai-status';
import { DebugPanel } from '@/components/ui/debug-panel';
import { UserActivityDebug } from '@/components/ui/user-activity-debug';
import { DataComparison } from '@/components/ui/data-comparison';
import { UserIdDebug } from '@/components/ui/user-id-debug';

export default function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: userActivity, isLoading: userActivityLoading, error: userActivityError } = useQuery({
    queryKey: ['user-activity'],
    queryFn: dashboardApi.getEnhancedUserActivity,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: userStats, isLoading: userStatsLoading, error: userStatsError } = useQuery({
    queryKey: ['user-stats'],
    queryFn: dashboardApi.getUserStats,
    retry: 1,
    retryDelay: 1000,
  });

  // Get recent transactions for data comparison
  const { data: recentTransactions, isLoading: recentTransactionsLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(100),
    retry: 1,
    retryDelay: 1000,
  });

  // Get all users for ID format comparison
  const { data: allUsersData, isLoading: allUsersLoading } = useQuery({
    queryKey: ['all-users-debug'],
    queryFn: () => dashboardApi.getAllUsers(1, 100),
    retry: 1,
    retryDelay: 1000,
  });

  // AI Insights
  const { insights, isLoading: aiLoading, hasAIInsights, lastUpdated, cacheStatus } = useAIInsightsWithFallback({
    transaksiHariIni: overview?.transaksiHariIni || 0,
    pendapatanHariIni: overview?.pendapatanHariIni || 0,
    totalTransaksi: overview?.totalTransaksi || 0,
    totalPendapatan: overview?.totalPendapatan || 0,
    userActivity: userActivity?.activityTrends?.dailyActive,
    dailyRevenue: overview?.chartData?.daily,
  });

  // Ensure insights is always an object, not a Promise
  const safeInsights = insights || {
    insights: [],
    summary: 'Loading insights...',
    nextActions: []
  };

  // Manual refresh function for AI insights
  const handleRefreshInsights = () => {
    // This will trigger a refetch of the AI insights
    window.location.reload(); // Simple approach - in production you might want to use queryClient.invalidateQueries
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const dailyTrendData = overview?.chartData?.daily ? overview.chartData.daily.map((item) => ({
    date: item.date,
    revenue: item.pendapatan,
    transactions: item.transaksi,
  })) : [];

  const userTrendData = userActivity?.activityTrends?.dailyActive ? userActivity.activityTrends.dailyActive.map((count, index) => ({
    day: `Day ${index + 1}`,
    active: count,
  })) : [];

  const conversionData = overview ? [
    { name: 'Total Transaksi', value: overview.totalTransaksi || 0, fill: 'hsl(var(--chart-2))' },
    { name: 'Transaksi Hari Ini', value: overview.transaksiHariIni || 0, fill: 'hsl(var(--chart-4))' },
    { name: 'Total Pendapatan', value: Math.floor((overview.totalPendapatan || 0) / 1000), fill: 'hsl(var(--chart-1))' },
    { name: 'Pendapatan Hari Ini', value: Math.floor((overview.pendapatanHariIni || 0) / 1000), fill: 'hsl(var(--chart-3))' },
  ] : [];

  const isLoading = overviewLoading || userActivityLoading || userStatsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (overviewError || userActivityError || userStatsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load analytics data</p>
          <p className="text-sm text-muted-foreground">
            {overviewError?.message || userActivityError?.message || userStatsError?.message || 'Please check your API connection'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">
            Deep insights into your WhatsApp bot performance and user behavior
          </p>
        </div>
      </div>

      {/* AI Status */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <AIStatus 
          hasAPIKey={!!import.meta.env.VITE_OPENAI_API_KEY}
          isConnected={hasAIInsights}
          isLoading={aiLoading}
          onConfigure={() => {
            alert('Please add VITE_OPENAI_API_KEY to your .env file');
          }}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Transaksi Hari Ini"
          value={overview?.transaksiHariIni || 0}
          change="Hari ini"
          changeType="positive"
          icon={TrendingUp}
          className="hover:scale-105"
        />
        <StatsCard
          title="Pendapatan Hari Ini"
          value={formatCurrency(overview?.pendapatanHariIni || 0)}
          change="Hari ini"
          changeType="positive"
          icon={Activity}
          className="hover:scale-105"
        />
        <StatsCard
          title="Total Transaksi"
          value={overview?.totalTransaksi || 0}
          icon={Users}
          className="hover:scale-105"
        />
        <StatsCard
          title="Total Pendapatan"
          value={formatCurrency(overview?.totalPendapatan || 0)}
          change="Total"
          changeType="positive"
          icon={Target}
          className="hover:scale-105"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Revenue Trend Analysis</CardTitle>
                <CardDescription>Daily revenue patterns with trend line</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrendData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={formatCurrency} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>User Activity Trends</CardTitle>
                <CardDescription>Daily active user patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString(), 'Active Users']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="active" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="text-sm font-medium">Transaksi Hari Ini</span>
                  <span className="text-lg font-bold text-success">{overview?.transaksiHariIni || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="text-sm font-medium">Pendapatan Hari Ini</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(overview?.pendapatanHariIni || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="text-sm font-medium">Transaction Success Rate</span>
                  <span className="text-lg font-bold text-info">98.5%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="text-sm font-medium">Average Response Time</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">2.3s</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>User Journey Funnel</CardTitle>
                <CardDescription>Conversion funnel analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conversionData.map((step, index) => (
                    <div key={step.name} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{step.name}</span>
                        <span className="text-sm text-muted-foreground">{step.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-accent/30 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(step.value / (conversionData[0]?.value || 1)) * 100}%`,
                            backgroundColor: step.fill
                          }}
                        />
                      </div>
                      {index > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {((step.value / (conversionData[index - 1]?.value || 1)) * 100).toFixed(1)}% conversion
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <AIInsightsCard 
              insights={safeInsights}
              isLoading={aiLoading}
              hasAIInsights={hasAIInsights}
              lastUpdated={lastUpdated}
              cacheStatus={cacheStatus}
              onRefresh={handleRefreshInsights}
            />
          </div>
        </TabsContent>
      </Tabs>

    
    </div>
  );
}