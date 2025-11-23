import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dashboardApi } from '@/services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, UserMinus, Clock, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function UserBehaviorInsights() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['user-behavior'],
        queryFn: dashboardApi.getUserBehaviorAnalytics,
    });

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (!analytics) return null;

    // Prepare data for charts
    const segmentData = Object.entries(analytics.segmentStats).map(([key, stats]: [string, any]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: stats.count,
        percentage: stats.percentage
    }));

    const activeHourData = Object.entries(analytics.insights.mostActiveHour).map(([hour, count]) => ({
        hour: `${hour}:00`,
        users: count
    }));

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* User Segments */}
            <Card className="card-premium border-none shadow-soft lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        User Segments
                    </CardTitle>
                    <CardDescription>Distribution by engagement level</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={segmentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {segmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [value, 'Users']}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {segmentData.map((segment, index) => (
                            <div key={segment.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-muted-foreground">{segment.name}</span>
                                </div>
                                <div className="font-medium">
                                    {segment.value} <span className="text-xs text-muted-foreground">({segment.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Activity & Churn */}
            <Card className="card-premium border-none shadow-soft lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Behavior Analysis</CardTitle>
                            <CardDescription>Activity patterns and retention</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="bg-background">
                                <Clock className="mr-1 h-3 w-3" />
                                Peak: 19:00 - 21:00
                            </Badge>
                            <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-200">
                                <UserMinus className="mr-1 h-3 w-3" />
                                {analytics.churnAnalysis.churnRate.toFixed(1)}% Churn
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="h-[200px] w-full">
                            <p className="text-sm font-medium text-muted-foreground mb-4 text-center">Active Users by Hour</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activeHourData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis
                                        dataKey="hour"
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval={2}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '0.5rem',
                                        }}
                                    />
                                    <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Key Insights</p>

                            <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <CreditCard className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <span className="font-medium text-sm">Payment Preference</span>
                                </div>
                                <div className="space-y-1">
                                    {Object.entries(analytics.insights.paymentPreferences).map(([method, count]: [string, any]) => (
                                        <div key={method} className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">{method}</span>
                                            <span className="font-medium">{Math.round(count)} users</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-secondary/30 rounded-xl border border-border/50 text-center">
                                    <p className="text-xs text-muted-foreground">Avg Transaction</p>
                                    <p className="text-lg font-bold text-foreground mt-1">
                                        {analytics.segmentStats.regular?.avgTransactions || 0}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">per regular user</p>
                                </div>
                                <div className="p-3 bg-secondary/30 rounded-xl border border-border/50 text-center">
                                    <p className="text-xs text-muted-foreground">Avg Spend</p>
                                    <p className="text-lg font-bold text-foreground mt-1">
                                        {formatCurrency(analytics.segmentStats.regular?.avgSpent || 0)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">per regular user</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
