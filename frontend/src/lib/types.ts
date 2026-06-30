export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
}

export interface SoundTag {
  tag: {
    tag: string;
  };
}

export interface Foam {
  type: string;
}

export interface KeyboardSwitch {
  brand: string;
  model: string;
  lubed: boolean;
  filmed: boolean;
  spring: string | null;
}

export interface Keycap {
  brand: string;
  profile: string;
  material: string;
}

export interface Plate {
  material: string;
}

export interface Setup {
  id: string;
  name: string;
  description: string | null;
  typing_feel: number;
  favourite: boolean;
  notes: string | null;
  switches: KeyboardSwitch[];
  keycaps: Keycap[];
  plates: Plate[];
  foams: Foam[];
  sound_tags: SoundTag[];
  keyboard: { id: string; name: string; brand: string };

  [key: string]: unknown;
}
