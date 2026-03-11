'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Package, AlertTriangle, TrendingDown, TrendingUp, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

interface StockItem {
    id: string;
    productId: string;
    quantity: number;
    minStock: number;
    product: {
        id: string;
        name: string;
        unit: string;
        category: {
            name: string;
        };
    };
}

interface StockMovement {
    id: string;
    productId: string;
    type: string;
    quantity: number;
    createdAt: string;
    product: {
        name: string;
    };
}

export default function StocksPage() {
    const [activeTab, setActiveTab] = useState<'current' | 'movements'>('current');

    const { data: stocks, isLoading: stocksLoading } = useQuery({
        queryKey: ['stocks'],
        queryFn: async () => {
            const response = await api.get('/stocks');
            return response.data.data as StockItem[];
        },
    });

    const { data: lowStocks } = useQuery({
        queryKey: ['stocks', 'low'],
        queryFn: async () => {
            const response = await api.get('/stocks/low');
            return response.data.data as StockItem[];
        },
    });

    const { data: movements, isLoading: movementsLoading } = useQuery({
        queryKey: ['stocks', 'movements'],
        queryFn: async () => {
            const response = await api.get('/stocks/movements');
            return response.data.data as StockMovement[];
        },
        enabled: activeTab === 'movements',
    });

    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
    const [adjustForm, setAdjustForm] = useState({
        type: 'IN',
        quantity: '',
        notes: '',
    });

    const queryClient = useQueryClient();

    const adjustMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/stocks/adjust', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Penyesuaian stok berhasil disimpan');
            setIsAdjustModalOpen(false);
            setAdjustForm({ type: 'IN', quantity: '', notes: '' });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menyesuaikan stok');
        },
    });

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStock) return;

        adjustMutation.mutate({
            productId: selectedStock.productId,
            type: adjustForm.type,
            quantity: parseInt(adjustForm.quantity),
            notes: adjustForm.notes,
        });
    };

    const openAdjustModal = (stock: StockItem) => {
        setSelectedStock(stock);
        setAdjustForm({ type: 'IN', quantity: '', notes: '' });
        setIsAdjustModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-medium text-gray-900 tracking-tight">Manajemen Stok Produk</h1>
                <p className="text-gray-500 mt-1">Monitor sisa stok, batas minimum, dan riwayat mutasi produk Anda.</p>
            </div>

            {/* Low Stock Alert */}
            {lowStocks && lowStocks.length > 0 && (
                <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-red-900 leading-tight">
                                Peringatan Stok Menipis!
                            </h2>
                            <p className="text-sm text-red-700">Terdapat {lowStocks.length} menu/produk yang stoknya sudah mencapai batas minimum.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {lowStocks.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between group">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                        <Package size={16} />
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{item.product.name}</p>
                                </div>
                                <div className="flex justify-between items-end mt-auto pt-3 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Minimal</span>
                                        <span className="text-xs text-gray-600 font-medium">
                                            {item.minStock} {item.product.unit}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Sisa Stok</span>
                                        <span className="text-lg text-red-600 font-black leading-none">
                                            {item.quantity} <span className="text-xs font-semibold">{item.product.unit}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50">
                    <div className="flex gap-1 p-2">
                        <button
                            onClick={() => setActiveTab('current')}
                            className={`py-2.5 px-6 font-semibold text-sm rounded-lg transition-all ${activeTab === 'current'
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Sisa Stok Saat Ini
                        </button>
                        <button
                            onClick={() => setActiveTab('movements')}
                            className={`py-2.5 px-6 font-semibold text-sm rounded-lg transition-all ${activeTab === 'movements'
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Riwayat Mutasi Stok
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'current' && (
                        <>
                            {stocksLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-500 font-medium text-sm">Memuat data stok...</p>
                                </div>
                            ) : stocks && stocks.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Info Menu / Produk</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Batas Minimum</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Sisa Stok</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status Alarm</th>
                                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {stocks.map((item) => {
                                                const isLow = item.quantity <= item.minStock;
                                                return (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                                    <Package size={18} className="text-gray-400" />
                                                                </div>
                                                                <span className="font-bold text-gray-900 text-sm">{item.product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                {item.product.category.name}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-center text-gray-500 font-medium">
                                                            {item.minStock} {item.product.unit}
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <span className={`font-bold text-sm ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                                                                {item.quantity}
                                                            </span>
                                                            <span className="text-xs text-gray-500 uppercase ml-1">{item.product.unit}</span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isLow
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-green-100 text-green-700'
                                                                    }`}
                                                            >
                                                                {isLow ? (
                                                                    <>
                                                                        <AlertTriangle size={12} />
                                                                        Kritis
                                                                    </>
                                                                ) : (
                                                                    'Aman'
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <button
                                                                onClick={() => openAdjustModal(item)}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                                                            >
                                                                <RefreshCw size={14} />
                                                                Sesuaikan
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-600">No stock data available</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'movements' && (
                        <>
                            {movementsLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-500 font-medium text-sm">Memuat data mutasi...</p>
                                </div>
                            ) : movements && movements.length > 0 ? (
                                <div className="space-y-3">
                                    {movements.map((movement) => (
                                        <div
                                            key={movement.id}
                                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${movement.type === 'IN'
                                                        ? 'bg-green-50 text-green-600 border border-green-100'
                                                        : 'bg-red-50 text-red-600 border border-red-100'
                                                        }`}
                                                >
                                                    {movement.type === 'IN' ? (
                                                        <TrendingUp size={24} />
                                                    ) : (
                                                        <TrendingDown size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm mb-0.5">{movement.product.name}</p>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {new Date(movement.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className="flex items-center gap-1.5">
                                                    <p
                                                        className={`font-black text-lg leading-none ${movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                                                            }`}
                                                    >
                                                        {movement.type === 'IN' ? '+' : '-'}
                                                        {movement.quantity}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-sm ${movement.type === 'IN' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    STOK {movement.type === 'IN' ? 'MASUK' : 'KELUAR'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <TrendingUp size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-500 font-medium text-sm">Belum ada mutasi stok.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal Penyesuaian Stok */}
            {isAdjustModalOpen && selectedStock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Sesuaikan Stok</h3>
                                <p className="text-sm text-gray-500 font-medium">{selectedStock.product.name}</p>
                            </div>
                            <button
                                onClick={() => setIsAdjustModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-lg p-2 transition-colors border border-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Sisa Stok Saat Ini</span>
                                <span className="text-xl font-black text-gray-900">{selectedStock.quantity} <span className="text-sm font-bold text-gray-500">{selectedStock.product.unit}</span></span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Jenis Mutasi
                                    </label>
                                    <select
                                        value={adjustForm.type}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
                                    >
                                        <option value="IN">Stok Masuk (+)</option>
                                        <option value="OUT">Stok Keluar (-)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Jumlah Penyesuaian
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={adjustForm.quantity}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
                                        placeholder="Cth: 10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Catatan / Alasan
                                </label>
                                <textarea
                                    value={adjustForm.notes}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                                    placeholder="Cth: Barang restock harian..."
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={adjustMutation.isPending}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                                >
                                    {adjustMutation.isPending ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
