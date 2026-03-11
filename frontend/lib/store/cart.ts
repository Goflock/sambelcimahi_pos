import { create } from 'zustand';
import type { CartItem, Product } from '@/types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updateNotes: (productId: string, notes: string) => void;
    clearCart: () => void;

    // New Features
    discount: number;
    taxRate: number;
    serviceRate: number;
    orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

    setDiscount: (amount: number) => void;
    setOrderType: (type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY') => void;
    setTaxRate: (rate: number) => void;

    getSubtotal: () => number;
    getTax: () => number;
    getService: () => number;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    discount: 0,
    taxRate: 0,
    serviceRate: 0,
    orderType: 'DINE_IN',

    addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
            set({
                items: items.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            });
        } else {
            set({ items: [...items, { product, quantity: 1 }] });
        }
    },

    removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
    },

    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(productId);
        } else {
            set({
                items: get().items.map((item) =>
                    item.product.id === productId ? { ...item, quantity } : item
                ),
            });
        }
    },

    updateNotes: (productId, notes) => {
        set({
            items: get().items.map((item) =>
                item.product.id === productId ? { ...item, notes } : item
            ),
        });
    },

    clearCart: () => {
        set({ items: [], discount: 0, orderType: 'DINE_IN' });
    },

    setDiscount: (amount) => set({ discount: amount }),
    setOrderType: (type) => set({ orderType: type }),
    setTaxRate: (rate) => set({ taxRate: rate }),

    getSubtotal: () => {
        return get().items.reduce(
            (total, item) => total + Number(item.product.price) * item.quantity,
            0
        );
    },

    getTax: () => {
        const subtotal = get().getSubtotal() - get().discount;
        return subtotal > 0 ? subtotal * (get().taxRate / 100) : 0;
    },

    getService: () => 0,

    getTotal: () => {
        const subtotal = get().getSubtotal() - get().discount;
        const total = subtotal + get().getTax();
        return total > 0 ? total : 0;
    },

    getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },
}));
