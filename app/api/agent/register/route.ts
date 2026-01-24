
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { hashPin } from '../../../../lib/security';
import { AgentRegisterSchema, validateRequestBody } from '../../../../lib/validation';
import { logger } from '../../../../lib/logger';
import { registerLimiter } from '../../../../lib/rate-limit';

export async function POST(req: Request) {
  let phone = '';
  const endLog = logger.logApiRequest('AUTH', 'AGENT_REGISTER');

  try {
    const body = await req.json();

    // Validate request body against schema
    const validation = await validateRequestBody(body, AgentRegisterSchema);
    if (!validation.valid) {
      const errors = validation.errors.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      logger.logSecurityEvent('INVALID_REQUEST', { service: 'REGISTER', errors });
      endLog(400, { error: 'Validation failed' });
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { firstName, lastName, phone: validPhone, pin } = validation.data;
    phone = validPhone;

    // Check rate limit
    if (!registerLimiter.check(phone)) {
      const info = registerLimiter.getInfo(phone);
      logger.logSecurityEvent('RATE_LIMITED', { phone, action: 'REGISTER', resetTime: info.resetTime });
      endLog(429, { error: 'Too many registration attempts' });
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((info.resetTime - Date.now()) / 1000)) } }
      );
    }

    // Check if agent exists
    const existing = await prisma.agent.findUnique({ where: { phone } });
    if (existing) {
        logger.logAuth('REGISTER', phone, false, { reason: 'Phone already registered' });
        endLog(400, { error: 'Agent already exists' });
        return NextResponse.json({ error: 'Agent with this phone number already exists' }, { status: 400 });
    }

    // Hash PIN before storage
    let hashedPin: string;
    try {
      hashedPin = await hashPin(pin);
    } catch (hashError) {
      logger.logError('SECURITY', 'PIN_HASHING', hashError as Error, { phone });
      endLog(500, { error: 'Hash failed' });
      return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
    }

    // Create Virtual Account on Flutterwave
    const tx_ref = `AGENT-REG-${uuidv4()}`;
    const email = `agent.${phone}@www.saukimart.online`; // Generate synthetic email for agent
    
    // Using environment BVN as requested
    const bvn = process.env.MY_BVN; 

    if (!process.env.FLUTTERWAVE_SECRET_KEY || !bvn) {
        logger.logCritical('AGENT_REGISTER', new Error('Missing server configuration'), { phone });
        endLog(500, { error: 'Server misconfiguration' });
        return NextResponse.json({ error: 'Server misconfiguration: Missing Keys' }, { status: 500 });
    }

    let flwAccount = { account_number: '', bank_name: '', account_name: '' };

    try {
        const flwRes = await axios.post(
            'https://api.flutterwave.com/v3/virtual-account-numbers',
            {
                email,
                is_permanent: true,
                bvn, 
                tx_ref,
                phonenumber: phone,
                firstname: firstName,
                lastname: `${lastName} Sauki Mart FLW`, // Appending branding as requested
                narration: `Sauki Agent ${firstName}`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (flwRes.data.status === 'success') {
            flwAccount = {
                account_number: flwRes.data.data.account_number,
                bank_name: flwRes.data.data.bank_name,
                account_name: `${firstName} ${lastName} Sauki Mart FLW` // Fallback/Expected name
            };
        } else {
            throw new Error(flwRes.data.message);
        }
    } catch (flwError: any) {
        logger.logError('PAYMENT', 'FLW_ACCOUNT_CREATION', flwError as Error, { phone });
        endLog(502, { error: 'FLW failed' });
        return NextResponse.json({ error: 'Failed to provision banking wallet. Please try again later.' }, { status: 502 });
    }

    const agent = await prisma.agent.create({
        data: {
            firstName,
            lastName,
            phone,
            pin: hashedPin, // Store hashed PIN instead of plain text
            flwAccountNumber: flwAccount.account_number,
            flwBankName: flwAccount.bank_name,
            flwAccountName: flwAccount.account_name,
            balance: 0
        }
    });

    logger.logAuth('REGISTER', phone, true);
    endLog(200, { agentId: agent.id, success: true });
    return NextResponse.json({ success: true, agent });

  } catch (error: any) {
    logger.logError('AUTH', 'AGENT_REGISTER', error as Error, { phone });
    endLog(500, { error: 'Registration failed' });
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
