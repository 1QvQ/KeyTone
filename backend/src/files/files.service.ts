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
  private isSupabase = false;
  private supabaseUrl = '';
  private supabaseKey = '';
  private supabaseBucket = 'uploads';

  constructor(private prisma: PrismaService) {
    // Ensure upload directories exist locally
    fs.mkdirSync(path.join(this.uploadDir, 'images'), { recursive: true });
    fs.mkdirSync(path.join(this.uploadDir, 'audio'), { recursive: true });

    // 1. Initialize Azure Storage client if configured
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (connectionString) {
      try {
        const blobServiceClient =
          BlobServiceClient.fromConnectionString(connectionString);
        this.containerClient = blobServiceClient.getContainerClient('uploads');
        this.isAzure = true;
        console.log('Azure Blob Storage initialized.');
      } catch (err) {
        console.error('Failed to initialize Azure Blob Storage client:', err);
      }
    }

    // 2. Initialize Supabase Storage if configured
    const sUrl = process.env.SUPABASE_URL;
    const sKey = process.env.SUPABASE_KEY;
    if (sUrl && sKey) {
      this.supabaseUrl = sUrl.replace(/\/$/, ''); // Remove trailing slash
      this.supabaseKey = sKey;
      this.supabaseBucket = process.env.SUPABASE_BUCKET || 'uploads';
      this.isSupabase = true;
      console.log('Supabase Storage integration enabled.');
    }
  }

  private async uploadToSupabase(
    blobName: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.supabaseBucket}/${blobName}`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.supabaseKey}`,
        'Content-Type': mimeType,
        'x-upsert': 'true',
      },
      body: buffer as any,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Supabase Storage upload failed: ${response.statusText} - ${errText}`,
      );
    }

    // Return the public URL for the uploaded object
    return `${this.supabaseUrl}/storage/v1/object/public/${this.supabaseBucket}/${blobName}`;
  }

  private async deleteFromSupabase(blobName: string): Promise<void> {
    const deleteUrl = `${this.supabaseUrl}/storage/v1/object/${this.supabaseBucket}/${blobName}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.supabaseKey}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to delete from Supabase storage: ${response.statusText}`,
      );
    }
  }

  async saveImage(
    setupId: string,
    file: Express.Multer.File,
    caption?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
    let imageUrl = '';

    // Prioritize Supabase Storage
    if (this.isSupabase) {
      try {
        imageUrl = await this.uploadToSupabase(
          `images/${uniqueFilename}`,
          file.buffer,
          file.mimetype,
        );
      } catch (err) {
        console.error(
          'Supabase upload failed, falling back to other storage options:',
          err,
        );
      }
    }

    // Fallback to Azure Blob Storage
    if (!imageUrl && this.isAzure && this.containerClient) {
      const blobName = `images/${uniqueFilename}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });
      imageUrl = blockBlobClient.url;
    }

    // Fallback to local async storage
    if (!imageUrl) {
      const destinationPath = path.join(
        this.uploadDir,
        'images',
        uniqueFilename,
      );
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

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No avatar file provided');
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${userId}-${Date.now()}${fileExt}`;
    let avatarUrl = '';

    // Prioritize Supabase Storage
    if (this.isSupabase) {
      try {
        avatarUrl = await this.uploadToSupabase(
          `avatars/${uniqueFilename}`,
          file.buffer,
          file.mimetype,
        );
      } catch (err) {
        console.error('Supabase upload failed, falling back:', err);
      }
    }

    // Fallback to Azure Blob Storage
    if (!avatarUrl && this.isAzure && this.containerClient) {
      const blobName = `avatars/${uniqueFilename}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });
      avatarUrl = blockBlobClient.url;
    }

    // Fallback to local async storage
    if (!avatarUrl) {
      const dirPath = path.join(this.uploadDir, 'avatars');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const destinationPath = path.join(dirPath, uniqueFilename);
      await fs.promises.writeFile(destinationPath, file.buffer);
      avatarUrl = `/uploads/avatars/${uniqueFilename}`;
    }

    // Update user's avatar in db
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar_url: avatarUrl },
    });

    return avatarUrl;
  }

  async saveAudio(
    setupId: string,
    file: Express.Multer.File,
    durationSeconds?: number,
    acousticProfile?: string,
    dominantFreq?: number,
  ) {
    if (!file) {
      throw new BadRequestException('No audio file provided');
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.wav', '.mp3', '.flac', '.aac', '.m4a'];
    if (!allowedExts.includes(fileExt)) {
      throw new BadRequestException(
        'Unsupported audio format. Use WAV, MP3, FLAC, or AAC',
      );
    }

    const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
    let audioUrl = '';

    // Prioritize Supabase Storage
    if (this.isSupabase) {
      try {
        audioUrl = await this.uploadToSupabase(
          `audio/${uniqueFilename}`,
          file.buffer,
          file.mimetype,
        );
      } catch (err) {
        console.error(
          'Supabase audio upload failed, falling back to other storage options:',
          err,
        );
      }
    }

    // Fallback to Azure Blob Storage
    if (!audioUrl && this.isAzure && this.containerClient) {
      const blobName = `audio/${uniqueFilename}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });
      audioUrl = blockBlobClient.url;
    }

    // Fallback to local async storage
    if (!audioUrl) {
      const destinationPath = path.join(
        this.uploadDir,
        'audio',
        uniqueFilename,
      );
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
        acoustic_profile: acousticProfile || null,
        dominant_freq: dominantFreq || null,
      },
    });
  }

  async deleteImage(id: string) {
    const img = await this.prisma.setupImage.findUnique({ where: { id } });
    if (!img) {
      throw new BadRequestException('Image not found');
    }

    if (
      img.image_url.startsWith('http://') ||
      img.image_url.startsWith('https://')
    ) {
      if (
        this.isSupabase &&
        img.image_url.includes(`/object/public/${this.supabaseBucket}/`)
      ) {
        let blobName = '';
        if (img.image_url.includes('/images/')) {
          blobName = `images/${img.image_url.split('/images/')[1]}`;
        }
        if (blobName) {
          await this.deleteFromSupabase(blobName);
        }
      } else if (this.isAzure && this.containerClient) {
        let blobName = '';
        if (img.image_url.includes('/images/')) {
          blobName = `images/${img.image_url.split('/images/')[1]}`;
        }
        if (blobName) {
          const blockBlobClient =
            this.containerClient.getBlockBlobClient(blobName);
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

    if (
      audio.file_url.startsWith('http://') ||
      audio.file_url.startsWith('https://')
    ) {
      if (
        this.isSupabase &&
        audio.file_url.includes(`/object/public/${this.supabaseBucket}/`)
      ) {
        let blobName = '';
        if (audio.file_url.includes('/audio/')) {
          blobName = `audio/${audio.file_url.split('/audio/')[1]}`;
        }
        if (blobName) {
          await this.deleteFromSupabase(blobName);
        }
      } else if (this.isAzure && this.containerClient) {
        let blobName = '';
        if (audio.file_url.includes('/audio/')) {
          blobName = `audio/${audio.file_url.split('/audio/')[1]}`;
        }
        if (blobName) {
          const blockBlobClient =
            this.containerClient.getBlockBlobClient(blobName);
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
