import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    storeName?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    storeAddress?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    storePhone?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    taxRate?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    serviceCharge?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    printerIp?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    logoUrl?: string;
}
