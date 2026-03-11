import { Injectable } from '@nestjs/common';
import { CreateRolesDto } from './dto/create-roles.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateRolesDto) {
    return this.prisma.role.create({ data });
  }

  findAll() {
    return this.prisma.role.findMany({
        orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateRolesDto) {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
