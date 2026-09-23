import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FilmsRepository } from '../films/films.repository';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let filmsRepository: jest.Mocked<FilmsRepository>;

  const filmId = '5b70cb1a-61c9-47b1-b207-31f9e89087ff';
  const sessionId = '793009d6-030c-4dd4-8d13-9ba500724b38';

  const session = {
    id: sessionId,
    rows: 5,
    seats: 10,
    taken: [],
  } as Schedule;

  const film = {
    id: filmId,
    schedule: [session],
  } as Film;

  const dto: CreateOrderDto = {
    email: 'test@test.ru',
    phone: '+79999999999',
    tickets: [
      {
        film: filmId,
        session: sessionId,
        daytime: '2024-06-28T10:00:53+03:00',
        row: 1,
        seat: 1,
        price: 350,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: FilmsRepository,
          useValue: {
            findById: jest.fn(),
            bookSeats: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    filmsRepository = module.get(FilmsRepository);

    filmsRepository.findById.mockResolvedValue(film);
    filmsRepository.bookSeats.mockResolvedValue(session);
  });

  it('should create order', async () => {
    await expect(service.create(dto)).resolves.toMatchObject({
      total: 1,
      items: [
        {
          id: expect.any(String),
          film: filmId,
          session: sessionId,
          daytime: '2024-06-28T10:00:53+03:00',
          row: 1,
          seat: 1,
          price: 350,
        },
      ],
    });

    expect(filmsRepository.bookSeats).toHaveBeenCalledWith(filmId, sessionId, [
      '1:1',
    ]);
  });

  it('should reject order without tickets', async () => {
    await expect(
      service.create({ ...dto, tickets: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(filmsRepository.findById).not.toHaveBeenCalled();
  });

  it('should reject tickets from different sessions', async () => {
    await expect(
      service.create({
        ...dto,
        tickets: [
          dto.tickets[0],
          {
            ...dto.tickets[0],
            session: '27a6c145-d5bf-4722-8bd9-b58c5b6b718f',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject duplicated seats in one order', async () => {
    await expect(
      service.create({
        ...dto,
        tickets: [dto.tickets[0], dto.tickets[0]],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should reject absent film', async () => {
    filmsRepository.findById.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reject absent session', async () => {
    filmsRepository.findById.mockResolvedValue({
      ...film,
      schedule: [],
    } as Film);

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reject already taken seat', async () => {
    filmsRepository.findById.mockResolvedValue({
      ...film,
      schedule: [{ ...session, taken: ['1:1'] } as Schedule],
    } as Film);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('should reject row outside of hall bounds', async () => {
    await expect(
      service.create({
        ...dto,
        tickets: [{ ...dto.tickets[0], row: 6 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(filmsRepository.bookSeats).not.toHaveBeenCalled();
  });

  it('should reject seat outside of hall bounds', async () => {
    await expect(
      service.create({
        ...dto,
        tickets: [{ ...dto.tickets[0], seat: 11 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(filmsRepository.bookSeats).not.toHaveBeenCalled();
  });

  it('should reject booking conflict from repository', async () => {
    filmsRepository.bookSeats.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });
});
