import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const prisma = new PrismaClient();

const branchesDataSchema = z.object({
    data: z.array(
        z.object({
            name: z.string(),
            address: z.string(),
            phoneNumber: z.string(),
        }),
    ),
});

export async function branchesSeed() {
    const branchesPath = path.resolve(__dirname, 'data', 'branches.json');
    const branchesRaw = fs.readFileSync(branchesPath, 'utf-8');
    const { data: branches } = branchesDataSchema.parse(
        JSON.parse(branchesRaw),
    );

    for (const branch of branches) {
        const existingBranch = await prisma.branch.findFirst({
            where: {
                name: branch.name,
                address: branch.address,
            },
        });

        if (existingBranch) {
            await prisma.branch.update({
                where: { id: existingBranch.id },
                data: { phoneNumber: branch.phoneNumber },
            });
        } else {
            await prisma.branch.create({
                data: branch,
            });
        }
    }

    console.log('✅ Branches seeding completed');
}

if (require.main === module) {
    branchesSeed()
        .catch((error: unknown) => {
            console.error(error);
            process.exit(1);
        })
        .finally(() => {
            void prisma.$disconnect();
        });
}
