'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    Search, Filter, Calendar, Printer, Eye,
    RotateCcw, ChevronDown, CheckCircle2,
    Clock, XCircle, MoreVertical, CreditCard, Banknote, QrCode, Globe
} from 'lucide-react';

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: async () => {
            const res = await api.get('/orders');
            return res.data.data;
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Semua Pesanan</h1>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium">Kelola dan pantau seluruh transaksi pesanan masuk.</p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari ID Pesanan atau Nama Pelanggan..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex w-full md:w-auto items-center gap-3">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Hari Ini</span>
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span>Filter Lanjutan</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 uppercase text-[11px] tracking-wider text-gray-500 font-bold text-left">
                                <th className="px-6 py-4 rounded-tl-2xl">ID Pesanan & Waktu</th>
                                <th className="px-6 py-4">Pelanggan</th>
                                <th className="px-6 py-4">Tipe & Meja</th>
                                <th className="px-6 py-4">Total Tagihan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 rounded-tr-2xl text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 font-bold text-gray-500">Memuat data pesanan...</td>
                                </tr>
                            ) : data?.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 mb-0.5">{order.orderNumber}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{order.customerName || 'Pelanggan Umum'}</div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 mt-1 uppercase tracking-wider">
                                            Kasir POS
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {order.orderType === 'DINE_IN' ? 'Dine-in' : order.orderType === 'TAKEAWAY' ? 'Takeaway' : 'Delivery'}
                                        </div>
                                        {order.tableNumber && (
                                            <div className="text-xs text-gray-500 mt-0.5">{order.tableNumber}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 mb-0.5">Rp {Number(order.total).toLocaleString('id-ID')}</div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            {order.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                            order.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                            {order.status === 'COMPLETED' ? 'Selesai / Lunas' : order.status === 'PENDING' ? 'Diproses' : 'Dibatalkan'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip" title="Lihat Detail">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors tooltip" title="Cetak Struk">
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">Menampilkan 1-5 dari 124 pesanan</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50">Prev</button>
                        <button className="px-3 py-1.5 border border-gray-200 bg-red-50 text-red-600 rounded-lg font-bold">1</button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium">2</button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium">3</button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div >
    );
}
