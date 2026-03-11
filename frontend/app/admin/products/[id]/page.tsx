'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, Save, Upload, Eye, Package, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
}

const UNIT_OPTIONS = ['pcs', 'porsi', 'mangkok', 'gelas', 'botol', 'kg', 'liter', 'bungkus'];

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        cost: '',
        unit: 'porsi',
        categoryId: '',
        quantity: '0',
        minStock: '5',
        isAvailable: true,
        imageUrl: '',
    });
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Adjust stock modal state
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustForm, setAdjustForm] = useState({ type: 'IN', quantity: '', notes: '' });

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const response = await api.get(`/products/${productId}`);
            return response.data.data;
        },
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data.data as Category[];
        },
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price?.toString() || '',
                cost: product.cost?.toString() || '',
                unit: product.unit || 'porsi',
                categoryId: product.categoryId,
                quantity: product.stocks?.[0]?.quantity?.toString() || '0',
                minStock: product.stocks?.[0]?.minStock?.toString() || '5',
                isAvailable: product.isAvailable,
                imageUrl: product.imageUrl || '',
            });
            setImagePreview(product.imageUrl || '');
        }
    }, [product]);

    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.patch(`/products/${productId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            toast.success('Produk berhasil diperbarui!');
            router.push('/admin/products');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal memperbarui produk');
        },
    });

    const adjustMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/stocks/adjust', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            toast.success('Stok berhasil disesuaikan!');
            setIsAdjustModalOpen(false);
            setAdjustForm({ type: 'IN', quantity: '', notes: '' });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menyesuaikan stok');
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const response = await api.post('/settings/upload-logo', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const rawUrl = response.data?.data?.url || response.data?.url || response.data?.data?.logoUrl || '';
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');
            const uploadedUrl = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${baseUrl}${rawUrl}`) : '';

            if (uploadedUrl) {
                setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
                setImagePreview(uploadedUrl);
                toast.success('Gambar berhasil diupload');
            }
        } catch {
            setFormData((prev) => ({ ...prev, imageUrl: objectUrl }));
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!formData.name) {
            toast.error('Nama produk wajib diisi');
            alert('Nama produk wajib diisi');
            return;
        }
        if (!formData.categoryId) {
            toast.error('Kategori wajib dipilih');
            alert('Kategori wajib dipilih');
            return;
        }
        if (!formData.price || isNaN(parseFloat(formData.price))) {
            toast.error('Harga jual wajib diisi dengan benar');
            alert('Harga jual wajib diisi');
            return;
        }

        updateMutation.mutate({
            ...formData,
            price: parseFloat(formData.price),
            cost: formData.cost ? parseFloat(formData.cost) : 0,
            minStock: parseInt(formData.minStock) || 0,
            // quantity is intentionally NOT sent here — use adjust modal for stock changes
        });
    };

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const stockId = product?.stocks?.[0]?.productId;
        if (!stockId) return;
        adjustMutation.mutate({
            productId: stockId,
            type: adjustForm.type,
            quantity: parseInt(adjustForm.quantity),
            notes: adjustForm.notes,
        });
    };

    const currentStock = parseInt(formData.quantity) || 0;
    const previewQty = parseInt(adjustForm.quantity) || 0;
    const previewResult = adjustForm.type === 'IN' ? currentStock + previewQty : currentStock - previewQty;

    const marginPercent =
        formData.price && formData.cost
            ? (((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.price)) * 100).toFixed(0)
            : null;

    if (isLoading) {
        return (
            <div className="text-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Memuat data produk...</p>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Menu</h1>
                            <p className="text-gray-500 mt-0.5 text-sm">{formData.name || 'Memuat...'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Foto Produk */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-base font-bold text-gray-800 mb-4">Foto Produk</h2>
                        <div className="flex gap-6 items-start">
                            <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-gray-300">
                                        <Package size={32} />
                                        <span className="text-xs">Preview</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <label className="flex items-center gap-2 w-full cursor-pointer px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Upload size={16} />
                                    {isUploading ? 'Mengupload...' : 'Ganti Foto'}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                                <div className="relative">
                                    <Eye className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => { setFormData({ ...formData, imageUrl: e.target.value }); setImagePreview(e.target.value); }}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                                        placeholder="Atau URL gambar..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Menu */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                        <h2 className="text-base font-bold text-gray-800">Informasi Menu</h2>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Menu <span className="text-red-500">*</span></label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi <span className="text-red-500">*</span></label>
                            <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                                <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                    <option value="">Pilih kategori...</option>
                                    {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Satuan <span className="text-red-500">*</span></label>
                                <select required value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                    {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Harga */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                        <h2 className="text-base font-bold text-gray-800">Harga</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Jual (Rp) <span className="text-red-500">*</span></label>
                                <input type="number" required min="0" step="100" value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Modal / HPP (Rp)</label>
                                <input type="number" min="0" step="100" value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" placeholder="0" />
                            </div>
                        </div>
                        {marginPercent !== null && (
                            <div className={`flex justify-between items-center px-4 py-3 rounded-xl text-sm font-semibold border ${parseInt(marginPercent) >= 30 ? 'bg-green-50 border-green-200 text-green-800' : parseInt(marginPercent) >= 15 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                <span>Estimasi Margin Keuntungan</span>
                                <span className="text-lg font-black">{marginPercent}%</span>
                            </div>
                        )}
                    </div>

                    {/* Stok */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-800">Stok</h2>
                            <button
                                type="button"
                                onClick={() => setIsAdjustModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors"
                            >
                                <RefreshCw size={14} />
                                Sesuaikan Stok
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stok Saat Ini</label>
                                <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-bold flex items-center gap-2">
                                    <span className="text-xl">{formData.quantity}</span>
                                    <span className="text-gray-400 text-sm">{formData.unit}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Gunakan tombol "Sesuaikan Stok" untuk mengubah</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Batas Minimum Stok <span className="text-red-500">*</span></label>
                                <input type="number" required min="0" value={formData.minStock}
                                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" />
                                <p className="text-xs text-gray-400 mt-1">Peringatan muncul jika stok ≤ angka ini</p>
                            </div>
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer" onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}>
                            <div className="relative">
                                <div className={`w-12 h-6 rounded-full transition-colors ${formData.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Tampilkan di Menu Kasir</p>
                                <p className="text-xs text-gray-500">Produk {formData.isAvailable ? 'tersedia' : 'tidak tersedia'} untuk dipesan</p>
                            </div>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pb-6">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={updateMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 font-bold shadow-sm"
                        >
                            <Save size={20} />
                            {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                        <Link href="/admin/products" className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                            Batal
                        </Link>
                    </div>
                </div>

                {/* Modal Penyesuaian Stok */}
                {
                    isAdjustModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Sesuaikan Stok</h3>
                                        <p className="text-sm text-gray-500">{formData.name}</p>
                                    </div>
                                    <button onClick={() => setIsAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Stok Saat Ini</span>
                                        <span className="text-xl font-black text-gray-900">{currentStock} <span className="text-sm font-bold text-gray-500">{formData.unit}</span></span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Mutasi</label>
                                            <select value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium">
                                                <option value="IN">Stok Masuk (+)</option>
                                                <option value="OUT">Stok Keluar (-)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah</label>
                                            <input type="number" required min="1" value={adjustForm.quantity}
                                                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" placeholder="Cth: 10" />
                                        </div>
                                    </div>
                                    {previewQty > 0 && (
                                        <div className={`p-3 rounded-xl border text-sm font-medium flex justify-between items-center ${adjustForm.type === 'IN' ? 'bg-green-50 border-green-200 text-green-800' : previewResult < 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                                            <span>Setelah penyesuaian:</span>
                                            <span className="font-black text-base">{previewResult < 0 ? '⚠ Stok tidak cukup' : `${previewResult} ${formData.unit}`}</span>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Catatan</label>
                                        <textarea value={adjustForm.notes} onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                                            rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Cth: Restock harian..." />
                                    </div>
                                    <button type="submit" disabled={adjustMutation.isPending || (adjustForm.type === 'OUT' && previewResult < 0)}
                                        className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                                        <RefreshCw size={16} />
                                        {adjustMutation.isPending ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div >
        </>
    );
}
