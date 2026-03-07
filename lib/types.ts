/**
 * Type Definitions
 * Shared types across all app screens
 */

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  walletBalance: number;
  cashbackBalance: number;
  referralBonus: number;
  accountNumber: string;
  bankName: string;
  theme: string;
  notificationsEnabled: boolean;
  hapticsEnabled: boolean;
  createdAt: string;
};

export type Transaction = {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: string;
  network?: string;
  phoneNumber?: string;
  productName?: string;
  createdAt: string;
  receiptData?: Record<string, unknown>;
};

export type Deposit = {
  id: string;
  amount: number;
  senderName: string;
  createdAt: string;
  narration: string;
};

export type Plan = {
  id: string;
  network: string;
  networkId: number;
  planId: number;
  dataSize: string;
  validity: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  shippingTerms: string;
  pickupTerms: string;
  category: string;
};

export type ChatMsg = {
  id: string;
  sender: string;
  message: string;
  createdAt: string;
};

export type SimActivation = {
  id: string;
  status: string;
  createdAt: string;
  serialNumber?: string;
};

export type Network = {
  name: string;
  id: number;
  color: string;
  bg: string;
  emoji: string;
};

export type ScreenName =
  | 'splash'
  | 'login'
  | 'register'
  | 'registered'
  | 'home'
  | 'data-networks'
  | 'data-plans'
  | 'buy-confirm'
  | 'store'
  | 'product'
  | 'transactions'
  | 'deposits'
  | 'profile'
  | 'change-pin'
  | 'chat'
  | 'sim-activation'
  | 'notifications'
  | 'about';
