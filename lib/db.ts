import { neon } from '@neondatabase/serverless';

type SqlClient = {
  <T = Record<string, any>>(queryOrTemplate: TemplateStringsArray | string, ...values: unknown[]): Promise<T[]>;
};

function getSqlClient(): SqlClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  return neon(databaseUrl) as unknown as SqlClient;
}

const sql: SqlClient = (queryOrTemplate, ...values) => getSqlClient()(queryOrTemplate, ...values);

export default sql;

type QueryResult<T> = {
  rows: T[];
  rowCount: number;
};

export const db = {
  async query<T = Record<string, any>>(text: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const execute = getSqlClient() as unknown as (queryText: string, queryParams?: unknown[]) => Promise<T[]>;
    const rows = await execute(text, params);
    return {
      rows,
      rowCount: rows.length,
    };
  },
};

async function seedDefaultDataPlans() {
  await sql`
    WITH seeded(network, network_id, plan_id, data_size, validity, selling_price, cost_price) AS (
      VALUES
        ('MTN', 1, 5000, '500MB', '30 days', 299.00, 299.00),
        ('MTN', 1, 1001, '1GB', '30 days', 429.00, 429.00),
        ('MTN', 1, 6666, '2GB', '30 days', 849.00, 849.00),
        ('MTN', 1, 3333, '3GB', '30 days', 1329.00, 1329.00),
        ('MTN', 1, 9999, '5GB', '30 days', 1799.00, 1799.00),
        ('MTN', 1, 7777, '7GB', '30 days', 2499.00, 2499.00),
        ('MTN', 1, 1110, '10GB', '30 days', 3899.00, 3899.00),
        ('MTN', 1, 1515, '15GB', '30 days', 5690.00, 5690.00),
        ('MTN', 1, 424, '20GB', '30 days', 7899.00, 7899.00),
        ('MTN', 1, 379, '36GB', '30 days', 11900.00, 11900.00),
        ('MTN', 1, 360, '75GB', '30 days', 18990.00, 18990.00),
        ('GLO', 2, 218, '200MB', '30 days', 99.00, 99.00),
        ('GLO', 2, 217, '500MB', '30 days', 199.00, 199.00),
        ('GLO', 2, 206, '1GB', '30 days', 399.00, 399.00),
        ('GLO', 2, 195, '2GB', '30 days', 799.00, 799.00),
        ('GLO', 2, 196, '3GB', '30 days', 1199.00, 1199.00),
        ('GLO', 2, 222, '5GB', '30 days', 1999.00, 1999.00),
        ('GLO', 2, 512, '10GB', '30 days', 3990.00, 3990.00),
        ('AIRTEL', 4, 539, '500MB', '7 days', 549.00, 549.00),
        ('AIRTEL', 4, 400, '1GB', '30 days', 764.00, 764.00),
        ('AIRTEL', 4, 401, '2GB', '30 days', 1430.00, 1430.00),
        ('AIRTEL', 4, 532, '3GB', '30 days', 1950.00, 1950.00),
        ('AIRTEL', 4, 391, '4GB', '30 days', 2419.00, 2419.00),
        ('AIRTEL', 4, 392, '10GB', '30 days', 3899.00, 3899.00),
        ('AIRTEL', 4, 405, '18GB', '30 days', 6450.00, 6450.00),
        ('AIRTEL', 4, 404, '25GB', '30 days', 8499.00, 8499.00)
    ),
    updated AS (
      UPDATE data_plans AS dp
      SET
        network = s.network,
        data_size = s.data_size,
        validity = s.validity,
        selling_price = s.selling_price,
        cost_price = s.cost_price,
        is_active = TRUE
      FROM seeded AS s
      WHERE dp.network_id = s.network_id AND dp.plan_id = s.plan_id
      RETURNING dp.network_id, dp.plan_id
    )
    INSERT INTO data_plans (network, network_id, plan_id, data_size, validity, selling_price, cost_price, is_active)
    SELECT s.network, s.network_id, s.plan_id, s.data_size, s.validity, s.selling_price, s.cost_price, TRUE
    FROM seeded AS s
    LEFT JOIN updated AS u ON u.network_id = s.network_id AND u.plan_id = s.plan_id
    WHERE u.network_id IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM data_plans AS dp
        WHERE dp.network_id = s.network_id AND dp.plan_id = s.plan_id
      );
  `;
}

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      pin_hash TEXT NOT NULL,
      wallet_balance NUMERIC(12,2) DEFAULT 0,
      cashback_balance NUMERIC(12,2) DEFAULT 0,
      referral_bonus NUMERIC(12,2) DEFAULT 0,
      flw_account_number TEXT,
      flw_bank_name TEXT,
      flw_account_reference TEXT,
      flw_order_ref TEXT,
      is_banned BOOLEAN DEFAULT FALSE,
      notifications_enabled BOOLEAN DEFAULT TRUE,
      haptics_enabled BOOLEAN DEFAULT TRUE,
      theme TEXT DEFAULT 'light',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS data_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      network TEXT NOT NULL,
      network_id INTEGER NOT NULL,
      plan_id INTEGER NOT NULL,
      data_size TEXT NOT NULL,
      validity TEXT NOT NULL,
      selling_price NUMERIC(10,2) NOT NULL,
      cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL,
      cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
      image_url TEXT,
      image_base64 TEXT,
      category TEXT DEFAULT 'General',
      in_stock BOOLEAN DEFAULT TRUE,
      shipping_terms TEXT,
      pickup_terms TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      description TEXT,
      amount NUMERIC(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      network TEXT,
      plan_id INTEGER,
      phone_number TEXT,
      product_id UUID,
      product_name TEXT,
      amigo_reference TEXT,
      idempotency_key TEXT UNIQUE,
      receipt_data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      flw_transaction_id TEXT UNIQUE,
      flw_ref TEXT,
      amount NUMERIC(10,2) NOT NULL,
      sender_name TEXT,
      sender_account TEXT,
      narration TEXT,
      status TEXT DEFAULT 'success',
      raw_webhook JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS broadcasts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sim_activations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      serial_number TEXT,
      front_image_url TEXT,
      back_image_url TEXT,
      status TEXT DEFAULT 'under_review',
      amount NUMERIC(10,2) DEFAULT 5000,
      admin_note TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'ai', -- ai, needs_agent, agent_active, resolved, flagged
      agent_required BOOLEAN DEFAULT FALSE,
      agent_id UUID,
      is_typing BOOLEAN DEFAULT FALSE,
      typing_updated_at TIMESTAMPTZ DEFAULT NOW(),
      abusive_warned BOOLEAN DEFAULT FALSE,
      last_message TEXT,
      last_activity TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
      created_by TEXT,
      note TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Backfill schema for old chats (new columns for improved chat features)
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_base64') THEN
        ALTER TABLE products ADD COLUMN image_base64 TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chats' AND column_name='session_id') THEN
        ALTER TABLE chats ADD COLUMN session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chats' AND column_name='delivered_at') THEN
        ALTER TABLE chats ADD COLUMN delivered_at TIMESTAMPTZ;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chats' AND column_name='read_at') THEN
        ALTER TABLE chats ADD COLUMN read_at TIMESTAMPTZ;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS webhooks_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event TEXT,
      payload JSONB,
      processed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS deposits_webhook_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flw_transaction_id TEXT,
      status TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_push_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      platform TEXT DEFAULT 'android',
      app_version TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO site_settings (key, value) VALUES
      ('maintenance_mode', 'false'),
      ('registration_open', 'true'),
      ('app_name', 'SaukiMart'),
      ('support_phone1', '+2347044647081'),
      ('support_phone2', '+2348061934056'),
      ('support_email', 'support@saukimart.online')
    ON CONFLICT (key) DO NOTHING;
  `;

  const { ensureEarnSchema } = await import('@/lib/earn');
  await seedDefaultDataPlans();
  await ensureEarnSchema();
}
