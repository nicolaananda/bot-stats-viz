import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Download, CreditCard, Filter, Eye, FileText, User, Smartphone, Copy, Check } from 'lucide-react';
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
import { StatsCard } from '@/components/ui/stats-card';
import { dashboardApi } from '@/services/api';
import { formatCurrency, getTransactionUserName, getTransactionPaymentMethod, getPaymentMethodBadge, getTransactionReferenceId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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

  const { data: recentTransactions, isLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(50),
  });

  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });

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
        } catch (_) {}

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
            Transactions
          </h2>
          <p className="text-slate-500">
            Search transactions, view details, and export data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Transactions"
          value={overview?.totalTransaksi || 0}
          icon={CreditCard}
          className="hover:scale-105 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(overview?.totalPendapatan || 0)}
          icon={CreditCard}
          className="hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        />
        <StatsCard
          title="Today's Transactions"
          value={overview?.transaksiHariIni || 0}
          change={`${formatCurrency(overview?.pendapatanHariIni || 0)} revenue`}
          changeType="positive"
          icon={CreditCard}
          className="hover:scale-105 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
        />
        <StatsCard
          title="Payment Methods"
          value={`${overview?.metodeBayar?.saldo || 0} + ${overview?.metodeBayar?.qris || 0}`}
          change="Active methods"
          changeType="neutral"
          icon={CreditCard}
          className="hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
        />
      </div>

      {/* Unified Live Search */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm border border-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <Search className="h-5 w-5 text-slate-500" />
            Live Search
          </CardTitle>
          <CardDescription className="text-slate-500">
            Search by reference ID, user name, product name, or payment method - results appear as you type
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Type reference ID (e.g., REF123456), user name, product, or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                </div>
              )}
            </div>

            {/* Do not render results list here to avoid stacking with the table */}

            {/* No Results Message */}
            {searchTerm.trim() && searchResults && searchResults.length === 0 && !isSearching && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <Search className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600">No results found for "{searchTerm}"</p>
                <p className="text-sm text-slate-500">Try a different search term</p>
              </div>
            )}

            {/* Search Tips */}
            {!searchTerm.trim() && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
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
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm border border-slate-100">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
            <CardTitle className="text-slate-700">Recent Transactions</CardTitle>
            <CardDescription className="text-slate-500">
              Latest {recentTransactions?.limit || 0} transactions from your WhatsApp bot
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Live Search for Recent Transactions
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transactions by reference ID, user, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                💡 Live search: Type to filter transactions instantly
              </p>
            </div> */}

            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-slate-50">
                  <TableHead className="text-slate-600 font-medium">Reference ID</TableHead>
                  <TableHead className="text-slate-600 font-medium">Product</TableHead>
                  <TableHead className="text-slate-600 font-medium">User</TableHead>
                  <TableHead className="text-slate-600 font-medium">Payment Method</TableHead>
                  <TableHead className="text-slate-600 font-medium">Amount</TableHead>
                  <TableHead className="text-slate-600 font-medium">Date</TableHead>
                  <TableHead className="text-slate-600 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions?.transactions
                  .filter((transaction) => {
                    if (!searchTerm.trim()) return true;
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      getTransactionReferenceId(transaction).toLowerCase().includes(searchLower) ||
                      getTransactionUserName(transaction).toLowerCase().includes(searchLower) ||
                      transaction.name.toLowerCase().includes(searchLower) ||
                      getTransactionPaymentMethod(transaction).toLowerCase().includes(searchLower)
                    );
                  })
                  .map((transaction) => (
                    <TableRow key={getTransactionReferenceId(transaction)} className="hover:bg-slate-50 border-slate-100">
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                          {getTransactionReferenceId(transaction)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-700">{transaction.name}</p>
                          <p className="text-sm text-slate-500">
                            Qty: {transaction.jumlah} • {formatCurrency(transaction.price)} each
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-700">{getTransactionUserName(transaction)}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentMethodBadge(getTransactionPaymentMethod(transaction))}>
                          {getTransactionPaymentMethod(transaction)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-700">{formatCurrency(transaction.totalBayar)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-500">{transaction.date}</p>
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
                          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            
            {/* Show message when no transactions match search */}
            {recentTransactions?.transactions && 
             recentTransactions.transactions.filter((transaction) => {
               if (!searchTerm.trim()) return true;
               const searchLower = searchTerm.toLowerCase();
               return (
                 getTransactionReferenceId(transaction).toLowerCase().includes(searchLower) ||
                 getTransactionUserName(transaction).toLowerCase().includes(searchLower) ||
                 transaction.name.toLowerCase().includes(searchLower) ||
                 getTransactionPaymentMethod(transaction).toLowerCase().includes(searchLower)
               );
             }).length === 0 && searchTerm.trim() && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600">No transactions match "{searchTerm}"</p>
                <p className="text-sm text-slate-500">Try a different search term</p>
              </div>
            )}
            
            {/* Show message when no transactions at all */}
            {(!recentTransactions?.transactions || recentTransactions.transactions.length === 0) && !searchTerm.trim() && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-600">No transactions found</p>
                <p className="text-slate-500">Transactions will appear here once available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail View - shown after clicking a transaction */}
      {isDetailOpen && selectedDetail && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm border border-slate-100 mt-4">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700">Transaction Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSearchResults}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕ Close
              </Button>
            </div>
            <CardDescription className="text-slate-500">
              Reference: {selectedDetail.reffId || getTransactionReferenceId(selectedDetail)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-500">User</p>
                <p className="font-medium text-slate-700">{getTransactionUserName(selectedDetail)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Product</p>
                <p className="font-medium text-slate-700">{selectedDetail.produk || selectedDetail.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Amount</p>
                <p className="font-medium text-slate-700">{formatCurrency(selectedDetail.totalBayar)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Payment Method</p>
                <Badge variant={getPaymentMethodBadge(selectedDetail.metodeBayar)}>
                  {getTransactionPaymentMethod(selectedDetail)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-medium text-slate-700">{selectedDetail.tanggal || selectedDetail.date}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Profit</p>
                <p className="font-medium text-emerald-600">{formatCurrency(selectedDetail.profit || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">User Role</p>
                <Badge variant="outline" className="border-slate-200 text-slate-600">
                  {(selectedDetail.userRole || 'USER').toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Details from Receipt - shown when detail is open */}
      {isDetailOpen && selectedDetail && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm border border-slate-100 mt-4">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Account Details
              </CardTitle>
              <div className="flex items-center gap-2">
                {selectedDetail.receiptExists && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReceipt(selectedDetail.reffId || getTransactionReferenceId(selectedDetail))}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
                <Badge variant="outline" className="border-blue-200 text-blue-600">
                  {selectedDetail.receiptExists ? 'Receipt Available' : 'No Receipt'}
                </Badge>
              </div>
            </div>
            <CardDescription className="text-slate-500">
              Account information from transaction receipt
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingReceipt ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-slate-600">Loading account details...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDetail.receiptExists && receiptContent ? (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-700">Receipt Content</h4>
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
                                Copy All
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="bg-white rounded border border-slate-200 p-3">
                          <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                            {receiptContent}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : !selectedDetail.receiptExists ? (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-700 mb-1">No Receipt Available</h4>
                        <p className="text-sm text-amber-700">
                          This transaction was processed before the receipt system was implemented, or the receipt was not generated.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                {/* Show account information from transaction data if available */}
                {selectedDetail && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-medium text-slate-700">Transaction Account Info</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Product:</span>
                          <span className="font-medium text-slate-700">{selectedDetail.produk || selectedDetail.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">User ID:</span>
                          <span className="font-medium text-slate-700">{selectedDetail.user || selectedDetail.user_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Payment Method:</span>
                          <span className="font-medium text-slate-700">{selectedDetail.metodeBayar || selectedDetail.payment_method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">User Role:</span>
                          <span className="font-medium text-slate-700 capitalize">{selectedDetail.userRole || 'bronze'}</span>
                        </div>
                        {selectedDetail.deliveredAccount && (
                          <div className="mt-3 p-2 bg-white rounded border border-emerald-200">
                            <span className="text-slate-600 text-xs">Delivered Account:</span>
                            <p className="font-mono text-xs text-slate-700 mt-1">{selectedDetail.deliveredAccount}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-amber-600" />
                        <h4 className="font-medium text-slate-700">Receipt Status</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {selectedDetail.receiptExists ? (
                          <div className="text-emerald-700">
                            <p className="font-medium">✅ Receipt Available</p>
                            <p className="text-xs mt-1">
                              Receipt content is displayed above with account details and transaction information.
                            </p>
                          </div>
                        ) : (
                          <div className="text-amber-700">
                            <p className="font-medium">⚠️ Receipt Not Available</p>
                            <p className="text-xs mt-1">
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
      )}
    </div>
  );
}