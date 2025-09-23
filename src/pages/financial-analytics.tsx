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
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import { dashboardApi } from '@/services/api';
import { FinancialAnalytics } from '@/types/dashboard';
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
import { PageContainer } from '@/components/ui/page-container';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading financial analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !financial) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load financial analytics</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
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
    color: role === 'gold' ? '#FFD700' : role === 'silver' ? '#C0C0C0' : '#CD7F32'
  }));

  // Health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <PageContainer title="Financial Analytics" description="Comprehensive financial analysis and business health insights">

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(financial.overview.totalRevenue)}
          icon={DollarSign}
          trend={{ value: financial.overview.revenueGrowthRate, isPositive: financial.overview.revenueGrowthRate > 0 }}
        />
        <StatsCard
          title="Total Profit"
          value={formatCurrency(financial.overview.totalProfit)}
          icon={TrendingUp}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatsCard
          title="Profit Margin"
          value={formatPercentage(financial.overview.profitMargin)}
          icon={Target}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatsCard
          title="Avg Order Value"
          value={formatCurrency(financial.overview.avgOrderValue)}
          icon={CreditCard}
          trend={{ value: 5.3, isPositive: true }}
        />
        <StatsCard
          title="Total Transactions"
          value={formatNumber(financial.overview.totalTransactions)}
          icon={BarChart3}
          trend={{ value: 12.8, isPositive: true }}
        />
        <StatsCard
          title="Revenue Growth"
          value={formatPercentage(financial.overview.revenueGrowthRate)}
          icon={TrendingUp}
          trend={{ value: financial.overview.revenueGrowthRate, isPositive: financial.overview.revenueGrowthRate > 0 }}
        />
      </div>

      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Health Score
          </CardTitle>
          <CardDescription>
            Overall business financial performance indicator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-6xl font-bold ${getHealthScoreColor(financial.insights.healthScore)}`}>
                {financial.insights.healthScore.toFixed(1)}
              </div>
              <div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthScoreBg(financial.insights.healthScore)} ${getHealthScoreColor(financial.insights.healthScore)}`}>
                  {financial.insights.healthScore >= 80 ? 'Excellent' : 
                   financial.insights.healthScore >= 60 ? 'Good' : 'Needs Attention'}
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Based on revenue, profit, and growth metrics
                </p>
              </div>
            </div>
            <div className="w-32">
              <Progress value={financial.insights.healthScore} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="distributions">Revenue Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends & Growth</TabsTrigger>
          <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  User Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total User Balance</span>
                  <span className="font-semibold">{formatCurrency(financial.userFinances.totalBalance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Balance</span>
                  <span className="font-semibold">{formatCurrency(financial.userFinances.avgBalance)}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Balance Distribution</span>
                  {Object.entries(financial.userFinances.balanceDistribution || {}).map(([range, count]) => {
                    const total = Object.values(financial.userFinances.balanceDistribution || {}).reduce((sum: number, val: any) => sum + val, 0);
                    const percentage = total > 0 ? (count as number / total * 100) : 0;
                    
                    return (
                      <div key={range} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{range}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatNumber(count as number)}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatPercentage(percentage)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue by User Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={userRoleRevenueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distributions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
                <CardDescription>Revenue breakdown by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#8884d8" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Distribution by Role</CardTitle>
                <CardDescription>Profit contribution from different user tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(financial.distributions.profitByRole || {}).map(([role, profit]) => {
                    const totalProfit = Object.values(financial.distributions.profitByRole || {}).reduce((sum: number, val: any) => sum + val, 0);
                    const percentage = totalProfit > 0 ? (profit as number / totalProfit * 100) : 0;
                    
                    return (
                      <div key={role} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{role}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatCurrency(profit as number)}</span>
                            <Badge variant="secondary" className="text-xs">
                              {formatPercentage(percentage)}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue & Profit Trends
              </CardTitle>
              <CardDescription>
                Daily revenue and profit performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={financial.trends.daily}>
                  <defs>
                    <linearGradient id="finRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="finProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === 'revenue' ? 'Revenue' : 'Profit'
                    ]}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} fill="url(#finRevenue)" />
                  <Area type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} fill="url(#finProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>
                Monthly revenue and growth trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {Object.entries(financial.trends.monthly || {}).map(([metric, value]) => (
                  <div key={metric} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {typeof value === 'number' ? 
                        (metric.includes('revenue') || metric.includes('profit') ? 
                          formatCurrency(value) : 
                          formatNumber(value)
                        ) : 
                        String(value)
                      }
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-blue-800">Revenue Growth</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Revenue is growing at {formatPercentage(financial.overview.revenueGrowthRate)} rate
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800">Profit Margin</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Maintaining healthy profit margin of {formatPercentage(financial.overview.profitMargin)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-800">Order Value</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Average order value is {formatCurrency(financial.overview.avgOrderValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financial.insights.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
} 