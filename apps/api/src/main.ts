// Load environment variables first, before any other imports
import { loadEnv } from './bootstrap';
loadEnv();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, LogLevel } from '@nestjs/common';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { Logger } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';

async function bootstrap() {
  // Không cần kiểm tra lại biến môi trường vì đã kiểm tra trong bootstrap.ts
  // console.log('In main.ts - JWT_ACCESS_SECRET is present:', !!process.env.JWT_ACCESS_SECRET);
  // console.log('In main.ts - JWT_REFRESH_SECRET is present:', !!process.env.JWT_REFRESH_SECRET);

  // Chỉ định mức độ log cho ứng dụng
  const logLevels: LogLevel[] = ['error', 'warn'];

  // Cấu hình Winston logger cho file logs - không cần lưu kết quả
  WinstonModule.createLogger({
    level: 'error',
    format: format.combine(
      format.timestamp(),
      format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
      new transports.Console(),
      new transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error'
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  // Set global API prefix với exclude một số route cụ thể
  app.setGlobalPrefix('api', {
    exclude: ['/', '/health', '/info'], // Không áp dụng prefix cho những route này
  });

  // CORS setup
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Không báo lỗi khi có tham số không được định nghĩa trong DTO
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger setup - tạm thời comment lại để tránh lỗi circular dependency
  /*
  const config = new DocumentBuilder()
    .setTitle('NyNus API')
    .setDescription('API cho nền tảng học tập trực tuyến NyNus')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  */

  // Luôn sử dụng cổng 5000 cho API
  const PORT = process.env.PORT || 5000;

  // Khởi động ứng dụng trên port đã chọn
  await app.listen(PORT);

  console.log(`=== API đã khởi động trên cổng ${PORT} ===`);
}

bootstrap();