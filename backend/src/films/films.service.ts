import { Injectable, NotFoundException } from '@nestjs/common';

import { FilmsRepository } from './films.repository';
import { filmToDto, scheduleToDto } from './films.converter';
import { FilmScheduleResponseDto, FilmsResponseDto } from './dto/film.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async findAll(): Promise<FilmsResponseDto> {
    const films = await this.filmsRepository.findAll();
    const items = films.map(filmToDto);

    return {
      total: items.length,
      items,
    };
  }

  async getSchedule(id: string): Promise<FilmScheduleResponseDto> {
    const film = await this.filmsRepository.findById(id);

    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    const items = film.schedule.map(scheduleToDto);

    return {
      total: items.length,
      items,
    };
  }
}
