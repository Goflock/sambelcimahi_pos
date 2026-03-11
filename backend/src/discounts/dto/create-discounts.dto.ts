import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateDiscountsDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(DiscountType)
    @IsNotEmpty()
    type: DiscountType;

    @IsNumber()
    @IsNotEmpty()
    value: number;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
