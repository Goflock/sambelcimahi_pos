import { Injectable } from '@nestjs/common';
import { CreateDiscountsDto } from './dto/create-discounts.dto';
import { UpdateDiscountsDto } from './dto/update-discounts.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDiscountsDto) {
    return this.prisma.discount.create({ data });
  }

  findAll() {
    return this.prisma.discount.findMany({
        orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.discount.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateDiscountsDto) {
    return this.prisma.discount.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.discount.delete({
      where: { id },
    });
  }
}
