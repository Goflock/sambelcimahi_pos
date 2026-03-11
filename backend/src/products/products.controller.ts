import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    async findAll() {
        console.log('GET /products called');
        return {
            success: true,
            data: await this.productsService.findAll(),
        };
    }

    @Get('available')
    async findAvailable() {
        return {
            success: true,
            data: await this.productsService.findAvailable(),
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return {
            success: true,
            data: await this.productsService.findOne(id),
        };
    }

    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        return {
            success: true,
            data: await this.productsService.create(createProductDto),
            message: 'Product created successfully',
        };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return {
            success: true,
            data: await this.productsService.update(id, updateProductDto),
            message: 'Product updated successfully',
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.productsService.remove(id);
        return {
            success: true,
            message: 'Product deleted successfully',
        };
    }
}
