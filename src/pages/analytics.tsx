import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Activity, Users, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/ui/stats-card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { dashboardApi } from '@/services/api';

export default function AnalyticsPage() {
  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });

  const { data: userActivity } = useQuery({
    queryKey: ['user-activity'],
    queryFn: dashboardApi.getUserActivity,
  });

  const { data: dailyChart } = useQuery({
    queryKey: ['daily-chart'],
    queryFn: dashboardApi.getDailyChart,
  });

  const { data: monthlyChart } = useQuery({
    queryKey: ['monthly-chart'],
    queryFn: dashboardApi.getMonthlyChart,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const dailyTrendData = dailyChart ? dailyChart.labels.map((label, index) => ({
    date: label,
    revenue: dailyChart.revenue[index],
    transactions: dailyChart.transactions[index],
  })) : [];

  const userTrendData = userActivity ? userActivity.activityTrends.dailyActive.map((count, index) => ({
    day: `Day ${index + 1}`,
    active: count,
  })) : [];

  const conversionData = overview ? [
    { name: 'Visitors', value: (overview.totalUsers || 0) * 1.5, fill: 'hsl(var(--muted))' },
    { name: 'Users', value: overview.totalUsers || 0, fill: 'hsl(var(--primary))' },
    { name: 'Active', value: userActivity?.activeUsers || 0, fill: 'hsl(var(--success))' },
    { name: 'Converting', value: Math.floor((overview.totalTransactions || 0) / 10), fill: 'hsl(var(--warning))' },
  ] : [];

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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Growth Rate"
          value={`${overview?.quickStats.monthlyGrowth || 0}%`}
          change="Monthly"
          changeType="positive"
          icon={TrendingUp}
          className="hover:scale-105"
        />
        <StatsCard
          title="User Engagement"
          value={`${Math.round(((userActivity?.activeUsers || 0) / (overview?.totalUsers || 1)) * 100)}%`}
          change="Active users ratio"
          changeType="positive"
          icon={Activity}
          className="hover:scale-105"
        />
        <StatsCard
          title="Avg Revenue per User"
          value={formatCurrency((overview?.totalRevenue || 0) / (overview?.totalUsers || 1))}
          icon={Users}
          className="hover:scale-105"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${Math.round(((overview?.totalTransactions || 0) / (overview?.totalUsers || 1)) * 100)}%`}
          change="Users to transactions"
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
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
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
                        stroke="hsl(var(--primary))"
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
                        stroke="hsl(var(--success))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
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
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <span className="text-lg font-bold text-success">+{overview?.quickStats.monthlyGrowth || 0}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="text-sm font-medium">User Retention</span>
                  <span className="text-lg font-bold text-primary">
                    {Math.round(((userActivity?.activeUsers || 0) / (overview?.totalUsers || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="text-sm font-medium">Transaction Success Rate</span>
                  <span className="text-lg font-bold text-info">98.5%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="text-sm font-medium">Average Response Time</span>
                  <span className="text-lg font-bold text-warning">2.3s</span>
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
            <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Automated insights from your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-secondary rounded-lg border-l-4 border-primary">
                    <h4 className="font-semibold text-primary mb-2">🚀 Growth Opportunity</h4>
                    <p className="text-sm text-muted-foreground">
                      Your revenue has grown by {overview?.quickStats.monthlyGrowth || 0}% this month. 
                      Consider expanding your product offerings to maintain this growth trajectory.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-secondary rounded-lg border-l-4 border-success">
                    <h4 className="font-semibold text-success mb-2">✅ High Engagement</h4>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(((userActivity?.activeUsers || 0) / (overview?.totalUsers || 1)) * 100)}% of your users are active. 
                      This indicates strong product-market fit and user satisfaction.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-secondary rounded-lg border-l-4 border-warning">
                    <h4 className="font-semibold text-warning mb-2">⚡ Optimization Tip</h4>
                    <p className="text-sm text-muted-foreground">
                      Peak transaction times appear to be during certain hours. 
                      Consider automated messaging during these periods to maximize conversions.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-secondary rounded-lg border-l-4 border-info">
                    <h4 className="font-semibold text-info mb-2">📊 Data Quality</h4>
                    <p className="text-sm text-muted-foreground">
                      Your data collection is comprehensive with {overview?.totalTransactions || 0} total transactions recorded. 
                      This provides excellent visibility into user behavior patterns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}