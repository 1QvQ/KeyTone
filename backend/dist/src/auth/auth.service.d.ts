import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        username: string;
        email: string;
        id: string;
        avatar_url: string | null;
        created_at: Date;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            email: string;
            avatar_url: string | null;
        };
    }>;
    validateUser(payload: any): Promise<{
        username: string;
        email: string;
        id: string;
        password_hash: string;
        avatar_url: string | null;
        created_at: Date;
    } | null>;
}
