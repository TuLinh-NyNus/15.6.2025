import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PasswordService } from './password.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => {
        // Ưu tiên sử dụng process.env vì đã được thiết lập trong bootstrap.ts
        const secret = process.env.JWT_ACCESS_SECRET;
        const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN;
                          
        console.log('Auth Module - JWT_ACCESS_SECRET is present:', !!secret);
        console.log('Auth Module - JWT_ACCESS_EXPIRES_IN:', expiresIn);
        
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordService],
  exports: [PassportModule, JwtModule, AuthService, PasswordService],
})
export class AuthModule {}
