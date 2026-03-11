'use client';

import { v4 as uuidv4 } from 'uuid';
import { posDb, OfflineOrder } from './db';
import { printReceiptBluetooth } from './printService';
import api from '@/lib/api';

// ─── Save + Print (the "Bayar" button handler) ────────────────────────────────
// This is the core offline-first save. It ALWAYS writes to IndexedDB first so
// the transaction is never lost, then tries to push it to the API right away.

export const saveAndCheckout = async (
    cartPayload: Omit<OfflineOrder, 'localId' | 'status' | 'createdAt'>
): Promise<OfflineOrder> => {
    const order: OfflineOrder = {
        ...cartPayload,
        localId: uuidv4(),
        status: 'PENDING',
        createdAt: Date.now(),
    };

    // 1. Persist locally
    await posDb.offlineOrders.add(order);

    // 2. Print immediately (doesn't need internet)
    printReceiptBluetooth(order);

    // 3. Attempt immediate sync — if it fails, the interval worker will retry
    trySyncOne(order).catch(() => { /* silent - background will retry */ });

    return order;
};

// ─── Sync a single order ──────────────────────────────────────────────────────

const trySyncOne = async (order: OfflineOrder): Promise<void> => {
    if (!navigator.onLine) return;

    const apiPayload = {
        localId: order.localId,
        customerName: order.customerName,
        orderType: order.orderType,
        tableNumber: order.tableNumber,
        paymentMethod: order.paymentMethod,
        items: order.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            notes: i.notes ?? '',
        })),
        discount: order.discount,
        offlineSyncAt: new Date(order.createdAt).toISOString(),
    };

    await api.post('/orders', apiPayload);
    await posDb.offlineOrders.update(order.localId, { status: 'SYNCED', syncedAt: Date.now() });
};

// ─── Background Sync Worker ───────────────────────────────────────────────────
// Runs every 30 seconds. Picks up all PENDING orders and tries to push them.
// Should be called ONCE when the app boots (e.g. inside a top-level useEffect).

let _syncTimerId: ReturnType<typeof setInterval> | null = null;

export const startSyncWorker = () => {
    if (_syncTimerId) return; // Already started

    const run = async () => {
        if (!navigator.onLine) return;

        const pending = await posDb.offlineOrders
            .where('status')
            .equals('PENDING')
            .toArray();

        for (const order of pending) {
            try {
                await trySyncOne(order);
                console.log(`[Offline Sync] ✅ Synced order ${order.localId.slice(0, 8)}`);
            } catch (err) {
                // Mark as failed after 3 attempts — could track retryCount here
                console.warn(`[Offline Sync] ⚠️ Failed to sync ${order.localId.slice(0, 8)}`, err);
            }
        }
    };

    // Run immediately, then every 30 seconds
    run();
    _syncTimerId = setInterval(run, 30_000);

    // Also run on window 'online' event
    window.addEventListener('online', run);
};

export const stopSyncWorker = () => {
    if (_syncTimerId) {
        clearInterval(_syncTimerId);
        _syncTimerId = null;
    }
};
