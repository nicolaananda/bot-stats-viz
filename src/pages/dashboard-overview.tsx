import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, CreditCard, DollarSign, Activity, Eye, FileText, User, Smartphone, Copy, Check, Download } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { OverviewChart } from '@/components/charts/overview-chart';
import { EnvironmentBanner } from '@/components/ui/environment-banner';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, formatTime, getTransactionUserName, getTransactionPaymentMethod, getTransactionReferenceId } from '@/lib/utils';
import { PageContainer } from '@/components/ui/page-container';

export default function DashboardOverview() {
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [receiptContent, setReceiptContent] = useState<string | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });

  const { data: dailyChart } = useQuery({
    queryKey: ['daily-chart'],
    queryFn: dashboardApi.getDailyChart,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(5),
  });

  // Fetch transaction with receipt content
  const fetchTransactionWithReceipt = async (reffId: string) => {
    setIsLoadingReceipt(true);
    try {
      const transaction = await dashboardApi.searchTransaction(reffId);
      
      // Update transaction details
      setSelectedDetail(transaction);
      
      // Set receipt content if available (now included in transaction response)
      if (transaction.receiptExists && transaction.receiptContent) {
        setReceiptContent(transaction.receiptContent);
      } else {
        setReceiptContent('Receipt not available - This transaction may not have generated a receipt yet.');
      }
    } catch (error) {
      console.error('Failed to fetch transaction with receipt:', error);
      if (error.response?.status === 404) {
        setReceiptContent('Transaction not found');
        toast({
          title: "Transaction Error",
          description: "Transaction not found",
          variant: "destructive",
        });
      } else {
        setReceiptContent('Failed to load transaction data - Please check your connection and try again.');
        toast({
          title: "Connection Error",
          description: "Could not load transaction data",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  // Copy receipt content to clipboard
  const copyReceiptContent = async () => {
    if (!receiptContent) return;
    
    try {
      await navigator.clipboard.writeText(receiptContent);
      setIsCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Account information has been copied to clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Download receipt function
  const downloadReceipt = async (reffId: string) => {
    try {
      const blob = await dashboardApi.downloadReceipt(reffId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reffId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Successful",
        description: `Receipt ${reffId}.txt has been downloaded`,
      });
    } catch (error) {
      console.error('Failed to download receipt:', error);
      toast({
        title: "Download Failed",
        description: "Could not download receipt file",
        variant: "destructive",
      });
    }
  };

  // Reset detail view
  const resetDetailView = () => {
    setSelectedDetail(null);
    setReceiptContent(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground">Please check your API connection</p>
        </div>
      </div>
    );
  }



  const chartData = overview?.chartData?.daily ? overview.chartData.daily.map((item) => ({
    date: item.date,
    revenue: item.pendapatan,
    transactions: item.transaksi,
    profit: item.pendapatan * 0.1, // Assuming 10% profit
  })) : [];

  // Compute 7-day moving average and naive 7-day forecast
  const movingAverageWindow = 7;
  const chartDataWithMA = chartData.map((point, idx, arr) => {
    const start = Math.max(0, idx - movingAverageWindow + 1);
    const slice = arr.slice(start, idx + 1);
    const avg = slice.reduce((sum, p) => sum + p.revenue, 0) / slice.length;
    return { ...point, movingAverageRevenue: Math.round(avg) };
  });
  const lastMA = chartDataWithMA.length > 0 ? chartDataWithMA[chartDataWithMA.length - 1].movingAverageRevenue || 0 : 0;
  const chartDataWithForecast = chartDataWithMA.map((p) => ({ ...p, forecastRevenue: lastMA }));

  // Calculate today's vs yesterday's revenue percentage change
  const todayRevenue = chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0;
  const yesterdayRevenue = chartData.length > 1 ? chartData[chartData.length - 2].revenue : 0;
  const revenueDelta = todayRevenue - yesterdayRevenue;
  const revenuePct = yesterdayRevenue > 0 ? (revenueDelta / yesterdayRevenue) * 100 : 0;
  const revenueChangeLabel = yesterdayRevenue > 0
    ? `${revenuePct >= 0 ? '+' : ''}${revenuePct.toFixed(1)}% dibanding kemarin`
    : 'Tidak ada data pembanding';
  const revenueChangeType: 'positive' | 'negative' | 'neutral' = yesterdayRevenue === 0
    ? 'neutral'
    : (revenuePct >= 0 ? 'positive' : 'negative');

  // Calculate today's vs yesterday's transactions percentage change
  const todayTransactions = chartData.length > 0 ? chartData[chartData.length - 1].transactions : 0;
  const yesterdayTransactions = chartData.length > 1 ? chartData[chartData.length - 2].transactions : 0;
  const trxDelta = todayTransactions - yesterdayTransactions;
  const trxPct = yesterdayTransactions > 0 ? (trxDelta / yesterdayTransactions) * 100 : 0;
  const trxChangeLabel = yesterdayTransactions > 0
    ? `${trxPct >= 0 ? '+' : ''}${trxPct.toFixed(1)}% dibanding kemarin`
    : 'Tidak ada data pembanding';
  const trxChangeType: 'positive' | 'negative' | 'neutral' = yesterdayTransactions === 0
    ? 'neutral'
    : (trxPct >= 0 ? 'positive' : 'negative');

  // Advanced KPIs
  const totalTransactions = overview?.totalTransaksi || 0;
  const totalRevenue = overview?.totalPendapatan || 0;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const last7 = chartData.slice(-7);
  const avg7Revenue = last7.length ? last7.reduce((s, p) => s + p.revenue, 0) / last7.length : 0;
  const bestDay = chartData.reduce((best, p) => (p.revenue > (best?.revenue || 0) ? p : best), undefined as undefined | { date: string; revenue: number; transactions: number; profit: number });

  return (
    <PageContainer
      title="Dashboard Overview"
      description="Comprehensive analytics for your WhatsApp bot performance"
    >

        {/* Stats Cards */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Pendapatan"
            value={formatCurrency(overview?.totalPendapatan || 0)}
            change={`${overview?.transaksiHariIni || 0} transaksi hari ini`}
            changeType="positive"
            icon={DollarSign}
            className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
          />
          <StatsCard
            title="Total Transaksi"
            value={overview?.totalTransaksi || 0}
            change={`${overview?.transaksiHariIni || 0} hari ini`}
            changeType="neutral"
            icon={CreditCard}
            className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
          />
          <StatsCard
            title="Pendapatan Hari Ini"
            value={formatCurrency(overview?.pendapatanHariIni || 0)}
            change={revenueChangeLabel}
            changeType={revenueChangeType}
            icon={TrendingUp}
            className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
          />
          <StatsCard
            title="Total Transaksi Hari Ini"
            value={overview?.transaksiHariIni ?? todayTransactions ?? 0}
            change={trxChangeLabel}
            changeType={trxChangeType}
            icon={Activity}
            className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
          />
        </div>

        {/* Advanced KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
            <CardHeader className="pb-2"><CardTitle className="text-base">Average Order Value</CardTitle><CardDescription>Rata-rata nilai transaksi</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(averageOrderValue || 0)}</div></CardContent>
          </Card>
          <Card className="border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
            <CardHeader className="pb-2"><CardTitle className="text-base">7d Avg Revenue</CardTitle><CardDescription>Rata-rata 7 hari</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(avg7Revenue || 0)}</div></CardContent>
          </Card>
          <Card className="border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
            <CardHeader className="pb-2"><CardTitle className="text-base">Best Day Revenue</CardTitle><CardDescription>Hari performa tertinggi</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold">{bestDay ? formatCurrency(bestDay.revenue) : '-'}</div></CardContent>
          </Card>
          <Card className="border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
            <CardHeader className="pb-2"><CardTitle className="text-base">Trend vs Avg</CardTitle><CardDescription>Hari ini vs 7d avg</CardDescription></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todayRevenue)} <span className="text-sm text-muted-foreground">/ {formatCurrency(avg7Revenue || 0)}</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-8 md:grid-cols-7">
          <div className="col-span-7 lg:col-span-4">
            <OverviewChart 
              data={chartDataWithForecast}
              title="Revenue Trends"
              description="Daily revenue with 7d moving average and forecast"
              showMovingAverage
              showForecast
            />
          </div>
          
          <div className="col-span-7 lg:col-span-3">
            <Card className="border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm shadow-elevated ring-1 ring-black/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  Metode Pembayaran
                </CardTitle>
                <CardDescription className="text-muted-foreground">Statistik metode pembayaran</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-white/30 dark:border-slate-700/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[hsl(var(--chart-1))] rounded-full"></div>
                      <span className="font-medium text-foreground">QRIS</span>
                    </div>
                    <Badge variant="secondary" className="font-semibold px-3 py-1">{overview?.metodeBayar?.qris || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-white/30 dark:border-slate-700/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[hsl(var(--chart-3))] rounded-full"></div>
                      <span className="font-medium text-foreground">Saldo</span>
                    </div>
                    <Badge variant="secondary" className="font-semibold px-3 py-1">{overview?.metodeBayar?.saldo || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-white/30 dark:border-slate-700/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[hsl(var(--muted-foreground))] rounded-full"></div>
                      <span className="font-medium text-foreground">Lainnya</span>
                    </div>
                    <Badge variant="secondary" className="font-semibold px-3 py-1">{overview?.metodeBayar?.unknown || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card className="border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm shadow-elevated ring-1 ring-black/5">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
            <CardDescription className="text-muted-foreground">Latest transactions from your WhatsApp bot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions?.transactions.map((transaction) => (
                <div key={getTransactionReferenceId(transaction)} className="group flex items-center justify-between p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-white/30 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-elevated transition-all duration-300">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getTransactionUserName(transaction)} • {getTransactionPaymentMethod(transaction)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">{formatCurrency(transaction.totalBayar)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.date, 'short')} • {formatTime(transaction.date)}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchTransactionWithReceipt(getTransactionReferenceId(transaction))}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent 
                        className="max-w-2xl backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border-0 shadow-2xl" 
                        onOpenChange={(open) => !open && resetDetailView()}
                        style={{
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                        }}
                      >
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Account Details
                          </DialogTitle>
                          <DialogDescription>
                            Account information for transaction {getTransactionReferenceId(transaction)}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {isLoadingReceipt ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            <p className="text-slate-600">Loading account details...</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Receipt Content - Simple Display */}
                            {selectedDetail?.receiptExists && receiptContent && (
                              <div className="bg-slate-50 rounded-lg p-4 border">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-slate-700 flex items-center gap-2">
                                    <Smartphone className="h-4 w-4 text-blue-600" />
                                    Account Information
                                  </h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyReceiptContent}
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Copied!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copy
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <div className="bg-white rounded border p-3 max-h-60 overflow-y-auto">
                                  <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                                    {receiptContent}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Simple Transaction Info */}
                            {selectedDetail && (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-500">Product:</span>
                                  <p className="font-medium">{selectedDetail.produk || selectedDetail.name}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">User:</span>
                                  <p className="font-medium">{selectedDetail.user || selectedDetail.user_name}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Payment:</span>
                                  <p className="font-medium">{selectedDetail.metodeBayar || selectedDetail.payment_method}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">Amount:</span>
                                  <p className="font-medium">{formatCurrency(selectedDetail.totalBayar)}</p>
                                </div>
                              </div>
                            )}

                            {/* No Receipt Message */}
                            {selectedDetail && !selectedDetail.receiptExists && (
                              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 text-center">
                                <FileText className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                                <p className="text-amber-700 font-medium">No Receipt Available</p>
                                <p className="text-sm text-amber-600">This transaction doesn't have account details</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              {(!recentTransactions?.transactions || recentTransactions.transactions.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
    </PageContainer>
  );
}