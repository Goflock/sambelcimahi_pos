import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

export interface WebCartItem {
    product: Product;
    quantity: number;
    notes?: string;
}

interface WebCartStore {
    items: WebCartItem[];
    orderType: 'DINE_IN' | 'TAKEAWAY';
    tableNumber: string;
    customerName: string;
    phone: string;
    pickupTime: string;

    // Actions
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updateNotes: (productId: string, notes: string) => void;
    setOrderInfo: (info: Partial<{
        orderType: 'DINE_IN' | 'TAKEAWAY';
        tableNumber: string;
        customerName: string;
        phone: string;
        pickupTime: string;
    }>) => void;
    clearCart: () => void;

    // Computed (Zustand doesn't natively do getters well unless via hook, but we put it here)
    getTotal: () => number;
}

export const useWebCartStore = create<WebCartStore>()(
    persist(
        (set, get) => ({
            items: [],
            orderType: 'DINE_IN',
            tableNumber: '',
            customerName: '',
            phone: '',
            pickupTime: '',

            addItem: (product) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(item => item.product.id === product.id);

                if (existingItem) {
                    set({
                        items: currentItems.map(item =>
                            item.product.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    });
                } else {
                    set({
                        items: [...currentItems, { product, quantity: 1, notes: '' }]
                    });
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter(item => item.product.id !== productId)
                });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map(item =>
                        item.product.id === productId
                            ? { ...item, quantity }
                            : item
                    )
                });
            },

            updateNotes: (productId, notes) => {
                set({
                    items: get().items.map(item =>
                        item.product.id === productId
                            ? { ...item, notes }
                            : item
                    )
                });
            },

            setOrderInfo: (info) => {
                set((state) => ({ ...state, ...info }));
            },

            clearCart: () => {
                set({ items: [], orderType: 'DINE_IN', tableNumber: '', customerName: '', phone: '', pickupTime: '' });
            },

            getTotal: () => {
                return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
            },
        }),
        {
            name: 'cimahi-web-cart',
            skipHydration: true, // We will manually hydrate on the client to avoid Next.js mismatch
        }
    )
);
