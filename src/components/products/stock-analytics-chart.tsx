import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dashboardApi } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function StockAnalyticsChart() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['stock-analytics'],
        queryFn: dashboardApi.getStockAnalyticsAdvanced,
    });

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (!analytics) return null;

    // Transform data for charts
    const turnoverData = analytics.performance.stockTurnover.map(item => ({
        name: item.name,
        turnover: item.turnoverRate,
        status: item.status
    }));

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-premium border-none shadow-soft">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Stock Turnover Rate</CardTitle>
                            <CardDescription>Fastest moving products this month</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">
                            <Activity className="mr-1 h-3 w-3" />
                            High Velocity
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={turnoverData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Bar dataKey="turnover" radius={[0, 4, 4, 0]} barSize={20}>
                                    {turnoverData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 3 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="card-premium border-none shadow-soft">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Demand Forecast</CardTitle>
                            <CardDescription>Predicted stock needs for next 30 days</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-700">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            AI Forecast
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {analytics.predictions.demandForecast.slice(0, 4).map((item: any, index: number) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{item.productName}</span>
                                    <span className="text-muted-foreground">{item.predictedDemand} units needed</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full"
                                        style={{ width: `${Math.min((item.predictedDemand / 100) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Current: {item.currentStock}</span>
                                    <span className={item.trend === 'up' ? "text-emerald-500" : "text-rose-500"}>
                                        {item.trend === 'up' ? "Trending Up" : "Trending Down"}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {analytics.predictions.demandForecast.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                <p>Not enough data for forecast</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
