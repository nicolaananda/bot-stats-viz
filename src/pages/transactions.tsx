import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Download, CreditCard, Filter, Eye, FileText, User, Smartphone, Copy, Check, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dashboardApi } from '@/services/api';
import { formatCurrency, getTransactionUserName, getTransactionPaymentMethod, getPaymentMethodBadge, getTransactionReferenceId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [receiptContent, setReceiptContent] = useState<string | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: recentTransactions, isLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(1000),
  });

  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });
  const ov: any = overview as any;

  // Debounced combined search (ref ID via API + user/product/payment via local filter)
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults(null);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const aggregatedResults: any[] = [];
        const seenRefIds = new Set<string>();

        // Try exact reference ID via API (ignore error if not found)
        try {
          const byRef = await dashboardApi.searchTransaction(term.trim());
          if (byRef) {
            const refId = (byRef.reffId || getTransactionReferenceId(byRef)) as string;
            if (refId && !seenRefIds.has(refId)) {
              aggregatedResults.push(byRef);
              seenRefIds.add(refId);
            }
          }
        } catch (_) { }

        // Local filter on recent transactions for partial matches (ref id, user, name, payment)
        const localMatches = recentTransactions?.transactions?.filter((t: any) => {
          const termLower = term.toLowerCase();
          return (
            getTransactionReferenceId(t).toLowerCase().includes(termLower) ||
            getTransactionUserName(t).toLowerCase().includes(termLower) ||
            t.name.toLowerCase().includes(termLower) ||
            getTransactionPaymentMethod(t).toLowerCase().includes(termLower)
          );
        }) || [];

        for (const t of localMatches) {
          const refId = getTransactionReferenceId(t);
          if (refId && !seenRefIds.has(refId)) {
            aggregatedResults.push(t);
            seenRefIds.add(refId);
          }
        }

        setSearchResults(aggregatedResults);
        // Do not show results list in the live search card to avoid stacking with the table
        setShowSearchResults(false);
      } catch (error) {
        setSearchResults(null);
        setShowSearchResults(false);
      }
      setIsSearching(false);
    }, 300),
    [recentTransactions]
  );

  // Close search results and show recent transactions
  const closeSearchResults = () => {
    setShowSearchResults(false);
    setIsDetailOpen(false);
    setSelectedDetail(null);
    setReceiptContent(null);
    setSearchResults(null);
    setSearchTerm('');
  };

  // Fetch transaction with receipt content (updated approach)
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
    } catch (error: any) {
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

  // Live search effect
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const handleExport = async (format: string) => {
    try {
      const result = await dashboardApi.exportData(format);
      toast({
        title: "Export Successful",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading transactions...</p>
        </div>
      </div>
    );
  }

  // Filter transactions based on search
  const filteredTransactions = recentTransactions?.transactions?.filter((transaction: any) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      getTransactionReferenceId(transaction).toLowerCase().includes(searchLower) ||
      getTransactionUserName(transaction).toLowerCase().includes(searchLower) ||
      transaction.name.toLowerCase().includes(searchLower) ||
      getTransactionPaymentMethod(transaction).toLowerCase().includes(searchLower)
    );
  }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">Search transactions, view details, and export data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            className="bg-background/50 backdrop-blur-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            className="bg-background/50 backdrop-blur-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{ov?.totalTransaksi || 0}</h3>
                <div className="flex items-center mt-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12.5% vs last month
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(ov?.totalPendapatan || 0)}</h3>
                <div className="flex items-center mt-1 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8.2% vs last month
                </div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <CreditCard className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Transactions</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{ov?.transaksiHariIni || 0}</h3>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(ov?.pendapatanHariIni || 0)} revenue</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Methods</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{`${ov?.metodeBayar?.saldo || 0} + ${ov?.metodeBayar?.qris || 0}`}</h3>
                <p className="text-xs text-muted-foreground mt-1">Active methods</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <CreditCard className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Live Search */}
      <Card className="card-premium border-none shadow-soft overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Live Search
          </CardTitle>
          <CardDescription>
            Search by reference ID, user name, product name, or payment method - results appear as you type
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type reference ID (e.g., REF123456), user name, product, or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            {/* No Results Message */}
            {searchTerm.trim() && searchResults && searchResults.length === 0 && !isSearching && (
              <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
                <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-foreground font-medium">No results found for "{searchTerm}"</p>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </div>
            )}

            {/* Search Tips */}
            {!searchTerm.trim() && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  💡 <strong>Live Search Tips:</strong> Start typing to search instantly.
                  Search by transaction reference ID, user name, product, or payment method.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions Table - Hidden only when a detail is opened */}
      {!isDetailOpen && (
        <Card className="card-premium border-none shadow-soft overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </CardDescription>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                &lt;
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 w-8 p-0"
              >
                &gt;
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.map((transaction: any) => (
                  <TableRow key={getTransactionReferenceId(transaction)} className="hover:bg-muted/30 border-border/50 transition-colors">
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground border border-border">
                        {getTransactionReferenceId(transaction)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{transaction.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {transaction.jumlah} • {formatCurrency(transaction.price)} each
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {getTransactionUserName(transaction).charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-foreground">{getTransactionUserName(transaction)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentMethodBadge(getTransactionPaymentMethod(transaction))} className="capitalize">
                        {getTransactionPaymentMethod(transaction)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{formatCurrency(transaction.totalBayar)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {transaction.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm(getTransactionReferenceId(transaction));
                          // Use the recommended endpoint to fetch transaction with receipt
                          (async () => {
                            await fetchTransactionWithReceipt(getTransactionReferenceId(transaction));
                            setIsDetailOpen(true);
                          })();
                        }}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Show message when no transactions match search */}
            {filteredTransactions.length === 0 && searchTerm.trim() && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-foreground">No transactions match "{searchTerm}"</p>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </div>
            )}

            {/* Show message when no transactions at all */}
            {(!recentTransactions?.transactions || recentTransactions.transactions.length === 0) && !searchTerm.trim() && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">No transactions found</p>
                <p className="text-muted-foreground">Transactions will appear here once available</p>
              </div>
            )}
          </CardContent>
          {/* Footer Pagination */}
          <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="hidden sm:flex"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show window of pages around current page
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                    }
                    if (pageNum > totalPages) {
                      pageNum = totalPages - (4 - i);
                    }
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="hidden sm:flex"
              >
                Last
              </Button>
            </div>
          </div>
        </Card>
      )
      }

      {/* Detail View - shown after clicking a transaction */}
      {
        isDetailOpen && selectedDetail && (
          <Card className="card-premium border-none shadow-soft mt-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
            <CardHeader className="bg-muted/50 border-b border-border/50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Transaction Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeSearchResults}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  ✕ Close
                </Button>
              </div>
              <CardDescription>
                Reference: <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded border border-border ml-1">{selectedDetail.reffId || getTransactionReferenceId(selectedDetail)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {getTransactionUserName(selectedDetail).charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium text-foreground">{getTransactionUserName(selectedDetail)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</p>
                  <p className="font-medium text-foreground">{selectedDetail.produk || selectedDetail.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</p>
                  <p className="font-bold text-xl text-foreground">{formatCurrency(selectedDetail.totalBayar)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Method</p>
                  <Badge variant={getPaymentMethodBadge(selectedDetail.metodeBayar)} className="capitalize">
                    {getTransactionPaymentMethod(selectedDetail)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</p>
                  <div className="flex items-center gap-1 font-medium text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {selectedDetail.tanggal || selectedDetail.date}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profit</p>
                  <p className="font-medium text-emerald-500">{formatCurrency(selectedDetail.profit || 0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User Role</p>
                  <Badge variant="outline" className="capitalize">
                    {(selectedDetail.userRole || 'USER').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Account Details from Receipt - shown when detail is open */}
      {
        isDetailOpen && selectedDetail && (
          <Card className="card-premium border-none shadow-soft mt-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-300 delay-100">
            <CardHeader className="bg-blue-500/5 border-b border-blue-500/10 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Smartphone className="h-5 w-5" />
                  Account Details
                </CardTitle>
                <div className="flex items-center gap-2">
                  {selectedDetail.receiptExists && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReceipt(selectedDetail.reffId || getTransactionReferenceId(selectedDetail))}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                  <Badge variant="outline" className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">
                    {selectedDetail.receiptExists ? 'Receipt Available' : 'No Receipt'}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Account information from transaction receipt
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingReceipt ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                  <p className="text-muted-foreground">Loading account details...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDetail.receiptExists && receiptContent ? (
                    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-500/10 p-2.5 rounded-xl shrink-0">
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-foreground">Receipt Content</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copyReceiptContent}
                              className="h-8"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="h-3.5 w-3.5 mr-1.5" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                                  Copy All
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="bg-background rounded-lg border border-border p-4 shadow-sm overflow-x-auto">
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                              {receiptContent}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : !selectedDetail.receiptExists ? (
                    <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-500/20 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-1">No Receipt Available</h4>
                          <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                            This transaction was processed before the receipt system was implemented, or the receipt was not generated.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Show account information from transaction data if available */}
                  {selectedDetail && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="font-medium text-emerald-700 dark:text-emerald-400">Transaction Account Info</h4>
                        </div>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                            <span className="text-muted-foreground">Product:</span>
                            <span className="font-medium text-foreground">{selectedDetail.produk || selectedDetail.name}</span>
                          </div>
                          <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                            <span className="text-muted-foreground">User ID:</span>
                            <span className="font-medium text-foreground">{selectedDetail.user || selectedDetail.user_name}</span>
                          </div>
                          <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                            <span className="text-muted-foreground">Payment Method:</span>
                            <span className="font-medium text-foreground">{selectedDetail.metodeBayar || selectedDetail.payment_method}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">User Role:</span>
                            <span className="font-medium text-foreground capitalize">{selectedDetail.userRole || 'bronze'}</span>
                          </div>
                          {selectedDetail.deliveredAccount && (
                            <div className="mt-3 p-3 bg-background rounded-lg border border-emerald-500/20 shadow-sm">
                              <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Delivered Account:</span>
                              <p className="font-mono text-sm text-foreground mt-1 break-all">{selectedDetail.deliveredAccount}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <h4 className="font-medium text-amber-700 dark:text-amber-400">Receipt Status</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          {selectedDetail.receiptExists ? (
                            <div className="text-emerald-600 dark:text-emerald-400">
                              <p className="font-medium flex items-center gap-1">
                                <Check className="h-4 w-4" /> Receipt Available
                              </p>
                              <p className="text-xs mt-1 text-muted-foreground">
                                Receipt content is displayed above with account details and transaction information.
                              </p>
                            </div>
                          ) : (
                            <div className="text-amber-600 dark:text-amber-400">
                              <p className="font-medium flex items-center gap-1">
                                <Smartphone className="h-4 w-4" /> Receipt Not Available
                              </p>
                              <p className="text-xs mt-1 text-muted-foreground">
                                This transaction may not have generated a receipt yet, or the receipt system was not active at the time of purchase.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      }
    </div >
  );
}