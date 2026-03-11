'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogOut, ShoppingCart, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CashierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (!isAuthenticated) {
            router.push('/login');
        } else if (user?.role !== 'CASHIER') {
            toast.error('Akses ditolak. Halaman ini hanya untuk kasir.');
            router.push('/login');
        }
    }, [isMounted, isAuthenticated, user, router]);

    const handleLogout = () => {
        logout();
        toast.success('Berhasil logout');
        router.push('/login');
    };

    if (!isMounted) {
        return null;
    }

    if (!isAuthenticated || user?.role !== 'CASHIER') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 border-r border-gray-100 pr-6 mr-2">
                            <div>
                                <h1 className="text-2xl font-black text-red-700 tracking-tight leading-none">Sambel<span className="text-gray-900">Cimahi</span></h1>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Sistem Kasir Terpadu</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors border border-green-200 shadow-sm mr-2 tooltip" title="Tutup Shift">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-bold tracking-wide">Shift Aktif</span>
                            </button>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Keluar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
}
