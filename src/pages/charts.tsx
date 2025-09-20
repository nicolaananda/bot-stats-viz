import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '@/services/api';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function Charts() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });

  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: dashboardApi.getUserStats,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const dailyData = overview?.chartData?.daily ? overview.chartData.daily.map((item) => ({
    date: item.date,
    revenue: item.pendapatan,
    transactions: item.transaksi,
    profit: item.pendapatan * 0.1, // Assuming 10% profit
  })) : [];

  const monthlyData = overview?.chartData?.monthly ? overview.chartData.monthly.map((item) => ({
    month: item.month,
    revenue: item.pendapatan,
    transactions: item.transaksi,
    profit: item.pendapatan * 0.1, // Assuming 10% profit
    userGrowth: 0, // Not available in current API
  })) : [];

  const userRoleData = userStats ? Object.entries(userStats.userStats || {}).map(([role, stats]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: stats.count,
    saldo: stats.totalSaldo,
  })) : [];

  const isLoading = overviewLoading || userStatsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading charts...</p>
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
              Analytics Charts
            </h2>
            <p className="text-muted-foreground">
              Detailed analytics and performance metrics
            </p>
          </div>
        </div>

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              User Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Daily Revenue</CardTitle>
                  <CardDescription>Revenue trends over the past days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData}>
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
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--chart-1))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Daily Transactions</CardTitle>
                  <CardDescription>Number of transactions per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar 
                          dataKey="transactions" 
                          fill="hsl(var(--chart-2))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
              <CardHeader>
                <CardTitle>Daily Profit Trends</CardTitle>
                <CardDescription>Profit analysis over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={formatCurrency} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Profit']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Monthly revenue comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={formatCurrency} />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar 
                          dataKey="revenue" 
                          fill="hsl(var(--chart-1))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user growth trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          formatter={(value: number) => [value.toLocaleString(), 'Users']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="userGrowth" 
                          stroke="hsl(var(--chart-4))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--chart-4))', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>User Distribution by Role</CardTitle>
                  <CardDescription>Breakdown of users by their roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userRoleData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userRoleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [value.toLocaleString(), 'Users']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle>Balance by Role</CardTitle>
                  <CardDescription>Total balance distribution by user roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userRoleData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={formatCurrency} />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Total Balance']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar 
                          dataKey="saldo" 
                          fill="hsl(var(--chart-2))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}