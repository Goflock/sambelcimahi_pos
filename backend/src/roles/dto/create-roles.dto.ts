import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRolesDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
