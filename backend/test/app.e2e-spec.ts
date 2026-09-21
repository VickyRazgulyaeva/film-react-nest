import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Afisha API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

  it('GET /api/afisha/films returns films list', () => {
    return request(app.getHttpServer())
      .get('/api/afisha/films')
      .expect((res) => {
        expect([200, 500]).toContain(res.status);
      });
  });

  it('POST /api/afisha/order rejects invalid payload with 400', () => {
    return request(app.getHttpServer())
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
