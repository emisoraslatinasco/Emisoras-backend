import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'emisoras_db',
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [
    join(__dirname, '..', 'modules', '**', 'entities', '*.entity.{ts,js}'),
  ],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false, // Usar migraciones en lugar de sync
  logging: process.env.NODE_ENV === 'development',
});
