import { Injectable } from '@nestjs/common';
import { CreateCustomerGroupDto } from './dto/create-customer-group.dto';
import { UpdateCustomerGroupDto } from './dto/update-customer-group.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerGroupsService {
    constructor(private prisma: PrismaService) { }

    create(data: CreateCustomerGroupDto) {
        return this.prisma.customerGroup.create({ data });
    }

    findAll() {
        return this.prisma.customerGroup.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { customers: true } } }
        });
    }

    findOne(id: string) {
        return this.prisma.customerGroup.findUnique({
            where: { id },
            include: { customers: true }
        });
    }

    update(id: string, data: UpdateCustomerGroupDto) {
        return this.prisma.customerGroup.update({
            where: { id },
            data,
        });
    }

    remove(id: string) {
        return this.prisma.customerGroup.delete({
            where: { id },
        });
    }
}
