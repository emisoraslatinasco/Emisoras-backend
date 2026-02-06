import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { Station } from './entities/station.entity';
import {
  FilterStationsDto,
  PaginatedStationsResponseDto,
} from './dto/filter-stations.dto';

@ApiTags('Stations')
@Controller('api')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get('stations')
  @ApiOperation({
    summary: 'Obtener todas las emisoras con paginación y filtros',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de emisoras',
  })
  async findAll(
    @Query() filters: FilterStationsDto,
  ): Promise<PaginatedStationsResponseDto> {
    return this.stationsService.findAll(filters);
  }

  @Get('stations/search')
  @ApiOperation({ summary: 'Buscar emisoras por nombre o ciudad' })
  @ApiQuery({ name: 'q', description: 'Término de búsqueda' })
  @ApiQuery({
    name: 'limit',
    description: 'Límite de resultados',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda',
    type: [Station],
  })
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ): Promise<Station[]> {
    return this.stationsService.search(query, limit);
  }

  @Get('stations/:slug')
  @ApiOperation({ summary: 'Obtener una emisora por su slug' })
  @ApiParam({ name: 'slug', description: 'Slug de la emisora' })
  @ApiResponse({
    status: 200,
    description: 'Emisora encontrada',
    type: Station,
  })
  @ApiResponse({
    status: 404,
    description: 'Emisora no encontrada',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Station> {
    return this.stationsService.findBySlug(slug);
  }

  @Get('countries/:code/stations')
  @ApiOperation({ summary: 'Obtener emisoras de un país específico' })
  @ApiParam({ name: 'code', description: 'Código ISO del país (ej: CO, AR)' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de emisoras del país',
  })
  @ApiResponse({
    status: 404,
    description: 'País no encontrado',
  })
  async findByCountry(
    @Param('code') code: string,
    @Query() filters: FilterStationsDto,
  ): Promise<PaginatedStationsResponseDto> {
    return this.stationsService.findByCountry(code, filters);
  }

  @Get('countries/:code/genres')
  @ApiOperation({ summary: 'Obtener géneros disponibles en un país' })
  @ApiParam({ name: 'code', description: 'Código ISO del país' })
  @ApiResponse({
    status: 200,
    description: 'Lista de géneros del país',
    type: [String],
  })
  async getGenresByCountry(@Param('code') code: string): Promise<string[]> {
    return this.stationsService.getGenresByCountry(code);
  }

  // ========== SEO 2.0: Nuevos endpoints ==========

  @Get('stations/:slug/full')
  @ApiOperation({
    summary: 'Obtener emisora con emisoras relacionadas para SEO',
    description:
      'Devuelve la emisora y 6 emisoras relacionadas priorizando por ciudad',
  })
  @ApiParam({ name: 'slug', description: 'Slug de la emisora' })
  @ApiResponse({
    status: 200,
    description: 'Emisora con emisoras relacionadas',
  })
  @ApiResponse({
    status: 404,
    description: 'Emisora no encontrada',
  })
  async findBySlugWithRelated(@Param('slug') slug: string) {
    return this.stationsService.findBySlugWithRelated(slug);
  }

  @Get('stations/slugs/all')
  @ApiOperation({
    summary: 'Obtener lista de todos los slugs para sitemaps',
    description: 'Lee directamente de la base de datos para generación de sitemaps dinámicos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de slugs con código de país y fecha de actualización',
  })
  async getAllSlugs() {
    return this.stationsService.getAllSlugs();
  }
}
