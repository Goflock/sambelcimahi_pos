import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.product.findMany({
            include: {
                category: true,
                stocks: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                stocks: true,
            },
        });
    }

    async findAvailable() {
        return this.prisma.product.findMany({
            where: { isAvailable: true },
            include: {
                category: true,
                stocks: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async create(createProductDto: any) {
        console.log('createProductDto received:', JSON.stringify(createProductDto, null, 2));
        const { minStock, quantity, ...productData } = createProductDto;

        return this.prisma.product.create({
            data: {
                ...productData,
                unit: createProductDto.unit || 'pcs',
                stocks: {
                    create: {
                        quantity: quantity ? parseInt(quantity.toString()) : 0,
                        minStock: minStock ? parseInt(minStock.toString()) : 5,
                    },
                },
            },
            include: {
                category: true,
                stocks: true,
            },
        });
    }

    async update(id: string, updateProductDto: any) {
        console.log(`Update Product ${id}:`, JSON.stringify(updateProductDto, null, 2));
        const { minStock, quantity, ...productData } = updateProductDto;

        await this.prisma.product.update({
            where: { id },
            data: productData,
        });

        if (minStock !== undefined || quantity !== undefined) {
            const stockUpdateData: any = {};
            if (minStock !== undefined) stockUpdateData.minStock = parseInt(minStock.toString());
            if (quantity !== undefined) stockUpdateData.quantity = parseInt(quantity.toString());

            // Find existing stock or create new one
            const existingStock = await this.prisma.stock.findFirst({
                where: { productId: id },
            });

            if (existingStock) {
                await this.prisma.stock.update({
                    where: { id: existingStock.id },
                    data: stockUpdateData,
                });
            } else {
                await this.prisma.stock.create({
                    data: {
                        productId: id,
                        quantity: stockUpdateData.quantity || 0,
                        minStock: stockUpdateData.minStock || 5,
                    },
                });
            }
        }

        return this.findOne(id);
    }

    async remove(id: string) {
        return this.prisma.product.delete({
            where: { id },
        });
    }
}
