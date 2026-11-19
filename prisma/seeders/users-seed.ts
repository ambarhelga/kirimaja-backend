import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const prisma = new PrismaClient();

const usersDataSchema = z.object({
    data: z.array(
        z.object({
            name: z.string(),
            email: z.string(),
            password: z.string(),
            phoneNumber: z.string(),
            roleKey: z.string(),
            avatar: z.string().optional(),
        }),
    ),
});

export async function usersSeed() {
    const usersPath = path.resolve(__dirname, 'data', 'users.json');
    const usersRaw = fs.readFileSync(usersPath, 'utf-8');
    const { data: users } = usersDataSchema.parse(JSON.parse(usersRaw));

    for (const user of users) {
        const role = await prisma.role.findFirst({
            where: { key: user.roleKey },
        });

        if (!role) {
            console.warn(
                `⚠️  Role with key "${user.roleKey}" not found. Skipping user "${user.name}" (${user.email}).`,
            );
            continue;
        }

        const hashedPassword = await bcrypt.hash(user.password, 12);

        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                avatar: user.avatar,
                phoneNumber: user.phoneNumber,
                roleId: role.id,
            },
        });

        console.log(`✅ User for role "${user.roleKey}" seeded`);
    }
}

async function runUsersSeed() {
    try {
        await usersSeed();
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

// For running directly
if (require.main === module) {
    void runUsersSeed().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
