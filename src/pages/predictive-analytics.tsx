import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Brain, 
  Users, 
  Package,
  AlertTriangle,
  Target,
  Zap,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import { dashboardApi } from '@/services/api';
import { PredictiveAnalytics } from '@/types/dashboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';

const CONFIDENCE_COLORS = {
  high: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100', 
  low: 'text-red-600 bg-red-100'
};

export default function PredictiveAnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '3m' | '6m'>('3m');

  const { data: predictions, isLoading, error } = useQuery({
    queryKey: ['predictive-analytics', selectedTimeframe],
    queryFn: dashboardApi.getPredictiveAnalytics,
    retry: 1,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading AI predictions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !predictions) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load predictive analytics</p>
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

  const getConfidenceBadge = (confidence: string) => {
    const colorClass = CONFIDENCE_COLORS[confidence as keyof typeof CONFIDENCE_COLORS] || CONFIDENCE_COLORS.medium;
    return (
      <Badge className={`${colorClass} border-0`}>
        {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
      </Badge>
    );
  };

  // Combine historical and predicted revenue data
  const revenueChartData = [
    ...predictions.revenue.historical.map((item: any) => ({
      ...item,
      type: 'historical'
    })),
    {
      period: 'Next Month',
      revenue: predictions.revenue.predicted.nextMonth,
      type: 'predicted',
      confidence: predictions.revenue.predicted.confidence
    }
  ];

  // Combine historical and predicted user data
  const userChartData = [
    ...predictions.users.historical.map((item: any) => ({
      ...item,
      type: 'historical'
    })),
    {
      period: 'Next Month',
      users: predictions.users.predicted.totalPredicted,
      newUsers: predictions.users.predicted.nextMonthNewUsers,
      type: 'predicted'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-500" />
          Predictive Analytics
        </h1>
        <p className="text-muted-foreground">
          AI-powered business forecasting and predictive insights
        </p>
      </div>

      {/* Key Predictions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Next Month Revenue"
          value={formatCurrency(predictions.revenue.predicted.nextMonth)}
          icon={TrendingUp}
          trend={{ value: 15.2, isPositive: true }}
          badge={getConfidenceBadge(predictions.revenue.predicted.confidence)}
        />
        <StatsCard
          title="New Users Predicted"
          value={formatNumber(predictions.users.predicted.nextMonthNewUsers)}
          icon={Users}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatsCard
          title="High Churn Risk"
          value={formatNumber(predictions.churnRisk.highRisk)}
          icon={AlertTriangle}
          trend={{ value: 12.3, isPositive: false }}
        />
        <StatsCard
          title="Recommended Stock"
          value={formatNumber(predictions.inventory.totalRecommendedStock)}
          icon={Package}
          trend={{ value: 5.7, isPositive: true }}
        />
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Planning</TabsTrigger>
          <TabsTrigger value="churn">Churn Prediction</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Forecast
              </CardTitle>
              <CardDescription>
                Historical data and AI-powered revenue predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === 'revenue' ? 'Revenue' : name
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ff7300"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Prediction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Next Month Forecast</span>
                  <span className="font-semibold">{formatCurrency(predictions.revenue.predicted.nextMonth)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Confidence Level</span>
                  {getConfidenceBadge(predictions.revenue.predicted.confidence)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Prediction Accuracy</span>
                  <Badge variant="outline">
                    {predictions.revenue.predicted.confidence === 'high' ? '85-95%' :
                     predictions.revenue.predicted.confidence === 'medium' ? '70-85%' : '50-70%'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Factors Influencing Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Historical growth trends</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Seasonal patterns</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">User behavior changes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Market conditions</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Growth Prediction
              </CardTitle>
              <CardDescription>
                Forecasted user acquisition and growth patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={userChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Next Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    +{formatNumber(predictions.users.predicted.nextMonthNewUsers)}
                  </div>
                  <p className="text-sm text-muted-foreground">New Users</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatNumber(predictions.users.predicted.totalPredicted)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Predicted</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    +{((predictions.users.predicted.nextMonthNewUsers / (predictions.users.predicted.totalPredicted - predictions.users.predicted.nextMonthNewUsers)) * 100).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Monthly Growth</p>
                  <Progress value={15} className="mt-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acquisition Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Organic</span>
                  <Badge variant="secondary">60%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Referral</span>
                  <Badge variant="secondary">25%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Marketing</span>
                  <Badge variant="secondary">15%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Demand Forecast
              </CardTitle>
              <CardDescription>
                AI-powered stock level recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Stock Predictions</h4>
                  <div className="space-y-3">
                    {predictions.inventory.stockPredictions.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            Current: {item.currentStock} | Recommended: {item.recommendedStock}
                          </p>
                        </div>
                        <Badge variant={item.urgency === 'high' ? 'destructive' : item.urgency === 'medium' ? 'default' : 'secondary'}>
                          {item.urgency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Restock Summary</h4>
                  <div className="space-y-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatNumber(predictions.inventory.totalRecommendedStock)}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Recommended Stock</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-red-600">
                          {predictions.inventory.stockPredictions.filter((item: any) => item.urgency === 'high').length}
                        </div>
                        <p className="text-xs text-muted-foreground">High Priority</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">
                          {predictions.inventory.stockPredictions.filter((item: any) => item.urgency === 'medium').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Medium Priority</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Churn Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {formatNumber(predictions.churnRisk.highRisk)}
                  </div>
                  <p className="text-sm text-muted-foreground">High Risk Users</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatNumber(predictions.churnRisk.mediumRisk)}
                  </div>
                  <p className="text-sm text-muted-foreground">Medium Risk Users</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">High Risk</span>
                      <span className="text-sm font-medium">{predictions.churnRisk.highRisk}</span>
                    </div>
                    <Progress value={(predictions.churnRisk.highRisk / (predictions.churnRisk.highRisk + predictions.churnRisk.mediumRisk)) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Medium Risk</span>
                      <span className="text-sm font-medium">{predictions.churnRisk.mediumRisk}</span>
                    </div>
                    <Progress value={(predictions.churnRisk.mediumRisk / (predictions.churnRisk.highRisk + predictions.churnRisk.mediumRisk)) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>At-Risk Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predictions.churnRisk.usersAtRisk.slice(0, 5).map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{user.username || user.userId}</span>
                      <Badge variant={user.riskLevel === 'high' ? 'destructive' : 'default'} className="text-xs">
                        {user.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Market Trends & Insights
              </CardTitle>
              <CardDescription>
                AI-identified patterns and emerging trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Category Trends</h4>
                  <div className="space-y-3">
                    {Object.entries(predictions.trends.categories || {}).map(([category, trend]: [string, any]) => (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{category}</p>
                          <p className="text-xs text-muted-foreground">{trend.description}</p>
                        </div>
                        <Badge variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'secondary'}>
                          {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.change}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Key Insights</h4>
                  <div className="space-y-3">
                    {predictions.trends.insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
                          <Zap className="h-3 w-3" />
                        </div>
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 