import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { retryWithExponentialBackoff } from './retry';
import { logger } from './logger';

// CONFIGURATION
// User Instruction: The URL in the environment variable HAS the endpoint.
const AMIGO_FULL_URL = process.env.AMIGO_BASE_URL || 'https://amigo.ng/api/data/'; 
const PROXY_URL = process.env.AWS_PROXY_URL; 
const API_KEY = process.env.AMIGO_API_KEY || '';

// Configure Proxy Agent
let httpsAgent: any = undefined;
if (PROXY_URL) {
    try {
        httpsAgent = new HttpsProxyAgent(PROXY_URL);
    } catch (e) {
        console.error("Failed to initialize Proxy Agent", e);
    }
}

export const amigoClient = axios.create({
  httpsAgent: httpsAgent,
  proxy: false, 
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`, 
    'Token': API_KEY, 
    'X-API-Key': API_KEY,
    'Accept': 'application/json',
  },
  timeout: 60000, 
});

/**
 * Helper to call Amigo endpoints with retry logic.
 * Uses the AMIGO_BASE_URL environment variable strictly as the target URL.
 * Implements exponential backoff for transient failures.
 */
export async function callAmigoAPI(endpoint: string, payload: any, idempotencyKey?: string) {
  
  // We ignore the 'endpoint' argument here because the user specified
  // that the Environment Variable contains the full endpoint URL.
  const fullUrl = AMIGO_FULL_URL;

  logger.logExternalApiCall('AMIGO', fullUrl, 'POST', 0, 0, { 
    hasIdempotencyKey: !!idempotencyKey 
  });

  try {
    const result = await retryWithExponentialBackoff(
      async () => {
        const headers: Record<string, string> = {};
        if (idempotencyKey) {
          headers['Idempotency-Key'] = idempotencyKey;
        }

        const startTime = Date.now();
        const response = await amigoClient.post(fullUrl, payload, { headers });
        const duration = Date.now() - startTime;

        logger.logExternalApiCall('AMIGO', fullUrl, 'POST', response.status, duration);

        return {
          success: true,
          data: response.data,
          status: response.status
        };
      },
      {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        shouldRetry: (error: any) => {
          // Retry on network errors and 5xx status codes
          if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') return true;
          if (error.response?.status >= 500) return true;
          return false;
        }
      }
    );

    console.log(`[Amigo API] ✅ Success: ${result.status}`);
    return result;

  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message;
    const statusCode = error.response?.status || 500;

    logger.logExternalApiCall('AMIGO', fullUrl, 'POST', statusCode, 0, {
      error: errorMsg,
      retried: true
    });
    
    console.error(`[Amigo API] ❌ Failed: ${errorMsg}`);
    
    return {
      success: false,
      data: error.response?.data || { error: errorMsg },
      status: statusCode
    };
  }
}

// User Specification: 1 for MTN, 2 for GLO.
export const AMIGO_NETWORKS: Record<string, number> = {
  'MTN': 1,
  'GLO': 2,
  'AIRTEL': 4,
  '9MOBILE': 9
};
