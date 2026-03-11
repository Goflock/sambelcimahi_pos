import { PartialType } from '@nestjs/swagger';
import { CreateDiscountsDto } from './create-discounts.dto';

export class UpdateDiscountsDto extends PartialType(CreateDiscountsDto) {}
