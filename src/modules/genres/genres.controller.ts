import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GenresService } from './genres.service';
import { Genre } from './entities/genre.entity';

@ApiTags('Genres')
@Controller('api/genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los géneros musicales' })
  @ApiResponse({
    status: 200,
    description: 'Lista de géneros disponibles',
    type: [Genre],
  })
  async findAll(): Promise<Genre[]> {
    return this.genresService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener un género por su slug' })
  @ApiParam({ name: 'slug', description: 'Slug del género (ej: rock, pop)' })
  @ApiResponse({
    status: 200,
    description: 'Género encontrado',
    type: Genre,
  })
  @ApiResponse({
    status: 404,
    description: 'Género no encontrado',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Genre> {
    return this.genresService.findBySlug(slug);
  }
}
