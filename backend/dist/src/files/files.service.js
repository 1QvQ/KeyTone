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
const fs_1 = require("fs");
const path = __importStar(require("path"));
const IMAGE_SIGNATURES = [
    { offset: 0, bytes: [0xFF, 0xD8, 0xFF], extensions: ['jpg', 'jpeg'] },
    { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47], extensions: ['png'] },
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38], extensions: ['gif'] },
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50], extensions: ['webp'] },
];
const AUDIO_SIGNATURES = [
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
function validateMagicBytes(buffer, signatures) {
    return signatures.some((sig) => {
        if (buffer.length < sig.offset + sig.bytes.length)
            return false;
        return sig.bytes.every((byte, i) => buffer[sig.offset + i] === byte);
    });
}
let FilesService = class FilesService {
    prisma;
    uploadDir = path.join(process.cwd(), 'uploads');
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureDirs() {
        await fs_1.promises.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
        await fs_1.promises.mkdir(path.join(this.uploadDir, 'audio'), { recursive: true });
    }
    async saveImage(setupId, file, caption) {
        if (!file) {
            throw new common_1.BadRequestException('No image file provided');
        }
        const mimeOk = file.mimetype && ALLOWED_IMAGE_MIMES.has(file.mimetype);
        const magicOk = validateMagicBytes(file.buffer, IMAGE_SIGNATURES);
        if (!mimeOk || !magicOk) {
            throw new common_1.BadRequestException('Invalid image file. Supported formats: JPEG, PNG, GIF, WebP');
        }
        const fileExt = path.extname(file.originalname);
        const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
        const destinationPath = path.join(this.uploadDir, 'images', uniqueFilename);
        await this.ensureDirs();
        await fs_1.promises.writeFile(destinationPath, file.buffer);
        const relativeUrl = `/uploads/images/${uniqueFilename}`;
        return this.prisma.setupImage.create({
            data: {
                setup_id: setupId,
                image_url: relativeUrl,
                caption: caption ?? '',
            },
        });
    }
    async saveAudio(setupId, file, durationSeconds) {
        if (!file) {
            throw new common_1.BadRequestException('No audio file provided');
        }
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_AUDIO_EXTS.has(fileExt)) {
            throw new common_1.BadRequestException('Unsupported audio format. Use WAV, MP3, FLAC, or AAC');
        }
        const mimeOk = file.mimetype && ALLOWED_AUDIO_MIMES.has(file.mimetype);
        const magicOk = validateMagicBytes(file.buffer, AUDIO_SIGNATURES);
        if (!mimeOk || !magicOk) {
            throw new common_1.BadRequestException('Invalid audio file. The file content does not match the declared format');
        }
        const uniqueFilename = `${setupId}-${Date.now()}${fileExt}`;
        const destinationPath = path.join(this.uploadDir, 'audio', uniqueFilename);
        await this.ensureDirs();
        await fs_1.promises.writeFile(destinationPath, file.buffer);
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
    async deleteImage(id) {
        const img = await this.prisma.setupImage.findUnique({ where: { id } });
        if (!img) {
            throw new common_1.BadRequestException('Image not found');
        }
        const filePath = path.join(process.cwd(), img.image_url);
        await fs_1.promises.unlink(filePath).catch(() => { });
        await this.prisma.setupImage.delete({ where: { id } });
        return { success: true };
    }
    async deleteAudio(id) {
        const audio = await this.prisma.audioFile.findUnique({ where: { id } });
        if (!audio) {
            throw new common_1.BadRequestException('Audio not found');
        }
        const filePath = path.join(process.cwd(), audio.file_url);
        await fs_1.promises.unlink(filePath).catch(() => { });
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