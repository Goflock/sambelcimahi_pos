'use client';

import Dexie, { type Table } from 'dexie';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OfflineOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    notes?: string;
    price: number;
}

export interface OfflineOrder {
    localId: string;                // Primary key — UUID generated client-side
    customerName: string;
    orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
    tableNumber?: string;
    paymentMethod: 'CASH' | 'DEBIT' | 'QRIS' | 'TRANSFER';
    items: OfflineOrderItem[];
    subtotal: number;
    discount: number;
    total: number;
    status: 'PENDING' | 'SYNCED' | 'FAILED';
    createdAt: number;              // Unix timestamp in ms (Date.now())
    syncedAt?: number;
}

// ─── Dexie Database ──────────────────────────────────────────────────────────

class PosDatabase extends Dexie {
    offlineOrders!: Table<OfflineOrder>;

    constructor() {
        super('SambelCimahiPOS');
        this.version(1).stores({
            offlineOrders: 'localId, status, createdAt',
        });
    }
}

export const posDb = new PosDatabase();
