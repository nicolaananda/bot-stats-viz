import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsCard } from '@/components/ui/stats-card';
import { dashboardApi } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, getTransactionPaymentMethod, getTransactionReferenceId } from '@/lib/utils';
import { DebugPanel } from '@/components/ui/debug-panel';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortField, setSortField] = useState<'transactions' | 'totalSpent' | 'lastActivity'>('transactions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: userActivity, isLoading: userActivityLoading, error: userActivityError } = useQuery({
    queryKey: ['user-activity'],
    queryFn: dashboardApi.getUserActivity,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: allUsers, isLoading: allUsersLoading, error: allUsersError } = useQuery({
    queryKey: ['all-users', currentPage, searchTerm, roleFilter, sortField, sortDirection],
    queryFn: () => dashboardApi.getEnhancedAllUsers(currentPage, usersPerPage, searchTerm, roleFilter),
    retry: 1,
    retryDelay: 1000,
  });

  const { data: userStats, isLoading: userStatsLoading, error: userStatsError } = useQuery({
    queryKey: ['user-stats'],
    queryFn: dashboardApi.getUserStats,
    retry: 1,
    retryDelay: 1000,
  });

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

  // Use allUsers data instead of filtering userActivity
  const users = allUsers?.users || [];
  const pagination = allUsers?.pagination || { currentPage: 1, totalPages: 1, totalUsers: 0, usersPerPage: 10 };

  // Update current page when pagination changes
  useEffect(() => {
    if (pagination.currentPage !== currentPage) {
      setCurrentPage(pagination.currentPage);
    }
  }, [pagination.currentPage, currentPage]);

  const isLoading = allUsersLoading || userStatsLoading;

  // Sort and filter users
  const sortedAndFilteredUsers = users
    .filter((user) => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.userId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'transactions':
          aValue = a.transactionCount || 0;
          bValue = b.transactionCount || 0;
          break;
        case 'totalSpent':
          aValue = a.totalSpent || 0;
          bValue = b.totalSpent || 0;
          break;
        case 'lastActivity':
          aValue = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
          bValue = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

  // Use sorted and filtered users
  const filteredUsers = sortedAndFilteredUsers;

  // Pagination logic
  const totalPages = pagination.totalPages;
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
  if (allUsersError || userStatsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load user data</p>
          <p className="text-sm text-muted-foreground">
            {allUsersError?.message || userStatsError?.message || 'Please check your API connection'}
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Showing {currentUsers.length} of {filteredUsers.length} users (Page {currentPage} of {totalPages})
                {sortField !== 'transactions' || sortDirection !== 'desc' ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    • Sorted by {sortField === 'transactions' ? 'Transactions' : sortField === 'totalSpent' ? 'Total Spent' : 'Last Activity'} 
                    ({sortDirection === 'asc' ? 'Low to High' : 'High to Low'})
                  </span>
                ) : null}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactions">Transactions</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                  <SelectItem value="lastActivity">Last Activity</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSortField('transactions');
                  setSortDirection('desc');
                }}
                className="text-xs"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    if (sortField === 'transactions') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('transactions');
                      setSortDirection('desc');
                    }
                  }}
                  title="Click to sort by Transactions"
                >
                  <div className="flex items-center gap-2">
                    Transactions
                    {sortField === 'transactions' && (
                      <span className="text-primary font-bold">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    if (sortField === 'totalSpent') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('totalSpent');
                      setSortDirection('desc');
                    }
                  }}
                  title="Click to sort by Total Spent"
                >
                  <div className="flex items-center gap-2">
                    Total Spent
                    {sortField === 'totalSpent' && (
                      <span className="text-primary font-bold">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    if (sortField === 'lastActivity') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('lastActivity');
                      setSortDirection('desc');
                    }
                  }}
                  title="Click to sort by Last Activity"
                >
                  <div className="flex items-center gap-2">
                    Last Activity
                    {sortField === 'lastActivity' && (
                      <span className="text-primary font-bold">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
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
                  <TableCell>
                    <span className={user.transactionCount > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                      {user.transactionCount || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={user.totalSpent > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                      {user.totalSpent > 0 ? formatCurrency(user.totalSpent) : 'No transactions'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.lastActivity ? (
                      new Date(user.lastActivity).toLocaleDateString()
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Extract phone number from userId for URL (remove @s.whatsapp.net)
                        const phoneNumber = user.userId?.replace('@s.whatsapp.net', '') || user.userId;
                        navigate(`/users/${phoneNumber}`);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {getPageNumbers().map((page, index) => (
                  <Button
                    key={index}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={page === '...' ? 'cursor-default' : ''}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Panel - Development Only
      {import.meta.env.DEV && (
        <DebugPanel 
          title="Enhanced Users Data" 
          data={allUsers} 
          isVisible={true}
        />
      )} */}
    </div>
  );
}