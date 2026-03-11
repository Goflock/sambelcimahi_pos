import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
        console.log('✅ Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('❌ Database disconnected');
    }

    // Helper method untuk clean transactions
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production');
        }

        const tables = [
            'stock_opname_items',
            'stock_opnames',
            'kitchen_orders',
            'order_items',
            'orders',
            'stock_movements',
            'stocks',
            'products',
            'categories',
            'users',
        ];

        for (const table of tables) {
            await this.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
        }
    }
}
