import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
    constructor(private prisma: PrismaService) { }

    async createLog(data: {
        userId?: string;
        action: string;
        entity: string;
        entityId?: string;
        details: string;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            return await this.prisma.auditLog.create({
                data,
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // We don't throw here to avoid failing the main transaction if logging fails
        }
    }

    async findAll(query: any) {
        const { limit = 50, offset = 0, role, action, search } = query;

        const where: any = {};

        if (role && role !== 'Semua Peran') {
            const roleFilter = role === 'Hanya Kasir' ? 'CASHIER' : 'ADMIN';
            where.user = { role: roleFilter };
        }

        if (search) {
            where.OR = [
                { action: { contains: search, mode: 'insensitive' } },
                { entity: { contains: search, mode: 'insensitive' } },
                { details: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const logs = await this.prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: { name: true, role: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            skip: Number(offset),
        });

        const total = await this.prisma.auditLog.count({ where });

        return {
            data: logs,
            meta: { total, limit: Number(limit), offset: Number(offset) }
        };
    }
}
