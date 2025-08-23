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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

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

  const getPaymentMethodBadge = (method: string) => {
    const colors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      'DANA': 'default',
      'OVO': 'secondary',
      'GOPAY': 'outline',
      'QRIS': 'destructive',
    };
    return colors[method] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Transactions
          </h2>
          <p className="text-muted-foreground">
            Search transactions, view details, and export data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            className="flex items-center gap-2"
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
          value={overview?.totalTransactions || 0}
          icon={CreditCard}
          className="hover:scale-105"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(overview?.totalRevenue || 0)}
          icon={CreditCard}
          className="hover:scale-105"
        />
        <StatsCard
          title="Today's Transactions"
          value={overview?.quickStats.todayTransactions || 0}
          change={`${formatCurrency(overview?.quickStats.todayRevenue || 0)} revenue`}
          changeType="positive"
          icon={CreditCard}
          className="hover:scale-105"
        />
        <StatsCard
          title="Total Profit"
          value={formatCurrency(overview?.totalProfit || 0)}
          icon={CreditCard}
          className="hover:scale-105"
        />
      </div>

      {/* Search by Reference ID */}
      <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Transaction
          </CardTitle>
          <CardDescription>
            Enter a reference ID to search for specific transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter reference ID (e.g., REF123456)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-gradient-primary hover:opacity-90"
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
            <div className="mt-6 p-4 bg-accent/50 rounded-lg border">
              <h4 className="font-semibold mb-3">Transaction Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference ID</p>
                  <p className="font-medium">{searchResults.reffId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{searchResults.user}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{searchResults.produk}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(searchResults.totalBayar)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <Badge variant={getPaymentMethodBadge(searchResults.metodeBayar)}>
                    {searchResults.metodeBayar}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{searchResults.tanggal}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profit</p>
                  <p className="font-medium text-success">{formatCurrency(searchResults.profit)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User Role</p>
                  <Badge variant="outline">
                    {searchResults.userRole.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest {recentTransactions?.limit || 0} transactions from your WhatsApp bot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {recentTransactions?.transactions.map((transaction) => (
                <TableRow key={transaction.reffId} className="hover:bg-accent/50">
                  <TableCell>
                    <code className="text-xs bg-accent/50 px-2 py-1 rounded">
                      {transaction.reffId}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {transaction.jumlah} • {formatCurrency(transaction.price)} each
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{transaction.user}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentMethodBadge(transaction.metodeBayar)}>
                      {transaction.metodeBayar}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatCurrency(transaction.totalBayar)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{transaction.date}</p>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm(transaction.reffId);
                        handleSearch();
                      }}
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
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-muted-foreground">Transactions will appear here once available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}