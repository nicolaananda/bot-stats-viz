import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChartDataPoint {
  date: string;
  revenue: number;
  transactions: number;
  profit: number;
  movingAverageRevenue?: number;
  forecastRevenue?: number;
}

interface OverviewChartProps {
  data: ChartDataPoint[];
  title?: string;
  description?: string;
  showMovingAverage?: boolean;
  showForecast?: boolean;
}

export function OverviewChart({ data, title = "Revenue Overview", description = "Your revenue and transaction trends", showMovingAverage = false, showForecast = false }: OverviewChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm shadow-elevated ring-1 ring-black/5">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-semibold text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="revenue" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">Revenue</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">Transactions</TabsTrigger>
            <TabsTrigger value="profit" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary">Profit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    tickFormatter={formatCurrency}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                  />
                  {showMovingAverage && (
                    <Line
                      type="monotone"
                      dataKey="movingAverageRevenue"
                      stroke="hsl(var(--chart-2))"
                      strokeDasharray="6 6"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  {showForecast && (
                    <Line
                      type="monotone"
                      dataKey="forecastRevenue"
                      stroke="hsl(var(--chart-4))"
                      strokeDasharray="2 4"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" className="text-xs text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis className="text-xs text-muted-foreground" axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Transactions']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar 
                    dataKey="transactions" 
                    fill="hsl(var(--chart-2))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="profit" className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" className="text-xs text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    tickFormatter={formatCurrency}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Profit']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, stroke: 'hsl(var(--chart-3))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}