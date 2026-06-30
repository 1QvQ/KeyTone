import { PrismaService } from '../prisma/prisma.service';
export declare class FilesService {
    private prisma;
    private readonly uploadDir;
    constructor(prisma: PrismaService);
    saveImage(setupId: string, file: Express.Multer.File, caption?: string): Promise<{
        id: string;
        image_url: string;
        setup_id: string;
        caption: string | null;
    }>;
    saveAudio(setupId: string, file: Express.Multer.File, durationSeconds?: number): Promise<{
        id: string;
        setup_id: string;
        file_url: string;
        duration: number | null;
        format: string;
        size: number;
        uploaded_at: Date;
    }>;
    deleteImage(id: string): Promise<{
        success: boolean;
    }>;
    deleteAudio(id: string): Promise<{
        success: boolean;
    }>;
}
