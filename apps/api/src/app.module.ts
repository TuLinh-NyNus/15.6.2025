import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { LoggingModule } from './common/logging/logging.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { join } from 'path';
import * as fs from 'fs';
import { getErrorMessage } from './utils/error-handler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggingModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
    LessonsModule,
    CategoriesModule,
    QuestionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule implements OnModuleInit {
  private static envChecked = false;
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Kiểm tra xem đã thực hiện việc kiểm tra môi trường chưa
    if (AppModule.envChecked) {
      return; // Nếu đã kiểm tra rồi, không cần kiểm tra lại
    }
    
    console.log('Current directory:', process.cwd());
    console.log('Environment variables:');
    console.log('JWT_ACCESS_SECRET:', this.configService.get('JWT_ACCESS_SECRET') ? '✓ Set' : '✗ Not set');
    console.log('JWT_REFRESH_SECRET:', this.configService.get('JWT_REFRESH_SECRET') ? '✓ Set' : '✗ Not set');
    
    // Chỉ kiểm tra các đường dẫn cần thiết
    const envPaths = [
      join(process.cwd(), '.env')
    ];
    
    // Đánh dấu là đã kiểm tra
    AppModule.envChecked = true;
    
    // Log một lần duy nhất
    console.log('=== ENV FILE CHECK ===');
    envPaths.forEach(path => {
      console.log(`Checking .env path: ${path}`);
      const fileExists = fs.existsSync(path);
      console.log(`File exists: ${fileExists}`);
      if (fileExists) {
        try {
          const content = fs.readFileSync(path, 'utf8');
          console.log(`File content exists: ${content.length > 0}`);
        } catch (error) {
          console.error(`Error reading file: ${error instanceof Error ? getErrorMessage(error) : String(error)}`);
        }
      }
    });
    console.log('=== ENV CHECK COMPLETE ===');
  }
} 
