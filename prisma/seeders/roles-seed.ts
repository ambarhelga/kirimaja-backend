import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

type RoleSeedRecord = {
    key: string;
    name: string;
};

type RoleSeedPayload = {
    data: RoleSeedRecord[];
};

export async function rolesSeed() {
    const rolesPath = path.resolve(__dirname, 'data', 'roles.json');
    const rolesRaw = fs.readFileSync(rolesPath, 'utf-8');
    const parsed: RoleSeedPayload = JSON.parse(rolesRaw) as RoleSeedPayload;
    const roles = parsed.data;

    const existingRoles = await prisma.role.findMany({
        where: {
            key: {
                in: roles.map((role) => role.key),
            },
        },
    });
    const existingRoleKeys = existingRoles.map((role) => role.key);
    const newRoles = roles.filter(
        (role) => !existingRoleKeys.includes(role.key),
    );

    if (newRoles.length === 0) {
        console.log('⚠️  All roles already exist. Skipping.');
        return;
    }

    await prisma.role.createMany({
        data: newRoles,
        skipDuplicates: true,
    });

    console.log(`✅ ${newRoles.length} new roles seeded`);
}

if (require.main === module) {
    rolesSeed()
        .catch((error: unknown) => {
            console.error(error);
            process.exit(1);
        })
        .finally(() => {
            void prisma.$disconnect();
        });
}
