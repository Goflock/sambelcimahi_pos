'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Save, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function PaymentSettingsPage() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [settings, setSettings] = useState({
        taxRate: '0',
        serviceCharge: '0',
    });

    const [paymentMethods, setPaymentMethods] = useState([
        { id: 'cash', name: 'Tunai', enabled: true },
        { id: 'qris', name: 'QRIS', enabled: false },
        { id: 'transfer', name: 'Bank Transfer', enabled: false },
        { id: 'debit', name: 'Debit Card', enabled: false },
    ]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(prev => ({ ...prev, ...response.data.data }));
        } catch (error) {
            console.error('Fetch settings error:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentMethodToggle = (id: string) => {
        setPaymentMethods(prev => prev.map(method =>
            method.id === id ? { ...method, enabled: !method.enabled } : method
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.patch('/settings', settings);
            toast.success('Pengaturan Pembayaran & Pajak disimpan');
        } catch (error: any) {
            console.error('Update settings error:', error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan');
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.role === 'CASHIER') {
        return <div className="p-8 text-center text-red-500">Akses ditolak.</div>;
    }

    if (isFetching) {
        return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Pembayaran & Pajak</h1>
                <p className="text-muted-foreground">Kustomisasi kalkulasi perpajakan dan metode kasir.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2">Komponen Biaya</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Pajak PPN (%)</label>
                            <input
                                type="number"
                                name="taxRate"
                                value={settings.taxRate}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="0" min="0" max="100"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Service Charge (%)</label>
                            <input
                                type="number"
                                name="serviceCharge"
                                value={settings.serviceCharge}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="0" min="0" max="100"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2">Metode Pembayaran Aktif</h2>
                    <div className="grid gap-4">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${method.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{method.name}</p>
                                        <p className="text-xs text-gray-500">{method.enabled ? 'Aktif' : 'Nonaktif'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={method.enabled}
                                            onChange={() => handlePaymentMethodToggle(method.id)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700 h-11 px-8 disabled:opacity-50">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Menyimpan...' : 'Simpan Pembayaran'}
                    </button>
                </div>
            </form>
        </div>
    );
}
