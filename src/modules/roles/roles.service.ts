import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponse } from '../auth/response/auth-login.response';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RolesService {
    constructor(private prismaService: PrismaService) {}

    async findAll(): Promise<RoleResponse[]> {
        const roles = await this.prismaService.role.findMany({
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        return roles.map((role) => {
            return {
                id: role.id,
                name: role.name,
                key: role.key,
                permissions: role.rolePermissions.map((rolePermission) => {
                    return {
                        id: rolePermission.permission.id,
                        name: rolePermission.permission.name,
                        key: rolePermission.permission.key,
                        resource: rolePermission.permission.resource,
                    };
                }),
            };
        });
    }

    async findOne(id: number): Promise<RoleResponse> {
        const role = await this.prismaService.role.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return {
            id: role.id,
            name: role.name,
            key: role.key,
            permissions: role.rolePermissions.map((rolePermission) => ({
                id: rolePermission.permission.id,
                name: rolePermission.permission.name,
                key: rolePermission.permission.key,
                resource: rolePermission.permission.resource,
            })),
        };
    }

    async update(
        id: number,
        updateRoleDto: UpdateRoleDto,
    ): Promise<RoleResponse> {
        await this.findOne(id); // Ensure the role exists before updating

        // Delete existing role permissions
        await this.prismaService.rolePermission.deleteMany({
            where: { roleId: id },
        });

        if (updateRoleDto.permission_ids.length > 0) {
            // Create new role permissions
            const rolePermissions = updateRoleDto.permission_ids.map(
                (permissionId) => ({
                    roleId: id,
                    permissionId,
                }),
            );

            await this.prismaService.rolePermission.createMany({
                data: rolePermissions,
                skipDuplicates: true, // Skip duplicates to avoid unique constraint errors
            });
        }

        return await this.findOne(id); // Return the updated role
    }
}
