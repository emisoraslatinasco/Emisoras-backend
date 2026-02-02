import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Station } from './station.entity';

@Entity('social_networks')
export class SocialNetwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ length: 50, nullable: true })
  platform: string; // instagram, facebook, twitter, youtube, tiktok

  @ManyToOne(() => Station, (station) => station.socialNetworks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'station_id' })
  station: Station;
}
