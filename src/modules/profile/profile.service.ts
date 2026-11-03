import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProfileResponse } from './response/profile.response';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfileService {
    constructor(private prismaService: PrismaService) {}

    async findOne(id: number): Promise<ProfileResponse> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                phoneNumber: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return plainToInstance(ProfileResponse, user, {
            excludeExtraneousValues: true,
        });
    }

    async update(
        id: number,
        updateProfileDto: UpdateProfileDto,
        avatarFileName?: string | null,
    ): Promise<ProfileResponse> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                phoneNumber: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        const updateData: Prisma.UserUpdateInput = {};
        if (updateProfileDto.name !== undefined) {
            updateData.name = updateProfileDto.name;
        }

        if (updateProfileDto.email !== undefined) {
            updateData.email = updateProfileDto.email;
        }

        if (updateProfileDto.phone_number !== undefined) {
            updateData.phoneNumber = updateProfileDto.phone_number;
        }

        if (avatarFileName) {
            updateData.avatar = `/uploads/photos/${avatarFileName}`;
        }

        if (updateProfileDto.password) {
            const hashedPassword = await bcrypt.hash(
                updateProfileDto.password,
                12,
            );
            updateData.password = hashedPassword;
        }

        const updatedUser = await this.prismaService.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                phoneNumber: true,
            },
        });

        return plainToInstance(ProfileResponse, updatedUser, {
            excludeExtraneousValues: true,
        });
    }
}
