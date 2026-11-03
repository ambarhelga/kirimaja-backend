import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { RoleResponse } from '../auth/response/auth-login.response';
import { BaseResponse } from '../../common/interface/base-response.interface';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get()
    async findAll(): Promise<BaseResponse<RoleResponse[]>> {
        return {
            statusCode: 200,
            message: 'Roles retrieved successfully',
            data: await this.rolesService.findAll(),
        };
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ): Promise<BaseResponse<RoleResponse>> {
        return {
            statusCode: 200,
            message: 'Role retrieved successfully',
            data: await this.rolesService.findOne(+id),
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ): Promise<BaseResponse<RoleResponse>> {
        return {
            statusCode: 200,
            message: 'Role updated successfully',
            data: await this.rolesService.update(+id, updateRoleDto),
        };
    }
}
