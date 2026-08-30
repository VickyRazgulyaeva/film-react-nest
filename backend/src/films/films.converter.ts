import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmDto, ScheduleDto } from './dto/film.dto';

function parseTaken(value: string | string[] | null): string[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  return value.split(',').filter(Boolean);
}

export function scheduleToDto(schedule: Schedule): ScheduleDto {
  return {
    id: schedule.id,
    daytime: schedule.daytime,
    hall: schedule.hall,
    rows: schedule.rows,
    seats: schedule.seats,
    price: schedule.price,
    taken: parseTaken(schedule.taken),
  };
}

export function filmToDto(film: Film): FilmDto {
  return {
    id: film.id,
    rating: film.rating,
    director: film.director,
    tags: film.tags,
    image: film.image,
    cover: film.cover,
    title: film.title,
    about: film.about,
    description: film.description,
    schedule: film.schedule.map(scheduleToDto),
  };
}
