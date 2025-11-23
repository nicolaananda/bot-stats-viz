import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, UserCheck, Wallet, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboardApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, getTransactionPaymentMethod, getTransactionReferenceId, cn } from '@/lib/utils';
import { DebugPanel } from '@/components/ui/debug-panel';
import { UserBehaviorInsights } from '@/components/users/user-behavior-insights';

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
				return 'default'; // Primary color
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
	const currentUsers = users.filter((user: any) => (user.transactionCount || 0) > 0);

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
		const rows = currentUsers.map((u: any) => [
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="relative w-16 h-16 mx-auto">
						<div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
						<div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
					</div>
					<p className="text-muted-foreground font-medium animate-pulse">Loading users...</p>
				</div>
			</div>
		);
	}

	// Handle errors
	if (allUsersError || userStatsError) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center max-w-md mx-auto p-6 bg-destructive/5 rounded-2xl border border-destructive/20">
					<div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<Activity className="h-6 w-6 text-destructive" />
					</div>
					<h3 className="text-lg font-bold text-destructive mb-2">Failed to load user data</h3>
					<p className="text-sm text-muted-foreground mb-4">
						{(allUsersError as any)?.message || (userStatsError as any)?.message || 'Please check your API connection'}
					</p>
					<Button variant="outline" onClick={() => window.location.reload()}>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-muted/30 p-4 md:p-8 space-y-8">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
					<p className="text-muted-foreground mt-1">Manage users, track activity, and analyze user behavior</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant={compact ? 'default' : 'outline'}
						size="sm"
						onClick={() => setCompact((v) => !v)}
						className={cn(
							"transition-all",
							compact ? "bg-primary text-primary-foreground shadow-md" : "bg-background shadow-sm hover:bg-secondary/50"
						)}
					>
						{compact ? 'Comfortable' : 'Compact'}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={exportCurrentViewToCSV}
						className="bg-background shadow-sm hover:bg-secondary/50"
					>
						<Download className="h-4 w-4 mr-2" />
						Export CSV
					</Button>
				</div>
			</div>

			{/* User Behavior Insights */}
			<UserBehaviorInsights />

			{/* Stats Cards */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="card-premium border-none shadow-soft">
					<CardContent className="p-6">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Users</p>
								<h3 className="text-2xl font-bold mt-2 text-foreground">{userStats?.totalUsers || 0}</h3>
							</div>
							<div className="p-3 bg-blue-500/10 rounded-xl">
								<Users className="h-5 w-5 text-blue-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="card-premium border-none shadow-soft">
					<CardContent className="p-6">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Active Users</p>
								<h3 className="text-2xl font-bold mt-2 text-foreground">{userActivity?.activeUsers || 0}</h3>
								<p className="text-sm text-emerald-500 flex items-center mt-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
									+{userActivity?.newUsers || 0} new
								</p>
							</div>
							<div className="p-3 bg-emerald-500/10 rounded-xl">
								<UserCheck className="h-5 w-5 text-emerald-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="card-premium border-none shadow-soft">
					<CardContent className="p-6">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Balance</p>
								<h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(userStats?.totalSaldo || 0)}</h3>
							</div>
							<div className="p-3 bg-purple-500/10 rounded-xl">
								<Wallet className="h-5 w-5 text-purple-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="card-premium border-none shadow-soft">
					<CardContent className="p-6">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Average Balance</p>
								<h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(userStats?.averageSaldo || 0)}</h3>
							</div>
							<div className="p-3 bg-orange-500/10 rounded-xl">
								<Activity className="h-5 w-5 text-orange-500" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* User Behavior Insights */}
			<UserBehaviorInsights />

			{/* Filters and Search */}
			<Card className="card-premium border-none shadow-soft">
				<CardHeader className="pb-4">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Filter className="h-5 w-5 text-primary" />
						Filters & Search
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						<div className="flex-1">
							<div className="relative group">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
								<Input
									placeholder="Search by username or user ID..."
									value={searchTerm}
									onChange={(e) => handleSearch(e.target.value)}
									className="pl-10 bg-secondary/30 border-transparent focus:bg-background focus:border-primary/20 transition-all"
								/>
							</div>
						</div>
						<Select value={roleFilter} onValueChange={handleRoleFilter}>
							<SelectTrigger className="w-full md:w-48 bg-secondary/30 border-transparent focus:bg-background focus:border-primary/20">
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
			<Card className="card-premium border-none shadow-soft overflow-hidden">
				<CardHeader className="border-b border-border/50 bg-muted/20">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>All Users</CardTitle>
							<CardDescription>
								Showing all {currentUsers.length} users
							</CardDescription>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-sm text-muted-foreground hidden md:inline-block">Sort by:</span>
							<Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
								<SelectTrigger className="w-36 bg-background border-border/50 h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="transactions">Transactions</SelectItem>
									<SelectItem value="totalSpent">Total Spent</SelectItem>
									<SelectItem value="lastActivity">Last Activity</SelectItem>
								</SelectContent>
							</Select>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
								className="h-8 w-8 p-0"
							>
								{sortDirection === 'asc' ? '↑' : '↓'}
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader className="bg-muted/30">
								<TableRow className="hover:bg-transparent border-border/50">
									<TableHead className="w-[300px]">User</TableHead>
									<TableHead>Role</TableHead>
									<TableHead
										className="cursor-pointer hover:text-primary transition-colors text-right"
										onClick={() => {
											if (sortField === 'transactions') {
												setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
											} else {
												setSortField('transactions');
												setSortDirection('desc');
											}
										}}
									>
										<div className="flex items-center justify-end gap-2">
											Transactions
											{sortField === 'transactions' && (
												<span className="text-primary font-bold">
													{sortDirection === 'asc' ? '↑' : '↓'}
												</span>
											)}
										</div>
									</TableHead>
									<TableHead
										className="cursor-pointer hover:text-primary transition-colors text-right"
										onClick={() => {
											if (sortField === 'totalSpent') {
												setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
											} else {
												setSortField('totalSpent');
												setSortDirection('desc');
											}
										}}
									>
										<div className="flex items-center justify-end gap-2">
											Total Spent
											{sortField === 'totalSpent' && (
												<span className="text-primary font-bold">
													{sortDirection === 'asc' ? '↑' : '↓'}
												</span>
											)}
										</div>
									</TableHead>
									<TableHead
										className="cursor-pointer hover:text-primary transition-colors"
										onClick={() => {
											if (sortField === 'lastActivity') {
												setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
											} else {
												setSortField('lastActivity');
												setSortDirection('desc');
											}
										}}
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
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{currentUsers.map((user: any) => (
									<TableRow key={user.userId} className="hover:bg-muted/30 border-border/50 transition-colors">
										<TableCell className={compact ? 'py-2' : 'py-4'}>
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xs">
													{(user.username || user.userId || '?').substring(0, 2).toUpperCase()}
												</div>
												<div>
													<p className="font-medium text-foreground">
														{user.username === 'User .net' || user.username === 'User @lid' || !user.username
															? user.userId.replace('@s.whatsapp.net', '').replace('@lid', '')
															: user.username}
													</p>
													<p className="text-xs text-muted-foreground font-mono">
														{user.userId.includes('@') ? user.userId.split('@')[0] : user.userId}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell className={compact ? 'py-2' : 'py-4'}>
											<Badge variant={getRoleBadgeVariant(user.role) as any} className="capitalize">
												{user.role}
											</Badge>
										</TableCell>
										<TableCell className={cn("text-right font-medium", compact ? 'py-2' : 'py-4')}>
											<span className={user.transactionCount > 0 ? 'text-foreground' : 'text-muted-foreground'}>
												{user.transactionCount || 0}
											</span>
										</TableCell>
										<TableCell className={cn("text-right font-medium", compact ? 'py-2' : 'py-4')}>
											<span className={user.totalSpent > 0 ? 'text-primary' : 'text-muted-foreground'}>
												{user.totalSpent > 0 ? formatCurrency(user.totalSpent) : '-'}
											</span>
										</TableCell>
										<TableCell className={compact ? 'py-2' : 'py-4'}>
											{user.lastActivity ? (
												<div className="flex flex-col">
													<span className="text-sm">{new Date(user.lastActivity).toLocaleDateString()}</span>
													<span className="text-xs text-muted-foreground">{new Date(user.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
												</div>
											) : (
												<span className="text-muted-foreground text-sm">Never</span>
											)}
										</TableCell>
										<TableCell className={cn("text-right", compact ? 'py-2' : 'py-4')}>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleUserClick(user.userId)}
												className="hover:bg-primary/10 hover:text-primary"
											>
												<Eye className="h-4 w-4 mr-2" />
												Details
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Total users info */}
					<div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between">
						<div className="text-sm text-muted-foreground">
							Total: <span className="font-medium text-foreground">{currentUsers.length}</span> users found
						</div>
					</div>

					{users.length === 0 && (
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
								<Users className="h-8 w-8 text-muted-foreground" />
							</div>
							<p className="text-lg font-medium text-foreground">No users found</p>
							<p className="text-muted-foreground">Try adjusting your search criteria</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}