import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends HttpException {
    constructor(productName: string, available: number, requested: number) {
        super(
            {
                message: `Stok ${productName} tidak mencukupi. Tersedia: ${available}, Diminta: ${requested}`,
                code: 'INSUFFICIENT_STOCK',
                statusCode: HttpStatus.BAD_REQUEST,
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class OrderNotFoundException extends HttpException {
    constructor(orderId: string) {
        super(
            {
                message: `Order dengan ID ${orderId} tidak ditemukan`,
                code: 'ORDER_NOT_FOUND',
                statusCode: HttpStatus.NOT_FOUND,
            },
            HttpStatus.NOT_FOUND,
        );
    }
}

export class ProductNotFoundException extends HttpException {
    constructor(productId: string) {
        super(
            {
                message: `Produk dengan ID ${productId} tidak ditemukan`,
                code: 'PRODUCT_NOT_FOUND',
                statusCode: HttpStatus.NOT_FOUND,
            },
            HttpStatus.NOT_FOUND,
        );
    }
}

export class InvalidCredentialsException extends HttpException {
    constructor() {
        super(
            {
                message: 'Email atau password salah',
                code: 'INVALID_CREDENTIALS',
                statusCode: HttpStatus.UNAUTHORIZED,
            },
            HttpStatus.UNAUTHORIZED,
        );
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message = 'Akses ditolak') {
        super(
            {
                message,
                code: 'UNAUTHORIZED',
                statusCode: HttpStatus.UNAUTHORIZED,
            },
            HttpStatus.UNAUTHORIZED,
        );
    }
}
