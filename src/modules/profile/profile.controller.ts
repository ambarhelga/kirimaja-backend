import {
    Controller,
    Get,
    Body,
    Patch,
    UseGuards,
    Req,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { ProfileResponse } from './response/profile.response';
import { BaseResponse } from '../../common/interface/base-response.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get()
    async findOne(
        @Req() req: { user: { id: number } },
    ): Promise<BaseResponse<ProfileResponse>> {
        return {
            statusCode: 200,
            message: 'Profile retrieved successfully',
            data: await this.profileService.findOne(req.user.id),
        };
    }

    @Patch()
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './public/uploads/photos',
                filename: (_req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + '-' + extname(file.originalname));
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                    return cb(
                        new Error('Only image files are allowed!'),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async update(
        @Req() req: { user: { id: number } },
        @Body() updateProfileDto: UpdateProfileDto,
        @UploadedFile() avatarFile?: Express.Multer.File,
    ): Promise<BaseResponse<ProfileResponse>> {
        return {
            statusCode: 200,
            message: 'Profile updated successfully',
            data: await this.profileService.update(
                req.user.id,
                updateProfileDto,
                avatarFile?.filename ?? null,
            ),
        };
    }
}
