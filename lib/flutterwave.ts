const FLW_BASE = 'https://api.flutterwave.com/v3';

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
