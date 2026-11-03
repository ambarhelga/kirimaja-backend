import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import {
    AuthLoginResponse,
    UserResponse,
} from './response/auth-login.response';
import { AuthRegisterDto } from './dto/auth-register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async login(request: AuthLoginDto): Promise<AuthLoginResponse> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: request.email,
            },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(
            request.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET_KEY || 'secretKey',
            expiresIn: '1h',
        });

        const { password, ...userWithoutPassword } = user;
        void password;

        const transformedUser = {
            ...userWithoutPassword,
            role: {
                ...user.role,
                permissions: user.role.rolePermissions.map(
                    (rolePermission) => ({
                        id: rolePermission.permission.id,
                        key: rolePermission.permission.key,
                        name: rolePermission.permission.name,
                        resource: rolePermission.permission.resource,
                    }),
                ),
            },
        };

        const userResponse = plainToInstance(UserResponse, transformedUser, {
            excludeExtraneousValues: true,
        });

        return plainToInstance(
            AuthLoginResponse,
            {
                accessToken,
                user: userResponse,
            },
            { excludeExtraneousValues: true },
        );
    }

    async register(request: AuthRegisterDto): Promise<AuthLoginResponse> {
        const existingUser = await this.prismaService.user.findUnique({
            where: {
                email: request.email,
            },
        });

        if (existingUser) {
            throw new UnauthorizedException('Email already exists');
        }

        const role = await this.prismaService.role.findFirst({
            where: {
                key: 'customer',
            },
        });

        if (!role) {
            throw new NotFoundException('Role Customer not found');
        }

        const hashedPassword = await bcrypt.hash(request.password, 10);

        const user = await this.prismaService.user.create({
            data: {
                email: request.email,
                password: hashedPassword,
                name: request.name,
                phoneNumber: request.phone_number,
                roleId: role.id,
            },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET_KEY || 'secretKey',
            expiresIn: (process.env.JWT_EXPIRES_IN ||
                '1h') as JwtSignOptions['expiresIn'],
        });

        const { password, ...userWithoutPassword } = user;
        void password;

        const transformedUser = {
            ...userWithoutPassword,
            role: {
                ...user.role,
                permissions: user.role.rolePermissions.map(
                    (rolePermission) => ({
                        id: rolePermission.permission.id,
                        key: rolePermission.permission.key,
                        name: rolePermission.permission.name,
                        resource: rolePermission.permission.resource,
                    }),
                ),
            },
        };

        const userResponse = plainToInstance(UserResponse, transformedUser, {
            excludeExtraneousValues: true,
        });

        return plainToInstance(
            AuthLoginResponse,
            {
                accessToken,
                user: userResponse,
            },
            { excludeExtraneousValues: true },
        );
    }
}
