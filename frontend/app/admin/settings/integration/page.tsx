import { Construction, Link as LinkIcon } from 'lucide-react';

export default function IntegrationSettingsPage() {
    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Integrasi API Pihak Ketiga</h1>
                <p className="text-muted-foreground">Koneksikan POS dengan layanan eksternal (GoFood, GrabFood, ShopeeFood, Jurnal).</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-12 rounded-xl border-dashed text-center animate-in fade-in flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                    <LinkIcon className="w-10 h-10 text-emerald-500 opacity-70" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modul Sedang Dalam Pengembangan</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                    Sistem "Open API" untuk mensinkronkan menu dan menarik pesanan secara langsung dari platform ojek online (GoFood, GrabFood, dll) sedang dirancang dalam blueprint arsitektur berikutnya.
                </p>
            </div>
        </div>
    );
}
