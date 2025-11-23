import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dashboardApi } from '@/services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar, Line, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function AIInsightsCharts() {
    const { data: predictions, isLoading } = useQuery({
        queryKey: ['predictive-analytics'],
        queryFn: dashboardApi.getPredictiveAnalytics,
    });

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (!predictions) return null;

    // Transform data for Revenue Forecast Chart
    // Combining historical and predicted data
    const revenueData = [
        ...predictions.revenue.historical.map((item: any) => ({
            month: item.month,
            actual: item.revenue,
            predicted: null,
            confidence: null
        })),
        {
            month: 'Next Month',
            actual: null,
            predicted: predictions.revenue.predicted.nextMonth,
            confidence: [
                predictions.revenue.predicted.nextMonth * 0.9, // Lower bound
                predictions.revenue.predicted.nextMonth * 1.1  // Upper bound
            ]
        }
    ];

    // Transform data for User Growth Forecast
    const userData = [
        ...predictions.users.historical.map((item: any) => ({
            month: item.month,
            users: item.count,
            type: 'Historical'
        })),
        {
            month: 'Next Month',
            users: predictions.users.predicted.totalPredicted,
            type: 'Predicted'
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Forecast Chart */}
            <Card className="card-premium border-none shadow-soft">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Revenue Forecast</CardTitle>
                            <CardDescription>AI-powered revenue prediction with confidence intervals</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-700">
                            <Brain className="mr-1 h-3 w-3" />
                            AI Model v2.1
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'actual' ? 'Actual Revenue' : 'Predicted Revenue']}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorActual)"
                                    strokeWidth={3}
                                    name="Actual"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorPredicted)"
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    name="Predicted"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* User Growth & Targets Chart */}
            <Card className="card-premium border-none shadow-soft">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>User Growth Trajectory</CardTitle>
                            <CardDescription>Projected user base expansion</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">
                            <Target className="mr-1 h-3 w-3" />
                            On Track
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={userData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="users"
                                    name="Total Users"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                >
                                    {userData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.type === 'Predicted' ? '#8b5cf6' : 'hsl(var(--primary))'} />
                                    ))}
                                </Bar>
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Trend"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
