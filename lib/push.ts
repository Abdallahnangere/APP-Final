import { SignJWT, importPKCS8 } from 'jose';
import sql from '@/lib/db';

type CreditAlertInput = {
  userId: string;
  amount: number;
  newBalance: number;
  kind: 'deposit' | 'transfer_in' | 'admin_credit' | 'admin_cashback_credit';
  reference?: string;
  senderLabel?: string;
  note?: string;
};

type GoogleTokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

let googleTokenCache: GoogleTokenCache | null = null;

function formatNaira(amount: number): string {
  return `N${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, '\n');
}

async function getGoogleAccessToken(): Promise<string> {
  const now = Date.now();
  if (googleTokenCache && googleTokenCache.expiresAtMs > now + 60_000) {
    return googleTokenCache.accessToken;
  }

  const clientEmail = getEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = normalizePrivateKey(getEnv('FIREBASE_PRIVATE_KEY'));
  const tokenUri = process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token';

  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + 3600;

  const key = await importPKCS8(privateKey, 'RS256');
  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience(tokenUri)
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(key);

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  if (!res.ok || !data?.access_token) {
    throw new Error(`Failed to get Google access token: ${JSON.stringify(data)}`);
  }

  googleTokenCache = {
    accessToken: data.access_token as string,
    expiresAtMs: now + ((Number(data.expires_in) || 3600) * 1000),
  };

  return googleTokenCache.accessToken;
}

async function sendFcmToToken(token: string, title: string, body: string, data: Record<string, string>) {
  const projectId = getEnv('FIREBASE_PROJECT_ID');
  const accessToken = await getGoogleAccessToken();

  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token,
        notification: {
          title,
          body,
        },
        android: {
          priority: 'high',
          notification: {
            channel_id: 'credit_alerts',
            sound: 'default',
          },
        },
        data,
      },
    }),
  });

  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function deactivateToken(token: string) {
  await sql`
    UPDATE user_push_tokens
    SET is_active = FALSE, updated_at = NOW()
    WHERE token = ${token}
  `;
}

function buildCreditMessage(input: CreditAlertInput): { title: string; body: string } {
  const amountText = formatNaira(input.amount);
  const balanceText = formatNaira(input.newBalance);

  if (input.kind === 'transfer_in') {
    const from = input.senderLabel ? ` from ${input.senderLabel}` : '';
    return {
      title: 'Transfer Received',
      body: `${amountText} received${from}. New balance: ${balanceText}.`,
    };
  }

  if (input.kind === 'admin_cashback_credit') {
    return {
      title: 'Cashback Credited',
      body: `${amountText} cashback added. New cashback balance: ${balanceText}.`,
    };
  }

  if (input.kind === 'admin_credit') {
    const suffix = input.note ? ` (${input.note})` : '';
    return {
      title: 'Wallet Credited',
      body: `${amountText} admin credit received${suffix}. New balance: ${balanceText}.`,
    };
  }

  return {
    title: 'Wallet Credited',
    body: `${amountText} deposit received. New balance: ${balanceText}.`,
  };
}

export async function sendCreditAlert(input: CreditAlertInput): Promise<void> {
  const [user] = await sql`
    SELECT notifications_enabled
    FROM users
    WHERE id = ${input.userId}
    LIMIT 1
  `;

  if (!user || user.notifications_enabled === false) return;

  const tokens = await sql`
    SELECT token
    FROM user_push_tokens
    WHERE user_id = ${input.userId} AND is_active = TRUE
    ORDER BY updated_at DESC
    LIMIT 6
  `;

  if (!tokens.length) return;

  const { title, body } = buildCreditMessage(input);

  const payload = {
    type: 'credit_alert',
    kind: input.kind,
    amount: String(input.amount),
    newBalance: String(input.newBalance),
    reference: input.reference || '',
  };

  for (const row of tokens) {
    const token = String(row.token || '').trim();
    if (!token) continue;

    try {
      const result = await sendFcmToToken(token, title, body, payload);
      if (!result.ok) {
        const errorCode = result?.json?.error?.details?.[0]?.errorCode || result?.json?.error?.status || '';
        if (errorCode === 'UNREGISTERED' || errorCode === 'INVALID_ARGUMENT' || result.status === 404) {
          await deactivateToken(token);
        }
      }
    } catch (err) {
      console.error('FCM send error:', err);
    }
  }
}
