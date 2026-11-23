import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ApiModule } from '../../api.module';
import { testDatabaseUrl } from '../../testing/test-database';
import { createPool } from '../database/create-pool';
import { DATABASE_POOL } from '../database/database.module';

async function createApp(databaseUrl: string): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({ imports: [ApiModule] })
    .overrideProvider(DATABASE_POOL)
    .useValue(createPool(databaseUrl))
    .compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  await app.init();
  return app;
}

describe('GET /health', () => {
  it('reports the database as up when Postgres is reachable', async () => {
    const app = await createApp(testDatabaseUrl());
    await request(app.getHttpServer())
      .get('/health')
      .expect(200, { status: 'ok', checks: { database: 'up' } });
    await app.close();
  });

  it('returns 503 when Postgres is unreachable', async () => {
    // Port 1 has nothing listening, so the connection is refused immediately.
    const app = await createApp('postgres://user:pass@127.0.0.1:1/db');
    const response = await request(app.getHttpServer()).get('/health').expect(503);
    expect(response.body).toMatchObject({ checks: { database: 'down' } });
    await app.close();
  });
});
