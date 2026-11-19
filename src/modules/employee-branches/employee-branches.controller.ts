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
import { EmployeeBranchesService } from './employee-branches.service';
import { CreateEmployeeBranchDto } from './dto/create-employee-branch.dto';
import { UpdateEmployeeBranchDto } from './dto/update-employee-branch.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { BaseResponse } from '../../common/interface/base-response.interface';
import { EmployeeBranch } from '@prisma/client';
import { RequiredPermissions } from '../auth/decorators/permissions.decorator';

@Controller('employee-branches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeeBranchesController {
    constructor(
        private readonly employeeBranchesService: EmployeeBranchesService,
    ) {}

    @Post()
    @RequiredPermissions('employee.create')
    async create(
        @Body() createEmployeeBranchDto: CreateEmployeeBranchDto,
    ): Promise<BaseResponse<EmployeeBranch>> {
        return {
            statusCode: 201,
            message: 'Employee branch created successfully',
            data: await this.employeeBranchesService.create(
                createEmployeeBranchDto,
            ),
        };
    }

    @Get()
    @RequiredPermissions('employee.read')
    async findAll() {
        return {
            statusCode: 200,
            message: 'Employee branches retrieved successfully',
            data: await this.employeeBranchesService.findAll(),
        };
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ): Promise<BaseResponse<EmployeeBranch>> {
        return {
            statusCode: 200,
            message: 'Employee branch retrieved successfully',
            data: await this.employeeBranchesService.findOne(+id),
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateEmployeeBranchDto: UpdateEmployeeBranchDto,
    ): Promise<BaseResponse<EmployeeBranch>> {
        return {
            statusCode: 200,
            message: 'Employee branch updated successfully',
            data: await this.employeeBranchesService.update(
                +id,
                updateEmployeeBranchDto,
            ),
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<BaseResponse<null>> {
        await this.employeeBranchesService.remove(+id);
        return {
            statusCode: 200,
            data: null,
            message: 'Employee branch deleted successfully',
        };
    }
}
