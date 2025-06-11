import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@project/entities';
import { OWNERSHIP_KEY } from '../decorators/ownership.decorator';
import { CoursesService } from '../../courses/courses.service';

@Injectable()
export class CourseOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private coursesService: CoursesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireOwnership = this.reflector.getAllAndOverride<boolean>(OWNERSHIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requireOwnership) {
      return true; // No ownership check required, access granted
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      return false; // No user in request, access denied
    }

    // ADMIN role always has access regardless of ownership
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    
    // Extract course ID from request params
    const courseId = request.params.id;
    if (!courseId) {
      return false; // No course ID found, access denied
    }

    // Check if the user is the owner of the course
    return this.coursesService.isOwner(courseId, user.id);
  }
} 