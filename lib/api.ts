
import { Product, DataPlan, Transaction, PaymentInitResponse, Agent } from '../types';

const API_BASE = '/api';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    cache: 'no-store',
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    let parsed;
    try { parsed = JSON.parse(errorText); } catch(e) {}
    throw new Error(parsed?.error || errorText || 'An unexpected error occurred');
  }
  
  return res.json();
}

export const api = {
  getProducts: () => fetcher<Product[]>('/products'),
  
  getDataPlans: () => fetcher<DataPlan[]>('/data-plans'),
  
  initiateEcommercePayment: (data: { productId: string; phone: string; name: string; state: string; simId?: string }) => 
    fetcher<PaymentInitResponse>('/ecommerce/initiate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  initiateDataPayment: (data: { planId: string; phone: string }) => 
    fetcher<PaymentInitResponse>('/data/initiate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  verifyTransaction: (tx_ref: string) => 
    fetcher<{ status: Transaction['status'] }>('/transactions/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tx_ref }),
    }),

  trackTransactions: (phone: string) => 
    fetcher<{ transactions: Transaction[] }>(`/transactions/track?phone=${phone}`),

  // Agent APIs
  agentRegister: (data: any) => fetcher<{ success: boolean; agent: Agent }>('/agent/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  agentLogin: (data: { phone: string; pin: string }) => fetcher<{ success: boolean; agent: Agent }>('/agent/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  agentGetBalance: (agentId: string) => fetcher<{ balance: number }>('/agent/balance?agentId=' + agentId),

  agentWalletPurchase: (data: { agentId: string; pin: string; type: 'data' | 'ecommerce'; payload: any }) => 
    fetcher<{ success: boolean; transaction: Transaction }>('/agent/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: data.agentId, agentPin: data.pin, type: data.type, payload: data.payload }),
    }),
};
