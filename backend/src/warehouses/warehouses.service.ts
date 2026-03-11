import { Injectable } from '@nestjs/common';
import { CreateWarehousesDto } from './dto/create-warehouses.dto';
import { UpdateWarehousesDto } from './dto/update-warehouses.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateWarehousesDto) {
    return this.prisma.warehouse.create({ data });
  }

  findAll() {
    return this.prisma.warehouse.findMany({
        orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.warehouse.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateWarehousesDto) {
    return this.prisma.warehouse.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.warehouse.delete({
      where: { id },
    });
  }
}
