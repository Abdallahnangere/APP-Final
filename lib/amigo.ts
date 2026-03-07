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
  const proxyUrl = process.env.AMIGO_PROXY_URL;
  if (!proxyUrl) throw new Error('AMIGO_PROXY_URL not set');

  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.AMIGO_API_KEY!,
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amigo proxy error ${res.status}: ${text}`);
  }

  return res.json();
}
