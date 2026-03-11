import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StocksService } from './stocks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@ApiTags('stocks')
@ApiBearerAuth()
@Controller('stocks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StocksController {
    constructor(private readonly stocksService: StocksService) { }

    @Post('adjust')
    @Roles('ADMIN', 'OWNER')
    @ApiOperation({ summary: 'Adjust stock manually (Opname)' })
    @ApiResponse({ status: 201, description: 'Stock adjusted successfully' })
    @ApiResponse({ status: 400, description: 'Insufficient stock or invalid input' })
    async adjustStock(@Request() req, @Body() adjustStockDto: AdjustStockDto) {
        const result = await this.stocksService.adjustStock(req.user.id, adjustStockDto);
        return {
            success: true,
            data: result,
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all stocks' })
    @ApiResponse({ status: 200, description: 'Stocks retrieved successfully' })
    async findAll() {
        const stocks = await this.stocksService.findAll();
        return {
            success: true,
            data: stocks,
        };
    }

    @Get('low')
    @Roles('ADMIN', 'OWNER')
    @ApiOperation({ summary: 'Get low stock items' })
    @ApiResponse({ status: 200, description: 'Low stock items retrieved successfully' })
    async findLowStock() {
        const stocks = await this.stocksService.findLowStock();
        return {
            success: true,
            data: stocks,
        };
    }

    @Get('movements')
    @Roles('ADMIN', 'OWNER')
    @ApiOperation({ summary: 'Get stock movements history' })
    @ApiResponse({ status: 200, description: 'Stock movements retrieved successfully' })
    async getStockMovements() {
        const movements = await this.stocksService.getStockMovements();
        return {
            success: true,
            data: movements,
        };
    }

    @Get(':productId')
    @ApiOperation({ summary: 'Get stock by product ID' })
    @ApiResponse({ status: 200, description: 'Stock retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Stock not found' })
    async findOne(@Param('productId') productId: string) {
        const stock = await this.stocksService.findOne(productId);
        return {
            success: true,
            data: stock,
        };
    }
}
