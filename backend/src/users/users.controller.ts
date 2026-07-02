import { Controller, Patch, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { FilesService } from '../files/files.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

  @Patch('profile')
  async updateProfile(
    @GetUser() user: any,
    @Body() body: { full_name?: string; bio?: string; interests?: string[]; preferred_sound?: string }
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Patch('password')
  async changePassword(
    @GetUser() user: any,
    @Body() body: { old_password?: string; new_password?: string }
  ) {
    return this.usersService.changePassword(user.id, body.old_password, body.new_password);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const avatar_url = await this.filesService.uploadAvatar(user.id, file);
    return { avatar_url };
  }
}
