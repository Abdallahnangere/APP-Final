// app/api/agent/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPin } from '@/lib/auth';
import { createVirtualAccount } from '@/lib/flutterwave';
import { registerLimiter } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';

const RegisterSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  pin: z.string().regex(/^[0-9]{4}$/),
});

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request', errors: parsed.error.errors }, { status: 400 });
    }

    const { firstName, lastName, phone, pin } = parsed.data;

    // Rate limiting
    const rl = registerLimiter(phone);
    if (!rl.allowed) {
      logger.warn('AUTH', 'RATE_LIMITED', { phone, action: 'REGISTER' });
      return NextResponse.json(
        { message: `Too many registrations. Retry after ${rl.retryAfter} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    // Check if agent exists
    const existing = await prisma.agent.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ message: 'Phone number already registered' }, { status: 409 });
    }

    // Hash PIN
    const hashedPin = await hashPin(pin);

    // Create Flutterwave virtual account
    let flwData: any = {};
    try {
      const { v4: uuidv4 } = await import('uuid');
      const flwResponse = await createVirtualAccount({
        tx_ref: `AGENT-REG-${uuidv4()}`,
        phone,
        firstName,
        lastName,
      });
      if (flwResponse?.data) {
        flwData = {
          flwAccountNumber: flwResponse.data.account_number,
          flwAccountName: flwResponse.data.account_name,
          flwBankName: flwResponse.data.bank_name,
        };
      }
    } catch (flwErr: any) {
      logger.warn('AUTH', 'FLW_VIRTUAL_ACCOUNT_FAILED', { phone, error: flwErr.message });
      // Non-fatal — agent still created without virtual account
    }

    // Create agent
    const agent = await prisma.agent.create({
      data: { firstName, lastName, phone, pin: hashedPin, ...flwData },
      select: {
        id: true, firstName: true, lastName: true, phone: true,
        balance: true, cashbackBalance: true, totalCashbackEarned: true,
        isActive: true, flwAccountNumber: true, flwAccountName: true, flwBankName: true,
        createdAt: true,
      },
    });

    logger.info('AUTH', 'REGISTER', { phone, userId: agent.id, duration: Date.now() - start });

    return NextResponse.json({ success: true, agent }, { status: 201 });
  } catch (err: any) {
    logger.error('AUTH', 'REGISTER_ERROR', { error: err.message });
    return NextResponse.json({ message: 'Registration failed', error: err.message }, { status: 500 });
  }
}
