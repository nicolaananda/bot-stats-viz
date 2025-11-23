import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChevronUp, ChevronDown } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ProductsStockPageComponent = () => {
	const navigate = useNavigate();

	const { data: stock, isLoading: stockLoading } = useQuery({
		queryKey: ['product-stock'],
		queryFn: dashboardApi.getProductStock,
	});
	const { data: summary } = useQuery({
		queryKey: ['stock-summary'],
		queryFn: dashboardApi.getStockSummary,
	});
	const { data: alerts } = useQuery({
		queryKey: ['stock-alerts'],
		queryFn: dashboardApi.getStockAlerts,
	});

	// Sorting
	const [sortBy, setSortBy] = useState<'stock' | 'sold'>('stock');
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

	const products = stock?.products || [];

	// Debug logging
	console.log('Stock data:', stock);
	console.log('Summary data:', summary);
	console.log('Products:', products);

	const sortedProducts = useMemo(() => {
		const arr = [...products];
		arr.sort((a, b) => {
			const aVal = sortBy === 'stock' ? (a.stockCount ?? 0) : (a.terjual ?? 0);
			const bVal = sortBy === 'stock' ? (b.stockCount ?? 0) : (b.terjual ?? 0);
			return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
		});
		return arr;
	}, [products, sortBy, sortDir]);

	const lowStock = useMemo(() => products.filter(p => p.stockStatus === 'low' || p.stockStatus === 'out'), [products]);

	// Chart data builders
	const categoryPieData = useMemo(() => {
		const byCat: Record<string, number> = {};
		
		// Group by category and sum stock counts
		products.forEach(p => {
			const key = p.category || 'Uncategorized';
			byCat[key] = (byCat[key] || 0) + (p.stockCount || 0);
		});
		
		console.log('Category breakdown:', byCat);
		const result = Object.entries(byCat).map(([name, value]) => ({ name, value }));
		console.log('Final pie data:', result);
		return result;
	}, [products]);

	const topByStock = useMemo(() => {
		const result = [...products]
			.sort((a, b) => (b.stockCount || 0) - (a.stockCount || 0))
			.slice(0, 10)
			.map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, fullName: p.name, stock: p.stockCount || 0 }));
		console.log('Top by stock:', result);
		return result;
	}, [products]);

	const topBySold = useMemo(() => {
		const result = [...products]
			.sort((a, b) => (b.terjual || 0) - (a.terjual || 0))
			.slice(0, 10)
			.map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, fullName: p.name, sold: p.terjual || 0 }));
		console.log('Top by sold:', result);
		return result;
	}, [products]);

	const handleSort = (column: 'stock' | 'sold') => {
		if (sortBy === column) {
			setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(column);
			setSortDir('desc');
		}
	};

	const getSortIcon = (column: 'stock' | 'sold') => {
		if (sortBy !== column) return null;
		return sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
	};

	if (stockLoading) {
		return (
			<div className="min-h-screen bg-gray-900 text-white">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<p className="text-gray-400">Memuat data stok...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			{/* Header */}
			<div className="p-6 border-b border-gray-800">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-white">Manajemen Produk</h1>
						<p className="text-gray-400 mt-1">Visualisasi dan pemantauan stok produk</p>
					</div>
					<Button variant="secondary" onClick={() => dashboardApi.exportStockCSV()} className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
						Export CSV
					</Button>
				</div>
			</div>

			<div className="p-6 space-y-6">

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="bg-gray-800 border-gray-700">
					<CardHeader>
						<CardTitle className="text-white">Ringkasan Stok</CardTitle>
						<CardDescription className="text-gray-400">Status stok saat ini</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<p>Total Produk: <span className="font-medium">{summary?.totalProducts ?? stock?.totalProducts ?? 0}</span></p>
						<p>Total Item Stok: <span className="font-medium">{summary?.totalStockItems ?? products.reduce((s, p) => s + (p.stockCount || 0), 0)}</span></p>
						<p>Low Stock: <span className="font-medium">{summary?.lowStockProducts ?? lowStock.length}</span></p>
						<p>Out of Stock: <span className="font-medium">{summary?.outOfStockProducts ?? products.filter(p => p.stockStatus === 'out').length}</span></p>
					</CardContent>
				</Card>

				{/* Visualizations */}
				<Card className="bg-gray-800 border-gray-700 md:col-span-2">
					<CardHeader>
						<CardTitle className="text-white">Distribusi Stok per Kategori</CardTitle>
						<CardDescription className="text-gray-400">Total stok per kategori</CardDescription>
					</CardHeader>
					<CardContent>
						{categoryPieData.length > 0 ? (
							<div className="h-[280px]">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie 
											data={categoryPieData} 
											cx="50%" 
											cy="50%" 
											outerRadius={90} 
											dataKey="value" 
											label={({ name, value, percent }) => `${name.substring(0, 8)} ${(percent * 100).toFixed(0)}%`}
										>
											{categoryPieData.map((_, i) => (
												<Cell key={i} fill={COLORS[i % COLORS.length]} />
											))}
										</Pie>
										<Tooltip 
											formatter={(value: number) => [value.toLocaleString('id-ID'), 'Stok']} 
											contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} 
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						) : (
							<div className="h-[280px] flex items-center justify-center text-muted-foreground">
								<p>Tidak ada data kategori</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle>Top Produk Berdasarkan Stok</CardTitle>
						<CardDescription>10 produk dengan stok tertinggi</CardDescription>
					</CardHeader>
					<CardContent>
						{topByStock.length > 0 ? (
							<div className="h-[280px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={topByStock} layout="vertical">
										<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
										<XAxis type="number" />
										<YAxis dataKey="name" type="category" width={120} />
										<Tooltip formatter={(v: number) => [v.toLocaleString('id-ID'), 'Stok']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
										<Bar dataKey="stock" fill={COLORS[1]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						) : (
							<div className="h-[280px] flex items-center justify-center text-muted-foreground">
								<p>Tidak ada data stok</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle>Top Produk Berdasarkan Terjual</CardTitle>
						<CardDescription>10 produk dengan penjualan tertinggi</CardDescription>
					</CardHeader>
					<CardContent>
						{topBySold.length > 0 ? (
							<div className="h-[280px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={topBySold} layout="vertical">
										<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
										<XAxis type="number" />
										<YAxis dataKey="name" type="category" width={120} />
										<Tooltip formatter={(v: number) => [v.toLocaleString('id-ID'), 'Terjual']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
										<Bar dataKey="sold" fill={COLORS[2]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						) : (
							<div className="h-[280px] flex items-center justify-center text-muted-foreground">
								<p>Tidak ada data terjual</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<CardTitle>Daftar Produk & Stok</CardTitle>
					<CardDescription>Klik header Stok/Terjual untuk mengurutkan, klik detail untuk melihat stok dan riwayat</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap items-end gap-3">
						<Badge variant="secondary">{sortedProducts.length} produk</Badge>
						<div className="ml-auto flex items-center gap-2">
							<label className="text-sm text-muted-foreground">Sort</label>
							<select className="border rounded px-2 py-1 bg-background" value={sortBy} onChange={e => setSortBy(e.target.value as 'stock' | 'sold')}>
								<option value="stock">Stok</option>
								<option value="sold">Terjual</option>
							</select>
							<select className="border rounded px-2 py-1 bg-background" value={sortDir} onChange={e => setSortDir(e.target.value as 'asc' | 'desc')}>
								<option value="desc">Tertinggi</option>
								<option value="asc">Terendah</option>
							</select>
						</div>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Produk</TableHead>
								<TableHead 
									className="cursor-pointer hover:bg-accent/50 select-none"
									onClick={() => handleSort('stock')}
								>
									<div className="flex items-center gap-2">
										Stok
										{getSortIcon('stock')}
									</div>
								</TableHead>
								<TableHead>Status</TableHead>
								<TableHead 
									className="cursor-pointer hover:bg-accent/50 select-none"
									onClick={() => handleSort('sold')}
								>
									<div className="flex items-center gap-2">
										Terjual
										{getSortIcon('sold')}
									</div>
								</TableHead>
								<TableHead>Kategori</TableHead>
								<TableHead>Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedProducts.map((p) => (
								<TableRow key={p.id} className="hover:bg-accent/50">
									<TableCell>
										<div className="font-medium">{p.name}</div>
										<div className="text-xs text-muted-foreground">ID: {p.id}</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Progress value={Math.min(100, p.utilization ?? (p.stockCount > 0 ? 100 : 0))} className="w-[120px]" />
											<span className="text-sm">{p.stockCount}</span>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={p.stockStatus === 'good' ? 'default' : p.stockStatus === 'medium' ? 'secondary' : p.stockStatus === 'low' ? 'outline' : 'destructive'}>
											{p.stockStatus}
										</Badge>
									</TableCell>
									<TableCell>{p.terjual ?? '-'}</TableCell>
									<TableCell>{p.category ?? 'Uncategorized'}</TableCell>
									<TableCell className="space-x-2">
										<Button size="sm" variant="outline" onClick={() => navigate(`/products/${p.id}`)}>Detail</Button>
										<Button size="sm" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate(`/products/${p.id}`); }}>Kelola</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* {alerts && alerts.alerts && alerts.alerts.length > 0 && (
				<Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle>Alert Stok Rendah</CardTitle>
						<CardDescription>Produk yang perlu segera di-restock</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3">
							{alerts.alerts.map(a => (
								<div key={a.productId} className="flex items-center justify-between p-3 rounded border bg-muted/30">
									<div>
										<div className="font-medium">{a.productName}</div>
										<div className="text-xs text-muted-foreground">Stok {a.currentStock} • Threshold {a.threshold} • {a.category}</div>
									</div>
									<Badge variant={a.urgency === 'critical' ? 'destructive' : a.urgency === 'high' ? 'default' : 'secondary'}>{a.urgency}</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)} */}
			</div>
		</div>
	);
};

export default ProductsStockPageComponent; 