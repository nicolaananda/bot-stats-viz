import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { StockManagementDialog } from '@/components/stock-management-dialog';
import { BulkDeleteDialog } from '@/components/bulk-delete-dialog';
import { Plus, MoreHorizontal, Edit, Trash2, Package } from 'lucide-react';
import { useState } from 'react';
import { StockItem } from '@/types/dashboard';

export default function ProductDetailPage() {
	const { productId } = useParams();
	const queryClient = useQueryClient();
	
	// Dialog states
	const [addStockOpen, setAddStockOpen] = useState(false);
	const [editStockOpen, setEditStockOpen] = useState(false);
	const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
	const [editingStock, setEditingStock] = useState<{ index: number; data: StockItem } | null>(null);

	const { data: details, isLoading } = useQuery({
		queryKey: ['product-details', productId],
		queryFn: () => dashboardApi.getProductStockDetails(productId || ''),
		enabled: !!productId,
	});

	const { data: recentTx } = useQuery({
		queryKey: ['recent-transactions-for-product', productId],
		queryFn: () => dashboardApi.getRecentTransactions(200),
		enabled: !!productId,
	});

	// Mutations
	const addStockMutation = useMutation({
		mutationFn: (data: any) => dashboardApi.addStock(productId!, data),
		onSuccess: (result) => {
			toast({
				title: 'Stock Added Successfully',
				description: `Added ${result.addedItems} stock items to ${result.productName}`,
			});
			queryClient.invalidateQueries({ queryKey: ['product-details', productId] });
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to Add Stock',
				description: error.message || 'An error occurred while adding stock',
				variant: 'destructive',
			});
		},
	});

	const editStockMutation = useMutation({
		mutationFn: ({ index, data }: { index: number; data: any }) => 
			dashboardApi.editStock(productId!, index, data),
		onSuccess: (result) => {
			toast({
				title: 'Stock Updated Successfully',
				description: `Updated stock item at index ${result.stockIndex}`,
			});
			queryClient.invalidateQueries({ queryKey: ['product-details', productId] });
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to Update Stock',
				description: error.message || 'An error occurred while updating stock',
				variant: 'destructive',
			});
		},
	});

	const deleteStockMutation = useMutation({
		mutationFn: (index: number) => dashboardApi.deleteStock(productId!, index),
		onSuccess: (result) => {
			toast({
				title: 'Stock Deleted Successfully',
				description: `Deleted stock item from ${result.productName}`,
			});
			queryClient.invalidateQueries({ queryKey: ['product-details', productId] });
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to Delete Stock',
				description: error.message || 'An error occurred while deleting stock',
				variant: 'destructive',
			});
		},
	});

	const bulkDeleteMutation = useMutation({
		mutationFn: (data: any) => dashboardApi.deleteMultipleStock(productId!, data),
		onSuccess: (result) => {
			toast({
				title: 'Stock Deleted Successfully',
				description: `Deleted ${result.deletedItemsCount || 1} stock items from ${result.productName}`,
			});
			queryClient.invalidateQueries({ queryKey: ['product-details', productId] });
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to Delete Stock',
				description: error.message || 'An error occurred while deleting stock',
				variant: 'destructive',
			});
		},
	});

	// Handler functions
	const handleAddStock = async (data: any) => {
		await addStockMutation.mutateAsync(data);
	};

	const handleEditStock = (index: number) => {
		const stockItem = details?.stock?.items?.[index];
		if (stockItem?.parsed) {
			setEditingStock({
				index,
				data: {
					email: stockItem.parsed.email || '',
					password: stockItem.parsed.password || '',
					profile: stockItem.parsed.profile || '',
					pin: stockItem.parsed.pin || '',
					notes: stockItem.parsed.notes || '',
				}
			});
			setEditStockOpen(true);
		}
	};

	const handleUpdateStock = async (data: any) => {
		if (editingStock) {
			await editStockMutation.mutateAsync({ index: editingStock.index, data });
			setEditingStock(null);
		}
	};

	const handleDeleteStock = async (index: number) => {
		if (confirm('Are you sure you want to delete this stock item?')) {
			await deleteStockMutation.mutateAsync(index);
		}
	};

	const handleBulkDelete = async (data: any) => {
		await bulkDeleteMutation.mutateAsync(data);
	};

	if (isLoading || !details) {
		return (
			<div className="flex items-center justify-center min-h-[300px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Memuat detail produk...</p>
				</div>
			</div>
		);
	}

	const matchedTransactions = (recentTx?.transactions || []).filter(t => (t.name || '').toLowerCase().includes((details.productName || '').toLowerCase()));
	const stockItems = details.stock?.items || [];
	const totalStockCount = stockItems.length;

	return (
		<div className="flex-1 space-y-6 p-6">
			<div>
				<h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">{details.productName}</h2>
				<p className="text-muted-foreground">ID: {productId}</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle>Informasi Produk</CardTitle>
						<CardDescription>Deskripsi dan harga</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<p>{details.description || '-'}</p>
						<div className="grid grid-cols-3 gap-2 text-sm">
							<div>Bronze: <span className="font-medium">{details.prices?.bronze ?? '-'}</span></div>
							<div>Silver: <span className="font-medium">{details.prices?.silver ?? '-'}</span></div>
							<div>Gold: <span className="font-medium">{details.prices?.gold ?? '-'}</span></div>
						</div>
						<div className="text-sm text-muted-foreground">Kategori: {details.category || '-'}</div>
						<div className="text-sm text-muted-foreground">Last Restock: {details.lastRestock || '-'}</div>
					</CardContent>
				</Card>

				<Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm md:col-span-2">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Package className="h-5 w-5" />
									Stock Management
								</CardTitle>
								<CardDescription>
									Manage stock items for this product ({totalStockCount} items)
								</CardDescription>
							</div>
							<div className="flex gap-2">
								<Button onClick={() => setAddStockOpen(true)} size="sm">
									<Plus className="h-4 w-4 mr-2" />
									Add Stock
								</Button>
								{totalStockCount > 0 && (
									<Button 
										variant="outline" 
										size="sm"
										onClick={() => setBulkDeleteOpen(true)}
									>
										<Trash2 className="h-4 w-4 mr-2" />
										Bulk Delete
									</Button>
								)}
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{totalStockCount === 0 ? (
							<div className="text-center py-8">
								<Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p className="text-muted-foreground mb-4">No stock items available</p>
								<Button onClick={() => setAddStockOpen(true)}>
									<Plus className="h-4 w-4 mr-2" />
									Add First Stock Item
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Index</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Password</TableHead>
											<TableHead>Profile</TableHead>
											<TableHead>PIN</TableHead>
											<TableHead>Notes</TableHead>
											<TableHead className="w-[100px]">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{stockItems.map((item, idx) => (
											<TableRow key={idx}>
												<TableCell className="font-mono text-sm">{idx}</TableCell>
												<TableCell>{item.parsed?.email || '-'}</TableCell>
												<TableCell className="font-mono">{item.parsed?.password || '-'}</TableCell>
												<TableCell>{item.parsed?.profile || '-'}</TableCell>
												<TableCell className="font-mono">{item.parsed?.pin || '-'}</TableCell>
												<TableCell className="max-w-[200px] truncate" title={item.parsed?.notes}>
													{item.parsed?.notes || '-'}
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => handleEditStock(idx)}>
																<Edit className="h-4 w-4 mr-2" />
																Edit
															</DropdownMenuItem>
															<DropdownMenuItem 
																onClick={() => handleDeleteStock(idx)}
																className="text-red-600"
															>
																<Trash2 className="h-4 w-4 mr-2" />
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<CardTitle>Transaksi Terkait</CardTitle>
					<CardDescription>Transaksi terbaru yang berkaitan dengan produk ini</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Tanggal</TableHead>
								<TableHead>User</TableHead>
								<TableHead>Reff ID</TableHead>
								<TableHead>Jumlah</TableHead>
								<TableHead>Total</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{matchedTransactions.map((t, i) => (
								<TableRow key={i}>
									<TableCell>{new Date(t.date).toLocaleString()}</TableCell>
									<TableCell>{t.user_name || '-'}</TableCell>
									<TableCell>{t.reffId || t.order_id || '-'}</TableCell>
									<TableCell>{t.jumlah}</TableCell>
									<TableCell>{t.totalBayar.toLocaleString('id-ID')}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Stock Management Dialogs */}
			<StockManagementDialog
				open={addStockOpen}
				onOpenChange={setAddStockOpen}
				mode="add"
				title={`Add Stock to ${details.productName}`}
				onSubmit={handleAddStock}
				isLoading={addStockMutation.isPending}
			/>

			<StockManagementDialog
				open={editStockOpen}
				onOpenChange={(open) => {
					setEditStockOpen(open);
					if (!open) setEditingStock(null);
				}}
				mode="edit"
				title={`Edit Stock Item ${editingStock?.index}`}
				initialData={editingStock?.data}
				onSubmit={handleUpdateStock}
				isLoading={editStockMutation.isPending}
			/>

			<BulkDeleteDialog
				open={bulkDeleteOpen}
				onOpenChange={setBulkDeleteOpen}
				onSubmit={handleBulkDelete}
				isLoading={bulkDeleteMutation.isPending}
				totalStockCount={totalStockCount}
			/>
		</div>
	);
} 