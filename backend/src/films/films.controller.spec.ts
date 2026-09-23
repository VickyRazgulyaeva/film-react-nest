import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: jest.Mocked<FilmsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: {
            findAll: jest.fn(),
            getSchedule: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    filmsService = module.get(FilmsService);
  });

  it('should return films list', async () => {
    const result = {
      total: 1,
      items: [
        {
          id: 'film-id',
          rating: 8,
          director: 'Director',
          tags: ['tag'],
          image: 'image.jpg',
          cover: 'cover.jpg',
          title: 'Film title',
          about: 'About',
          description: 'Description',
          schedule: [],
        },
      ],
    };

    filmsService.findAll.mockResolvedValue(result);

    await expect(controller.findAll()).resolves.toBe(result);
    expect(filmsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return film schedule', async () => {
    const result = {
      total: 1,
      items: [
        {
          id: 'session-id',
          daytime: '10:00',
          hall: 1,
          rows: 10,
          seats: 20,
          price: 350,
          taken: [],
        },
      ],
    };

    filmsService.getSchedule.mockResolvedValue(result);

    await expect(controller.getSchedule('film-id')).resolves.toBe(result);
    expect(filmsService.getSchedule).toHaveBeenCalledWith('film-id');
  });
});
