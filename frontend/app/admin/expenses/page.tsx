'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Wallet, Plus, Search, Edit2, Trash2, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Expense {
    id: string;
    category: string;
    amount: number;
    notes?: string;
    date: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
    };
}

export default function ExpensesPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Expenses
    const { data: expenses = [], isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const { data } = await api.get('/expenses');
            return data.data as Expense[];
        },
    });

    // Create / Update Mutation
    const saveMutation = useMutation({
        mutationFn: async (payload: any) => {
            if (editingExpense) {
                return api.patch(`/expenses/${editingExpense.id}`, payload);
            }
            return api.post('/expenses', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success(editingExpense ? 'Pengeluaran diperbarui' : 'Pengeluaran ditambahkan');
            closeModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data');
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/expenses/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Pengeluaran dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus data');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({
            category: formData.category,
            amount: Number(formData.amount),
            notes: formData.notes,
            date: new Date(formData.date).toISOString(),
        });
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setFormData({
            category: expense.category,
            amount: expense.amount.toString(),
            notes: expense.notes || '',
            date: new Date(expense.date).toISOString().split('T')[0],
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Hapus pencatatan pengeluaran ini?')) {
            deleteMutation.mutate(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
        setFormData({
            category: '',
            amount: '',
            notes: '',
            date: new Date().toISOString().split('T')[0],
        });
    };

    const filteredExpenses = expenses.filter(exp =>
        exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-red-600" />
                        Pencatatan Pengeluaran
                    </h1>
                    <p className="text-gray-500 mt-1">Catat dan pantau pengeluaran operasional warung</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Pengeluaran
                </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Pengeluaran (Bulan Ini)</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                </div>
            </div>

            {/* List and Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Cari kategori / catatan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all text-sm"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Tanggal</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Kategori</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Catatan</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Kasir</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">Nominal</th>
                                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">Memuat data...</td>
                                </tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">Belum ada pengeluaran tercatat</td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-6 text-sm text-gray-900 border-b border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {format(new Date(expense.date), 'dd MMM yyyy', { locale: id })}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-900 border-b border-gray-50 font-medium">{expense.category}</td>
                                        <td className="py-3 px-6 text-sm text-gray-500 border-b border-gray-50 max-w-xs truncate">
                                            {expense.notes || '-'}
                                        </td>
                                        <td className="py-3 px-6 text-sm text-gray-500 border-b border-gray-50">{expense.user.name}</td>
                                        <td className="py-3 px-6 text-sm font-bold text-gray-900 border-b border-gray-50 text-right">
                                            {formatCurrency(Number(expense.amount))}
                                        </td>
                                        <td className="py-3 px-6 text-sm border-b border-gray-50">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(expense)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-900">
                                {editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all bg-white"
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    <option value="Bahan Baku">Bahan Baku (Sayur, Daging)</option>
                                    <option value="Bumbu & Bapok">Bumbu & Bahan Pokok</option>
                                    <option value="Listrik & Air">Listrik & Air</option>
                                    <option value="Gaji Karyawan">Gaji Karyawan</option>
                                    <option value="Peralatan">Peralatan Rusak / Baru</option>
                                    <option value="Lainnya">Lainnya...</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nominal (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                                    placeholder="Contoh: 50000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Opsional</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                                    placeholder="Beli gas 3kg, plastik kresek, dll"
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                    disabled={saveMutation.isPending}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
                                    disabled={saveMutation.isPending}
                                >
                                    {saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
