declare class UpdateSwitchDto {
    brand?: string;
    model?: string;
    lubed?: boolean;
    filmed?: boolean;
    spring?: string;
}
declare class UpdateKeycapsDto {
    brand?: string;
    profile?: string;
    material?: string;
}
export declare class UpdateSetupDto {
    name?: string;
    description?: string;
    typing_feel?: number;
    favourite?: boolean;
    notes?: string;
    switches?: UpdateSwitchDto;
    keycaps?: UpdateKeycapsDto;
    plate_material?: string;
    foams?: string[];
    sound_tags?: string[];
}
export {};
