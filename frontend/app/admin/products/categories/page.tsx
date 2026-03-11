'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Search, Edit, Trash2, ListTree, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    description: string;
    products?: any[];
}

export default function CategoriesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data.data as Category[];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Kategori berhasil dihapus');
        },
        onError: (error: any) => {
            if (error.response?.data?.message?.includes('produk terkait')) {
                toast.error('Tidak bisa menghapus kategori yang masih memiliki produk', {
                    description: 'Silakan pindahkan atau hapus produk di dalamnya terlebih dahulu',
                });
            } else {
                toast.error('Gagal menghapus kategori');
            }
        },
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredCategories = Array.isArray(categories) ? categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-medium text-gray-900 tracking-tight">Kategori Menu</h1>
                    <p className="text-gray-500 mt-1">Kelola direktori kategori untuk semua produk Anda.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari kategori..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    {/* Coming Soon Feature */}
                    <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-bold whitespace-nowrap shadow-sm">
                        <Plus size={18} />
                        Tambah Kategori
                    </button>
                </div>
            </div>

            {/* Categories List (Table Format) */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4 text-sm font-medium">Memuat kategori...</p>
                        </div>
                    ) : filteredCategories && filteredCategories.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Jumlah Menu</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                                                    <ListTree size={20} />
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-sm">{category.name}</h3>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-600 max-w-md truncate">
                                                {category.description || '-'}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700">
                                                {category.products?.length || 0}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip" title="Edit Kategori">
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id, category.name)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                                                    title="Hapus Kategori"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-16">
                            <ListTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Belum ada kategori ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
