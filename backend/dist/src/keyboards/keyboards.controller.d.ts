import { KeyboardsService } from './keyboards.service';
import { CreateKeyboardDto } from './dto/create-keyboard.dto';
import { UpdateKeyboardDto } from './dto/update-keyboard.dto';
export declare class KeyboardsController {
    private readonly keyboardsService;
    constructor(keyboardsService: KeyboardsService);
    create(user: any, createKeyboardDto: CreateKeyboardDto): Promise<{
        id: string;
        created_at: Date;
        name: string;
        brand: string;
        layout: string;
        colour: string;
        image_url: string | null;
        user_id: string;
    }>;
    findAll(user: any): Promise<({
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
    findOne(user: any, id: string): Promise<{
        setups: ({
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
    update(user: any, id: string, updateKeyboardDto: UpdateKeyboardDto): Promise<{
        id: string;
        created_at: Date;
        name: string;
        brand: string;
        layout: string;
        colour: string;
        image_url: string | null;
        user_id: string;
    }>;
    remove(user: any, id: string): Promise<{
        success: boolean;
    }>;
}
