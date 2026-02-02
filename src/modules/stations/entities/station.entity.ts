import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { Country } from '../../countries/entities/country.entity';
import { Genre } from '../../genres/entities/genre.entity';
import { SocialNetwork } from './social-network.entity';

@Entity('stations')
@Index(['slug'], { unique: true })
@Index(['country'])
export class Station {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nombre: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column('text', { name: 'url_stream' })
  urlStream: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('text', { name: 'descripcion_extendida', nullable: true })
  descripcionExtendida: string;

  @Column({ nullable: true, length: 100 })
  ciudad: string;

  @Column({ nullable: true, length: 50 })
  frecuencia: string;

  @Column({ name: 'sitio_web', nullable: true })
  sitioWeb: string;

  @Column({ nullable: true, length: 255 })
  eslogan: string;

  @Column({ nullable: true, length: 50 })
  fundacion: string;

  @Column({ name: 'contenido_enriquecido', default: false })
  contenidoEnriquecido: boolean;

  @Column({ name: 'fecha_enriquecimiento', nullable: true })
  fechaEnriquecimiento: Date;

  @Column({ default: true })
  activo: boolean;

  @ManyToOne(() => Country, (country) => country.stations, { eager: true })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ManyToMany(() => Genre, (genre) => genre.stations, { eager: true })
  @JoinTable({
    name: 'station_genres',
    joinColumn: { name: 'station_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];

  @OneToMany(() => SocialNetwork, (sn) => sn.station, {
    cascade: true,
    eager: true,
  })
  socialNetworks: SocialNetwork[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
