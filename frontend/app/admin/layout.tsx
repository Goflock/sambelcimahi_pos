'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, token } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // Check authentication
        if (!token) {
            router.push('/login');
            return;
        }

        // Check if user has admin access
        if (user && user.role !== 'OWNER' && user.role !== 'ADMIN') {
            router.push('/cashier');
        }
    }, [isMounted, user, token, router]);

    // Show loading only during initial mount
    if (!isMounted || !token) {
        return null;
    }

    // Check if user has admin access for rendering
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Sidebar />
            <main className="lg:ml-72 min-h-screen pb-12">
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
