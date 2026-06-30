import { Module } from '@nestjs/common';
import { SetupsService } from './setups.service';
import { SetupsController } from './setups.controller';

@Module({
  controllers: [SetupsController],
  providers: [SetupsService],
  exports: [SetupsService],
})
export class SetupsModule {}
