import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async findAll(): Promise<Country[]> {
    return this.countryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findByCode(code: string): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!country) {
      throw new NotFoundException(`País con código ${code} no encontrado`);
    }

    return country;
  }

  async findById(id: string): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { id },
    });

    if (!country) {
      throw new NotFoundException(`País con id ${id} no encontrado`);
    }

    return country;
  }

  async create(data: Partial<Country>): Promise<Country> {
    const country = this.countryRepository.create(data);
    return this.countryRepository.save(country);
  }

  async createMany(countries: Partial<Country>[]): Promise<Country[]> {
    const entities = this.countryRepository.create(countries);
    return this.countryRepository.save(entities);
  }

  async findOrCreate(code: string, data: Partial<Country>): Promise<Country> {
    let country = await this.countryRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!country) {
      country = this.countryRepository.create({
        ...data,
        code: code.toUpperCase(),
      });
      country = await this.countryRepository.save(country);
    }

    return country;
  }
}
