'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/lib/store/cart';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import PaymentModal from './PaymentModal';

export default function Cart() {
    const {
        items, updateQuantity, removeItem, getTotal, getItemCount,
        getSubtotal, getTax, getService, discount, orderType,
        setDiscount, setOrderType, setTaxRate, taxRate
    } = useCartStore();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const total = getTotal();
    const itemCount = getItemCount();
    const subtotal = getSubtotal();
    const tax = getTax();

    // Fetch active taxes on mount to keep it synced with Settings
    const { data: taxesData } = useQuery({
        queryKey: ['taxes'],
        queryFn: async () => {
            const { default: api } = await import('@/lib/api');
            const response = await api.get('/taxes');
            return response.data.data;
        }
    });

    useEffect(() => {
        if (taxesData) {
            const activeTax = taxesData.find((t: any) => t.isActive);
            setTaxRate(activeTax ? activeTax.rate : 0);
        }
    }, [taxesData, setTaxRate]);

    return (
        <>
            <div className="w-72 md:w-80 lg:w-96 shrink-0 bg-white border-l border-gray-200 flex flex-col">
                {/* Cart Header */}
                <div className="p-5 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-gray-900">Pesanan Saat Ini</h2>
                        <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {itemCount} Item
                        </div>
                    </div>
                    {/* Order Type Selector */}
                    <div className="flex bg-gray-200/70 p-1 rounded-lg">
                        <button
                            onClick={() => setOrderType('DINE_IN')}
                            className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${orderType === 'DINE_IN' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Dine-In
                        </button>
                        <button
                            onClick={() => setOrderType('TAKEAWAY')}
                            className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${orderType === 'TAKEAWAY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Takeaway
                        </button>
                        <button
                            onClick={() => setOrderType('DELIVERY')}
                            className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${orderType === 'DELIVERY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Delivery
                        </button>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingBag className="w-16 h-16 mb-4" />
                            <p className="text-center">Keranjang masih kosong</p>
                            <p className="text-sm text-center mt-1">Pilih produk untuk memulai</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.product.id}
                                className="bg-gray-50 rounded-lg p-4 space-y-3"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {formatCurrency(Number(item.product.price))}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.product.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.product.id, item.quantity - 1)
                                            }
                                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-semibold">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.product.id, item.quantity + 1)
                                            }
                                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="font-bold text-gray-900">
                                        {formatCurrency(Number(item.product.price) * item.quantity)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer */}
                <div className="p-5 border-t border-gray-200 bg-gray-50/50 space-y-4">
                    <div className="space-y-2.5">
                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                            <span>Subtotal</span>
                            <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                        </div>

                        {/* Discount Input Area */}
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-500">Diskon</span>
                            <div className="flex items-center gap-2">
                                <span className="text-red-600">-</span>
                                <input
                                    type="number"
                                    value={discount || ''}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                    placeholder="0"
                                    className="w-24 px-2 py-1 text-right border border-gray-200 rounded shrink-0 focus:outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        {/* Dynamic Tax Display */}
                        {tax > 0 && (
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-500">Pajak (PB1 {taxRate}%)</span>
                                <span className="text-gray-900">{formatCurrency(tax)}</span>
                            </div>
                        )}
                        <div className="pt-2 mt-2 border-t border-gray-200 border-dashed flex justify-between items-end">
                            <span className="text-gray-500 font-bold">TOTAL TAGIHAN</span>
                            <span className="text-2xl font-black text-red-700 flex items-start gap-1">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={items.length === 0}
                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-gray-900/20 text-lg"
                    >
                        <CreditCard className="w-5 h-5" />
                        Lanjut Pembayaran
                    </button>
                </div>
            </div>

            {showPaymentModal && (
                <PaymentModal
                    total={total}
                    onClose={() => setShowPaymentModal(false)}
                />
            )}
        </>
    );
}
