import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
    @IsString()
    @IsNotEmpty()
    action: string;

    @IsString()
    @IsNotEmpty()
    resource: string;

    @IsString()
    @IsOptional()
    description?: string;
}
