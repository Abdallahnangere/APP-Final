
import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../../types';
import { formatCurrency, generateReceiptData, cn } from '../../lib/utils';
import { Trash2, Download, Smartphone, Wifi, ArrowUpRight, Search } from 'lucide-react';
import { toPng } from 'html-to-image';
import { SharedReceipt } from '../SharedReceipt';
import { toast } from '../../lib/toast';

interface HistoryProps {
    onBack?: () => void;
}

export const History: React.FC<HistoryProps> = ({ onBack }) => {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('');
  const receiptRef = useRef<HTMLDivElement>(null);
  const [receiptTx, setReceiptTx] = useState<any>(null);

  useEffect(() => {
      loadHistory();
  }, []);

  const loadHistory = () => {
      try {
          const raw = localStorage.getItem('sauki_user_history');
          if (raw) setHistory(JSON.parse(raw));
      } catch(e) {}
  };

  const clearHistory = () => {
      if(confirm("Permanently delete all local transaction records?")) {
          localStorage.removeItem('sauki_user_history');
          setHistory([]);
          toast.success("History Cleared");
      }
  };

  const handleReceipt = (tx: any) => {
      setReceiptTx(tx);
      setTimeout(async () => {
          if (receiptRef.current) {
              const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#ffffff' });
              const link = document.createElement('a');
              link.download = `RECEIPT-${tx.tx_ref}.png`;
              link.href = dataUrl;
              link.click();
              toast.success("Receipt Saved");
              setReceiptTx(null);
          }
      }, 500);
  };

  const filteredHistory = history.filter(h => 
      h.tx_ref.toLowerCase().includes(filter.toLowerCase()) || 
      h.phone?.includes(filter)
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
        {receiptTx && (
            <SharedReceipt ref={receiptRef} transaction={generateReceiptData(receiptTx)} />
        )}

        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 pt-12 pb-4 sticky top-0 z-10 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">My Activity</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Records</p>
            </div>
            {history.length > 0 && (
                <button onClick={clearHistory} className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>

        <div className="p-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 mb-6 shadow-sm">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                    className="flex-1 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                    placeholder="Search Reference or Phone..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">No Transactions Found</p>
                    </div>
                ) : (
                    filteredHistory.map((tx, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-98 transition-transform">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", 
                                    tx.type === 'data' ? "bg-blue-50 text-blue-600" : 
                                    tx.type === 'wallet_funding' ? "bg-green-50 text-green-600" :
                                    "bg-purple-50 text-purple-600"
                                )}>
                                    {tx.type === 'data' ? <Wifi className="w-6 h-6" /> : 
                                     tx.type === 'wallet_funding' ? <ArrowUpRight className="w-6 h-6" /> : 
                                     <Smartphone className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                                        {tx.type === 'data' ? 'Data Bundle' : tx.type === 'ecommerce' ? 'Store Purchase' : 'Funding'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    <p className="text-[9px] font-mono text-slate-300 mt-1">{tx.tx_ref.slice(0, 18)}...</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="font-black text-slate-900 text-sm">{formatCurrency(tx.amount)}</span>
                                <button onClick={() => handleReceipt(tx)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 hover:bg-slate-200 transition-colors">
                                    <Download className="w-3 h-3" /> Receipt
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};

const HistoryIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
