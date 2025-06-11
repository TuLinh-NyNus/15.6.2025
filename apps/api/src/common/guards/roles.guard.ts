import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { Permission } from '../enums/permission.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles and permissions from metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles or permissions are required, allow access
    if ((!requiredRoles || requiredRoles.length === 0) && 
        (!requiredPermissions || requiredPermissions.length === 0)) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Check roles if required
    const hasRole = !requiredRoles || requiredRoles.length === 0 || 
                   requiredRoles.some((role) => user.role === role);

    // Check permissions if required
    const hasPermissions = !requiredPermissions || requiredPermissions.length === 0 || 
                         requiredPermissions.every((permission) => 
                           user.permissions?.includes(permission));

    return hasRole && hasPermissions;
  }
} 