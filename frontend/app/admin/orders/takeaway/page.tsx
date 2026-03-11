'use client';

import { useState } from 'react';
import {
    Search, Calendar, Printer, CheckCircle2,
    Clock, ShoppingBag, MapPin, Phone
} from 'lucide-react';

const MOCK_TAKEAWAY = [
    {
        id: '#ORD-20241222-002', date: '22 Dec 2024', customer: 'Siti Aminah', phone: '081234567890',
        pickupTime: '15:00', status: 'Siap Diambil', items: 2, total: 45000,
        notes: 'Sambel dipisah ya mas'
    },
    {
        id: '#ORD-20241222-005', date: '22 Dec 2024', customer: 'Bapak Budi', phone: '085711223344',
        pickupTime: '16:30', status: 'Diproses', items: 5, total: 175000,
        notes: 'Ayamnya dibakar agak kering'
    },
    {
        id: '#ORD-20241222-008', date: '22 Dec 2024', customer: 'Ibu Ratna', phone: '089988776655',
        pickupTime: '17:15', status: 'Selesai', items: 1, total: 25000,
        notes: '-'
    },
];

export default function TakeawayPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-red-600" />
                        Order Takeaway
                    </h1>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium">Prioritaskan pesanan yang akan diambil sendiri oleh pelanggan.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari ID Pesanan atau Nama..."
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
                    <select className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm outline-none cursor-pointer">
                        <option>Semua Status</option>
                        <option>Diproses</option>
                        <option>Siap Diambil</option>
                        <option>Selesai</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_TAKEAWAY.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                        <div className="p-5 border-b border-gray-50">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">{order.id}</span>
                                    <h3 className="text-lg font-bold text-gray-900 mt-1">{order.customer}</h3>
                                </div>
                                <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${order.status === 'Siap Diambil' ? 'bg-green-50 text-green-700 border-green-200' :
                                        order.status === 'Diproses' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                            'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{order.phone}</div>
                                <div className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2 py-0.5 border border-blue-100 rounded text-[11px]"><Clock className="w-3.5 h-3.5" /> Pickup: {order.pickupTime}</div>
                            </div>
                        </div>

                        <div className="p-5 bg-gray-50/50 flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-700">Catatan Dapur:</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium italic bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                "{order.notes}"
                            </p>
                        </div>

                        <div className="p-4 border-t border-gray-50 bg-white flex justify-between items-center">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Total Tagihan</p>
                                <p className="text-sm font-black text-gray-900">Rp {order.total.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors tooltip" title="Cetak Struk">
                                    <Printer className="w-4 h-4" />
                                </button>
                                {order.status === 'Diproses' ? (
                                    <button className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Finalisasi
                                    </button>
                                ) : order.status === 'Siap Diambil' ? (
                                    <button className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black shadow-sm transition-all flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4" /> Picked Up
                                    </button>
                                ) : (
                                    <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded-lg flex items-center gap-2">
                                        Selesai
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
