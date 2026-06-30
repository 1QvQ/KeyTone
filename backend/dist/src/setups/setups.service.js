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
exports.SetupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SetupsService = class SetupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const keyboard = await this.prisma.keyboard.findUnique({
            where: { id: dto.keyboard_id },
        });
        if (!keyboard || keyboard.user_id !== userId) {
            throw new common_1.NotFoundException('Keyboard not found or access denied');
        }
        const tagConnections = [];
        if (dto.sound_tags && dto.sound_tags.length > 0) {
            for (const tagName of dto.sound_tags) {
                const tag = await this.prisma.soundTag.upsert({
                    where: { tag: tagName.toLowerCase().trim() },
                    update: {},
                    create: { tag: tagName.toLowerCase().trim() },
                });
                tagConnections.push({
                    tag: {
                        connect: { id: tag.id },
                    },
                });
            }
        }
        return this.prisma.setup.create({
            data: {
                name: dto.name,
                description: dto.description,
                typing_feel: dto.typing_feel ?? 5,
                favourite: dto.favourite ?? false,
                notes: dto.notes,
                keyboard: {
                    connect: { id: dto.keyboard_id },
                },
                switches: dto.switches
                    ? {
                        create: {
                            brand: dto.switches.brand,
                            model: dto.switches.model,
                            lubed: dto.switches.lubed ?? false,
                            filmed: dto.switches.filmed ?? false,
                            spring: dto.switches.spring,
                        },
                    }
                    : undefined,
                keycaps: dto.keycaps
                    ? {
                        create: {
                            brand: dto.keycaps.brand,
                            profile: dto.keycaps.profile,
                            material: dto.keycaps.material,
                        },
                    }
                    : undefined,
                plates: dto.plate_material
                    ? {
                        create: {
                            material: dto.plate_material,
                        },
                    }
                    : undefined,
                foams: dto.foams
                    ? {
                        create: dto.foams.map((type) => ({ type })),
                    }
                    : undefined,
                sound_tags: tagConnections.length > 0
                    ? {
                        create: tagConnections,
                    }
                    : undefined,
            },
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
                keyboard: true,
            },
        });
    }
    async findOne(userId, id) {
        const setup = await this.prisma.setup.findUnique({
            where: { id },
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
                keyboard: true,
            },
        });
        if (!setup) {
            throw new common_1.NotFoundException('Setup not found');
        }
        if (setup.keyboard.user_id !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this setup');
        }
        return setup;
    }
    async update(userId, id, dto) {
        const setup = await this.findOne(userId, id);
        const data = {
            name: dto.name,
            description: dto.description,
            typing_feel: dto.typing_feel,
            favourite: dto.favourite,
            notes: dto.notes,
        };
        if (dto.switches) {
            const existingSwitch = setup.switches[0];
            if (existingSwitch) {
                data.switches = {
                    update: {
                        where: { id: existingSwitch.id },
                        data: dto.switches,
                    },
                };
            }
            else {
                data.switches = {
                    create: {
                        brand: dto.switches.brand ?? '',
                        model: dto.switches.model ?? '',
                        lubed: dto.switches.lubed ?? false,
                        filmed: dto.switches.filmed ?? false,
                        spring: dto.switches.spring,
                    },
                };
            }
        }
        if (dto.keycaps) {
            const existingKeycap = setup.keycaps[0];
            if (existingKeycap) {
                data.keycaps = {
                    update: {
                        where: { id: existingKeycap.id },
                        data: dto.keycaps,
                    },
                };
            }
            else {
                data.keycaps = {
                    create: {
                        brand: dto.keycaps.brand ?? '',
                        profile: dto.keycaps.profile ?? '',
                        material: dto.keycaps.material ?? '',
                    },
                };
            }
        }
        if (dto.plate_material !== undefined) {
            await this.prisma.plate.deleteMany({
                where: { setup_id: id },
            });
            if (dto.plate_material) {
                data.plates = {
                    create: {
                        material: dto.plate_material,
                    },
                };
            }
        }
        if (dto.foams !== undefined) {
            await this.prisma.foam.deleteMany({
                where: { setup_id: id },
            });
            if (dto.foams.length > 0) {
                data.foams = {
                    create: dto.foams.map((type) => ({ type })),
                };
            }
        }
        if (dto.sound_tags !== undefined) {
            await this.prisma.setupSoundTag.deleteMany({
                where: { setup_id: id },
            });
            if (dto.sound_tags.length > 0) {
                const tagConnections = [];
                for (const tagName of dto.sound_tags) {
                    const tag = await this.prisma.soundTag.upsert({
                        where: { tag: tagName.toLowerCase().trim() },
                        update: {},
                        create: { tag: tagName.toLowerCase().trim() },
                    });
                    tagConnections.push({
                        tag: {
                            connect: { id: tag.id },
                        },
                    });
                }
                data.sound_tags = {
                    create: tagConnections,
                };
            }
        }
        return this.prisma.setup.update({
            where: { id },
            data,
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
                keyboard: true,
            },
        });
    }
    async remove(userId, id) {
        const setup = await this.findOne(userId, id);
        await this.prisma.setup.delete({
            where: { id: setup.id },
        });
        return { success: true };
    }
    async findAll(userId, filters) {
        const whereClause = {
            keyboard: {
                user_id: userId,
            },
        };
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            whereClause.OR = [
                { name: { contains: searchLower } },
                { description: { contains: searchLower } },
                { notes: { contains: searchLower } },
                { keyboard: { name: { contains: searchLower } } },
                { keyboard: { brand: { contains: searchLower } } },
                {
                    switches: {
                        some: {
                            OR: [
                                { model: { contains: searchLower } },
                                { brand: { contains: searchLower } },
                            ],
                        },
                    },
                },
                {
                    keycaps: {
                        some: {
                            OR: [
                                { brand: { contains: searchLower } },
                                { material: { contains: searchLower } },
                                { profile: { contains: searchLower } },
                            ],
                        },
                    },
                },
                {
                    plates: {
                        some: {
                            material: { contains: searchLower },
                        },
                    },
                },
                {
                    sound_tags: {
                        some: {
                            tag: {
                                tag: { contains: searchLower },
                            },
                        },
                    },
                },
            ];
        }
        if (filters.brand) {
            whereClause.keyboard = {
                ...whereClause.keyboard,
                brand: { contains: filters.brand },
            };
        }
        if (filters.plate) {
            whereClause.plates = {
                some: {
                    material: { contains: filters.plate },
                },
            };
        }
        if (filters.switch) {
            whereClause.switches = {
                some: {
                    model: { contains: filters.switch },
                },
            };
        }
        if (filters.typingFeel) {
            const feelValue = parseInt(filters.typingFeel, 10);
            if (!isNaN(feelValue)) {
                whereClause.typing_feel = feelValue;
            }
        }
        if (filters.favourite !== undefined) {
            whereClause.favourite = filters.favourite === 'true';
        }
        if (filters.tag) {
            whereClause.sound_tags = {
                some: {
                    tag: {
                        tag: filters.tag.toLowerCase().trim(),
                    },
                },
            };
        }
        return this.prisma.setup.findMany({
            where: whereClause,
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
                keyboard: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async getMetrics(userId) {
        const keyboardsCount = await this.prisma.keyboard.count({
            where: { user_id: userId },
        });
        const setupsCount = await this.prisma.setup.count({
            where: {
                keyboard: {
                    user_id: userId,
                },
            },
        });
        const audioCount = await this.prisma.audioFile.count({
            where: {
                setup: {
                    keyboard: {
                        user_id: userId,
                    },
                },
            },
        });
        const favoriteCount = await this.prisma.setup.count({
            where: {
                favourite: true,
                keyboard: {
                    user_id: userId,
                },
            },
        });
        const recentSetups = await this.prisma.setup.findMany({
            where: {
                keyboard: {
                    user_id: userId,
                },
            },
            take: 5,
            orderBy: { created_at: 'desc' },
            include: {
                keyboard: true,
                audio_files: true,
                switches: true,
            },
        });
        return {
            stats: {
                keyboards: keyboardsCount,
                setups: setupsCount,
                audioFiles: audioCount,
                favorites: favoriteCount,
            },
            recentSetups,
        };
    }
};
exports.SetupsService = SetupsService;
exports.SetupsService = SetupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetupsService);
//# sourceMappingURL=setups.service.js.map