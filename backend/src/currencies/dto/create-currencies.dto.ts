import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCurrenciesDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    symbol: string;

    @IsNumber()
    @IsOptional()
    rate?: number;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
