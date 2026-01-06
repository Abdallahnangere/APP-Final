
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  category: 'device' | 'sim' | 'package';
}

export interface DataPlan {
  id: string;
  network: 'MTN' | 'AIRTEL' | 'GLO';
  data: string;
  validity: string;
  price: number;
  planId: number;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  balance: number;
  cashbackBalance: number;
  isActive: boolean;
  flwAccountNumber: string;
  flwAccountName: string;
  flwBankName: string;
  joinedAt: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  tx_ref: string;
  type: 'ecommerce' | 'data' | 'wallet_funding';
  status: 'pending' | 'paid' | 'delivered' | 'failed';
  phone: string;
  amount: number;
  cashbackUsed: number;
  cashbackEarned: number;
  planId?: string;
  productId?: string;
  agentId?: string;
  customerName?: string;
  deliveryState?: string;
  createdAt: string;
  deliveryData?: any;
  product?: Product;
  dataPlan?: DataPlan;
}

export interface SupportTicket {
    id: string;
    phone: string;
    message: string;
    status: 'open' | 'closed';
    createdAt: string;
}

export interface PaymentInitResponse {
  tx_ref: string;
  bank: string;
  account_number: string;
  account_name: string;
  amount: number;
}

export type NetworkType = 'MTN' | 'AIRTEL' | 'GLO';
