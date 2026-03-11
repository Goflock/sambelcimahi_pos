import { Construction, Bell } from 'lucide-react';

export default function NotificationsSettingsPage() {
    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Notifikasi Sistem</h1>
                <p className="text-muted-foreground">Pengaturan penerimaan pesan WhatsApp dan Email.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-12 rounded-xl border-dashed text-center animate-in fade-in flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-blue-500 opacity-70" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modul Sedang Dalam Pengembangan</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                    Fitur pengaturan otomatisasi Notifikasi WhatsApp Bot dan pemberitahuan Email kepada pelanggan akan dikerjakan pada Phase pengembangan infrastruktur berikutnya (Phase 5).
                </p>
            </div>
        </div>
    );
}
