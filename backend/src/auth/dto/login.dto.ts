import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@cimahipos.com' })
    @IsEmail({}, { message: 'Email tidak valid' })
    @IsNotEmpty({ message: 'Email wajib diisi' })
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString({ message: 'Password harus berupa string' })
    @IsNotEmpty({ message: 'Password wajib diisi' })
    @MinLength(6, { message: 'Password minimal 6 karakter' })
    password: string;
}
