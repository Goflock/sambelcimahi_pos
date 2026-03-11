'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Package, Calendar, Wallet, TrendingDown } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState(7);

    // Fetch daily sales
    const { data: dailySales } = useQuery({
        queryKey: ['reports', 'sales', 'daily'],
        queryFn: async () => {
            const response = await api.get('/reports/sales/daily');
            return response.data.data;
        },
    });

    // Fetch monthly sales
    const { data: monthlySales } = useQuery({
        queryKey: ['reports', 'sales', 'monthly'],
        queryFn: async () => {
            const response = await api.get('/reports/sales/monthly');
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

    // Fetch stock report
    const { data: stockReport } = useQuery({
        queryKey: ['reports', 'stocks'],
        queryFn: async () => {
            const response = await api.get('/reports/stocks');
            return response.data.data;
        },
    });

    // Fetch financial summary based on selected date range
    const startDate = subDays(new Date(), dateRange).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const { data: financialSummary } = useQuery({
        queryKey: ['reports', 'financial', dateRange],
        queryFn: async () => {
            const response = await api.get(`/reports/financial-summary?startDate=${startDate}&endDate=${endDate}`);
            return response.data.data;
        },
    });

    // Prepare chart data
    // Prepare chart data
    const salesChartData = Array.isArray(dailySales) ? dailySales.slice(-dateRange).map((item: any) => ({
        date: item.date ? format(new Date(item.date), 'MMM dd') : 'Unknown',
        sales: item.totalSales,
        orders: item.orderCount,
    })) : [];

    const topProductsData = Array.isArray(bestSelling) ? bestSelling
        .filter((item: any) => item.product)
        .slice(0, 8)
        .map((item: any) => ({
            name: item.product?.name ? (item.product.name.length > 20 ? item.product.name.substring(0, 20) + '...' : item.product.name) : 'Unknown Product',
            quantity: item.totalQuantity,
            revenue: item.totalRevenue,
        })) : [];

    const categoryData = Array.isArray(stockReport?.categoryDistribution) ? stockReport.categoryDistribution.map((item: any) => ({
        name: item.category,
        value: item.totalValue,
    })) : [];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    // Calculate totals
    const totalRevenue = Array.isArray(dailySales) ? dailySales.reduce((sum: number, item: any) => sum + item.totalSales, 0) : 0;
    const totalOrders = Array.isArray(dailySales) ? dailySales.reduce((sum: number, item: any) => sum + item.orderCount, 0) : 0;
    const totalProducts = Array.isArray(bestSelling) ? bestSelling.reduce((sum: number, item: any) => sum + item.totalQuantity, 0) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-600 mt-1">Comprehensive business insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-gray-600" />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gross Revenue */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign size={32} />
                        <span className="text-sm opacity-90">Gross Revenue</span>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(financialSummary?.financials?.totalRevenue || 0)}</p>
                    <p className="text-sm opacity-90 mt-2">Last {dateRange} days</p>
                </div>

                {/* Expenses */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Wallet size={32} />
                        <span className="text-sm opacity-90">Operational Expenses</span>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(financialSummary?.financials?.totalExpenses || 0)}</p>
                    <p className="text-sm opacity-90 mt-2">Last {dateRange} days</p>
                </div>

                {/* Net Profit */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp size={32} />
                        <span className="text-sm opacity-90">Net Profit</span>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(financialSummary?.financials?.netProfit || 0)}</p>
                    <p className="text-sm opacity-90 mt-2 text-emerald-100">
                        Profit Margin: {financialSummary?.metrics?.profitMargin?.toFixed(1) || 0}%
                    </p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                name="Revenue (Rp)"
                            />
                            <Line
                                type="monotone"
                                dataKey="orders"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', r: 4 }}
                                name="Orders"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Value by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topProductsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} angle={-45} textAnchor="end" height={100} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Bar dataKey="quantity" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Quantity Sold" />
                        <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue (Rp)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Stock Report Table */}
            {stockReport && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Stock Summary</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Total Stock Value</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    Rp {stockReport.totalStockValue?.toLocaleString('id-ID') || 0}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stockReport.totalProducts || 0}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {stockReport.lowStockCount || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
