import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Film[]> {
    return this.filmRepository.find({
      relations: {
        schedule: true,
      },
    });
  }

  async findById(id: string): Promise<Film | null> {
    return this.filmRepository.findOne({
      where: { id },
      relations: {
        schedule: true,
      },
    });
  }

  async bookSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<Schedule | null> {
    return this.dataSource.transaction(async (manager) => {
      const schedule = await manager
        .getRepository(Schedule)
        .createQueryBuilder('schedule')
        .setLock('pessimistic_write')
        .where('schedule.id = :sessionId', { sessionId })
        .andWhere('schedule.filmId = :filmId', { filmId })
        .getOne();

      if (!schedule) {
        return null;
      }

      const taken = schedule.taken ?? [];
      const alreadyTaken = seats.some((seat) => taken.includes(seat));

      if (alreadyTaken) {
        return null;
      }

      schedule.taken = [...taken, ...seats];

      return manager.getRepository(Schedule).save(schedule);
    });
  }
}
