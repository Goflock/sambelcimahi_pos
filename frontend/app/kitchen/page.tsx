'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useKitchenSocket } from '@/lib/hooks/useKitchenSocket';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Toaster, toast } from 'sonner';
import {
    ChefHat,
    Clock,
    Wifi,
    WifiOff,
    CheckCircle2,
    Flame,
    AlertCircle
} from 'lucide-react';

interface KitchenOrder {
    id: string;
    orderId: string;
    orderNumber: string;
    tableNumber: string | null;
    status: 'PENDING' | 'COOKING' | 'DONE';
    priority: number;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
    order: {
        customerName: string | null;
        orderType: string;
        source?: 'POS' | 'WEB';
        orderItems: Array<{
            quantity: number;
            notes: string | null;
            product: {
                name: string;
                category: {
                    name: string;
                };
            };
        }>;
    };
}

export default function KitchenPage() {
    const router = useRouter();
    const { user, token } = useAuthStore();
    const { orders, isConnected, setOrders } = useKitchenSocket();
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch initial orders
        fetchOrders();
    }, [isMounted, token, router]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/kitchen/orders');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Gagal memuat pesanan');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, status: 'COOKING' | 'DONE') => {
        try {
            const response = await api.patch(`/kitchen/orders/${orderId}/status`, {
                status,
            });

            if (response.data.success) {
                toast.success(`Status diubah ke ${status}`);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Gagal mengubah status');
            // Revert optimistic update by refetching
            fetchOrders();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500';
            case 'COOKING':
                return 'bg-orange-500';
            case 'DONE':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <AlertCircle className="w-5 h-5" />;
            case 'COOKING':
                return <Flame className="w-5 h-5" />;
            case 'DONE':
                return <CheckCircle2 className="w-5 h-5" />;
            default:
                return null;
        }
    };

    // Guard rendering
    if (!isMounted || !token) {
        return (
            <div className="flex items-center justify-center p-8 bg-gray-900 min-h-screen text-white">
                Memuat autentikasi...
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Toaster position="top-right" richColors />

            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ChefHat className="w-8 h-8 text-orange-500" />
                            <div>
                                <h1 className="text-2xl font-bold">Kitchen Display</h1>
                                <p className="text-sm text-gray-400">
                                    {user?.name} - {user?.role}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Connection Status */}
                            <div className="flex items-center gap-2">
                                {isConnected ? (
                                    <>
                                        <Wifi className="w-5 h-5 text-green-500" />
                                        <span className="text-sm text-green-500">Connected</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-5 h-5 text-red-500" />
                                        <span className="text-sm text-red-500">Disconnected</span>
                                    </>
                                )}
                            </div>

                            {/* Order Count */}
                            <div className="bg-gray-700 px-4 py-2 rounded-lg">
                                <span className="text-sm text-gray-400">Active Orders:</span>
                                <span className="ml-2 text-xl font-bold">{orders.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Orders Grid */}
            <main className="container mx-auto px-4 py-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <ChefHat className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                        <p className="text-xl text-gray-400">No active orders</p>
                        <p className="text-sm text-gray-500 mt-2">
                            New orders will appear here automatically
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={updateStatus}
                                getStatusColor={getStatusColor}
                                getStatusIcon={getStatusIcon}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// Order Card Component
function OrderCard({
    order,
    onUpdateStatus,
    getStatusColor,
    getStatusIcon,
}: {
    order: KitchenOrder;
    onUpdateStatus: (id: string, status: 'COOKING' | 'DONE') => void;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
}) {
    const timeElapsed = formatDistanceToNow(new Date(order.createdAt), {
        addSuffix: true,
        locale: localeId,
    });

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
            {/* Header */}
            <div className={`${getStatusColor(order.status)} px-4 py-3`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="font-bold text-lg">{order.orderNumber}</span>
                        {order.order?.source === 'WEB' && (
                            <span className="bg-blue-600/20 text-blue-100 border border-blue-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm ml-1">WEB</span>
                        )}
                    </div>
                    {order.tableNumber && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                            Meja {order.tableNumber}
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{timeElapsed}</span>
                </div>

                {/* Customer */}
                {order.order?.customerName && (
                    <p className="text-sm text-gray-400 mb-3">
                        Customer: <span className="text-white">{order.order.customerName}</span>
                    </p>
                )}

                {/* Items */}
                <div className="space-y-2 mb-4">
                    {order.order?.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="bg-gray-700 px-2 py-1 rounded text-sm font-bold">
                                        {item.quantity}x
                                    </span>
                                    <span className="font-medium">{item.product?.name || 'Unknown Product'}</span>
                                </div>
                                {item.notes && (
                                    <p className="text-sm text-yellow-400 mt-1 ml-10">
                                        Note: {item.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {order.status === 'PENDING' && (
                        <button
                            onClick={() => onUpdateStatus(order.id, 'COOKING')}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                        >
                            Start Cooking
                        </button>
                    )}
                    {order.status === 'COOKING' && (
                        <button
                            onClick={() => onUpdateStatus(order.id, 'DONE')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                        >
                            Mark Done
                        </button>
                    )}
                    {order.status === 'DONE' && (
                        <div className="flex-1 bg-green-600/20 text-green-400 py-2 px-4 rounded-lg font-semibold text-center">
                            Completed ✓
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
