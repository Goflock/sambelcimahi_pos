import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum KitchenStatus {
    PENDING = 'PENDING',
    COOKING = 'COOKING',
    DONE = 'DONE',
}

export class UpdateKitchenStatusDto {
    @ApiProperty({ enum: KitchenStatus, description: 'Kitchen order status' })
    @IsEnum(KitchenStatus)
    status: KitchenStatus;
}
