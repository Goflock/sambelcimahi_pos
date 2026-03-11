'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Save, Printer } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function PrinterSettingsPage() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [settings, setSettings] = useState({
        printerIp: '',
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.patch('/settings', settings);
            toast.success('Pengaturan Printer berhasil disimpan');
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
                <h1 className="text-2xl font-bold tracking-tight">Printer & Hardware</h1>
                <p className="text-muted-foreground">Konfigurasi perangkat keras cetak resi dan laci uang.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                        <Printer className="w-5 h-5 text-gray-500" />
                        Printer Kasir
                    </h2>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">IP Printer (Opsional / LAN Printer)</label>
                        <input
                            type="text"
                            name="printerIp"
                            value={settings.printerIp}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Contoh: 192.168.1.100"
                        />
                        <p className="text-xs text-gray-500">
                            Biarkan kosong jika sistem kasir beroperasi menggunakan mode Bluetooth Thermal Native (Android) atau Browser Web Printing.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700 h-11 px-8 disabled:opacity-50">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
