
import React, { forwardRef } from 'react';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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
    <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -100 }}>
      <div 
        ref={ref} 
        className="w-[500px] bg-white text-slate-900 font-sans flex flex-col items-center relative"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Premium Header Pattern */}
        <div className="w-full h-3 bg-slate-900"></div>
        
        <div className="w-full px-10 pt-10 pb-6 flex flex-col items-center border-b border-slate-100">
             <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xl">S</div>
                 <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">SAUKI MART</h1>
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Official Transaction Receipt</p>
        </div>

        {/* Amount Hero */}
        <div className="w-full px-10 py-8 text-center bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Paid</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{formatCurrency(transaction.amount)}</h2>
            
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-white ${isSuccess ? 'border-green-100 text-green-700' : 'border-slate-100 text-slate-500'}`}>
                {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{transaction.status === 'delivered' ? 'SUCCESSFUL' : transaction.status}</span>
            </div>
        </div>

        {/* Key Details */}
        <div className="w-full px-10 py-8 space-y-5">
            <ReceiptRow label="Customer Name" value={transaction.customerName || 'Valued Customer'} />
            <ReceiptRow label="Phone Number" value={transaction.customerPhone} />
            <ReceiptRow label="Transaction Ref" value={transaction.tx_ref} mono />
            <ReceiptRow label="Date & Time" value={transaction.date} />
            
            <div className="pt-4 mt-4 border-t border-dashed border-slate-200">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Item Description</p>
                 <p className="text-sm font-black text-slate-900 leading-relaxed uppercase">{transaction.description}</p>
                 <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">{transaction.type}</p>
            </div>
        </div>

        {/* Footer Branding */}
        <div className="w-full bg-slate-900 text-white p-8 mt-auto text-center">
            <div className="flex justify-center gap-8 mb-6">
                 <div className="text-center">
                     <p className="text-[8px] font-bold uppercase text-slate-500 tracking-widest mb-1">Support Line 1</p>
                     <p className="text-xs font-bold">0806 193 4056</p>
                 </div>
                 <div className="text-center">
                     <p className="text-[8px] font-bold uppercase text-slate-500 tracking-widest mb-1">Support Line 2</p>
                     <p className="text-xs font-bold">0704 464 7081</p>
                 </div>
            </div>
            <div className="pt-6 border-t border-slate-800">
                <p className="text-[10px] font-medium lowercase text-slate-400">saukidatalinks@gmail.com</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600 mt-2">© Sauki Data Links • Premium Commerce</p>
            </div>
        </div>
      </div>
    </div>
  );
});

const ReceiptRow = ({ label, value, mono }: { label: string, value: string, mono?: boolean }) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</span>
        <span className={`text-xs font-bold text-slate-900 ${mono ? 'font-mono tracking-tight' : ''}`}>{value}</span>
    </div>
);
