import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, Zap, BarChart3 } from 'lucide-react';
import { InsightResponse } from '@/services/openai';

interface AIInsightsCardProps {
  insights: InsightResponse;
  isLoading?: boolean;
  hasAIInsights?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date;
  cacheStatus?: 'fresh' | 'stale' | 'expired';
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const typeIcons = {
  growth: TrendingUp,
  engagement: CheckCircle,
  optimization: Zap,
  warning: AlertCircle,
  opportunity: BarChart3,
};

const typeColors = {
  growth: 'border-l-primary text-primary',
  engagement: 'border-l-success text-success',
  optimization: 'border-l-purple-500 text-purple-600 dark:text-purple-400',
  warning: 'border-l-destructive text-destructive',
  opportunity: 'border-l-info text-info',
};

export function AIInsightsCard({ insights, isLoading, hasAIInsights, onRefresh, lastUpdated, cacheStatus }: AIInsightsCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <CardTitle>AI-Powered Insights</CardTitle>
          </div>
          <CardDescription>Generating intelligent insights from your data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>AI-Powered Insights</CardTitle>
            {hasAIInsights && (
              <Badge variant="secondary" className="text-xs">
                AI Generated
              </Badge>
            )}
          </div>
          {onRefresh && cacheStatus === 'stale' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 px-3"
            >
              Refresh AI Insights
            </Button>
          )}
        </div>
        <CardDescription>
          {hasAIInsights 
            ? 'Intelligent analysis powered by OpenAI' 
            : 'Fallback insights based on your data'
          }
          {lastUpdated && (
            <div className="mt-2 text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleString('id-ID')}
              {cacheStatus && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  cacheStatus === 'fresh' ? 'bg-green-100 text-green-800' :
                  cacheStatus === 'stale' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {cacheStatus === 'fresh' ? '🟢 Fresh' :
                   cacheStatus === 'stale' ? '🟡 Stale' :
                   '🔴 Expired'}
                </span>
              )}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary */}
          <div className="p-4 bg-gradient-secondary rounded-lg">
            <h4 className="font-semibold mb-2">📊 Performance Summary</h4>
            <p className="text-sm text-muted-foreground">{insights.summary}</p>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            {insights.insights.map((insight, index) => {
              const IconComponent = typeIcons[insight.type] || Lightbulb;
              return (
                <div
                  key={index}
                  className={`p-4 bg-gradient-secondary rounded-lg border-l-4 ${typeColors[insight.type]}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4" />
                      <h4 className="font-semibold">{insight.title}</h4>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${priorityColors[insight.priority]}`}
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  {insight.actionable && insight.recommendation && (
                    <div className="bg-accent/30 rounded-lg p-3">
                      <p className="text-xs font-medium text-primary mb-1">💡 Recommendation:</p>
                      <p className="text-xs text-muted-foreground">{insight.recommendation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Actions */}
          <div className="p-4 bg-gradient-secondary rounded-lg border-l-4 border-info">
            <h4 className="font-semibold text-info mb-3">🎯 Next Actions</h4>
            <div className="space-y-2">
              {insights.nextActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-info rounded-full"></div>
                  <span className="text-sm text-muted-foreground">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cache Information */}
          {hasAIInsights && (
            <div className="p-3 bg-muted/30 rounded-lg border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Cache Status:</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full ${
                    cacheStatus === 'fresh' ? 'bg-green-100 text-green-800' :
                    cacheStatus === 'stale' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {cacheStatus === 'fresh' ? '🟢 Fresh' :
                     cacheStatus === 'stale' ? '🟡 Stale' :
                     '🔴 Expired'}
                  </span>
                  <span>• Updates every 8 hours</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 