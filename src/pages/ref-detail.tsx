import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RefDetailPage() {
	const { reffId } = useParams();
	const navigate = useNavigate();

	const { data, isLoading, error } = useQuery({
		queryKey: ['ref-detail', reffId],
		queryFn: () => dashboardApi.searchTransaction(reffId || ''),
		enabled: !!reffId,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[300px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Memuat data reference ID...</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="p-6">
				<Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
					<ArrowLeft className="h-4 w-4 mr-2" /> Kembali
				</Button>
				<p className="text-destructive">Gagal memuat detail reference ID.</p>
			</div>
		);
	}

	const safeRef = data.reffId;

	return (
		<div className="flex-1 space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
						<ArrowLeft className="h-4 w-4 mr-2" /> Back
					</Button>
					<div>
						<h2 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">Reference ID</h2>
						<p className="text-muted-foreground">Detail referensi transaksi</p>
					</div>
				</div>
			</div>

			<Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<CardTitle>{safeRef}</CardTitle>
					<CardDescription>Informasi transaksi</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="space-y-1">
						<p><span className="text-muted-foreground">User:</span> {data.user}</p>
						<p><span className="text-muted-foreground">Produk:</span> {data.produk} ({data.idProduk})</p>
						<p><span className="text-muted-foreground">Tanggal:</span> {new Date(data.tanggal).toLocaleString()}</p>
						<p><span className="text-muted-foreground">Metode:</span> {data.metodeBayar || data.payment_method}</p>
					</div>
					<div className="space-y-1">
						<p><span className="text-muted-foreground">Harga:</span> {data.harga?.toLocaleString('id-ID')}</p>
						<p><span className="text-muted-foreground">Jumlah:</span> {data.jumlah}</p>
						<p><span className="text-muted-foreground">Total:</span> {data.totalBayar?.toLocaleString('id-ID')}</p>
						<p><span className="text-muted-foreground">Profit:</span> {data.profit?.toLocaleString('id-ID')}</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
} 