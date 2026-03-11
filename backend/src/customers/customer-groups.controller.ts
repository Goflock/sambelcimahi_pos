import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomerGroupsService } from './customer-groups.service';
import { CreateCustomerGroupDto } from './dto/create-customer-group.dto';
import { UpdateCustomerGroupDto } from './dto/update-customer-group.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customer-groups')
export class CustomerGroupsController {
    constructor(private readonly service: CustomerGroupsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.OWNER)
    create(@Body() dto: CreateCustomerGroupDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.OWNER)
    update(@Param('id') id: string, @Body() dto: UpdateCustomerGroupDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.OWNER)
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
