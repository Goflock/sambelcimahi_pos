import { Injectable } from '@nestjs/common';
import { CreateUnitsDto } from './dto/create-units.dto';
import { UpdateUnitsDto } from './dto/update-units.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateUnitsDto) {
    return this.prisma.unit.create({ data });
  }

  findAll() {
    return this.prisma.unit.findMany({
        orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.unit.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateUnitsDto) {
    return this.prisma.unit.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.unit.delete({
      where: { id },
    });
  }
}
