import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.CASHIER)
    create(@Body() createExpenseDto: CreateExpenseDto, @Req() req) {
        return this.expensesService.create(createExpenseDto, req.user.id);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.OWNER)
    findAll(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.expensesService.findAll(startDate, endDate);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.OWNER)
    findOne(@Param('id') id: string) {
        return this.expensesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.OWNER)
    update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
        return this.expensesService.update(id, updateExpenseDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.OWNER)
    remove(@Param('id') id: string) {
        return this.expensesService.remove(id);
    }
}
