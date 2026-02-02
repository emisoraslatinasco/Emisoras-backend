import { Injectable, OnModuleInit } from '@nestjs/common';
import { SeedService } from './seed.service';
import * as path from 'path';

@Injectable()
export class SeedCommand implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit(): Promise<void> {
    // Solo ejecutar si se pasa el argumento --seed
    const shouldSeed = process.argv.includes('--seed');

    if (shouldSeed) {
      // Path a los datos del frontend
      const dataPath =
        process.env.SEED_DATA_PATH ||
        path.resolve(__dirname, '../../../../Emisoras-Latinas/data');

      console.log(`\n📂 Ruta de datos: ${dataPath}\n`);

      await this.seedService.seedAll(dataPath);

      // Salir después del seeding
      process.exit(0);
    }
  }
}
