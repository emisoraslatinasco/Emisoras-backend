import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';
import { SocialNetwork } from './entities/social-network.entity';
import {
  FilterStationsDto,
  PaginatedStationsResponseDto,
} from './dto/filter-stations.dto';
import { CountriesService } from '../countries/countries.service';
import { GenresService } from '../genres/genres.service';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(SocialNetwork)
    private readonly socialNetworkRepository: Repository<SocialNetwork>,
    private readonly countriesService: CountriesService,
    private readonly genresService: GenresService,
  ) {}

  async findAll(
    filters: FilterStationsDto,
  ): Promise<PaginatedStationsResponseDto> {
    const { page = 1, limit = 50, genres, search, city } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.stationRepository
      .createQueryBuilder('station')
      .leftJoinAndSelect('station.country', 'country')
      .leftJoinAndSelect('station.genres', 'genre')
      .leftJoinAndSelect('station.socialNetworks', 'socialNetwork')
      .where('station.activo = :activo', { activo: true });

    // Filter by genres
    if (genres) {
      const genreList = genres.split(',').map((g) => g.trim());
      queryBuilder.andWhere('genre.name IN (:...genreList)', { genreList });
    }

    // Search
    if (search) {
      const searchPattern = `%${search}%`;
      queryBuilder.andWhere(
        '(station.nombre ILIKE :search OR station.descripcion ILIKE :search OR station.ciudad ILIKE :search)',
        { search: searchPattern },
      );
    }

    // Filter by city
    if (city) {
      queryBuilder.andWhere('station.ciudad ILIKE :city', {
        city: `%${city}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('station.nombre', 'ASC')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findByCountry(
    countryCode: string,
    filters: FilterStationsDto,
  ): Promise<PaginatedStationsResponseDto> {
    const country = await this.countriesService.findByCode(countryCode);
    const { page = 1, limit = 50, genres, search, city } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.stationRepository
      .createQueryBuilder('station')
      .leftJoinAndSelect('station.country', 'country')
      .leftJoinAndSelect('station.genres', 'genre')
      .leftJoinAndSelect('station.socialNetworks', 'socialNetwork')
      .where('station.country_id = :countryId', { countryId: country.id })
      .andWhere('station.activo = :activo', { activo: true });

    // Filter by genres
    if (genres) {
      const genreList = genres.split(',').map((g) => g.trim());
      queryBuilder.andWhere('genre.name IN (:...genreList)', { genreList });
    }

    // Search
    if (search) {
      const searchPattern = `%${search}%`;
      queryBuilder.andWhere(
        '(station.nombre ILIKE :search OR station.descripcion ILIKE :search OR station.ciudad ILIKE :search)',
        { search: searchPattern },
      );
    }

    // Filter by city
    if (city) {
      queryBuilder.andWhere('station.ciudad ILIKE :city', {
        city: `%${city}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('station.nombre', 'ASC')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findBySlug(slug: string): Promise<Station> {
    const station = await this.stationRepository.findOne({
      where: { slug, activo: true },
      relations: ['country', 'genres', 'socialNetworks'],
    });

    if (!station) {
      throw new NotFoundException(`Emisora con slug ${slug} no encontrada`);
    }

    return station;
  }

  async search(query: string, limit: number = 20): Promise<Station[]> {
    const searchPattern = `%${query}%`;

    return this.stationRepository
      .createQueryBuilder('station')
      .leftJoinAndSelect('station.country', 'country')
      .leftJoinAndSelect('station.genres', 'genre')
      .where('station.activo = :activo', { activo: true })
      .andWhere(
        '(station.nombre ILIKE :search OR station.ciudad ILIKE :search)',
        { search: searchPattern },
      )
      .take(limit)
      .orderBy('station.nombre', 'ASC')
      .getMany();
  }

  async getGenresByCountry(countryCode: string): Promise<string[]> {
    const country = await this.countriesService.findByCode(countryCode);

    const result: Array<{ name: string | null }> = await this.stationRepository
      .createQueryBuilder('station')
      .leftJoin('station.genres', 'genre')
      .select('DISTINCT genre.name', 'name')
      .where('station.country_id = :countryId', { countryId: country.id })
      .andWhere('station.activo = :activo', { activo: true })
      .getRawMany();

    return result
      .map((r) => r.name)
      .filter((name): name is string => name !== null)
      .sort();
  }

  // Methods for seeding
  async create(data: Partial<Station>): Promise<Station> {
    const station = this.stationRepository.create(data);
    return this.stationRepository.save(station);
  }

  async createWithRelations(
    stationData: Partial<Station>,
    countryCode: string,
    genreNames: string[],
    socialUrls: string[],
  ): Promise<Station> {
    const country = await this.countriesService.findByCode(countryCode);
    const genres = await this.genresService.findOrCreateMany(genreNames);

    const socialNetworks = socialUrls.map((url) => {
      const platform = this.detectPlatform(url);
      return { url, platform } as SocialNetwork;
    });

    const station = this.stationRepository.create({
      ...stationData,
      country,
      genres,
      socialNetworks,
    });

    return this.stationRepository.save(station);
  }

  private detectPlatform(url: string): string | null {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('instagram')) return 'instagram';
    if (lowerUrl.includes('facebook')) return 'facebook';
    if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com'))
      return 'twitter';
    if (lowerUrl.includes('youtube')) return 'youtube';
    if (lowerUrl.includes('tiktok')) return 'tiktok';
    return null;
  }
}
