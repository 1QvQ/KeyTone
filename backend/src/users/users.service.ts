import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, data: { full_name?: string; bio?: string; interests?: string[]; preferred_sound?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        full_name: data.full_name !== undefined ? data.full_name : user.full_name,
        bio: data.bio !== undefined ? data.bio : user.bio,
        interests: data.interests !== undefined ? data.interests : user.interests,
        preferred_sound: data.preferred_sound !== undefined ? data.preferred_sound : user.preferred_sound,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        full_name: true,
        bio: true,
        interests: true,
        preferred_sound: true,
      }
    });
  }

  async changePassword(userId: string, oldPassword?: string, newPassword?: string) {
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Old and new passwords are required');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      throw new BadRequestException('Incorrect old password');
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    return { success: true };
  }
}
