import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Branch } from '@prisma/client';

@Injectable()
export class BranchesService {
    constructor(private readonly prismaService: PrismaService) {}
    async create(createBranchDto: CreateBranchDto): Promise<Branch> {
        void createBranchDto;
        const branch = await this.prismaService.branch.create({
            data: {
                name: createBranchDto.name,
                address: createBranchDto.address,
                phoneNumber: createBranchDto.phone_number,
            },
        });
        return branch;
    }

    async findAll(): Promise<Branch[]> {
        const branches = await this.prismaService.branch.findMany();
        return branches;
    }

    async findOne(id: number): Promise<Branch | null> {
        const branch = await this.prismaService.branch.findUnique({
            where: { id },
        });
        if (!branch) {
            throw new NotFoundException(`Branch with id ${id} not found`);
        }
        return branch;
    }

    async update(
        id: number,
        updateBranchDto: UpdateBranchDto,
    ): Promise<Branch> {
        await this.findOne(id);
        return this.prismaService.branch.update({
            where: { id },
            data: {
                name: updateBranchDto.name,
                address: updateBranchDto.address,
                phoneNumber: updateBranchDto.phone_number,
            },
        });
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        await this.prismaService.branch.delete({
            where: { id },
        });
    }
}
