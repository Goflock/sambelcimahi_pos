#!/bin/bash

# Function to create a module
create_module() {
    local NAME=$1
    local SINGULAR=$2
    local MODEL=$3
    
    mkdir -p "src/$NAME/dto"

    # Module
    cat > "src/$NAME/$NAME.module.ts" <<EOF
import { Module } from '@nestjs/common';
import { ${SINGULAR}Service } from './$NAME.service';
import { ${SINGULAR}Controller } from './$NAME.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [${SINGULAR}Controller],
  providers: [${SINGULAR}Service],
})
export class ${SINGULAR}Module {}
EOF

    # Controller
    cat > "src/$NAME/$NAME.controller.ts" <<EOF
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ${SINGULAR}Service } from './$NAME.service';
import { Create${SINGULAR}Dto } from './dto/create-$NAME.dto';
import { Update${SINGULAR}Dto } from './dto/update-$NAME.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('$NAME')
export class ${SINGULAR}Controller {
  constructor(private readonly service: ${SINGULAR}Service) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  create(@Body() dto: Create${SINGULAR}Dto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  update(@Param('id') id: string, @Body() dto: Update${SINGULAR}Dto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
EOF

    # Service
    cat > "src/$NAME/$NAME.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { Create${SINGULAR}Dto } from './dto/create-$NAME.dto';
import { Update${SINGULAR}Dto } from './dto/update-$NAME.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ${SINGULAR}Service {
  constructor(private prisma: PrismaService) {}

  create(data: Create${SINGULAR}Dto) {
    return this.prisma.${MODEL}.create({ data });
  }

  findAll() {
    return this.prisma.${MODEL}.findMany({
        orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.${MODEL}.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Update${SINGULAR}Dto) {
    return this.prisma.${MODEL}.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.${MODEL}.delete({
      where: { id },
    });
  }
}
EOF

    # DTO Update
    cat > "src/$NAME/dto/update-$NAME.dto.ts" <<EOF
import { PartialType } from '@nestjs/swagger';
import { Create${SINGULAR}Dto } from './create-$NAME.dto';

export class Update${SINGULAR}Dto extends PartialType(Create${SINGULAR}Dto) {}
EOF
}

# --- Units ---
create_module "units" "Units" "unit"
cat > "src/units/dto/create-units.dto.ts" <<EOF
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUnitsDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    symbol?: string;
}
EOF

# --- Warehouses ---
create_module "warehouses" "Warehouses" "warehouse"
cat > "src/warehouses/dto/create-warehouses.dto.ts" <<EOF
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWarehousesDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    address?: string;
}
EOF

# --- Taxes ---
create_module "taxes" "Taxes" "tax"
cat > "src/taxes/dto/create-taxes.dto.ts" <<EOF
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateTaxesDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    rate: number;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
EOF

# --- Currencies ---
create_module "currencies" "Currencies" "currency"
cat > "src/currencies/dto/create-currencies.dto.ts" <<EOF
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCurrenciesDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    symbol: string;

    @IsNumber()
    @IsOptional()
    rate?: number;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
EOF

# --- Customers (Simple) ---
create_module "customers" "Customers" "customer"
cat > "src/customers/dto/create-customers.dto.ts" <<EOF
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomersDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    customerGroupId?: string;
}
EOF

# --- Discounts ---
create_module "discounts" "Discounts" "discount"
cat > "src/discounts/dto/create-discounts.dto.ts" <<EOF
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsDateStr, IsEnum } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateDiscountsDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(DiscountType)
    @IsNotEmpty()
    type: DiscountType;

    @IsNumber()
    @IsNotEmpty()
    value: number;

    @IsDateStr()
    @IsNotEmpty()
    startDate: string;

    @IsDateStr()
    @IsOptional()
    endDate?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
EOF

# --- Roles ---
create_module "roles" "Roles" "role"
cat > "src/roles/dto/create-roles.dto.ts" <<EOF
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRolesDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
EOF

