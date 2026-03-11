'use client';

export default function Page() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Support & Bantuan</h1>
                <p className="text-sm text-gray-500 mt-1">Halaman ini sedang dalam tahap pengembangan.</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <span className="text-2xl">🚧</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Under Construction</h2>
                <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
                    Modul <strong>Support & Bantuan</strong> akan segera hadir di pembaruan berikutnya. 
                    Saat ini fitur sedang dirancang untuk memastikan integrasi POS yang maksimal.
                </p>
            </div>
        </div>
    );
}
