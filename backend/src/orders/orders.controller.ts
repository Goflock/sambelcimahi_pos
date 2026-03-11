import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create new order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        const order = await this.ordersService.create(createOrderDto, req.user.id);
        return {
            success: true,
            message: 'Order berhasil dibuat',
            data: order,
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders' })
    @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
    async findAll() {
        const orders = await this.ordersService.findAll();
        return {
            success: true,
            data: orders,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async findOne(@Param('id') id: string) {
        const order = await this.ordersService.findOne(id);
        return {
            success: true,
            data: order,
        };
    }

    @Patch(':id/complete')
    @Roles('ADMIN', 'OWNER')
    @ApiOperation({ summary: 'Complete order' })
    @ApiResponse({ status: 200, description: 'Order completed successfully' })
    @ApiResponse({ status: 400, description: 'Order already completed or cancelled' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async complete(@Param('id') id: string) {
        const order = await this.ordersService.complete(id);
        return {
            success: true,
            message: 'Order berhasil diselesaikan',
            data: order,
        };
    }

    @Patch(':id/cancel')
    @Roles('ADMIN', 'OWNER')
    @ApiOperation({ summary: 'Cancel order' })
    @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Order already completed or cancelled' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async cancel(@Param('id') id: string, @Request() req) {
        const order = await this.ordersService.cancel(id, req.user.id);
        return {
            success: true,
            message: 'Order berhasil dibatalkan',
            data: order,
        };
    }
}
