'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { LogIn, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { LoginResponse } from '@/types';

const loginSchema = z.object({
    email: z.string().min(3, 'Email/Username tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            console.log('Attempting login with:', { email: data.email });
            const response = await api.post<LoginResponse>('/auth/login', data);
            console.log('Login response:', response.data);

            if (response.data.success) {
                const { access_token, user } = response.data.data;
                login(user, access_token);

                toast.success(`Selamat datang, ${user.name}!`);

                // Redirect based on role
                if (user.role === 'CASHIER') {
                    router.push('/cashier');
                } else {
                    router.push('/admin');
                }
            }
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(
                error.response?.data?.message?.[0] || 'Login gagal. Periksa email dan password Anda.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src="https://i.ibb.co.com/M59H9F9k/Desain-tanpa-judul-1.png" alt="Sambel Cimahi Logo" className="h-[120px] object-contain drop-shadow-md" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Sambel Cimahi</h1>
                    <p className="text-gray-600">Masuk ke sistem Point of Sales</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(onSubmit)(e);
                        }}
                        className="space-y-6"
                    >
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email / Username
                            </label>
                            <input
                                {...register('email')}
                                type="text"
                                id="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                placeholder="Email atau username..."
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                {...register('password')}
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center mb-3">Klik untuk isi otomatis (Demo):</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => { setValue('email', 'kasir@cimahipos.com'); setValue('password', 'cashier123'); }}
                                className="bg-gray-50 hover:bg-gray-100 p-2 rounded text-center transition-colors border border-gray-100"
                            >
                                <p className="font-semibold text-gray-700">Kasir</p>
                                <p className="text-gray-500 text-[10px] mt-1">kasir@cimahipos.com</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setValue('email', 'admin@cimahipos.com'); setValue('password', 'admin123'); }}
                                className="bg-gray-50 hover:bg-gray-100 p-2 rounded text-center transition-colors border border-gray-100"
                            >
                                <p className="font-semibold text-gray-700">Admin</p>
                                <p className="text-gray-500 text-[10px] mt-1">admin@cimahipos.com</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setValue('email', 'owner@cimahipos.com'); setValue('password', 'owner123'); }}
                                className="bg-gray-50 hover:bg-gray-100 p-2 rounded text-center transition-colors border border-gray-100"
                            >
                                <p className="font-semibold text-gray-700">Owner</p>
                                <p className="text-gray-500 text-[10px] mt-1">owner@cimahipos.com</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    © 2026 Sambel Cimahi. All rights reserved.
                </p>
            </div>
        </div>
    );
}
