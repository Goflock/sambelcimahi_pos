'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Package, RefreshCw, X, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    cost?: number;
    unit: string;
    imageUrl?: string | null;
    category: {
        id: string;
        name: string;
    };
    stocks: {
        id: string;
        quantity: number;
        minStock: number;
        productId: string;
    }[];
    isAvailable: boolean;
}

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [adjustForm, setAdjustForm] = useState({
        type: 'IN',
        quantity: '',
        notes: '',
    });

    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await api.get('/products');
            return response.data.data as Product[];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            toast.success('Produk berhasil dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus produk');
        },
    });

    const adjustMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/stocks/adjust', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            toast.success('Stok berhasil disesuaikan!');
            setIsAdjustModalOpen(false);
            setAdjustForm({ type: 'IN', quantity: '', notes: '' });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menyesuaikan stok');
        },
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Yakin ingin menghapus "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const openAdjustModal = (product: Product) => {
        setSelectedProduct(product);
        setAdjustForm({ type: 'IN', quantity: '', notes: '' });
        setIsAdjustModalOpen(true);
    };

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !selectedProduct.stocks?.[0]) return;
        adjustMutation.mutate({
            productId: selectedProduct.stocks[0].productId,
            type: adjustForm.type,
            quantity: parseInt(adjustForm.quantity),
            notes: adjustForm.notes,
        });
    };

    const filteredProducts = Array.isArray(products)
        ? products.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const activeProducts = Array.isArray(products) ? products.filter((p) => p.isAvailable).length : 0;
    const lowStockProducts = Array.isArray(products)
        ? products.filter((p) => (p.stocks?.[0]?.quantity ?? 0) <= (p.stocks?.[0]?.minStock ?? 0)).length
        : 0;
    const totalProducts = Array.isArray(products) ? products.length : 0;

    const currentStock = selectedProduct?.stocks?.[0]?.quantity ?? 0;
    const previewQty = parseInt(adjustForm.quantity) || 0;
    const previewResult =
        adjustForm.type === 'IN' ? currentStock + previewQty : currentStock - previewQty;

    const getImageUrl = (url?: string | null, productName?: string) => {
        if (productName) {
            const name = productName.toLowerCase();
            if (name.includes('ayam bakar')) return 'https://i.ibb.co.com/gZ9vDN7Z/ayambakar.jpg';
            if (name.includes('ayam kampung')) return 'https://i.ibb.co.com/jZWGTtsb/ayamkampung.jpg';
            if (name.includes('nasi') || name.includes('bakul')) return 'https://i.ibb.co.com/60HhNGbz/bakul.jpg';
            if (name.includes('bakwan') || name.includes('tempe')) return 'https://i.ibb.co.com/2089fVQ3/bakwantempe.jpg';
            if (name.includes('cumi')) return 'https://i.ibb.co.com/rRVjq0Rs/cumiasin.jpg';
            if (name.includes('kembung bakar')) return 'https://i.ibb.co.com/LhBXh4WM/ikankembungbakar.jpg';
            if (name.includes('mas')) return 'https://i.ibb.co.com/qLKPd46H/ikanmasacar.jpg';
            if (name.includes('nila bakar')) return 'https://i.ibb.co.com/FbFQ98BM/ikannilabakar.jpg';
            if (name.includes('nila goreng')) return 'https://i.ibb.co.com/C5Bz1qkL/ikannilagoreng.jpg';
            if (name.includes('jengkol')) return 'https://i.ibb.co.com/bRQ0CytP/jengkol.jpg';
            if (name.includes('kembang paya') || name.includes('pepaya')) return 'https://i.ibb.co.com/Dfx9jcSp/kembangpaya.jpg';
            if (name.includes('pepes')) return 'https://i.ibb.co.com/d0kyk80d/pepesikan.jpg';
            if (name.includes('jamur')) return 'https://i.ibb.co.com/Fq8HL4y7/tumisjamur.jpg';
            if (name.includes('es jeruk') || name.includes('esjeruk')) return 'https://i.ibb.co.com/Rp4WHWFN/esjeruk.jpg';
            if (name.includes('es teh manis') || name.includes('es tehmanis') || name.includes('as teh manis')) return 'https://i.ibb.co.com/svtTyW5n/estehmanis.jpg';
            if (name.includes('es teh tawar') || name.includes('es tehtawar')) return 'https://i.ibb.co.com/svtTyW5n/estehmanis.jpg';
            if (name.includes('jeruk hangat') || name.includes('jeruk panas')) return 'https://i.ibb.co.com/XHL4h43/jerukhangat.jpg';
            if (name.includes('aqua') || name.includes('botol')) return 'https://i.ibb.co.com/Xkb9pQYt/aquabotol.jpg';
        }

        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');
        return `${baseUrl}${url}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-medium text-gray-900 tracking-tight">Daftar Menu</h1>
                    <p className="text-gray-500 mt-1 text-sm">Kelola produk dan stok secara langsung dari halaman ini.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none"
                        />
                    </div>
                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors text-sm font-medium whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Tambah Menu
                    </Link>
                </div>
            </div>

            {/* Stats Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg text-gray-800 font-medium">Statistik Produk</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-6">
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Produk</p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {totalProducts} <span className="text-sm font-normal text-gray-500">Item</span>
                        </p>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-500 font-medium mb-1">Produk Aktif</p>
                        <p className="text-2xl font-semibold text-green-600">
                            {activeProducts} <span className="text-sm font-normal text-gray-500">Tersedia</span>
                        </p>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-500 font-medium mb-1">Stok Menipis</p>
                        <div className="flex items-center gap-2">
                            {lowStockProducts > 0 ? (
                                <>
                                    <AlertTriangle size={20} className="text-red-500" />
                                    <p className="text-2xl font-semibold text-red-600">
                                        {lowStockProducts} <span className="text-sm font-normal text-gray-500">Produk</span>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <TrendingUp size={20} className="text-green-500" />
                                    <p className="text-2xl font-semibold text-green-600">Aman</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-3 text-gray-500 text-sm">Memuat data produk...</p>
                        </div>
                    ) : filteredProducts && filteredProducts.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Info Produk / Menu</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga & HPP</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Stok</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product) => {
                                    const stockQty = product.stocks?.[0]?.quantity ?? 0;
                                    const minStock = product.stocks?.[0]?.minStock ?? 0;
                                    const isLow = stockQty <= minStock;
                                    const imgUrl = getImageUrl(product.imageUrl, product.name);

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                            {/* Info Produk */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {imgUrl ? (
                                                            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={24} className="text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-sm mb-0.5">{product.name}</h3>
                                                        <p className="text-xs text-gray-500 max-w-[200px] truncate">{product.description || 'Tidak ada deskripsi'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kategori */}
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>

                                            {/* Harga */}
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-sm">
                                                        Rp {product.price.toLocaleString('id-ID')}
                                                    </span>
                                                    {product.cost ? (
                                                        <span className="text-xs text-gray-500">
                                                            HPP: Rp {product.cost.toLocaleString('id-ID')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">HPP: -</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Stok */}
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`font-semibold text-sm ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {stockQty}
                                                        <span className="text-xs text-gray-500 uppercase ml-1">{product.unit || 'pcs'}</span>
                                                    </span>
                                                    {isLow && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                                                            <AlertTriangle size={9} />
                                                            Menipis
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-6 text-center">
                                                {product.isAvailable ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Tersedia</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Habis</span>
                                                )}
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openAdjustModal(product)}
                                                        title="Sesuaikan Stok"
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <RefreshCw size={15} />
                                                    </button>
                                                    <Link
                                                        href={`/admin/products/${product.id}`}
                                                        title="Edit Produk"
                                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Edit size={15} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        title="Hapus Produk"
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-16">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">
                                {searchQuery ? `Tidak ada produk yang cocok dengan "${searchQuery}"` : 'Belum ada produk. Klik Tambah Menu untuk mulai.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Penyesuaian Stok */}
            {isAdjustModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Sesuaikan Stok</h3>
                                <p className="text-sm text-gray-500 font-medium">{selectedProduct.name}</p>
                            </div>
                            <button
                                onClick={() => setIsAdjustModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5">
                            {/* Stok Saat Ini */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Stok Saat Ini</span>
                                <span className="text-xl font-black text-gray-900">
                                    {currentStock}{' '}
                                    <span className="text-sm font-bold text-gray-500">{selectedProduct.unit}</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Mutasi</label>
                                    <select
                                        value={adjustForm.type}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
                                    >
                                        <option value="IN">Stok Masuk (+)</option>
                                        <option value="OUT">Stok Keluar (-)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={adjustForm.quantity}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
                                        placeholder="Cth: 10"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {previewQty > 0 && (
                                <div className={`p-3 rounded-xl border text-sm font-medium flex justify-between items-center ${adjustForm.type === 'IN' ? 'bg-green-50 border-green-200 text-green-800' : previewResult < 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                                    <span>Setelah penyesuaian:</span>
                                    <span className="font-black text-base">
                                        {previewResult < 0 ? '⚠ Stok tidak cukup' : `${previewResult} ${selectedProduct.unit}`}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Catatan</label>
                                <textarea
                                    value={adjustForm.notes}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Cth: Restock harian..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={adjustMutation.isPending || (adjustForm.type === 'OUT' && previewResult < 0)}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={16} />
                                {adjustMutation.isPending ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
