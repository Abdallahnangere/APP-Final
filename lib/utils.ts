
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Transaction } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

export const NETWORK_COLORS: Record<string, string> = {
  MTN: '#FFCC00',
  AIRTEL: '#FF0000',
  GLO: '#00C300',
  '9MOBILE': '#9ACD32'
};

export const NETWORK_BG_COLORS: Record<string, string> = {
  MTN: 'bg-yellow-50 text-yellow-700',
  AIRTEL: 'bg-red-50 text-red-700',
  GLO: 'bg-green-50 text-green-700',
  '9MOBILE': 'bg-lime-50 text-lime-700'
};

// --- UNIFIED RECEIPT GENERATOR ---
// This ensures the receipt looks exactly the same whether generated now or in 1 year
export function generateReceiptData(tx: Transaction) {
    let description = "Unknown Item";
    let typeLabel = "Transaction";

    // 1. Check Delivery Manifest (The Source of Truth for E-commerce)
    if (tx.deliveryData && (tx.deliveryData as any).manifest) {
        description = (tx.deliveryData as any).manifest;
        typeLabel = "Merchandise";
    }
    // 2. Check Data Plan Relations
    else if (tx.type === 'data') {
        typeLabel = "Data Bundle";
        if (tx.dataPlan) {
            description = `${tx.dataPlan.network} ${tx.dataPlan.data} (${tx.dataPlan.validity})`;
        } else {
            // Fallback if relation is broken but we know it's data
            description = "Mobile Data Top-up";
        }
    }
    // 3. Check Product Relations
    else if (tx.type === 'ecommerce') {
        typeLabel = "Device Order";
        if (tx.product) {
            description = tx.product.name;
        }
    }
    // 4. Wallet Funding
    else if (tx.type === 'wallet_funding') {
        typeLabel = "Wallet Funding";
        description = "Agent Wallet Credit";
    }

    return {
        tx_ref: tx.tx_ref,
        amount: tx.amount,
        date: new Date(tx.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
        type: typeLabel,
        description: description, // This will now NEVER be empty if the TX exists
        status: tx.status,
        customerName: tx.customerName,
        customerPhone: tx.phone,
        deliveryAddress: tx.deliveryState || (tx.deliveryData as any)?.address
    };
}
