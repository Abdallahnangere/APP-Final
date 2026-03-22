import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireDeveloperByApiKey } from '@/lib/developerAuth';
import { generateIdempotencyKey, generateReceiptRef } from '@/lib/utils';
import { sendApiDataPurchaseAlert } from '@/lib/push';

const AMIGO_TIMEOUT = 30000;

function toAmount(n: number) {
  return Math.round(n * 100) / 100;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireDeveloperByApiKey(req);
    if (!auth) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

    const body = await req.json();
    const phoneNumber = String(body?.phoneNumber || '').trim();
    const network = String(body?.network || '').trim().toUpperCase();
    const planCode = String(body?.planCode || '').trim();
    const idempotencyFromBody = String(body?.idempotencyKey || '').trim();
    const idempotencyHeader = req.headers.get('Idempotency-Key')?.trim() || '';
    const idempotencyKey = idempotencyFromBody || idempotencyHeader || generateIdempotencyKey();

    if (!/^\d{11}$/.test(phoneNumber)) {
      return NextResponse.json({ error: 'phoneNumber must be 11 digits' }, { status: 400 });
    }
    if (!network) return NextResponse.json({ error: 'network is required' }, { status: 400 });
    if (!planCode || !/^\d+-\d+$/.test(planCode)) {
      return NextResponse.json({ error: 'planCode is required in format networkId-planId' }, { status: 400 });
    }

    const [networkIdText, planIdText] = planCode.split('-');
    const networkId = Number(networkIdText);
    const planId = Number(planIdText);
    if (!Number.isFinite(networkId) || !Number.isFinite(planId)) {
      return NextResponse.json({ error: 'Invalid planCode format' }, { status: 400 });
    }

    const [existing] = await sql`
      SELECT t.id, t.status, t.receipt_data
      FROM transactions t
      WHERE t.idempotency_key = ${idempotencyKey}
        AND t.user_id = ${auth.user.id}
        AND t.type = 'api_data'
      LIMIT 1
    `;

    if (existing) {
      return NextResponse.json({
        success: existing.status === 'success',
        message: existing.status === 'success' ? 'Data delivered successfully' : 'Previous attempt failed',
        receipt: existing.receipt_data || {},
        idempotencyKey,
      });
    }

    const [plan] = await sql`
      SELECT id, network, network_id, plan_id, data_size, validity, selling_price
      FROM data_plans
      WHERE is_active = TRUE
        AND network_id = ${networkId}
        AND plan_id = ${planId}
        AND UPPER(network) = ${network}
      LIMIT 1
    `;

    if (!plan) {
      return NextResponse.json({ error: 'Invalid network/planCode combination' }, { status: 400 });
    }

    const appPrice = Number(plan.selling_price || 0);
    const discountPercent = Number(auth.user.developer_discount_percent || 0);
    const developerPrice = toAmount(appPrice * (1 - discountPercent / 100));
    const balance = Number(auth.user.wallet_balance || 0);

    if (balance < developerPrice) {
      return NextResponse.json({
        error: `Insufficient balance. Balance: ₦${balance.toLocaleString()}, Required: ₦${developerPrice.toLocaleString()}`,
      }, { status: 400 });
    }

    const receiptRef = generateReceiptRef();

    const [txn] = await sql`
      INSERT INTO transactions (
        user_id, type, description, amount, status, network, plan_id, phone_number, idempotency_key, receipt_data
      )
      VALUES (
        ${auth.user.id},
        'api_data',
        ${`API ${plan.data_size} ${plan.network} data to ${phoneNumber}`},
        ${developerPrice},
        'pending',
        ${plan.network},
        ${plan.plan_id},
        ${phoneNumber},
        ${idempotencyKey},
        ${JSON.stringify({
          source: 'developer_api',
          planCode,
          appPrice,
          developerPrice,
          dataSize: plan.data_size,
          validity: plan.validity,
          network: plan.network,
          phoneNumber,
          receiptRef,
        })}
      )
      RETURNING id
    `;

    const proxyUrl = process.env.AMIGO_PROXY_URL || 'https://amigo.ng/api';
    const apiKey = process.env.AMIGO_API_KEY;
    if (!apiKey) throw new Error('AMIGO_API_KEY not configured');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AMIGO_TIMEOUT);

    let amigoData: any;
    try {
      const amigoRes = await fetch(`${proxyUrl}/data/`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          network: plan.network_id,
          mobile_number: phoneNumber,
          plan: plan.plan_id,
          Ported_number: true,
        }),
      });
      amigoData = await amigoRes.json();
    } finally {
      clearTimeout(timeout);
    }

    if (!amigoData?.success) {
      await sql`UPDATE transactions SET status = 'failed' WHERE id = ${txn.id}`;

      await sql`
        INSERT INTO developer_api_transactions (
          user_id, api_key_id, transaction_id, endpoint, request_payload, response_data,
          status, network, plan_code, phone_number, app_price, developer_price,
          idempotency_key, amigo_reference, created_at
        ) VALUES (
          ${auth.user.id}, ${auth.keyId}, ${txn.id}, '/api/v1/developer/purchase-data',
          ${JSON.stringify(body || {})}, ${JSON.stringify(amigoData || {})},
          'failed', ${plan.network}, ${planCode}, ${phoneNumber}, ${appPrice}, ${developerPrice},
          ${idempotencyKey}, ${amigoData?.reference || null}, NOW()
        )
      `;

      return NextResponse.json({ error: amigoData?.message || 'Data delivery failed' }, { status: 400 });
    }

    const [balanceUpdate] = await sql`
      UPDATE users
      SET wallet_balance = wallet_balance - ${developerPrice},
          updated_at = NOW()
      WHERE id = ${auth.user.id} AND wallet_balance >= ${developerPrice}
      RETURNING wallet_balance
    `;

    if (!balanceUpdate) {
      await sql`UPDATE transactions SET status = 'failed' WHERE id = ${txn.id}`;
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const finalReceipt = {
      source: 'developer_api',
      planCode,
      network: plan.network,
      dataSize: plan.data_size,
      validity: plan.validity,
      phoneNumber,
      appPrice,
      developerPrice,
      receiptRef,
      status: 'success',
      date: new Date().toISOString(),
      reference: amigoData?.reference || null,
      message: amigoData?.message || '',
    };

    await sql`
      UPDATE transactions
      SET status = 'success',
          amigo_reference = ${amigoData?.reference || null},
          receipt_data = ${JSON.stringify(finalReceipt)}
      WHERE id = ${txn.id}
    `;

    await sql`
      INSERT INTO developer_api_transactions (
        user_id, api_key_id, transaction_id, endpoint, request_payload, response_data,
        status, network, plan_code, phone_number, app_price, developer_price,
        idempotency_key, amigo_reference, created_at
      ) VALUES (
        ${auth.user.id}, ${auth.keyId}, ${txn.id}, '/api/v1/developer/purchase-data',
        ${JSON.stringify(body || {})}, ${JSON.stringify(amigoData || {})},
        'success', ${plan.network}, ${planCode}, ${phoneNumber}, ${appPrice}, ${developerPrice},
        ${idempotencyKey}, ${amigoData?.reference || null}, NOW()
      )
    `;

    await sendApiDataPurchaseAlert({
      userId: auth.user.id,
      planLabel: `${plan.data_size} ${plan.network}`,
      phoneNumber,
      amount: developerPrice,
    });

    return NextResponse.json({
      success: true,
      message: amigoData?.message || `${plan.data_size} ${plan.network} delivered to ${phoneNumber}`,
      idempotencyKey,
      reference: amigoData?.reference || null,
      newBalance: Number(balanceUpdate.wallet_balance || 0),
      receipt: finalReceipt,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout. Please try again.' }, { status: 408 });
    }
    console.error('Developer purchase API error:', err);
    return NextResponse.json({ error: 'Purchase failed. Please retry.' }, { status: 500 });
  }
}
