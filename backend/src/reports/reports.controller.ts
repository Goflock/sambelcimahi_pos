import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('sales/daily')
    @ApiOperation({ summary: 'Get daily sales report' })
    @ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format' })
    @ApiResponse({ status: 200, description: 'Daily sales report retrieved successfully' })
    async getDailySales(@Query('date') date?: string) {
        const targetDate = date ? new Date(date) : new Date();
        const report = await this.reportsService.getDailySales(targetDate);
        return {
            success: true,
            data: report,
        };
    }

    @Get('sales/monthly')
    @ApiOperation({ summary: 'Get monthly sales report' })
    @ApiQuery({ name: 'year', required: true, description: 'Year (e.g., 2026)' })
    @ApiQuery({ name: 'month', required: true, description: 'Month (1-12)' })
    @ApiResponse({ status: 200, description: 'Monthly sales report retrieved successfully' })
    async getMonthlySales(@Query('year') year: string, @Query('month') month: string) {
        const currentDate = new Date();
        const parsedYear = year ? parseInt(year) : currentDate.getFullYear();
        const parsedMonth = month ? parseInt(month) : currentDate.getMonth() + 1;

        // Validation: Ensure valid numbers, otherwise fallback to current
        const validYear = !isNaN(parsedYear) ? parsedYear : currentDate.getFullYear();
        const validMonth = !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : currentDate.getMonth() + 1;

        const report = await this.reportsService.getMonthlySales(
            validYear,
            validMonth,
        );
        return {
            success: true,
            data: report,
        };
    }

    @Get('products/best-selling')
    @ApiOperation({ summary: 'Get best-selling products' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of products to return' })
    @ApiResponse({ status: 200, description: 'Best-selling products retrieved successfully' })
    async getBestSellingProducts(@Query('limit') limit?: string) {
        const products = await this.reportsService.getBestSellingProducts(
            limit ? parseInt(limit) : 10,
        );
        return {
            success: true,
            data: products,
        };
    }

    @Get('stocks')
    @ApiOperation({ summary: 'Get stock report' })
    @ApiResponse({ status: 200, description: 'Stock report retrieved successfully' })
    async getStockReport() {
        const report = await this.reportsService.getStockReport();
        return {
            success: true,
            data: report,
        };
    }

    @Get('financial-summary')
    @ApiOperation({ summary: 'Get financial summary (Revenue, Expenses, Profit)' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Financial summary retrieved successfully' })
    async getFinancialSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const summary = await this.reportsService.getFinancialSummary(startDate, endDate);
        return {
            success: true,
            data: summary,
        };
    }
}
