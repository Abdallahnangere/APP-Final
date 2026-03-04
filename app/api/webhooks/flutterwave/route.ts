import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyFlutterwaveWebhook } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('verif-hash') || '';
    const secretHash = process.env.FLW_WEBHOOK_HASH || '';

    // Log raw webhook always
    const body = await req.json();
    await sql`INSERT INTO webhooks_log (event, payload, processed) VALUES (${body.event || 'unknown'}, ${JSON.stringify(body)}, FALSE)`;

    if (!verifyFlutterwaveWebhook(secretHash, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event, data } = body;

    if (event === 'charge.completed' && data?.status === 'successful') {
      const { amount, customer, tx_ref, id: flwTxId, flw_ref } = data;
      const senderName = customer?.name || customer?.email || 'Unknown';
      const narration = data.narration || '';

      // Find user by order_ref / account number
      const [user] = await sql`
        SELECT id, flw_order_ref FROM users
        WHERE flw_order_ref = ${tx_ref} OR flw_account_number = ${data.meta?.acc_number || ''}
        LIMIT 1
      `;

      if (user) {
        // Check for duplicate
        const [existing] = await sql`SELECT id FROM deposits WHERE flw_transaction_id = ${String(flwTxId)}`;
        if (!existing) {
          await sql`
            INSERT INTO deposits (user_id, flw_transaction_id, flw_ref, amount, sender_name, narration, raw_webhook)
            VALUES (${user.id}, ${String(flwTxId)}, ${flw_ref}, ${amount}, ${senderName}, ${narration}, ${JSON.stringify(body)})
          `;
          await sql`UPDATE users SET wallet_balance = wallet_balance + ${amount}, updated_at = NOW() WHERE id = ${user.id}`;
        }
      }

      await sql`UPDATE webhooks_log SET processed = TRUE WHERE payload->>'id' = ${String(flwTxId)}`;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
