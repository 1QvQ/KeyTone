import { PrismaService } from '../prisma/prisma.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
export declare class SetupsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateSetupDto): Promise<{
        keyboard: {
            id: string;
            created_at: Date;
            name: string;
            brand: string;
            layout: string;
            colour: string;
            image_url: string | null;
            user_id: string;
        };
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
    }>;
    findOne(userId: string, id: string): Promise<{
        keyboard: {
            id: string;
            created_at: Date;
            name: string;
            brand: string;
            layout: string;
            colour: string;
            image_url: string | null;
            user_id: string;
        };
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
    }>;
    update(userId: string, id: string, dto: UpdateSetupDto): Promise<{
        keyboard: {
            id: string;
            created_at: Date;
            name: string;
            brand: string;
            layout: string;
            colour: string;
            image_url: string | null;
            user_id: string;
        };
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
    }>;
    remove(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    findAll(userId: string, filters: {
        search?: string;
        brand?: string;
        plate?: string;
        switch?: string;
        typingFeel?: string;
        favourite?: string;
        tag?: string;
    }): Promise<({
        keyboard: {
            id: string;
            created_at: Date;
            name: string;
            brand: string;
            layout: string;
            colour: string;
            image_url: string | null;
            user_id: string;
        };
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
    })[]>;
    getMetrics(userId: string): Promise<{
        stats: {
            keyboards: number;
            setups: number;
            audioFiles: number;
            favorites: number;
        };
        recentSetups: ({
            keyboard: {
                id: string;
                created_at: Date;
                name: string;
                brand: string;
                layout: string;
                colour: string;
                image_url: string | null;
                user_id: string;
            };
            switches: {
                id: string;
                brand: string;
                model: string;
                lubed: boolean;
                filmed: boolean;
                spring: string | null;
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
    }>;
}
