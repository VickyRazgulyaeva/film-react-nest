// import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { FilmsRepository } from '../films/films.repository';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async create(dto: CreateOrderDto) {
    if (!dto.tickets?.length) {
      throw new BadRequestException('Tickets are required');
    }

    const firstTicket = dto.tickets[0];
    const filmId = firstTicket.film;
    const sessionId = firstTicket.session;

    const isSameSession = dto.tickets.every(
      (ticket) => ticket.film === filmId && ticket.session === sessionId,
    );

    if (!isSameSession) {
      throw new BadRequestException('All tickets must be for one film session');
    }

    const seats = dto.tickets.map((ticket) => `${ticket.row}:${ticket.seat}`);

    if (new Set(seats).size !== seats.length) {
      throw new ConflictException('Seat is duplicated in order');
    }

    const film = await this.filmsRepository.findById(filmId);

    if (!film) {
      throw new NotFoundException('Film not found');
    }

    const session = film.schedule.find((item) => item.id === sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const hasSeatOutsideHall = dto.tickets.some(
      (ticket) =>
        ticket.row < 1 ||
        ticket.row > session.rows ||
        ticket.seat < 1 ||
        ticket.seat > session.seats,
    );

    if (hasSeatOutsideHall) {
      throw new BadRequestException('Seat is outside of hall bounds');
    }

    const taken = session.taken ?? [];
    const alreadyTaken = seats.some((seat) => taken.includes(seat));

    if (alreadyTaken) {
      throw new ConflictException('Seat is already taken');
    }

    const bookedSession = await this.filmsRepository.bookSeats(
      filmId,
      sessionId,
      seats,
    );

    if (!bookedSession) {
      throw new ConflictException('Seat is already taken');
    }

    return {
      total: dto.tickets.length,
      items: dto.tickets.map((ticket) => ({
        film: ticket.film,
        session: ticket.session,
        row: ticket.row,
        seat: ticket.seat,
        price: ticket.price,
      })),
    };
  }
}
