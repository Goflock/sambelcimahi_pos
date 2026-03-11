import { IsNotEmpty, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MovementType {
    IN = 'IN',
    OUT = 'OUT',
}

export class AdjustStockDto {
    @ApiProperty({ description: 'ID of the product' })
    @IsNotEmpty()
    @IsString()
    productId: string;

    @ApiProperty({ description: 'Type of movement', enum: MovementType })
    @IsNotEmpty()
    @IsEnum(MovementType)
    type: MovementType;

    @ApiProperty({ description: 'Quantity to adjust' })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ description: 'Reason or notes for adjustment', required: false })
    @IsString()
    notes?: string;
}
