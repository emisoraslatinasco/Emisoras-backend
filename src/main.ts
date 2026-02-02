import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Servir archivos estáticos desde /public
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Emisoras Latinas API')
    .setDescription('API para gestión de emisoras de radio latinoamericanas')
    .setVersion('1.0')
    .addTag('Countries', 'Gestión de países')
    .addTag('Genres', 'Gestión de géneros musicales')
    .addTag('Stations', 'Gestión de emisoras de radio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs\n`);
}
void bootstrap();
