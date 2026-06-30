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
let FilesService = class FilesService {
    prisma;
    uploadDir = path.join(process.cwd(), 'uploads');
    constructor(prisma) {
        this.prisma = prisma;
        fs.mkdirSync(path.join(this.uploadDir, 'images'), { recursive: true });
        fs.mkdirSync(path.join(this.uploadDir, 'audio'), { recursive: true });
    }
    async saveImage(setupId, file, caption) {
        if (!file) {
            throw new common_1.BadRequestException('No image file provided');
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
    async deleteImage(id) {
        const img = await this.prisma.setupImage.findUnique({ where: { id } });
        if (!img) {
            throw new common_1.BadRequestException('Image not found');
        }
        const filePath = path.join(process.cwd(), img.image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await this.prisma.setupImage.delete({ where: { id } });
        return { success: true };
    }
    async deleteAudio(id) {
        const audio = await this.prisma.audioFile.findUnique({ where: { id } });
        if (!audio) {
            throw new common_1.BadRequestException('Audio not found');
        }
        const filePath = path.join(process.cwd(), audio.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
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