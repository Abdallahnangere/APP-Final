import React, { forwardRef } from 'react';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, X, MapPin, Phone, Globe, Shield, ArrowRight } from 'lucide-react';

interface ReceiptProps {
  transaction: {
    tx_ref: string;
    amount: number;
    date: string;
    type: string;
    description: string;
    status: string;
    customerName?: string;
    customerPhone: string;
    deliveryAddress?: string;
    deliveryState?: string;
    items?: Array<{ name: string; price: number }>;
    manifest?: string;
  };
}

/**
 * Premium Fintech-Style Receipt Component
 * - 1:2 vertical aspect ratio (perfect for mobile sharing)
 * - Premium fintech design inspired by top payment apps
 * - Brilliant gradient backgrounds and modern typography
 * - Shows all critical info at a glance
 * - Consistent across all platforms
 */
export const BrandedReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ transaction }, ref) => {
  const isSuccess = transaction.status === 'delivered' || transaction.status === 'paid' || transaction.status === 'successful';
  const isPending = transaction.status === 'pending';

  // Determine icon and color based on transaction type
  const getTypeIcon = () => {
    if (transaction.type === 'data') return '📱';
    if (transaction.type === 'ecommerce') return '🛍️';
    if (transaction.type === 'wallet_funding') return '💰';
    return '✓';
  };

  // Parse date to readable format
  const parsedDate = new Date(transaction.date);
  const dateStr = parsedDate.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = parsedDate.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: '0', opacity: 0, pointerEvents: 'none' }}>
      {/* SQUARE PREMIUM Receipt Container */}
      <div 
        ref={ref}
        className="w-[500px] h-[540px] bg-white text-slate-900 font-sans flex flex-col overflow-hidden relative rounded-lg"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* === TOP SECTION: Premium Header with Gradient === */}
        <div className="relative h-[140px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-4">
            {/* Logo and Brand */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-11 h-11 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center border border-white/20 shadow-lg">
                  <img 
                    src="/logo.png" 
                    alt="Sauki Logo" 
                    className="w-full h-full object-contain p-1.5" 
                    crossOrigin="anonymous"
                  />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight">SAUKI MART</h1>
                  <p className="text-[9px] font-semibold text-white/70">Payment Receipt</p>
                </div>
              </div>
              {/* Status Badge */}
              <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-bold text-[8px] backdrop-blur ${
                isSuccess ? 'bg-green-500/20 text-green-100 border border-green-400/50' :
                isPending ? 'bg-amber-500/20 text-amber-100 border border-amber-400/50' :
                'bg-red-500/20 text-red-100 border border-red-400/50'
              }`}>
                {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span className="tracking-wide">{isSuccess ? 'OK' : isPending ? 'PENDING' : 'FAILED'}</span>
              </div>
            </div>

            {/* Amount Display - Hero Section */}
            <div>
              <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest mb-1">Amount</p>
              <h2 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(transaction.amount)}</h2>
            </div>
          </div>
        </div>

        {/* === MIDDLE SECTION: Compact Key Information === */}
        <div className="flex-1 px-4 py-3 space-y-2.5 overflow-y-auto">
          {/* Status Line */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Status:</span>
              <span className={`font-bold ${
                isSuccess ? 'text-green-700' :
                isPending ? 'text-amber-700' :
                'text-red-700'
              }`}>
                {isSuccess ? '✓ Completed' : isPending ? '⏱ Processing' : '✕ Failed'}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="font-bold text-slate-600">Name:</span>
              <span className="font-bold text-slate-900">{transaction.customerName || 'Customer'}</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between">
              <span className="font-bold text-slate-600">Phone:</span>
              <span className="font-mono font-bold text-slate-900">{transaction.customerPhone}</span>
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-[11px] font-semibold text-slate-900">{transaction.description}</p>
            </div>
          )}

          {/* Transaction IDs */}
          <div className="space-y-1.5">
            <div className="bg-slate-900 rounded-lg p-2 font-mono text-center border border-slate-700">
              <p className="text-[8px] text-slate-400 uppercase tracking-wider mb-0.5">Ref ID</p>
              <p className="text-white font-bold text-[10px] tracking-wide break-all">{transaction.tx_ref}</p>
            </div>
          </div>
        </div>

        {/* === FOOTER SECTION: Brand & Support with DUAL PHONE NUMBERS === */}
        <div className="bg-gradient-to-t from-slate-900 to-slate-800 text-white px-4 py-3 space-y-2.5">
          {/* TWO PHONE SUPPORT OPTIONS */}
          <div className="grid grid-cols-2 gap-2">
            {/* Primary Phone */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 border border-white/20">
              <div className="flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3 text-blue-400" />
                <p className="text-[8px] font-bold text-white/70 uppercase">Support</p>
              </div>
              <p className="text-[9px] font-bold text-white leading-tight">0806 193 4056</p>
            </div>

            {/* Backup Phone */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-2 border border-white/20">
              <div className="flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3 text-green-400" />
                <p className="text-[8px] font-bold text-white/70 uppercase">Backup</p>
              </div>
              <p className="text-[9px] font-bold text-white leading-tight">0704 464 7081</p>
            </div>
          </div>

          {/* Brand & Date */}
          <div className="text-center pt-1.5 border-t border-white/10">
            <p className="text-[8px] font-semibold text-white/80">Sauki Mart • {dateStr}</p>
            <p className="text-[7px] text-white/60">Secure Transaction Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
});

BrandedReceipt.displayName = 'BrandedReceipt';

