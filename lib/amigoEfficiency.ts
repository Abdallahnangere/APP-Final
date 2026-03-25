type EfficiencyLabel = 'Excellent' | 'Good' | 'Fair';

export type EfficiencyPoint = {
  planId: number;
  efficiencyPercent: number;
  efficiencyLabel: EfficiencyLabel;
};

type CacheValue = {
  expiresAt: number;
  byPlanId: Record<number, EfficiencyPoint>;
};

let cache: CacheValue | null = null;

function getLabel(percent: number): EfficiencyLabel {
  if (percent >= 96) return 'Excellent';
  if (percent >= 90) return 'Good';
  return 'Fair';
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function addPoint(target: Record<number, EfficiencyPoint>, row: Record<string, unknown>) {
  const rawPlanId = row.plan_id ?? row.planId ?? row.plan ?? row.id;
  const rawEfficiency =
    row.efficiency_percent ??
    row.efficiencyPercent ??
    row.efficiency ??
    row.success_rate ??
    row.successRate;

  const planId = toNumber(rawPlanId);
  const efficiencyPercent = toNumber(rawEfficiency);

  if (!planId || efficiencyPercent === null) return;

  const pct = Math.max(0, Math.min(100, efficiencyPercent));
  target[planId] = {
    planId,
    efficiencyPercent: pct,
    efficiencyLabel: getLabel(pct),
  };
}

function normalizePayload(payload: unknown): Record<number, EfficiencyPoint> {
  const byPlanId: Record<number, EfficiencyPoint> = {};

  if (Array.isArray(payload)) {
    payload.forEach((row) => {
      if (row && typeof row === 'object') addPoint(byPlanId, row as Record<string, unknown>);
    });
    return byPlanId;
  }

  if (!payload || typeof payload !== 'object') return byPlanId;
  const obj = payload as Record<string, unknown>;

  Object.entries(obj).forEach(([key, value]) => {
    if (key === 'ok' || key === 'success' || key === 'message' || key === 'error') return;
    if (Array.isArray(value)) {
      value.forEach((row) => {
        if (row && typeof row === 'object') addPoint(byPlanId, row as Record<string, unknown>);
      });
      return;
    }
    if (value && typeof value === 'object') {
      addPoint(byPlanId, value as Record<string, unknown>);
    }
  });

  return byPlanId;
}

function buildEfficiencyUrl(networkId?: number, minEff?: number): string {
  const base = process.env.AMIGO_PROXY_URL || 'https://amigo.ng/api';
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const url = new URL(`${normalizedBase}/plans/efficiency`);
  if (typeof networkId === 'number') url.searchParams.set('network_id', String(networkId));
  if (typeof minEff === 'number') url.searchParams.set('min_eff', String(minEff));
  return url.toString();
}

export async function fetchAmigoPlanEfficiency(options?: {
  networkId?: number;
  minEff?: number;
  cacheTtlMs?: number;
}): Promise<Record<number, EfficiencyPoint>> {
  const { networkId, minEff, cacheTtlMs = 60_000 } = options || {};

  if (typeof networkId !== 'number' && typeof minEff !== 'number' && cache && cache.expiresAt > Date.now()) {
    return cache.byPlanId;
  }

  const url = buildEfficiencyUrl(networkId, minEff);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (process.env.AMIGO_API_KEY) {
    headers['X-API-Key'] = process.env.AMIGO_API_KEY;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amigo efficiency API error ${res.status}: ${text}`);
  }

  const payload = await res.json();
  const byPlanId = normalizePayload(payload);

  if (typeof networkId !== 'number' && typeof minEff !== 'number') {
    cache = {
      byPlanId,
      expiresAt: Date.now() + cacheTtlMs,
    };
  }

  return byPlanId;
}

export function getEfficiencyLabelFromPercent(percent: number): EfficiencyLabel {
  return getLabel(percent);
}
