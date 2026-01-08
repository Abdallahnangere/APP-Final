
import React, { forwardRef } from 'react';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

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
  const isSuccess = transaction.status === 'delivered' || transaction.status === 'paid' || transaction.status === 'successful';

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: '0', opacity: 0, pointerEvents: 'none' }}>
      <div 
        ref={ref} 
        className="w-[500px] bg-white text-slate-900 font-sans flex flex-col items-center relative pb-10"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Premium Header Pattern */}
        <div className="w-full h-4 bg-slate-900"></div>
        
        <div className="w-full px-10 pt-8 pb-6 flex flex-col items-center border-b border-slate-100">
             <div className="flex items-center gap-3 mb-2">
                 <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-slate-100 p-2 shadow-sm">
                    {/* Using crossOrigin to ensure html-to-image can capture it */}
                    <img src="/logo.png" alt="Sauki Logo" className="w-full h-full object-contain" crossOrigin="anonymous" />
                 </div>
                 <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">SAUKI MART</h1>
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Official Transaction Receipt</p>
        </div>

        {/* Amount Hero */}
        <div className="w-full px-10 py-8 text-center bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Amount</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{formatCurrency(transaction.amount)}</h2>
            
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border bg-white ${isSuccess ? 'border-green-100 text-green-700' : 'border-slate-100 text-slate-500'}`}>
                {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="text-xs font-black uppercase tracking-widest">{transaction.status === 'delivered' ? 'SUCCESSFUL' : transaction.status}</span>
            </div>
        </div>

        {/* Key Details */}
        <div className="w-full px-10 py-8 space-y-6">
            <ReceiptRow label="Customer Name" value={transaction.customerName || 'Sauki Customer'} />
            <ReceiptRow label="Phone Number" value={transaction.customerPhone} />
            <ReceiptRow label="Transaction Ref" value={transaction.tx_ref} mono />
            <ReceiptRow label="Date & Time" value={transaction.date} />
            
            <div className="pt-6 mt-4 border-t-2 border-dashed border-slate-200">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Item Details</p>
                 <p className="text-lg font-black text-slate-900 leading-snug uppercase">{transaction.description}</p>
                 <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wide bg-slate-100 inline-block px-2 py-1 rounded">{transaction.type}</p>
            </div>
        </div>

        {/* Footer Branding & Validation */}
        <div className="w-full bg-slate-900 text-white p-8 mt-4 text-center relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            
            <div className="relative z-10">
                <div className="flex justify-center items-center gap-6 mb-6">
                    {/* Simulated QR Code for Authenticity */}
                    <div className="bg-white p-2 rounded-lg w-16 h-16 flex items-center justify-center shrink-0">
                        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
                           <div className="bg-slate-900 col-span-1 row-span-1"></div>
                           <div className="bg-slate-900 col-span-1 row-span-1"></div>
                           <div className="bg-slate-900 col-span-1 row-span-1"></div>
                           <div className="bg-slate-900 col-span-1 row-span-1"></div>
                           <div className="bg-transparent col-span-1 row-span-1"></div>
                           <div className="bg-slate-900 col-span-1 row-span-1"></div>
                           <div className="bg-slate-900 col-span-1 row-span-1"></div>
                           <div className="bg-slate-900 col-span-1 row-span-1"></div>
                           <div className="bg-slate-900 col-span-1 row-span-1"></div>
                        </div>
                    </div>
                    <div className="text-left border-l border-slate-700 pl-6">
                        <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest mb-2">Support Center</p>
                        <p className="text-sm font-bold tracking-wide">0806 193 4056</p>
                        <p className="text-sm font-bold tracking-wide">0704 464 7081</p>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Securely Processed by Sauki Data Links</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
});

const ReceiptRow = ({ label, value, mono }: { label: string, value: string, mono?: boolean }) => (
    <div className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</span>
        <span className={`text-sm font-bold text-slate-900 ${mono ? 'font-mono tracking-tight text-xs' : ''}`}>{value}</span>
    </div>
);
