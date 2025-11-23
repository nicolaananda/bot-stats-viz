import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CreditCard, DollarSign, User, Phone, Shield, TrendingUp, Activity, Eye, Calendar, Wallet } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getTransactionUserName, getTransactionPaymentMethod, getPaymentMethodBadge, getTransactionReferenceId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { UserSpendingChart } from '@/components/users/user-spending-chart';
import { UserFavoriteProducts } from '@/components/users/user-favorite-products';

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: userTransactions, isLoading, error } = useQuery({
    queryKey: ['user-transactions', userId],
    queryFn: () => dashboardApi.getUserTransactions(userId!),
  });

  const { data: userActivity, refetch: refetchUserActivity, isFetching: isFetchingUserActivity } = useQuery({
    queryKey: ['user-activity'],
    queryFn: dashboardApi.getEnhancedUserActivity,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: 30000,
  });

  // Helper functions for consistent formatting
  const formatDisplayUsername = (rawUsername: string, rawUserId: string) => {
    if (rawUsername?.startsWith('User ') && rawUsername.includes('@s.whatsapp.net')) {
      const phoneNumber = rawUsername.replace('User ', '').replace('@s.whatsapp.net', '');
      return phoneNumber;
    }
    if (rawUsername?.includes('@s.whatsapp.net')) {
      return rawUsername.replace('@s.whatsapp.net', '');
    }
    if (rawUsername && /^\d+$/.test(rawUsername)) {
      return rawUsername;
    }
    return rawUsername || 'Unknown User';
  };

  const formatDisplayUserId = (rawUserId: string) => {
    if (rawUserId?.includes('@s.whatsapp.net')) {
      return rawUserId;
    }
    if (rawUserId && /^\d+$/.test(rawUserId)) {
      return `${rawUserId}@s.whatsapp.net`;
    }
    return rawUserId || 'Unknown ID';
  };

  const fallbackUser = userTransactions ? {
    userId: userId || 'unknown',
    username: userTransactions.user || `User ${userId}`,
    transactionCount: userTransactions.totalTransaksi || 0,
    totalSpent: userTransactions.totalSpent || 0,
    lastActivity: null,
    role: 'bronze',
    saldo: (userTransactions as any)?.currentSaldo ?? 0
  } : null;

  const currentUser = userActivity?.userActivity?.find(user => {
    if (user.userId === userId) return true;
    const userPhoneNumber = user.userId?.replace('@s.whatsapp.net', '');
    if (userPhoneNumber === userId) return true;
    const userIdWithWhatsApp = userId?.includes('@s.whatsapp.net') ? userId : `${userId}@s.whatsapp.net`;
    if (user.userId === userIdWithWhatsApp) return true;
    const extractedPhone = user.userId?.match(/\d+/)?.[0];
    if (extractedPhone === userId) return true;
    return false;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || (!currentUser && !fallbackUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-destructive/5 rounded-2xl border border-destructive/20">
          <h3 className="text-lg font-bold text-destructive mb-2">Failed to load user details</h3>
          <p className="text-sm text-muted-foreground mb-4">
            User ID: {userId}<br />
            Error: {error?.message || 'User not found'}
          </p>
          <Button onClick={() => navigate('/users')} variant="outline">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const displayUser = currentUser || fallbackUser;
  const formattedUsername = formatDisplayUsername(displayUser.username, displayUser.userId);
  const formattedUserId = formatDisplayUserId(displayUser.userId);

  const effectiveBalance: number | null = (
    (userTransactions as any)?.currentSaldo ??
    (currentUser as any)?.saldo ??
    (displayUser as any)?.saldo ??
    null
  );

  const effectiveLastActivityIso: string | null = (() => {
    const fromUser = (displayUser as any)?.lastActivity;
    if (fromUser) {
      const date = new Date(fromUser);
      date.setHours(date.getHours() - 7);
      return date.toISOString();
    }
    const dates = (userTransactions?.transaksi || [])
      .map((t: any) => (t.date ? new Date(t.date).getTime() : NaN))
      .filter((n) => !Number.isNaN(n));
    if (dates.length === 0) return null;
    const maxTs = Math.max(...dates);
    const date = new Date(maxTs);
    date.setHours(date.getHours() - 7);
    return date.toISOString();
  })();

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'gold': return 'default';
      case 'silver': return 'secondary';
      case 'bronze': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleColorClass = (role: string) => {
    switch (role.toLowerCase()) {
      case 'gold': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'silver': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      case 'bronze': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/users')}
              className="h-auto p-0 hover:bg-transparent hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Users
            </Button>
            <span>/</span>
            <span>Details</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={getRoleBadgeVariant(displayUser.role)}
            className={cn("px-4 py-1.5 text-sm font-semibold capitalize", getRoleColorClass(displayUser.role))}
          >
            {displayUser.role} Member
          </Badge>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="card-premium border-none shadow-soft overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-background"></div>
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 mb-6 px-2">
            <div className="w-24 h-24 rounded-2xl bg-background p-1 shadow-xl">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                {formattedUsername?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-foreground">{formattedUsername}</h2>
              <p className="text-muted-foreground font-mono text-sm flex items-center gap-2">
                {formattedUserId}
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-muted/50">ID</Badge>
              </p>
            </div>
            <div className="flex gap-2">
              {/* Actions if needed */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/50 transition-colors">
              <div className="p-2.5 bg-blue-500/10 rounded-full">
                <CreditCard className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userTransactions?.totalTransaksi || userTransactions?.transaksi?.length || displayUser.transactionCount || 0}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Transactions</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/50 transition-colors">
              <div className="p-2.5 bg-emerald-500/10 rounded-full">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(userTransactions?.totalSpent || displayUser.totalSpent || 0)}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Spent</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/50 transition-colors">
              <div className="p-2.5 bg-cyan-500/10 rounded-full">
                <Wallet className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {effectiveBalance != null ? formatCurrency(effectiveBalance) : '—'}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Balance</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/50 transition-colors">
              <div className="p-2.5 bg-purple-500/10 rounded-full">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {effectiveLastActivityIso ? new Date(effectiveLastActivityIso).toLocaleDateString('id-ID') : '—'}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last Activity</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <UserSpendingChart transactions={userTransactions?.transaksi || []} />
        <UserFavoriteProducts transactions={userTransactions?.transaksi || []} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Info & Stats */}
        <div className="space-y-6">
          <Card className="card-premium border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-muted rounded-md">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">Phone Number</span>
                </div>
                <span className="text-sm text-muted-foreground font-mono">{formattedUserId.split('@')[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-muted rounded-md">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">Member Since</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {effectiveLastActivityIso ? new Date(effectiveLastActivityIso).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-muted rounded-md">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium">Avg. Transaction</span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency((userTransactions?.totalSpent || displayUser.totalSpent || 0) / Math.max((userTransactions?.transaksi?.length || displayUser.transactionCount || 1), 1))}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium">Frequency</span>
                <span className="text-sm text-muted-foreground">
                  {(userTransactions?.transaksi?.length || displayUser.transactionCount || 0) > 5 ? 'Regular' : 'Occasional'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium">Loyalty Tier</span>
                <span className="text-sm font-medium capitalize text-primary">
                  {displayUser.role}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <div className="md:col-span-2">
          <Card className="card-premium border-none shadow-soft h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                History of purchases and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {(userTransactions?.transaksi && userTransactions.transaksi.length > 0) || (currentUser?.transactionCount > 0) ? (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead>Reference ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTransactions?.transaksi && userTransactions.transaksi.length > 0 ? (
                      userTransactions.transaksi.map((transaction, index) => (
                        <TableRow key={`real-transaction-${index}`} className="hover:bg-muted/30 border-border/50 transition-colors">
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border w-fit">
                                {getTransactionReferenceId(transaction)}
                              </code>
                              <Badge variant={getPaymentMethodBadge(getTransactionPaymentMethod(transaction))} className="w-fit text-[10px] px-1.5 py-0 h-5">
                                {getTransactionPaymentMethod(transaction)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground text-sm">{transaction.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {transaction.jumlah}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-foreground text-sm">{formatCurrency(transaction.totalBayar)}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm text-foreground">
                                {formatDate((() => {
                                  const date = new Date(transaction.date);
                                  date.setHours(date.getHours() - 7);
                                  return date.toISOString();
                                })(), 'short')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime((() => {
                                  const date = new Date(transaction.date);
                                  date.setHours(date.getHours() - 7);
                                  return date.toISOString();
                                })())}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/transactions?search=${encodeURIComponent(getTransactionReferenceId(transaction))}`)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      // Enhanced data fallback
                      Array.from({ length: Math.min(5, currentUser.transactionCount) }, (_, index) => (
                        <TableRow key={`enhanced-transaction-${index}`} className="hover:bg-muted/30 border-border/50">
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                              {`REF-${currentUser.userId?.replace('@s.whatsapp.net', '')}-${String(index + 1).padStart(3, '0')}`}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground italic">Archived Transaction</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-foreground">
                              {formatCurrency(Math.floor(currentUser.totalSpent / currentUser.transactionCount))}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">Unknown Date</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="text-[10px]">Archived</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">No transactions found</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                    This user hasn't made any transactions yet. Once they do, they will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}