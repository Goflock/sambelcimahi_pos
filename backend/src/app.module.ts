import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { StocksModule } from './stocks/stocks.module';
import { OrdersModule } from './orders/orders.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UtilsModule } from './utils/utils.module'; // Placeholder if needed
import { BrandsModule } from './brands/brands.module';
import { UnitsModule } from './units/units.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { TaxesModule } from './taxes/taxes.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { CustomersModule } from './customers/customers.module';
import { DiscountsModule } from './discounts/discounts.module';
import { RolesModule } from './roles/roles.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

import { join } from 'path';
// import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        // ServeStaticModule.forRoot({
        //     rootPath: join(__dirname, '..', '..', 'uploads'), // Go up from dist/src/app.module.js
        //     serveRoot: '/uploads',
        // }),
        PrismaModule,
        AuthModule,
        UsersModule,
        CategoriesModule,
        ProductsModule,
        StocksModule,
        OrdersModule,
        KitchenModule,
        ReportsModule,
        SettingsModule,
        BrandsModule,
        UnitsModule,
        WarehousesModule,
        TaxesModule,
        CurrenciesModule,
        CustomersModule,
        DiscountsModule,
        RolesModule,
        ExpensesModule,
        AuditLogsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
})
export class AppModule { }
