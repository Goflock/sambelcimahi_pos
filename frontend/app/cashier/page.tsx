'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, Package, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useCartStore } from '@/lib/store/cart';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Cart from '@/components/cashier/Cart';
import { startSyncWorker } from '@/lib/offline/syncService';

export default function CashierPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isOnline, setIsOnline] = useState(true);
    const { addItem } = useCartStore();

    // Start offline background sync worker once on mount
    useEffect(() => {
        startSyncWorker();
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Fetch products
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await api.get('/products/available');
            return response.data.data as Product[];
        },
    });

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data.data.filter((c: any) => c.name.toLowerCase() !== 'snack');
        },
    });

    const filteredProducts = productsData?.filter((product) => {
        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === 'all' || product.category.id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddToCart = (product: Product) => {
        addItem(product);
        toast.success(`${product.name} ditambahkan ke keranjang`);
    };

    // Barcode Scanner Integration
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            const query = searchQuery.trim().toLowerCase();
            const exactProduct = productsData?.find(
                (p) => (p.sku && p.sku.toLowerCase() === query) || p.name.toLowerCase() === query
            );

            if (exactProduct) {
                handleAddToCart(exactProduct);
                setSearchQuery(''); // clear input ready for next scan
            } else {
                toast.error('Barcode/Produk tidak ditemukan');
            }
        }
    };

    const getImageUrl = (url?: string | null, productName?: string) => {
        if (productName) {
            const name = productName.toLowerCase();
            if (name.includes('ayam bakar')) return 'https://i.ibb.co.com/gZ9vDN7Z/ayambakar.jpg';
            if (name.includes('ayam kampung')) return 'https://i.ibb.co.com/jZWGTtsb/ayamkampung.jpg';
            if (name.includes('nasi') || name.includes('bakul')) return 'https://i.ibb.co.com/60HhNGbz/bakul.jpg';
            if (name.includes('bakwan') || name.includes('tempe')) return 'https://i.ibb.co.com/2089fVQ3/bakwantempe.jpg';
            if (name.includes('cumi')) return 'https://i.ibb.co.com/rRVjq0Rs/cumiasin.jpg';
            if (name.includes('kembung bakar')) return 'https://i.ibb.co.com/LhBXh4WM/ikankembungbakar.jpg';
            if (name.includes('mas')) return 'https://i.ibb.co.com/qLKPd46H/ikanmasacar.jpg';
            if (name.includes('nila bakar')) return 'https://i.ibb.co.com/FbFQ98BM/ikannilabakar.jpg';
            if (name.includes('nila goreng')) return 'https://i.ibb.co.com/C5Bz1qkL/ikannilagoreng.jpg';
            if (name.includes('jengkol')) return 'https://i.ibb.co.com/bRQ0CytP/jengkol.jpg';
            if (name.includes('kembang paya') || name.includes('pepaya')) return 'https://i.ibb.co.com/Dfx9jcSp/kembangpaya.jpg';
            if (name.includes('pepes')) return 'https://i.ibb.co.com/d0kyk80d/pepesikan.jpg';
            if (name.includes('jamur')) return 'https://i.ibb.co.com/Fq8HL4y7/tumisjamur.jpg';
            if (name.includes('es jeruk') || name.includes('esjeruk')) return 'https://i.ibb.co.com/Rp4WHWFN/esjeruk.jpg';
            if (name.includes('es teh manis') || name.includes('es tehmanis') || name.includes('as teh manis')) return 'https://i.ibb.co.com/svtTyW5n/estehmanis.jpg';
            if (name.includes('es teh tawar') || name.includes('es tehtawar')) return 'https://i.ibb.co.com/svtTyW5n/estehmanis.jpg';
            if (name.includes('jeruk hangat') || name.includes('jeruk panas')) return 'https://i.ibb.co.com/XHL4h43/jerukhangat.jpg';
            if (name.includes('aqua') || name.includes('botol')) return 'https://i.ibb.co.com/Xkb9pQYt/aquabotol.jpg';
        }

        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');
        return `${baseUrl}${url}`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-73px)]">
            {/* Offline Indicator Banner */}
            {!isOnline && (
                <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-800 text-sm font-medium">
                    <WifiOff className="w-4 h-4 shrink-0" />
                    <span>Mode Offline — Transaksi tersimpan lokal & akan disync otomatis saat internet tersambung.</span>
                </div>
            )}

            {/* Main layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Products Section */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Search & Filter */}
                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Scan Barcode atau ketik nama menu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                autoFocus
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none text-gray-800 font-medium shadow-sm transition-all text-lg placeholder:text-gray-400"
                            />
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all border ${selectedCategory === 'all'
                                    ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                    }`}
                            >
                                Semua Menu
                            </button>
                            {categoriesData?.map((category: any) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all border ${selectedCategory === category.id
                                        ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-4 text-gray-600">Memuat produk...</p>
                            </div>
                        </div>
                    ) : filteredProducts && filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
                            {filteredProducts.map((product) => {
                                const imgUrl = getImageUrl(product.imageUrl, product.name);
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => handleAddToCart(product)}
                                        className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/10 transition-all text-left flex flex-col group h-full"
                                    >
                                        <div className="aspect-[4/3] w-full bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-gray-100 relative">
                                            {imgUrl ? (
                                                <img src={imgUrl} alt={product.name} className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Package className="w-10 h-10 text-gray-300 group-hover:text-red-400 transition-colors" />
                                            )}
                                            {product.stock && product.stock.quantity < product.stock.minStock && (
                                                <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded shadow-sm">Stok Rendah</span>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 leading-snug">
                                                    {product.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">{product.category.name}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto">
                                                <p className="text-[17px] font-black text-red-700">
                                                    {formatCurrency(Number(product.price))}
                                                </p>
                                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-600 transition-colors shadow-sm">
                                                    <span className="text-red-600 group-hover:text-white font-black text-lg leading-none mb-0.5">+</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Package className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="font-medium text-lg">Menu tidak ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Cart Section */}
                <Cart />
            </div>
        </div>
    );
}
