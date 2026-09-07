import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { EnvService } from '@cfg/schema/env.service';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  const envService = app.get(EnvService);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(cookieParser());
  app.enableCors({
    origin: envService.frontendUrl,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('MyAIChat API')
    .setDescription('API documentation for MyAIChat application')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('user', 'User management endpoints')
    .addTag('chat', 'Chat and messaging endpoints')
    .addTag('prompts', 'Prompts management endpoints')
    .addTag('models', 'AI models management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(envService.port);
  logger.log(`Application is running on port: ${envService.port}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${envService.port}/api/docs`,
  );
}
bootstrap();
