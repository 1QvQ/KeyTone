import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getMe(user: any): any;
}
