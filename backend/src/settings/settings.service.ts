import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const settings = await this.prisma.appSetting.findMany();
        // Convert to object for easier consumption
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
    }

    async update(updateSettingsDto: UpdateSettingsDto) {
        const updates = Object.entries(updateSettingsDto).map(([key, value]) => {
            if (value !== undefined) {
                return this.prisma.appSetting.upsert({
                    where: { key },
                    update: { value: value.toString() },
                    create: { key, value: value.toString() },
                });
            }
            return null;
        }).filter(Boolean);

        await this.prisma.$transaction(updates);
        return this.findAll();
    }
}
