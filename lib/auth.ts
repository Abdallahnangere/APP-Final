// lib/auth.ts — PIN hashing + admin auth helpers
import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPin(pin: string): Promise<string> {
  return bcryptjs.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(plain: string, hashed: string): Promise<boolean> {
  return bcryptjs.compare(plain, hashed);
}

export function verifyAdminPassword(password: string): boolean {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return false;
  return password === adminPw;
}

export function generateTxRef(type: 'DATA' | 'ECOM' | 'WALLET' | 'AGENT'): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SAUKI-${type}-${ts}-${rand}`;
}

export function generateIdempotencyKey(): string {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4();
}
