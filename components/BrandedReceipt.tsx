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
      {/* 1:2 Premium Receipt Container */}
      <div 
        ref={ref}
        className="w-[450px] h-[900px] bg-white text-slate-900 font-sans flex flex-col overflow-hidden relative"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* === TOP SECTION: Premium Header with Gradient === */}
        <div className="relative h-[220px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-6">
            {/* Logo and Brand */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <img 
                    src="/logo.png" 
                    alt="Sauki Logo" 
                    className="w-full h-full object-contain p-2" 
                    crossOrigin="anonymous"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight">SAUKI MART</h1>
                  <p className="text-xs font-semibold text-white/70">Premium Payment</p>
                </div>
              </div>
              {/* Status Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs backdrop-blur ${
                isSuccess ? 'bg-green-500/20 text-green-100 border border-green-400/50' :
                isPending ? 'bg-amber-500/20 text-amber-100 border border-amber-400/50' :
                'bg-red-500/20 text-red-100 border border-red-400/50'
              }`}>
                {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span className="tracking-wide">{isSuccess ? 'SUCCESS' : isPending ? 'PENDING' : 'FAILED'}</span>
              </div>
            </div>

            {/* Amount Display - Hero Section */}
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Amount Paid</p>
              <h2 className="text-5xl font-black text-white tracking-tighter mb-3">
                {formatCurrency(transaction.amount)}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon()}</span>
                <p className="text-sm font-semibold text-white/80">
                  {transaction.type === 'ecommerce' ? 'Product Purchase' : 
                   transaction.type === 'data' ? 'Data Bundle' : 
                   transaction.type === 'wallet_funding' ? 'Wallet Topup' : 
                   'Transaction'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* === MIDDLE SECTION: Key Information === */}
        <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
          {/* Status Timeline */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Transaction Status</p>
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  isSuccess ? 'bg-green-500 shadow-lg shadow-green-500/50' :
                  isPending ? 'bg-amber-500 shadow-lg shadow-amber-500/50' :
                  'bg-red-500 shadow-lg shadow-red-500/50'
                }`}>
                  {isSuccess ? '✓' : isPending ? '⏱' : '✕'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">
                    {isSuccess ? 'Transaction Completed' : isPending ? 'Processing' : 'Transaction Failed'}
                  </p>
                  <p className="text-xs text-slate-600">{dateStr} at {timeStr}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Information</p>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-600 font-semibold">Name</span>
                <span className="font-bold text-slate-900 text-right">{transaction.customerName || 'Valued Customer'}</span>
              </div>
              <div className="h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-600 font-semibold">Phone</span>
                <span className="font-mono font-bold text-slate-900">{transaction.customerPhone}</span>
              </div>
              {transaction.deliveryState && (
                <>
                  <div className="h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> Location
                    </span>
                    <span className="font-bold text-slate-900 text-right max-w-[200px]">{transaction.deliveryState}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order Details</p>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
              {transaction.items && transaction.items.length > 0 ? (
                <div className="space-y-3">
                  {transaction.items.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-slate-900">{item.name}</span>
                        <span className="font-bold text-blue-600">{formatCurrency(item.price)}</span>
                      </div>
                      {idx < transaction.items!.length - 1 && <div className="h-px bg-slate-200"></div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm font-semibold text-slate-900 leading-relaxed">{transaction.description}</div>
              )}
            </div>
          </div>

          {/* Transaction Reference */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reference</p>
            <div className="bg-slate-900 rounded-xl p-3 font-mono text-center">
              <p className="text-white font-bold text-sm tracking-wider break-all">{transaction.tx_ref}</p>
            </div>
          </div>
        </div>

        {/* === FOOTER SECTION: Brand & Support === */}
        <div className="bg-gradient-to-t from-slate-900 to-slate-800 text-white px-6 py-6 space-y-4">
          {/* Support Contact Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Phone Support */}
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <p className="text-xs font-bold text-white/70 uppercase">Support</p>
              </div>
              <p className="text-xs font-bold text-white leading-tight">0806 193 4056</p>
            </div>

            {/* Website */}
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <p className="text-xs font-bold text-white/70 uppercase">Website</p>
              </div>
              <p className="text-xs font-bold text-white break-all">www.saukimart.online</p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-center gap-2 bg-white/5 rounded-lg py-2 px-3 border border-white/10">
            <Shield className="w-4 h-4 text-green-400" />
            <p className="text-xs font-bold text-white/80 text-center">Verified Secure Payment</p>
          </div>

          {/* Thank You Message */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-xs font-semibold text-white/70">Thank you for choosing Sauki Mart!</p>
            <p className="text-[10px] text-white/50 mt-1">Your transaction is secured and verified</p>
          </div>
        </div>
      </div>
    </div>
  );
});

BrandedReceipt.displayName = 'BrandedReceipt';

