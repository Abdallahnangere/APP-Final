import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'saukimart-super-secret-key-2026'
);

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ admin: true, role: 'superadmin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.admin === true;
  } catch {
    return false;
  }
}
