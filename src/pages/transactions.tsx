import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Download, CreditCard, Filter, Eye } from 'lucide-react';
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
  const { toast } = useToast();

  const { data: recentTransactions, isLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => dashboardApi.getRecentTransactions(50),
  });

  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Invalid Search",
        description: "Please enter a reference ID to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const result = await dashboardApi.searchTransaction(searchTerm.trim());
      setSearchResults(result);
      toast({
        title: "Transaction Found",
        description: `Found transaction for reference ID: ${searchTerm}`,
      });
    } catch (error) {
      setSearchResults(null);
      toast({
        title: "Transaction Not Found",
        description: `No transaction found for reference ID: ${searchTerm}`,
        variant: "destructive",
      });
    }
    setIsSearching(false);
  };

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

      {/* Search by Reference ID */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm border border-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <Search className="h-5 w-5 text-slate-500" />
            Search Transaction
          </CardTitle>
          <CardDescription className="text-slate-500">
            Enter a reference ID to search for specific transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter reference ID (e.g., REF123456)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-700 hover:to-slate-600 text-white border-0"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold mb-3 text-slate-700">Transaction Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Reference ID</p>
                  <p className="font-medium text-slate-700">{searchResults.reffId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">User</p>
                  <p className="font-medium text-slate-700">{getTransactionUserName(searchResults)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Product</p>
                  <p className="font-medium text-slate-700">{searchResults.produk}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-medium text-slate-700">{formatCurrency(searchResults.totalBayar)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Payment Method</p>
                  <Badge variant={getPaymentMethodBadge(searchResults.metodeBayar)}>
                    {getTransactionPaymentMethod(searchResults)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium text-slate-700">{searchResults.tanggal}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Profit</p>
                  <p className="font-medium text-emerald-600">{formatCurrency(searchResults.profit)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">User Role</p>
                  <Badge variant="outline" className="border-slate-200 text-slate-600">
                    {searchResults.userRole.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm border border-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
          <CardTitle className="text-slate-700">Recent Transactions</CardTitle>
          <CardDescription className="text-slate-500">
            Latest {recentTransactions?.limit || 0} transactions from your WhatsApp bot
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
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
              {recentTransactions?.transactions.map((transaction) => (
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
                        handleSearch();
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
          
          {(!recentTransactions?.transactions || recentTransactions.transactions.length === 0) && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-600">No transactions found</p>
              <p className="text-slate-500">Transactions will appear here once available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}