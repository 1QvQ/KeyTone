import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKeyboardDto } from './dto/create-keyboard.dto';
import { UpdateKeyboardDto } from './dto/update-keyboard.dto';

@Injectable()
export class KeyboardsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateKeyboardDto) {
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

  async findAll(userId: string) {
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

  async findOne(userId: string, id: string) {
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
      throw new NotFoundException('Keyboard not found');
    }

    if (keyboard.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this keyboard');
    }

    return keyboard;
  }

  async update(userId: string, id: string, dto: UpdateKeyboardDto) {
    const keyboard = await this.findOne(userId, id);
    return this.prisma.keyboard.update({
      where: { id: keyboard.id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    const keyboard = await this.findOne(userId, id);
    await this.prisma.keyboard.delete({
      where: { id: keyboard.id },
    });
    return { success: true };
  }
}
