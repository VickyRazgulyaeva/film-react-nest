import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { FilmsController } from '../src/films/films.controller';
import { FilmsRepository } from '../src/films/films.repository';
import { FilmsService } from '../src/films/films.service';
import { Film } from '../src/films/entities/film.entity';
import { Schedule } from '../src/films/entities/schedule.entity';
import { OrderController } from '../src/order/order.controller';
import { OrderService } from '../src/order/order.service';

describe('Afisha API (e2e)', () => {
  let app: INestApplication;
  let filmsRepository: jest.Mocked<FilmsRepository>;

  const filmId = '0e33c7f6-27a7-4aa0-8e61-65d7e5effecf';
  const sessionId = 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce';

  const schedule = {
    id: sessionId,
    daytime: '2024-06-28T10:00:53+03:00',
    hall: 0,
    rows: 5,
    seats: 10,
    price: 350,
    taken: [],
    filmId,
  } as Schedule;

  const film = {
    id: filmId,
    rating: 2.9,
    director: 'Итан Райт',
    tags: ['Документальный'],
    image: '/bg1s.jpg',
    cover: '/bg1c.jpg',
    title: 'Архитекторы общества',
    about: 'Документальный фильм',
    description: 'Описание фильма',
    schedule: [schedule],
  } as Film;

  const orderPayload = {
    email: 'test@test.ru',
    phone: '+7 (999) 999-99-99',
    tickets: [
      {
        film: filmId,
        session: sessionId,
        daytime: schedule.daytime,
        row: 1,
        seat: 1,
        price: 350,
      },
    ],
  };

  beforeEach(async () => {
    filmsRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      bookSeats: jest.fn(),
    } as unknown as jest.Mocked<FilmsRepository>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController, OrderController],
      providers: [
        FilmsService,
        OrderService,
        {
          provide: FilmsRepository,
          useValue: filmsRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/afisha');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/afisha/films returns films list', async () => {
    filmsRepository.findAll.mockResolvedValue([film]);

    const response = await request(app.getHttpServer())
      .get('/api/afisha/films')
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({
      id: filmId,
      title: 'Архитекторы общества',
    });
  });

  it('POST /api/afisha/order creates order', async () => {
    filmsRepository.findById.mockResolvedValue(film);
    filmsRepository.bookSeats.mockResolvedValue({
      ...schedule,
      taken: ['1:1'],
    } as Schedule);

    const response = await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(orderPayload)
      .expect(201);

    expect(response.body.total).toBe(1);
    expect(response.body.items[0]).toMatchObject({
      film: filmId,
      session: sessionId,
      daytime: schedule.daytime,
      row: 1,
      seat: 1,
      price: 350,
    });

    expect(response.body.items[0].id).toEqual(expect.any(String));
  });

  it('POST /api/afisha/order rejects already taken seat', async () => {
    filmsRepository.findById.mockResolvedValue({
      ...film,
      schedule: [{ ...schedule, taken: ['1:1'] } as Schedule],
    } as Film);

    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(orderPayload)
      .expect(409);
  });

  it('POST /api/afisha/order rejects absent film', async () => {
    filmsRepository.findById.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(orderPayload)
      .expect(404);
  });

  it('POST /api/afisha/order rejects absent session', async () => {
    filmsRepository.findById.mockResolvedValue({
      ...film,
      schedule: [],
    } as Film);

    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send(orderPayload)
      .expect(404);
  });

  it('POST /api/afisha/order rejects seat outside hall bounds', async () => {
    filmsRepository.findById.mockResolvedValue(film);

    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send({
        ...orderPayload,
        tickets: [{ ...orderPayload.tickets[0], row: 6 }],
      })
      .expect(400);
  });

  it('POST /api/afisha/order rejects invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send({
        email: 'wrong-email',
        phone: 'bad',
        tickets: [
          {
            film: 'not-a-uuid',
            session: 'not-a-uuid',
            row: 0,
            seat: 0,
            price: -1,
          },
        ],
      })
      .expect(400);
  });
});
