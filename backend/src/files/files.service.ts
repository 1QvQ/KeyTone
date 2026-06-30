import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable()
export class FilesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private containerClient: ContainerClient | null = null;
  private isAzure = false;

  constructor(private prisma: PrismaService) {
    // Ensure upload directories exist locally
    fs.mkdirSync(path.join(this.uploadDir, 'images'), { recursive: true });
    fs.mkdirSync(path.join(this.uploadDir, 'audio'), { recursive: true });

    // Initialize Azure Storage client if connection string is configured
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (connectionString) {
      try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        this.containerClient = blobServiceClient.getContainerClient('uploads');
        this.isAzure = true;
        console.log('Azure Blob Storage initialized successfully.');
      } catch (err) {
        console.error('Failed to initialize Azure Blob Storage client:', err);
      }
    }
  }

  async saveImage(setupId: string, file: Express.Multer.File, caption?: string) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
    let imageUrl = '';

    if (this.isAzure && this.containerClient) {
      const blobName = `images/${uniqueFilename}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });
      imageUrl = blockBlobClient.url;
    } else {
      // Local async storage fallback
      const destinationPath = path.join(this.uploadDir, 'images', uniqueFilename);
      await fs.promises.writeFile(destinationPath, file.buffer);
      imageUrl = `/uploads/images/${uniqueFilename}`;
    }

    return this.prisma.setupImage.create({
      data: {
        setup_id: setupId,
        image_url: imageUrl,
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
    let audioUrl = '';

    if (this.isAzure && this.containerClient) {
      const blobName = `audio/${uniqueFilename}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });
      audioUrl = blockBlobClient.url;
    } else {
      // Local async storage fallback
      const destinationPath = path.join(this.uploadDir, 'audio', uniqueFilename);
      await fs.promises.writeFile(destinationPath, file.buffer);
      audioUrl = `/uploads/audio/${uniqueFilename}`;
    }

    return this.prisma.audioFile.create({
      data: {
        setup_id: setupId,
        file_url: audioUrl,
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

    if (img.image_url.startsWith('http://') || img.image_url.startsWith('https://')) {
      // Azure blob deletion
      if (this.isAzure && this.containerClient) {
        let blobName = '';
        if (img.image_url.includes('/images/')) {
          blobName = `images/${img.image_url.split('/images/')[1]}`;
        }
        if (blobName) {
          const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
          await blockBlobClient.deleteIfExists();
        }
      }
    } else {
      // Local async file deletion
      const filePath = path.join(process.cwd(), img.image_url);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    await this.prisma.setupImage.delete({ where: { id } });
    return { success: true };
  }

  async deleteAudio(id: string) {
    const audio = await this.prisma.audioFile.findUnique({ where: { id } });
    if (!audio) {
      throw new BadRequestException('Audio not found');
    }

    if (audio.file_url.startsWith('http://') || audio.file_url.startsWith('https://')) {
      // Azure blob deletion
      if (this.isAzure && this.containerClient) {
        let blobName = '';
        if (audio.file_url.includes('/audio/')) {
          blobName = `audio/${audio.file_url.split('/audio/')[1]}`;
        }
        if (blobName) {
          const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
          await blockBlobClient.deleteIfExists();
        }
      }
    } else {
      // Local async file deletion
      const filePath = path.join(process.cwd(), audio.file_url);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }

    await this.prisma.audioFile.delete({ where: { id } });
    return { success: true };
  }
}
