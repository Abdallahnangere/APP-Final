import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

type AdminPayload = {
  admin: boolean;
  role?: string;
  userId?: string;
};

export async function getAdminPayload(req: NextRequest): Promise<AdminPayload | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;

  const payload = await verifyToken(auth.slice(7));
  if (!payload || payload.admin !== true) return null;

  return {
    admin: true,
    role: typeof payload.role === 'string' ? payload.role : undefined,
    userId: typeof payload.userId === 'string' ? payload.userId : undefined,
  };
}

export function cleanText(value: unknown, max = 500) {
  return String(value || '').trim().slice(0, max);
}
