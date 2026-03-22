import { NextRequest } from 'next/server';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export type DeveloperKeyRecord = {
  id: string;
  user_id: string;
  key_prefix: string;
  key_hash: string;
  is_active: boolean;
};

export type DeveloperUser = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  wallet_balance: string;
  is_developer: boolean;
  developer_discount_percent: string | number;
  notifications_enabled: boolean;
  is_banned: boolean;
};

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

export function generateDeveloperApiKey() {
  const prefix = randomBytes(6).toString('hex');
  const secret = randomBytes(24).toString('hex');
  const fullKey = `sm_live_${prefix}_${secret}`;
  const keyHash = hashApiKey(fullKey);
  return {
    fullKey,
    keyPrefix: prefix,
    keyLast4: fullKey.slice(-4),
    keyHash,
  };
}

export async function createAndStoreDeveloperKey(userId: string) {
  const generated = generateDeveloperApiKey();

  const [inserted] = await sql`
    INSERT INTO developer_api_keys (
      user_id, key_prefix, key_hash, key_last4, is_active, created_at, updated_at
    )
    VALUES (
      ${userId}, ${generated.keyPrefix}, ${generated.keyHash}, ${generated.keyLast4}, TRUE, NOW(), NOW()
    )
    RETURNING id, key_prefix, key_last4, created_at
  `;

  return {
    id: inserted.id as string,
    keyPrefix: inserted.key_prefix as string,
    keyLast4: inserted.key_last4 as string,
    createdAt: inserted.created_at as string,
    fullKey: generated.fullKey,
  };
}

export async function requireAppUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return null;

  const [user] = await sql`
    SELECT id, first_name, last_name, phone, wallet_balance, is_developer,
           developer_discount_percent, notifications_enabled, is_banned
    FROM users
    WHERE id = ${payload.userId as string}
    LIMIT 1
  `;

  return (user || null) as DeveloperUser | null;
}

export async function requireDeveloperByApiKey(req: NextRequest) {
  const xApiKey = req.headers.get('x-api-key')?.trim();
  const authBearer = req.headers.get('authorization');
  const bearerKey = authBearer?.startsWith('Bearer ') ? authBearer.slice(7).trim() : '';
  const rawKey = xApiKey || bearerKey;
  if (!rawKey || !rawKey.startsWith('sm_live_')) return null;

  const parts = rawKey.split('_');
  if (parts.length < 4) return null;

  const keyPrefix = parts[2];
  const keyHash = hashApiKey(rawKey);

  const rows = await sql`
    SELECT
      k.id as key_id,
      k.user_id,
      k.key_hash,
      k.is_active,
      u.id,
      u.first_name,
      u.last_name,
      u.phone,
      u.wallet_balance,
      u.is_developer,
      u.developer_discount_percent,
      u.notifications_enabled,
      u.is_banned
    FROM developer_api_keys k
    JOIN users u ON u.id = k.user_id
    WHERE k.key_prefix = ${keyPrefix}
      AND k.is_active = TRUE
      AND u.is_developer = TRUE
      AND u.is_banned = FALSE
    LIMIT 5
  `;

  const matched = rows.find((r) => {
    const stored = Buffer.from(String(r.key_hash || ''), 'utf8');
    const computed = Buffer.from(keyHash, 'utf8');
    return stored.length === computed.length && timingSafeEqual(stored, computed);
  });

  if (!matched) return null;

  await sql`
    UPDATE developer_api_keys
    SET last_used_at = NOW(), updated_at = NOW()
    WHERE id = ${matched.key_id as string}
  `;

  return {
    user: {
      id: matched.id as string,
      first_name: matched.first_name as string,
      last_name: matched.last_name as string,
      phone: matched.phone as string,
      wallet_balance: matched.wallet_balance as string,
      is_developer: matched.is_developer as boolean,
      developer_discount_percent: matched.developer_discount_percent as string | number,
      notifications_enabled: matched.notifications_enabled as boolean,
      is_banned: matched.is_banned as boolean,
    } as DeveloperUser,
    keyId: matched.key_id as string,
    userId: matched.user_id as string,
    keyPrefix,
  };
}
