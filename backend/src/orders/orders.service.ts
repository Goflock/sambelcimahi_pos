import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { InsufficientStockException } from '../common/exceptions/business.exception';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async create(createOrderDto: CreateOrderDto, cashierId?: string) {
        try {
            const { items, customerName, orderType, tableNumber, paymentMethod, discount = 0, tax = 0, localId, offlineSyncAt } = createOrderDto;
            console.log('Creating Order Payload:', JSON.stringify(createOrderDto, null, 2));

            // Anti-duplication check for offline sync
            if (localId) {
                const existingOrder = await this.prisma.order.findUnique({
                    where: { localId: localId }
                });

                if (existingOrder) {
                    console.log(`[Offline Sync] Order ${localId} already exists. Skipping duplication.`);
                    return this.findOne(existingOrder.id);
                }
            }

            // Validate products and check stock
            const productIds = items.map(item => item.productId);
            const products = await this.prisma.product.findMany({
                where: { id: { in: productIds } },
                include: { stocks: true },
            });

            if (products.length !== productIds.length) {
                throw new NotFoundException('Satu atau lebih produk tidak ditemukan');
            }

            // Check stock availability
            for (const item of items) {
                const product = products.find(p => p.id === item.productId);
                const stock = product.stocks && product.stocks.length > 0 ? product.stocks[0] : null;
                if (!stock || stock.quantity < item.quantity) {
                    throw new InsufficientStockException(
                        product.name,
                        stock?.quantity || 0,
                        item.quantity
                    );
                }
            }

            // Calculate totals
            let subtotal = 0;
            const orderItems = items.map(item => {
                const product = products.find(p => p.id === item.productId);
                const price = product.price;
                const itemSubtotal = price.toNumber() * item.quantity;
                subtotal += itemSubtotal;

                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: price,
                    subtotal: itemSubtotal,
                    notes: item.notes,
                };
            });

            const total = subtotal + tax - discount;

            // Generate order number
            const orderNumber = await this.generateOrderNumber();

            // Create order with transaction
            const order = await this.prisma.$transaction(async (tx) => {
                // Get current stock for before/after tracking
                const currentStocks = await Promise.all(
                    items.map(item => tx.stock.findFirst({ where: { productId: item.productId } }))
                );

                // Create order
                const newOrder = await tx.order.create({
                    data: {
                        orderNumber,
                        customerName,
                        orderType,
                        tableNumber,
                        subtotal,
                        tax,
                        discount,
                        total,
                        paymentMethod,
                        status: 'PENDING',
                        localId: localId || null,
                        offlineSyncAt: offlineSyncAt ? new Date(offlineSyncAt) : null,
                        cashier: cashierId ? {
                            connect: { id: cashierId },
                        } : undefined,
                        orderItems: {
                            create: orderItems,
                        },
                    },
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
                });

                // Reduce stock and create stock movements
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const currentStock = currentStocks[i];

                    // Ensure stock record exists
                    if (!currentStock) {
                        throw new BadRequestException(`Stock record not found for product ${item.productId}`);
                    }

                    // Update stock
                    const updatedStock = await tx.stock.update({
                        where: { id: currentStock.id },
                        data: {
                            quantity: {
                                decrement: item.quantity,
                            },
                        },
                    });

                    // Create stock movement record
                    await tx.stockMovement.create({
                        data: {
                            product: {
                                connect: { id: item.productId },
                            },
                            stock: {
                                connect: { id: currentStock.id },
                            },
                            user: {
                                connect: { id: cashierId },
                            },
                            type: 'OUT',
                            quantity: item.quantity,
                            beforeQty: currentStock.quantity,
                            afterQty: updatedStock.quantity,
                            notes: `Order #${orderNumber}`,
                            referenceId: newOrder.id,
                        },
                    });
                }

                // Create kitchen order if order type is DINE_IN
                if (orderType === 'DINE_IN') {
                    await tx.kitchenOrder.create({
                        data: {
                            order: {
                                connect: { id: newOrder.id },
                            },
                            orderNumber: orderNumber,
                            tableNumber: tableNumber,
                            status: 'PENDING',
                        },
                    });
                }

                return newOrder;
            });

            return order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw new InternalServerErrorException(error.message || 'Gagal memproses order');
        }
    }

    async findAll() {
        return this.prisma.order.findMany({
            include: {
                cashier: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                cashier: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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
        });

        if (!order) {
            throw new NotFoundException(`Order dengan ID ${id} tidak ditemukan`);
        }

        return order;
    }

    async complete(id: string) {
        const order = await this.findOne(id);

        if (order.status === 'COMPLETED') {
            throw new BadRequestException('Order sudah selesai');
        }

        if (order.status === 'CANCELLED') {
            throw new BadRequestException('Order sudah dibatalkan');
        }

        return this.prisma.order.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async cancel(id: string, userId: string) {
        const order = await this.findOne(id);

        if (order.status === 'COMPLETED') {
            throw new BadRequestException('Order yang sudah selesai tidak bisa dibatalkan');
        }

        if (order.status === 'CANCELLED') {
            throw new BadRequestException('Order sudah dibatalkan');
        }

        // Return stock with transaction
        return this.prisma.$transaction(async (tx) => {
            // Update order status
            const cancelledOrder = await tx.order.update({
                where: { id },
                data: {
                    status: 'CANCELLED',
                },
                include: {
                    orderItems: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            // Return stock
            for (const item of cancelledOrder.orderItems) {
                const currentStock = await tx.stock.findFirst({
                    where: { productId: item.productId },
                });

                const updatedStock = await tx.stock.update({
                    where: { id: currentStock.id },
                    data: {
                        quantity: {
                            increment: item.quantity,
                        },
                    },
                });

                // Create stock movement record
                await tx.stockMovement.create({
                    data: {
                        product: {
                            connect: { id: item.productId },
                        },
                        stock: {
                            connect: { id: currentStock.id },
                        },
                        user: {
                            connect: { id: userId },
                        },
                        type: 'IN',
                        quantity: item.quantity,
                        beforeQty: currentStock.quantity,
                        afterQty: updatedStock.quantity,
                        notes: `Order #${order.orderNumber} dibatalkan`,
                        referenceId: order.id,
                    },
                });
            }

            return cancelledOrder;
        });
    }

    private async generateOrderNumber(): Promise<string> {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const prefix = `ORD${year}${month}${day}`;

        // Get today's order count
        const count = await this.prisma.order.count({
            where: {
                orderNumber: {
                    startsWith: prefix,
                },
            },
        });

        const sequence = String(count + 1).padStart(4, '0');
        return `${prefix}${sequence}`;
    }
}
