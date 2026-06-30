import { IsOptional, IsString } from 'class-validator';

export class UpdateKeyboardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  layout?: string;

  @IsString()
  @IsOptional()
  colour?: string;

  @IsString()
  @IsOptional()
  image_url?: string;
}
