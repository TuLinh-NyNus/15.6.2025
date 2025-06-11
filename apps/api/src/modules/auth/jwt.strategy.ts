import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Permission } from '../../common/enums/permission.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    // Ưu tiên sử dụng process.env vì đã được thiết lập trong bootstrap.ts
    const secret = process.env.JWT_ACCESS_SECRET;

    console.log('JwtStrategy - JWT_ACCESS_SECRET is present:', !!secret);
    console.log('JwtStrategy - JWT_ACCESS_SECRET value:', secret);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: JwtPayload) {
    console.log('JWT Validate - Payload:', JSON.stringify(payload));
    console.log('JWT Validate - Authorization header:', request.headers?.authorization);

    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      console.log('JWT Validate - User not found for ID:', payload.sub);
      throw new UnauthorizedException('User not found');
    }

    console.log('JWT Validate - User found:', user.email, 'Role:', user.role);

    // Add permissions based on user role
    const permissions = this.getPermissionsByRole(user.role);

    return {
      ...user,
      permissions,
    };
  }

  private getPermissionsByRole(role: string): Permission[] {
    const permissions: Permission[] = [];

    // Basic permissions for all authenticated users
    permissions.push(
      Permission.READ_COURSE,
      Permission.READ_CATEGORY,
      Permission.READ_LESSON,
    );

    switch (role) {
      case 'INSTRUCTOR':
        permissions.push(
          Permission.CREATE_COURSE,
          Permission.UPDATE_COURSE,
          Permission.DELETE_COURSE,
          Permission.PUBLISH_COURSE,
          Permission.CREATE_LESSON,
          Permission.UPDATE_LESSON,
          Permission.DELETE_LESSON,
        );
        break;

      case 'ADMIN':
        // Admin has all permissions
        Object.values(Permission).forEach(permission => {
          permissions.push(permission);
        });
        break;

      case 'STUDENT':
        permissions.push(
          Permission.CREATE_ENROLLMENT,
          Permission.READ_ENROLLMENT,
          Permission.UPDATE_ENROLLMENT,
        );
        break;
    }

    return permissions;
  }
}
