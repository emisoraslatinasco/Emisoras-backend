import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedCommand } from './seed.command';
import { CountriesModule } from '../countries/countries.module';
import { GenresModule } from '../genres/genres.module';
import { StationsModule } from '../stations/stations.module';
import { Station } from '../stations/entities/station.entity';
import { SocialNetwork } from '../stations/entities/social-network.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Station, SocialNetwork]),
    CountriesModule,
    GenresModule,
    StationsModule,
  ],
  providers: [SeedService, SeedCommand],
  exports: [SeedService],
})
export class SeedModule {}
