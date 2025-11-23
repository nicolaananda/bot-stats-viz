import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dashboardApi } from '@/services/api';
import { Sparkles, TrendingUp, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function AIPredictionsCard() {
    const { data: predictions, isLoading } = useQuery({
        queryKey: ['predictive-analytics'],
        queryFn: dashboardApi.getPredictiveAnalytics,
    });

    if (isLoading) {
        return <PredictionsSkeleton />;
    }

    if (!predictions) return null;

    return (
        <Card className="card-premium border-none shadow-soft bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border-l-4 border-l-violet-500">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-violet-500/10 rounded-lg">
                            <Sparkles className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">AI Insights</CardTitle>
                            <CardDescription>Predictive performance analysis</CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200">
                        Beta
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                {/* Predictions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Revenue Prediction */}
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                            <TrendingUp className="h-3 w-3" />
                            Next Month Revenue
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {formatCurrency(predictions.revenue.predicted.nextMonth)}
                        </div>
                        <div className="text-xs text-emerald-500 font-medium flex items-center">
                            {predictions.revenue.predicted.confidence} confidence
                        </div>
                    </div>

                    {/* User Growth Prediction */}
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                            <Users className="h-3 w-3" />
                            Projected Growth
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            +{predictions.users.predicted.nextMonthNewUsers}
                        </div>
                        <div className="text-xs text-blue-500 font-medium">
                            New users expected
                        </div>
                    </div>

                    {/* Churn Risk */}
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                            <AlertTriangle className="h-3 w-3" />
                            Churn Risk
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {predictions.churnRisk.highRisk}
                        </div>
                        <div className="text-xs text-rose-500 font-medium">
                            High risk users detected
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Smart Recommendations</h4>
                    <div className="space-y-2">
                        {predictions.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/40 hover:bg-background/60 transition-colors border border-transparent hover:border-border/50 cursor-default group">
                                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-violet-500 group-hover:scale-125 transition-transform" />
                                <p className="text-sm text-foreground/80 leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2">
                        <button className="text-xs text-violet-600 font-medium flex items-center hover:underline">
                            View all insights <ArrowRight className="ml-1 h-3 w-3" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function PredictionsSkeleton() {
    return (
        <Card className="card-premium border-none shadow-soft">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}
