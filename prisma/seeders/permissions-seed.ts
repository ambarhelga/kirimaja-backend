import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

type PermissionSeedRecord = {
    key: string;
    name: string;
    resource: string;
};

type RolePermissionSeed = Record<string, string[]>;

type PermissionSeedPayload = {
    data: PermissionSeedRecord[];
};

export async function permissionsSeed() {
    const permissionsPath = path.resolve(__dirname, 'data', 'permissions.json');
    const permissionsRaw = fs.readFileSync(permissionsPath, 'utf-8');
    const parsedPermissions = JSON.parse(
        permissionsRaw,
    ) as PermissionSeedPayload;
    const permissions = parsedPermissions.data;

    const existingPermissions = await prisma.permission.findMany({
        where: {
            key: {
                in: permissions.map((permission) => permission.key),
            },
        },
    });

    const existingPermissionKeys = existingPermissions.map(
        (permission) => permission.key,
    );
    const newPermissions = permissions.filter(
        (permission) => !existingPermissionKeys.includes(permission.key),
    );

    if (newPermissions.length > 0) {
        await prisma.permission.createMany({
            data: newPermissions,
            skipDuplicates: true,
        });
        console.log(`✅ ${newPermissions.length} new permissions seeded`);
    } else {
        console.log('⚠️  All permissions already exist. Skipping.');
    }

    const rolePermissionsPath = path.resolve(
        __dirname,
        'data',
        'role-permissions.json',
    );
    const rolePermissionsRaw = fs.readFileSync(rolePermissionsPath, 'utf-8');
    const rolePermissions = JSON.parse(
        rolePermissionsRaw,
    ) as RolePermissionSeed;

    const roles = await prisma.role.findMany();
    const allPermissions = await prisma.permission.findMany();

    for (const [roleKey, permissionKeys] of Object.entries(rolePermissions)) {
        const role = roles.find((record) => record.key === roleKey);
        if (!role) {
            console.log(`⚠️  Role ${roleKey} not found. Skipping.`);
            continue;
        }

        const rolePermissionRecords = allPermissions.filter((permission) =>
            permissionKeys.includes(permission.key),
        );

        const existingMappings = await prisma.rolePermission.findMany({
            where: { roleId: role.id },
        });

        const existingPermissionIds = existingMappings.map(
            (mapping) => mapping.permissionId,
        );

        const newMappings = rolePermissionRecords
            .filter(
                (permission) => !existingPermissionIds.includes(permission.id),
            )
            .map((permission) => ({
                roleId: role.id,
                permissionId: permission.id,
            }));

        if (newMappings.length > 0) {
            await prisma.rolePermission.createMany({
                data: newMappings,
                skipDuplicates: true,
            });
            console.log(
                `✅ ${newMappings.length} permissions assigned to role ${role.name}`,
            );
        } else {
            console.log(
                `⚠️  All permissions already assigned to role ${role.name}. Skipping.`,
            );
        }
    }

    console.log('✅ Role-permissions seeded');
}

if (require.main === module) {
    permissionsSeed()
        .catch((error: unknown) => {
            console.error(error);
            process.exit(1);
        })
        .finally(() => {
            void prisma.$disconnect();
        });
}
