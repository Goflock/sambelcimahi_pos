export interface User {
    id: string;
    name: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'CASHIER';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        access_token: string;
        user: User;
    };
}

export interface Product {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    cost: number;
    description: string | null;
    imageUrl: string | null;
    isAvailable: boolean;
    category: Category;
    stock: Stock | null;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
}

export interface Stock {
    id: string;
    productId: string;
    quantity: number;
    minStock: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
    notes?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string | null;
    orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
    tableNumber: string | null;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: 'CASH' | 'DEBIT' | 'QRIS' | 'TRANSFER';
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    completedAt: string | null;
}
