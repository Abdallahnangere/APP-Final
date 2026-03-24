const FLW_BASE = 'https://api.flutterwave.com/v3';

async function parseFlutterwaveResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (contentType.toLowerCase().includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return {
        status: 'error',
        message: 'Provider returned invalid JSON response',
        raw: text.slice(0, 200),
      };
    }
  }

  return {
    status: 'error',
    message: 'Provider service unavailable. Please try again shortly.',
    raw: text.slice(0, 200),
  };
}

export interface FLWVirtualAccountPayload {
  email: string;
  is_permanent: boolean;
  bvn: string;
  tx_ref: string;
  firstname: string;
  lastname: string;
  narration: string;
  phonenumber: string;
}

export interface FLWVirtualAccountResponse {
  status: string;
  message: string;
  data?: {
    response_code: string;
    response_message: string;
    flw_ref: string;
    order_ref: string;
    account_number: string;
    bank_name: string;
    created_at: string;
  };
}

export async function createVirtualAccount(
  payload: FLWVirtualAccountPayload
): Promise<FLWVirtualAccountResponse> {
  const res = await fetch(`${FLW_BASE}/virtual-account-numbers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function verifyTransaction(txId: string) {
  const res = await fetch(`${FLW_BASE}/transactions/${txId}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
  });
  return res.json();
}

export async function listBanks(country = 'NG') {
  const res = await fetch(`${FLW_BASE}/banks/${country}`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
  });
  return res.json();
}

export async function resolveAccountNumber(accountNumber: string, accountBank: string) {
  const res = await fetch(`${FLW_BASE}/accounts/resolve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account_number: accountNumber, account_bank: accountBank }),
  });
  return parseFlutterwaveResponse(res);
}

export interface FLWBalanceItem {
  currency: string;
  available_balance: number;
  ledger_balance: number;
}

export interface FLWTransferPayload {
  accountBank: string;
  accountNumber: string;
  amount: number;
  narration?: string;
  reference: string;
  callbackUrl?: string;
}

export async function getBalances() {
  const res = await fetch(`${FLW_BASE}/balances`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
  });
  return parseFlutterwaveResponse(res);
}

export async function initiateTransfer(payload: FLWTransferPayload) {
  const res = await fetch(`${FLW_BASE}/transfers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      account_bank: payload.accountBank,
      account_number: payload.accountNumber,
      amount: payload.amount,
      narration: payload.narration || 'Admin transfer',
      currency: 'NGN',
      reference: payload.reference,
      callback_url: payload.callbackUrl || process.env.FLW_TRANSFER_CALLBACK_URL,
      debit_currency: 'NGN',
    }),
  });
  return parseFlutterwaveResponse(res);
}

export async function getTransferById(transferId: string | number) {
  const res = await fetch(`${FLW_BASE}/transfers/${transferId}`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
  });
  return parseFlutterwaveResponse(res);
}

export type ElectricityMeterType = 'prepaid' | 'postpaid';

export interface FLWElectricityBiller {
  id: number;
  biller_code: string;
  name: string;
  item_code: string;
  is_active?: number;
}

export interface FLWElectricityValidateResult {
  response_code?: string;
  response_message?: string;
  name?: string;
  address?: string;
  customer?: string;
  product_code?: string;
}

export interface FLWElectricityPurchasePayload {
  meterNumber: string;
  amount: number;
  meterType: ElectricityMeterType;
  discoName: string;
  reference: string;
}

export async function listElectricityBillers() {
  const res = await fetch(`${FLW_BASE}/bill-categories/BIL099/billers`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
  });
  return parseFlutterwaveResponse(res);
}

export async function validateElectricityMeter(itemCode: string, meterNumber: string) {
  const res = await fetch(`${FLW_BASE}/bill-items/${itemCode}/validate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      item_code: itemCode,
      code: meterNumber,
      customer: meterNumber,
    }),
  });
  return parseFlutterwaveResponse(res);
}

export async function purchaseElectricityBill(payload: FLWElectricityPurchasePayload) {
  const type = `${payload.discoName} ${payload.meterType.toUpperCase()}`;
  const res = await fetch(`${FLW_BASE}/bills`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      country: 'NG',
      customer: payload.meterNumber,
      amount: payload.amount,
      recurrence: 'ONCE',
      type,
      reference: payload.reference,
      biller_name: payload.discoName,
    }),
  });
  return res.json();
}

export interface FLWAirtimePurchasePayload {
  phoneNumber: string;
  amount: number;
  networkName: string;
  reference: string;
}

export async function purchaseAirtime(payload: FLWAirtimePurchasePayload) {
  const res = await fetch(`${FLW_BASE}/bills`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      country: 'NG',
      customer: payload.phoneNumber,
      amount: payload.amount,
      recurrence: 'ONCE',
      type: `${payload.networkName} Mobile Recharge`,
      reference: payload.reference,
      biller_name: payload.networkName,
    }),
  });
  return res.json();
}
