/**
 * Rate Limiting Implementation
 * Prevents brute force attacks and abuse
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if a request should be allowed
   * @param key Unique identifier (e.g., IP address or user phone)
   * @param maxRequests Maximum requests allowed in the window
   * @param windowMs Time window in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(key: string, maxRequests: number = 5, windowMs: number = 900000): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    // If no entry exists or window has expired, create new entry
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      return false;
    }

    // Increment count
    entry.count++;
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, maxRequests: number = 5, windowMs: number = 900000): number {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all entries (for cleanup)
   */
  clear(): void {
    this.limits.clear();
  }

  /**
   * Get rate limit info for a key
   */
  getInfo(
    key: string,
    maxRequests: number = 5,
    windowMs: number = 900000
  ): { count: number; remaining: number; resetTime: number; isLimited: boolean } {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      return {
        count: 0,
        remaining: maxRequests,
        resetTime: now + windowMs,
        isLimited: false,
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, maxRequests - entry.count),
      resetTime: entry.resetTime,
      isLimited: entry.count >= maxRequests,
    };
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Specific rate limiters for different endpoints
 */

// Login attempts: 5 per 15 minutes
export const loginLimiter = {
  check: (phone: string) =>
    rateLimiter.isAllowed(`login:${phone}`, 5, 15 * 60 * 1000),
  getInfo: (phone: string) =>
    rateLimiter.getInfo(`login:${phone}`, 5, 15 * 60 * 1000),
  reset: (phone: string) =>
    rateLimiter.reset(`login:${phone}`),
};

// Register attempts: 3 per hour
export const registerLimiter = {
  check: (phone: string) =>
    rateLimiter.isAllowed(`register:${phone}`, 3, 60 * 60 * 1000),
  getInfo: (phone: string) =>
    rateLimiter.getInfo(`register:${phone}`, 3, 60 * 60 * 1000),
  reset: (phone: string) =>
    rateLimiter.reset(`register:${phone}`),
};

// Data purchase: 10 per hour
export const dataPurchaseLimiter = {
  check: (userId: string) =>
    rateLimiter.isAllowed(`data:${userId}`, 10, 60 * 60 * 1000),
  getInfo: (userId: string) =>
    rateLimiter.getInfo(`data:${userId}`, 10, 60 * 60 * 1000),
};

// Product purchase: 20 per day
export const productPurchaseLimiter = {
  check: (userId: string) =>
    rateLimiter.isAllowed(`product:${userId}`, 20, 24 * 60 * 60 * 1000),
  getInfo: (userId: string) =>
    rateLimiter.getInfo(`product:${userId}`, 20, 24 * 60 * 60 * 1000),
};

// Support tickets: 5 per hour
export const supportLimiter = {
  check: (phone: string) =>
    rateLimiter.isAllowed(`support:${phone}`, 5, 60 * 60 * 1000),
  getInfo: (phone: string) =>
    rateLimiter.getInfo(`support:${phone}`, 5, 60 * 60 * 1000),
};
