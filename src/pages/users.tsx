import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
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
	const [compact, setCompact] = useState(false);
	const navigate = useNavigate();
	const { toast } = useToast();

	const { data: userActivity, isLoading: userActivityLoading, error: userActivityError } = useQuery({
		queryKey: ['user-activity'],
		queryFn: dashboardApi.getUserActivity,
		retry: 1,
		retryDelay: 1000,
	});

	const { data: allUsers, isLoading: allUsersLoading, error: allUsersError } = useQuery({
		queryKey: ['all-users', searchTerm, roleFilter, sortField, sortDirection],
		queryFn: () => dashboardApi.getEnhancedAllUsers(1, 1000, searchTerm, roleFilter), // Get all users with high limit
		retry: 1,
		retryDelay: 1000,
	});

	// Debug effect for user data
	useEffect(() => {
		if (allUsers) {
			console.log('🔍 Users Page Debug: Enhanced users data received:', allUsers);
			const usersData = (allUsers as any)?.users;
			if (usersData) {
				console.log('🔍 Users Page Debug: First 3 users transaction data:', 
					usersData.slice(0, 3).map((u: any) => ({
						userId: u.userId,
						username: u.username,
						transactionCount: u.transactionCount,
						totalSpent: u.totalSpent,
						hasTransactions: u.hasTransactions,
						_debugMatchedId: u._debugMatchedId,
						_debugNormalizedIds: u._debugNormalizedIds
					}))
				);
			}
		}
	}, [allUsers]);

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

	// Show all users without pagination, but filter out users with 0 transactions
	const users = allUsers?.users || [];
	const isLoading = allUsersLoading;
	
	// Filter out users with 0 transactions
	const currentUsers = users.filter(user => (user.transactionCount || 0) > 0);

	// No pagination needed - showing all users

	// No pagination handlers needed

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1); // Reset to first page when searching
	};

	const handleRoleFilter = (role: string) => {
		setRoleFilter(role);
		setCurrentPage(1); // Reset to first page when filtering
	};

	const handleUserClick = (userId: string) => {
		// Normalize user ID by removing @s.whatsapp.net suffix for clean URLs
		const normalizedUserId = userId.replace('@s.whatsapp.net', '').trim();
		console.log('🔍 User Click Debug: Original userId:', userId, 'Normalized:', normalizedUserId);
		navigate(`/users/${normalizedUserId}`);
	};

	const exportCurrentViewToCSV = () => {
		const header = ['Username', 'User ID', 'Role', 'Transactions', 'Total Spent', 'Last Activity'];
		const rows = currentUsers.map((u) => [
			u.username === 'User .net' || u.username === 'User @lid' || !u.username 
				? u.userId.replace('@s.whatsapp.net', '').replace('@lid', '')
				: u.username,
			u.userId,
			u.role,
			u.transactionCount || 0,
			u.totalSpent || 0,
			u.lastActivity ? new Date(u.lastActivity).toISOString() : ''
		]);
		const csv = [header, ...rows]
			.map((r) => r.map((v) => (typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v)).join(','))
			.join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `users-page-${currentPage}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		toast({ title: 'CSV exported', description: 'Current view has been downloaded.' });
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
		<div className="flex-1 p-6 md:p-8">
			<div className="mx-auto w-full max-w-7xl space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
							User Management
						</h2>
						<p className="text-muted-foreground">
							Manage users, track activity, and analyze user behavior
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant={compact ? 'default' : 'outline'} size="sm" onClick={() => setCompact((v) => !v)}>
							{compact ? 'Comfortable' : 'Compact'}
						</Button>
						<Button variant="outline" size="sm" onClick={exportCurrentViewToCSV} className="flex items-center gap-2">
							<Download className="h-4 w-4" />
							Export CSV
						</Button>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<StatsCard
						title="Total Users"
						value={userStats?.totalUsers || 0}
						icon={Users}
						className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
					/>
					<StatsCard
						title="Active Users"
						value={userActivity?.activeUsers || 0}
						change={`${userActivity?.newUsers || 0} new this month`}
						changeType="positive"
						icon={Users}
						className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
					/>
					<StatsCard
						title="Total Balance"
						value={formatCurrency(userStats?.totalSaldo || 0)}
						icon={Users}
						className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
					/>
					<StatsCard
						title="Average Balance"
						value={formatCurrency(userStats?.averageSaldo || 0)}
						icon={Users}
						className="group hover:shadow-elevated transition-all duration-300 border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5"
					/>
				</div>

				{/* Filters and Search */}
				<Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Filter className="h-5 w-5" />
							Filters
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-4 md:flex-row md:items-center">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder="Search by username or user ID..."
										value={searchTerm}
										onChange={(e) => handleSearch(e.target.value)}
										className="pl-10"
									/>
								</div>
							</div>
							<Select value={roleFilter} onValueChange={handleRoleFilter}>
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
				<Card className="shadow-card border-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm ring-1 ring-black/5">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>All Users</CardTitle>
								<CardDescription>
									Showing all {currentUsers.length} users
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Sort by:</span>
								<Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
									<SelectTrigger className="w-36">
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
						<div className="rounded-lg border border-white/30 dark:border-slate-700/20 overflow-hidden">
							<Table>
								<TableHeader className="sticky top-0 bg-background/80 backdrop-blur z-10">
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
											<TableCell className={compact ? 'py-2' : ''}>
												<div>
													<p className="font-medium">
														{user.username === 'User .net' || user.username === 'User @lid' || !user.username 
															? user.userId.replace('@s.whatsapp.net', '').replace('@lid', '')
															: user.username}
													</p>
													<p className="text-sm text-muted-foreground">
														{user.userId.includes('@') ? user.userId : `ID: ${user.userId}`}
													</p>
												</div>
											</TableCell>
											<TableCell className={compact ? 'py-2' : ''}>
												<Badge variant={getRoleBadgeVariant(user.role)}>
													{user.role.toUpperCase()}
												</Badge>
											</TableCell>
											<TableCell className={compact ? 'py-2' : ''}>
												<span className={user.transactionCount > 0 ? 'text-foreground' : 'text-muted-foreground'}>
													{user.transactionCount || 0}
												</span>
											</TableCell>
											<TableCell className={compact ? 'py-2' : ''}>
												<span className={user.totalSpent > 0 ? 'text-foreground' : 'text-muted-foreground'}>
													{user.totalSpent > 0 ? formatCurrency(user.totalSpent) : 'No transactions'}
												</span>
											</TableCell>
											<TableCell className={compact ? 'py-2' : ''}>
												{user.lastActivity ? (
													new Date(user.lastActivity).toLocaleDateString()
												) : (
													<span className="text-muted-foreground">Never</span>
												)}
											</TableCell>
											<TableCell className={compact ? 'py-2' : ''}>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleUserClick(user.userId)}
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
						</div>
						
						{/* Total users info */}
						<div className="flex items-center justify-between mt-6">
							<div className="text-sm text-muted-foreground">
								Total: {currentUsers.length} users
							</div>
						</div>
						
						{users.length === 0 && (
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
		</div>
	);
}