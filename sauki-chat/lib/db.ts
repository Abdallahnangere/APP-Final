import { Pool } from 'pg';

const globalForDb = globalThis as unknown as { pool: Pool };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export const db = {
  query: <T = Record<string, unknown>>(
    text: string,
    params?: unknown[]
  ): Promise<{ rows: T[]; rowCount: number | null }> => pool.query(text, params),
};
