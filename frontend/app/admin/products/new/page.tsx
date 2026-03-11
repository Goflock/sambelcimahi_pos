'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, Save, Upload, Eye, Package } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
}

const UNIT_OPTIONS = ['pcs', 'porsi', 'mangkok', 'gelas', 'botol', 'kg', 'liter', 'bungkus'];

export default function NewProductPage() {
    const router = useRouter();
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

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data.data as Category[];
        },
    });

    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/products', data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            toast.success('Menu baru berhasil ditambahkan!');
            // Jika toast gagal tampil, tambahkan fallback alert
            alert("Menu berhasil disimpan!");
            router.push('/admin/products');
        },
        onError: (error: any) => {
            const errMsg = error.response?.data?.message || error.message || 'Gagal menambahkan produk';
            toast.error(errMsg);
            alert(`Error Simpan: ${errMsg}`);
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);

        // Upload to server
        setIsUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            const response = await api.post('/settings/upload-logo', formDataUpload, {
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
            // Keep preview but use object URL as imageUrl fallback
            setFormData((prev) => ({ ...prev, imageUrl: objectUrl }));
            toast.info('Gambar diset sebagai URL lokal');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlChange = (url: string) => {
        setFormData({ ...formData, imageUrl: url });
        setImagePreview(url);
    };

    const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        console.log('Submitting form data:', formData);

        // Basic validation before sending to API
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
            alert('Harga jual wajib diisi dengan benar');
            return;
        }

        if (formData.minStock === '' || isNaN(parseInt(formData.minStock))) {
            toast.error('Batas minimum stok wajib diisi');
            alert('Batas minimum stok wajib diisi');
            return;
        }

        createMutation.mutate({
            ...formData,
            price: parseFloat(formData.price),
            cost: formData.cost ? parseFloat(formData.cost) : 0,
            quantity: formData.quantity ? parseInt(formData.quantity) : 0,
            minStock: formData.minStock ? parseInt(formData.minStock) : 5,
        });
    };

    const marginPercent =
        formData.price && formData.cost
            ? (((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.price)) * 100).toFixed(0)
            : null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Menu Baru</h1>
                    <p className="text-gray-500 mt-0.5 text-sm">Isi semua informasi produk/menu dengan lengkap</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Top: Gambar & Preview */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-base font-bold text-gray-800 mb-4">Foto Produk</h2>
                    <div className="flex gap-6 items-start">
                        {/* Preview */}
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
                            {/* Upload file */}
                            <label className="flex items-center gap-2 w-full cursor-pointer px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <Upload size={16} />
                                {isUploading ? 'Mengupload...' : 'Upload Foto dari Komputer'}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                            </label>

                            {/* Or URL */}
                            <div className="relative">
                                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                                    placeholder="Atau masukkan URL gambar..."
                                />
                            </div>
                            <p className="text-xs text-gray-400">Format: JPG, PNG, WEBP. Maks 5MB.</p>
                        </div>
                    </div>
                </div>

                {/* Info Dasar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                    <h2 className="text-base font-bold text-gray-800">Informasi Menu</h2>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nama Menu / Produk <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            placeholder="Cth: Ayam Bakar Serundeng"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Deskripsi
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                            placeholder="Tuliskan deskripsi yang menarik dan informatif..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            >
                                <option value="">Pilih kategori...</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Satuan <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            >
                                {UNIT_OPTIONS.map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Harga */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                    <h2 className="text-base font-bold text-gray-800">Harga</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Harga Jual (Rp) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="100"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                placeholder="15000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Harga Modal / HPP (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="100"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                placeholder="10000"
                            />
                        </div>
                    </div>

                    {/* Margin Preview */}
                    {marginPercent !== null && (
                        <div className={`flex justify-between items-center px-4 py-3 rounded-xl text-sm font-semibold border ${parseInt(marginPercent) >= 30 ? 'bg-green-50 border-green-200 text-green-800' : parseInt(marginPercent) >= 15 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                            <span>Estimasi Margin Keuntungan</span>
                            <span className="text-lg font-black">{marginPercent}%</span>
                        </div>
                    )}
                </div>

                {/* Stok */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                    <h2 className="text-base font-bold text-gray-800">Stok Awal</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Jumlah Stok Awal
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Batas Minimum Stok <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                placeholder="5"
                            />
                            <p className="text-xs text-gray-400 mt-1">Peringatan muncul jika stok ≤ angka ini</p>
                        </div>
                    </div>
                </div>

                {/* Availability */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="isAvailable"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                className="sr-only"
                            />
                            <div className={`w-12 h-6 rounded-full transition-colors ${formData.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Tampilkan di Menu Kasir</p>
                            <p className="text-xs text-gray-500">Produk akan {formData.isAvailable ? 'tersedia' : 'tidak tersedia'} untuk dipesan</p>
                        </div>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pb-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 font-bold shadow-sm"
                    >
                        <Save size={20} />
                        {createMutation.isPending ? 'Menyimpan...' : 'Simpan Menu Baru'}
                    </button>
                    <Link
                        href="/admin/products"
                        className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                        Batal
                    </Link>
                </div>
            </div>
        </div>
    );
}
