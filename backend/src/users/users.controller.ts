import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles('OWNER', 'ADMIN')
    @ApiOperation({ summary: 'Create new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return {
            success: true,
            data: user,
        };
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'User profile retrieved' })
    async getMe(@Request() req) {
        const user = await this.usersService.findOne(req.user.sub);
        return {
            success: true,
            data: user,
        };
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.usersService.updateProfile(req.user.sub, updateUserDto);
        return {
            success: true,
            data: user,
            message: 'Profil berhasil diperbarui',
        };
    }

    @Get()
    @Roles('OWNER', 'ADMIN')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    async findAll() {
        const users = await this.usersService.findAll();
        return {
            success: true,
            data: users,
        };
    }

    @Get(':id')
    @Roles('OWNER', 'ADMIN')
    @ApiOperation({ summary: 'Get user by ID' })
    async findOne(@Param('id') id: string) {
        return {
            success: true,
            data: await this.usersService.findOne(id),
        };
    }

    @Patch(':id')
    @Roles('OWNER')
    @ApiOperation({ summary: 'Update user (Owner only)' })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return {
            success: true,
            data: await this.usersService.update(id, updateUserDto),
        };
    }

    @Delete(':id')
    @Roles('OWNER')
    @ApiOperation({ summary: 'Delete user (Owner only)' })
    async remove(@Param('id') id: string) {
        return {
            success: true,
            data: await this.usersService.remove(id),
        };
    }
}
