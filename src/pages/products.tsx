import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { dashboardApi } from '@/services/api';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { StockAlertsBanner } from '@/components/products/stock-alerts-banner';
import { StockAnalyticsChart } from '@/components/products/stock-analytics-chart';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: productStats, isLoading, error } = useQuery({
    queryKey: ['product-stats'],
    queryFn: dashboardApi.getProductStats,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPerformanceBadge = (sold: number, totalSold: number) => {
    const percentage = (sold / totalSold) * 100;
    if (percentage >= 20) return 'default';
    if (percentage >= 10) return 'secondary';
    return 'outline';
  };

  const filteredProducts = productStats?.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-destructive/5 rounded-2xl border border-destructive/20">
          <h3 className="text-lg font-bold text-destructive mb-2">Failed to load products</h3>
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

  const chartData = productStats?.topProducts.slice(0, 8).map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    fullName: product.name,
    sold: product.totalSold,
    revenue: product.totalRevenue,
  })) || [];

  const pieData = productStats?.topProducts.slice(0, 5).map(product => ({
    name: product.name,
    value: product.totalSold,
    revenue: product.totalRevenue,
  })) || [];

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Analytics</h1>
          <p className="text-muted-foreground mt-1">Track product performance, sales, and revenue insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-background/50 backdrop-blur-sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Package className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stock Alerts */}
      <StockAlertsBanner />

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{productStats?.totalProducts || 0}</h3>
                <div className="flex items-center mt-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12 new this month
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{productStats?.totalSold || 0}</h3>
                <div className="flex items-center mt-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8.2% vs last month
                </div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Product Revenue</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(productStats?.topProducts[0]?.totalRevenue || 0)}</h3>
                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">{productStats?.topProducts[0]?.name || 'N/A'}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Price</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(
                  productStats?.products.reduce((sum, p) => sum + p.averagePrice, 0) / (productStats?.products.length || 1) || 0
                )}</h3>
                <div className="flex items-center mt-1 text-xs font-medium text-amber-500">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  -2.1% price adj.
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Analytics */}
      <StockAnalyticsChart />

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-premium border-none shadow-soft">
          <CardHeader>
            <CardTitle>Top Products by Sales</CardTitle>
            <CardDescription>Number of units sold per product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} layout="horizontal" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [value.toLocaleString(), 'Units Sold']}
                    labelFormatter={(label) => `Product: ${chartData.find(d => d.name === label)?.fullName || label}`}
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
                    dataKey="sold"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#colorSold)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Revenue share by top products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
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
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance Table */}
      <Card className="card-premium border-none shadow-soft">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Product Performance</CardTitle>
            <CardDescription>
              Detailed performance metrics for all products
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Top Products Summary at the top */}
          {productStats?.topProducts?.length ? (
            <div className="mb-8 space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Performers</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {productStats.topProducts.slice(0, 6).map((product: any, index: number) => (
                  <div key={product.id ?? index} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                          index === 1 ? "bg-slate-400/20 text-slate-600" :
                            index === 2 ? "bg-orange-600/20 text-orange-700" : "bg-primary/10 text-primary"
                      )}>
                        {index + 1}
                      </div>
                      <div className="truncate">
                        <p className="font-medium truncate text-sm" title={product.name}>{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.totalSold?.toLocaleString?.() ?? product.sold ?? 0} sold</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm">{formatCurrency(product.totalRevenue ?? product.revenue ?? 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Market Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const marketShare = (product.totalSold / (productStats?.totalSold || 1)) * 100;
                    return (
                      <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {product.id.substring(0, 8)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.totalSold.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">{formatCurrency(product.totalRevenue)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-muted-foreground">{formatCurrency(product.averagePrice)}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{product.transactionCount}</span>
                            <span className="text-xs text-muted-foreground">txns</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPerformanceBadge(product.totalSold, productStats?.totalSold || 1)} className="capitalize">
                            {getPerformanceBadge(product.totalSold, productStats?.totalSold || 1) === 'default' ? 'High' : getPerformanceBadge(product.totalSold, productStats?.totalSold || 1) === 'secondary' ? 'Medium' : 'Low'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={marketShare} className="w-[80px] h-2" />
                            <span className="text-xs text-muted-foreground w-8 text-right">{marketShare.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No products found matching "{searchTerm}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}