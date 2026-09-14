import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

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
  });

  it('should create order', async () => {
    const dto: CreateOrderDto = {
      email: 'test@test.ru',
      phone: '+79999999999',
      tickets: [
        {
          film: 'film-id',
          session: 'session-id',
          row: 1,
          seat: 1,
          price: 350,
        },
      ],
    };

    const result = {
      total: 1,
      items: [
        {
          id: randomUUID(),
          ...dto.tickets[0],
        },
      ],
    };

    orderService.create.mockResolvedValue(result);

    await expect(controller.create(dto)).resolves.toBe(result);
    expect(orderService.create).toHaveBeenCalledWith(dto);
  });
});
