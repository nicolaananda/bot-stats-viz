import { useQuery } from '@tanstack/react-query';
import { OpenAIService, InsightRequest, InsightResponse } from '@/services/openai';

export function useAIInsights(data: InsightRequest) {
  return useQuery({
    queryKey: ['ai-insights', data],
    queryFn: () => OpenAIService.generateInsights(data),
    enabled: !!data.transaksiHariIni && !!data.totalTransaksi,
    staleTime: 1000 * 60 * 60 * 8, // 8 hours - data considered fresh for 8 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache for 24 hours
    retry: 2,
    retryDelay: 1000,
  });
}

export function useAIInsightsWithFallback(data: InsightRequest) {
  const { data: aiInsights, isLoading, error, dataUpdatedAt } = useAIInsights(data);
  
  // If AI fails, use fallback insights
  const insights = aiInsights || OpenAIService.getFallbackInsights(data);
  
  // Calculate cache status based on staleTime (8 hours)
  const staleTime = 1000 * 60 * 60 * 8; // 8 hours in milliseconds
  const now = Date.now();
  const lastUpdated = new Date(dataUpdatedAt || now);
  const isStale = (now - dataUpdatedAt) > staleTime;
  const cacheStatus: 'fresh' | 'stale' | 'expired' = isStale ? 'stale' : 'fresh';
  
  return {
    insights,
    isLoading,
    error,
    hasAIInsights: !!aiInsights,
    lastUpdated,
    cacheStatus,
  };
} 