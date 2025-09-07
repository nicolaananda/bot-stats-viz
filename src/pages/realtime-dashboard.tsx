import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Users, 
  DollarSign, 
  ShoppingCart,
  TrendingUp,
  Clock,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/stats-card';
import { dashboardApi } from '@/services/api';
import { RealtimeDashboard } from '@/types/dashboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function RealtimeDashboardPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { data: realtime, isLoading, error, refetch } = useQuery({
    queryKey: ['realtime-dashboard'],
    queryFn: dashboardApi.getRealtimeDashboard,
    retry: 1,
    retryDelay: 1000,
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if auto-refresh is on
    onSuccess: () => setLastUpdated(new Date()),
  });

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

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading real-time data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !realtime) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load real-time data</p>
            <p className="text-muted-foreground text-sm mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Auto-refresh */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-green-500" />
            Real-time Dashboard
          </h1>
          <p className="text-muted-foreground">
            Live business metrics and activity monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {formatTime(lastUpdated)}
          </div>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Transactions"
          value={formatNumber(realtime.today.transactions)}
          icon={ShoppingCart}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(realtime.today.revenue)}
          icon={DollarSign}
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatsCard
          title="Avg Order Value"
          value={formatCurrency(realtime.today.avgOrderValue)}
          icon={TrendingUp}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatsCard
          title="Active Users"
          value={formatNumber(realtime.realtime.activeUsers)}
          icon={Users}
          trend={{ value: 15.1, isPositive: true }}
        />
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Users</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">{formatNumber(realtime.realtime.activeUsers)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Users</span>
              <span className="font-semibold">{formatNumber(realtime.realtime.totalUsers)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Conversion Rate</span>
              <Badge variant="secondary">
                {realtime.realtime.conversionRate.toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>24H Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transactions</span>
              <span className="font-semibold">{formatNumber(realtime.last24h.transactions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-semibold">{formatCurrency(realtime.last24h.revenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">vs Today</span>
              <Badge variant={realtime.today.revenue > (realtime.last24h.revenue / 24) ? "default" : "secondary"}>
                {realtime.today.revenue > (realtime.last24h.revenue / 24) ? "↑ Above avg" : "↓ Below avg"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realtime.today.topProducts.slice(0, 3).map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium truncate">
                      {product.name?.length > 20 ? product.name.substring(0, 20) + '...' : product.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatNumber(product.sold || 0)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hourly Activity Pattern
          </CardTitle>
          <CardDescription>
            User activity and transactions throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={realtime.realtime.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => `${value}:00`}
                formatter={(value, name) => [
                  formatNumber(Number(value)),
                  name === 'activity' ? 'Activity' : 'Transactions'
                ]}
              />
              <Area
                type="monotone"
                dataKey="activity"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest transaction activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realtime.recent.transactions.slice(0, 5).map((transaction: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.name?.length > 30 ? 
                          transaction.name.substring(0, 30) + '...' : 
                          transaction.name
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.user_name} • {getTimeAgo(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(transaction.totalBayar)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.metodeBayar}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realtime.alerts.length > 0 ? (
                realtime.alerts.slice(0, 5).map((alert: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === 'error' ? 'bg-red-500' :
                      alert.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                  <p className="text-xs text-muted-foreground">No alerts at this time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Timestamp */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Data as of {new Date(realtime.timestamp).toLocaleString('id-ID')}</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
            <span>Live</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 