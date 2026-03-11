import { Controller, Get, Body, Patch, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @Roles('OWNER', 'ADMIN', 'CASHIER')
    @ApiOperation({ summary: 'Get all settings' })
    @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
    async findAll() {
        return {
            success: true,
            data: await this.settingsService.findAll(),
        };
    }

    @Patch()
    @Roles('OWNER', 'ADMIN')
    @ApiOperation({ summary: 'Update settings' })
    @ApiResponse({ status: 200, description: 'Settings updated successfully' })
    async update(@Body() updateSettingsDto: UpdateSettingsDto) {
        try {
            return {
                success: true,
                data: await this.settingsService.update(updateSettingsDto),
                message: 'Pengaturan berhasil diperbarui',
            };
        } catch (error) {
            console.error('Update settings error:', error);
            throw new BadRequestException('Gagal memperbarui pengaturan: ' + error.message);
        }
    }

    @Post('upload-logo')
    @Roles('OWNER', 'ADMIN')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                return cb(new BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Upload store logo' })
    async uploadLogo(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        // Update the logo setting automatically
        await this.settingsService.update({ logoUrl: `/uploads/${file.filename}` } as any);

        return {
            success: true,
            data: { url: `/uploads/${file.filename}` },
            message: 'Logo berhasil diupload',
        };
    }
}
