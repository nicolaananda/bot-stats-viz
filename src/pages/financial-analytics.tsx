import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Target,
  CreditCard,
  Wallet,
  BarChart3,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { dashboardApi } from '@/services/api';
import { FinancialAnalytics } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function FinancialAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: financial, isLoading, error } = useQuery({
    queryKey: ['financial-analytics', timeframe],
    queryFn: dashboardApi.getFinancialAnalytics,
    retry: 1,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading financial analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !financial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-destructive/5 rounded-2xl border border-destructive/20">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-bold text-destructive mb-2">Failed to load financial analytics</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Prepare chart data
  const paymentMethodData = Object.entries(financial.distributions.byPaymentMethod || {}).map(([method, value]) => ({
    name: method,
    value: value as number
  }));

  const userRoleRevenueData = Object.entries(financial.distributions.byUserRole || {}).map(([role, value]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: value as number,
    color: role === 'gold' ? '#eab308' : role === 'silver' ? '#94a3b8' : '#d97706'
  }));

  // Health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-500';
    if (score >= 60) return 'bg-amber-500/10 text-amber-500';
    return 'bg-rose-500/10 text-rose-500';
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive financial analysis and business health insights</p>
        </div>
        <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm p-1 rounded-lg border border-border/50">
          <Button
            variant={timeframe === '7d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeframe('7d')}
            className="rounded-md"
          >
            7 Days
          </Button>
          <Button
            variant={timeframe === '30d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeframe('30d')}
            className="rounded-md"
          >
            30 Days
          </Button>
          <Button
            variant={timeframe === '90d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeframe('90d')}
            className="rounded-md"
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-xl font-bold mt-2 text-foreground">{formatCurrency(financial.overview.totalRevenue)}</h3>
                <div className={cn("flex items-center mt-1 text-xs font-medium",
                  financial.overview.revenueGrowthRate > 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {financial.overview.revenueGrowthRate > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {Math.abs(financial.overview.revenueGrowthRate)}%
                </div>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                <h3 className="text-xl font-bold mt-2 text-foreground">{formatCurrency(financial.overview.totalProfit)}</h3>
                <div className="flex items-center mt-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  8.5%
                </div>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <h3 className="text-xl font-bold mt-2 text-foreground">{formatPercentage(financial.overview.profitMargin)}</h3>
                <div className="flex items-center mt-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  2.1%
                </div>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <h3 className="text-xl font-bold mt-2 text-foreground">{formatCurrency(financial.overview.avgOrderValue)}</h3>
                <div className="flex items-center mt-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  5.3%
                </div>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <h3 className="text-xl font-bold mt-2 text-foreground">{formatNumber(financial.overview.totalTransactions)}</h3>
                <div className="flex items-center mt-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  12.8%
                </div>
              </div>
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-pink-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Growth</p>
                <h3 className="text-xl font-bold mt-2 text-foreground">{formatPercentage(financial.overview.revenueGrowthRate)}</h3>
                <div className={cn("flex items-center mt-1 text-xs font-medium",
                  financial.overview.revenueGrowthRate > 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {financial.overview.revenueGrowthRate > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {Math.abs(financial.overview.revenueGrowthRate)}%
                </div>
              </div>
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Score */}
      <Card className="card-premium border-none shadow-soft overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Financial Health Score
          </CardTitle>
          <CardDescription>
            Overall business financial performance indicator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={cn("text-6xl font-bold tracking-tighter", getHealthScoreColor(financial.insights.healthScore))}>
                {financial.insights.healthScore.toFixed(1)}
              </div>
              <div>
                <div className={cn("px-3 py-1 rounded-full text-sm font-medium w-fit mb-2", getHealthScoreBg(financial.insights.healthScore))}>
                  {financial.insights.healthScore >= 80 ? 'Excellent' :
                    financial.insights.healthScore >= 60 ? 'Good' : 'Needs Attention'}
                </div>
                <p className="text-muted-foreground text-sm max-w-[250px]">
                  Based on revenue consistency, profit margins, and growth metrics over the selected period.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Score Progress</span>
                <span className="font-medium text-foreground">{financial.insights.healthScore.toFixed(0)}/100</span>
              </div>
              <Progress value={financial.insights.healthScore} className="h-3 bg-secondary" />
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Critical (0-59)</span>
                <span>Good (60-79)</span>
                <span>Excellent (80-100)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background/50 backdrop-blur-sm p-1 border border-border/50 rounded-xl w-full md:w-auto flex overflow-x-auto">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Financial Overview</TabsTrigger>
          <TabsTrigger value="distributions" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Revenue Distribution</TabsTrigger>
          <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Trends & Growth</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Insights & Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  User Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Total User Balance</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(financial.userFinances.totalBalance)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Average Balance</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(financial.userFinances.avgBalance)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-sm font-medium text-foreground">Balance Distribution</span>
                  <div className="space-y-3">
                    {Object.entries(financial.userFinances.balanceDistribution || {}).map(([range, count]) => {
                      const total = Object.values(financial.userFinances.balanceDistribution || {}).reduce((sum: number, val: any) => sum + (val as number), 0);
                      const percentage = total > 0 ? ((count as number) / total * 100) : 0;

                      return (
                        <div key={range} className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{range}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{formatNumber(count as number)}</span>
                              <span className="text-xs text-muted-foreground">({formatPercentage(percentage)})</span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Revenue by User Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={userRoleRevenueData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userRoleRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.75rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distributions" className="space-y-6 animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
                <CardDescription>Revenue breakdown by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentMethodData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        tickFormatter={(value) => formatCurrency(value)}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: any) => formatCurrency(Number(value))}
                        cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.75rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle>Profit Distribution by Role</CardTitle>
                <CardDescription>Profit contribution from different user tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(financial.distributions.profitByRole || {}).map(([role, profit]) => {
                    const totalProfit = Object.values(financial.distributions.profitByRole || {}).reduce((sum: number, val: any) => sum + (val as number), 0);
                    const percentage = totalProfit > 0 ? ((profit as number) / totalProfit * 100) : 0;

                    return (
                      <div key={role} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full",
                              role === 'gold' ? "bg-yellow-500" :
                                role === 'silver' ? "bg-slate-400" : "bg-orange-600"
                            )}></div>
                            <span className="font-medium capitalize text-foreground">{role}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{formatCurrency(profit as number)}</span>
                            <Badge variant="secondary" className="text-xs font-normal">
                              {formatPercentage(percentage)}
                            </Badge>
                          </div>
                        </div>
                        <Progress
                          value={percentage}
                          className="h-2.5"
                          indicatorClassName={
                            role === 'gold' ? "bg-yellow-500" :
                              role === 'silver' ? "bg-slate-400" : "bg-orange-600"
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
          <Card className="card-premium border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Revenue & Profit Trends
              </CardTitle>
              <CardDescription>
                Daily revenue and profit performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financial.trends.daily} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="finRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="finProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      tickFormatter={(value) => formatCurrency(value)}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#finRevenue)"
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#finProfit)"
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-none shadow-soft">
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>
                Monthly revenue and growth trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                {Object.entries(financial.trends.monthly || {}).map(([metric, value]) => (
                  <div key={metric} className="text-center p-6 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {typeof value === 'number' ?
                        (metric.includes('revenue') || metric.includes('profit') ?
                          formatCurrency(value) :
                          formatNumber(value)
                        ) :
                        String(value)
                      }
                    </div>
                    <div className="text-sm text-muted-foreground capitalize font-medium">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-blue-600 dark:text-blue-400">Revenue Growth</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Revenue is growing at <span className="font-semibold text-foreground">{formatPercentage(financial.overview.revenueGrowthRate)}</span> rate compared to the previous period.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Profit Margin</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Maintaining healthy profit margin of <span className="font-semibold text-foreground">{formatPercentage(financial.overview.profitMargin)}</span>.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-600 dark:text-purple-400">Order Value</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Average order value is <span className="font-semibold text-foreground">{formatCurrency(financial.overview.avgOrderValue)}</span> per transaction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium border-none shadow-soft">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actionable steps to improve financial health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financial.insights.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-4 border border-border/50 rounded-xl bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold mt-0.5 shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 