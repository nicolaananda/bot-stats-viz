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
      "shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-0 bg-card/50 backdrop-blur-sm",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change && (
          <p className={cn(
            "text-xs mt-1",
            changeType === 'positive' && "text-success",
            changeType === 'negative' && "text-destructive",
            changeType === 'neutral' && "text-muted-foreground"
          )}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}