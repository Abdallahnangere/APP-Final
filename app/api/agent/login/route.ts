
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyPin } from '../../../../lib/security';
import { AgentLoginSchema, validateRequestBody } from '../../../../lib/validation';
import { logger } from '../../../../lib/logger';
import { loginLimiter } from '../../../../lib/rate-limit';

export async function POST(req: Request) {
  let phone = '';
  const endLog = logger.logApiRequest('AUTH', 'AGENT_LOGIN');

  try {
    const body = await req.json();

    // Validate request body against schema
    const validation = await validateRequestBody(body, AgentLoginSchema);
    if (!validation.valid) {
      const errors = validation.errors.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      logger.logSecurityEvent('INVALID_REQUEST', { service: 'LOGIN', errors });
      endLog(400, { error: 'Validation failed' });
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { phone: validPhone, pin } = validation.data;
    phone = validPhone;

    // Check rate limit
    if (!loginLimiter.check(phone)) {
      const info = loginLimiter.getInfo(phone);
      logger.logSecurityEvent('RATE_LIMITED', { phone, resetTime: info.resetTime });
      endLog(429, { error: 'Too many attempts' });
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((info.resetTime - Date.now()) / 1000)) } }
      );
    }

    const agent = await prisma.agent.findUnique({ where: { phone } });

    if (!agent) {
        logger.logAuth('LOGIN', phone, false, { reason: 'Agent not found' });
        logger.logSecurityEvent('INVALID_REQUEST', { phone, reason: 'No such agent' });
        endLog(401, { error: 'Invalid credentials' });
        return NextResponse.json({ error: 'Invalid Phone or PIN' }, { status: 401 });
    }

    // Verify PIN against hash
    const isPinValid = await verifyPin(pin, agent.pin);
    if (!isPinValid) {
        logger.logAuth('LOGIN', phone, false, { reason: 'Invalid PIN' });
        logger.logSecurityEvent('INVALID_REQUEST', { phone, reason: 'PIN mismatch' });
        endLog(401, { error: 'Invalid PIN' });
        return NextResponse.json({ error: 'Invalid Phone or PIN' }, { status: 401 });
    }

    // On successful login, reset rate limit
    loginLimiter.reset(phone);
    logger.logAuth('LOGIN', phone, true);
    endLog(200, { agentId: agent.id, success: true });
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    logger.logError('AUTH', 'AGENT_LOGIN', error as Error, { phone });
    endLog(500, { error: 'Internal error' });
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
