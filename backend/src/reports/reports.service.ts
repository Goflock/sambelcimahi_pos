import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getDailySales(date?: Date) {
        const targetDate = date || new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const orders = await this.prisma.order.findMany({
            where: {
                status: 'COMPLETED',
                completedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        const totalSales = orders.reduce((sum, order) => sum + order.total.toNumber(), 0);
        const totalOrders = orders.length;
        const totalItems = orders.reduce(
            (sum, order) => sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
            0,
        );

        return {
            date: targetDate,
            totalSales,
            totalOrders,
            totalItems,
            orders,
        };
    }

    async getMonthlySales(year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const orders = await this.prisma.order.findMany({
            where: {
                status: 'COMPLETED',
                completedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const totalSales = orders.reduce((sum, order) => sum + order.total.toNumber(), 0);
        const totalOrders = orders.length;

        // Group by day
        const dailyData = orders.reduce((acc, order) => {
            const day = order.completedAt.getDate();
            if (!acc[day]) {
                acc[day] = { day, sales: 0, orders: 0 };
            }
            acc[day].sales += order.total.toNumber();
            acc[day].orders += 1;
            return acc;
        }, {});

        return {
            year,
            month,
            totalSales,
            totalOrders,
            dailyData: Object.values(dailyData),
        };
    }

    async getBestSellingProducts(limit: number = 10) {
        const products = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
                subtotal: true,
            },
            _count: {
                productId: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: limit,
        });

        const productDetails = await Promise.all(
            products.map(async (item) => {
                const product = await this.prisma.product.findUnique({
                    where: { id: item.productId },
                    include: { category: true },
                });
                return {
                    product,
                    totalQuantity: item._sum.quantity,
                    totalRevenue: item._sum.subtotal,
                    orderCount: item._count.productId,
                };
            }),
        );

        return productDetails;
    }

    async getStockReport() {
        const stocks = await this.prisma.stock.findMany({
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

        const lowStock = stocks.filter((stock) => stock.quantity <= stock.minStock);
        const outOfStock = stocks.filter((stock) => stock.quantity === 0);

        return {
            totalProducts: stocks.length,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            stocks,
            lowStock,
            outOfStock,
        };
    }

    async getFinancialSummary(startDate?: string, endDate?: string) {
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date();

        // Ensure end date includes the whole day
        end.setHours(23, 59, 59, 999);

        // 1. Calculate Total Revenue from Completed Orders
        const orders = await this.prisma.order.findMany({
            where: {
                status: 'COMPLETED',
                completedAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.total.toNumber(), 0);

        // 2. Calculate COGS (Cost of Goods Sold)
        // Note: This uses current product cost. For better accuracy, cost should be snapshot in OrderItem.
        let totalCOGS = 0;
        orders.forEach(order => {
            order.orderItems.forEach(item => {
                const cost = item.product.cost.toNumber();
                totalCOGS += cost * item.quantity;
            });
        });

        // 3. Calculate Operational Expenses
        const expenses = await this.prisma.expense.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
        });

        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount.toNumber(), 0);

        // 4. Calculate Net Profit
        const grossProfit = totalRevenue - totalCOGS;
        const netProfit = grossProfit - totalExpenses;

        return {
            period: {
                start,
                end,
            },
            financials: {
                totalRevenue,
                totalCOGS,
                grossProfit,
                totalExpenses,
                netProfit,
            },
            metrics: {
                profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
                expenseRatio: totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0,
            }
        };
    }
}
