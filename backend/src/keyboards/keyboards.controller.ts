import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { KeyboardsService } from './keyboards.service';
import { CreateKeyboardDto } from './dto/create-keyboard.dto';
import { UpdateKeyboardDto } from './dto/update-keyboard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('keyboards')
export class KeyboardsController {
  constructor(private readonly keyboardsService: KeyboardsService) {}

  @Post()
  create(@GetUser() user: any, @Body() createKeyboardDto: CreateKeyboardDto) {
    return this.keyboardsService.create(user.id, createKeyboardDto);
  }

  @Get()
  findAll(@GetUser() user: any) {
    return this.keyboardsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@GetUser() user: any, @Param('id') id: string) {
    return this.keyboardsService.findOne(user.id, id);
  }

  @Put(':id')
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() updateKeyboardDto: UpdateKeyboardDto,
  ) {
    return this.keyboardsService.update(user.id, id, updateKeyboardDto);
  }

  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.keyboardsService.remove(user.id, id);
  }
}
