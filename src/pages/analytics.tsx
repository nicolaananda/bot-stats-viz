import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Activity, Users, Target, Zap, BarChart2, PieChart, AlertTriangle, Shield, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { dashboardApi } from '@/services/api';
import { useAIInsightsWithFallback } from '@/hooks/useAIInsights';
import { AIInsightsCard } from '@/components/ui/ai-insights-card';
import { AIStatus } from '@/components/ui/ai-status';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
    window.location.reload();
  };

  // Auto-refresh scheduler
  const [nextAIRunAt, setNextAIRunAt] = useState<Date | null>(null);
  useEffect(() => {
    const computeNextRun = (): Date => {
      const now = new Date();
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
      const nextJakarta = candidates.sort((a, b) => a.getTime() - b.getTime())[0];
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

  // Funnel data
  const conversionData = overview ? [
    { name: 'Total Transaksi', value: overview.totalTransaksi || 0, fill: 'hsl(var(--primary))' },
    { name: 'Transaksi Hari Ini', value: overview.transaksiHariIni || 0, fill: 'hsl(var(--primary)/0.6)' },
  ] : [];

  // Revenue overview
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

  const funnelMax = useMemo(() => Math.max(1, ...conversionData.map((s) => s.value)), [conversionData]);
  const funnelAnomaly = useMemo(() => conversionData.some((s, i) => i > 0 && s.value > conversionData[i - 1].value), [conversionData]);

  const isLoading = overviewLoading || userActivityLoading || userStatsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (overviewError || userActivityError || userStatsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-destructive/5 rounded-2xl border border-destructive/20">
          <h3 className="text-lg font-bold text-destructive mb-2">Failed to load analytics</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {overviewError?.message || userActivityError?.message || userStatsError?.message || 'Please check your API connection'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep insights into your WhatsApp bot performance and user behavior</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
            <Zap className="mr-1 h-3 w-3 text-yellow-500" />
            AI Powered
          </Badge>
          <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
            Next run: {formatNextRunLabel(nextAIRunAt)}
          </Badge>
        </div>
      </div>

      {/* AI Status */}
      <div className="grid gap-6 md:grid-cols-1">
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaksi Hari Ini</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{overview?.transaksiHariIni || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Hari ini</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendapatan Hari Ini</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(overview?.pendapatanHariIni || 0)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Hari ini</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Activity className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{overview?.totalTransaksi || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(overview?.totalPendapatan || 0)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Target className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-background/50 backdrop-blur-sm p-1 border border-border/50 rounded-xl">
            <TabsTrigger value="performance" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <BarChart2 className="mr-2 h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Zap className="mr-2 h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Activity className="mr-2 h-4 w-4" />
              Diagnostics
            </TabsTrigger>
          </TabsList>

          <Tabs value={range} onValueChange={(v) => setRange(v as any)} className="hidden md:block">
            <TabsList className="bg-background/50 backdrop-blur-sm p-1 border border-border/50 rounded-xl">
              <TabsTrigger value="7d" className="rounded-lg">7d</TabsTrigger>
              <TabsTrigger value="30d" className="rounded-lg">30d</TabsTrigger>
              <TabsTrigger value="90d" className="rounded-lg">90d</TabsTrigger>
              <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle>Revenue Trend Analysis</CardTitle>
                <CardDescription>Daily revenue patterns with trend line</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredDaily} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.75rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#revenueGradient)"
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle>User Activity Trends</CardTitle>
                <CardDescription>Daily active user patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userTrendData.slice(-filteredDaily.length || undefined)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [value.toLocaleString(), 'Active Users']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.75rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="active"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>User Journey Funnel</CardTitle>
                    <CardDescription>Conversion funnel analysis</CardDescription>
                  </div>
                  {funnelAnomaly && (
                    <Badge variant="destructive" className="animate-pulse">Anomaly Detected</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {conversionData.map((step, index) => (
                    <div key={step.name} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{step.name}</span>
                        <span className="text-sm font-bold text-foreground">{step.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${(step.value / funnelMax) * 100}%`,
                            backgroundColor: step.fill
                          }}
                        />
                      </div>
                      {index > 0 && (
                        <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                          <ArrowDownRight className="h-3 w-3" />
                          {((step.value / (conversionData[index - 1]?.value || 1)) * 100).toFixed(1)}% conversion rate
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Comparison: Total vs Today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Total Pendapatan</span>
                      <span className="text-sm font-bold text-foreground">{formatCurrency(revenueTotal)}</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Pendapatan Hari Ini</span>
                      <span className="text-sm font-bold text-foreground">{formatCurrency(revenueToday)}</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, (revenueToday / (revenueTotal || 1)) * 100)}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 font-medium">{revenueShare.toFixed(1)}% of total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AIInsightsCard
            insights={safeInsights}
            isLoading={aiLoading}
            hasAIInsights={hasAIInsights}
            lastUpdated={lastUpdated}
            cacheStatus={cacheStatus}
            onRefresh={handleRefreshInsights}
          />
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle>Correlation Analysis</CardTitle>
                <CardDescription>Revenue vs Transactions Relationship</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-4xl font-bold text-primary">
                      {revenueTransactionCorrelation.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Pearson Correlation Coefficient (r)</p>
                  </div>
                  <div className="flex-1">
                    <Badge variant={revenueTransactionCorrelation > 0.6 ? 'default' : revenueTransactionCorrelation > 0.3 ? 'secondary' : 'outline'} className="text-sm px-3 py-1">
                      {revenueTransactionCorrelation > 0.6 ? 'Strong Correlation' : revenueTransactionCorrelation > 0.3 ? 'Moderate Correlation' : 'Weak Correlation'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  A higher correlation indicates that transaction volume is a strong predictor of revenue.
                  {revenueTransactionCorrelation > 0.6 ? ' Currently, revenue closely follows transaction volume.' : ' Currently, there is some variance between transaction count and revenue.'}
                </p>
              </CardContent>
            </Card>

            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle>Anomaly Detection</CardTitle>
                <CardDescription>Outlier detection based on z-score (|z| ≥ 2)</CardDescription>
              </CardHeader>
              <CardContent>
                {anomalies.length > 0 ? (
                  <div className="space-y-3">
                    {anomalies.map((a) => (
                      <div key={a.date} className="flex items-center justify-between p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium text-foreground">{a.date}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{formatCurrency(a.revenue)}</p>
                          <p className="text-xs text-muted-foreground">z-score: {a.z}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                      <Shield className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-foreground font-medium">No Anomalies Detected</p>
                    <p className="text-sm text-muted-foreground mt-1">Revenue patterns are within expected ranges.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}