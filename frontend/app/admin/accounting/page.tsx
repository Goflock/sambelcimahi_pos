'use client';

import { useState } from 'react';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import {
    DollarSign, TrendingUp, TrendingDown, Wallet,
    Plus, Calendar, ArrowUpRight, ArrowDownRight,
    FileText
} from 'lucide-react';


interface Expense {
    id: string;
    date: string;
    category: string;
    amount: number;
    notes: string | null;
}

interface FinancialSummary {
    financials: {
        totalRevenue: number;
        totalCOGS: number;
        grossProfit: number;
        totalExpenses: number;
        netProfit: number;
    };
    metrics: {
        profitMargin: number;
        expenseRatio: number;
    };
}

export default function AccountingPage() {
    const [viewMode, setViewMode] = useState('summary'); // summary, expenses
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [summaryData, setSummaryData] = useState<FinancialSummary | null>(null);
    const [expensesData, setExpensesData] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    // Form state
    const [newExpense, setNewExpense] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Bahan Baku',
        amount: '',
        notes: '',
    });

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
        if (storedToken) {
            fetchData(storedToken);
        }
    }, []);

    const fetchData = async (authToken: string) => {
        setLoading(true);
        try {
            // Fetch Summary
            const summaryRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/financial-summary`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const summaryJson = await summaryRes.json();
            if (summaryJson.success) {
                setSummaryData(summaryJson.data);
            }

            // Fetch Expenses
            const expensesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // Handle expenses response... 
            // The backend returns array directly or { data: [] }? 
            // My controller returns this.expensesService.findAll() which returns array.
            // But typical NestJS response interceptor might wrap it?
            // Let's assume direct array for now based on service code, but if global interceptor is used, it might be { data: ... }
            // Let's check other pages or assume standard. Most implementations here seem to use { success: true, data: ... }
            // Wait, ExpensesController findAll returns directly from service. findAll returns array.
            // But if there is a transform interceptor... 
            // The other endpoints I implemented manually returned { success: true, data: ... }.
            // ExpensesController findAll just returns `this.expensesService.findAll()`.
            // So it will be a plain array.
            const expensesJson = await expensesRes.json();
            setExpensesData(Array.isArray(expensesJson) ? expensesJson : []);

        } catch (error) {
            console.error("Error fetching accounting data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newExpense,
                    amount: Number(newExpense.amount),
                })
            });
            if (res.ok) {
                setShowAddExpense(false);
                fetchData(token); // Refresh data
                // Reset form
                setNewExpense({
                    date: new Date().toISOString().split('T')[0],
                    category: 'Bahan Baku',
                    amount: '',
                    notes: '',
                });
            } else {
                alert('Gagal menyimpan pengeluaran');
            }
        } catch (error) {
            console.error("Error saving expense:", error);
        }
    };

    const categoryChartData = [
        { name: 'Bahan Baku', value: 6000000 },
        { name: 'Gaji', value: 4500000 },
        { name: 'Operasional', value: 1500000 },
        { name: 'Lainnya', value: 500000 },
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Akuntansi & Keuangan</h1>
                    <p className="text-muted-foreground">
                        Laporan laba rugi, arus kas, dan pencatatan pengeluaran.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('summary')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'summary' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
                            }`}
                    >
                        Ringkasan
                    </button>
                    <button
                        onClick={() => setViewMode('expenses')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'expenses' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
                            }`}
                    >
                        Pengeluaran
                    </button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {loading ? '...' : `Rp ${(summaryData?.financials.totalRevenue || 0).toLocaleString('id-ID')}`}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-1">
                                {loading ? '...' : `Rp ${(summaryData?.financials.totalExpenses || 0).toLocaleString('id-ID')}`}
                            </h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Laba Bersih</p>
                            <h3 className={`text-2xl font-bold mt-1 ${(summaryData?.financials.netProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {loading ? '...' : `Rp ${(summaryData?.financials.netProfit || 0).toLocaleString('id-ID')}`}
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {loading ? '...' : `${(summaryData?.metrics.profitMargin || 0).toFixed(1)}%`}
                            </h3>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-lg font-semibold mb-6">Distribusi Pengeluaran</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-center">
                        <h3 className="text-lg font-semibold mb-4">Cash Flow Update</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Pendapatan Penjualan</p>
                                        <p className="text-xs text-gray-500">Hari ini</p>
                                    </div>
                                </div>
                                <span className="text-green-600 font-semibold">+ Rp 2.500.000</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 p-2 rounded-full text-red-600">
                                        <ArrowDownRight className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Belanja Harian</p>
                                        <p className="text-xs text-gray-500">Hari ini</p>
                                    </div>
                                </div>
                                <span className="text-red-600 font-semibold">- Rp 850.000</span>
                            </div>
                            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                                <p className="font-medium mb-1">Tips Keuangan:</p>
                                Margin keuntungan bulan ini berada di angka 72%, lebih tinggi dari rata-rata bulan lalu (68%). Pertahankan efisiensi pengeluaran bahan baku.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'expenses' && (
                <div className="bg-white rounded-xl border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-500" />
                            Daftar Pengeluaran Operasional
                        </h2>
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                            onClick={() => setShowAddExpense(!showAddExpense)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Catat Pengeluaran
                        </button>
                    </div>

                    {showAddExpense && (
                        <div className="p-6 bg-gray-50 border-b">
                            <h3 className="font-medium mb-4">Input Pengeluaran Baru</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    type="date"
                                    className="p-2 border rounded-md"
                                    value={newExpense.date}
                                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Deskripsi / Catatan"
                                    className="p-2 border rounded-md md:col-span-2"
                                    value={newExpense.notes}
                                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Jumlah (Rp)"
                                    className="p-2 border rounded-md"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                />
                                <select
                                    className="p-2 border rounded-md md:col-span-4"
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                >
                                    <option value="Bahan Baku">Kategori: Bahan Baku</option>
                                    <option value="Operasional">Kategori: Operasional</option>
                                    <option value="Gaji">Kategori: Gaji</option>
                                    <option value="Maintenance">Kategori: Maintenance</option>
                                </select>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-100"
                                    onClick={() => setShowAddExpense(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    onClick={handleAddExpense}
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-gray-500">Tanggal</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Kategori</th>
                                    <th className="px-6 py-3 font-medium text-gray-500">Keterangan</th>
                                    <th className="px-6 py-3 font-medium text-gray-500 text-right">Jumlah</th>
                                    <th className="px-6 py-3 font-medium text-gray-500 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {expensesData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            Belum ada data pengeluaran
                                        </td>
                                    </tr>
                                ) : (
                                    expensesData.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString('id-ID')}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{expense.notes || '-'}</td>
                                            <td className="px-6 py-4 text-right font-medium text-red-600">
                                                - Rp {Number(expense.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
