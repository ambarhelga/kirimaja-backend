import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { RequiredPermissions } from '../auth/decorators/permissions.decorator';
import { BaseResponse } from '../../common/interface/base-response.interface';
import { Branch } from '@prisma/client';

@Controller('branches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) {}

    @Post()
    @RequiredPermissions('branches.create')
    async create(
        @Body() createBranchDto: CreateBranchDto,
    ): Promise<BaseResponse<Branch>> {
        return {
            statusCode: 201,
            message: 'Branch created successfully',
            data: await this.branchesService.create(createBranchDto),
        };
    }

    @Get()
    @RequiredPermissions('branches.read')
    async findAll(): Promise<BaseResponse<Branch[]>> {
        return {
            statusCode: 200,
            message: 'Branches retrieved successfully',
            data: await this.branchesService.findAll(),
        };
    }

    @Get(':id')
    @RequiredPermissions('branches.read')
    async findOne(@Param('id') id: string): Promise<BaseResponse<Branch>> {
        return {
            statusCode: 200,
            message: 'Branch retrieved successfully',
            data: await this.branchesService.findOne(+id),
        };
    }

    @Patch(':id')
    @RequiredPermissions('branches.update')
    async update(
        @Param('id') id: string,
        @Body() updateBranchDto: UpdateBranchDto,
    ): Promise<BaseResponse<Branch>> {
        return {
            statusCode: 200,
            message: 'Branch updated successfully',
            data: await this.branchesService.update(+id, updateBranchDto),
        };
    }

    @Delete(':id')
    @RequiredPermissions('branches.delete')
    async remove(@Param('id') id: string): Promise<BaseResponse<Branch>> {
        await this.branchesService.remove(+id);
        return {
            statusCode: 200,
            message: 'Branch deleted successfully',
            data: null,
        };
    }
}
