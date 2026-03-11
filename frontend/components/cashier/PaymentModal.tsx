'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, Building2, CheckCircle, Printer, WifiOff, QrCode } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart';
import { saveAndCheckout } from '@/lib/offline/syncService';
import { OfflineOrder } from '@/lib/offline/db';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

interface PaymentModalProps {
    total: number;
    onClose: () => void;
}

type PaymentMethod = 'CASH' | 'DEBIT' | 'QRIS' | 'TRANSFER';

export default function PaymentModal({ total, onClose }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [cashAmount, setCashAmount] = useState<string>('');
    const [customerName, setCustomerName] = useState('');
    const [savedOrder, setSavedOrder] = useState<OfflineOrder | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { items, clearCart, orderType, discount, getSubtotal, getTotal } = useCartStore();

    const change = cashAmount ? Number(cashAmount) - total : 0;

    const { data: settingsData } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const { default: api } = await import('@/lib/api');
            const response = await api.get('/settings');
            return response.data.data;
        }
    });

    const activeFlags = settingsData?.paymentMethods || { cash: true, debit: true, qris: true, transfer: true };

    const paymentMethods = [
        { value: 'CASH', label: 'Tunai', icon: Banknote, active: activeFlags.cash },
        { value: 'DEBIT', label: 'Debit', icon: CreditCard, active: activeFlags.debit },
        { value: 'QRIS', label: 'QRIS', icon: Smartphone, active: activeFlags.qris },
        { value: 'TRANSFER', label: 'Transfer', icon: Building2, active: activeFlags.transfer },
    ].filter(m => m.active);

    // Ensure the default selected method is actually allowed
    useEffect(() => {
        if (paymentMethods.length > 0 && !paymentMethods.find(m => m.value === paymentMethod)) {
            setPaymentMethod(paymentMethods[0].value as PaymentMethod);
        }
    }, [settingsData, paymentMethod, paymentMethods]);

    const handlePayment = async () => {
        if (paymentMethod === 'CASH' && change < 0) {
            toast.error('Jumlah uang tidak cukup');
            return;
        }

        setIsProcessing(true);
        try {
            const order = await saveAndCheckout({
                customerName: customerName || 'Walk-in Customer',
                orderType: orderType,
                paymentMethod,
                items: items.map((item) => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    notes: item.notes ?? '',
                    price: item.product.price,
                })),
                subtotal: getSubtotal(),
                discount,
                total,
            });

            setSavedOrder(order);
            clearCart();

            if (!navigator.onLine) {
                toast.success('Transaksi tersimpan offline! Akan disync saat online.', { duration: 4000 });
            } else {
                toast.success('Transaksi berhasil!');
            }
        } catch (err: any) {
            toast.error(err.message || 'Gagal menyimpan transaksi');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintReceipt = () => {
        if (savedOrder) {
            import('@/lib/offline/printService').then(({ printReceiptBluetooth }) => {
                printReceiptBluetooth(savedOrder);
            });
        }
    };

    const handleClose = () => {
        if (savedOrder) onClose();
    };

    if (savedOrder) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Pembayaran Berhasil!
                    </h2>
                    <p className="text-gray-600 mb-6">Transaksi telah tersimpan</p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handlePrintReceipt}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <Printer className="w-5 h-5" />
                            Cetak Struk
                        </button>
                        <button
                            onClick={handleClose}
                            className="w-full border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Pembayaran</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Total */}
                <div className="bg-primary/10 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p>
                </div>

                {/* Customer Name */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Pelanggan (Opsional)
                    </label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Masukkan nama pelanggan"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                    />
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            return (
                                <button
                                    key={method.value}
                                    onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                                    className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === method.value
                                        ? 'border-red-600 bg-red-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <Icon className={`w-6 h-6 mx-auto mb-2 transition-colors ${paymentMethod === method.value ? 'text-red-600' : 'text-gray-400'
                                        }`} />
                                    <p className={`text-sm font-medium transition-colors ${paymentMethod === method.value ? 'text-red-600' : 'text-gray-700'
                                        }`}>
                                        {method.label}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Cash Amount Input */}
                {paymentMethod === 'CASH' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jumlah Uang
                        </label>
                        <input
                            type="number"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none text-lg font-bold text-gray-900"
                        />
                        {cashAmount && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Kembalian</span>
                                    <span className={`font-bold ${change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(Math.max(0, change))}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* QRIS Integration Mock */}
                {paymentMethod === 'QRIS' && (
                    <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                        <div className="bg-white p-4 inline-block rounded-xl shadow-sm mb-3 border border-gray-100">
                            <QrCode className="w-32 h-32 text-gray-800" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Scan QRIS</h3>
                        <p className="text-sm text-gray-600">Minta pelanggan scan QR code ini menggunakan aplikasi e-Wallet atau M-Banking mereka.</p>
                    </div>
                )}

                {/* Bank Transfer Mock */}
                {paymentMethod === 'TRANSFER' && (
                    <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl p-5 text-center">
                        <Building2 className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                        <h3 className="font-bold text-gray-900 mb-1">Transfer Bank BCA</h3>
                        <p className="text-lg font-mono font-bold text-amber-700 tracking-wider mb-2">0660708260</p>
                        <p className="text-sm text-gray-600">a.n. Hari Purnama</p>
                    </div>
                )}

                {/* Debit Card Mock */}
                {paymentMethod === 'DEBIT' && (
                    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                        <CreditCard className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <h3 className="font-bold text-gray-900 mb-1">Mesin EDC</h3>
                        <p className="text-sm text-gray-600">Lakukan pembayaran melalui mesin EDC yang tersedia di kasir terlebih dahulu sebelum konfirmasi.</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || (paymentMethod === 'CASH' && (!cashAmount || change < 0))}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/20"
                    >
                        {isProcessing ? 'Memproses...' : 'Konfirmasi Transaksi'}
                    </button>
                </div>
            </div>
        </div>
    );
}
