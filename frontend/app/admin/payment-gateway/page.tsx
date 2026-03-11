'use client';

import { useState } from 'react';
import { CreditCard, Key, History, Save, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PaymentGatewayPage() {
    const [activeTab, setActiveTab] = useState('config');
    const [isLoading, setIsLoading] = useState(false);

    // Mock Config State
    const [config, setConfig] = useState({
        provider: 'midtrans',
        environment: 'sandbox',
        serverKey: 'SB-Mid-server-xxxxxxxxxxxx',
        clientKey: 'SB-Mid-client-xxxxxxxxxxxx',
        merchantId: '',
    });

    // Mock Transactions Data
    const transactions = [
        { id: 'TRX-001', date: '2024-03-10 14:30', amount: 150000, method: 'QRIS', status: 'success' },
        { id: 'TRX-002', date: '2024-03-10 15:45', amount: 250000, method: 'Bank Transfer', status: 'pending' },
        { id: 'TRX-003', date: '2024-03-10 16:20', amount: 75000, method: 'QRIS', status: 'failed' },
    ];

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Konfigurasi Payment Gateway berhasil disimpan');
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Payment Gateway</h1>
                <p className="text-muted-foreground">
                    Kelola integrasi pembayaran digital dan riwayat transaksi.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <aside className="w-full md:w-64 shrink-0 space-y-2">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'config'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Key className="w-5 h-5" />
                        Konfigurasi API
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'transactions'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <History className="w-5 h-5" />
                        Riwayat Transaksi
                    </button>
                </aside>

                <div className="flex-1">
                    {/* Configuration Tab */}
                    {activeTab === 'config' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h2 className="font-semibold text-lg border-b pb-4 mb-4 flex items-center gap-2">
                                <Key className="w-5 h-5 text-blue-600" />
                                Konfigurasi Midtrans / Xendit
                            </h2>

                            <form onSubmit={handleSaveConfig} className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Provider Gateway</label>
                                    <select
                                        name="provider"
                                        value={config.provider}
                                        onChange={handleConfigChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="midtrans">Midtrans</option>
                                        <option value="xendit">Xendit</option>
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Environment</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="environment"
                                                value="sandbox"
                                                checked={config.environment === 'sandbox'}
                                                onChange={handleConfigChange}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm">Sandbox (Test)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="environment"
                                                value="production"
                                                checked={config.environment === 'production'}
                                                onChange={handleConfigChange}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm">Production (Live)</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Server Key</label>
                                    <input
                                        type="password"
                                        name="serverKey"
                                        value={config.serverKey}
                                        onChange={handleConfigChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="Paste Server Key here"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Client Key</label>
                                    <input
                                        type="text"
                                        name="clientKey"
                                        value={config.clientKey}
                                        onChange={handleConfigChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="Paste Client Key here"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-11 px-8"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Simpan Konfigurasi
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="font-semibold text-lg flex items-center gap-2">
                                    <History className="w-5 h-5 text-purple-600" />
                                    Riwayat Transaksi Gateway
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">ID Transaksi</th>
                                            <th className="px-6 py-3">Waktu</th>
                                            <th className="px-6 py-3">Metode</th>
                                            <th className="px-6 py-3 text-right">Jumlah</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((trx) => (
                                            <tr key={trx.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {trx.id}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {trx.date}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {trx.method}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    Rp {trx.amount.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {trx.status === 'success' && (
                                                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                                            <CheckCircle className="w-4 h-4" /> Sukses
                                                        </span>
                                                    )}
                                                    {trx.status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 text-yellow-600 font-medium">
                                                            <Loader2 className="w-4 h-4 animate-spin" /> Pending
                                                        </span>
                                                    )}
                                                    {trx.status === 'failed' && (
                                                        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                                            <XCircle className="w-4 h-4" /> Gagal
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t bg-gray-50 text-center text-xs text-gray-500">
                                Menampilkan 3 dari 3 transaksi terbaru
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
