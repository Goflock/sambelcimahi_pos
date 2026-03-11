'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Column {
    key: string;
    label: string;
    render?: (value: any, item: any) => React.ReactNode;
}

interface FormField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'checkbox' | 'select';
    required?: boolean;
    options?: { label: string; value: any }[]; // For select
}

interface MasterCrudProps {
    title: string;
    endpoint: string;
    columns: Column[];
    fields: FormField[];
    searchKey?: string; // Key to filter by search
}

export default function MasterCrud({ title, endpoint, columns, fields, searchKey = 'name' }: MasterCrudProps) {
    const { user } = useAuthStore();
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchData();
    }, [endpoint]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/${endpoint}`);
            setData(response.data.data || response.data);
        } catch (error) {
            console.error(`Fetch ${endpoint} error:`, error);
            toast.error('Gagal mengambil data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredData = data.filter(item => {
        if (!searchQuery) return true;
        const val = item[searchKey];
        return val && String(val).toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({ ...item });
        } else {
            setEditingItem(null);
            setFormData({});
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({});
        setEditingItem(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev: any) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await api.patch(`/${endpoint}/${editingItem.id}`, formData);
                toast.success('Data berhasil diperbarui');
            } else {
                await api.post(`/${endpoint}`, formData);
                toast.success('Data berhasil ditambahkan');
            }
            handleCloseModal();
            fetchData();
        } catch (error: any) {
            console.error('Submit error:', error);
            const msg = error.response?.data?.message || 'Terjadi kesalahan';
            toast.error(typeof msg === 'string' ? msg : 'Gagal menyimpan data');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah anda yakin ingin menghapus data ini?')) return;
        try {
            await api.delete(`/${endpoint}/${id}`);
            toast.success('Data berhasil dihapus');
            fetchData();
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Gagal menghapus data');
        }
    };

    if (user?.role === 'CASHIER') { // Basic protection
        return <div className="p-8">Akses ditolak</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">Kelola data {title.toLowerCase()}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} />
                    Tambah Data
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="px-6 py-4">No</th>
                                {columns.map(col => (
                                    <th key={col.key} className="px-6 py-4">{col.label}</th>
                                ))}
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" size={20} />
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada data.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 w-16">{index + 1}</td>
                                        {columns.map(col => (
                                            <td key={col.key} className="px-6 py-4">
                                                {col.render ? col.render(item[col.key], item) : item[col.key]}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="font-semibold text-lg">{editingItem ? 'Edit Data' : 'Tambah Data'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <Search className="rotate-45" size={24} /> {/* X icon workaround or import X */}
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {fields.map(field => (
                                <div key={field.key} className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            name={field.key}
                                            required={field.required}
                                            value={formData[field.key] || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            name={field.key}
                                            required={field.required}
                                            value={formData[field.key] || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Pilih...</option>
                                            {field.options?.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'checkbox' ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name={field.key}
                                                checked={formData[field.key] || false}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-600">{field.label}</span>
                                        </div>
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.key}
                                            required={field.required}
                                            value={formData[field.key] || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
