import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
    constructor(private prisma: PrismaService) { }

    create(data: CreatePermissionDto) {
        return this.prisma.permission.create({ data });
    }

    findAll() {
        return this.prisma.permission.findMany({
            orderBy: { resource: 'asc' }
        });
    }

    findOne(id: string) {
        return this.prisma.permission.findUnique({
            where: { id },
        });
    }

    update(id: string, data: UpdatePermissionDto) {
        return this.prisma.permission.update({
            where: { id },
            data,
        });
    }

    remove(id: string) {
        return this.prisma.permission.delete({
            where: { id },
        });
    }
}
