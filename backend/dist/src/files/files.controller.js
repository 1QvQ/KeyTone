"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("./files.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let FilesController = class FilesController {
    filesService;
    prisma;
    constructor(filesService, prisma) {
        this.filesService = filesService;
        this.prisma = prisma;
    }
    async verifySetupOwner(setupId, userId) {
        const setup = await this.prisma.setup.findUnique({
            where: { id: setupId },
            include: { keyboard: true },
        });
        if (!setup) {
            throw new common_1.NotFoundException('Setup not found');
        }
        if (setup.keyboard.user_id !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
    }
    async uploadImage(user, setupId, caption, file) {
        await this.verifySetupOwner(setupId, user.id);
        return this.filesService.saveImage(setupId, file, caption);
    }
    async uploadAudio(user, setupId, duration, file) {
        await this.verifySetupOwner(setupId, user.id);
        const durationNum = duration ? parseFloat(duration) : undefined;
        return this.filesService.saveAudio(setupId, file, durationNum);
    }
    async deleteImage(user, id) {
        const img = await this.prisma.setupImage.findUnique({
            where: { id },
            include: { setup: { include: { keyboard: true } } },
        });
        if (!img) {
            throw new common_1.NotFoundException('Image not found');
        }
        if (img.setup.keyboard.user_id !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.filesService.deleteImage(id);
    }
    async deleteAudio(user, id) {
        const audio = await this.prisma.audioFile.findUnique({
            where: { id },
            include: { setup: { include: { keyboard: true } } },
        });
        if (!audio) {
            throw new common_1.NotFoundException('Audio file not found');
        }
        if (audio.setup.keyboard.user_id !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.filesService.deleteAudio(id);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('image/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)('setup_id')),
    __param(2, (0, common_1.Body)('caption')),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('audio/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)('setup_id')),
    __param(2, (0, common_1.Body)('duration')),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadAudio", null);
__decorate([
    (0, common_1.Delete)('image/:id'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Delete)('audio/:id'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteAudio", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [files_service_1.FilesService,
        prisma_service_1.PrismaService])
], FilesController);
//# sourceMappingURL=files.controller.js.map