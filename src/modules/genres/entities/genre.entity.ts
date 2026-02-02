import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Station } from '../../stations/entities/station.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @ManyToMany(() => Station, (station) => station.genres)
  stations: Station[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
