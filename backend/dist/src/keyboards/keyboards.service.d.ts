import { PrismaService } from '../prisma/prisma.service';
import { CreateKeyboardDto } from './dto/create-keyboard.dto';
import { UpdateKeyboardDto } from './dto/update-keyboard.dto';
export declare class KeyboardsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateKeyboardDto): Promise<{
        id: string;
        created_at: Date;
        name: string;
        brand: string;
        layout: string;
        colour: string;
        image_url: string | null;
        user_id: string;
    }>;
    findAll(userId: string): Promise<({
        _count: {
            setups: number;
        };
    } & {
        id: string;
        created_at: Date;
        name: string;
        brand: string;
        layout: string;
        colour: string;
        image_url: string | null;
        user_id: string;
    })[]>;
    findOne(userId: string, id: string): Promise<{
        setups: ({
            keycaps: {
                id: string;
                brand: string;
                profile: string;
                material: string;
                setup_id: string;
            }[];
            switches: {
                id: string;
                brand: string;
                model: string;
                lubed: boolean;
                filmed: boolean;
                spring: string | null;
                setup_id: string;
            }[];
            plates: {
                id: string;
                material: string;
                setup_id: string;
            }[];
            foams: {
                id: string;
                type: string;
                setup_id: string;
            }[];
            audio_files: {
                id: string;
                setup_id: string;
                file_url: string;
                duration: number | null;
                format: string;
                size: number;
                uploaded_at: Date;
            }[];
            images: {
                id: string;
                image_url: string;
                setup_id: string;
                caption: string | null;
            }[];
            sound_tags: ({
                tag: {
                    id: string;
                    tag: string;
                };
            } & {
                tag_id: string;
                setup_id: string;
            })[];
        } & {
            id: string;
            created_at: Date;
            name: string;
            keyboard_id: string;
            description: string | null;
            typing_feel: number;
            favourite: boolean;
            notes: string | null;
        })[];
    } & {
        id: string;
        created_at: Date;
        name: string;
        brand: string;
        layout: string;
        colour: string;
        image_url: string | null;
        user_id: string;
    }>;
    update(userId: string, id: string, dto: UpdateKeyboardDto): Promise<{
        id: string;
        created_at: Date;
        name: string;
        brand: string;
        layout: string;
        colour: string;
        image_url: string | null;
        user_id: string;
    }>;
    remove(userId: string, id: string): Promise<{
        success: boolean;
    }>;
}
