import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let app: INestApplication;
  let orderService: jest.Mocked<OrderService>;

  const validDto: CreateOrderDto = {
    email: 'test@test.ru',
    phone: '+79999999999',
    tickets: [
      {
        film: '5b70cb1a-61c9-47b1-b207-31f9e89087ff',
        session: '793009d6-030c-4dd4-8d13-9ba500724b38',
        row: 1,
        seat: 1,
        price: 350,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create order', async () => {
    const result: Awaited<ReturnType<OrderService['create']>> = {
      total: 1,
      items: [
        {
          id: randomUUID(),
          ...validDto.tickets[0],
        },
      ],
    };

    orderService.create.mockResolvedValue(result);

    await expect(controller.create(validDto)).resolves.toBe(result);
    expect(orderService.create).toHaveBeenCalledWith(validDto);
  });

  it('should return 400 for invalid order payload', async () => {
    await request(app.getHttpServer())
      .post('/order')
      .send({
        email: 'invalid-email',
        phone: 'bad',
        tickets: [
          {
            film: 'not-a-uuid',
            session: 'not-a-uuid',
            row: 0,
            seat: 'wrong',
            price: -1,
          },
        ],
      })
      .expect(400);

    expect(orderService.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when film is not found', async () => {
    orderService.create.mockRejectedValue(
      new NotFoundException('Film not found'),
    );

    await expect(controller.create(validDto)).rejects.toThrow(
      NotFoundException,
    );
    expect(orderService.create).toHaveBeenCalledWith(validDto);
  });

  it('should throw ConflictException when seat is already taken', async () => {
    orderService.create.mockRejectedValue(
      new ConflictException('Seat is already taken'),
    );

    await expect(controller.create(validDto)).rejects.toThrow(
      ConflictException,
    );
    expect(orderService.create).toHaveBeenCalledWith(validDto);
  });

  it('should throw BadRequestException when seat is outside of hall bounds', async () => {
    const dto: CreateOrderDto = {
      ...validDto,
      tickets: [
        {
          ...validDto.tickets[0],
          row: 999,
          seat: 999,
        },
      ],
    };

    orderService.create.mockRejectedValue(
      new BadRequestException('Seat is outside of hall bounds'),
    );

    await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    expect(orderService.create).toHaveBeenCalledWith(dto);
  });
});
