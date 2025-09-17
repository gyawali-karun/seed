import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const PORT = 3333;
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('seed')
    .setDescription('The seed API description')
    .setVersion('0.1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'jwt' },
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(PORT);
  Logger.log(
    `🚀 Application is running on: http://localhost:${PORT}/${globalPrefix}`,
  );
  Logger.log(`Swagger UI: http://localhost:${PORT}/api/docs`);
}
void bootstrap();
