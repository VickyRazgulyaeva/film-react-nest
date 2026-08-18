import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Film, FilmDocument } from './schemas/film.schema';

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
  ) {}

  async findAll(): Promise<Film[]> {
    return this.filmModel.find().lean();
  }

  async findById(id: string): Promise<Film | null> {
    return this.filmModel.findOne({ id }).lean();
  }

  async bookSeats(
    filmId: string,
    sessionId: string,
    seats: string[],
  ): Promise<Film | null> {
    return this.filmModel
      .findOneAndUpdate(
        {
          id: filmId,
          schedule: {
            $elemMatch: {
              id: sessionId,
              taken: { $nin: seats },
            },
          },
        },
        {
          $addToSet: {
            'schedule.$.taken': { $each: seats },
          },
        },
        { new: true },
      )
      .lean();
  }
}
