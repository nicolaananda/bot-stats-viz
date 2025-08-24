import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  className?: string;
  trend?: number[];
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-500 animate-fade-in border-0",
      "hover:shadow-elevated hover:scale-[1.02]",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent dark:from-slate-800/80 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-foreground mb-2">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change && (
                  <p className={cn(
          "text-sm font-medium",
          changeType === 'positive' && "text-emerald-600 dark:text-emerald-400",
          changeType === 'negative' && "text-red-600 dark:text-red-400",
          changeType === 'neutral' && "text-slate-600 dark:text-slate-400"
        )}>
          {change}
        </p>
        )}
      </CardContent>
    </Card>
  );
}