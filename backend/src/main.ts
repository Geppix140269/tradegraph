import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('GlobalTrade Nexus API')
    .setDescription('International Commerce Trading Platform - API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('shipments', 'Search and retrieve shipment records')
    .addTag('companies', 'Company profiles and related data')
    .addTag('compliance', 'Risk checks and sanctions screening')
    .addTag('tariffs', 'Duty rates and trade measures')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`GlobalTrade Nexus API running on port ${port}`);
}

bootstrap();
