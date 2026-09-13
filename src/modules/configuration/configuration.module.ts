import { Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from '../../database/entities/configuration.entity';
import { ConfigurationRepository } from './repositories/configuration.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Configuration])],
  controllers: [ConfigurationController],
  providers: [ConfigurationService, ConfigurationRepository],
  exports: [ConfigurationService, ConfigurationRepository],
})
export class ConfigurationModule {}
