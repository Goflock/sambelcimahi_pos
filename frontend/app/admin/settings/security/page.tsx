'use client';

import { ShieldCheck, Search, Filter, Download, Activity, AlertCircle, FileClock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function SecuritySettingsPage() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua Peran');

    const { data: logsData, isLoading } = useQuery({
        queryKey: ['audit-logs', { search, role: roleFilter }],
        queryFn: async () => {
            const { default: api } = await import('@/lib/api');
            const response = await api.get('/audit-logs', {
                params: { search, role: roleFilter, limit: 100 }
            });
            return response.data; // { data: [], meta: {} }
        },
        refetchInterval: 5000 // Poll every 5s for live effect
    });

    const logs = logsData?.data || [];

    // Determine visual severity
    const getRiskLevel = (action: string) => {
        if (action.includes('HAPUS') || action.includes('DELETE') || action.includes('UBAH_PENGATURAN')) return 'high';
        if (action.includes('UBAH') || action.includes('PATCH') || action.includes('PUT')) return 'medium';
        return 'low';
    };
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        Keamanan & Log Sistem
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">Live Data Aktif</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Pantau semua jejak aktivitas operasional kasir dan administrator</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
                        <Download className="w-4 h-4" />
                        Export Log (.csv)
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 border-b border-gray-200">
                <Link
                    href="/admin/settings"
                    className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                    Profil Toko
                </Link>
                <Link
                    href="/admin/settings/payment"
                    className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                    Pembayaran
                </Link>
                <button
                    className="px-4 py-2.5 text-sm font-bold text-red-600 border-b-2 border-red-600"
                >
                    Keamanan & Log
                </button>
            </div>

            {/* Notification Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-800 items-start">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <strong>Sistem Aktif:</strong> Halaman ini merekam seluruh manipulasi transaksi, penghapusan data, dan aktivitas masuk secara <em>real-time</em> dari database pusat.
                </div>
            </div>

            {/* Main Content - Table Dashboard */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari user, aksi, atau target..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:border-red-500 flex-1 sm:flex-none">
                            <option>Semua Peran</option>
                            <option>Hanya Kasir</option>
                            <option>Hanya Admin</option>
                        </select>
                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50">
                            <Filter className="w-4 h-4" />
                            Filter 7 Hari
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto flex-1 relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                            <FileClock className="w-12 h-12 text-gray-200 mb-3" />
                            <p className="font-medium">Tidak ada log aktivitas ditemukan</p>
                        </div>
                    ) : null}

                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">WAKTU & PENGGUNA</th>
                                <th className="px-6 py-4">AKTIVITAS (AKSI)</th>
                                <th className="px-6 py-4">DETAIL PERUBAHAN</th>
                                <th className="px-6 py-4">IP ADDRESS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log: any) => {
                                const risk = getRiskLevel(log.action);
                                const dateObj = new Date(log.createdAt);
                                const formattedTime = dateObj.toLocaleDateString('id-ID', {
                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                });

                                return (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                    <Activity className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        {log.user?.name || 'Sistem / Guest'}
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded ml-1">
                                                            {log.user?.role || 'SYSTEM'}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{formattedTime}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    {risk === 'high' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                                                    {risk === 'medium' && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                                                    <p className={`font-semibold ${risk === 'high' ? 'text-red-700' : risk === 'medium' ? 'text-amber-700' : 'text-gray-900'}`}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <FileClock className="w-3 h-3" /> Target: {log.entity}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-700 max-w-xs truncate" title={log.details}>{log.details}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-400 text-xs font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                                                {log.ipAddress || log.ip || '127.0.0.1'}
                                            </p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Connected to Meta eventually) */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
                    <p>Menampilkan log terkini (Limit 100)</p>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-50">Sebelumnnya</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white bg-white shadow-sm font-medium">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white">Selanjutnya</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
