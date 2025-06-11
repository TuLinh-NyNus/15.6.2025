import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { LoginDto, RegisterDto, TokensDto } from '@project/dto';
import { EmailAlreadyExistsException } from '../../common/exceptions/email-exists.exception';
import { InvalidCredentialsException } from '../../common/exceptions/invalid-credentials.exception';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Permission } from '../../common/enums/permission.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}
  
  /**
   * Đăng ký người dùng mới
   * @param registerDto Thông tin đăng ký
   * @returns Thông tin người dùng đã đăng ký và token
   */
  async register(registerDto: RegisterDto): Promise<TokensDto> {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }
    
    // Kiểm tra mật khẩu
    const isPasswordValid = await this.passwordService.validatePassword(registerDto.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
    }
    
    // Hash mật khẩu
    const hashedPassword = await this.passwordService.hashPassword(registerDto.password);
    
    // Tạo user mới
    const newUser = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName || '',
      lastName: registerDto.lastName || '',
    });
    
    const permissions = this.getPermissionsByRole(newUser.role);

    // Tạo và trả về tokens
    return this.generateTokens({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      permissions,
    });
  }
  
  /**
   * Đăng nhập
   * @param loginDto Thông tin đăng nhập
   * @returns Token nếu đăng nhập thành công
   */
  async login(loginDto: LoginDto): Promise<TokensDto> {
    // Tìm user theo email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }
    
    // Kiểm tra mật khẩu
    const isPasswordValid = await this.passwordService.comparePasswords(
      loginDto.password,
      user.password,
    );
    
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }
    
    const permissions = this.getPermissionsByRole(user.role);

    // Tạo và trả về tokens
    return this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions,
    });
  }
  
  /**
   * Tạo access token và refresh token
   * @param payload The JWT payload
   * @returns Token objects
   */
  private async generateTokens(payload: JwtPayload): Promise<TokensDto> {
    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN');
    const expiresInSeconds = this.parseExpiresIn(accessExpiresIn);
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }),
    ]);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(Date.now() / 1000) + expiresInSeconds
    };
  }
  
  /**
   * Chuyển đổi chuỗi expiresIn thành số giây
   * Hỗ trợ các định dạng: 60s, 15m, 2h, 7d
   */
  private parseExpiresIn(expiresIn: string): number {
    const regex = /^(\d+)([smhd])$/;
    const matches = expiresIn?.match(regex);
    
    if (!matches) {
      return 3600; // Mặc định 1 giờ nếu không phân tích được
    }
    
    const value = parseInt(matches[1]);
    const unit = matches[2];
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }
  
  /**
   * Validate a token payload for JWT strategy
   * @param payload The JWT payload
   * @returns User object if valid, null otherwise
   */
  async validateJwtPayload(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      return null;
    }

    const permissions = this.getPermissionsByRole(user.role);
    return {
      ...user,
      permissions,
    };
  }

  /**
   * Làm mới token sử dụng refresh token
   * @param refreshToken Refresh token hiện tại
   * @returns Token mới
   */
  async refreshToken(refreshToken: string): Promise<TokensDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      // Kiểm tra user có tồn tại
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new InvalidCredentialsException('User không tồn tại');
      }

      // Tạo token mới
      return this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions: this.getPermissionsByRole(user.role),
      });
    } catch (error) {
      throw new InvalidCredentialsException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
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
