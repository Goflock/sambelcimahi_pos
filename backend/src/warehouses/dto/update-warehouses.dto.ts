import { PartialType } from '@nestjs/swagger';
import { CreateWarehousesDto } from './create-warehouses.dto';

export class UpdateWarehousesDto extends PartialType(CreateWarehousesDto) {}
