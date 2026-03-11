'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Save, Store } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function StoreProfilePage() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [settings, setSettings] = useState({
        storeName: '',
        storeAddress: '',
        storePhone: '',
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(prev => ({ ...prev, ...response.data.data }));
            if (response.data.data.logoUrl) {
                setPreviewLogo(response.data.data.logoUrl.startsWith('http')
                    ? response.data.data.logoUrl
                    : `${process.env.NEXT_PUBLIC_API_URL}${response.data.data.logoUrl}`);
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    const handleUploadLogo = async () => {
        if (!logoFile) return;

        const formData = new FormData();
        formData.append('file', logoFile);

        try {
            await api.post('/settings/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Logo berhasil diupload');
            setLogoFile(null);
        } catch (error: any) {
            console.error('Upload logo error:', error);
            toast.error(error.response?.data?.message || 'Gagal upload logo');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (logoFile) {
                await handleUploadLogo();
            }

            await api.patch('/settings', settings);
            toast.success('Profil Toko berhasil disimpan');
            fetchSettings();
        } catch (error: any) {
            console.error('Update settings error:', error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan');
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.role === 'CASHIER') {
        return (
            <div className="p-8 text-center text-red-500">
                Anda tidak memiliki akses ke halaman ini.
            </div>
        );
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Profil Toko</h1>
                <p className="text-muted-foreground">
                    Konfigurasi informasi restoran dan logo.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2">Informasi Restoran</h2>

                    <div className="grid gap-2 border-b pb-4 mb-4">
                        <label className="text-sm font-medium">Logo Restoran</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                                {previewLogo ? (
                                    <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <Store className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Nama Restoran</label>
                        <input
                            type="text"
                            name="storeName"
                            value={settings.storeName}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Contoh: Sambel Cimahi"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Alamat</label>
                        <textarea
                            name="storeAddress"
                            value={settings.storeAddress}
                            onChange={handleChange}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Alamat lengkap restoran"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Nomor Telepon</label>
                        <input
                            type="text"
                            name="storePhone"
                            value={settings.storePhone}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="0812..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700 h-11 px-8 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="ml-2">Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                <span className="ml-2">Simpan Profil Toko</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
