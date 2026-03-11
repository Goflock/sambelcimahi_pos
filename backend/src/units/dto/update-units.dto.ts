import { PartialType } from '@nestjs/swagger';
import { CreateUnitsDto } from './create-units.dto';

export class UpdateUnitsDto extends PartialType(CreateUnitsDto) {}
