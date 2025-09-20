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
import { useMemo, useState, useEffect } from 'react';

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

  // Auto-refresh scheduler at 06:00 and 18:00 WIB (UTC+7)
  const [nextAIRunAt, setNextAIRunAt] = useState<Date | null>(null);
  useEffect(() => {
    const computeNextRun = (): Date => {
      const now = new Date();
      // Convert to Asia/Jakarta by using timeZone in toLocaleString then reparse
      const nowJakarta = new Date(new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(now).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$1-$2T$4:$5:$6'));

      const targets = [6, 18];
      const candidates: Date[] = [];
      for (const hour of targets) {
        const d = new Date(nowJakarta);
        d.setHours(hour, 0, 0, 0);
        if (d <= nowJakarta) {
          d.setDate(d.getDate() + 1);
        }
        candidates.push(d);
      }
      // Pick earliest upcoming in Jakarta time
      const nextJakarta = candidates.sort((a, b) => a.getTime() - b.getTime())[0];
      // Create equivalent real world Date by interpreting nextJakarta as Asia/Jakarta time
      // We can get offset by comparing locale and UTC; simpler: compute milliseconds until next by difference in Jakarta domain, then add to now
      const msUntil = nextJakarta.getTime() - nowJakarta.getTime();
      return new Date(now.getTime() + msUntil);
    };

    const schedule = () => {
      const next = computeNextRun();
      setNextAIRunAt(next);
      const timeout = setTimeout(() => {
        handleRefreshInsights();
      }, Math.max(1000, next.getTime() - Date.now()));
      return timeout;
    };

    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  const formatNextRunLabel = (date: Date | null) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(date);
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

  // Funnel data (transactions only to ensure apples-to-apples conversion)
  const conversionData = overview ? [
    { name: 'Total Transaksi', value: overview.totalTransaksi || 0, fill: 'hsl(var(--chart-2))' },
    { name: 'Transaksi Hari Ini', value: overview.transaksiHariIni || 0, fill: 'hsl(var(--chart-4))' },
  ] : [];

  // Revenue overview (separate from conversion funnel)
  const revenueTotal = overview?.totalPendapatan || 0;
  const revenueToday = overview?.pendapatanHariIni || 0;
  const revenueShare = revenueTotal > 0 ? (revenueToday / revenueTotal) * 100 : 0;

  // UI state: date range for charts
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const filteredDaily = useMemo(() => {
    if (!dailyTrendData?.length) return [];
    if (range === 'all') return dailyTrendData;
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return dailyTrendData.slice(-days);
  }, [dailyTrendData, range]);

  // Correlation revenue vs transactions (Pearson)
  const revenueTransactionCorrelation = useMemo(() => {
    if (!filteredDaily.length) return 0;
    const n = filteredDaily.length;
    const sumX = filteredDaily.reduce((s, d) => s + d.revenue, 0);
    const sumY = filteredDaily.reduce((s, d) => s + d.transactions, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;
    const num = filteredDaily.reduce((acc, d) => acc + (d.revenue - meanX) * (d.transactions - meanY), 0);
    const denX = Math.sqrt(filteredDaily.reduce((acc, d) => acc + Math.pow(d.revenue - meanX, 2), 0));
    const denY = Math.sqrt(filteredDaily.reduce((acc, d) => acc + Math.pow(d.transactions - meanY, 2), 0));
    const den = denX * denY || 1;
    return num / den;
  }, [filteredDaily]);

  // Anomalies using z-score on revenue
  const anomalies = useMemo(() => {
    if (!filteredDaily.length) return [] as { date: string; revenue: number; z: number }[];
    const values = filteredDaily.map((d) => d.revenue);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const std = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length) || 1;
    return filteredDaily
      .map((d) => ({ ...d, z: (d.revenue - mean) / std }))
      .filter((d) => Math.abs(d.z) >= 2)
      .map((d) => ({ date: d.date, revenue: d.revenue, z: Number(d.z.toFixed(2)) }));
  }, [filteredDaily]);

  // Funnel helpers: normalize width by max, and flag non-monotonic steps
  const funnelMax = useMemo(() => Math.max(1, ...conversionData.map((s) => s.value)), [conversionData]);
  const funnelAnomaly = useMemo(() => conversionData.some((s, i) => i > 0 && s.value > conversionData[i - 1].value), [conversionData]);

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
    <div className="flex-1 p-6 md:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
              Advanced Analytics
            </h2>
            <p className="text-muted-foreground">
              Deep insights into your WhatsApp bot performance and user behavior
            </p>
          </div>
        </div>

        {/* AI Status */}
        <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-2">
          <AIStatus 
            hasAPIKey={!!import.meta.env.VITE_OPENAI_API_KEY}
            isConnected={hasAIInsights}
            isLoading={aiLoading}
            onConfigure={() => {
              alert('Please add VITE_OPENAI_API_KEY to your .env file');
            }}
          />
          <p className="text-xs text-muted-foreground px-1">AI-Powered Insights auto-refresh: 06:00 & 18:00 WIB • Next run: {formatNextRunLabel(nextAIRunAt)}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Transaksi Hari Ini"
            value={overview?.transaksiHariIni || 0}
            change="Hari ini"
            changeType="positive"
            icon={TrendingUp}
            className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
          />
          <StatsCard
            title="Pendapatan Hari Ini"
            value={formatCurrency(overview?.pendapatanHariIni || 0)}
            change="Hari ini"
            changeType="positive"
            icon={Activity}
            className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
          />
          <StatsCard
            title="Total Transaksi"
            value={overview?.totalTransaksi || 0}
            icon={Users}
            className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
          />
          <StatsCard
            title="Total Pendapatan"
            value={formatCurrency(overview?.totalPendapatan || 0)}
            change="Total"
            changeType="positive"
            icon={Target}
            className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
          />
        </div>

        {/* Range Selector + Trends */}
        <Card className="border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Trends</CardTitle>
                <CardDescription>Revenue and user activity over time</CardDescription>
              </div>
              <Tabs value={range} onValueChange={(v) => setRange(v as any)}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="7d">7d</TabsTrigger>
                  <TabsTrigger value="30d">30d</TabsTrigger>
                  <TabsTrigger value="90d">90d</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Revenue Trend Analysis</CardTitle>
                  <CardDescription>Daily revenue patterns with trend line</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredDaily}>
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

              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>User Activity Trends</CardTitle>
                  <CardDescription>Daily active user patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userTrendData.slice(-filteredDaily.length || undefined)}>
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
          </CardContent>
        </Card>

        {/* Performance & Funnel */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
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

              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle>User Journey Funnel</CardTitle>
                      <CardDescription>Conversion funnel analysis</CardDescription>
                    </div>
                    {funnelAnomaly && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300">Anomali terdeteksi</span>
                    )}
                  </div>
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
                              width: `${(step.value / funnelMax) * 100}%`,
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

            {/* Revenue overview (not a conversion funnel) */}
            <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Perbandingan total vs hari ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Total Pendapatan</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(revenueTotal)}</span>
                    </div>
                    <div className="w-full bg-accent/30 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-300" style={{ width: '100%', backgroundColor: 'hsl(var(--chart-1))' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Pendapatan Hari Ini</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(revenueToday)}</span>
                    </div>
                    <div className="w-full bg-accent/30 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (revenueToday / (revenueTotal || 1)) * 100)}%`, backgroundColor: 'hsl(var(--chart-3))' }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{revenueShare.toFixed(1)}% of total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

          <TabsContent value="diagnostics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Correlation</CardTitle>
                  <CardDescription>Revenue vs Transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueTransactionCorrelation.toFixed(2)}
                    <span className="ml-2 text-sm text-muted-foreground">(Pearson r)</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {revenueTransactionCorrelation > 0.6 ? 'Korelasi kuat positif' : revenueTransactionCorrelation > 0.3 ? 'Korelasi sedang' : 'Korelasi lemah'}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Anomalies</CardTitle>
                  <CardDescription>Deteksi outlier berbasis z-score (|z| ≥ 2)</CardDescription>
                </CardHeader>
                <CardContent>
                  {anomalies.length > 0 ? (
                    <div className="space-y-2">
                      {anomalies.map((a) => (
                        <div key={a.date} className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-white/30 dark:border-slate-700/20">
                          <span className="text-sm font-medium">{a.date}</span>
                          <span className="text-sm">{formatCurrency(a.revenue)} <span className="text-muted-foreground">(z={a.z})</span></span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada anomali pada rentang waktu ini.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}