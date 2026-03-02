// lib/flutterwave.ts — Flutterwave API helpers
import axios from 'axios';
import { logger } from './logger';

const FLW_BASE = 'https://api.flutterwave.com/v3';

function flwHeaders() {
  return {
    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

// ─── INITIATE BANK TRANSFER CHARGE ─────────────────────────────────────────
export async function initiateBankTransfer(params: {
  tx_ref: string;
  amount: number;
  phone: string;
  narration: string;
  meta?: Record<string, string>;
}) {
  const payload = {
    tx_ref: params.tx_ref,
    amount: String(params.amount),
    email: 'saukidatalinks@gmail.com',
    phone_number: params.phone,
    currency: 'NGN',
    narration: params.narration,
    is_permanent: false,
    meta: params.meta || {},
  };

  logger.info('PAYMENT', 'FLW_BANK_TRANSFER_INITIATE', { tx_ref: params.tx_ref, amount: params.amount });

  const response = await axios.post(
    `${FLW_BASE}/charges?type=bank_transfer`,
    payload,
    { headers: flwHeaders(), timeout: 60000 }
  );

  return response.data;
}

// ─── CREATE VIRTUAL ACCOUNT FOR AGENT ──────────────────────────────────────
export async function createVirtualAccount(params: {
  tx_ref: string;
  phone: string;
  firstName: string;
  lastName: string;
}) {
  const payload = {
    email: `agent.${params.phone}@${process.env.NEXT_PUBLIC_DOMAIN || 'saukimart.online'}`,
    is_permanent: true,
    bvn: process.env.MY_BVN,
    tx_ref: params.tx_ref,
    phonenumber: params.phone,
    firstname: params.firstName,
    lastname: `${params.lastName} Sauki Mart FLW`,
    narration: `Sauki Agent ${params.firstName}`,
  };

  logger.info('AGENT', 'FLW_CREATE_VIRTUAL_ACCOUNT', { phone: params.phone });

  const response = await axios.post(
    `${FLW_BASE}/virtual-account-numbers`,
    payload,
    { headers: flwHeaders(), timeout: 60000 }
  );

  return response.data;
}

// ─── VERIFY PAYMENT ─────────────────────────────────────────────────────────
export async function verifyTransaction(id: string) {
  const response = await axios.get(
    `${FLW_BASE}/transactions/${id}/verify`,
    { headers: flwHeaders(), timeout: 30000 }
  );
  return response.data;
}

// ─── VERIFY WEBHOOK SIGNATURE ───────────────────────────────────────────────
export function verifyWebhookSignature(signature: string | null): boolean {
  if (!signature) return false;
  return signature === process.env.FLUTTERWAVE_WEBHOOK_SECRET;
}
