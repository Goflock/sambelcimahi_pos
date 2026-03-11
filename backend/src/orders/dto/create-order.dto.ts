import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsUUID, IsNumber, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderType {
    DINE_IN = 'DINE_IN',
    TAKEAWAY = 'TAKEAWAY',
    DELIVERY = 'DELIVERY',
}

export enum PaymentMethod {
    CASH = 'CASH',
    DEBIT = 'DEBIT',
    QRIS = 'QRIS',
    TRANSFER = 'TRANSFER',
}

export class CreateOrderItemDto {
    @ApiProperty({ description: 'Product ID' })
    @IsUUID()
    productId: string;

    @ApiProperty({ description: 'Quantity', minimum: 1 })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ description: 'Special notes', required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreateOrderDto {
    @ApiProperty({ description: 'Customer name', required: false })
    @IsString()
    @IsOptional()
    customerName?: string;

    @ApiProperty({ description: 'Local ID for offline sync anti-duplication', required: false })
    @IsString()
    @IsOptional()
    localId?: string;

    @ApiProperty({ description: 'Original timestamp when the order was made offline', required: false })
    @IsDateString()
    @IsOptional()
    offlineSyncAt?: string;

    @ApiProperty({ enum: OrderType, description: 'Order type' })
    @IsEnum(OrderType)
    orderType: OrderType;

    @ApiProperty({ description: 'Table number for dine-in', required: false })
    @IsString()
    @IsOptional()
    tableNumber?: string;

    @ApiProperty({ type: [CreateOrderItemDto], description: 'Order items' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @ApiProperty({ description: 'Discount amount', required: false, default: 0 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    discount?: number;

    @ApiProperty({ description: 'Tax amount', required: false, default: 0 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    tax?: number;
}
