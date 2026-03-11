import { Module } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { KitchenController } from './kitchen.controller';
import { KitchenGateway } from './kitchen.gateway';

@Module({
    controllers: [KitchenController],
    providers: [KitchenService, KitchenGateway],
    exports: [KitchenService, KitchenGateway],
})
export class KitchenModule { }
