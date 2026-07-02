import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly prisma: PrismaService,
  ) {}

  private async verifySetupOwner(setupId: string, userId: string) {
    const setup = await this.prisma.setup.findUnique({
      where: { id: setupId },
      include: { keyboard: true },
    });
    if (!setup) {
      throw new NotFoundException('Setup not found');
    }
    if (setup.keyboard.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
  }

  @Post('image/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @GetUser() user: any,
    @Body('setup_id') setupId: string,
    @Body('caption') caption: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.verifySetupOwner(setupId, user.id);
    return this.filesService.saveImage(setupId, file, caption);
  }

  @Post('audio/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @GetUser() user: any,
    @Body('setup_id') setupId: string,
    @Body('duration') duration: string,
    @Body('acoustic_profile') acousticProfile: string,
    @Body('dominant_freq') dominantFreq: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.verifySetupOwner(setupId, user.id);
    const durationNum = duration ? parseFloat(duration) : undefined;
    
    // Validate acoustic profile to prevent injection or invalid data
    const validProfiles = ['THOCKY', 'CREAMY', 'CLACKY', 'UNKNOWN'];
    if (acousticProfile && !validProfiles.includes(acousticProfile)) {
      throw new BadRequestException('Invalid acoustic profile tag');
    }
    
    const freqNum = dominantFreq ? parseFloat(dominantFreq) : undefined;
    // Validate frequency range (e.g. human hearing range 0-20000Hz)
    if (freqNum !== undefined && (isNaN(freqNum) || freqNum < 0 || freqNum > 20000)) {
      throw new BadRequestException('Invalid dominant frequency value');
    }

    return this.filesService.saveAudio(setupId, file, durationNum, acousticProfile, freqNum);
  }

  @Delete('image/:id')
  async deleteImage(@GetUser() user: any, @Param('id') id: string) {
    const img = await this.prisma.setupImage.findUnique({
      where: { id },
      include: { setup: { include: { keyboard: true } } },
    });
    if (!img) {
      throw new NotFoundException('Image not found');
    }
    if (img.setup.keyboard.user_id !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.filesService.deleteImage(id);
  }

  @Delete('audio/:id')
  async deleteAudio(@GetUser() user: any, @Param('id') id: string) {
    const audio = await this.prisma.audioFile.findUnique({
      where: { id },
      include: { setup: { include: { keyboard: true } } },
    });
    if (!audio) {
      throw new NotFoundException('Audio file not found');
    }
    if (audio.setup.keyboard.user_id !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.filesService.deleteAudio(id);
  }
}
