import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

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

export function useKitchenSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const socketUrl = apiUrl.replace('/api', '');

        const newSocket = io(`${socketUrl}/kitchen`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('✓ Connected to kitchen gateway');
            setIsConnected(true);
            toast.success('Connected to kitchen display');
        });

        newSocket.on('disconnect', () => {
            console.log('✗ Disconnected from kitchen gateway');
            setIsConnected(false);
            toast.error('Disconnected from kitchen display');
        });

        newSocket.on('newOrder', (order: KitchenOrder) => {
            console.log('🆕 New Order:', order);
            setOrders((prev) => [order, ...prev]);

            // Play notification sound
            if (typeof window !== 'undefined') {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(console.error);
            }

            toast.success(`New order: ${order.orderNumber}`, {
                description: `Table ${order.tableNumber || 'N/A'}`,
            });
        });

        newSocket.on('orderStatusUpdate', ({ orderId, status }: { orderId: string; status: string }) => {
            console.log('📝 Status Update:', orderId, status);
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === orderId ? { ...o, status: status as KitchenOrder['status'] } : o
                )
            );
        });

        newSocket.on('orderCompleted', ({ orderId }: { orderId: string }) => {
            console.log('✅ Order Completed:', orderId);
            // Remove from active orders after a delay
            setTimeout(() => {
                setOrders((prev) => prev.filter((o) => o.id !== orderId));
            }, 3000);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const updateOrderStatus = useCallback(
        async (orderId: string, status: 'PENDING' | 'COOKING' | 'DONE') => {
            // Optimistic update
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status } : o))
            );

            // The actual API call will be made from the component
            // This hook just manages the WebSocket state
        },
        []
    );

    return {
        socket,
        orders,
        isConnected,
        updateOrderStatus,
        setOrders,
    };
}
