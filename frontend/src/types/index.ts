export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface Keyboard {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  layout: string;
  colour: string;
  image_url?: string | null;
  created_at: string;
  setups?: Setup[];
  _count?: {
    setups: number;
  };
}

export interface SwitchConfig {
  id: string;
  setup_id: string;
  brand: string;
  model: string;
  lubed: boolean;
  filmed: boolean;
  spring?: string | null;
}

export interface KeycapsConfig {
  id: string;
  setup_id: string;
  brand: string;
  profile: string;
  material: string;
}

export interface PlateConfig {
  id: string;
  setup_id: string;
  material: string;
}

export interface FoamConfig {
  id: string;
  setup_id: string;
  type: string;
}

export interface AudioFile {
  id: string;
  setup_id: string;
  file_url: string;
  duration?: number | null;
  format: string;
  size: number;
  uploaded_at: string;
}

export interface SetupImage {
  id: string;
  setup_id: string;
  image_url: string;
  caption?: string | null;
}

export interface SoundTag {
  id: string;
  tag: string;
}

export interface SetupSoundTag {
  setup_id: string;
  tag_id: string;
  tag: SoundTag;
}

export interface Setup {
  id: string;
  keyboard_id: string;
  name: string;
  description?: string | null;
  typing_feel: number; // 1-10
  favourite: boolean;
  notes?: string | null;
  created_at: string;
  keyboard?: Keyboard;
  switches?: SwitchConfig[];
  keycaps?: KeycapsConfig[];
  plates?: PlateConfig[];
  foams?: FoamConfig[];
  audio_files?: AudioFile[];
  images?: SetupImage[];
  sound_tags?: SetupSoundTag[];
}
