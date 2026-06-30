import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class FilesController {
    private readonly filesService;
    private readonly prisma;
    constructor(filesService: FilesService, prisma: PrismaService);
    private verifySetupOwner;
    uploadImage(user: any, setupId: string, caption: string, file: Express.Multer.File): Promise<{
        id: string;
        image_url: string;
        setup_id: string;
        caption: string | null;
    }>;
    uploadAudio(user: any, setupId: string, duration: string, file: Express.Multer.File): Promise<{
        id: string;
        setup_id: string;
        file_url: string;
        duration: number | null;
        format: string;
        size: number;
        uploaded_at: Date;
    }>;
    deleteImage(user: any, id: string): Promise<{
        success: boolean;
    }>;
    deleteAudio(user: any, id: string): Promise<{
        success: boolean;
    }>;
}
