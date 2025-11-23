import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, PackageX, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboardApi } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function StockAlertsBanner() {
    const { data: alerts, isLoading } = useQuery({
        queryKey: ['stock-alerts'],
        queryFn: dashboardApi.getStockAlerts,
    });

    if (isLoading) {
        return <Skeleton className="h-24 w-full rounded-xl" />;
    }

    if (!alerts || alerts.totalAlerts === 0) {
        return (
            <Card className="bg-emerald-500/10 border-emerald-500/20 shadow-none">
                <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-full">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Healthy Inventory</h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">All products are well stocked.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const criticalCount = alerts.criticalAlerts;
    const highCount = alerts.highAlerts;

    return (
        <Card className={cn(
            "border-none shadow-soft overflow-hidden",
            criticalCount > 0 ? "bg-red-500/5 border-l-4 border-l-red-500" : "bg-amber-500/5 border-l-4 border-l-amber-500"
        )}>
            <CardContent className="p-0">
                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "p-3 rounded-xl",
                            criticalCount > 0 ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"
                        )}>
                            {criticalCount > 0 ? <PackageX className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                Inventory Alerts
                                {criticalCount > 0 && (
                                    <Badge variant="destructive" className="rounded-full px-2.5">
                                        {criticalCount} Critical
                                    </Badge>
                                )}
                                {highCount > 0 && (
                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200">
                                        {highCount} Low Stock
                                    </Badge>
                                )}
                            </h3>
                            <p className="text-muted-foreground mt-1">
                                {criticalCount > 0
                                    ? "Action required: Some products are out of stock or critically low."
                                    : "Several products are running low on stock. Consider restocking soon."}
                            </p>
                        </div>
                    </div>

                    <Button variant={criticalCount > 0 ? "destructive" : "default"} className="shrink-0">
                        Manage Inventory <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                {/* Quick List of Affected Items */}
                <div className="bg-background/50 border-t border-border/50 px-6 py-3 flex items-center gap-4 overflow-x-auto">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap uppercase tracking-wider">Needs Attention:</span>
                    <div className="flex items-center gap-2">
                        {alerts.alerts.slice(0, 5).map((item) => (
                            <Badge key={item.productId} variant="outline" className="bg-background border-border/50 whitespace-nowrap">
                                <span className={cn(
                                    "mr-1.5 h-1.5 w-1.5 rounded-full",
                                    item.status === 'out' ? "bg-red-500" : "bg-amber-500"
                                )} />
                                {item.productName} ({item.currentStock})
                            </Badge>
                        ))}
                        {alerts.alerts.length > 5 && (
                            <span className="text-xs text-muted-foreground">+{alerts.alerts.length - 5} more</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
