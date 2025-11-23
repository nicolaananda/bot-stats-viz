import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dashboardApi } from '@/services/api';
import { Activity, ShoppingCart, UserPlus, Zap, Clock } from 'lucide-react';
import { formatCurrency, formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function RealtimeActivityFeed() {
    const { data: realtimeData } = useQuery({
        queryKey: ['realtime-dashboard'],
        queryFn: dashboardApi.getRealtimeDashboard,
        refetchInterval: 5000, // Poll every 5 seconds
    });

    const getIconForActivity = (type: string) => {
        switch (type) {
            case 'transaction': return <ShoppingCart className="h-4 w-4 text-blue-500" />;
            case 'user_signup': return <UserPlus className="h-4 w-4 text-emerald-500" />;
            case 'login': return <Zap className="h-4 w-4 text-amber-500" />;
            default: return <Activity className="h-4 w-4 text-slate-500" />;
        }
    };

    // Mock activities if API returns empty (for demo purposes)
    const activities = realtimeData?.recent?.transactions?.map(t => ({
        id: t.reffId || Math.random().toString(),
        type: 'transaction',
        title: `New order from ${t.user_name || t.user || 'User'}`,
        subtitle: `${t.name} - ${formatCurrency(t.totalBayar)}`,
        time: t.date,
        amount: t.totalBayar
    })) || [];

    return (
        <Card className="card-premium border-none shadow-soft h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse border-2 border-background" />
                            <Activity className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base">Live Activity</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">
                        {realtimeData?.realtime?.activeUsers || 0} active users
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[350px] px-6 pb-6">
                    <div className="space-y-6">
                        {activities.length > 0 ? (
                            activities.map((activity, i) => (
                                <div key={activity.id} className="relative pl-6 pb-1 last:pb-0">
                                    {/* Timeline line */}
                                    {i !== activities.length - 1 && (
                                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-border/50" />
                                    )}

                                    {/* Timeline dot */}
                                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-secondary flex items-center justify-center border border-border/50 z-10">
                                        {getIconForActivity(activity.type)}
                                    </div>

                                    <div className="flex justify-between items-start gap-2">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{activity.title}</p>
                                            <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-muted-foreground flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatTime(activity.time)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                                <Activity className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No recent activity</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
