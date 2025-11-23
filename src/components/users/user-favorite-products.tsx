import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

interface UserFavoriteProductsProps {
    transactions: any[];
}

export function UserFavoriteProducts({ transactions }: UserFavoriteProductsProps) {
    // Count product frequency
    const productCounts = transactions.reduce((acc: any, transaction: any) => {
        const productName = transaction.name;
        if (!acc[productName]) {
            acc[productName] = { count: 0, totalSpent: 0 };
        }
        acc[productName].count += transaction.jumlah || 1;
        acc[productName].totalSpent += transaction.totalBayar;
        return acc;
    }, {});

    const topProducts = Object.entries(productCounts)
        .map(([name, stats]: [string, any]) => ({
            name,
            count: stats.count,
            totalSpent: stats.totalSpent
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <Card className="card-premium border-none shadow-soft h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Favorite Products</CardTitle>
                        <CardDescription>Most frequently purchased items</CardDescription>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <ShoppingBag className="h-4 w-4 text-emerald-500" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topProducts.length > 0 ? (
                        topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">{product.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{product.count} times</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="font-normal">
                                    Top Pick
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No purchase history available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
