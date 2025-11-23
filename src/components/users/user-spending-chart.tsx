import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface UserSpendingChartProps {
    transactions: any[];
}

export function UserSpendingChart({ transactions }: UserSpendingChartProps) {
    // Group transactions by month
    const monthlySpending = transactions.reduce((acc: any, transaction: any) => {
        const date = new Date(transaction.date);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
            acc[month] = 0;
        }
        acc[month] += transaction.totalBayar;
        return acc;
    }, {});

    const data = Object.entries(monthlySpending).map(([name, value]) => ({
        name,
        value
    }));

    // If no data, show mock data for visualization
    const chartData = data.length > 0 ? data : [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: 0 },
        { name: 'Mar', value: 0 },
    ];

    return (
        <Card className="card-premium border-none shadow-soft h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Spending History</CardTitle>
                        <CardDescription>Monthly transaction volume</CardDescription>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                            <XAxis
                                dataKey="name"
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
                                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                formatter={(value: number) => [formatCurrency(value), 'Spent']}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
