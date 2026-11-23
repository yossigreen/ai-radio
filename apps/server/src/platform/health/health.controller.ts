import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';

interface HealthResponse {
  status: 'ok';
  checks: { database: 'up' };
}

@Controller('health')
export class HealthController {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  @Get()
  async check(): Promise<HealthResponse> {
    try {
      await this.pool.query('select 1');
    } catch {
      throw new ServiceUnavailableException({ status: 'error', checks: { database: 'down' } });
    }
    return { status: 'ok', checks: { database: 'up' } };
  }
}
