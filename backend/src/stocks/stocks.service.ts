import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AdjustStockDto, MovementType } from './dto/adjust-stock.dto';

@Injectable()
export class StocksService {
    constructor(private prisma: PrismaService) { }

    async adjustStock(userId: string, dto: AdjustStockDto) {
        return this.prisma.$transaction(async (tx) => {
            // Find stock record
            const stock = await tx.stock.findFirst({
                where: { productId: dto.productId },
            });

            if (!stock) {
                throw new NotFoundException('Stock for product not found');
            }

            // Calculate new quantity
            let newQuantity = stock.quantity;
            if (dto.type === MovementType.IN) {
                newQuantity += dto.quantity;
            } else if (dto.type === MovementType.OUT) {
                if (stock.quantity < dto.quantity) {
                    throw new BadRequestException('Insufficient stock');
                }
                newQuantity -= dto.quantity;
            }

            // Update stock quantity
            await tx.stock.update({
                where: { id: stock.id },
                data: { quantity: newQuantity },
            });

            // Create movement log
            await tx.stockMovement.create({
                data: {
                    productId: dto.productId,
                    stockId: stock.id,
                    userId,
                    type: dto.type,
                    quantity: dto.quantity,
                    beforeQty: stock.quantity,
                    afterQty: newQuantity,
                    notes: dto.notes,
                },
            });

            return {
                message: 'Stock adjusted successfully',
                newQuantity
            };
        });
    }

    async findAll() {
        return this.prisma.stock.findMany({
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                product: {
                    name: 'asc',
                },
            },
        });
    }

    async findLowStock() {
        // Use raw query to compare quantity <= min_stock (column-to-column comparison)
        const lowStockIds = await this.prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM stocks WHERE quantity <= min_stock
        `;
        const ids = lowStockIds.map((s) => s.id);

        return this.prisma.stock.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                quantity: 'asc',
            },
        });
    }

    async getStockMovements(productId?: string) {
        return this.prisma.stockMovement.findMany({
            where: productId ? { productId } : {},
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100,
        });
    }

    async findOne(productId: string) {
        return this.prisma.stock.findFirst({
            where: { productId },
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }
}
