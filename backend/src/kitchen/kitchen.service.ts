import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KitchenGateway } from './kitchen.gateway';

@Injectable()
export class KitchenService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => KitchenGateway))
        private kitchenGateway: KitchenGateway,
    ) { }

    async getKitchenOrders() {
        return this.prisma.kitchenOrder.findMany({
            where: {
                status: {
                    in: ['PENDING', 'COOKING'],
                },
            },
            include: {
                order: {
                    include: {
                        orderItems: {
                            include: {
                                product: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async getKitchenOrderById(id: string) {
        const kitchenOrder = await this.prisma.kitchenOrder.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        orderItems: {
                            include: {
                                product: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!kitchenOrder) {
            throw new NotFoundException(`Kitchen order dengan ID ${id} tidak ditemukan`);
        }

        return kitchenOrder;
    }

    async updateStatus(id: string, status: 'PENDING' | 'COOKING' | 'DONE') {
        const kitchenOrder = await this.getKitchenOrderById(id);

        // Validasi status transition
        if (kitchenOrder.status === 'DONE') {
            throw new BadRequestException('Order sudah selesai');
        }

        const updatedAt = status === 'DONE' ? new Date() : undefined;
        const startedAt = status === 'COOKING' && !kitchenOrder.startedAt ? new Date() : undefined;

        const updated = await this.prisma.kitchenOrder.update({
            where: { id },
            data: {
                status,
                ...(updatedAt && { completedAt: updatedAt }),
                ...(startedAt && { startedAt }),
            },
            include: {
                order: {
                    include: {
                        orderItems: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });

        // Emit WebSocket event
        if (this.kitchenGateway) {
            this.kitchenGateway.emitOrderStatusUpdate(id, status);

            if (status === 'DONE') {
                this.kitchenGateway.emitOrderCompleted(id);
            }
        }

        return updated;
    }

    async getCompletedOrders(limit: number = 10) {
        return this.prisma.kitchenOrder.findMany({
            where: {
                status: 'DONE',
            },
            include: {
                order: {
                    include: {
                        orderItems: {
                            include: {
                                product: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                completedAt: 'desc',
            },
            take: limit,
        });
    }
}
