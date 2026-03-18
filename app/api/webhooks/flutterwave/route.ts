import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyFlutterwaveWebhook } from '@/lib/utils';

interface FlutterwaveWebhookData {
  id: number;
  amount: number;
  status: string;
  tx_ref: string;
  flw_ref: string;
  currency: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
  };
  narration: string;
  payment_type: string;
  created_at: string;
}

interface FlutterwaveWebhook {
  event: string;
  'event.type': string;
  data: FlutterwaveWebhookData;
}

async function ensureDepositTransaction(params: {
  userId: string;
  flwTxId: string;
  flwRef: string;
  amount: number;
  senderName: string;
  narration: string;
  createdAt: string;
}) {
  const receiptData = {
    ref: params.flwRef || params.flwTxId,
    amount: params.amount,
    date: params.createdAt,
    type: 'deposit',
    productName: 'Wallet Deposit',
    itemName: 'Wallet Deposit',
    description: params.narration || 'Wallet deposit received',
    userName: params.senderName || 'Bank Transfer',
    userPhone: '',
    deliveryAddress: params.narration || 'Flutterwave deposit',
  };

  await sql`
    INSERT INTO transactions (user_id, type, description, amount, status, amigo_reference, receipt_data, idempotency_key, created_at)
    VALUES (
      ${params.userId},
      'deposit',
      ${params.narration || 'Wallet deposit'},
      ${params.amount},
      'success',
      ${params.flwRef || params.flwTxId},
      ${JSON.stringify(receiptData)},
      ${`deposit:${params.flwTxId}`},
      ${params.createdAt}
    )
    ON CONFLICT (idempotency_key) DO UPDATE
    SET description = EXCLUDED.description,
        amount = EXCLUDED.amount,
        status = EXCLUDED.status,
        amigo_reference = EXCLUDED.amigo_reference,
        receipt_data = EXCLUDED.receipt_data
  `;
}

export async function POST(req: NextRequest) {
  let webhookData: FlutterwaveWebhook | null = null;
  let flwTxId = '';

  try {
    const signature = req.headers.get('verif-hash') || '';
    const secretHash = process.env.FLW_WEBHOOK_HASH || '';

    // Parse webhook body
    const body = await req.json();
    webhookData = body as FlutterwaveWebhook;
    const { event, data } = webhookData;

    if (!data?.id) {
      console.warn('Webhook received without transaction ID');
      return NextResponse.json({ status: 'ok' });
    }

    flwTxId = String(data.id);

    // Log raw webhook for debugging
    await sql`
      INSERT INTO webhooks_log (event, payload, processed)
      VALUES (${event || 'unknown'}, ${JSON.stringify(body)}, FALSE)
      ON CONFLICT DO NOTHING
    `;

    // Verify webhook signature
    if (!verifyFlutterwaveWebhook(secretHash, signature)) {
      console.error('Invalid webhook signature');
      await logWebhookProcessing(flwTxId, 'FAILED', 'Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Process only successful charge completions
    if (event !== 'charge.completed' || data.status !== 'successful') {
      console.log(`Ignoring event: ${event}, status: ${data.status}`);
      return NextResponse.json({ status: 'ok' });
    }

    // Check for duplicate processing
    const [existingDeposit] = await sql`
      SELECT id, user_id FROM deposits
      WHERE flw_transaction_id = ${flwTxId}
      LIMIT 1
    `;

    if (existingDeposit) {
      console.log(`Duplicate deposit detected: ${flwTxId}, skipping`);
      await ensureDepositTransaction({
        userId: existingDeposit.user_id,
        flwTxId,
        flwRef: data.flw_ref || '',
        amount: Number(data.amount) || 0,
        senderName: data.customer?.name || data.customer?.email || 'Unknown',
        narration: data.narration || '',
        createdAt: data.created_at || new Date().toISOString(),
      });
      await logWebhookProcessing(flwTxId, 'SKIPPED', 'Duplicate deposit');
      return NextResponse.json({ status: 'ok', message: 'Duplicate, already processed' });
    }

    // Extract customer phone - primary identifier for bank transfers
    const phoneNumber = data.customer?.phone_number?.trim() || '';
    const senderName = data.customer?.name || data.customer?.email || 'Unknown';
    const narration = data.narration || '';
    const amount = Number(data.amount) || 0;
    const flwRef = data.flw_ref || '';
    const txRef = data.tx_ref || '';

    if (amount <= 0) {
      console.warn(`Invalid amount: ${amount}`);
      await logWebhookProcessing(flwTxId, 'FAILED', 'Invalid amount');
      return NextResponse.json({ status: 'ok', message: 'Invalid amount' });
    }

    if (!phoneNumber) {
      console.warn(`No phone number found in webhook for transaction ${flwTxId}`);
      await logWebhookProcessing(flwTxId, 'FAILED', 'No phone number');
      return NextResponse.json({ status: 'ok', message: 'No phone number' });
    }

    // ─── INTELLIGENT USER LOOKUP STRATEGY ───
    // Priority 1: Phone number (most reliable for bank transfers)
    // Priority 2: tx_ref matching order_ref
    // Priority 3: Narration parsing (fallback)

    let user = null;

    // Strategy 1: Match by phone number (11 digits)
    const normalizedPhone = phoneNumber.replace(/\D/g, '').slice(-11);
    if (normalizedPhone.length === 11) {
      const [foundUser] = await sql`
        SELECT id, first_name, last_name, wallet_balance FROM users
        WHERE phone = ${normalizedPhone}
        LIMIT 1
      `;
      if (foundUser) {
        user = foundUser;
        console.log(`User found by phone: ${normalizedPhone}, user_id: ${user.id}`);
      }
    }

    // Strategy 2: Match by tx_ref (flw_order_ref)
    if (!user && txRef) {
      const [foundUser] = await sql`
        SELECT id, first_name, last_name, wallet_balance FROM users
        WHERE flw_order_ref = ${txRef}
        LIMIT 1
      `;
      if (foundUser) {
        user = foundUser;
        console.log(`User found by tx_ref: ${txRef}, user_id: ${user.id}`);
      }
    }

    // Strategy 3: Try to parse phone from narration if standard lookup failed
    if (!user && narration) {
      const phoneMatch = narration.match(/08\d{10}|\+234[79]\d{9}|0\d{10}/);
      if (phoneMatch) {
        const extractedPhone = phoneMatch[0].replace(/\D/g, '').slice(-11);
        if (extractedPhone.length === 11) {
          const [foundUser] = await sql`
            SELECT id, first_name, last_name, wallet_balance FROM users
            WHERE phone = ${extractedPhone}
            LIMIT 1
          `;
          if (foundUser) {
            user = foundUser;
            console.log(`User found by narration parse: ${extractedPhone}, user_id: ${user.id}`);
          }
        }
      }
    }

    // User not found - log and fail gracefully
    if (!user) {
      console.warn(`No user found for phone: ${phoneNumber}, tx_ref: ${txRef}`);
      await logWebhookProcessing(
        flwTxId,
        'FAILED',
        `No user found. Phone: ${phoneNumber}, Tx_ref: ${txRef}`
      );
      return NextResponse.json({
        status: 'ok',
        message: 'No matching user found',
      });
    }

    // ─── CREDIT USER ACCOUNT ───
    try {
      await sql`
        INSERT INTO deposits (
          user_id,
          flw_transaction_id,
          flw_ref,
          amount,
          sender_name,
          narration,
          status,
          raw_webhook,
          created_at
        )
        VALUES (
          ${user.id},
          ${flwTxId},
          ${flwRef},
          ${amount},
          ${senderName},
          ${narration},
          'success',
          ${JSON.stringify(webhookData)},
          ${new Date().toISOString()}
        )
      `;

      // Credit wallet
      await sql`
        UPDATE users
        SET wallet_balance = wallet_balance + ${amount}, updated_at = NOW()
        WHERE id = ${user.id}
      `;

      await ensureDepositTransaction({
        userId: user.id,
        flwTxId,
        flwRef,
        amount,
        senderName,
        narration,
        createdAt: data.created_at || new Date().toISOString(),
      });

      const newBalance = (user.wallet_balance || 0) + amount;
      console.log(`✅ Deposit credited: User ${user.id} (${user.first_name} ${user.last_name}), Amount: ₦${amount}, New Balance: ₦${newBalance}`);

      await logWebhookProcessing(
        flwTxId,
        'SUCCESS',
        `Credited ₦${amount} to user ${user.id}`
      );

      return NextResponse.json({
        status: 'ok',
        message: 'Deposit processed successfully',
        user_id: user.id,
        user_name: `${user.first_name} ${user.last_name}`,
        amount_credited: amount,
        new_balance: newBalance,
      });
    } catch (creditErr) {
      console.error('Error crediting wallet:', creditErr);
      await logWebhookProcessing(flwTxId, 'FAILED', `Error crediting: ${String(creditErr)}`);
      throw creditErr;
    }
  } catch (err) {
    console.error('Webhook processing error:', err);

    // Log error for debugging
    if (flwTxId) {
      await logWebhookProcessing(
        flwTxId,
        'ERROR',
        `${err instanceof Error ? err.message : 'Unknown error'}`
      ).catch(() => {});
    }

    return NextResponse.json(
      { error: 'Webhook processing failed', txId: flwTxId },
      { status: 500 }
    );
  }
}

/**
 * Intelligent log helper for webhook processing tracking
 */
async function logWebhookProcessing(
  flwTxId: string,
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'ERROR',
  details: string
) {
  try {
    await sql`
      INSERT INTO deposits_webhook_log (
        flw_transaction_id,
        status,
        details,
        created_at
      )
      VALUES (
        ${flwTxId},
        ${status},
        ${details},
        ${new Date().toISOString()}
      )
    `;
  } catch (err) {
    console.error('Failed to log webhook processing:', err);
  }
}
