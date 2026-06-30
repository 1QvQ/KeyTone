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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let KeyboardsService = class KeyboardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.keyboard.create({
            data: {
                name: dto.name,
                brand: dto.brand,
                layout: dto.layout,
                colour: dto.colour,
                image_url: dto.image_url,
                user_id: userId,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.keyboard.findMany({
            where: { user_id: userId },
            include: {
                _count: {
                    select: { setups: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(userId, id) {
        const keyboard = await this.prisma.keyboard.findUnique({
            where: { id },
            include: {
                setups: {
                    include: {
                        switches: true,
                        keycaps: true,
                        plates: true,
                        foams: true,
                        audio_files: true,
                        images: true,
                        sound_tags: {
                            include: {
                                tag: true,
                            },
                        },
                    },
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!keyboard) {
            throw new common_1.NotFoundException('Keyboard not found');
        }
        if (keyboard.user_id !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this keyboard');
        }
        return keyboard;
    }
    async update(userId, id, dto) {
        const keyboard = await this.findOne(userId, id);
        return this.prisma.keyboard.update({
            where: { id: keyboard.id },
            data: dto,
        });
    }
    async remove(userId, id) {
        const keyboard = await this.findOne(userId, id);
        await this.prisma.keyboard.delete({
            where: { id: keyboard.id },
        });
        return { success: true };
    }
};
exports.KeyboardsService = KeyboardsService;
exports.KeyboardsService = KeyboardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KeyboardsService);
//# sourceMappingURL=keyboards.service.js.map