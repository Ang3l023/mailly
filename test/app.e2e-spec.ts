import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import 'dotenv/config';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return status 200', async () => {
      await request(app.getHttpServer()).get('/health').expect(200);
    });

    it('should return "Hello World!"', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.text).toBe('Hello World!');
    });

    it('should return "Hello World!" and status 200', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect('Hello World!');
    });
  });
});
