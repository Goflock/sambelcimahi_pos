'use client';

import { useState } from 'react';
import {
    Search, Calendar, Filter, RotateCcw,
    CheckCircle2, XCircle, AlertCircle, Banknote, CreditCard,
    MoreVertical
} from 'lucide-react';

const MOCK_REFUNDS = [
    {
        id: '#REF-20241221-001', orderId: '#ORD-20241221-045', date: '21 Dec 2024',
        reason: 'Menu kosong saat pesanan disiapkan', amount: 45000,
        method: 'Cash', methodIcon: Banknote, status: 'Selesai',
        approvedBy: 'Admin - Sarah'
    },
    {
        id: '#REF-20241222-001', orderId: '#ORD-20241222-012', date: '22 Dec 2024',
        reason: 'Pelanggan membatalkan pesanan (Menunggu terlalu lama)', amount: 125000,
        method: 'Transfer BCA', methodIcon: CreditCard, status: 'Menunggu Approval',
        approvedBy: '-'
    },
    {
        id: '#REF-20241222-002', orderId: '#ORD-20241222-018', date: '22 Dec 2024',
        reason: 'Salah input nominal di Kasir', amount: 50000,
        method: 'QRIS', methodIcon: Banknote, status: 'Ditolak',
        approvedBy: 'Super Admin - Budi'
    },
];

export default function RefundPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <RotateCcw className="w-8 h-8 text-rose-600" />
                        Pengembalian Dana (Refund)
                    </h1>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium">Log aktivitas pembatalan dan pengembalian uang ke pelanggan.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/20">
                    <AlertCircle className="w-5 h-5" />
                    Buat Request Refund
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari ID Refund atau Alasan..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex w-full md:w-auto items-center gap-3">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Filter Tanggal</span>
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span>Status Refund</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 uppercase text-[11px] tracking-wider text-gray-500 font-bold text-left">
                                <th className="px-6 py-4 rounded-tl-2xl">ID Refund & Order</th>
                                <th className="px-6 py-4">Alasan Pembatalan</th>
                                <th className="px-6 py-4">Nominal Kembali</th>
                                <th className="px-6 py-4">Log Approval</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 rounded-tr-2xl text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {MOCK_REFUNDS.map((refund) => (
                                <tr key={refund.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-rose-700 mb-0.5">{refund.id}</div>
                                        <div className="text-xs font-semibold text-gray-500">Ref: {refund.orderId}</div>
                                        <div className="text-[11px] text-gray-400 mt-1">{refund.date}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                            "{refund.reason}"
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 text-lg mb-0.5">Rp {refund.amount.toLocaleString('id-ID')}</div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                            <refund.methodIcon className="w-3.5 h-3.5" />
                                            Metode: {refund.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{refund.approvedBy}</div>
                                        <div className="text-[11px] text-gray-400">Otorisator</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border ${refund.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' :
                                                refund.status === 'Menunggu Approval' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            {refund.status === 'Selesai' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {refund.status === 'Menunggu Approval' && <AlertCircle className="w-3.5 h-3.5" />}
                                            {refund.status === 'Ditolak' && <XCircle className="w-3.5 h-3.5" />}
                                            {refund.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {refund.status === 'Menunggu Approval' && (
                                                <>
                                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip" title="Approve Refund">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tooltip" title="Tolak">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
