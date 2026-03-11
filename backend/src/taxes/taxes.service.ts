import { Injectable } from '@nestjs/common';
import { CreateTaxesDto } from './dto/create-taxes.dto';
import { UpdateTaxesDto } from './dto/update-taxes.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaxesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateTaxesDto) {
    return this.prisma.tax.create({ data });
  }

  findAll() {
    return this.prisma.tax.findMany({
        orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.tax.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateTaxesDto) {
    return this.prisma.tax.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.tax.delete({
      where: { id },
    });
  }
}
