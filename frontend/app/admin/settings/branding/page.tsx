import { Construction, Palette } from 'lucide-react';

export default function BrandingSettingsPage() {
    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Tampilan & Branding</h1>
                <p className="text-muted-foreground">Ubah warna dominan aplikasi, tema, dan gaya slip resi.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-12 rounded-xl border-dashed text-center animate-in fade-in flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Palette className="w-10 h-10 text-rose-500 opacity-70" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modul Sedang Dalam Pengembangan</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                    Sistem Custom Theme Engine (Dark Mode & Pengubahan Warna Tema Merah ke warna brand Anda yang lain) akan dirilis dalam paket kustomisasi User Interface.
                </p>
            </div>
        </div>
    );
}
