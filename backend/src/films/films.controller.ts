import { Controller, Get, Param } from '@nestjs/common';

import { FilmsService } from './films.service';
import { FilmScheduleResponseDto, FilmsResponseDto } from './dto/film.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  findAll(): Promise<FilmsResponseDto> {
    return this.filmsService.findAll();
  }

  @Get(':id/schedule')
  getSchedule(@Param('id') id: string): Promise<FilmScheduleResponseDto> {
    return this.filmsService.getSchedule(id);
  }
}
