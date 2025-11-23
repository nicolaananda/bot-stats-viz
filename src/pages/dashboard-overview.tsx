import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, CreditCard, DollarSign, Activity, Eye, FileText, User, Smartphone, Copy, Check, Download, Monitor, RotateCcw, Clock, Filter, ChevronDown, ArrowUpRight, ArrowDownRight, Wallet, MoreHorizontal } from 'lucide-react';
import { OverviewChart } from '@/components/charts/overview-chart';
import { AIPredictionsCard } from '@/components/dashboard/ai-predictions-card';
import { AIInsightsCharts } from '@/components/dashboard/ai-insights-charts';
import { EnvironmentBanner } from '@/components/ui/environment-banner';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, formatTime, getTransactionUserName, getTransactionPaymentMethod, getTransactionReferenceId } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from '@/lib/utils';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-destructive/5 rounded-2xl border border-destructive/20">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-bold text-destructive mb-2">Failed to load data</h3>
          <p className="text-sm text-muted-foreground mb-4">Please check your connection and try again.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Use real data from API
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
    ? `${Math.abs(revenuePct).toFixed(1)}%`
    : 'N/A';
  const revenueChangeType: 'positive' | 'negative' | 'neutral' = yesterdayRevenue === 0
    ? 'neutral'
    : (revenuePct >= 0 ? 'positive' : 'negative');

  // Calculate today's vs yesterday's transactions percentage change
  const todayTransactions = chartData.length > 0 ? chartData[chartData.length - 1].transactions : 0;
  const yesterdayTransactions = chartData.length > 1 ? chartData[chartData.length - 2].transactions : 0;
  const trxDelta = todayTransactions - yesterdayTransactions;
  const trxPct = yesterdayTransactions > 0 ? (trxDelta / yesterdayTransactions) * 100 : 0;
  const trxChangeLabel = yesterdayTransactions > 0
    ? `${Math.abs(trxPct).toFixed(1)}%`
    : 'N/A';
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

  // Prepare traffic data from real chart data
  const trafficData = chartData.slice(-7).map((item, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || `Day ${index + 1}`,
    hits: item.revenue,
    unique: item.transactions,
  }));

  // Sample realtime data (you can replace this with real-time API data)
  const realtimeActivityData = [
    { time: '12:00', users: Math.floor(Math.random() * 50) + 20 },
    { time: '12:05', users: Math.floor(Math.random() * 50) + 20 },
    { time: '12:10', users: Math.floor(Math.random() * 50) + 20 },
    { time: '12:15', users: Math.floor(Math.random() * 50) + 20 },
    { time: '12:20', users: Math.floor(Math.random() * 50) + 20 },
    { time: '12:25', users: Math.floor(Math.random() * 50) + 20 },
    { time: '12:30', users: Math.floor(Math.random() * 50) + 20 },
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your business performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-background shadow-sm hover:bg-secondary/50">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(overview?.totalPendapatan || 0)}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-500 font-medium flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{overview?.totalTransaksi || 0}</h3>
              </div>
              <div className="p-3 bg-accent/10 rounded-xl">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-500 font-medium flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </span>
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(overview?.pendapatanHariIni || 0)}</h3>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Wallet className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={cn(
                "font-medium flex items-center px-2 py-0.5 rounded-full",
                revenueChangeType === 'positive' ? "text-emerald-500 bg-emerald-500/10" :
                  revenueChangeType === 'negative' ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground bg-secondary"
              )}>
                {revenueChangeType === 'positive' ? <ArrowUpRight className="h-3 w-3 mr-1" /> :
                  revenueChangeType === 'negative' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                {revenueChangeLabel}
              </span>
              <span className="text-muted-foreground ml-2">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Transactions</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{overview?.transaksiHariIni ?? todayTransactions ?? 0}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={cn(
                "font-medium flex items-center px-2 py-0.5 rounded-full",
                trxChangeType === 'positive' ? "text-emerald-500 bg-emerald-500/10" :
                  trxChangeType === 'negative' ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground bg-secondary"
              )}>
                {trxChangeType === 'positive' ? <ArrowUpRight className="h-3 w-3 mr-1" /> :
                  trxChangeType === 'negative' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                {trxChangeLabel}
              </span>
              <span className="text-muted-foreground ml-2">vs yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <div className="space-y-6">
        <AIPredictionsCard />
        <AIInsightsCharts />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Revenue Trends Chart */}
        <Card className="md:col-span-4 lg:col-span-5 card-premium border-none shadow-soft">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Daily revenue performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <OverviewChart
                data={chartDataWithForecast}
                title=""
                description=""
                showMovingAverage
                showForecast
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="md:col-span-3 lg:col-span-2 card-premium border-none shadow-soft">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">QRIS</p>
                    <p className="text-xs text-muted-foreground">Instant Payment</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {overview?.metodeBayar?.qris || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium">Saldo</p>
                    <p className="text-xs text-muted-foreground">Balance</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {overview?.metodeBayar?.saldo || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">Others</p>
                    <p className="text-xs text-muted-foreground">Alternative</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-bold">
                  {overview?.metodeBayar?.unknown || 0}
                </Badge>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Transactions</span>
                <span className="font-bold">{overview?.totalTransaksi || 0}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden flex">
                <div className="bg-blue-500 h-full" style={{ width: '45%' }}></div>
                <div className="bg-emerald-500 h-full" style={{ width: '35%' }}></div>
                <div className="bg-gray-400 h-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="card-premium border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest activity from your bot</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions?.transactions.map((transaction) => (
                <div key={getTransactionReferenceId(transaction)} className="group flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-all duration-200 border border-transparent hover:border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTransactionUserName(transaction)} • {formatTime(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatCurrency(transaction.totalBayar)}</p>
                      <p className="text-xs text-muted-foreground">{getTransactionPaymentMethod(transaction)}</p>
                    </div>
                    <Dialog onOpenChange={(open) => !open && resetDetailView()}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fetchTransactionWithReceipt(getTransactionReferenceId(transaction))}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full hover:bg-background shadow-sm"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="max-w-2xl backdrop-blur-xl bg-card/90 border-border/50 shadow-2xl rounded-2xl"
                      >
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-foreground">
                            <FileText className="h-5 w-5 text-primary" />
                            Transaction Details
                          </DialogTitle>
                          <DialogDescription>
                            Reference ID: <span className="font-mono text-xs bg-secondary px-1 py-0.5 rounded">{getTransactionReferenceId(transaction)}</span>
                          </DialogDescription>
                        </DialogHeader>

                        {isLoadingReceipt ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"></div>
                            <p className="text-muted-foreground">Retrieving details...</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Simple Transaction Info */}
                            {selectedDetail && (
                              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl border border-border/50">
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Product</span>
                                  <p className="font-medium text-foreground mt-1">{selectedDetail.produk || selectedDetail.name}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase tracking-wider">User</span>
                                  <p className="font-medium text-foreground mt-1">{selectedDetail.user || selectedDetail.user_name}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Payment</span>
                                  <p className="font-medium text-foreground mt-1">{selectedDetail.metodeBayar || selectedDetail.payment_method}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Amount</span>
                                  <p className="font-bold text-primary mt-1">{formatCurrency(selectedDetail.totalBayar)}</p>
                                </div>
                              </div>
                            )}

                            {/* Receipt Content */}
                            {selectedDetail?.receiptExists && receiptContent && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <Smartphone className="h-4 w-4 text-primary" />
                                    Digital Receipt
                                  </h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyReceiptContent}
                                    className="h-8"
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check className="h-3.5 w-3.5 mr-1.5" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                                        Copy
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <div className="bg-card rounded-xl border border-border shadow-inner p-4 max-h-60 overflow-y-auto">
                                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                                    {receiptContent}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* No Receipt Message */}
                            {selectedDetail && !selectedDetail.receiptExists && (
                              <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/20 text-center">
                                <FileText className="h-10 w-10 text-orange-500 mx-auto mb-3" />
                                <p className="text-orange-700 dark:text-orange-400 font-medium">No Receipt Available</p>
                                <p className="text-sm text-muted-foreground mt-1">This transaction doesn't have additional account details.</p>
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
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}