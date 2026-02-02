import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { Country } from './entities/country.entity';

@ApiTags('Countries')
@Controller('api/countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los países' })
  @ApiResponse({
    status: 200,
    description: 'Lista de países disponibles',
    type: [Country],
  })
  async findAll(): Promise<Country[]> {
    return this.countriesService.findAll();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Obtener un país por su código ISO' })
  @ApiParam({
    name: 'code',
    description: 'Código ISO del país (ej: CO, AR, MX)',
  })
  @ApiResponse({
    status: 200,
    description: 'País encontrado',
    type: Country,
  })
  @ApiResponse({
    status: 404,
    description: 'País no encontrado',
  })
  async findByCode(@Param('code') code: string): Promise<Country> {
    return this.countriesService.findByCode(code);
  }
}
