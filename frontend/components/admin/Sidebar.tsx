'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
    LayoutDashboard,
    ShoppingCart,
    ClipboardList,
    ShoppingBag,
    RotateCcw,
    Utensils,
    ListTree,
    Layers,
    Gift,
    Package,
    Beef,
    ArrowDownToLine,
    ArrowUpFromLine,
    Truck,
    LayoutGrid,
    Armchair,
    CalendarCheck,
    Users,
    Award,
    History,
    BarChart3,
    WalletCards,
    Receipt,
    FileSpreadsheet,
    Settings,
    Store,
    CreditCard,
    DollarSign,
    Printer,
    Bell,
    Link as LinkIcon,
    ShieldCheck,
    Palette,
    Headset,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

type NavItem = {
    name: string;
    href?: string;
    icon: any;
    allowedRoles?: string[];
    children?: { name: string; href: string; icon?: any }[];
};

type NavGroup = {
    group: string;
    allowedRoles?: string[];
    items: NavItem[];
};

const navigationGroups: NavGroup[] = [
    {
        group: 'MAIN',
        items: [
            { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, allowedRoles: ['OWNER', 'ADMIN'] },
            { name: 'Kasir', href: '/cashier', icon: ShoppingCart },
            {
                name: 'Data Pesanan',
                icon: ClipboardList,
                allowedRoles: ['OWNER', 'ADMIN', 'CASHIER'],
                children: [
                    { name: 'Semua Order', href: '/admin/orders', icon: ClipboardList },
                ]
            }
        ]
    },
    {
        group: 'PRODUK & MENU',
        allowedRoles: ['OWNER', 'ADMIN'],
        items: [
            {
                name: 'Menu & Kategori',
                icon: Utensils,
                children: [
                    { name: 'Daftar Menu', href: '/admin/products', icon: Utensils },
                    { name: 'Kategori', href: '/admin/products/categories', icon: ListTree },
                ]
            }
        ]
    },
    {
        group: 'INVENTORI',
        allowedRoles: ['OWNER', 'ADMIN'],
        items: [
            {
                name: 'Manajemen Stok',
                icon: Package,
                children: [
                    { name: 'Stok Produk', href: '/admin/stocks', icon: Package },
                ]
            }
        ]
    },
    {
        group: 'AKUNTANSI',
        allowedRoles: ['OWNER', 'ADMIN'],
        items: [
            {
                name: 'Keuangan',
                icon: WalletCards,
                children: [
                    { name: 'Pengeluaran (Beban)', href: '/admin/expenses', icon: Receipt },
                ]
            }
        ]
    },
    {
        group: 'LAPORAN',
        allowedRoles: ['OWNER', 'ADMIN'],
        items: [
            {
                name: 'Laporan Usaha',
                icon: BarChart3,
                children: [
                    { name: 'Penjualan', href: '/admin/reports', icon: BarChart3 },
                ]
            }
        ]
    },
    {
        group: 'PENGATURAN',
        allowedRoles: ['OWNER'],
        items: [
            {
                name: 'Pengaturan Sistem',
                icon: Settings,
                children: [
                    { name: 'Profil Toko', href: '/admin/settings', icon: Store },
                    { name: 'Pembayaran', href: '/admin/settings/payment', icon: CreditCard },
                    { name: 'Printer & Struk', href: '/admin/settings/printer', icon: Printer },
                    { name: 'Notifikasi', href: '/admin/settings/notifications', icon: Bell },
                    { name: 'Integrasi', href: '/admin/settings/integration', icon: LinkIcon },
                    { name: 'Keamanan & Log', href: '/admin/settings/security', icon: ShieldCheck },
                    { name: 'Tampilan & Branding', href: '/admin/settings/branding', icon: Palette },
                ]
            }
        ]
    },
    {
        group: 'LAINNYA',
        items: [
            { name: 'Support', href: '/admin/support', icon: Headset },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // We open useful menus by default
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Menu & Kategori', 'Pengaturan Sistem']);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev =>
            prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
        );
    };

    // Helpler to check if any child is active
    const isActiveMenu = (children?: { href: string }[]) => {
        if (!children) return false;
        return children.some(child => pathname === child.href && pathname !== '#');
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white text-gray-700 shadow-md border border-gray-200 rounded-lg"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-72 bg-white text-gray-700 border-r border-gray-200
                    transform transition-transform duration-300 ease-in-out z-40
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 flex flex-col
                `}
            >
                {/* Logo Area */}
                <div className="pt-6 px-6 pb-4">
                    <div className="flex items-center gap-3 mb-6">
                        <img src="https://i.ibb.co.com/M59H9F9k/Desain-tanpa-judul-1.png" alt="Sambel Cimahi Logo" className="h-10 w-auto object-contain" />
                        <div>
                            <h1 className="text-xl font-black text-red-700 tracking-tight leading-none">Sambel <span className="text-gray-900">Cimahi</span></h1>
                        </div>
                    </div>

                    {/* User Profile Card (Moved to top like WeEats) */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold border border-red-200 shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate leading-tight">{user?.name || 'Administrator'}</p>
                            <p className="text-xs font-semibold text-gray-500 truncate">{user?.role === 'OWNER' ? 'Super Admin' : 'Admin'}</p>
                        </div>
                        <Link href="/admin/profile" className="p-1.5 text-gray-400 hover:text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <Settings size={14} />
                        </Link>
                    </div>
                </div>

                {/* Navigation (Scrollable) */}
                <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto custom-scrollbar">
                    {navigationGroups.map((navGroup) => {
                        // Filter group level roles
                        if (navGroup.allowedRoles && user?.role && !navGroup.allowedRoles.includes(user.role)) {
                            return null;
                        }

                        // Filter valid items for the current user at the item level
                        const validItems = navGroup.items.filter(
                            (item) => !item.allowedRoles || (user?.role && item.allowedRoles.includes(user.role))
                        );

                        if (validItems.length === 0) return null;

                        return (
                            <div key={navGroup.group}>
                                <p className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    {navGroup.group}
                                </p>
                                <div className="space-y-1">
                                    {validItems.map((item) => {
                                        if (item.children) {
                                            const isExpanded = expandedMenus.includes(item.name) || isActiveMenu(item.children);
                                            return (
                                                <div key={item.name} className="space-y-1">
                                                    <button
                                                        onClick={() => toggleMenu(item.name)}
                                                        className={`
                                                            w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                                                            text-gray-600 hover:bg-gray-50 transition-all font-medium
                                                            ${isActiveMenu(item.children) ? 'text-red-700 bg-red-50/50' : 'hover:text-gray-900'}
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <item.icon size={18} className={isActiveMenu(item.children) ? 'text-red-600' : 'text-gray-400'} />
                                                            <span className="text-sm">{item.name}</span>
                                                        </div>
                                                        {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="pl-3 space-y-1 mt-1 border-l-2 border-gray-100 ml-5">
                                                            {item.children.map(child => {
                                                                const isActive = pathname === child.href && child.href !== '#';
                                                                return (
                                                                    <Link
                                                                        key={child.name}
                                                                        href={child.href}
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className={`
                                                                            flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                                                                            transition-all duration-200 font-medium
                                                                            ${isActive
                                                                                ? 'bg-red-50 text-red-700 shadow-sm border border-red-100/50'
                                                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                                                            }
                                                                        `}
                                                                    >
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                                                                        <span>{child.name}</span>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        const isActive = pathname === item.href && item.href !== '#';
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href!}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`
                                                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                                    transition-all duration-200 font-medium
                                                    ${isActive
                                                        ? 'bg-red-50 text-red-700 shadow-sm border border-red-100/50'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }
                                                `}
                                            >
                                                <item.icon size={18} className={isActive ? "text-red-600" : "text-gray-400"} />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Logout Button Fixed at Bottom */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all font-medium text-sm border border-gray-200"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden fixed inset-0 bg-gray-900/50 z-30 backdrop-blur-sm"
                />
            )}
        </>
    );
}
