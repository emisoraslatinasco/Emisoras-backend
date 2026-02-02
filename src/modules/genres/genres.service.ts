import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async findAll(): Promise<Genre[]> {
    return this.genreRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: { slug },
    });

    if (!genre) {
      throw new NotFoundException(`Género con slug ${slug} no encontrado`);
    }

    return genre;
  }

  async findByNames(names: string[]): Promise<Genre[]> {
    if (!names || names.length === 0) return [];
    return this.genreRepository.find({
      where: { name: In(names) },
    });
  }

  async findOrCreate(name: string): Promise<Genre> {
    const slug = this.slugify(name);
    let genre = await this.genreRepository.findOne({
      where: { slug },
    });

    if (!genre) {
      genre = this.genreRepository.create({ name, slug });
      genre = await this.genreRepository.save(genre);
    }

    return genre;
  }

  async findOrCreateMany(names: string[]): Promise<Genre[]> {
    if (!names || names.length === 0) return [];

    const genres: Genre[] = [];
    for (const name of names) {
      const genre = await this.findOrCreate(name);
      genres.push(genre);
    }

    return genres;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}
