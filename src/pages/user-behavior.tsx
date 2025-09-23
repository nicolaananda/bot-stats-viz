import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  TrendingDown, 
  Clock, 
  CreditCard,
  UserCheck,
  UserX,
  Star,
  Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import { dashboardApi } from '@/services/api';
import { UserBehaviorAnalytics } from '@/types/dashboard';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts';
import { PageContainer } from '@/components/ui/page-container';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const SEGMENT_COLORS = {
  new: '#3B82F6',
  regular: '#10B981', 
  loyal: '#F59E0B',
  vip: '#8B5CF6'
};

export default function UserBehaviorPage() {
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'new' | 'regular' | 'loyal' | 'vip'>('all');

  const { data: behavior, isLoading, error } = useQuery({
    queryKey: ['user-behavior'],
    queryFn: () => dashboardApi.getUserBehaviorAnalytics(),
    retry: 1,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user behavior analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !behavior) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load user behavior analytics</p>
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

  // Prepare segment distribution data
  const segmentData = Object.entries(behavior.segmentStats).map(([segment, stats]) => ({
    name: segment.charAt(0).toUpperCase() + segment.slice(1),
    value: stats.count,
    percentage: stats.percentage,
    color: SEGMENT_COLORS[segment as keyof typeof SEGMENT_COLORS] || '#8884d8'
  }));

  // Calculate total users
  const totalUsers = Object.values(behavior.segmentStats).reduce((sum, stats) => sum + stats.count, 0);

  return (
    <PageContainer title="User Behavior Analytics" description="Discover user patterns, segments, and behavioral insights to drive growth">
      <div className="space-y-8">
        {/* Header with enhanced styling */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">User Behavior Analytics</h1>
                <p className="text-blue-100 text-lg mt-2">
                  Discover user patterns, segments, and behavioral insights to drive growth
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm text-blue-100">Active Analysis</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm text-blue-100">Real-time Insights</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm text-blue-100">Predictive Analytics</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5"></div>
        </div>

        {/* Enhanced Overview Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Total
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold">{formatNumber(totalUsers)}</p>
                <p className="text-blue-100 text-sm mt-1">Total Users</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <UserCheck className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  +5.2%
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold">{formatNumber(behavior.churnAnalysis.recentlyActive)}</p>
                <p className="text-green-100 text-sm mt-1">Recently Active</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <UserX className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Risk
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold">{formatNumber(behavior.churnAnalysis.churnedUsers)}</p>
                <p className="text-orange-100 text-sm mt-1">Churned Users</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Rate
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-bold">{formatPercentage(behavior.churnAnalysis.churnRate)}</p>
                <p className="text-purple-100 text-sm mt-1">Churn Rate</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="segments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            <TabsTrigger value="segments" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
              <Users className="h-4 w-4 mr-2" />
              User Segments
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all duration-300">
              <Star className="h-4 w-4 mr-2" />
              Behavioral Insights
            </TabsTrigger>
            <TabsTrigger value="churn" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300">
              <TrendingDown className="h-4 w-4 mr-2" />
              Churn Analysis
            </TabsTrigger>
          </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  User Segmentation
                </CardTitle>
                <CardDescription className="text-base">
                  Distribution of users across different behavioral segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white/80 to-green-50/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-white">
                    <Award className="h-5 w-5" />
                  </div>
                  Segment Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                {Object.entries(behavior.segmentStats).map(([segment, stats]) => (
                  <div key={segment} className="group p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{ backgroundColor: SEGMENT_COLORS[segment as keyof typeof SEGMENT_COLORS] }}
                        />
                        <span className="font-semibold capitalize text-lg">{segment} Users</span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-0"
                      >
                        {formatNumber(stats.count)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="text-xs text-muted-foreground mb-1">Avg Spent</div>
                        <div className="font-bold text-lg text-blue-700">{formatCurrency(stats.avgSpent)}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="text-xs text-muted-foreground mb-1">Avg Transactions</div>
                        <div className="font-bold text-lg text-green-700">{stats.avgTransactions.toFixed(1)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Segment Share</span>
                      <span className="text-sm font-bold" style={{ color: SEGMENT_COLORS[segment as keyof typeof SEGMENT_COLORS] }}>
                        {formatPercentage(stats.percentage)}
                      </span>
                    </div>
                    <Progress 
                      value={stats.percentage} 
                      className="h-3 bg-gray-100/50"
                      style={{ 
                        '--progress-background': SEGMENT_COLORS[segment as keyof typeof SEGMENT_COLORS] 
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(behavior.segments).map(([segment, users]) => (
              <Card key={segment}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg capitalize flex items-center gap-2">
                    {segment === 'vip' && <Award className="h-4 w-4 text-purple-500" />}
                    {segment === 'loyal' && <Star className="h-4 w-4 text-yellow-500" />}
                    {segment === 'regular' && <UserCheck className="h-4 w-4 text-green-500" />}
                    {segment === 'new' && <Users className="h-4 w-4 text-blue-500" />}
                    {segment} Users
                  </CardTitle>
                  <CardDescription>
                    {segment === 'new' && '0-1 transactions'}
                    {segment === 'regular' && '2-5 transactions'}
                    {segment === 'loyal' && '6-10 transactions'}
                    {segment === 'vip' && '11+ transactions'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {formatNumber(behavior.segmentStats[segment]?.count || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Spent: {formatCurrency(behavior.segmentStats[segment]?.totalSpent || 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(behavior.insights.paymentPreferences || {}).map(([method, count]) => {
                    const total = Object.values(behavior.insights.paymentPreferences || {}).reduce((sum: number, val: any) => sum + Number(val), 0);
                    const countNum = Number(count);
                    const percentage = total > 0 ? (countNum / total * 100) : 0;
                    
                    return (
                      <div key={method} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{method}</span>
                          <Badge variant="outline">
                            {formatNumber(count as number)} ({formatPercentage(percentage)})
                          </Badge>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Most Active Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {(() => {
                    const hours = behavior.insights.mostActiveHour || {};
                    const maxHour = Object.entries(hours).reduce((max, [hour, activity]) => 
                      (activity as number) > (max.activity as number) ? { hour, activity } : max, 
                      { hour: 'N/A', activity: 0 }
                    );
                    return (
                      <>
                        <div className="text-4xl font-bold text-primary mb-2">
                          {maxHour.hour !== 'N/A' ? `${maxHour.hour}:00` : 'N/A'}
                        </div>
                        <p className="text-muted-foreground">
                          Peak activity with {formatNumber(maxHour.activity as number)} actions
                        </p>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Spenders</CardTitle>
                <CardDescription>Users with highest total spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {behavior.insights.topSpenders.slice(0, 5).map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.displayId || user.userId?.replace('@s.whatsapp.net', '').replace('@lid', '') || user.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(user.transactionCount || 0)} transactions • {formatCurrency(user.totalSpent || 0)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {formatCurrency(user.totalSpent || 0)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Frequent Buyers</CardTitle>
                <CardDescription>Users with highest transaction frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {behavior.insights.mostFrequentBuyers.slice(0, 5).map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.displayId || user.userId?.replace('@s.whatsapp.net', '').replace('@lid', '') || user.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(user.transactionCount || 0)} transactions • {formatCurrency(user.totalSpent || 0)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {formatNumber(user.transactionCount || 0)} orders
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Churn Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Churned Users</span>
                  <span className="font-semibold text-red-600">
                    {formatNumber(behavior.churnAnalysis.churnedUsers)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Churn Rate</span>
                  <Badge variant="destructive">
                    {formatPercentage(behavior.churnAnalysis.churnRate)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Recently Active</span>
                  <span className="font-semibold text-green-600">
                    {formatNumber(behavior.churnAnalysis.recentlyActive)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {formatPercentage(100 - behavior.churnAnalysis.churnRate)}
                  </div>
                  <p className="text-muted-foreground">
                    Users retained this period
                  </p>
                  <Progress 
                    value={100 - behavior.churnAnalysis.churnRate} 
                    className="mt-4 h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">● Active</span>
                    <span className="font-semibold">
                      {formatNumber(behavior.churnAnalysis.recentlyActive)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">● Churned</span>
                    <span className="font-semibold">
                      {formatNumber(behavior.churnAnalysis.churnedUsers)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">
                      {formatNumber(behavior.churnAnalysis.recentlyActive + behavior.churnAnalysis.churnedUsers)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </PageContainer>
  );
} 