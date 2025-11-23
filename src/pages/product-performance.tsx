import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Target,
  AlertTriangle,
  Star,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dashboardApi } from '@/services/api';
import { ProductPerformance } from '@/types/dashboard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProductPerformancePage() {
  const [sortBy, setSortBy] = useState<'revenue' | 'profit' | 'sold' | 'margin'>('revenue');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: performance, isLoading, error } = useQuery({
    queryKey: ['product-performance'],
    queryFn: dashboardApi.getProductPerformance,
    retry: 1,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product performance...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load product performance</p>
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

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  };

  // Get unique categories
  const categories = Array.from(new Set(performance.products.map(p => p.category)));

  // Filter and sort products
  const filteredProducts = performance.products
    .filter(product => categoryFilter === 'all' || product.category === categoryFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.sales.totalRevenue - a.sales.totalRevenue;
        case 'profit':
          return b.sales.totalProfit - a.sales.totalProfit;
        case 'sold':
          return b.sales.totalSold - a.sales.totalSold;
        case 'margin':
          return b.metrics.profitMargin - a.metrics.profitMargin;
        default:
          return 0;
      }
    });

  // Prepare chart data
  const revenueData = filteredProducts.slice(0, 10).map(product => ({
    name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
    revenue: product.sales.totalRevenue,
    profit: product.sales.totalProfit,
    sold: product.sales.totalSold,
  }));

  const profitMarginData = filteredProducts.slice(0, 10).map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    margin: product.metrics.profitMargin,
    revenue: product.sales.totalRevenue,
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Product Performance</h1>
            <p className="text-gray-400 mt-1">Detailed analysis of product sales, profitability, and performance metrics</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-white">{formatNumber(performance.summary.totalProducts)}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(performance.summary.totalRevenue)}</p>
                <p className="text-sm text-green-400 mt-1">+12.5%</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Profit</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(performance.summary.totalProfit)}</p>
                <p className="text-sm text-green-400 mt-1">+8.3%</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-white">{formatPercentage(performance.summary.avgProfitMargin)}</p>
                <p className="text-sm text-green-400 mt-1">+2.1%</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Target className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="profit">Profit</SelectItem>
            <SelectItem value="sold">Units Sold</SelectItem>
            <SelectItem value="margin">Profit Margin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Products by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' || name === 'profit' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                        name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : 'Units Sold'
                      ]}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" radius={[6,6,0,0]} />
                    <Bar dataKey="profit" fill="#82ca9d" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Profit Margin Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={profitMarginData}>
                    <CartesianGrid className="opacity-30" />
                    <XAxis 
                      type="number" 
                      dataKey="revenue" 
                      name="Revenue"
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="margin" 
                      name="Profit Margin"
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'margin' ? `${value}%` : formatCurrency(Number(value)),
                        name === 'margin' ? 'Profit Margin' : 'Revenue'
                      ]}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      labelFormatter={(label) => `Product: ${label}`}
                    />
                    <Scatter dataKey="margin" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Table</CardTitle>
              <CardDescription>
                Detailed performance metrics for all products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProducts.slice(0, 20).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          <Badge 
                            variant={product.stock.status === 'in_stock' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {product.stock.current} in stock
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-semibold">{formatCurrency(product.sales.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Profit</p>
                        <p className="font-semibold">{formatCurrency(product.sales.totalProfit)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sold</p>
                        <p className="font-semibold">{formatNumber(product.sales.totalSold)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Margin</p>
                        <p className="font-semibold">{formatPercentage(product.metrics.profitMargin)}</p>
                      </div>
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
                  <Star className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">By Revenue</h4>
                  <div className="space-y-2">
                    {performance.insights.topByRevenue.slice(0, 3).map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{product.name}</span>
                        <Badge variant="secondary">{formatCurrency(product.revenue)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">By Profit</h4>
                  <div className="space-y-2">
                    {performance.insights.topByProfit.slice(0, 3).map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{product.name}</span>
                        <Badge variant="secondary">{formatCurrency(product.profit)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Attention Needed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Low Stock Items</h4>
                  <div className="space-y-2">
                    {performance.insights.lowStock.slice(0, 5).map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{product.name}</span>
                        <Badge variant="destructive">{product.stock} left</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">High Conversion Rate</h4>
                  <div className="space-y-2">
                    {performance.insights.topByConversion.slice(0, 3).map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{product.name}</span>
                        <Badge variant="default">{formatPercentage(product.conversionRate)}</Badge>
                      </div>
                    ))}
                  </div>
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