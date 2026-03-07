export interface AmigoPayload {
  network: number;
  mobile_number: string;
  plan: number;
  Ported_number: boolean;
}

export interface AmigoResponse {
  success: boolean;
  reference?: string;
  message?: string;
  network?: number;
  plan?: number;
  amount_charged?: number;
  status?: string;
  error?: string;
}

export async function purchaseData(
  payload: AmigoPayload,
  idempotencyKey: string
): Promise<AmigoResponse> {
  const apiKey = process.env.AMIGO_API_KEY;
  if (!apiKey) throw new Error('AMIGO_API_KEY not set');

  const res = await fetch('https://amigo.ng/api/data/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amigo API error ${res.status}: ${text}`);
  }

  return res.json();
}
