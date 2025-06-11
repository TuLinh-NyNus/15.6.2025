import { Permission } from '../../../common/enums/permission.enum';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
  role: string;
  permissions?: Permission[];
}
