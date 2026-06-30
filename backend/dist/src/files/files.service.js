"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const storage_blob_1 = require("@azure/storage-blob");
let FilesService = class FilesService {
    prisma;
    uploadDir = path.join(process.cwd(), 'uploads');
    containerClient = null;
    isAzure = false;
    isSupabase = false;
    supabaseUrl = '';
    supabaseKey = '';
    supabaseBucket = 'uploads';
    constructor(prisma) {
        this.prisma = prisma;
        fs.mkdirSync(path.join(this.uploadDir, 'images'), { recursive: true });
        fs.mkdirSync(path.join(this.uploadDir, 'audio'), { recursive: true });
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (connectionString) {
            try {
                const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
                this.containerClient = blobServiceClient.getContainerClient('uploads');
                this.isAzure = true;
                console.log('Azure Blob Storage initialized.');
            }
            catch (err) {
                console.error('Failed to initialize Azure Blob Storage client:', err);
            }
        }
        const sUrl = process.env.SUPABASE_URL;
        const sKey = process.env.SUPABASE_KEY;
        if (sUrl && sKey) {
            this.supabaseUrl = sUrl.replace(/\/$/, '');
            this.supabaseKey = sKey;
            this.supabaseBucket = process.env.SUPABASE_BUCKET || 'uploads';
            this.isSupabase = true;
            console.log('Supabase Storage integration enabled.');
        }
    }
    async uploadToSupabase(blobName, buffer, mimeType) {
        const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.supabaseBucket}/${blobName}`;
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.supabaseKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true',
            },
            body: buffer,
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Supabase Storage upload failed: ${response.statusText} - ${errText}`);
        }
        return `${this.supabaseUrl}/storage/v1/object/public/${this.supabaseBucket}/${blobName}`;
    }
    async deleteFromSupabase(blobName) {
        const deleteUrl = `${this.supabaseUrl}/storage/v1/object/${this.supabaseBucket}/${blobName}`;
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.supabaseKey}`,
            },
        });
        if (!response.ok) {
            console.error(`Failed to delete from Supabase storage: ${response.statusText}`);
        }
    }
    async saveImage(setupId, file, caption) {
        if (!file) {
            throw new common_1.BadRequestException('No image file provided');
        }
        const fileExt = path.extname(file.originalname).toLowerCase();
        const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
        let imageUrl = '';
        if (this.isSupabase) {
            try {
                imageUrl = await this.uploadToSupabase(`images/${uniqueFilename}`, file.buffer, file.mimetype);
            }
            catch (err) {
                console.error('Supabase upload failed, falling back to other storage options:', err);
            }
        }
        if (!imageUrl && this.isAzure && this.containerClient) {
            const blobName = `images/${uniqueFilename}`;
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.upload(file.buffer, file.size, {
                blobHTTPHeaders: { blobContentType: file.mimetype },
            });
            imageUrl = blockBlobClient.url;
        }
        if (!imageUrl) {
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
    async saveAudio(setupId, file, durationSeconds) {
        if (!file) {
            throw new common_1.BadRequestException('No audio file provided');
        }
        const fileExt = path.extname(file.originalname).toLowerCase();
        const allowedExts = ['.wav', '.mp3', '.flac', '.aac', '.m4a'];
        if (!allowedExts.includes(fileExt)) {
            throw new common_1.BadRequestException('Unsupported audio format. Use WAV, MP3, FLAC, or AAC');
        }
        const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
        let audioUrl = '';
        if (this.isSupabase) {
            try {
                audioUrl = await this.uploadToSupabase(`audio/${uniqueFilename}`, file.buffer, file.mimetype);
            }
            catch (err) {
                console.error('Supabase audio upload failed, falling back to other storage options:', err);
            }
        }
        if (!audioUrl && this.isAzure && this.containerClient) {
            const blobName = `audio/${uniqueFilename}`;
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.upload(file.buffer, file.size, {
                blobHTTPHeaders: { blobContentType: file.mimetype },
            });
            audioUrl = blockBlobClient.url;
        }
        if (!audioUrl) {
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
    async deleteImage(id) {
        const img = await this.prisma.setupImage.findUnique({ where: { id } });
        if (!img) {
            throw new common_1.BadRequestException('Image not found');
        }
        if (img.image_url.startsWith('http://') || img.image_url.startsWith('https://')) {
            if (this.isSupabase && img.image_url.includes(`/object/public/${this.supabaseBucket}/`)) {
                let blobName = '';
                if (img.image_url.includes('/images/')) {
                    blobName = `images/${img.image_url.split('/images/')[1]}`;
                }
                if (blobName) {
                    await this.deleteFromSupabase(blobName);
                }
            }
            else if (this.isAzure && this.containerClient) {
                let blobName = '';
                if (img.image_url.includes('/images/')) {
                    blobName = `images/${img.image_url.split('/images/')[1]}`;
                }
                if (blobName) {
                    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
                    await blockBlobClient.deleteIfExists();
                }
            }
        }
        else {
            const filePath = path.join(process.cwd(), img.image_url);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        }
        await this.prisma.setupImage.delete({ where: { id } });
        return { success: true };
    }
    async deleteAudio(id) {
        const audio = await this.prisma.audioFile.findUnique({ where: { id } });
        if (!audio) {
            throw new common_1.BadRequestException('Audio not found');
        }
        if (audio.file_url.startsWith('http://') || audio.file_url.startsWith('https://')) {
            if (this.isSupabase && audio.file_url.includes(`/object/public/${this.supabaseBucket}/`)) {
                let blobName = '';
                if (audio.file_url.includes('/audio/')) {
                    blobName = `audio/${audio.file_url.split('/audio/')[1]}`;
                }
                if (blobName) {
                    await this.deleteFromSupabase(blobName);
                }
            }
            else if (this.isAzure && this.containerClient) {
                let blobName = '';
                if (audio.file_url.includes('/audio/')) {
                    blobName = `audio/${audio.file_url.split('/audio/')[1]}`;
                }
                if (blobName) {
                    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
                    await blockBlobClient.deleteIfExists();
                }
            }
        }
        else {
            const filePath = path.join(process.cwd(), audio.file_url);
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        }
        await this.prisma.audioFile.delete({ where: { id } });
        return { success: true };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FilesService);
//# sourceMappingURL=files.service.js.map