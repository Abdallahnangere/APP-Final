// app/api/agent/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPin } from '@/lib/auth';
import { loginLimiter, resetLoginLimiter } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';

const LoginSchema = z.object({
  phone: z.string().regex(/^[0-9]{10,11}$/),
  pin: z.string().regex(/^[0-9]{4}$/),
});

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    const { phone, pin } = parsed.data;

    // Rate limiting
    const rl = loginLimiter(phone);
    if (!rl.allowed) {
      logger.warn('AUTH', 'RATE_LIMITED', { phone, action: 'LOGIN' });
      return NextResponse.json(
        { message: `Too many attempts. Retry after ${rl.retryAfter} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const agent = await prisma.agent.findUnique({ where: { phone } });
    if (!agent) {
      logger.warn('AUTH', 'AUTHENTICATION_FAILED', { phone, reason: 'not_found' });
      return NextResponse.json({ message: 'Invalid phone number or PIN' }, { status: 401 });
    }

    if (!agent.isActive) {
      return NextResponse.json({ message: 'Account suspended. Contact support.' }, { status: 403 });
    }

    const pinValid = await verifyPin(pin, agent.pin);
    if (!pinValid) {
      logger.warn('AUTH', 'AUTHENTICATION_FAILED', { phone, reason: 'wrong_pin' });
      return NextResponse.json({ message: 'Invalid phone number or PIN' }, { status: 401 });
    }

    // Reset rate limiter on success
    resetLoginLimiter(phone);

    logger.info('AUTH', 'LOGIN', { phone, userId: agent.id, duration: Date.now() - start });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        phone: agent.phone,
        balance: agent.balance,
        cashbackBalance: agent.cashbackBalance,
        totalCashbackEarned: agent.totalCashbackEarned,
        cashbackRedeemed: agent.cashbackRedeemed,
        isActive: agent.isActive,
        flwAccountNumber: agent.flwAccountNumber,
        flwAccountName: agent.flwAccountName,
        flwBankName: agent.flwBankName,
        createdAt: agent.createdAt,
      },
    });
  } catch (err: any) {
    logger.error('AUTH', 'LOGIN_ERROR', { error: err.message });
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}
