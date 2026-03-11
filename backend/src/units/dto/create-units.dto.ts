import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUnitsDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    symbol?: string;
}
