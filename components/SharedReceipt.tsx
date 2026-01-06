
import React, { forwardRef } from 'react';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

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
    <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -100 }}>
      <div 
        ref={ref} 
        className="w-[450px] bg-white p-0 font-sans text-slate-900 relative border-none overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif", minHeight: '850px' }}
      >
         {/* Apple Wallet Style Header */}
         <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-50"></div>
             
             <div className="relative z-10 flex justify-between items-start mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5">
                        <img src="/logo.png" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight">Sauki Mart</h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Premium Service</p>
                    </div>
                 </div>
                 <div className="text-right">
                     <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Status</p>
                     <p className="text-green-400 font-black uppercase text-sm flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {transaction.status}
                     </p>
                 </div>
             </div>

             <div className="relative z-10 text-center py-4">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Paid</p>
                 <h2 className="text-5xl font-black tracking-tighter text-white">{formatCurrency(transaction.amount)}</h2>
             </div>
         </div>

         {/* Receipt Body */}
         <div className="p-8 relative bg-white">
             {/* Jagged Edge Effect */}
             <div className="absolute top-0 left-0 right-0 h-4 -mt-2 bg-slate-900" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>

             <div className="py-6 space-y-6">
                 
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Product Details</p>
                     <p className="text-lg font-black text-slate-900 leading-tight uppercase">{transaction.description}</p>
                     <div className="mt-2 inline-flex items-center gap-1 bg-slate-200 px-2 py-1 rounded text-[9px] font-bold uppercase text-slate-600">
                        {transaction.type}
                     </div>
                 </div>

                 <div className="space-y-4">
                    <Row label="Date" value={transaction.date} />
                    <Row label="Reference" value={transaction.tx_ref} isMono />
                    <Row label="Beneficiary" value={transaction.customerPhone} />
                    {transaction.customerName && <Row label="Customer" value={transaction.customerName} />}
                    {transaction.deliveryAddress && transaction.deliveryAddress !== 'Agent Direct' && (
                        <Row label="Delivery" value={transaction.deliveryAddress} />
                    )}
                 </div>
             </div>

             {/* Barcode Mockup */}
             <div className="mt-6 pt-6 border-t border-dashed border-slate-200 text-center">
                 <div className="h-14 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Bar_code.svg/1200px-Bar_code.svg.png')] bg-contain bg-center bg-no-repeat opacity-30 mb-2"></div>
                 <p className="text-[8px] font-mono text-slate-400">{transaction.tx_ref}</p>
             </div>

             {/* Footer */}
             <div className="mt-8 text-center">
                 <div className="flex items-center justify-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-slate-300" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Certified Transaction</span>
                 </div>
                 <p className="text-[8px] text-slate-300 font-medium uppercase tracking-widest">
                     Sauki Data Links • SMEDAN Certified SME
                 </p>
             </div>
         </div>
      </div>
    </div>
  );
});

const Row = ({ label, value, isMono }: any) => (
    <div className="flex justify-between items-baseline border-b border-slate-50 pb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-black text-slate-900 ${isMono ? 'font-mono' : 'uppercase'} text-right max-w-[200px]`}>{value}</span>
    </div>
);

SharedReceipt.displayName = 'SharedReceipt';
