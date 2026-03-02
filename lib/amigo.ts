// lib/amigo.ts — Amigo API integration for data delivery
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { logger } from './logger';

const NETWORK_MAP: Record<string, number> = {
  MTN: 1,
  AIRTEL: 2,
  GLO: 3,
};

export const AMIGO_NETWORKS = NETWORK_MAP;

function amigoHeaders(idempotencyKey?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.AMIGO_API_KEY}`,
    'X-API-Key': process.env.AMIGO_API_KEY!,
    Token: process.env.AMIGO_API_KEY!,
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return headers;
}

function getAgent() {
  if (process.env.AWS_PROXY_URL) {
    return new HttpsProxyAgent(process.env.AWS_PROXY_URL);
  }
  return undefined;
}

// ─── DELIVER DATA ────────────────────────────────────────────────────────────
export async function deliverData(params: {
  network: string;
  phone: string;
  planId: number;
  idempotencyKey: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const networkId = NETWORK_MAP[params.network.toUpperCase()];
  if (!networkId) return { success: false, error: `Unsupported network: ${params.network}` };

  const payload = {
    network: networkId,
    mobile_number: params.phone,
    plan: params.planId,
    Ported_number: true,
  };

  let lastError = '';
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise((r) => setTimeout(r, delay));
        logger.warn('AMIGO', 'DELIVERY_RETRY', { attempt, phone: params.phone });
      }

      logger.info('AMIGO', 'AMIGO_CALL', { network: params.network, phone: params.phone, planId: params.planId });

      const agentProxy = getAgent();
      const response = await axios.post(
        `${process.env.AMIGO_BASE_URL}`,
        payload,
        {
          headers: amigoHeaders(params.idempotencyKey),
          timeout: 30000,
          ...(agentProxy ? { httpsAgent: agentProxy } : {}),
        }
      );

      logger.info('AMIGO', 'DELIVERY_SUCCESS', { phone: params.phone, response: response.data?.data?.Status });
      return { success: true, data: response.data };
    } catch (err: any) {
      lastError = err?.response?.data?.message || err?.message || 'Amigo API error';
      logger.error('AMIGO', 'AMIGO_FAILURE', { attempt, error: lastError, phone: params.phone });

      // Don't retry on 4xx errors (bad request, auth failure)
      if (err?.response?.status && err.response.status < 500) break;
    }
  }

  return { success: false, error: lastError };
}

// Generic call wrapper used by some routes (keeps backwards compatibility)
export async function callAmigoAPI(path: string, payload: any, idempotencyKey?: string) {
  let lastError = '';
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise((r) => setTimeout(r, delay));
        logger.warn('AMIGO', 'CALL_RETRY', { attempt, path });
      }

      logger.info('AMIGO', 'CALL', { path, payload });

      const agentProxy = getAgent();
      const response = await axios.post(
        `${process.env.AMIGO_BASE_URL}${path}`,
        payload,
        {
          headers: amigoHeaders(idempotencyKey),
          timeout: 30000,
          ...(agentProxy ? { httpsAgent: agentProxy } : {}),
        }
      );

      logger.info('AMIGO', 'CALL_SUCCESS', { path, status: response.status });
      return { success: true, data: response.data };
    } catch (err: any) {
      lastError = err?.response?.data?.message || err?.message || 'Amigo API error';
      logger.error('AMIGO', 'CALL_FAILURE', { attempt, error: lastError, path });

      if (err?.response?.status && err.response.status < 500) break;
    }
  }

  return { success: false, error: lastError };
}
