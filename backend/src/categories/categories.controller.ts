import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll() {
        return {
            success: true,
            data: await this.categoriesService.findAll(),
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return {
            success: true,
            data: await this.categoriesService.findOne(id),
        };
    }
}
