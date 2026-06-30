import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateKeyboardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  layout: string;

  @IsString()
  @IsNotEmpty()
  colour: string;

  @IsString()
  @IsOptional()
  image_url?: string;
}
