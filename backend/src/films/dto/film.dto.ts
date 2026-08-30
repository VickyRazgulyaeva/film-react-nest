export class ScheduleDto {
  id: string;
  daytime: string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string;
  image: string;
  cover: string;
  title: string;
  about: string;
  description: string;
  schedule: ScheduleDto[];
}

export class FilmsResponseDto {
  total: number;
  items: FilmDto[];
}

export class FilmScheduleResponseDto {
  total: number;
  items: ScheduleDto[];
}
