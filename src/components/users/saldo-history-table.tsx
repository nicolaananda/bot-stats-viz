import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search, Filter, RefreshCw } from 'lucide-react';
import { SaldoHistoryEntry } from '@/types/dashboard';

interface SaldoHistoryTableProps {
    userId: string;
}

export function SaldoHistoryTable({ userId }: SaldoHistoryTableProps) {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [methodFilter, setMethodFilter] = useState<string>('all');
    const [sourceFilter, setSourceFilter] = useState<string>('all');

    const offset = (page - 1) * limit;

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['saldo-history', userId, page, limit, search, actionFilter, methodFilter, sourceFilter],
        queryFn: () => dashboardApi.getSaldoHistory(userId, {
            limit,
            offset,
            search,
            action: actionFilter !== 'all' ? actionFilter : undefined,
            method: methodFilter !== 'all' ? methodFilter : undefined,
            source: sourceFilter !== 'all' ? sourceFilter : undefined,
        }),
        keepPreviousData: true,
    });

    const totalPages = data ? Math.ceil(data.total / limit) : 1;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        refetch();
    };

    const getAmountColor = (amount: number, action: string) => {
        if (amount > 0) return 'text-emerald-600 font-medium';
        if (amount < 0) return 'text-red-600 font-medium';
        return 'text-muted-foreground';
    };

    const getActionBadge = (action: string) => {
        switch (action.toLowerCase()) {
            case 'deposit': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'manual-add': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'manual-subtract': return 'bg-red-500/10 text-red-600 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search notes, ref ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </form>

                    <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="deposit">Deposit</SelectItem>
                            <SelectItem value="manual-add">Manual Add</SelectItem>
                            <SelectItem value="manual-subtract">Manual Subtract</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="deposit">Deposit</SelectItem>
                            <SelectItem value="addsaldo">Add Saldo</SelectItem>
                            <SelectItem value="minsado">Min Saldo</SelectItem>
                            <SelectItem value="isi">Isi</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="card-premium border-none shadow-soft">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Reference ID</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={7} className="h-12 animate-pulse bg-muted/20" />
                                    </TableRow>
                                ))
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-destructive">
                                        Failed to load history. Please try again.
                                    </TableCell>
                                </TableRow>
                            ) : data?.entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No history found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.entries.map((entry: SaldoHistoryEntry) => (
                                    <TableRow key={entry.id} className="hover:bg-muted/30 border-border/50 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {formatDate(new Date(entry.timestamp).toISOString(), 'short')}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTime(new Date(entry.timestamp).toISOString())}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                                                {entry.refId}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className={getActionBadge(entry.action)}>
                                                    {entry.action}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground capitalize">
                                                    {entry.source} • {entry.method}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={getAmountColor(entry.amount, entry.action)}>
                                                {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs">
                                                <span className="text-muted-foreground">Before: {formatCurrency(entry.before)}</span>
                                                <span className="font-medium">After: {formatCurrency(entry.after)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground truncate max-w-[100px]" title={entry.actor}>
                                                {entry.actor.replace('@s.whatsapp.net', '')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground line-clamp-2" title={entry.notes}>
                                                {entry.notes}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {data && totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
