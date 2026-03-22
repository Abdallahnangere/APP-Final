import { NextRequest } from 'next/server';
import { createHash, createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'crypto';
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

function getDeveloperKeySecret(): string {
  const secret = process.env.DEVELOPER_KEY_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('Missing DEVELOPER_KEY_ENCRYPTION_SECRET (or NEXTAUTH_SECRET fallback)');
  }
  return secret;
}

function encryptDeveloperKey(rawKey: string): string {
  const key = createHash('sha256').update(getDeveloperKeySecret()).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(rawKey, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptDeveloperKey(payload: string | null | undefined): string | null {
  if (!payload) return null;
  const parts = String(payload).split(':');
  if (parts.length !== 3) return null;

  const [ivHex, tagHex, encryptedHex] = parts;
  const key = createHash('sha256').update(getDeveloperKeySecret()).digest();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  try {
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

async function ensureDeveloperKeySchema() {
  await sql`ALTER TABLE developer_api_keys ADD COLUMN IF NOT EXISTS encrypted_key TEXT`;
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
  await ensureDeveloperKeySchema();
  const generated = generateDeveloperApiKey();
  const encryptedKey = encryptDeveloperKey(generated.fullKey);

  const [inserted] = await sql`
    INSERT INTO developer_api_keys (
      user_id, key_prefix, key_hash, key_last4, encrypted_key, is_active, created_at, updated_at
    )
    VALUES (
      ${userId}, ${generated.keyPrefix}, ${generated.keyHash}, ${generated.keyLast4}, ${encryptedKey}, TRUE, NOW(), NOW()
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

export async function getActiveDeveloperKeyFullValue(userId: string): Promise<string | null> {
  await ensureDeveloperKeySchema();

  const [row] = await sql`
    SELECT encrypted_key
    FROM developer_api_keys
    WHERE user_id = ${userId} AND is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return decryptDeveloperKey((row?.encrypted_key as string | null | undefined) || null);
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
