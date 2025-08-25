import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProductDetailPage() {
	const { productId } = useParams();

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
						<CardTitle>Stok</CardTitle>
						<CardDescription>Item stok saat ini</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Email</TableHead>
									<TableHead>Password</TableHead>
									<TableHead>Profile</TableHead>
									<TableHead>PIN</TableHead>
									<TableHead>Notes</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{details.stock.items?.map((it, idx) => (
									<TableRow key={idx}>
										<TableCell>{it.parsed?.email || '-'}</TableCell>
										<TableCell>{it.parsed?.password || '-'}</TableCell>
										<TableCell>{it.parsed?.profile || '-'}</TableCell>
										<TableCell>{it.parsed?.pin || '-'}</TableCell>
										<TableCell className="max-w-[300px] truncate" title={it.parsed?.notes}>{it.parsed?.notes || '-'}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
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
		</div>
	);
} 