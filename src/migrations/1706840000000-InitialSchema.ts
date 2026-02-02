import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1706840000000 implements MigrationInterface {
  name = 'InitialSchema1706840000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de países
    await queryRunner.query(`
      CREATE TABLE "countries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(3) NOT NULL,
        "name" character varying(100) NOT NULL,
        "flag_url" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_countries_code" UNIQUE ("code"),
        CONSTRAINT "PK_countries" PRIMARY KEY ("id")
      )
    `);

    // Crear tabla de géneros
    await queryRunner.query(`
      CREATE TABLE "genres" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(100) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_genres_name" UNIQUE ("name"),
        CONSTRAINT "UQ_genres_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_genres" PRIMARY KEY ("id")
      )
    `);

    // Crear tabla de estaciones
    await queryRunner.query(`
      CREATE TABLE "stations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "url_stream" text NOT NULL,
        "logo_url" character varying,
        "descripcion" text,
        "descripcion_extendida" text,
        "ciudad" character varying(100),
        "frecuencia" character varying(50),
        "sitio_web" character varying,
        "eslogan" character varying(255),
        "fundacion" character varying(50),
        "contenido_enriquecido" boolean NOT NULL DEFAULT false,
        "fecha_enriquecimiento" TIMESTAMP,
        "activo" boolean NOT NULL DEFAULT true,
        "country_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_stations_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_stations" PRIMARY KEY ("id")
      )
    `);

    // Crear índice para slug de estaciones
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_stations_slug" ON "stations" ("slug")
    `);

    // Crear índice para country_id
    await queryRunner.query(`
      CREATE INDEX "IDX_stations_country" ON "stations" ("country_id")
    `);

    // Crear tabla de redes sociales
    await queryRunner.query(`
      CREATE TABLE "social_networks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" character varying NOT NULL,
        "platform" character varying(50),
        "station_id" uuid,
        CONSTRAINT "PK_social_networks" PRIMARY KEY ("id")
      )
    `);

    // Crear tabla pivote station_genres
    await queryRunner.query(`
      CREATE TABLE "station_genres" (
        "station_id" uuid NOT NULL,
        "genre_id" uuid NOT NULL,
        CONSTRAINT "PK_station_genres" PRIMARY KEY ("station_id", "genre_id")
      )
    `);

    // Crear índices para la tabla pivote
    await queryRunner.query(`
      CREATE INDEX "IDX_station_genres_station" ON "station_genres" ("station_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_station_genres_genre" ON "station_genres" ("genre_id")
    `);

    // Agregar foreign keys
    await queryRunner.query(`
      ALTER TABLE "stations" 
      ADD CONSTRAINT "FK_stations_country" 
      FOREIGN KEY ("country_id") REFERENCES "countries"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "social_networks" 
      ADD CONSTRAINT "FK_social_networks_station" 
      FOREIGN KEY ("station_id") REFERENCES "stations"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "station_genres" 
      ADD CONSTRAINT "FK_station_genres_station" 
      FOREIGN KEY ("station_id") REFERENCES "stations"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "station_genres" 
      ADD CONSTRAINT "FK_station_genres_genre" 
      FOREIGN KEY ("genre_id") REFERENCES "genres"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Habilitar extensión uuid-ossp si no existe
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys
    await queryRunner.query(
      `ALTER TABLE "station_genres" DROP CONSTRAINT "FK_station_genres_genre"`,
    );
    await queryRunner.query(
      `ALTER TABLE "station_genres" DROP CONSTRAINT "FK_station_genres_station"`,
    );
    await queryRunner.query(
      `ALTER TABLE "social_networks" DROP CONSTRAINT "FK_social_networks_station"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stations" DROP CONSTRAINT "FK_stations_country"`,
    );

    // Eliminar índices
    await queryRunner.query(`DROP INDEX "IDX_station_genres_genre"`);
    await queryRunner.query(`DROP INDEX "IDX_station_genres_station"`);
    await queryRunner.query(`DROP INDEX "IDX_stations_country"`);
    await queryRunner.query(`DROP INDEX "IDX_stations_slug"`);

    // Eliminar tablas
    await queryRunner.query(`DROP TABLE "station_genres"`);
    await queryRunner.query(`DROP TABLE "social_networks"`);
    await queryRunner.query(`DROP TABLE "stations"`);
    await queryRunner.query(`DROP TABLE "genres"`);
    await queryRunner.query(`DROP TABLE "countries"`);
  }
}
