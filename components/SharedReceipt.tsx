
import React, { forwardRef } from 'react';
import { formatCurrency } from '../lib/utils';

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
  };
}

export const SharedReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ transaction }, ref) => {
  return (
    // Rendered off-screen with fixed width but AUTO height to capture full content
    <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -100 }}>
      <div 
        ref={ref} 
        className="w-[550px] bg-white p-12 font-sans text-slate-900 relative border-none"
        style={{ fontFamily: "'Inter', sans-serif", height: 'auto', minHeight: '800px' }}
      >
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-slate-900"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-10 mt-6">
          <div>
            <img src="/logo.png" alt="Sauki Mart" className="h-28 w-auto object-contain mb-4" crossOrigin="anonymous" />
            <p className="text-xs font-black tracking-[0.25em] uppercase text-slate-400">Official Receipt</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-1">SAUKI MART</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Premium Services Hub</p>
            <div className="mt-2 inline-block bg-slate-100 px-3 py-1 rounded text-[10px] font-bold text-slate-600">SMEDAN CERTIFIED</div>
          </div>
        </div>

        {/* Payment Badge */}
        <div className="border-y-2 border-slate-100 py-8 mb-10">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Total Payment</p>
                    <p className="text-5xl font-black text-slate-900 tracking-tighter">{formatCurrency(transaction.amount)}</p>
                </div>
                <div className="text-right">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-green-100 border-none">
                        {transaction.status === 'delivered' ? 'SUCCESSFUL' : transaction.status.toUpperCase()}
                    </div>
                </div>
            </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-6 mb-16">
            <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-slate-400 text-xs font-black uppercase tracking-wider">Tracking ID</span>
                <span className="text-slate-900 text-base font-black font-mono tracking-tight">{transaction.customerPhone}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-slate-400 text-xs font-black uppercase tracking-wider">Date Issued</span>
                <span className="text-slate-900 text-base font-black uppercase tracking-tight">{transaction.date}</span>
            </div>
            
            {/* Full Order Manifest - Allows multiple lines */}
             <div className="flex flex-col gap-3 pb-4 border-b border-slate-50">
                <span className="text-slate-400 text-xs font-black uppercase tracking-wider">Order Manifest</span>
                <span className="text-slate-900 text-lg font-black uppercase leading-snug break-words">
                    {transaction.description}
                </span>
            </div>

            {transaction.customerName && (
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-wider">Customer Name</span>
                    <span className="text-slate-900 text-base font-black uppercase tracking-tight">{transaction.customerName}</span>
                </div>
            )}

            {transaction.deliveryAddress && (
                <div className="flex flex-col gap-3 pb-4 border-b border-slate-50">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-wider">Delivery Logistics</span>
                    <span className="text-slate-900 text-sm font-bold uppercase leading-relaxed break-words italic text-slate-600 bg-slate-50 p-4 rounded-xl">
                        {transaction.deliveryAddress}
                    </span>
                </div>
            )}

            <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Transaction Reference</span>
                <span className="text-slate-400 text-[10px] font-mono break-all text-right max-w-[300px]">{transaction.tx_ref}</span>
            </div>
        </div>

        {/* Footer with Updated Numbers */}
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-center space-y-5">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Customer Support Hub</p>
            <div className="flex flex-col items-center gap-3">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xl font-black text-white tracking-tighter">
                    <span>0806 193 4056</span>
                    <span className="text-white/10 hidden sm:inline">|</span>
                    <span>0704 464 7081</span>
                </div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest">saukidatalinks@gmail.com</p>
            </div>
            <div className="pt-6 mt-2 border-t border-white/5">
                <p className="text-[10px] text-white/30 leading-relaxed font-medium uppercase tracking-wide">
                    Thank you for choosing Nigeria's most reliable premium data mart.<br/>
                    Subsidiary of Sauki Data Links.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
});

SharedReceipt.displayName = 'SharedReceipt';
