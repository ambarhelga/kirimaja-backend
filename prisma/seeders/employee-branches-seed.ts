import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const prisma = new PrismaClient();

const employeeBranchesDataSchema = z.object({
    data: z.array(
        z.object({
            name: z.string(),
            email: z.string(),
            password: z.string(),
            phoneNumber: z.string(),
            roleKey: z.string(),
            branchName: z.string(),
            type: z.string(),
        }),
    ),
});

export async function employeeBranchesSeed() {
    const employeeBranchesPath = path.resolve(
        __dirname,
        'data',
        'employee-branches.json',
    );
    const employeeBranchesRaw = fs.readFileSync(employeeBranchesPath, 'utf-8');
    const { data: employeeBranches } = employeeBranchesDataSchema.parse(
        JSON.parse(employeeBranchesRaw),
    );

    for (const employeeBranch of employeeBranches) {
        const role = await prisma.role.findFirst({
            where: { key: employeeBranch.roleKey },
        });

        if (!role) {
            console.warn(
                `Role with key "${employeeBranch.roleKey}" not found. Skipping employee branch "${employeeBranch.name}".`,
            );
            continue;
        }

        const branch = await prisma.branch.findFirst({
            where: { name: employeeBranch.branchName },
        });

        if (!branch) {
            console.warn(
                `Branch with name "${employeeBranch.branchName}" not found. Skipping employee branch "${employeeBranch.name}".`,
            );
            continue;
        }

        const password = await bcrypt.hash(employeeBranch.password, 12);
        const user = await prisma.user.upsert({
            where: { email: employeeBranch.email },
            update: {},
            create: {
                email: employeeBranch.email,
                name: employeeBranch.name,
                password,
                phoneNumber: employeeBranch.phoneNumber,
                roleId: role.id,
            },
        });

        const existingEmployeeBranch = await prisma.employeeBranch.findFirst({
            where: {
                userId: user.id,
                branchId: branch.id,
                type: employeeBranch.type,
            },
        });

        if (!existingEmployeeBranch) {
            await prisma.employeeBranch.create({
                data: {
                    userId: user.id,
                    branchId: branch.id,
                    type: employeeBranch.type,
                },
            });
        }
    }

    console.log('Employee branches seeding completed');
}

if (require.main === module) {
    employeeBranchesSeed()
        .catch((error: unknown) => {
            console.error(error);
            process.exit(1);
        })
        .finally(() => {
            void prisma.$disconnect();
        });
}
