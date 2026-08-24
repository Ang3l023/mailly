import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ERole } from '../enums/users/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ERole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<Request>();

    if (!user) {
      return false;
    }

    const { role } = await this.userService.findOne(user.id);

    return requiredRoles.some((rl) => rl === role);
  }
}
