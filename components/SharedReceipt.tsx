
import React, { forwardRef } from 'react';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2 } from 'lucide-react';

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
        style={{ fontFamily: "'Inter', sans-serif", minHeight: '800px' }}
      >
         {/* Apple Wallet Style Header */}
         <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
             <div className="relative z-10 flex justify-between items-center mb-6">
                 <img src="/logo.png" className="w-12 h-12 object-contain bg-white rounded-xl p-1" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Official Receipt</span>
             </div>
             <div className="relative z-10">
                 <h1 className="text-3xl font-black tracking-tighter mb-1">Payment Success</h1>
                 <p className="text-sm opacity-80">{transaction.date}</p>
             </div>
         </div>

         {/* Receipt Body */}
         <div className="p-8 relative">
             {/* Jagged Edge Effect */}
             <div className="absolute top-0 left-0 right-0 h-4 -mt-2 bg-slate-900" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>

             <div className="text-center py-8 border-b border-dashed border-slate-200">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Amount Paid</p>
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{formatCurrency(transaction.amount)}</h2>
                 <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                     <CheckCircle2 className="w-3 h-3" /> {transaction.status}
                 </div>
             </div>

             <div className="py-8 space-y-5">
                 <div className="flex justify-between">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Item Purchased</span>
                     <span className="text-sm font-black text-slate-900 uppercase text-right max-w-[200px]">{transaction.description}</span>
                 </div>
                 <div className="flex justify-between">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</span>
                     <span className="text-sm font-black text-slate-900 uppercase">{transaction.type}</span>
                 </div>
                 <div className="flex justify-between">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Beneficiary</span>
                     <span className="text-sm font-black text-slate-900 font-mono tracking-tight">{transaction.customerPhone}</span>
                 </div>
                  {transaction.customerName && (
                    <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Customer</span>
                        <span className="text-sm font-black text-slate-900 uppercase">{transaction.customerName}</span>
                    </div>
                 )}
                 <div className="flex justify-between">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reference ID</span>
                     <span className="text-[10px] font-black text-slate-900 font-mono uppercase">{transaction.tx_ref}</span>
                 </div>
             </div>

             {/* Barcode Mockup */}
             <div className="mt-8 pt-8 border-t border-dashed border-slate-200 text-center">
                 <div className="h-12 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Bar_code.svg/1200px-Bar_code.svg.png')] bg-contain bg-center bg-no-repeat opacity-40 mb-2"></div>
                 <p className="text-[9px] font-mono text-slate-400">{transaction.tx_ref}</p>
             </div>

             {/* Footer */}
             <div className="mt-8 text-center text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                 <p>Sauki Mart • Certified SME</p>
                 <p className="mt-1">saukidatalinks@gmail.com</p>
             </div>
         </div>
      </div>
    </div>
  );
});

SharedReceipt.displayName = 'SharedReceipt';
