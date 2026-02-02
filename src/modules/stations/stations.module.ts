import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { Station } from './entities/station.entity';
import { SocialNetwork } from './entities/social-network.entity';
import { CountriesModule } from '../countries/countries.module';
import { GenresModule } from '../genres/genres.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Station, SocialNetwork]),
    CountriesModule,
    GenresModule,
  ],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})
export class StationsModule {}
