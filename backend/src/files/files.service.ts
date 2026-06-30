import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import * as path from 'path';

interface FileSignature {
  offset: number;
  bytes: number[];
  extensions: string[];
}

const IMAGE_SIGNATURES: FileSignature[] = [
  { offset: 0, bytes: [0xFF, 0xD8, 0xFF], extensions: ['jpg', 'jpeg'] },
  { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47], extensions: ['png'] },
  { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38], extensions: ['gif'] },
  { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50], extensions: ['webp'] },
];

const AUDIO_SIGNATURES: FileSignature[] = [
  { offset: 8, bytes: [0x57, 0x41, 0x56, 0x45], extensions: ['wav'] },
  { offset: 0, bytes: [0x49, 0x44, 0x33], extensions: ['mp3'] },
  { offset: 0, bytes: [0xFF, 0xFB], extensions: ['mp3'] },
  { offset: 0, bytes: [0xFF, 0xF3], extensions: ['mp3'] },
  { offset: 0, bytes: [0xFF, 0xF2], extensions: ['mp3'] },
  { offset: 0, bytes: [0x66, 0x4C, 0x61, 0x43], extensions: ['flac'] },
  { offset: 4, bytes: [0x66, 0x74, 0x79, 0x70], extensions: ['m4a', 'aac'] },
];

const ALLOWED_AUDIO_EXTS = new Set(['.wav', '.mp3', '.flac', '.aac', '.m4a']);
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const ALLOWED_AUDIO_MIMES = new Set(['audio/wav', 'audio/mpeg', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/aac']);

function validateMagicBytes(buffer: Buffer, signatures: FileSignature[]): boolean {
  return signatures.some((sig) => {
    if (buffer.length < sig.offset + sig.bytes.length) return false;
    return sig.bytes.every((byte, i) => buffer[sig.offset + i] === byte);
  });
}

@Injectable()
export class FilesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {}

  private async ensureDirs(): Promise<void> {
    await fs.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
    await fs.mkdir(path.join(this.uploadDir, 'audio'), { recursive: true });
  }

  async saveImage(setupId: string, file: Express.Multer.File, caption?: string) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const mimeOk = file.mimetype && ALLOWED_IMAGE_MIMES.has(file.mimetype);
    const magicOk = validateMagicBytes(file.buffer, IMAGE_SIGNATURES);

    if (!mimeOk || !magicOk) {
      throw new BadRequestException('Invalid image file. Supported formats: JPEG, PNG, GIF, WebP');
    }

    const fileExt = path.extname(file.originalname);
    const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
    const destinationPath = path.join(this.uploadDir, 'images', uniqueFilename);

    await this.ensureDirs();
    await fs.writeFile(destinationPath, file.buffer);

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
    if (!ALLOWED_AUDIO_EXTS.has(fileExt)) {
      throw new BadRequestException('Unsupported audio format. Use WAV, MP3, FLAC, or AAC');
    }

    const mimeOk = file.mimetype && ALLOWED_AUDIO_MIMES.has(file.mimetype);
    const magicOk = validateMagicBytes(file.buffer, AUDIO_SIGNATURES);

    if (!mimeOk || !magicOk) {
      throw new BadRequestException('Invalid audio file. The file content does not match the declared format');
    }

    const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
    const destinationPath = path.join(this.uploadDir, 'audio', uniqueFilename);

    await this.ensureDirs();
    await fs.writeFile(destinationPath, file.buffer);

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
    await fs.unlink(filePath).catch(() => {});

    await this.prisma.setupImage.delete({ where: { id } });
    return { success: true };
  }

  async deleteAudio(id: string) {
    const audio = await this.prisma.audioFile.findUnique({ where: { id } });
    if (!audio) {
      throw new BadRequestException('Audio not found');
    }

    const filePath = path.join(process.cwd(), audio.file_url);
    await fs.unlink(filePath).catch(() => {});

    await this.prisma.audioFile.delete({ where: { id } });
    return { success: true };
  }
}
