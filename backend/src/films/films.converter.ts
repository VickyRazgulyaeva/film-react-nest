import { Film } from './schemas/film.schema';
import { FilmDto, ScheduleDto } from './dto/film.dto';

export function scheduleToDto(schedule): ScheduleDto {
  return {
    id: schedule.id,
    daytime: schedule.daytime,
    hall: schedule.hall,
    rows: schedule.rows,
    seats: schedule.seats,
    price: schedule.price,
    taken: schedule.taken,
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
