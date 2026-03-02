// lib/rateLimiter.ts — In-memory rate limiter (per phone / IP)

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

interface RateLimitOptions {
  max: number;
  windowMs: number; // milliseconds
}

export function checkRateLimit(key: string, opts: RateLimitOptions): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.max - 1, retryAfter: 0 };
  }

  if (entry.count >= opts.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: opts.max - entry.count, retryAfter: 0 };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}

// Cleanup old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 10 * 60 * 1000);
}

// Prebuilt limiters
export const registerLimiter = (phone: string) =>
  checkRateLimit(`reg:${phone}`, { max: 5, windowMs: 24 * 60 * 60 * 1000 });

export const loginLimiter = (phone: string) =>
  checkRateLimit(`login:${phone}`, { max: 5, windowMs: 24 * 60 * 60 * 1000 });

export const resetLoginLimiter = (phone: string) =>
  resetRateLimit(`login:${phone}`);
