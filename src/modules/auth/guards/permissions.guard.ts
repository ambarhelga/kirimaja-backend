import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionsService } from '../../permissions/permissions.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

type PermissionRequirement =
    | string[]
    | { type: 'any' | 'all'; permissions: string[] };

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly permissionsService: PermissionsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<
            PermissionRequirement | undefined
        >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

        if (!requiredPermissions) {
            return true;
        }

        const request = context
            .switchToHttp()
            .getRequest<{ user?: { id: number } }>();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        if (
            typeof requiredPermissions === 'object' &&
            requiredPermissions !== null &&
            'type' in requiredPermissions
        ) {
            const { type, permissions } = requiredPermissions;
            const hasPermission =
                type === 'any'
                    ? await this.permissionsService.userHasAnyPermission(
                          user.id,
                          permissions,
                      )
                    : await this.permissionsService.userHasAllPermissions(
                          user.id,
                          permissions,
                      );

            if (!hasPermission) {
                throw new ForbiddenException(
                    `User does not have the required permissions: ${permissions.join(', ')}`,
                );
            }

            return true;
        }

        const permissions = Array.isArray(requiredPermissions)
            ? requiredPermissions
            : [requiredPermissions];
        const hasPermission =
            await this.permissionsService.userHasAllPermissions(
                user.id,
                permissions,
            );

        if (!hasPermission) {
            throw new ForbiddenException(
                `User does not have the required permissions: ${permissions.join(', ')}`,
            );
        }

        return true;
    }
}
