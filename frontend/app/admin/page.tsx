'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import StatsCard from '@/components/admin/StatsCard';
import { DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const MOCK_RECENT_ORDERS = [
    { id: '#26839628288', table: 'Table 14', customer: 'Muhammed Fateh', date: '22 Dec 2024 at 11:20', items: 5, amount: 125000, status: 'Delivered' },
    { id: '#26839628289', table: 'Takeaway', customer: 'Mukarram Kazi', date: '22 Dec 2024 at 11:30', items: 2, amount: 45000, status: 'Process' },
    { id: '#26839628290', table: 'Table 02', customer: 'Alex Johnson', date: '22 Dec 2024 at 11:45', items: 8, amount: 250000, status: 'Pending' },
    { id: '#26839628291', table: 'Gojek', customer: 'Siti Aminah', date: '22 Dec 2024 at 12:00', items: 1, amount: 15000, status: 'Canceled' },
];

interface DashboardStats {
    todaySales: number;
    todayOrders: number;
    lowStockCount: number;
    activeProducts: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        todaySales: 0,
        todayOrders: 0,
        lowStockCount: 0,
        activeProducts: 0,
    });

    // Fetch daily sales report
    const { data: dailySales } = useQuery({
        queryKey: ['sales', 'daily'],
        queryFn: async () => {
            const response = await api.get('/reports/sales/daily');
            return response.data.data;
        },
    });

    // Fetch low stock items
    const { data: lowStock } = useQuery({
        queryKey: ['stocks', 'low'],
        queryFn: async () => {
            const response = await api.get('/stocks/low');
            return response.data.data;
        },
    });

    // Fetch products count
    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await api.get('/products');
            return response.data.data;
        },
    });

    // Fetch best selling products
    const { data: bestSelling } = useQuery({
        queryKey: ['reports', 'best-selling'],
        queryFn: async () => {
            const response = await api.get('/reports/products/best-selling');
            return response.data.data;
        },
    });

    useEffect(() => {
        if (Array.isArray(dailySales)) {
            const today = dailySales.find((item: any) => {
                const itemDate = format(new Date(item.date), 'yyyy-MM-dd');
                const todayDate = format(new Date(), 'yyyy-MM-dd');
                return itemDate === todayDate;
            });

            setStats((prev) => ({
                ...prev,
                todaySales: today?.totalSales || 0,
                todayOrders: today?.orderCount || 0,
            }));
        }
    }, [dailySales]);

    useEffect(() => {
        if (Array.isArray(lowStock)) {
            setStats((prev) => ({
                ...prev,
                lowStockCount: lowStock.length,
            }));
        }
    }, [lowStock]);

    useEffect(() => {
        if (Array.isArray(products)) {
            const activeCount = products.filter((p: any) => p.isAvailable).length;
            setStats((prev) => ({
                ...prev,
                activeProducts: activeCount,
            }));
        }
    }, [products]);

    // Prepare chart data
    // Prepare chart data
    const revenueData = Array.isArray(dailySales) ? dailySales.slice(-7).map((item: any) => ({
        date: format(new Date(item.date), 'MMM dd'),
        revenue: item.totalSales,
    })) : [];

    const topProductsData = Array.isArray(bestSelling) ? bestSelling
        .filter((item: any) => item.product) // Filter out items with null product
        .slice(0, 5)
        .map((item: any) => ({
            name: item.product.name.length > 15 ? item.product.name.substring(0, 15) + '...' : item.product.name,
            sales: item.totalQuantity,
        })) : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1.5 text-sm font-medium">Ringkasan performa bisnis Anda hari ini.</p>
                </div>
                <div className="hidden sm:block">
                    <div className="bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        {format(new Date(), 'EEEE, dd MMMM yyyy')}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Penjualan Hari Ini"
                    value={`Rp ${stats.todaySales.toLocaleString('id-ID')}`}
                    icon={DollarSign}
                    iconBgColor="bg-emerald-50"
                    iconColor="text-emerald-600"
                />
                <StatsCard
                    title="Order Hari Ini"
                    value={stats.todayOrders}
                    icon={ShoppingCart}
                    iconBgColor="bg-blue-50"
                    iconColor="text-blue-500"
                />
                <StatsCard
                    title="Produk Aktif"
                    value={stats.activeProducts}
                    icon={Package}
                    iconBgColor="bg-orange-50"
                    iconColor="text-orange-500"
                />
                <StatsCard
                    title="Peringatan Stok"
                    value={stats.lowStockCount}
                    icon={AlertTriangle}
                    iconBgColor="bg-rose-50"
                    iconColor="text-rose-500"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        Tren Pendapatan (7 Hari)
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                            <Tooltip
                                cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#059669"
                                strokeWidth={3}
                                dot={{ fill: '#059669', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        5 Produk Terlaris
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProductsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Bar dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStock && lowStock.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
                    <div className="bg-rose-50/50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 rounded-lg">
                                <AlertTriangle className="text-rose-600" size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-rose-900">Peringatan Stok Menipis</h2>
                        </div>
                        <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                            {lowStock.length} Item Perlu Perhatian
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {lowStock.slice(0, 5).map((item: any) => (
                            <div
                                key={item.productId}
                                className="flex justify-between items-center px-6 py-4 hover:bg-gray-50/80 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                        <Package className="text-gray-400" size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 leading-tight mb-0.5">{item.product.name}</p>
                                        <p className="text-xs text-gray-500">Min. Stok: {item.minStock} {item.product.unit}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-rose-600 font-bold text-lg">
                                        {item.quantity}
                                    </span>
                                    <span className="text-gray-500 text-xs font-medium ml-1.5 uppercase tracking-wider">{item.product.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {lowStock.length > 5 && (
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-center">
                            <span className="text-sm font-medium text-gray-500">
                                +{lowStock.length - 5} item lainnya
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Order Activities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="px-6 py-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Order Activities</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Keep track of recent order activities</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select className="bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-gray-200">
                            <option>Status: All</option>
                            <option>Delivered</option>
                        </select>
                        <select className="bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-gray-200">
                            <option>Days: Today</option>
                            <option>Yesterday</option>
                        </select>
                    </div>
                </div>
                <div className="p-6 overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/80 text-left border-b border-gray-100">
                                <th className="px-4 py-3 rounded-l-xl text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type / Table</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Total Item</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 rounded-r-xl text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {MOCK_RECENT_ORDERS.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">{order.id}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600 font-medium">{order.table}</td>
                                    <td className="px-4 py-4 text-sm text-gray-600">{order.customer}</td>
                                    <td className="px-4 py-4 text-xs font-medium text-gray-500">{order.date}</td>
                                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-center">{order.items}</td>
                                    <td className="px-4 py-4 text-sm font-bold text-gray-900">Rp {order.amount.toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 text-[11px] uppercase tracking-wider font-bold rounded-lg border ${order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-200' :
                                                order.status === 'Process' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    order.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                        'bg-rose-50 text-rose-600 border-rose-200'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
