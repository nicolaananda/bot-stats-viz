import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CreditCard, DollarSign, User, Phone, Shield, TrendingUp, Activity, Eye } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, getTransactionUserName, getTransactionPaymentMethod, getPaymentMethodBadge, getTransactionReferenceId } from '@/lib/utils';

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
    // If username is just "User" + phone number, format it nicely
    if (rawUsername?.startsWith('User ') && rawUsername.includes('@s.whatsapp.net')) {
      const phoneNumber = rawUsername.replace('User ', '').replace('@s.whatsapp.net', '');
      return phoneNumber;
    }
    // If username is just phone number with @s.whatsapp.net, remove the suffix
    if (rawUsername?.includes('@s.whatsapp.net')) {
      return rawUsername.replace('@s.whatsapp.net', '');
    }
    // If username is just phone number, return as is
    if (rawUsername && /^\d+$/.test(rawUsername)) {
      return rawUsername;
    }
    // Default fallback
    return rawUsername || 'Unknown User';
  };

  const formatDisplayUserId = (rawUserId: string) => {
    // Always show full format with @s.whatsapp.net for consistency
    if (rawUserId?.includes('@s.whatsapp.net')) {
      return rawUserId;
    }
    // If it's just a phone number, append the suffix
    if (rawUserId && /^\d+$/.test(rawUserId)) {
      return `${rawUserId}@s.whatsapp.net`;
    }
    return rawUserId || 'Unknown ID';
  };

  // Create a minimal user object from userTransactions if available
  const fallbackUser = userTransactions ? {
    userId: userId || 'unknown',
    username: userTransactions.user || `User ${userId}`,
    transactionCount: userTransactions.totalTransaksi || 0,
    totalSpent: userTransactions.totalSpent || 0,
    lastActivity: null,
    role: 'bronze', // Default role
    saldo: (userTransactions as any)?.currentSaldo ?? 0
  } : null;

  // Find current user from user activity data with smart ID matching
  const currentUser = userActivity?.userActivity?.find(user => {
    // Try exact match first
    if (user.userId === userId) {
      return true;
    }
    
    // Try matching phone numbers (remove @s.whatsapp.net)
    const userPhoneNumber = user.userId?.replace('@s.whatsapp.net', '');
    if (userPhoneNumber === userId) {
      return true;
    }
    
    // Try matching with @s.whatsapp.net appended
    const userIdWithWhatsApp = userId?.includes('@s.whatsapp.net') ? userId : `${userId}@s.whatsapp.net`;
    if (user.userId === userIdWithWhatsApp) {
      return true;
    }
    
    // Try extracting just the phone number from user ID
    const extractedPhone = user.userId?.match(/\d+/)?.[0];
    if (extractedPhone === userId) {
      return true;
    }
    
    return false;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    if (!fallbackUser) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load user details</p>
            <p className="text-sm text-muted-foreground">
              User ID: {userId}<br/>
              Available users: {userActivity?.userActivity?.length || 0}<br/>
              Error: {error?.message || 'User not found in user activity data'}
            </p>
            <Button onClick={() => navigate('/users')} className="mt-4">
              Back to Users
            </Button>
          </div>
        </div>
      );
    }
  }

  // Use currentUser or fallbackUser
  const displayUser = currentUser || fallbackUser;
  
  // Debug logging for transaction data
  console.log('🔍 User Detail Debug: URL userId:', userId);
  console.log('🔍 User Detail Debug: userTransactions data:', userTransactions);
  console.log('🔍 User Detail Debug: userTransactions?.transaksi?.length:', userTransactions?.transaksi?.length);
  console.log('🔍 User Detail Debug: userTransactions?.totalTransaksi:', userTransactions?.totalTransaksi);
  console.log('🔍 User Detail Debug: userTransactions?.totalSpent:', userTransactions?.totalSpent);
  console.log('🔍 User Detail Debug: displayUser.transactionCount:', displayUser?.transactionCount);
  console.log('🔍 User Detail Debug: displayUser.totalSpent:', displayUser?.totalSpent);
  
  // Format display values consistently
  const formattedUsername = formatDisplayUsername(displayUser.username, displayUser.userId);
  const formattedUserId = formatDisplayUserId(displayUser.userId);
  
  // Derive safe effective values
  const effectiveBalance: number | null = (
    (userTransactions as any)?.currentSaldo ??
    (currentUser as any)?.saldo ??
    (displayUser as any)?.saldo ??
    null
  );
  const effectiveLastActivityIso: string | null = (() => {
    const fromUser = (displayUser as any)?.lastActivity;
    if (fromUser) {
      // Kurangi 7 jam
      const date = new Date(fromUser);
      date.setHours(date.getHours() - 7);
      return date.toISOString();
    }
    const dates = (userTransactions?.transaksi || [])
      .map((t: any) => (t.date ? new Date(t.date).getTime() : NaN))
      .filter((n) => !Number.isNaN(n));
    if (dates.length === 0) return null;
    const maxTs = Math.max(...dates);
    // Kurangi 7 jam
    const date = new Date(maxTs);
    date.setHours(date.getHours() - 7);
    return date.toISOString();
  })();

  // Safety check - if no user data available, show error
  if (!displayUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load user details</p>
          <p className="text-sm text-muted-foreground">
            No user data available<br/>
            User ID: {userId}<br/>
            Available users: {userActivity?.userActivity?.length || 0}
          </p>
          <Button onClick={() => navigate('/users')} className="mt-4">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'gold':
        return 'default';
      case 'silver':
        return 'secondary';
      case 'bronze':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'gold':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'silver':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'bronze':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/users')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
        <div>
          <h1 className="text-2xl font-bold">User Details</h1>
          <p className="text-muted-foreground">
            Comprehensive information about {formattedUsername}
          </p>
        </div>
      </div>

      {/* User Information Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {formattedUsername?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{formattedUsername}</CardTitle>
                <CardDescription className="text-lg">User ID: {formattedUserId}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={getRoleBadgeVariant(displayUser.role)}
                className={`px-4 py-2 text-sm font-semibold ${getRoleColor(displayUser.role)}`}
              >
                {displayUser.role.toUpperCase()} MEMBER
              </Badge>
              {/* <Button variant="outline" size="sm" onClick={() => refetchUserActivity()} disabled={isFetchingUserActivity}>
                {isFetchingUserActivity ? 'Refreshing…' : 'Refresh Balance'}
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/20 dark:border-slate-700/20">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {userTransactions?.totalTransaksi || userTransactions?.transaksi?.length || displayUser.transactionCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/20 dark:border-slate-700/20">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(userTransactions?.totalSpent || displayUser.totalSpent || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/20 dark:border-slate-700/20">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-cyan-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{effectiveBalance != null ? formatCurrency(effectiveBalance) : '—'}</p>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/20 dark:border-slate-700/20">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-foreground">
                {effectiveLastActivityIso ? new Date(effectiveLastActivityIso).toLocaleDateString('id-ID') : '—'}
              </p>
              <p className="text-sm text-muted-foreground">Last Activity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Phone Number</span>
              </div>
              <span className="text-sm text-muted-foreground">{formattedUserId}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Member Since</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {effectiveLastActivityIso ? new Date(effectiveLastActivityIso).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status</span>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">Current Balance</span>
              <span className="text-sm font-semibold text-cyan-600">
                {effectiveBalance != null ? formatCurrency(effectiveBalance) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">Average Transaction</span>
              <span className="text-sm font-semibold">
                {formatCurrency((userTransactions?.totalSpent || displayUser.totalSpent || 0) / Math.max((userTransactions?.transaksi?.length || displayUser.transactionCount || 1), 1))}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">Transaction Frequency</span>
              <span className="text-sm font-semibold">
                {(userTransactions?.transaksi?.length || displayUser.transactionCount || 0) > 0 ? 'Regular' : 'New User'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">Loyalty Level</span>
              <Badge variant="outline" className={getRoleColor(displayUser.role)}>
                {displayUser.role.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Latest {userTransactions?.transaksi?.length || displayUser.transactionCount || 0} transactions from this user
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {(userTransactions?.transaksi && userTransactions.transaksi.length > 0) || (currentUser?.transactionCount > 0) ? (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-slate-50">
                  <TableHead className="text-slate-600 font-medium">Reference ID</TableHead>
                  <TableHead className="text-slate-600 font-medium">Product</TableHead>
                  <TableHead className="text-slate-600 font-medium">Payment Method</TableHead>
                  <TableHead className="text-slate-600 font-medium">Amount</TableHead>
                  <TableHead className="text-slate-600 font-medium">Date</TableHead>
                  <TableHead className="text-slate-600 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userTransactions?.transaksi && userTransactions.transaksi.length > 0 ? (
                  userTransactions.transaksi.map((transaction, index) => (
                    <TableRow key={`real-transaction-${index}`} className="hover:bg-slate-50 border-slate-100">
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                          {getTransactionReferenceId(transaction)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-700">{transaction.name}</p>
                          <p className="text-sm text-slate-500">Qty: {transaction.jumlah} • {formatCurrency(transaction.price)} each</p>
                        </div>
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
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-700 font-medium">
                            {formatDate(
                              (() => {
                                const date = new Date(transaction.date);
                                date.setHours(date.getHours() - 7);
                                return date.toISOString();
                              })(),
                              'short'
                            )}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTime(
                              (() => {
                                const date = new Date(transaction.date);
                                date.setHours(date.getHours() - 7);
                                return date.toISOString();
                              })()
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/ref/${encodeURIComponent(getTransactionReferenceId(transaction))}`)}
                          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Enhanced data fallback when API returns empty
                  Array.from({ length: currentUser.transactionCount }, (_, index) => (
                    <TableRow key={`enhanced-transaction-${index}`} className="hover:bg-slate-50">
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                          {`REF-${currentUser.userId?.replace('@s.whatsapp.net', '')}-${String(index + 1).padStart(3, '0')}`}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-700">Enhanced Transaction {index + 1}</p>
                          <p className="text-sm text-slate-500">Data from enhanced user activity</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Enhanced Data</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-700">
                          {formatCurrency(Math.floor(currentUser.totalSpent / currentUser.transactionCount))}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-500">Recent Activity</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200">
                          Enhanced
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-muted-foreground">
                This user hasn't made any transactions yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 