import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateSwitchDto {
  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

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

class UpdateKeycapsDto {
  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  profile?: string;

  @IsString()
  @IsOptional()
  material?: string;
}

export class UpdateSetupDto {
  @IsString()
  @IsOptional()
  name?: string;

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
  @Type(() => UpdateSwitchDto)
  switches?: UpdateSwitchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateKeycapsDto)
  keycaps?: UpdateKeycapsDto;

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
