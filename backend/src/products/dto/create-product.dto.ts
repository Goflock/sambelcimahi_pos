import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    categoryId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Min(0)
    cost: number = 0;

    @ApiProperty()
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity: number = 0;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    unit: string = 'pcs';

    @ApiProperty()
    @IsNumber()
    @Min(0)
    minStock: number = 0;

    @ApiProperty()
    @IsOptional()
    @IsString()
    imageUrl?: string;
}
