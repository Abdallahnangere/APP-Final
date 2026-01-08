
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Transaction, Agent } from "../types";

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

// --- LOCAL STORAGE HISTORY HELPER ---
export function saveToLocalHistory(tx: Transaction) {
    if (typeof window === 'undefined') return;
    try {
        const raw = localStorage.getItem('sauki_user_history');
        const history: Transaction[] = raw ? JSON.parse(raw) : [];
        
        // Prevent duplicates
        const exists = history.find(t => t.id === tx.id || t.tx_ref === tx.tx_ref);
        if (!exists) {
            history.unshift(tx);
            // Limit to last 50 transactions to save space
            if (history.length > 50) history.pop();
            localStorage.setItem('sauki_user_history', JSON.stringify(history));
        }
    } catch (e) {
        console.error("Failed to save history", e);
    }
}

// --- UNIFIED RECEIPT GENERATOR ---
export function generateReceiptData(tx: Transaction, agent?: Agent | null) {
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

    // --- SMART NAME RESOLUTION ---
    let finalCustomerName = "Sauki Customer";
    
    // Priority 1: Agent Transaction
    if (agent || tx.agentId) {
        // If we have the agent object passed directly
        if (agent) {
            finalCustomerName = `${agent.firstName} ${agent.lastName}`;
        } else {
             // If we only have the ID in the TX, we might not be able to resolve name without fetching.
             // But usually in the AgentHub, 'agent' is passed.
             // If it's a customer receipt for an item they bought, use the shipping name.
             if (tx.customerName) finalCustomerName = tx.customerName;
             else finalCustomerName = "Authorized Agent";
        }
    } 
    // Priority 2: E-commerce Name
    else if (tx.customerName && tx.customerName !== 'undefined') {
        finalCustomerName = tx.customerName;
    }
    // Priority 3: Fallback for Data
    else if (tx.type === 'data') {
        finalCustomerName = "Sauki Customer"; 
    }

    return {
        tx_ref: tx.tx_ref,
        amount: Math.abs(tx.amount), // Ensure positive for receipt
        date: new Date(tx.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
        type: typeLabel,
        description: description,
        status: tx.status,
        customerName: finalCustomerName,
        customerPhone: tx.phone,
        deliveryAddress: tx.deliveryState || (tx.deliveryData as any)?.address
    };
}
