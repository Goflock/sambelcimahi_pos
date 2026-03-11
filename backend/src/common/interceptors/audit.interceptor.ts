import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditLogsService: AuditLogsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method } = req;

        // Filter and trap mutating methods
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            // Avoid logging noisy requests or GET streams
            if (!req.url.includes('/audit-logs')) {
                return next.handle().pipe(
                    tap({
                        next: () => this.logAction(req, 'Sukses'),
                        error: () => this.logAction(req, 'Gagal'),
                    }),
                );
            }
        }

        return next.handle();
    }

    private logAction(req: any, status: string) {
        const { method, url, user, headers, ip, body } = req;

        // Map URL context to human-readable domain descriptors
        let action = method;
        let entity = 'Sistem';
        let entityId = null;
        let details = `Endpoint: ${url} | Status: ${status}`;

        if (url.includes('/orders')) {
            entity = 'Order';
            if (method === 'POST') action = 'BUAT_PESANAN';
            if (method === 'PATCH' || method === 'PUT') action = 'UBAH_PESANAN';
            if (method === 'DELETE') action = 'HAPUS_PESANAN';
            if (body && body.orderType) details += ` | Tipe: ${body.orderType}`;
        } else if (url.includes('/products')) {
            entity = 'Product';
            if (method === 'POST') action = 'TAMBAH_PRODUK';
            if (method === 'PATCH' || method === 'PUT') action = 'UBAH_PRODUK';
            if (method === 'DELETE') action = 'HAPUS_PRODUK';
            if (body && body.name) details += ` | Target: ${body.name}`;
        } else if (url.includes('/auth/login')) {
            entity = 'Authentication';
            action = 'LOGIN';
            if (body && body.email) details += ` | User: ${body.email}`;
        } else if (url.includes('/settings')) {
            entity = 'Settings';
            action = 'UBAH_PENGATURAN';
        } else if (url.includes('/expenses')) {
            entity = 'Akuntansi';
            action = method === 'DELETE' ? 'HAPUS_PENGELUARAN' : 'CATAT_PENGELUARAN';
        } else if (url.includes('/users')) {
            entity = 'UserManagement';
            action = method === 'POST' ? 'TAMBAH_USER' : method === 'DELETE' ? 'HAPUS_USER' : 'UBAH_USER';
        }

        // Fire and forget payload injection
        this.auditLogsService.createLog({
            userId: user?.id || null, // Might be null if it's a login attempt
            action,
            entity,
            entityId,
            details,
            ipAddress: ip,
            userAgent: headers['user-agent']
        });
    }
}
