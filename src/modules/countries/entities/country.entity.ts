import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Station } from '../../stations/entities/station.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 3 })
  code: string; // ISO code: CO, AR, MX

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'flag_url' })
  flagUrl: string;

  @OneToMany(() => Station, (station) => station.country)
  stations: Station[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
