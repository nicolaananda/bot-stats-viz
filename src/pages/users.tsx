import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Eye, Filter } from 'lucide-react';
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

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: userActivity, isLoading: userActivityLoading, error: userActivityError } = useQuery({
    queryKey: ['user-activity'],
    queryFn: dashboardApi.getUserActivity,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: userStats, isLoading: userStatsLoading, error: userStatsError } = useQuery({
    queryKey: ['user-stats'],
    queryFn: dashboardApi.getUserStats,
    retry: 1,
    retryDelay: 1000,
  });

  // Query for specific user transactions when a user is selected
  const { data: userTransactions } = useQuery({
    queryKey: ['user-transactions', selectedUser],
    queryFn: () => selectedUser ? dashboardApi.getUserTransactions(selectedUser) : null,
    enabled: !!selectedUser,
    retry: 1,
    retryDelay: 1000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'gold':
        return 'default';
      case 'silver':
        return 'secondary';
      case 'bronze':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredUsers = userActivity?.userActivity?.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const isLoading = userActivityLoading || userStatsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (userActivityError || userStatsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load user data</p>
          <p className="text-sm text-muted-foreground">
            {userActivityError?.message || userStatsError?.message || 'Please check your API connection'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-muted-foreground">
            Manage users, track activity, and analyze user behavior
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={userStats?.totalUsers || 0}
          icon={Users}
          className="hover:scale-105"
        />
        <StatsCard
          title="Active Users"
          value={userActivity?.activeUsers || 0}
          change={`${userActivity?.newUsers || 0} new this month`}
          changeType="positive"
          icon={Users}
          className="hover:scale-105"
        />
        <StatsCard
          title="Total Balance"
          value={formatCurrency(userStats?.totalSaldo || 0)}
          icon={Users}
          className="hover:scale-105"
        />
        <StatsCard
          title="Average Balance"
          value={formatCurrency(userStats?.averageSaldo || 0)}
          icon={Users}
          className="hover:scale-105"
        />
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by username or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>
            {filteredUsers.length} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.userId} className="hover:bg-accent/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.transactionCount}</TableCell>
                  <TableCell>{formatCurrency(user.totalSpent)}</TableCell>
                  <TableCell>
                    {new Date(user.lastActivity).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user.userId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>User Details: {user.username}</DialogTitle>
                          <DialogDescription>
                            View detailed information and transaction history
                          </DialogDescription>
                        </DialogHeader>
                        
                        {userTransactions && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-accent/50 rounded-lg">
                                <p className="text-2xl font-bold">{userTransactions.totalTransaksi}</p>
                                <p className="text-sm text-muted-foreground">Total Transactions</p>
                              </div>
                              <div className="text-center p-4 bg-accent/50 rounded-lg">
                                <p className="text-2xl font-bold">{formatCurrency(userTransactions.totalSpent)}</p>
                                <p className="text-sm text-muted-foreground">Total Spent</p>
                              </div>
                              <div className="text-center p-4 bg-accent/50 rounded-lg">
                                <p className="text-2xl font-bold">{user.role.toUpperCase()}</p>
                                <p className="text-sm text-muted-foreground">User Role</p>
                              </div>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto">
                              <h4 className="font-semibold mb-3">Recent Transactions</h4>
                              <div className="space-y-2">
                                {userTransactions.transaksi.slice(0, 10).map((transaction) => (
                                  <div key={transaction.reffId} className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                                    <div>
                                      <p className="font-medium">{transaction.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {transaction.metodeBayar} • {transaction.date}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">{formatCurrency(transaction.totalBayar)}</p>
                                      <p className="text-xs text-muted-foreground">{transaction.reffId}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}