import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KitchenService } from './kitchen.service';
import { UpdateKitchenStatusDto } from './dto/update-kitchen-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('kitchen')
@ApiBearerAuth()
@Controller('kitchen')
@UseGuards(JwtAuthGuard)
export class KitchenController {
    constructor(private readonly kitchenService: KitchenService) { }

    @Get('orders')
    @ApiOperation({ summary: 'Get pending and cooking kitchen orders' })
    @ApiResponse({ status: 200, description: 'Kitchen orders retrieved successfully' })
    async getKitchenOrders() {
        const orders = await this.kitchenService.getKitchenOrders();
        return {
            success: true,
            data: orders,
        };
    }

    @Get('orders/completed')
    @ApiOperation({ summary: 'Get completed kitchen orders' })
    @ApiResponse({ status: 200, description: 'Completed orders retrieved successfully' })
    async getCompletedOrders() {
        const orders = await this.kitchenService.getCompletedOrders();
        return {
            success: true,
            data: orders,
        };
    }

    @Get('orders/:id')
    @ApiOperation({ summary: 'Get kitchen order by ID' })
    @ApiResponse({ status: 200, description: 'Kitchen order retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Kitchen order not found' })
    async getKitchenOrderById(@Param('id') id: string) {
        const order = await this.kitchenService.getKitchenOrderById(id);
        return {
            success: true,
            data: order,
        };
    }

    @Patch('orders/:id/status')
    @ApiOperation({ summary: 'Update kitchen order status' })
    @ApiResponse({ status: 200, description: 'Status updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid status transition' })
    @ApiResponse({ status: 404, description: 'Kitchen order not found' })
    async updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateKitchenStatusDto,
    ) {
        const order = await this.kitchenService.updateStatus(id, updateStatusDto.status);
        return {
            success: true,
            message: 'Status berhasil diupdate',
            data: order,
        };
    }
}
