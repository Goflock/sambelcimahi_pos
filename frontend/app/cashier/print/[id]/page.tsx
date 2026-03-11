'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        name: string;
    };
}

interface Order {
    id: string;
    orderNumber: string;
    createdAt: string;
    customerName: string;
    subtotal: number;
    total: number;
    paymentMethod: string;
    orderItems: OrderItem[];
    user: {
        name: string;
    };
}

export default function ReceiptPage() {
    const params = useParams();
    const orderId = params.id as string;
    const [autoPrint, setAutoPrint] = useState(false);

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await api.get(`/orders/${orderId}`);
            return response.data.data as Order;
        },
    });

    useEffect(() => {
        if (order && !autoPrint) {
            setAutoPrint(true);
            setTimeout(() => {
                window.print();
                // Optional: Close window after print
                // window.close(); 
            }, 500);
        }
    }, [order, autoPrint]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!order) {
        return <div className="p-8 text-center text-red-500">Order not found</div>;
    }

    return (
        <div className="receipt-container mx-auto p-3 font-mono text-[11px] bg-white text-black leading-snug">
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: 58mm auto; 
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        background: white;
                    }
                    header, footer {
                        display: none !important;
                    }
                }
                .receipt-container {
                    width: 58mm;
                    max-width: 58mm;
                    font-family: 'Courier New', Courier, monospace;
                    background: white;
                    color: #000;
                    margin: 0 auto;
                }
                .dashed-line {
                    border-top: 1px dashed #000;
                    margin: 6px 0;
                }
            `}</style>

            {/* Header */}
            <div className="text-center mb-2">
                <div className="text-[10px] font-bold tracking-widest uppercase">WARUNG NASI</div>
                <div className="text-xl font-bold font-mono tracking-wider leading-none my-1">SAMBEL CIMAHI</div>
                <div className="text-[9px] leading-tight mt-1">
                    Jl. Jendral Sudirman No.82<br />
                    Rangkasbitung, Kabupaten Lebak,<br />
                    Banten 42315
                </div>
            </div>

            <div className="dashed-line"></div>

            {/* Order Info */}
            <div className="flex flex-col gap-0.5 my-2">
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Order:</span>
                    <span>#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{order.user?.name || 'Admin'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{order.customerName || 'Walk-in'}</span>
                </div>
            </div>

            <div className="dashed-line"></div>

            {/* Items */}
            <div className="my-2">
                {order.orderItems.map((item) => (
                    <div key={item.id} className="mb-2 last:mb-0">
                        <div className="font-bold">{item.product.name}</div>
                        <div className="flex justify-between">
                            <span>{item.quantity} x {formatCurrency(item.price)}</span>
                            <span>{formatCurrency(item.quantity * item.price)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashed-line"></div>

            {/* Totals */}
            <div className="flex flex-col gap-0.5 my-2">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-[13px] mt-1">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(order.total)}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Payment:</span>
                    <span>{order.paymentMethod}</span>
                </div>
            </div>

            <div className="dashed-line"></div>

            {/* Footer */}
            <div className="text-center text-[10px] mt-2 mb-2 leading-tight">
                <p>Terima kasih atas kunjungan<br />Anda!</p>
                <div className="mt-1">
                    Barang yang sudah dibeli<br />
                    tidak dapat ditukar/<br />
                    dikembalikan
                </div>
            </div>
        </div>
    );
}
