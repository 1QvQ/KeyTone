import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    // Ensure upload directories exist
    fs.mkdirSync(path.join(this.uploadDir, 'images'), { recursive: true });
    fs.mkdirSync(path.join(this.uploadDir, 'audio'), { recursive: true });
  }

  async saveImage(setupId: string, file: Express.Multer.File, caption?: string) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const fileExt = path.extname(file.originalname);
    const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
    const destinationPath = path.join(this.uploadDir, 'images', uniqueFilename);

    fs.writeFileSync(destinationPath, file.buffer);

    const relativeUrl = `/uploads/images/${uniqueFilename}`;

    return this.prisma.setupImage.create({
      data: {
        setup_id: setupId,
        image_url: relativeUrl,
        caption: caption ?? '',
      },
    });
  }

  async saveAudio(setupId: string, file: Express.Multer.File, durationSeconds?: number) {
    if (!file) {
      throw new BadRequestException('No audio file provided');
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.wav', '.mp3', '.flac', '.aac', '.m4a'];
    if (!allowedExts.includes(fileExt)) {
      throw new BadRequestException('Unsupported audio format. Use WAV, MP3, FLAC, or AAC');
    }

    const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
    const destinationPath = path.join(this.uploadDir, 'audio', uniqueFilename);

    fs.writeFileSync(destinationPath, file.buffer);

    const relativeUrl = `/uploads/audio/${uniqueFilename}`;

    return this.prisma.audioFile.create({
      data: {
        setup_id: setupId,
        file_url: relativeUrl,
        duration: durationSeconds ? Math.round(durationSeconds) : null,
        format: fileExt.replace('.', '').toUpperCase(),
        size: file.size,
      },
    });
  }

  async deleteImage(id: string) {
    const img = await this.prisma.setupImage.findUnique({ where: { id } });
    if (!img) {
      throw new BadRequestException('Image not found');
    }

    const filePath = path.join(process.cwd(), img.image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.setupImage.delete({ where: { id } });
    return { success: true };
  }

  async deleteAudio(id: string) {
    const audio = await this.prisma.audioFile.findUnique({ where: { id } });
    if (!audio) {
      throw new BadRequestException('Audio not found');
    }

    const filePath = path.join(process.cwd(), audio.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.audioFile.delete({ where: { id } });
    return { success: true };
  }
}
