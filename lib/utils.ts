import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export function generateIdempotencyKey(): string {
  return uuidv4();
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function generateReceiptRef(): string {
  return 'SM' + Date.now().toString(36).toUpperCase();
}

export const NETWORK_COLORS: Record<string, string> = {
  MTN: '#FFCC00',
  GLO: '#00892C',
  AIRTEL: '#E40000',
  '9MOBILE': '#006E52',
};

export const NETWORK_IDS: Record<string, number> = {
  MTN: 1,
  GLO: 2,
  AIRTEL: 4,
};

export function verifyFlutterwaveWebhook(secretHash: string, signature: string): boolean {
  return signature === secretHash;
}
