import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api');

    // CORS
    app.enableCors({
        origin: (origin, callback) => {
            callback(null, true);
        },
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Cimahi POS API')
        .setDescription('Point of Sales System API Documentation for UMKM')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management')
        .addTag('categories', 'Product categories')
        .addTag('products', 'Product management')
        .addTag('stocks', 'Stock management')
        .addTag('orders', 'Order transactions')
        .addTag('kitchen', 'Kitchen Display System')
        .addTag('reports', 'Reports and analytics')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/docs`);
}

bootstrap();
