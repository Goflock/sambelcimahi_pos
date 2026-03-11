import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateTaxesDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    rate: number;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
