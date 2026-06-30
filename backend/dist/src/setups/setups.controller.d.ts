import { SetupsService } from './setups.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
export declare class SetupsController {
    private readonly setupsService;
    constructor(setupsService: SetupsService);
    create(user: any, createSetupDto: CreateSetupDto): Promise<{
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
            setup_id: string;
            profile: string;
            material: string;
        }[];
        switches: {
            id: string;
            brand: string;
            setup_id: string;
            model: string;
            lubed: boolean;
            filmed: boolean;
            spring: string | null;
        }[];
        plates: {
            id: string;
            setup_id: string;
            material: string;
        }[];
        foams: {
            id: string;
            setup_id: string;
            type: string;
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
            setup_id: string;
            tag_id: string;
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
    getMetrics(user: any): Promise<{
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
                setup_id: string;
                model: string;
                lubed: boolean;
                filmed: boolean;
                spring: string | null;
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
    findAll(user: any, search?: string, brand?: string, plate?: string, sw?: string, typingFeel?: string, favourite?: string, tag?: string): Promise<({
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
            setup_id: string;
            profile: string;
            material: string;
        }[];
        switches: {
            id: string;
            brand: string;
            setup_id: string;
            model: string;
            lubed: boolean;
            filmed: boolean;
            spring: string | null;
        }[];
        plates: {
            id: string;
            setup_id: string;
            material: string;
        }[];
        foams: {
            id: string;
            setup_id: string;
            type: string;
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
            setup_id: string;
            tag_id: string;
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
    findOne(user: any, id: string): Promise<{
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
            setup_id: string;
            profile: string;
            material: string;
        }[];
        switches: {
            id: string;
            brand: string;
            setup_id: string;
            model: string;
            lubed: boolean;
            filmed: boolean;
            spring: string | null;
        }[];
        plates: {
            id: string;
            setup_id: string;
            material: string;
        }[];
        foams: {
            id: string;
            setup_id: string;
            type: string;
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
            setup_id: string;
            tag_id: string;
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
    update(user: any, id: string, updateSetupDto: UpdateSetupDto): Promise<{
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
            setup_id: string;
            profile: string;
            material: string;
        }[];
        switches: {
            id: string;
            brand: string;
            setup_id: string;
            model: string;
            lubed: boolean;
            filmed: boolean;
            spring: string | null;
        }[];
        plates: {
            id: string;
            setup_id: string;
            material: string;
        }[];
        foams: {
            id: string;
            setup_id: string;
            type: string;
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
            setup_id: string;
            tag_id: string;
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
    remove(user: any, id: string): Promise<{
        success: boolean;
    }>;
}
