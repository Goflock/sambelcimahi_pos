import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWarehousesDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    address?: string;
}
