const fs = require('fs');
const path = require('path');

const pages = [
    { path: 'orders', title: 'Orders' },
    { path: 'products/categories', title: 'Kategori Menu' },
    { path: 'products/variants', title: 'Varian & Add-on' },
    { path: 'products/bundles', title: 'Paket / Bundle' },
    { path: 'inventory/raw-materials', title: 'Bahan Baku' },
    { path: 'inventory/stock-in', title: 'Stok Masuk' },
    { path: 'inventory/stock-out', title: 'Stok Keluar' },
    { path: 'inventory/suppliers', title: 'Supplier' },
    { path: 'tables/layout', title: 'Layout Meja' },
    { path: 'tables/status', title: 'Status Meja' },
    { path: 'tables/booking', title: 'Booking / Reservasi' },
    { path: 'customers/member', title: 'Member / Loyalty' },
    { path: 'customers/history', title: 'Riwayat Transaksi Pelanggan' },
    { path: 'reports/cash', title: 'Laporan Kas' },
    { path: 'reports/stock', title: 'Laporan Stok' },
    { path: 'reports/tax', title: 'Laporan Pajak' },
    { path: 'reports/export', title: 'Export Data' },
    { path: 'settings/payment', title: 'Pengaturan Pembayaran' },
    { path: 'settings/tax', title: 'Pajak & Biaya' },
    { path: 'settings/printer', title: 'Printer & Struk' },
    { path: 'settings/notifications', title: 'Notifikasi' },
    { path: 'settings/integration', title: 'Integrasi Sistem' },
    { path: 'settings/security', title: 'Keamanan & Log' },
    { path: 'settings/branding', title: 'Tampilan & Branding' },
    { path: 'support', title: 'Support & Bantuan' }
];

const template = (title) => `'use client';

export default function Page() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">${title}</h1>
                <p className="text-sm text-gray-500 mt-1">Halaman ini sedang dalam tahap pengembangan.</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <span className="text-2xl">🚧</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Under Construction</h2>
                <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
                    Modul <strong>${title}</strong> akan segera hadir di pembaruan berikutnya. 
                    Saat ini fitur sedang dirancang untuk memastikan integrasi POS yang maksimal.
                </p>
            </div>
        </div>
    );
}
`;

const basePath = path.join(__dirname, 'app/admin');

for (const p of pages) {
    const dirPath = path.join(basePath, p.path);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, 'page.tsx');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, template(p.title), 'utf8');
        console.log(`Created: ${p.path}`);
    } else {
        console.log(`Exists: ${p.path} (skipped)`);
    }
}
console.log('All pages generated successfully.');
