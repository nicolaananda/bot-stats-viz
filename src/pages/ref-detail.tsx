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
			<div className="min-h-screen bg-gray-900 text-white">
				<div className="flex items-center justify-center min-h-[300px]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<p className="text-gray-400">Memuat data reference ID...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="min-h-screen bg-gray-900 text-white">
				<div className="p-6">
					<Button variant="ghost" className="mb-4 text-gray-400 hover:bg-gray-700 hover:text-white" onClick={() => navigate(-1)}>
						<ArrowLeft className="h-4 w-4 mr-2" /> Kembali
					</Button>
					<p className="text-red-400">Gagal memuat detail reference ID.</p>
				</div>
			</div>
		);
	}

	const safeRef = data.reffId;

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			{/* Header */}
			<div className="p-6 border-b border-gray-800">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-gray-400 hover:bg-gray-700 hover:text-white">
							<ArrowLeft className="h-4 w-4 mr-2" /> Back
						</Button>
						<div>
							<h2 className="text-3xl font-bold tracking-tight text-white">Reference ID</h2>
							<p className="text-gray-400">Detail referensi transaksi</p>
						</div>
					</div>
				</div>
			</div>

			<div className="p-6 space-y-6">
				<Card className="bg-gray-800 border-gray-700">
					<CardHeader>
						<CardTitle className="text-white">{safeRef}</CardTitle>
						<CardDescription className="text-gray-400">Informasi transaksi</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<p><span className="text-gray-400">User:</span> <span className="text-white">{data.user}</span></p>
							<p><span className="text-gray-400">Produk:</span> <span className="text-white">{data.produk} ({data.idProduk})</span></p>
							<p><span className="text-gray-400">Tanggal:</span> <span className="text-white">{new Date(data.tanggal).toLocaleString()}</span></p>
							<p><span className="text-gray-400">Metode:</span> <span className="text-white">{data.metodeBayar || data.payment_method}</span></p>
						</div>
						<div className="space-y-1">
							<p><span className="text-gray-400">Harga:</span> <span className="text-white">{data.harga?.toLocaleString('id-ID')}</span></p>
							<p><span className="text-gray-400">Jumlah:</span> <span className="text-white">{data.jumlah}</span></p>
							<p><span className="text-gray-400">Total:</span> <span className="text-white">{data.totalBayar?.toLocaleString('id-ID')}</span></p>
							<p><span className="text-gray-400">Profit:</span> <span className="text-white">{data.profit?.toLocaleString('id-ID')}</span></p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 