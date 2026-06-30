declare class SwitchDto {
    brand: string;
    model: string;
    lubed?: boolean;
    filmed?: boolean;
    spring?: string;
}
declare class KeycapsDto {
    brand: string;
    profile: string;
    material: string;
}
export declare class CreateSetupDto {
    keyboard_id: string;
    name: string;
    description?: string;
    typing_feel?: number;
    favourite?: boolean;
    notes?: string;
    switches?: SwitchDto;
    keycaps?: KeycapsDto;
    plate_material?: string;
    foams?: string[];
    sound_tags?: string[];
}
export {};
