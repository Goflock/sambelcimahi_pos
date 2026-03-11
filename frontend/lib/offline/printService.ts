'use client';

import { OfflineOrder } from './db';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

// Extend the global Window interface for TypeScript to recognise the AndroidApp bridge
declare global {
  interface Window {
    AndroidApp?: {
      printReceipt: (jsonStr: string) => void;
      showToast: (msg: string) => void;
    };
  }
}

// ─── Bluetooth Bridge (WebView → Kotlin) ─────────────────────────────────────

export const printReceiptBluetooth = (order: OfflineOrder) => {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify({
    localId: order.localId,
    customerName: order.customerName,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    grandTotal: order.total,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
  });

  if (window.AndroidApp) {
    // Running inside Android WebView — trigger native Bluetooth print
    try {
      window.AndroidApp.printReceipt(payload);
    } catch (error) {
      console.error('[POS PrintService] Android bridge failed:', error);
      toast.error('Printer Bluetooth tidak terhubung atau error di perangkat Android.');
    }
  } else {
    // Development/browser fallback — open the web receipt page
    // The orderId won't exist yet for pure-offline orders, so we display nothing;
    // the sync will update the receipt link once the order reaches the server.
    console.info('[POS PrintService] Android bridge not found. Falling back to browser print.');
    printReceiptWeb(order);
  }
};

// ─── Browser Fallback — thermal-style receipt popup ──────────────────────────

const printReceiptWeb = (order: OfflineOrder) => {
  const receiptWindow = window.open('', '_blank', 'width=380,height=620');
  if (!receiptWindow) return;

  const dateObj = new Date(order.createdAt);
  const orderPrefix = `ORD${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}`;

  // Custom formatted date
  const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ', ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

  const itemsHtml = order.items.map(i => `
      <div style="margin-bottom: 6px;">
        <div class="bold text-xs" style="margin-bottom: 2px;">${i.productName || i.productId}</div>
        <table class="text-xs" style="width: 100%;">
          <tr>
            <td>${i.quantity} x ${formatCurrency(i.price)}</td>
            <td align="right">${formatCurrency(i.price * i.quantity)}</td>
          </tr>
        </table>
      </div>
    `).join('');

  receiptWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: 'Courier New', Courier, monospace; font-size: 11px; width: 58mm; max-width: 58mm; margin: 0 auto; padding: 4px; color: black; background: white; -webkit-print-color-adjust: exact; line-height: 1.2; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .dashed-line { border-top: 1px dashed black; margin: 8px 0; }
    .text-xs { font-size: 10px; }
    .text-md { font-size: 12px; }
    .text-lg { font-size: 16px; }
    .text-gray { color: #555; }
    .mb-1 { margin-bottom: 2px; }
    .mb-2 { margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; }
    td { vertical-align: top; padding: 1px 0; font-size: 11px; }
    @media print {
      @page { margin: 0; size: 58mm auto; }
      body { padding: 4px; }
    }
  </style>
</head>
<body onload="setTimeout(() => window.print(), 300)">
  <div class="center mb-2">
    <div class="text-xs tracking-widest text-gray mb-1" style="font-weight: 600;">WARUNG NASI</div>
    <div class="text-lg bold leading-none mb-2" style="font-family: monospace; letter-spacing: 0.5px;">SAMBEL CIMAHI</div>
    <div class="text-xs leading-tight">
      Jl. Jendral Sudirman No.82<br>
      Rangkasbitung, Kabupaten Lebak,<br>
      Banten 42315
    </div>
  </div>

  <div class="dashed-line"></div>

  <table class="text-xs mb-2">
    <tr><td style="width: 60px;">Date:</td><td align="right">${formattedDate}</td></tr>
    <tr><td>Order:</td><td align="right">#${orderPrefix}${order.localId.substring(0, 4).toUpperCase()}</td></tr>
    <tr><td>Cashier:</td><td align="right">Admin</td></tr>
    <tr><td>Customer:</td><td align="right">${order.customerName || 'Walk-in'}</td></tr>
  </table>

  <div class="dashed-line"></div>

  <div class="mb-2">
    ${itemsHtml}
  </div>

  <div class="dashed-line"></div>

  <table class="text-xs mb-2">
    <tr><td>Subtotal:</td><td align="right">${formatCurrency(order.subtotal)}</td></tr>
    ${order.discount > 0 ? `<tr><td>Diskon:</td><td align="right">-${formatCurrency(order.discount)}</td></tr>` : ''}
    <tr class="bold text-md"><td style="padding-top:4px;">TOTAL:</td><td align="right" style="padding-top:4px;">${formatCurrency(order.total)}</td></tr>
    <tr><td style="padding-top:2px;">Payment:</td><td align="right" style="padding-top:2px;">${order.paymentMethod}</td></tr>
  </table>

  <div class="dashed-line"></div>

  <div class="center text-xs text-gray mt-2 pt-1">
    <p style="margin: 0 0 4px 0;">Terima kasih atas kunjungan<br/>Anda!</p>
    <p style="margin: 0;">Barang yang sudah dibeli<br/>tidak dapat ditukar/<br/>dikembalikan</p>
  </div>
</body>
</html>`);
  receiptWindow.document.close();
};
