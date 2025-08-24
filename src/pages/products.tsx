import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '@/services/api';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function ProductsPage() {
  const { data: productStats, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
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
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Product Analytics
          </h2>
          <p className="text-muted-foreground">
            Track product performance, sales, and revenue insights
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={productStats?.totalProducts || 0}
          icon={Package}
          className="hover:scale-105"
        />
        <StatsCard
          title="Total Sales"
          value={productStats?.totalSold || 0}
          icon={ShoppingBag}
          className="hover:scale-105"
        />
        <StatsCard
          title="Top Product Revenue"
          value={formatCurrency(productStats?.topProducts[0]?.totalRevenue || 0)}
          change={`${productStats?.topProducts[0]?.name || 'N/A'}`}
          changeType="positive"
          icon={DollarSign}
          className="hover:scale-105"
        />
        <StatsCard
          title="Average Price"
          value={formatCurrency(
            productStats?.products.reduce((sum, p) => sum + p.averagePrice, 0) / (productStats?.products.length || 1) || 0
          )}
          icon={TrendingUp}
          className="hover:scale-105"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Top Products by Sales</CardTitle>
            <CardDescription>Number of units sold per product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [value.toLocaleString(), 'Units Sold']}
                    labelFormatter={(label) => `Product: ${chartData.find(d => d.name === label)?.fullName || label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="sold" 
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Revenue share by top products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${percent > 5 ? name.substring(0, 8) + '...' : ''} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
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
      </div>

      {/* Product Performance Table */}
      <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>
            Detailed performance metrics for all products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
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
              {productStats?.products.map((product) => {
                const marketShare = (product.totalSold / (productStats.totalSold || 1)) * 100;
                return (
                  <TableRow key={product.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{product.totalSold.toLocaleString()}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatCurrency(product.totalRevenue)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatCurrency(product.averagePrice)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{product.transactionCount}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPerformanceBadge(product.totalSold, productStats.totalSold)}>
                        {getPerformanceBadge(product.totalSold, productStats.totalSold) === 'default' ? 'High' : getPerformanceBadge(product.totalSold, productStats.totalSold) === 'secondary' ? 'Medium' : 'Low'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Progress value={marketShare} className="w-[120px]" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}