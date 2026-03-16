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

    INSERT INTO site_settings (key, value) VALUES
      ('maintenance_mode', 'false'),
      ('registration_open', 'true'),
      ('app_name', 'SaukiMart'),
      ('support_phone1', '+2347044647081'),
      ('support_phone2', '+2348061934056'),
      ('support_email', 'support@saukimart.online')
    ON CONFLICT (key) DO NOTHING;
  `;
}
