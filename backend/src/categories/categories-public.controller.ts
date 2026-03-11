import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('public/categories')
@Controller('public/categories')
export class CategoriesPublicController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all categories for public catalog' })
    async findAll() {
        return {
            success: true,
            data: await this.categoriesService.findAll(),
        };
    }
}
