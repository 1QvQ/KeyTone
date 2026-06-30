import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';

@Injectable()
export class SetupsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSetupDto) {
    // Verify keyboard ownership
    const keyboard = await this.prisma.keyboard.findUnique({
      where: { id: dto.keyboard_id },
    });

    if (!keyboard || keyboard.user_id !== userId) {
      throw new NotFoundException('Keyboard not found or access denied');
    }

    // Prepare create logic with relations
    const tagConnections = [];
    if (dto.sound_tags && dto.sound_tags.length > 0) {
      for (const tagName of dto.sound_tags) {
        // Upsert the sound tag first
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
        sound_tags:
          tagConnections.length > 0
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

  async findOne(userId: string, id: string) {
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
      throw new NotFoundException('Setup not found');
    }

    if (setup.keyboard.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this setup');
    }

    return setup;
  }

  async update(userId: string, id: string, dto: UpdateSetupDto) {
    const setup = await this.findOne(userId, id);

    // Update main fields
    const data: any = {
      name: dto.name,
      description: dto.description,
      typing_feel: dto.typing_feel,
      favourite: dto.favourite,
      notes: dto.notes,
    };

    // Handle nested switch update
    if (dto.switches) {
      const existingSwitch = setup.switches[0];
      if (existingSwitch) {
        data.switches = {
          update: {
            where: { id: existingSwitch.id },
            data: dto.switches,
          },
        };
      } else {
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

    // Handle nested keycaps update
    if (dto.keycaps) {
      const existingKeycap = setup.keycaps[0];
      if (existingKeycap) {
        data.keycaps = {
          update: {
            where: { id: existingKeycap.id },
            data: dto.keycaps,
          },
        };
      } else {
        data.keycaps = {
          create: {
            brand: dto.keycaps.brand ?? '',
            profile: dto.keycaps.profile ?? '',
            material: dto.keycaps.material ?? '',
          },
        };
      }
    }

    // Handle plate update
    if (dto.plate_material !== undefined) {
      // Clear existing plates
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

    // Handle foams update
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

    // Handle sound tags update
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

  async remove(userId: string, id: string) {
    const setup = await this.findOne(userId, id);
    await this.prisma.setup.delete({
      where: { id: setup.id },
    });
    return { success: true };
  }

  async findAll(
    userId: string,
    filters: {
      search?: string;
      brand?: string;
      plate?: string;
      switch?: string;
      typingFeel?: string;
      favourite?: string;
      tag?: string;
    },
  ) {
    const whereClause: any = {
      keyboard: {
        user_id: userId,
      },
    };

    // Handle search query
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

    // Specific filters
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

  // Dashboard metrics
  async getMetrics(userId: string) {
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

    // Recent setups
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
}
