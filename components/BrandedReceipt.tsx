import React, { forwardRef } from 'react';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, MapPin, Phone, Globe, Zap } from 'lucide-react';

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
 * BrandedReceipt Component
 * - 1:1 square aspect ratio (perfect for WhatsApp/Social Media)
 * - Professional branded design with logo, contact, website
 * - Uniform across all transaction types
 * - Optimized for digital sharing
 */
export const BrandedReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ transaction }, ref) => {
  const isSuccess = transaction.status === 'delivered' || transaction.status === 'paid' || transaction.status === 'successful';
  const isPending = transaction.status === 'pending';

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: '0', opacity: 0, pointerEvents: 'none' }}>
      {/* 1:1 Square Container - Perfect for social media */}
      <div 
        ref={ref}
        className="w-[600px] h-[600px] bg-gradient-to-b from-white via-white to-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden relative"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Premium Top Border Accent */}
        <div className="h-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>

        {/* Header Section with Logo and Branding */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b-2 border-slate-100">
          <div className="flex items-center gap-2 flex-1">
            {/* Logo Container */}
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-slate-200 flex-shrink-0 shadow-sm">
              <img 
                src="/logo.png" 
                alt="Sauki Logo" 
                className="w-full h-full object-contain p-1" 
                crossOrigin="anonymous"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">SAUKI MART</h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Digital Commerce</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0 whitespace-nowrap ${
            isSuccess ? 'bg-green-50 border-green-200 text-green-700' :
            isPending ? 'bg-amber-50 border-amber-200 text-amber-700' :
            'bg-red-50 border-red-200 text-red-700'
          }`}>
            {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{isSuccess ? 'DELIVERED' : isPending ? 'PENDING' : 'FAILED'}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden px-6 py-4">
          {/* Amount Display - Hero Section */}
          <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
            <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest mb-1">Transaction Total</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">
              {formatCurrency(transaction.amount)}
            </h2>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide">
              {transaction.type === 'ecommerce' ? 'Product Purchase' : 
               transaction.type === 'data' ? 'Data Bundle' : 
               transaction.type === 'wallet_funding' ? 'Wallet Topup' : 
               'Transaction'}
            </p>
          </div>

          {/* Key Information Grid */}
          <div className="flex-1 py-3 space-y-2 text-xs overflow-y-auto">
            {/* Customer Info */}
            <div className="space-y-1.5">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[8px]">Customer Details</p>
              <div className="bg-slate-50 rounded-lg p-2.5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Name:</span>
                  <span className="font-bold text-slate-900">{transaction.customerName || 'Sauki Customer'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Phone:</span>
                  <span className="font-mono text-slate-900 text-[9px] font-bold">{transaction.customerPhone}</span>
                </div>
                {transaction.deliveryState && (
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" /> State:</span>
                    <span className="font-bold text-slate-900 text-right">{transaction.deliveryState}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product/Service Info */}
            <div className="space-y-1.5">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[8px]">Order Details</p>
              <div className="bg-slate-50 rounded-lg p-2.5 space-y-1">
                {transaction.items && transaction.items.length > 0 ? (
                  <>
                    {transaction.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                        <span className="text-slate-700 font-semibold truncate flex-1">{item.name}</span>
                        <span className="text-slate-900 font-bold ml-2 flex-shrink-0">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-slate-700 font-semibold leading-snug">{transaction.description}</div>
                )}
              </div>
            </div>

            {/* Transaction Reference */}
            <div className="space-y-1">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[8px]">Ref: <span className="font-mono text-slate-900">{transaction.tx_ref}</span></p>
              <p className="text-[8px] text-slate-500">{transaction.date}</p>
            </div>
          </div>
        </div>

        {/* Footer - Contact & Branding */}
        <div className="border-t-2 border-slate-200 bg-slate-900 text-white px-6 py-3">
          <div className="space-y-2">
            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  <Phone className="w-3 h-3" /> Support
                </div>
                <p className="text-xs font-bold leading-tight">0806 193 4056</p>
                <p className="text-xs font-bold leading-tight">0704 464 7081</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  <Globe className="w-3 h-3" /> Website
                </div>
                <p className="text-xs font-bold break-all">www.saukimart.online</p>
              </div>
            </div>

            {/* Security & Verification */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <p className="text-[7px] font-bold uppercase text-slate-400 tracking-widest">Verified by Sauki Data Links</p>
            </div>

            {/* Small Footer */}
            <p className="text-center text-[7px] text-slate-500 mt-1">Thank you for your business!</p>
          </div>
        </div>

        {/* Bottom Border Accent */}
        <div className="h-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
      </div>
    </div>
  );
});

BrandedReceipt.displayName = 'BrandedReceipt';
