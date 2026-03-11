import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(private prisma: PrismaService) { }

    create(createExpenseDto: CreateExpenseDto, userId: string) {
        return this.prisma.expense.create({
            data: {
                ...createExpenseDto,
                userId,
            },
        });
    }

    findAll(startDate?: string, endDate?: string) {
        const where: any = {};
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        return this.prisma.expense.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    findOne(id: string) {
        return this.prisma.expense.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    update(id: string, updateExpenseDto: UpdateExpenseDto) {
        return this.prisma.expense.update({
            where: { id },
            data: updateExpenseDto,
        });
    }

    remove(id: string) {
        return this.prisma.expense.delete({
            where: { id },
        });
    }
}
