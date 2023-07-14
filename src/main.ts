import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
  app.use(helmet());
  app.enableCors({
    credentials: true,
    origin: configService.get<string>('domain'),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EuJogoService')
    .setDescription('Api de gerenciamento do Eu Jogo')
    .setVersion('0.0.1')
    .addBearerAuth()
    .addTag('EuJogo API')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(configService.get<number>('port'));
}
bootstrap();
