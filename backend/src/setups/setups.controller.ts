import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SetupsService } from './setups.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('setups')
export class SetupsController {
  constructor(private readonly setupsService: SetupsService) {}

  @Post()
  create(@GetUser() user: any, @Body() createSetupDto: CreateSetupDto) {
    return this.setupsService.create(user.id, createSetupDto);
  }

  @Get('metrics')
  getMetrics(@GetUser() user: any) {
    return this.setupsService.getMetrics(user.id);
  }

  @Get()
  findAll(
    @GetUser() user: any,
    @Query('search') search?: string,
    @Query('brand') brand?: string,
    @Query('plate') plate?: string,
    @Query('switch') sw?: string,
    @Query('typingFeel') typingFeel?: string,
    @Query('favourite') favourite?: string,
    @Query('tag') tag?: string,
  ) {
    return this.setupsService.findAll(user.id, {
      search,
      brand,
      plate,
      switch: sw,
      typingFeel,
      favourite,
      tag,
    });
  }

  @Get(':id')
  findOne(@GetUser() user: any, @Param('id') id: string) {
    return this.setupsService.findOne(user.id, id);
  }

  @Put(':id')
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() updateSetupDto: UpdateSetupDto,
  ) {
    return this.setupsService.update(user.id, id, updateSetupDto);
  }

  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.setupsService.remove(user.id, id);
  }
}
