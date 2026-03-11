import { Injectable } from '@nestjs/common';
import { CreateCurrenciesDto } from './dto/create-currencies.dto';
import { UpdateCurrenciesDto } from './dto/update-currencies.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrenciesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCurrenciesDto) {
    return this.prisma.currency.create({ data });
  }

  findAll() {
    return this.prisma.currency.findMany({
        orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.currency.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateCurrenciesDto) {
    return this.prisma.currency.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.currency.delete({
      where: { id },
    });
  }
}
