import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin } from '@/lib/utils';
import { sendCreditAlert } from '@/lib/push';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(auth.slice(7));
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientPhone, amount, pin, note } = await req.json();
    const userId = payload.userId as string;

    // Validate inputs
    if (!recipientPhone || !amount || !pin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!/^\d{11}$/.test(recipientPhone)) {
      return NextResponse.json({ error: 'Invalid recipient phone' }, { status: 400 });
    }

    // Get sender user and verify PIN and balance
    const senderRows = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (!senderRows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sender = senderRows[0];

    // Verify PIN
    const isPinValid = await verifyPin(pin, sender.pin_hash);
    if (!isPinValid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    // Check balance
    if (sender.wallet_balance < transferAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Get recipient user
    const recipientRows = await sql`SELECT id, first_name, last_name FROM users WHERE phone = ${recipientPhone}`;
    if (!recipientRows.length) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const recipient = recipientRows[0];
    if (recipient.id === userId) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 });
    }

    // Check if recipient is banned
    const recipientCheckRows = await sql`SELECT is_banned FROM users WHERE id = ${recipient.id}`;
    if (recipientCheckRows[0]?.is_banned) {
      return NextResponse.json({ error: 'Recipient account is inactive' }, { status: 400 });
    }

    // Perform transfer
    // Debit sender
    await sql`
      UPDATE users 
      SET wallet_balance = wallet_balance - ${transferAmount},
          updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Credit recipient
    const [creditedRecipient] = await sql`
      UPDATE users 
      SET wallet_balance = wallet_balance + ${transferAmount},
          updated_at = NOW()
      WHERE id = ${recipient.id}
      RETURNING wallet_balance
    `;

    // Record sender transaction
    await sql`
      INSERT INTO transactions 
      (user_id, type, description, amount, status, created_at)
      VALUES (${userId}, 'transfer_out', ${'Transfer to ' + recipientPhone}, ${transferAmount}, 'success', NOW())
    `;

    const senderName = `${sender.first_name} ${sender.last_name}`.trim();

    // Record recipient transaction
    await sql`
      INSERT INTO transactions 
      (user_id, type, description, amount, status, created_at)
      VALUES (${recipient.id}, 'transfer_in', ${'Transfer from ' + senderName}, ${transferAmount}, 'success', NOW())
    `;

    try {
      await sendCreditAlert({
        userId: recipient.id,
        amount: transferAmount,
        newBalance: parseFloat(creditedRecipient?.wallet_balance || 0),
        kind: 'transfer_in',
        senderLabel: senderName,
      });
    } catch (pushErr) {
      console.error('Transfer-in credit push send failed:', pushErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer successful',
      recipient: {
        name: `${recipient.first_name} ${recipient.last_name}`,
        phone: recipientPhone,
      },
      amount: transferAmount,
    });
  } catch (err: unknown) {
    console.error('[Transfer Error]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(auth.slice(7));
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.userId as string;
    const url = new URL(req.url);
    const phone = url.searchParams.get('phone');

    if (!phone || !/^\d{11}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
    }

    // Look up recipient
    const recipientRows = await sql`
      SELECT id, first_name, last_name, phone 
      FROM users 
      WHERE phone = ${phone} AND is_banned = false
    `;

    if (!recipientRows.length) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const recipient = recipientRows[0];
    return NextResponse.json({
      name: `${recipient.first_name} ${recipient.last_name}`,
      phone: recipient.phone,
    });
  } catch (err: unknown) {
    console.error('[Transfer Lookup Error]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
