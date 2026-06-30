import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SwitchDto {
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsBoolean()
  @IsOptional()
  lubed?: boolean;

  @IsBoolean()
  @IsOptional()
  filmed?: boolean;

  @IsString()
  @IsOptional()
  spring?: string;
}

class KeycapsDto {
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  profile: string;

  @IsString()
  @IsNotEmpty()
  material: string;
}

export class CreateSetupDto {
  @IsString()
  @IsNotEmpty()
  keyboard_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  typing_feel?: number;

  @IsBoolean()
  @IsOptional()
  favourite?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SwitchDto)
  switches?: SwitchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => KeycapsDto)
  keycaps?: KeycapsDto;

  @IsString()
  @IsOptional()
  plate_material?: string;

  @IsString()
  @IsOptional()
  case_material?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  foams?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sound_tags?: string[];
}
