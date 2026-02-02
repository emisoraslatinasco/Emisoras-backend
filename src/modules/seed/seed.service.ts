import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CountriesService } from '../countries/countries.service';
import { GenresService } from '../genres/genres.service';
import { Station } from '../stations/entities/station.entity';
import { SocialNetwork } from '../stations/entities/social-network.entity';

interface JsonStation {
  nombre: string;
  url_stream: string;
  logo_local: string | null;
  slug?: string;
  descripcion?: string;
  descripcion_extendida?: string;
  descripcion_original?: string;
  generos?: string[];
  redes_sociales?: string[];
  sitio_web?: string;
  ciudad?: string;
  frecuencia?: string;
  eslogan?: string;
  fundacion?: string;
  contenido_enriquecido?: boolean;
  fecha_enriquecimiento?: string;
}

interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  jsonFile: string;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  // Configuración de países (igual que en el frontend)
  private readonly countries: CountryConfig[] = [
    {
      code: 'CO',
      name: 'Colombia',
      flag: '/static/flags/colombia.jpg',
      jsonFile: 'emisoras_colombia.json',
    },
    {
      code: 'AR',
      name: 'Argentina',
      flag: '/static/flags/argentina.jpg',
      jsonFile: 'emisoras_argentinas.json',
    },
    {
      code: 'PE',
      name: 'Perú',
      flag: '/static/flags/peru.jpg',
      jsonFile: 'emisoras_peru.json',
    },
    {
      code: 'BR',
      name: 'Brasil',
      flag: '/static/flags/brasil.jpg',
      jsonFile: 'emisoras_brasil.json',
    },
    {
      code: 'VE',
      name: 'Venezuela',
      flag: '/static/flags/venezuela.jpg',
      jsonFile: 'emisoras_venezuela.json',
    },
    {
      code: 'EC',
      name: 'Ecuador',
      flag: '/static/flags/ecuador.jpg',
      jsonFile: 'emisoras_ecuador.json',
    },
    {
      code: 'MX',
      name: 'México',
      flag: '/static/flags/mexico.jpg',
      jsonFile: 'emisoras_mexico.json',
    },
    {
      code: 'GT',
      name: 'Guatemala',
      flag: '/static/flags/guatemala.png',
      jsonFile: 'emisoras_guatemala.json',
    },
    {
      code: 'BO',
      name: 'Bolivia',
      flag: '/static/flags/bolivia.png',
      jsonFile: 'emisoras_bolivia.json',
    },
    {
      code: 'SV',
      name: 'El Salvador',
      flag: '/static/flags/el_salvador.jpg',
      jsonFile: 'emisoras_elsalvador.json',
    },
    {
      code: 'HN',
      name: 'Honduras',
      flag: '/static/flags/honduras.jpg',
      jsonFile: 'emisoras_honduras.json',
    },
    {
      code: 'NI',
      name: 'Nicaragua',
      flag: '/static/flags/nicaragua.jpg',
      jsonFile: 'emisoras_nicaragua.json',
    },
    {
      code: 'JM',
      name: 'Jamaica',
      flag: '/static/flags/jamaica.jpg',
      jsonFile: 'emisoras_jamaica.json',
    },
    {
      code: 'PR',
      name: 'Puerto Rico',
      flag: '/static/flags/puerto_rico.jpg',
      jsonFile: 'emisoras_puertorico.json',
    },
    {
      code: 'DO',
      name: 'República Dominicana',
      flag: '/static/flags/republica_dominicana.jpg',
      jsonFile: 'emisoras_republica_dominicana.json',
    },
    {
      code: 'UA',
      name: 'Ucrania',
      flag: '/static/flags/ucrania.jpg',
      jsonFile: 'emisoras_ucrania.json',
    },
    {
      code: 'UY',
      name: 'Uruguay',
      flag: '/static/flags/uruguay.png',
      jsonFile: 'emisoras_uruguay.json',
    },
    {
      code: 'CL',
      name: 'Chile',
      flag: '/static/flags/chile.jpg',
      jsonFile: 'emisoras_chile.json',
    },
    {
      code: 'CR',
      name: 'Costa Rica',
      flag: '/static/flags/costa_rica.jpg',
      jsonFile: 'emisoras_costarica.json',
    },
    {
      code: 'DK',
      name: 'Dinamarca',
      flag: '/static/flags/dinamarca.jpg',
      jsonFile: 'emisoras_dinamarca.json',
    },
    {
      code: 'ES',
      name: 'España',
      flag: '/static/flags/españa.jpg',
      jsonFile: 'emisoras_españa.json',
    },
    {
      code: 'PT',
      name: 'Portugal',
      flag: '/static/flags/portugal.jpg',
      jsonFile: 'emisoras_portugal.json',
    },
    {
      code: 'TT',
      name: 'Trinidad y Tobago',
      flag: '/static/flags/trinidad_tobago.jpg',
      jsonFile: 'emisoras_trinidad_y_tobago.json',
    },
    {
      code: 'US',
      name: 'Estados Unidos',
      flag: '/static/flags/usa.jpg',
      jsonFile: 'emisoras_usa.json',
    },
    {
      code: 'FR',
      name: 'Francia',
      flag: '/static/flags/francia.jpg',
      jsonFile: 'emisoras_francia.json',
    },
    {
      code: 'IT',
      name: 'Italia',
      flag: '/static/flags/italia.jpg',
      jsonFile: 'emisoras_italia.json',
    },
    {
      code: 'GB',
      name: 'Reino Unido',
      flag: '/static/flags/reino_unido.jpg',
      jsonFile: 'emisoras_reino_unido.json',
    },
  ];

  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(SocialNetwork)
    private readonly socialNetworkRepository: Repository<SocialNetwork>,
    private readonly countriesService: CountriesService,
    private readonly genresService: GenresService,
    private readonly dataSource: DataSource,
  ) {}

  async seedAll(dataPath: string): Promise<void> {
    this.logger.log('🚀 Iniciando importación de datos...');
    const startTime = Date.now();

    try {
      // 1. Crear países
      this.logger.log('📍 Creando países...');
      await this.seedCountries();

      // 2. Importar emisoras por país
      let totalStations = 0;
      for (const country of this.countries) {
        const count = await this.seedStationsForCountry(country, dataPath);
        totalStations += count;
        this.logger.log(`  ✅ ${country.name}: ${count} emisoras importadas`);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `🎉 Importación completada: ${totalStations} emisoras en ${duration}s`,
      );
    } catch (error) {
      this.logger.error('❌ Error durante la importación:', error);
      throw error;
    }
  }

  private async seedCountries(): Promise<void> {
    for (const country of this.countries) {
      await this.countriesService.findOrCreate(country.code, {
        name: country.name,
        flagUrl: country.flag,
      });
    }
    this.logger.log(`  ✅ ${this.countries.length} países creados/verificados`);
  }

  private async seedStationsForCountry(
    countryConfig: CountryConfig,
    dataPath: string,
  ): Promise<number> {
    const jsonPath = path.join(dataPath, countryConfig.jsonFile);

    if (!fs.existsSync(jsonPath)) {
      this.logger.warn(`  ⚠️ Archivo no encontrado: ${jsonPath}`);
      return 0;
    }

    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const stations = JSON.parse(jsonContent) as JsonStation[];

    const country = await this.countriesService.findByCode(countryConfig.code);
    let count = 0;

    // Procesar en lotes para mejor rendimiento
    const batchSize = 50;
    for (let i = 0; i < stations.length; i += batchSize) {
      const batch = stations.slice(i, i + batchSize);

      for (const stationData of batch) {
        try {
          // Verificar si ya existe por slug
          const slug = stationData.slug || this.slugify(stationData.nombre);
          const existing = await this.stationRepository.findOne({
            where: { slug },
          });

          if (existing) {
            continue; // Saltar si ya existe
          }

          // Obtener/crear géneros
          const genres = await this.genresService.findOrCreateMany(
            stationData.generos || [],
          );

          // Transformar logo local a URL del backend
          const logoUrl = this.transformLogoPath(
            stationData.logo_local,
            countryConfig.code,
          );

          // Crear estación
          const station = this.stationRepository.create({
            nombre: stationData.nombre,
            slug,
            urlStream: stationData.url_stream,
            logoUrl,
            descripcion:
              stationData.descripcion || stationData.descripcion_original,
            descripcionExtendida: stationData.descripcion_extendida,
            ciudad: stationData.ciudad,
            frecuencia: stationData.frecuencia,
            sitioWeb: stationData.sitio_web,
            eslogan: stationData.eslogan,
            fundacion: stationData.fundacion,
            contenidoEnriquecido: stationData.contenido_enriquecido || false,
            fechaEnriquecimiento: stationData.fecha_enriquecimiento
              ? new Date(stationData.fecha_enriquecimiento)
              : undefined,
            activo: true,
            country,
            genres,
          } as DeepPartial<Station>);

          const savedStation = await this.stationRepository.save(station);

          // Crear redes sociales
          if (
            stationData.redes_sociales &&
            stationData.redes_sociales.length > 0
          ) {
            const socialNetworks = stationData.redes_sociales.map((url) => {
              return this.socialNetworkRepository.create({
                url,
                platform: this.detectPlatform(url),
                station: savedStation,
              } as DeepPartial<SocialNetwork>);
            });
            await this.socialNetworkRepository.save(socialNetworks);
          }

          count++;
        } catch (err) {
          const error = err as Error;
          this.logger.error(
            `  ❌ Error importando ${stationData.nombre}: ${error.message}`,
          );
        }
      }

      // Log de progreso
      if (i + batchSize < stations.length) {
        this.logger.debug(
          `  📊 ${countryConfig.code}: ${Math.min(i + batchSize, stations.length)}/${stations.length}`,
        );
      }
    }

    return count;
  }

  private transformLogoPath(
    logoLocal: string | null,
    countryCode: string,
  ): string | null {
    if (!logoLocal) return null;

    // Normalizar el path
    const normalized = logoLocal.replace(/\\\\/g, '/').replace(/\\/g, '/');

    // Extraer solo el nombre del archivo
    const fileName = path.basename(normalized);

    // Construir la nueva URL
    return `/static/logos/${countryCode}/${fileName}`;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 250);
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

  async clearAll(): Promise<void> {
    this.logger.warn('🗑️ Limpiando base de datos...');
    await this.socialNetworkRepository.delete({});
    await this.stationRepository.delete({});
    this.logger.log('  ✅ Base de datos limpia');
  }
}
